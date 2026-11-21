import assert from "node:assert/strict";
import { test } from "node:test";
import { buildGrammarClozeQuestions } from "../lib/grammar-cloze.ts";

test("builds cloze questions from grammar examples with 4 unique options", () => {
  const examples = [
    {
      en: "She has lived in Hanoi since 2020.",
      vi: "Cô ấy đã sống ở Hà Nội từ năm 2020.",
    },
    {
      en: "They have finished their homework already.",
      vi: "Họ đã làm xong bài tập về nhà rồi.",
    },
  ];

  const questions = buildGrammarClozeQuestions(examples);
  assert.equal(questions.length, 2);

  for (const q of questions) {
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options.map((o) => o.toLowerCase())).size, 4);
    assert.ok(q.options.includes(q.answer));
    assert.equal(`${q.before}${q.answer}${q.after}`, q.fullEn);
  }
});

test("skips empty or two-word sentences and respects maxQuestions", () => {
  const examples = [
    { en: "", vi: "" },
    { en: "Go now.", vi: "Đi ngay." },
    { en: "I am reading a great book.", vi: "Tôi đang đọc một cuốn sách hay." },
    { en: "He was sleeping when I called.", vi: "Anh ấy đang ngủ khi tôi gọi." },
    { en: "We will travel to Da Nang tomorrow.", vi: "Chúng tôi sẽ đi Đà Nẵng ngày mai." },
  ];

  const questions = buildGrammarClozeQuestions(examples, 2);
  assert.equal(questions.length, 2);
  assert.equal(questions[0].answer, "am");
  assert.equal(questions[1].answer, "was");
});
