import assert from "node:assert/strict";
import test from "node:test";
import {
  formatExampleLines,
  linesToList,
  parseExampleLines,
} from "../lib/admin-form.ts";

test("splits text into trimmed non-empty lines", () => {
  assert.deepEqual(linesToList("  S + V \n\n  S + be + V-ing\r\n   "), [
    "S + V",
    "S + be + V-ing",
  ]);
});

test("parses 'English | Vietnamese' example lines", () => {
  const { examples, invalidLines } = parseExampleLines(
    "I go to school. | Tôi đi học.\n\nShe runs.|Cô ấy chạy.",
  );
  assert.deepEqual(examples, [
    { en: "I go to school.", vi: "Tôi đi học." },
    { en: "She runs.", vi: "Cô ấy chạy." },
  ]);
  assert.deepEqual(invalidLines, []);
});

test("an example without a translation keeps an empty Vietnamese side", () => {
  assert.deepEqual(parseExampleLines("Hello!").examples, [
    { en: "Hello!", vi: "" },
  ]);
});

test("only the first bar separates, so the translation may contain one", () => {
  assert.deepEqual(parseExampleLines("A | B | C").examples, [
    { en: "A", vi: "B | C" },
  ]);
});

test("reports lines with no English part by their 1-based number", () => {
  const { examples, invalidLines } = parseExampleLines(
    "Fine. | Ổn.\n | Thiếu tiếng Anh",
  );
  assert.equal(examples.length, 1);
  assert.deepEqual(invalidLines, [2]);
});

test("formatting and parsing round-trip", () => {
  const examples = [
    { en: "I go.", vi: "Tôi đi." },
    { en: "Hi.", vi: "" },
  ];
  assert.deepEqual(
    parseExampleLines(formatExampleLines(examples)).examples,
    examples,
  );
});
