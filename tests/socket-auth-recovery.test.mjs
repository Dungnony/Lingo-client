import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { watchSocketAuth } from "../lib/socket-auth-recovery.ts";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SERVER_DISCONNECT = "io server disconnect";

function fakeSocket() {
  const listeners = {};
  return {
    connectCalls: 0,
    connect() {
      this.connectCalls += 1;
    },
    on(event, listener) {
      listeners[event] = listener;
    },
    emit(event, arg) {
      listeners[event]?.(arg);
    },
  };
}

const settle = () => new Promise((resolve) => setImmediate(resolve));

test("refreshes the session and reconnects after the server rejects the socket", async () => {
  const socket = fakeSocket();
  let refreshCalls = 0;
  watchSocketAuth(socket, {
    refresh: async () => {
      refreshCalls += 1;
      return true;
    },
  });

  socket.emit("disconnect", SERVER_DISCONNECT);
  await settle();

  assert.equal(refreshCalls, 1);
  assert.equal(socket.connectCalls, 1);
});

test("ignores disconnects that Socket.IO recovers from by itself", async () => {
  const socket = fakeSocket();
  let refreshCalls = 0;
  watchSocketAuth(socket, {
    refresh: async () => {
      refreshCalls += 1;
      return true;
    },
  });

  socket.emit("disconnect", "transport close");
  socket.emit("disconnect", "io client disconnect");
  await settle();

  assert.equal(refreshCalls, 0);
  assert.equal(socket.connectCalls, 0);
});

test("stays disconnected when the session cannot be refreshed", async () => {
  const socket = fakeSocket();
  watchSocketAuth(socket, { refresh: async () => false });

  socket.emit("disconnect", SERVER_DISCONNECT);
  await settle();

  assert.equal(socket.connectCalls, 0);
});

test("does not revive the socket when stopped during a refresh", async () => {
  const socket = fakeSocket();
  const stop = watchSocketAuth(socket, { refresh: async () => true });

  socket.emit("disconnect", SERVER_DISCONNECT);
  stop();
  await settle();

  assert.equal(socket.connectCalls, 0);
});

test("gives up when fresh tokens keep getting rejected, then recovers after a stable connection", async () => {
  const socket = fakeSocket();
  let time = 1_000_000;
  watchSocketAuth(socket, { refresh: async () => true, now: () => time });

  for (let i = 0; i < 5; i += 1) {
    socket.emit("connect");
    time += 10;
    socket.emit("disconnect", SERVER_DISCONNECT);
    await settle();
  }
  assert.equal(socket.connectCalls, 3);

  socket.emit("connect");
  time += 60_000;
  socket.emit("disconnect", SERVER_DISCONNECT);
  await settle();
  assert.equal(socket.connectCalls, 4);
});

test("gives up even when the server disconnects before connect ever fires", async () => {
  const socket = fakeSocket();
  let time = 1_000_000;
  watchSocketAuth(socket, { refresh: async () => true, now: () => time });

  for (let i = 0; i < 5; i += 1) {
    time += 10;
    socket.emit("disconnect", SERVER_DISCONNECT);
    await settle();
  }
  assert.equal(socket.connectCalls, 3);
});

test("only lib/socket.ts opens a realtime connection", () => {
  const sourceFiles = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return sourceFiles(full);
      return /\.tsx?$/.test(entry.name) ? [full] : [];
    });
  const openers = ["app", "components", "lib"]
    .flatMap((d) => sourceFiles(path.join(ROOT, d)))
    .filter((file) =>
      /from "socket\.io-client"/.test(fs.readFileSync(file, "utf8")) &&
      /\bio\(/.test(fs.readFileSync(file, "utf8")),
    )
    .map((file) => path.relative(ROOT, file).replaceAll("\\", "/"));
  assert.deepEqual(openers, ["lib/socket.ts"]);
});
