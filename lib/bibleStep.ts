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


// POC book ids for the English names used in content/missions.ts refs.
// shortcut: only books the missions cite; add a name here when a mission cites a new book.
const BOOK_IDS: Record<string, number> = {
  Exodus: 2, Proverbs: 24, Isaiah: 29, Matthew: 47, Mark: 48, Luke: 49, John: 50, Romans: 52, Philippians: 57,
};

/** "John 1:6-8, 19-28" -> book 50, chapter 1, verses 6..8 and 19..28. null if the book or format is unknown. */
export function parseRef(ref: string): { b: number; c: number; verses: number[] } | null {
  const m = /^(.+?) (\d+):([\d\s,-]+)$/.exec(ref.trim());
  const b = m && BOOK_IDS[m[1]];
  if (!m || !b) return null;
  const verses = m[3].split(",").flatMap((part) => {
    const [from, to = from] = part.trim().split("-").map(Number);
    return Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);
  });
  return { b, c: Number(m[2]), verses };
}

/** Verses for the reader's ?v= ("6-8,19-28"), the same shape a ref ends with. */
export const parseVerses = (v: string | null) => (v ? (parseRef(`John 1:${v}`)?.verses ?? []) : []);
