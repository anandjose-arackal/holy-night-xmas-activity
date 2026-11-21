// XP, streaks and the bonus shop. Mirrored in supabase/migrations/003_steps_xp_village.sql (child_xp, buy_bonus):
// change both together.

import { MASS_GIFTS, type BonusKey, type StreakKey } from "../village/layout.ts"; // relative: the tests run in plain Node

export type Step = "read" | "mass" | "task" | "story";
export const STEPS: Step[] = ["read", "mass", "task", "story"];

/** XP for each step of a day. */
export const XP: Record<Step, number> = { read: 10, mass: 30, task: 20, story: 5 };
/** Mass prayed at home (Mass in church is XP.mass). Mass ticked before 013 has no stored XP and counts 10. */
export const MASS_HOME = 15;

/** A run of tasks done on their own day reaching these lengths pays once each. */
export const STREAK_BONUS: [days: number, xp: number][] = [
  [3, 25],
  [7, 50],
  [14, 75],
  [21, 100],
];

export const PRICES: Record<BonusKey, number> = {
  snowman: 40,
  reindeer: 80,
  santa: 120,
  sheep: 60,
  lamb: 50,
  angel: 100,
  trumpetAngel: 100,
  candle: 30,
  firewood: 30,
  decor0: 30,
  decor1: 30,
  decor2: 30,
  decor3: 30,
  decor4: 30,
  decor5: 30,
  decor6: 30,
  decor7: 30,
  decor8: 30,
};

/** Everything a child has done this season. `onTimeDays` are task days done on their own date (catch-ups are not). */
export type Progress = {
  taskDays: number[];
  readDays: number[];
  massDays: number[];
  storyDays: number[];
  onTimeDays: number[];
  /** Mass days ticked on their own date: only these count towards the Mass gifts (catch-ups do not). */
  massOnTimeDays: number[];
  /** XP stored for each Mass day (30 church, 15 home); a day missing here is an old tick worth 10. */
  massXp: Record<number, number>;
  /** XP of each day's prayer set (Pray now), and the days it was voice-checked. */
  prayXp: Record<number, number>;
  prayVoiceDays: number[];
  bonus: BonusKey[];
};

export const emptyProgress = (): Progress => ({ taskDays: [], readDays: [], massDays: [], storyDays: [], onTimeDays: [], massOnTimeDays: [], massXp: {}, prayXp: {}, prayVoiceDays: [], bonus: [] });

/** Longest run of consecutive day numbers. */
export function longestRun(days: number[]) {
  const set = new Set(days);
  let best = 0;
  for (const d of set) {
    if (set.has(d - 1)) continue;
    let n = 1;
    while (set.has(d + n)) n++;
    best = Math.max(best, n);
  }
  return best;
}

/** The streak still alive: consecutive on-time days ending today, or yesterday if today is not done yet. */
export function currentStreak(onTimeDays: number[], today: number) {
  const set = new Set(onTimeDays);
  let d = set.has(today) ? today : today - 1;
  let n = 0;
  while (set.has(d)) {
    n++;
    d--;
  }
  return n;
}

export function earned(p: Progress) {
  const run = longestRun(p.onTimeDays);
  return (
    new Set(p.readDays).size * XP.read +
    [...new Set(p.massDays)].reduce((sum, d) => sum + (p.massXp[d] ?? 10), 0) +
    Object.values(p.prayXp).reduce((sum, x) => sum + x, 0) +
    new Set(p.taskDays).size * XP.task +
    new Set(p.storyDays).size * XP.story +
    STREAK_BONUS.filter(([days]) => run >= days).reduce((sum, [, xp]) => sum + xp, 0)
  );
}

/** Mass gifts earned: the longest run of days in a row with Mass ticked on its own day (pass massOnTimeDays). */
export const massGifts = (massDays: number[]): StreakKey[] => {
  const run = longestRun(massDays);
  return MASS_GIFTS.filter(([, n]) => run >= n).map(([k]) => k);
};

export const spent = (bonus: BonusKey[]) => [...new Set(bonus)].reduce((sum, k) => sum + PRICES[k], 0);
export const balance = (p: Progress) => earned(p) - spent(p.bonus);
export const canBuy = (p: Progress, k: BonusKey) => !p.bonus.includes(k) && balance(p) >= PRICES[k];
