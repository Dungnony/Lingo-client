import assert from "node:assert/strict";
import { test } from "node:test";
import { computePlacementLevel } from "../lib/placement.ts";

test("computePlacementLevel places 0/6 at Level 1", () => {
  const res = computePlacementLevel([
    { level: 1, isCorrect: false },
    { level: 2, isCorrect: false },
    { level: 3, isCorrect: false },
    { level: 4, isCorrect: false },
    { level: 5, isCorrect: false },
    { level: 6, isCorrect: false },
  ]);
  assert.deepEqual(res, { recommendedLevel: 1, correctCount: 0, total: 6 });
});

test("computePlacementLevel advances smoothly with cumulative hits and allows 1 slip", () => {
  assert.deepEqual(
    computePlacementLevel([
      { level: 1, isCorrect: true },
      { level: 2, isCorrect: true },
      { level: 3, isCorrect: true },
      { level: 4, isCorrect: false },
      { level: 5, isCorrect: false },
      { level: 6, isCorrect: false },
    ]),
    { recommendedLevel: 3, correctCount: 3, total: 6 },
  );

  assert.deepEqual(
    computePlacementLevel([
      { level: 1, isCorrect: true },
      { level: 2, isCorrect: false },
      { level: 3, isCorrect: true },
      { level: 4, isCorrect: true },
      { level: 5, isCorrect: false },
      { level: 6, isCorrect: false },
    ]),
    { recommendedLevel: 4, correctCount: 3, total: 6 },
  );
});

test("computePlacementLevel rejects isolated lucky high-level guess and supports 6/6", () => {
  assert.deepEqual(
    computePlacementLevel([
      { level: 1, isCorrect: false },
      { level: 2, isCorrect: false },
      { level: 3, isCorrect: false },
      { level: 4, isCorrect: false },
      { level: 5, isCorrect: false },
      { level: 6, isCorrect: true },
    ]),
    { recommendedLevel: 1, correctCount: 1, total: 6 },
  );

  assert.deepEqual(
    computePlacementLevel([
      { level: 1, isCorrect: true },
      { level: 2, isCorrect: true },
      { level: 3, isCorrect: true },
      { level: 4, isCorrect: true },
      { level: 5, isCorrect: true },
      { level: 6, isCorrect: true },
    ]),
    { recommendedLevel: 6, correctCount: 6, total: 6 },
  );
});
