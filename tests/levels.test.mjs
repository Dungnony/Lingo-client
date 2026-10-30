import { test } from "node:test";
import assert from "node:assert/strict";
import {
  LEVELS,
  LEVEL_COUNT,
  isValidLevel,
  levelBand,
  levelBandStyle,
  levelLabel,
  levelName,
} from "../lib/levels.ts";

test("lists every level from 1 to LEVEL_COUNT", () => {
  assert.deepEqual(LEVELS, [1, 2, 3, 4, 5, 6]);
  assert.equal(LEVELS.length, LEVEL_COUNT);
});

test("labels and names levels", () => {
  assert.equal(levelLabel(3), "Level 3 · Pre-Intermediate");
  assert.equal(levelName(6), "Advanced");
});

test("falls back gracefully for unknown levels", () => {
  assert.equal(levelLabel(9), "Level 9");
  assert.equal(levelName(0), "Level 0");
});

test("validates level numbers", () => {
  assert.equal(isValidLevel(1), true);
  assert.equal(isValidLevel(6), true);
  for (const bad of [0, 7, 2.5, Number.NaN]) assert.equal(isValidLevel(bad), false);
});

test("groups levels into bands of two", () => {
  assert.deepEqual(LEVELS.map(levelBand), [
    "BEGINNER",
    "BEGINNER",
    "INTERMEDIATE",
    "INTERMEDIATE",
    "ADVANCED",
    "ADVANCED",
  ]);
  assert.equal(levelBandStyle(4).label, "Trung cấp");
});
