import { test } from "node:test";
import assert from "node:assert/strict";
import { looksEnglish } from "../lib/looks-english.ts";

test("detects English sentences", () => {
  assert.equal(looksEnglish("How are you today?"), true);
  assert.equal(looksEnglish("I don't know"), true);
});

test("rejects Vietnamese with diacritics", () => {
  assert.equal(looksEnglish("Bạn khỏe không?"), false);
  assert.equal(looksEnglish("Hôm nay học tiếng Anh nhé"), false);
});

test("needs at least two words", () => {
  assert.equal(looksEnglish("ok"), false);
  assert.equal(looksEnglish("😀 123"), false);
  assert.equal(looksEnglish(""), false);
});
