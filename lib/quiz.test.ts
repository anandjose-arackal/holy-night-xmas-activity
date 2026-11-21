import assert from "node:assert/strict";
import { test } from "node:test";
import { missions } from "../content/missions.ts";
import { makeQuiz } from "./quiz.ts";

test("hides the longest word and keeps the rest of the verse", () => {
  const q = makeQuiz("Mary gave birth to her firstborn son.", ["The shepherds hurried to Bethlehem", "angels sang glory"], 1)!;
  assert.equal(q.answer, "firstborn");
  assert.equal(q.before + q.answer + q.after, "Mary gave birth to her firstborn son.");
  assert.equal(q.options.length, 4);
  assert.ok(q.options.includes("firstborn"));
  assert.equal(new Set(q.options.map((o) => o.toLowerCase())).size, 4);
});

test("same seed, same quiz; a chosen word wins", () => {
  const others = ["one two three four five six seven", "eight nine ten eleven twelve"];
  assert.deepEqual(makeQuiz("Keep watch and be ready", others, 3), makeQuiz("Keep watch and be ready", others, 3));
  assert.equal(makeQuiz("Keep watch and be ready", others, 3, "watch")!.answer, "watch");
});

test("every day has a quiz with 4 distinct choices in both languages", () => {
  for (const lang of ["en", "ml"] as const) {
    for (const m of missions) {
      const others = missions.filter((o) => o.day !== m.day).map((o) => o[lang].verse);
      const q = makeQuiz(m[lang].verse, others, m.day);
      assert.ok(q, `day ${m.day} ${lang}`);
      assert.equal(q.before + q.answer + q.after, m[lang].verse);
      assert.equal(new Set(q.options).size, 4, `day ${m.day} ${lang}: ${q.options}`);
    }
  }
});

test("each Bible quote hides its chosen word once, with 4 distinct choices", async () => {
  const { QUIZ } = await import("../content/quiz.ts");
  for (const lang of ["en", "ml"] as const) {
  const quotes = Object.entries(QUIZ).map(([d, q]) => [d, lang === "ml" ? q!.ml : q] as const);
  for (const [day, q] of quotes) {
    const whole = new RegExp(String.raw`(?<![\p{L}\p{M}‍])${q!.blank}(?![\p{L}\p{M}‍])`, "gu");
    assert.equal(q!.text.match(whole)?.length, 1, `day ${day}: "${q!.blank}" must appear once`);
    const quiz = makeQuiz(q!.text, quotes.filter(([d]) => d !== day).map(([, o]) => o!.blank), Number(day), q!.blank)!;
    assert.equal(quiz.answer, q!.blank);
    assert.equal(new Set(quiz.options.map((o) => o.toLowerCase())).size, 4, `day ${day} ${lang}: ${quiz.options}`);
  }
  }
});
