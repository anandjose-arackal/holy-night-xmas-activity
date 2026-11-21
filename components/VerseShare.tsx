"use client";

// Share the day's verse as a 1080×1920 picture: one preview, four styles, Share and Download. Nothing else.
import { useEffect, useRef, useState } from "react";
import { BackIcon, DownloadIcon, ShareIcon, roundBtn } from "@/components/day";
import { asset } from "@/lib/asset";
import type { useT } from "@/lib/i18n";
import { pill, redBtn } from "@/lib/ui";
import { CARD_H, CARD_THEMES, CARD_W, type CardTheme, drawVerseCard } from "@/lib/verseCard";

type T = ReturnType<typeof useT>["t"];
const LABEL = { golden: "themeGolden", moonlit: "themeMoonlit", parchment: "themeParchment", cream: "themeCream" } as const;
const THUMB: Record<CardTheme, string> = {
  golden: `url(${asset("/bg/village-tall.webp")}) center/cover`,
  moonlit: `url(${asset("/bg/village-tall-night.webp")}) center/cover`,
  parchment: "linear-gradient(#fcf1d8, #ecd5a2)",
  cream: "linear-gradient(#fbf6ea, #f6eedb)",
};
const BG: Partial<Record<CardTheme, string>> = { golden: "/bg/village-tall.webp", moonlit: "/bg/village-tall-night.webp" };

export function VerseShare({ verse, verseRef, fileName, t, onClose }: { verse: string; verseRef: string; fileName: string; t: T; onClose: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState<CardTheme>("golden");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    const c = canvas.current!;
    // next/font gives the fonts hashed family names: read them from the page so the canvas uses the same faces.
    const css = getComputedStyle(document.documentElement);
    const font = [css.getPropertyValue("--font-ml"), css.getPropertyValue("--font-latin"), "sans-serif"].filter(Boolean).join(", ");
    const draw = (bg: HTMLImageElement | null) => live && drawVerseCard(c.getContext("2d")!, { verse, ref: verseRef, theme, font, bg });
    // Without waiting, Malayalam would draw in a fallback font (or as boxes) the first time.
    document.fonts.load(`700 60px ${font}`, verse).finally(() => {
      draw(null);
      const src = BG[theme];
      if (!src) return;
      const img = new Image();
      img.crossOrigin = "anonymous"; // the art may come from the asset CDN; keeps the canvas exportable
      img.onload = () => draw(img);
      img.src = asset(src);
    });
    return () => {
      live = false;
    };
  }, [theme, verse, verseRef]);

  const blob = () => new Promise<Blob>((ok, no) => canvas.current!.toBlob((b) => (b ? ok(b) : no(new Error("no image"))), "image/png"));
  const name = `${fileName}.png`;

  async function download() {
    const url = URL.createObjectURL(await blob());
    const a = Object.assign(document.createElement("a"), { href: url, download: name });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function share() {
    setBusy(true);
    try {
      const file = new File([await blob()], name, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: verseRef });
      else await download(); // desktop browsers without file sharing
    } catch (e) {
      if ((e as Error).name !== "AbortError") console.error(e); // AbortError: the child closed the share sheet
    }
    setBusy(false);
  }

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-label={t.shareTitle}
      className="day-bg fixed inset-0 z-50 overflow-y-auto px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] animate-[sheet_.35s_ease-out] motion-reduce:animate-none"
    >
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <div className="flex items-center gap-3">
          <button type="button" aria-label={t.back} className={roundBtn} onClick={onClose}>
            <BackIcon width={24} height={24} strokeWidth={3} />
          </button>
          <h2 className="flex-1 text-center font-display text-2xl leading-tight font-black text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.7)]">{t.shareTitle}</h2>
          <span className="size-12" aria-hidden />
        </div>

        <canvas
          ref={canvas}
          width={CARD_W}
          height={CARD_H}
          role="img"
          aria-label={`${verse} — ${verseRef}`}
          className="mx-auto aspect-[9/16] max-h-[58dvh] w-auto max-w-full rounded-[1.5rem] border-4 border-[#f5c542] bg-parchment shadow-[0_10px_30px_rgba(60,30,5,0.45)]"
        />

        <div className="rounded-[1.5rem] bg-parchment/95 p-3 shadow-md">
          <p className="mb-2 text-center font-display font-bold text-crimson-dark">{t.shareStyle}</p>
          <div role="radiogroup" aria-label={t.shareStyle} className="grid grid-cols-4 gap-2">
            {CARD_THEMES.map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={theme === k}
                onClick={() => setTheme(k)}
                className="flex flex-col items-center gap-1 text-center"
              >
                <span
                  aria-hidden
                  style={{ background: THUMB[k] }}
                  className={`size-16 rounded-2xl border-[3px] shadow ${theme === k ? "border-[#f5c542] ring-2 ring-crimson" : "border-rim/60"}`}
                />
                <span className="text-xs leading-tight font-bold text-crimson-dark">{t[LABEL[k]]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button type="button" className={`${redBtn} px-3! text-lg!`} disabled={busy} onClick={share}>
            <ShareIcon width={24} height={24} strokeWidth={2.2} /> {t.shareImage}
          </button>
          <button type="button" className={`${pill} min-h-13 text-lg`} onClick={download}>
            <DownloadIcon width={24} height={24} strokeWidth={2.2} /> {t.download}
          </button>
        </div>
      </div>
    </section>
  );
}
