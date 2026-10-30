import { test } from "node:test";
import assert from "node:assert/strict";
import { PASS_SCORE, scorePronunciation } from "../lib/pronunciation-score.ts";

test("an exact match scores 100 regardless of case and punctuation", () => {
  const r = scorePronunciation("hello", ["Hello."]);
  assert.equal(r.score, 100);
  assert.equal(r.passed, true);
  assert.equal(r.heard, "Hello.");
});

test("the best of several recogniser guesses counts", () => {
  const r = scorePronunciation("beach", ["bitch", "beach", "peach"]);
  assert.equal(r.score, 100);
  assert.equal(r.heard, "beach");
});

test("a near miss scores high but a different word fails", () => {
  const near = scorePronunciation("vegetable", ["vegetables"]);
  assert.ok(near.score >= PASS_SCORE, `near miss scored ${near.score}`);
  const wrong = scorePronunciation("ship", ["sheep"]);
  assert.ok(wrong.score < PASS_SCORE, `wrong word scored ${wrong.score}`);
  assert.equal(wrong.passed, false);
});

test("multi-word targets are compared as a phrase", () => {
  assert.equal(scorePronunciation("a.m.", ["a m"]).score, 100);
  assert.equal(scorePronunciation("ice cream", ["Ice  cream"]).score, 100);
});

test("nothing heard scores 0", () => {
  const r = scorePronunciation("hello", ["", "   "]);
  assert.deepEqual(r, { score: 0, heard: "", passed: false });
  assert.equal(scorePronunciation("hello", []).score, 0);
});
