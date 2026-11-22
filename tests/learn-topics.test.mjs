import assert from "node:assert/strict";
import { test } from "node:test";
import {
  filterTopicGroups,
  groupLessonsByTopic,
  topicNameOf,
} from "../lib/learn-topics.ts";

function lesson(overrides) {
  return {
    id: "l-1",
    orderIndex: 1,
    title: "Chào hỏi",
    wordCount: 15,
    learnedWords: 0,
    startedWords: 0,
    dueWords: 0,
    status: "AVAILABLE",
    previewWords: ["hello", "hi"],
    ...overrides,
  };
}

test("topicNameOf strips numbered part suffixes and trims whitespace", () => {
  assert.equal(topicNameOf("Chào hỏi & giao tiếp"), "Chào hỏi & giao tiếp");
  assert.equal(topicNameOf("Chào hỏi & giao tiếp (2)"), "Chào hỏi & giao tiếp");
  assert.equal(topicNameOf("Con người & gia đình (12) "), "Con người & gia đình");
});

test("groupLessonsByTopic groups consecutive lessons and aggregates stats", () => {
  const lessons = [
    lesson({
      id: "l1",
      orderIndex: 1,
      title: "Chào hỏi & giao tiếp",
      wordCount: 15,
      startedWords: 15,
      learnedWords: 3,
      status: "COMPLETED",
      previewWords: ["bye", "dear", "excuse"],
    }),
    lesson({
      id: "l2",
      orderIndex: 2,
      title: "Chào hỏi & giao tiếp (2)",
      wordCount: 5,
      startedWords: 2,
      learnedWords: 0,
      status: "IN_PROGRESS",
      previewWords: ["welcome", "yes", "bye"],
    }),
    lesson({
      id: "l3",
      orderIndex: 3,
      title: "Con người & gia đình",
      wordCount: 10,
      startedWords: 0,
      learnedWords: 0,
      status: "AVAILABLE",
      previewWords: ["age", "aunt", "baby"],
    }),
  ];

  const groups = groupLessonsByTopic(lessons);
  assert.equal(groups.length, 2);

  assert.equal(groups[0].title, "Chào hỏi & giao tiếp");
  assert.equal(groups[0].index, 1);
  assert.equal(groups[0].totalLessons, 2);
  assert.equal(groups[0].completedLessons, 1);
  assert.equal(groups[0].totalWords, 20);
  assert.equal(groups[0].startedWords, 17);
  assert.equal(groups[0].learnedWords, 3);
  assert.equal(groups[0].status, "IN_PROGRESS");
  assert.equal(groups[0].firstIncompleteLessonId, "l2");
  assert.deepEqual(groups[0].previewWords, [
    "bye",
    "dear",
    "excuse",
    "welcome",
    "yes",
  ]);

  assert.equal(groups[1].title, "Con người & gia đình");
  assert.equal(groups[1].status, "AVAILABLE");
  assert.equal(groups[1].firstIncompleteLessonId, "l3");
});

test("groupLessonsByTopic marks fully completed topics as COMPLETED", () => {
  const groups = groupLessonsByTopic([
    lesson({ id: "l1", title: "Ăn uống", status: "COMPLETED", startedWords: 15 }),
    lesson({ id: "l2", title: "Ăn uống (2)", status: "COMPLETED", startedWords: 15 }),
  ]);

  assert.equal(groups[0].status, "COMPLETED");
  assert.equal(groups[0].firstIncompleteLessonId, null);
});

test("filterTopicGroups filters by status and search query across titles and preview words", () => {
  const groups = groupLessonsByTopic([
    lesson({
      id: "l1",
      title: "Chào hỏi",
      status: "COMPLETED",
      startedWords: 15,
      previewWords: ["hello", "welcome"],
    }),
    lesson({
      id: "l2",
      title: "Gia đình",
      status: "AVAILABLE",
      previewWords: ["mother", "father"],
    }),
    lesson({
      id: "l3",
      title: "Ăn uống",
      status: "IN_PROGRESS",
      startedWords: 4,
      previewWords: ["apple", "banana"],
    }),
  ]);

  assert.equal(filterTopicGroups(groups, "all", "").length, 3);
  assert.deepEqual(
    filterTopicGroups(groups, "done", "").map((g) => g.title),
    ["Chào hỏi"],
  );
  assert.deepEqual(
    filterTopicGroups(groups, "todo", "").map((g) => g.title),
    ["Gia đình", "Ăn uống"],
  );
  assert.deepEqual(
    filterTopicGroups(groups, "all", "BANANA").map((g) => g.title),
    ["Ăn uống"],
  );
  assert.deepEqual(
    filterTopicGroups(groups, "all", "gia đình").map((g) => g.title),
    ["Gia đình"],
  );
});
