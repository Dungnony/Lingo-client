import assert from "node:assert/strict";
import { test } from "node:test";
import { tokenizeSentence } from "../lib/word-tokenize.ts";

test("splits a sentence into clickable words and punctuation while preserving text", () => {
  const sentence = "Hello, world! I'm learning teacher's books.";
  const tokens = tokenizeSentence(sentence);

  assert.equal(tokens.map((t) => t.text).join(""), sentence);
  const clickable = tokens.filter((t) => t.word !== null);
  assert.deepEqual(
    clickable.map((t) => [t.text, t.word]),
    [
      ["Hello", "hello"],
      ["world", "world"],
      ["I'm", "im"],
      ["learning", "learning"],
      ["teacher's", "teacher"],
      ["books", "books"],
    ],
  );
});

test("single-letter words like 'a' or 'I' stay non-clickable", () => {
  const tokens = tokenizeSentence("I saw a cat.");
  const clickable = tokens.filter((t) => t.word !== null).map((t) => t.word);
  assert.deepEqual(clickable, ["saw", "cat"]);
});
