"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BackIcon, BookIcon, Chevron, roundBtn } from "@/components/day";
import { type Book, lastRead, listBooks, plain } from "@/lib/bible";
import { useT } from "@/lib/i18n";
import { field, parch, redBtn } from "@/lib/ui";

const shell =
  "day-bg flex min-h-dvh flex-col px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] text-ink";
const title = "flex-1 text-center font-display text-3xl leading-tight font-black text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.7)]";

/** Bible books: search, Old/New Testament, tap a book for its chapters, then start reading. */
export function Books() {
  const { t } = useT();
  const asked = Number(useSearchParams().get("b")) || null;
  const [books, setBooks] = useState<Book[] | null>(null);
  const [error, setError] = useState(false);
  const [q, setQ] = useState("");
  const [nt, setNt] = useState<boolean | null>(null); // null: follow the opened book, else New Testament
  const [open, setOpen] = useState<number | null>(asked);
  const [pick, setPick] = useState<{ b: number; c: number } | null>(null);
  const [last, setLast] = useState<{ b: number; c: number } | null>(null);

  useEffect(() => {
    listBooks().then(setBooks, () => setError(true));
    setLast(lastRead()); // eslint-disable-line react-hooks/set-state-in-effect -- browser storage is read after hydration
  }, []);

  const openBook = books?.find((b) => b.id === open);
  const showNt = nt ?? (openBook ? openBook.testament === "NT" : true);
  const shown = (books ?? []).filter((b) => (q ? plain(b.name).includes(plain(q.trim())) : (b.testament === "NT") === showNt));
  const go = pick ?? (open ? { b: open, c: 1 } : last ?? { b: shown[0]?.id ?? 47, c: 1 });

  return (
    <main className={shell}>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-3">
        <div className="flex items-center gap-3">
          <Link href="/home" aria-label={t.back} className={roundBtn}>
            <BackIcon width={24} height={24} strokeWidth={3} />
          </Link>
          <h1 className={title}>{t.bibleBooks}</h1>
          <span className="size-12" aria-hidden />
        </div>

        <label className={field}>
          <span className="sr-only">{t.bibleSearch}</span>
          <svg aria-hidden viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="currentColor" strokeWidth={2.4} className="text-crimson-dark">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.bibleSearch} className="min-h-12 w-full bg-transparent text-lg outline-none" />
        </label>

        {!q && (
          <div role="tablist" className="grid grid-cols-2 gap-1 rounded-full border-[3px] border-rim bg-[#fffaf0] p-1 shadow-md">
            {[false, true].map((isNt) => (
              <button
                key={String(isNt)}
                type="button"
                role="tab"
                aria-selected={showNt === isNt}
                onClick={() => setNt(isNt)}
                className={`min-h-11 rounded-full font-display text-lg font-bold ${showNt === isNt ? "bg-gradient-to-b from-[#d8333a] to-crimson-dark text-white shadow" : "text-crimson-dark"}`}
              >
                {isNt ? t.newTestament : t.oldTestament}
              </button>
            ))}
          </div>
        )}

        {error && <p role="alert" className={`${parch} p-4 text-center font-semibold text-crimson-dark`}>{t.bibleError}</p>}
        {!books && !error && <div className={`${parch} h-96 opacity-70 motion-safe:animate-pulse`} aria-busy="true" />}

        <ul className="flex flex-col gap-2">
          {shown.map((b) => {
            const on = open === b.id;
            return (
              <li key={b.id} className={`${parch} overflow-hidden rounded-2xl! ${on ? "bg-gradient-to-b! from-[#fff3c4]! to-[#f6dc8e]!" : ""}`}>
                <button type="button" aria-expanded={on} onClick={() => setOpen(on ? null : b.id)} className="flex min-h-14 w-full items-center gap-3 px-4 text-left">
                  <BookIcon width={30} height={30} className="shrink-0 text-crimson-dark" />
                  <span lang="ml" className="flex-1 font-display text-xl font-bold text-crimson-dark">{b.name}</span>
                  <Chevron width={22} height={22} strokeWidth={3} className={`text-crimson-dark transition ${on ? "-rotate-90" : ""}`} />
                </button>
                {on && (
                  <div className="border-t-2 border-[#ecd6a6] bg-[#fffaf0] p-3">
                    <p className="mb-2 text-center font-display font-bold text-crimson-dark">{t.chooseChapter}</p>
                    <div className="grid grid-cols-7 gap-1.5">
                      {Array.from({ length: b.chapters }, (_, i) => i + 1).map((c) => {
                        const sel = go.b === b.id && go.c === c;
                        return (
                          <button
                            key={c}
                            type="button"
                            aria-pressed={sel}
                            onClick={() => setPick({ b: b.id, c })}
                            className={`min-h-11 rounded-xl border-2 font-display text-lg font-bold ${sel ? "border-[#f5c542] bg-gradient-to-b from-[#d8333a] to-crimson-dark text-white" : "border-[#ecd6a6] bg-gradient-to-b from-white to-[#f6e7c4] text-crimson-dark"}`}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {books && (
          <div className="sticky bottom-[max(1rem,env(safe-area-inset-bottom))] mt-auto pt-2">
            <Link href={`/bible/read?b=${go.b}&c=${go.c}`} className={`${redBtn} w-full`}>
              <BookIcon width={26} height={26} className="text-[#f5c542]" />
              {!pick && !open && last ? t.continueReading : t.startReading}
              <Chevron width={22} height={22} strokeWidth={3} />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
