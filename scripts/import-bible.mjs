// Loads the POC Malayalam Bible (index.json + ot/*.json + nt/*.json) into Supabase, or writes it as static files.
//   node --env-file=.env.local scripts/import-bible.mjs "<data folder>"            -> Supabase (run 014_bible.sql first)
//   node scripts/import-bible.mjs "<data folder>" --static public/bible             -> static files for demo mode
// Safe to run again: rows are upserted. KCBC holds the copyright of the POC text; get permission before a public import.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [src, flag, out] = process.argv.slice(2);
if (!src) throw new Error("usage: import-bible.mjs <data folder> [--static <out folder>]");
const read = (f) => JSON.parse(readFileSync(join(src, f), "utf8"));

const books = [];
const verses = [];
for (const b of read("index.json")) {
  const file = read(b.file);
  let chapters = 0;
  for (const c of file.chapters) {
    const ch = /^\d+$/.test(c.chapter) ? +c.chapter : 0; // "ആമുഖം" (introduction) -> 0
    chapters = Math.max(chapters, ch);
    const seen = new Set();
    for (const v of c.verses) {
      const n = /^\d+$/.test(v.verse) ? +v.verse : 0;
      const text = v.text.normalize("NFC").trim();
      if (!text) continue;
      if (seen.has(n)) throw new Error(`duplicate ${b.book_id} ${ch}:${n}`);
      seen.add(n);
      verses.push({ book_id: b.book_id, chapter: ch, verse: n, text });
    }
  }
  books.push({ id: b.book_id, name: b.name.normalize("NFC").trim(), testament: b.testament, chapters });
}
console.log(`${books.length} books, ${verses.length} verses`);

if (flag === "--static") {
  const dir = out ?? "public/bible";
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.json"), JSON.stringify(books));
  const byChapter = Map.groupBy(verses, (v) => `${v.book_id}/${v.chapter}`);
  for (const [key, list] of byChapter) {
    const [book, ch] = key.split("/");
    mkdirSync(join(dir, book), { recursive: true });
    writeFileSync(join(dir, book, `${ch}.json`), JSON.stringify(list.map((v) => ({ verse: v.verse, text: v.text }))));
  }
  console.log(`wrote ${byChapter.size} chapters to ${dir}`);
} else {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (e.g. --env-file=.env.local)");
  const db = createClient(url, key, { auth: { persistSession: false } });
  const up = async (table, rows) => {
    for (let i = 0; i < rows.length; i += 1000) {
      const { error } = await db.from(table).upsert(rows.slice(i, i + 1000));
      if (error) throw error;
      process.stdout.write(`\r${table}: ${Math.min(i + 1000, rows.length)}/${rows.length}`);
    }
    console.log();
  };
  await up("bible_books", books);
  await up("bible_verses", verses);
  const { count } = await db.from("bible_verses").select("*", { count: "exact", head: true });
  if (count !== verses.length) throw new Error(`expected ${verses.length} verses in the database, found ${count}`);
  console.log("done");
}
