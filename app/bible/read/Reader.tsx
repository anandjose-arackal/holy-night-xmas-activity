"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BackIcon, BookIcon, Chevron, ShareIcon, roundBtn } from "@/components/day";
import { VerseShare } from "@/components/VerseShare";
import { type Book, type Verse, listBooks, readChapter, saveLastRead, step } from "@/lib/bible";
import { useT } from "@/lib/i18n";
import { parch, pill, redBtn } from "@/lib/ui";

const shell =
  "day-bg flex min-h-dvh flex-col px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] text-ink";
const SIZES = [18, 20, 22, 24, 27, 30];
const FONT = "bible-font";

/** One chapter: verse numbers, A−/A+, tap a verse to pick it for sharing as a picture, prev/next chapter. */
export function Reader() {
  const { t } = useT();
  const router = useRouter();
  const sp = useSearchParams();
  const b = Number(sp.get("b")) || 47;
  const c = Number(sp.get("c") ?? 1);
  const [books, setBooks] = useState<Book[] | null>(null);
  const [verses, setVerses] = useState<Verse[] | null>(null);
  const [error, setError] = useState(false);
  const [size, setSize] = useState(1);
  const [picked, setPicked] = useState<number | null>(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    listBooks().then(setBooks, () => setError(true));
    try {
      const s = Number(localStorage.getItem(FONT));
      if (s >= 0 && s < SIZES.length && localStorage.getItem(FONT) !== null) setSize(s); // eslint-disable-line react-hooks/set-state-in-effect -- browser storage is read after hydration
    } catch {}
  }, []);
  useEffect(() => {
    let live = true;
    /* eslint-disable react-hooks/set-state-in-effect -- a new chapter starts empty while it loads */
    setVerses(null);
    setPicked(null);
    setError(false);
    /* eslint-enable react-hooks/set-state-in-effect */
    readChapter(b, c).then(
      (v) => {
        if (!live) return;
        setVerses(v);
        saveLastRead(b, c);
        window.scrollTo({ top: 0 });
      },
      () => live && setError(true),
    );
    return () => {
      live = false;
    };
  }, [b, c]);

  const book = books?.find((x) => x.id === b);
  const prev = books && step(books, b, c, -1);
  const next = books && step(books, b, c, 1);
  const goTo = (to: { b: number; c: number } | null) => to && router.push(`/bible/read?b=${to.b}&c=${to.c}`);
  const font = (d: number) => {
    const s = Math.min(SIZES.length - 1, Math.max(0, size + d));
    setSize(s);
    try {
      localStorage.setItem(FONT, String(s));
    } catch {}
  };
  // Share the tapped verse, else the chapter's first one.
  const share = verses?.find((v) => v.verse === picked) ?? verses?.find((v) => v.verse > 0) ?? verses?.[0];
  const shareRef = book && share ? `${book.name} ${c}${share.verse > 0 ? `:${share.verse}` : ""}` : "";

  return (
    <main className={shell}>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-3">
        <div className="flex items-center gap-3">
          <Link href={`/bible?b=${b}`} aria-label={t.back} className={roundBtn}>
            <BackIcon width={24} height={24} strokeWidth={3} />
          </Link>
          <h1 className="flex-1 text-center font-display text-3xl leading-tight font-black text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.7)]">{t.holyBible}</h1>
          <span className="size-12" aria-hidden />
        </div>

        <nav className="flex items-center gap-2">
          <button type="button" aria-label={t.prevChapter} disabled={!prev} onClick={() => goTo(prev ?? null)} className={`${roundBtn} disabled:opacity-40`}>
            <BackIcon width={24} height={24} strokeWidth={3} />
          </button>
          <Link href={`/bible?b=${b}`} lang="ml" className={`${pill} min-h-12 flex-1 text-xl`}>
            {book ? `${book.name} ${c || ""}` : "…"}
            <Chevron width={18} height={18} strokeWidth={3} className="rotate-90" />
          </Link>
          <button type="button" aria-label={t.nextChapter} disabled={!next} onClick={() => goTo(next ?? null)} className={`${roundBtn} disabled:opacity-40`}>
            <Chevron width={24} height={24} strokeWidth={3} />
          </button>
        </nav>

        <article lang="ml" className={`${parch} flex flex-col gap-1 p-4`} style={{ fontSize: SIZES[size] }}>
          {error && <p role="alert" className="text-center font-semibold text-crimson-dark">{t.bibleError}</p>}
          {!verses && !error && <div className="h-96 motion-safe:animate-pulse" aria-busy="true" />}
          {verses?.map((v) => (
            <p key={v.verse} className="m-0">
              <button
                type="button"
                aria-pressed={picked === v.verse}
                onClick={() => setPicked(picked === v.verse ? null : v.verse)}
                className={`flex w-full gap-3 rounded-xl px-2 py-1.5 text-left leading-[1.8] transition ${picked === v.verse ? "bg-[#f8dc8a]/70 ring-2 ring-[#e0a92a]" : ""}`}
              >
                {v.verse > 0 && (
                  <span className="mt-1.5 flex h-7 min-w-7 shrink-0 items-center justify-center rounded-lg border border-[#e0b85a] bg-gradient-to-b from-[#fff3c4] to-[#f3d48a] px-1 font-display text-sm font-bold text-crimson-dark shadow-sm">
                    {v.verse}
                  </span>
                )}
                <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{v.text}</span>
              </button>
            </p>
          ))}
        </article>

        <div className="h-20" aria-hidden />
      </div>

      {/* Bottom bar: text size, share the picked verse, next chapter */}
      <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto grid w-full max-w-md grid-cols-[auto_1fr_auto] items-center gap-2">
          <div className={`${pill} min-h-13 gap-0 px-0!`}>
            <button type="button" aria-label={t.fontSmaller} onClick={() => font(-1)} disabled={size === 0} className="min-h-11 px-2.5 text-base font-black disabled:opacity-40">
              A−
            </button>
            <span aria-hidden className="h-6 w-px bg-rim" />
            <button type="button" aria-label={t.fontBigger} onClick={() => font(1)} disabled={size === SIZES.length - 1} className="min-h-11 px-2.5 text-lg font-black disabled:opacity-40">
              A+
            </button>
          </div>
          <button type="button" className={`${redBtn} min-w-0 gap-1.5! px-2.5! text-[0.95rem]! leading-tight whitespace-normal!`} disabled={!share} onClick={() => setSharing(true)}>
            <ShareIcon width={22} height={22} strokeWidth={2.2} className="shrink-0" /> <span className="min-w-0">{t.shareImage}</span>
          </button>
          <button type="button" className={`${pill} min-h-13 max-w-24 px-2! text-xs leading-tight whitespace-normal!`} disabled={!next} onClick={() => goTo(next ?? null)}>
            <BookIcon width={20} height={20} className="shrink-0" /> <span className="min-w-0">{t.nextChapter}</span>
          </button>
        </div>
      </div>

      {sharing && share && (
        <VerseShare verse={share.text} verseRef={shareRef} fileName={`bible-${b}-${c}-${share.verse}`} t={t} onClose={() => setSharing(false)} />
      )}
    </main>
  );
}
