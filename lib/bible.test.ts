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

test("parseRef reads the mission refs, ranges and lists", async () => {
  const { parseRef, parseVerses } = await import("./bibleStep.ts");
  assert.deepEqual(parseRef("Luke 2:7"), { b: 49, c: 2, verses: [7] });
  assert.deepEqual(parseRef("Mark 13:33-35"), { b: 48, c: 13, verses: [33, 34, 35] });
  assert.deepEqual(parseRef("John 1:6-7, 19-20"), { b: 50, c: 1, verses: [6, 7, 19, 20] });
  assert.equal(parseRef("Hebrews 1:1"), null); // not mapped
  assert.deepEqual(parseVerses("3-5"), [3, 4, 5]);
  assert.deepEqual(parseVerses(null), []);
});

test("every mission ref opens in the reader", async () => {
  const { parseRef } = await import("./bibleStep.ts");
  const { missions } = await import("../content/missions.ts");
  for (const m of missions) assert.ok(parseRef(m.en.ref), m.en.ref);
});
