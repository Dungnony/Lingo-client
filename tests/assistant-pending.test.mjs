import assert from "node:assert/strict";
import test from "node:test";
import { unsyncedPending } from "../lib/assistant-pending.ts";

const question = { id: "tmp-u", text: "What is 'apple'?" };
const reply = { id: "tmp-m", text: "Quả táo." };

test("keeps optimistic messages until the server has them", () => {
  assert.deepEqual(unsyncedPending([question, reply], undefined), [
    question,
    reply,
  ]);
  assert.deepEqual(
    unsyncedPending([question, reply], [{ id: "old", text: "Hi" }]),
    [question, reply],
  );
});

test("drops them once the server history contains the last one", () => {
  const server = [
    { id: "1", text: question.text },
    { id: "2", text: reply.text },
  ];
  assert.deepEqual(unsyncedPending([question, reply], server), []);
});

test("a reply still streaming (partial text) is kept", () => {
  const server = [{ id: "1", text: question.text }];
  const partial = { ...reply, text: "Quả" };
  assert.deepEqual(unsyncedPending([question, partial], server), [
    question,
    partial,
  ]);
});

test("nothing pending stays empty", () => {
  assert.deepEqual(unsyncedPending([], [{ id: "1", text: "x" }]), []);
});
