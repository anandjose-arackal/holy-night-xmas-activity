import assert from "node:assert/strict";
import { test } from "node:test";
import { fitText } from "./verseCard.ts";

const measure = (s: string, size: number) => s.length * size * 0.5; // fake: each character is half the font size wide

test("short verse stays at the largest size on few lines", () => {
  const f = fitText("Do not be afraid", 1000, 600, measure);
  assert.equal(f.size, 84);
  assert.deepEqual(f.lines, ["Do not be afraid"]);
});

test("long verse shrinks until it fits, and every line fits the width", () => {
  const text = "ആദിയിൽ വചനം ഉണ്ടായിരുന്നു വചനം ദൈവത്തോടുകൂടെ ഉണ്ടായിരുന്നു വചനം ദൈവമായിരുന്നു ".repeat(4);
  const f = fitText(text, 800, 800, measure);
  assert.ok(f.size < 84);
  assert.ok(f.lines.length * f.size * f.lh <= 800);
  for (const l of f.lines) assert.ok(measure(l, f.size) <= 800 || !l.includes(" "));
  assert.equal(f.lines.join(" "), text.trim().split(/\s+/).join(" ")); // no word lost
});

test("stops at the minimum size even when it cannot fit", () => {
  const f = fitText("word ".repeat(500), 300, 100, measure);
  assert.equal(f.size, 36);
});
