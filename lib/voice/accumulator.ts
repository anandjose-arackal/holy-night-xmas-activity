// Pure counting for voice prayer: no browser APIs, so plain Node tests cover it.
import { PRAYERS, type PrayerSet } from "../../content/prayers.ts";

export const FRAME_MS = 32; // Silero v5: 512 samples at 16 kHz

/**
 * Counts speech time from per-frame probabilities. Frames of the current sentence stay "pending" until the
 * VAD confirms the sentence (end) or throws it away (misfire: a cough, a tap). Silence never counts.
 */
export class SpeechCounter {
  committed = 0;
  pending = 0;
  validated = false;
  frozen = false;
  threshold: number;
  constructor(threshold: number) {
    this.threshold = threshold;
  }

  frame(p: number) {
    if (!this.frozen && p >= this.threshold) this.pending += FRAME_MS;
  }
  /** The sentence has enough speech to be real: its pending frames now count. */
  realStart() {
    if (!this.frozen) this.validated = true;
  }
  end() {
    if (this.frozen) return;
    this.committed += this.pending;
    this.pending = 0;
    this.validated = false;
  }
  misfire() {
    if (this.frozen) return;
    this.pending = 0;
    this.validated = false;
  }
  /** Pause or stop mid-sentence: keep it only if the VAD already called it real. */
  cut() {
    if (this.validated) this.end();
    else this.misfire();
  }
  /** Speech that counts towards the target. */
  get confirmedMs() {
    return this.committed + (this.validated ? this.pending : 0);
  }
  /** Everything heard so far, drawn faintly so the child sees movement at once. */
  get optimisticMs() {
    return this.committed + this.pending;
  }
}

export const requiredMs = (set: PrayerSet) => set.reduce((ms, { key, count }) => ms + PRAYERS[key].seconds * 1000 * count, 0);

/** Where the child is in the set: which prayer, which repetition, how full the current bead is (0..1). */
export function beadAt(set: PrayerSet, ms: number) {
  for (let i = 0; i < set.length; i++) {
    const each = PRAYERS[set[i].key].seconds * 1000;
    const all = each * set[i].count;
    if (ms < all) return { item: i, rep: Math.floor(ms / each), fill: (ms % each) / each, done: false };
    ms -= all;
  }
  const last = set.length - 1;
  return { item: last, rep: set[last].count - 1, fill: 1, done: true };
}

/** Repetitions that pay 1 XP each (capped at 30) and whether the set has a big prayer (+10). Mirrored in SQL 013. */
export const repsOf = (set: PrayerSet) => Math.min(30, set.filter((p) => !PRAYERS[p.key].big).reduce((n, p) => n + p.count, 0));
export const hasBig = (set: PrayerSet) => set.some((p) => PRAYERS[p.key].big);

/** Base XP plus a flat +20 when speech was detected, capped at 50. Mirrored in SQL 015. */
export function prayXp(set: PrayerSet, verified: boolean) {
  return Math.min(50, repsOf(set) + (hasBig(set) ? 10 : 0) + (verified ? 20 : 0));
}
