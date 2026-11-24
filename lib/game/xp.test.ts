import assert from "node:assert/strict";
import { test } from "node:test";
import { balance, canBuy, currentStreak, earned, emptyProgress, longestRun } from "./xp.ts";

test("each step pays once per day", () => {
  const p = { ...emptyProgress(), readDays: [1, 1, 2], massDays: [1], taskDays: [1], storyDays: [1] };
  assert.equal(earned(p), 2 * 10 + 10 + 20 + 5);
});

test("Mass pays 30 in church, 15 at home, 10 for old ticks; prayer sets pay their stored XP", () => {
  const p = { ...emptyProgress(), massDays: [1, 2, 3], massXp: { 1: 30, 2: 15 }, prayXp: { 1: 40, 2: 20 } };
  assert.equal(earned(p), 30 + 15 + 10 + 40 + 20);
});

test("shared pictures add their XP", () => {
  assert.equal(earned({ ...emptyProgress(), shareXp: 60 }), 60);
});

test("streak milestones pay once each, from the longest on-time run", () => {
  assert.equal(longestRun([1, 2, 3, 5, 6]), 3);
  const p = { ...emptyProgress(), onTimeDays: [1, 2, 3, 4, 5, 6, 7] };
  assert.equal(earned(p), 25 + 50);
});

test("current streak ends today or yesterday; catch-up days are not on time", () => {
  assert.equal(currentStreak([3, 4, 5], 5), 3);
  assert.equal(currentStreak([3, 4, 5], 6), 3); // today not done yet
  assert.equal(currentStreak([3, 4, 5], 7), 0); // a day was missed
  assert.equal(currentStreak([], 1), 0);
});

test("buying spends XP and each item is bought once", () => {
  const p = { ...emptyProgress(), taskDays: [1, 2], readDays: [1, 2] }; // 60 XP
  assert.equal(canBuy(p, "snowman"), true);
  assert.equal(canBuy(p, "reindeer"), false);
  const after = { ...p, bonus: ["snowman" as const] };
  assert.equal(balance(after), 20);
  assert.equal(canBuy(after, "snowman"), false);
});

test("Mass gifts come with days of Mass in a row", async () => {
  const { massGifts } = await import("./xp.ts");
  assert.deepEqual(massGifts([]), []);
  assert.deepEqual(massGifts([1, 3, 5]), []); // never two in a row
  assert.deepEqual(massGifts([4, 5]), ["snowflake"]);
  assert.deepEqual(massGifts([1, 2, 3, 4, 10, 11]), ["snowflake", "candy"]);
  assert.deepEqual(massGifts(Array.from({ length: 12 }, (_, i) => i + 1)), ["snowflake", "candy", "gingerbread", "socks", "gift"]);
});

test("from 1 December trial-day XP stops counting; during the trial it counts", () => {
  const p = { ...emptyProgress(), taskDays: [1, 2, 3], readDays: [2, 3], prayXp: { 1: 40, 3: 20 }, onTimeDays: [1, 2, 3] };
  assert.equal(earned(p), 3 * 20 + 2 * 10 + 40 + 20 + 25); // trial still on (xpFrom 1): all of it, streak of 3
  assert.equal(earned({ ...p, xpFrom: 3 }), 20 + 10 + 20); // 1 December: only day 3, no streak bonus
});
