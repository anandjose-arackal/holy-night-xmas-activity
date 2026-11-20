// Fill-the-missing-word quiz made from a day's verse: one word is hidden and the child picks it from a few choices.
// Works for any language: words are runs of letters and combining marks (Malayalam vowel signs are marks).

export type Quiz = { before: string; answer: string; after: string; options: string[] };

const WORD = /[\p{L}\p{M}]+/gu;
const len = (w: string) => [...w].length;

/** Small seeded random, so a day always shows the same quiz. */
function rng(seed: number) {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

/**
 * Hide the longest word of `verse` (or `pick`, when given and present) and offer it with 3 look-alike words from `others`.
 * Returns null when the verse has no word long enough to make a fair question.
 */
export function makeQuiz(verse: string, others: string[], seed: number, pick?: string): Quiz | null {
  const words = [...verse.matchAll(WORD)];
  const chosen = (pick && words.find((m) => m[0] === pick)) || words.filter((m) => len(m[0]) >= 4).sort((a, b) => len(b[0]) - len(a[0]))[0];
  if (!chosen) return null;
  const answer = chosen[0];
  const lower = answer.toLowerCase();

  const pool = [...new Set(others.flatMap((v) => v.match(WORD) ?? []))].filter((w) => w.toLowerCase() !== lower && len(w) >= 3);
  const close = pool.filter((w) => Math.abs(len(w) - len(answer)) <= 3);
  const rand = rng(seed);
  const shuffle = <T,>(xs: T[]) => xs.map((x) => [rand(), x] as const).sort((a, b) => a[0] - b[0]).map(([, x]) => x);
  const distractors = [...shuffle(close), ...shuffle(pool)].filter((w, i, xs) => xs.findIndex((x) => x.toLowerCase() === w.toLowerCase()) === i).slice(0, 3);

  return {
    before: verse.slice(0, chosen.index),
    answer,
    after: verse.slice(chosen.index! + answer.length),
    options: shuffle([answer, ...distractors]),
  };
}
