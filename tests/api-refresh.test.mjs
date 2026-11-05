// The server rotates refresh tokens and revokes the whole token family when a
// rotated one is reused, so concurrent 401s must share a single refresh call.
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ApiError, api } from "../lib/api.ts";

const realFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = realFetch;
});

/** Fake API: access is valid only after a successful refresh; refresh may be made to fail. */
function fakeServer({ refreshOk = true } = {}) {
  const state = { authed: false, refreshCalls: 0 };
  globalThis.fetch = async (url) => {
    const path = new URL(url).pathname;
    if (path.endsWith("/auth/refresh")) {
      state.refreshCalls += 1;
      // Yield so that every concurrent 401 is in flight before refresh settles.
      await new Promise((resolve) => setTimeout(resolve, 5));
      state.authed = refreshOk;
      return new Response(null, { status: refreshOk ? 200 : 401 });
    }
    if (!state.authed) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }
    return Response.json({ path });
  };
  return state;
}

test("concurrent 401s trigger exactly one refresh and all retry", async () => {
  const server = fakeServer();
  const results = await Promise.all(
    ["/a", "/b", "/c", "/d", "/e"].map((p) => api.get(p)),
  );
  assert.equal(server.refreshCalls, 1);
  assert.deepEqual(
    results.map((r) => r.path),
    ["/api/a", "/api/b", "/api/c", "/api/d", "/api/e"],
  );
});

test("uploads share the same in-flight refresh as JSON requests", async () => {
  const server = fakeServer();
  await Promise.all([api.get("/a"), api.upload("/upload", new FormData())]);
  assert.equal(server.refreshCalls, 1);
});

test("a later 401 refreshes again instead of reusing a settled refresh", async () => {
  const server = fakeServer();
  await api.get("/a");
  server.authed = false;
  await api.get("/b");
  assert.equal(server.refreshCalls, 2);
});

test("a failed refresh surfaces the original 401 to every caller", async () => {
  const server = fakeServer({ refreshOk: false });
  const results = await Promise.allSettled([api.get("/a"), api.get("/b")]);
  assert.equal(server.refreshCalls, 1);
  for (const r of results) {
    assert.equal(r.status, "rejected");
    assert.ok(r.reason instanceof ApiError);
    assert.equal(r.reason.status, 401);
  }
});
