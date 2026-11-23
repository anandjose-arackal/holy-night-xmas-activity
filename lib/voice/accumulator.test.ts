import assert from "node:assert/strict";
import { test } from "node:test";
import { DAY_PRAYERS, PRAYERS } from "../../content/prayers.ts";
import { FRAME_MS, SpeechCounter, beadAt, prayXp, requiredMs } from "./accumulator.ts";

const speak = (c: SpeechCounter, frames: number, p = 0.9) => {
  for (let i = 0; i < frames; i++) c.frame(p);
};

test("only speech frames count; pauses are free", () => {
  const c = new SpeechCounter(0.5);
  speak(c, 10);
  speak(c, 50, 0.1); // silence
  c.realStart();
  c.end();
  assert.equal(c.confirmedMs, 10 * FRAME_MS);
});

test("pending counts only once the sentence is real; a misfire is dropped", () => {
  const c = new SpeechCounter(0.5);
  speak(c, 5);
  assert.equal(c.confirmedMs, 0);
  assert.equal(c.optimisticMs, 5 * FRAME_MS);
  c.misfire(); // a cough
  assert.equal(c.optimisticMs, 0);
  speak(c, 20);
  c.realStart();
  assert.equal(c.confirmedMs, 20 * FRAME_MS); // counts before the sentence ends
  c.end();
  assert.equal(c.confirmedMs, 20 * FRAME_MS); // and not twice after
});

test("cut keeps a validated sentence and drops an unvalidated one", () => {
  const c = new SpeechCounter(0.5);
  speak(c, 4);
  c.cut();
  assert.equal(c.confirmedMs, 0);
  speak(c, 4);
  c.realStart();
  c.cut();
  assert.equal(c.confirmedMs, 4 * FRAME_MS);
});

test("frozen counter ignores late callbacks", () => {
  const c = new SpeechCounter(0.5);
  speak(c, 3);
  c.realStart();
  c.end();
  c.frozen = true;
  speak(c, 100);
  c.realStart();
  c.end();
  assert.equal(c.confirmedMs, 3 * FRAME_MS);
});

test("beads move through repetitions and on to the big prayer", () => {
  const set = [{ key: "amme_ashraya" as const, count: 20 }, { key: "salve_regina" as const, count: 1 }];
  assert.equal(requiredMs(set), 20 * 1600 + 22000);
  assert.deepEqual(beadAt(set, 0), { item: 0, rep: 0, fill: 0, done: false });
  assert.deepEqual(beadAt(set, 4000), { item: 0, rep: 2, fill: 0.5, done: false });
  assert.equal(beadAt(set, 32000).item, 1);
  assert.equal(beadAt(set, 54000).done, true);
});

test("XP: 1 per repetition, +10 big prayer, +20 for voice, capped at 50", () => {
  const short = [{ key: "eesho_love" as const, count: 20 }];
  const big = [{ key: "salve_regina" as const, count: 1 }];
  assert.equal(prayXp(short, false), 20);
  assert.equal(prayXp(short, true), 40);
  assert.equal(prayXp(big, false), 10);
  assert.equal(prayXp(big, true), 30);
  assert.equal(prayXp([{ key: "jmj", count: 30 }, { key: "creed", count: 1 }], true), 50); // the SQL cap
});

test("every day has a prayer set with known prayers", () => {
  for (let d = 1; d <= 27; d++) {
    assert.ok(DAY_PRAYERS[d]?.length, `day ${d}`);
    for (const p of DAY_PRAYERS[d]) assert.ok(PRAYERS[p.key], p.key);
  }
});
