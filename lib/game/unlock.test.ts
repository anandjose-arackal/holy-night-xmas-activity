import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_CAMPAIGN as c, daysToChristmas, isChristmas, isChristmasEve, isOpen, openDate, todayDay } from "./unlock.ts";

// Noon in Kolkata.
const d = (s: string) => new Date(`${s}T06:30:00Z`);

test("before the season nothing is open", () => {
  assert.equal(todayDay(c, d("2026-11-28")), 0);
  assert.equal(isOpen(1, c, d("2026-11-28")), false);
});

test("day 1 is November 29 and day 25 is December 23", () => {
  assert.equal(todayDay(c, d("2026-11-29")), 1);
  assert.equal(todayDay(c, d("2026-12-01")), 3);
  assert.equal(todayDay(c, d("2026-12-23")), 25);
  assert.equal(openDate(1, c), "2026-11-29");
  assert.equal(openDate(25, c), "2026-12-23");
});

test("today and past days are open, future days are locked", () => {
  const dec8 = d("2026-12-08"); // day 10
  assert.equal(isOpen(1, c, dec8), true);
  assert.equal(isOpen(10, c, dec8), true);
  assert.equal(isOpen(11, c, dec8), false);
  assert.equal(isOpen(0, c, dec8), false);
});

test("days turn over at midnight in the campaign time zone, not UTC", () => {
  // 2026-11-28 19:00 UTC is 00:30 on Nov 29 in Kolkata.
  assert.equal(todayDay(c, new Date("2026-11-28T19:00:00Z")), 1);
  assert.equal(todayDay(c, new Date("2026-11-28T18:00:00Z")), 0);
  assert.equal(todayDay({ ...c, tz: "UTC" }, new Date("2026-11-28T19:00:00Z")), 0);
});

test("Christmas Eve and Christmas depend on the date only", () => {
  assert.equal(isChristmasEve(c, d("2026-12-23")), false);
  assert.equal(isChristmasEve(c, d("2026-12-24")), true);
  assert.equal(isChristmas(c, d("2026-12-24")), false);
  assert.equal(isChristmas(c, d("2026-12-25")), true);
});

test("after Christmas everything stays open", () => {
  for (const s of ["2026-12-31", "2027-01-06"]) {
    assert.equal(todayDay(c, d(s)), 25);
    assert.equal(isOpen(25, c, d(s)), true);
    assert.equal(isChristmas(c, d(s)), true);
  }
});

test("days to Christmas count down in Kolkata time", () => {
  assert.equal(daysToChristmas(c, d("2026-11-29")), 26);
  assert.equal(daysToChristmas(c, d("2026-12-24")), 1);
  assert.equal(daysToChristmas(c, d("2026-12-25")), 0);
  assert.equal(daysToChristmas(c, new Date("2026-12-24T19:00:00Z")), 0); // already 25 Dec, 00:30 in Kolkata
});
