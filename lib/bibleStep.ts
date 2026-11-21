// Pure Bible helpers (no imports), so plain Node tests cover them.

export type Book = { id: number; name: string; testament: "OT" | "NT"; chapters: number };

/** Book names carry stray zero-width non-joiners from the source; ignore them (and case) when searching. */
export const plain = (s: string) => s.replace(/\u200c/g, "").toLowerCase();

/** The chapter after (+1) or before (-1) this one, crossing into the next or previous book. null at either end. */
export function step(list: Book[], book: number, ch: number, dir: 1 | -1): { b: number; c: number } | null {
  const i = list.findIndex((x) => x.id === book);
  if (i < 0) return null;
  const c = ch + dir;
  if (c >= 1 && c <= list[i].chapters) return { b: book, c };
  const next = list[i + dir];
  return next ? { b: next.id, c: dir === 1 ? 1 : next.chapters } : null;
}

