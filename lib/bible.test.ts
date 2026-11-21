import assert from "node:assert/strict";
import { test } from "node:test";
import { plain, step } from "./bibleStep.ts";

const books = [
  { id: 1, name: "ഉല്‍‍പത്തി", testament: "OT" as const, chapters: 50 },
  { id: 2, name: "പുറപ്പാട്", testament: "OT" as const, chapters: 40 },
];

test("step moves within a book and across books, stopping at the ends", () => {
  assert.deepEqual(step(books, 1, 1, 1), { b: 1, c: 2 });
  assert.deepEqual(step(books, 1, 50, 1), { b: 2, c: 1 });
  assert.deepEqual(step(books, 2, 1, -1), { b: 1, c: 50 });
  assert.equal(step(books, 1, 1, -1), null);
  assert.equal(step(books, 2, 40, 1), null);
});

test("plain ignores zero-width non-joiners and case", () => {
  assert.equal(plain("യോഹന്നാ\u200cന്‍"), plain("യോഹന്നാന്‍"));
  assert.equal(plain("John"), "john");
});
