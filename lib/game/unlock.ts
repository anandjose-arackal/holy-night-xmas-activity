export const DAYS = 27; // 29 Nov to Christmas Day

/** One Advent season. The database row in advent_campaigns is authoritative; this is the demo-mode copy. */
export type Campaign = {
  id?: number;
  start: string; // YYYY-MM-DD: day 1 opens
  christmas: string; // YYYY-MM-DD: the finale; the day before is Christmas Eve
  tz: string; // IANA time zone the dates are counted in
};

export const DEFAULT_CAMPAIGN: Campaign = { start: "2026-11-29", christmas: "2026-12-25", tz: "Asia/Kolkata" };

/** NEXT_PUBLIC_FAKE_DATE=2026-12-08 lets you preview a day during development. Ignored in a production build. */
export function now(): Date {
  const fake = process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_FAKE_DATE;
  return fake ? new Date(`${fake}T12:00:00Z`) : new Date();
}

/** The calendar date (YYYY-MM-DD) in the campaign's time zone. */
export const localDate = (d: Date, tz: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

const dayNumber = (ymd: string) => Date.UTC(+ymd.slice(0, 4), +ymd.slice(5, 7) - 1, +ymd.slice(8, 10)) / 864e5;
const elapsed = (c: Campaign, d: Date, from: string) => dayNumber(localDate(d, c.tz)) - dayNumber(from);

/** 0 before day 1, then 1..25; stays 25 afterwards. */
export const todayDay = (c: Campaign = DEFAULT_CAMPAIGN, d: Date = now()) =>
  Math.max(0, Math.min(elapsed(c, d, c.start) + 1, DAYS));

/** Past days stay open so children can catch up; future days are locked. */
export const isOpen = (day: number, c: Campaign = DEFAULT_CAMPAIGN, d: Date = now()) =>
  day >= 1 && day <= todayDay(c, d);

/** The date (YYYY-MM-DD) a progression day opens. */
export const openDate = (day: number, c: Campaign = DEFAULT_CAMPAIGN) =>
  new Date((dayNumber(c.start) + day - 1) * 864e5).toISOString().slice(0, 10);

export const isChristmasEve = (c: Campaign = DEFAULT_CAMPAIGN, d: Date = now()) => elapsed(c, d, c.christmas) >= -1;

/** The Holy Family is complete on Christmas for everyone, whatever they completed. */
export const isChristmas = (c: Campaign = DEFAULT_CAMPAIGN, d: Date = now()) => elapsed(c, d, c.christmas) >= 0;

/** Whole days left until Christmas in the campaign's time zone: 0 on Christmas Day, negative after. */
export const daysToChristmas = (c: Campaign = DEFAULT_CAMPAIGN, d: Date = now()) => 0 - elapsed(c, d, c.christmas); // 0 -, not unary -, so Christmas Day is 0, not -0

export const hearts = (completedDays: number[]) => completedDays.length * 10;
