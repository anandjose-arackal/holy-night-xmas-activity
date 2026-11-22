// The POC Malayalam Bible: Supabase tables bible_books / bible_verses (014_bible.sql), or in demo mode the static
// files that scripts/import-bible.mjs --static writes to public/bible/.
import { supabase } from "@/lib/data";

export type { Book } from "@/lib/bibleStep";
export { parseRef, parseVerses, plain, step } from "@/lib/bibleStep";
import type { Book } from "@/lib/bibleStep";
export type Verse = { verse: number; text: string };

const json = async <T,>(url: string): Promise<T> => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return r.json();
};

let books: Promise<Book[]> | null = null;
/** All 73 books in canon order (cached for the session). */
export function listBooks(): Promise<Book[]> {
  books ??= (async () => {
    if (!supabase) return json<Book[]>("/bible/index.json");
    const { data, error } = await supabase.from("bible_books").select("id, name, testament, chapters").order("id");
    if (error) throw error;
    return data as Book[];
  })().catch((e) => {
    books = null; // try again next time
    throw e;
  });
  return books;
}

/** One chapter's verses in order. Chapter 0 is the book's introduction. */
export async function readChapter(book: number, chapter: number): Promise<Verse[]> {
  if (!supabase) return json<Verse[]>(`/bible/${book}/${chapter}.json`);
  const { data, error } = await supabase.from("bible_verses").select("verse, text").eq("book_id", book).eq("chapter", chapter).order("verse");
  if (error) throw error;
  return data;
}

const LAST = "bible-last";
export const lastRead = (): { b: number; c: number } | null => {
  try {
    return JSON.parse(localStorage.getItem(LAST) ?? "null");
  } catch {
    return null;
  }
};
export const saveLastRead = (b: number, c: number) => {
  try {
    localStorage.setItem(LAST, JSON.stringify({ b, c }));
  } catch {}
};
