import assert from "node:assert/strict";
import { test } from "node:test";
import { openAssistantStream } from "../lib/assistant-stream.ts";

const settle = () => new Promise((resolve) => setImmediate(resolve));

function harness(ensureSession = async () => undefined) {
  const events = [];
  const sources = [];
  const close = openAssistantStream({
    sessionId: "session-1",
    ensureSession,
    createSource: () => {
      const source = {
        closed: false,
        onmessage: null,
        onerror: null,
        close() {
          this.closed = true;
        },
      };
      sources.push(source);
      return source;
    },
    handlers: {
      onDelta: (delta) => events.push(["delta", delta]),
      onDone: (sessionId) => events.push(["done", sessionId]),
      onError: () => events.push(["error"]),
    },
  });
  return { events, sources, close };
}

test("opens the stream only after the session has been ensured", async () => {
  let release;
  const { sources } = harness(
    () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  );
  await settle();
  assert.equal(sources.length, 0);

  release();
  await settle();
  assert.equal(sources.length, 1);
});

test("reports an error without opening a stream when the session is gone", async () => {
  const { events, sources } = harness(() =>
    Promise.reject(new Error("401")),
  );
  await settle();
  assert.deepEqual(events, [["error"]]);
  assert.equal(sources.length, 0);
});

test("closing while the session check is pending opens nothing and stays silent", async () => {
  let reject;
  const { events, sources, close } = harness(
    () =>
      new Promise((_, r) => {
        reject = r;
      }),
  );
  close();
  reject(new Error("401"));
  await settle();
  assert.deepEqual(events, []);
  assert.equal(sources.length, 0);
});

test("forwards deltas, then finishes and closes on done", async () => {
  const { events, sources } = harness();
  await settle();
  const [source] = sources;

  source.onmessage({ data: JSON.stringify({ delta: "Hel" }) });
  source.onmessage({ data: "not json" });
  source.onmessage({ data: JSON.stringify({ done: true, sessionId: "new" }) });

  assert.deepEqual(events, [
    ["delta", "Hel"],
    ["done", "new"],
  ]);
  assert.equal(source.closed, true);
});

test("a stream error is reported once and closes the source", async () => {
  const { events, sources } = harness();
  await settle();
  const [source] = sources;

  source.onerror();

  assert.deepEqual(events, [["error"]]);
  assert.equal(source.closed, true);
});
