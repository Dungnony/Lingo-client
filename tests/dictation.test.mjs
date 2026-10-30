import { test } from "node:test";
import assert from "node:assert/strict";
import { gradeDictation } from "../lib/dictation.ts";

const flags = (result) => result.words.map((w) => w.correct);

test("accepts an exact answer ignoring case and punctuation", () => {
  const r = gradeDictation("She eats an apple every day.", "she eats an APPLE every day");
  assert.equal(r.isPerfect, true);
  assert.equal(r.correctCount, 6);
  assert.equal(r.extraCount, 0);
});

test("treats curly and straight apostrophes the same", () => {
  assert.equal(gradeDictation("I don't know.", "I don’t know").isPerfect, true);
});

test("a missing word does not shift the rest", () => {
  const r = gradeDictation("I like green tea", "I like tea");
  assert.deepEqual(flags(r), [true, true, false, true]);
  assert.equal(r.isPerfect, false);
});

test("marks a misspelt word only", () => {
  const r = gradeDictation("The weather is beautiful", "The wether is beautiful");
  assert.deepEqual(flags(r), [true, false, true, true]);
});

test("counts extra typed words", () => {
  const r = gradeDictation("Good morning", "Good good morning");
  assert.deepEqual(flags(r), [true, true]);
  assert.equal(r.extraCount, 1);
  assert.equal(r.isPerfect, false);
});

test("punctuation-only tokens are always correct", () => {
  const r = gradeDictation("Wait — stop!", "wait stop");
  assert.deepEqual(flags(r), [true, true, true]);
  assert.equal(r.isPerfect, true);
});

test("an empty answer gets nothing right", () => {
  const r = gradeDictation("Hello there", "   ");
  assert.equal(r.correctCount, 0);
  assert.equal(r.isPerfect, false);
});
