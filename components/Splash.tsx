"use client";

// Full-screen splash on every fresh page load: warms the pictures every screen uses and the first API calls,
// so the app opens ready. The second line follows the subdomain (lib/site.ts).
import { useEffect, useState } from "react";
import { asset } from "@/lib/asset";
import { getCampaign, listRegions } from "@/lib/data";
import { site } from "@/lib/site";

const IMAGES = [
  "/brand/holy-night.webp",
  "/bg/tall.webp",
  "/bg/wide.webp",
  "/bg/village-tall.webp",
  "/bg/village-tall-night.webp",
  "/treasures/gold.webp",
  "/treasures/star.webp",
];
const MIN_MS = 1200; // long enough to read, short enough not to annoy
const MAX_MS = 8000; // a slow network never keeps the app hidden longer than this

const image = (src: string) =>
  new Promise<void>((done) => {
    const img = new Image();
    img.onload = img.onerror = () => done(); // a missing picture must not hold the splash
    img.src = asset(src);
  });

export function Splash() {
  const [subtitle, setSubtitle] = useState("");
  const [loaded, setLoaded] = useState(0);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    setSubtitle(site().subtitle); // eslint-disable-line react-hooks/set-state-in-effect -- the hostname is known only in the browser
    const tick = <T,>(p: Promise<T>) => p.catch(() => {}).finally(() => setLoaded((n) => n + 1));
    const work = Promise.all([...IMAGES.map((s) => tick(image(s))), tick(getCampaign()), tick(listRegions())]);
    const min = new Promise((r) => setTimeout(r, MIN_MS));
    const max = new Promise((r) => setTimeout(r, MAX_MS));
    Promise.race([Promise.all([work, min]), max]).then(() => setDone(true));
  }, []);

  if (gone) return null;
  const pct = Math.round((loaded / (IMAGES.length + 2)) * 100);
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={!done}
      onTransitionEnd={() => done && setGone(true)}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-[radial-gradient(circle_at_50%_30%,#4a2530,#24151a_70%)] p-6 text-center transition-opacity duration-500 ${done ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      {/* Star of Bethlehem */}
      <span aria-hidden className="relative flex size-28 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,232,160,0.85),rgba(255,214,110,0.25)_45%,transparent_70%)] motion-safe:animate-pulse" />
        <svg viewBox="0 0 24 24" className="relative size-16 text-[#f5c542] drop-shadow-[0_0_12px_rgba(255,214,110,0.9)]" fill="currentColor">
          <path d="M12 0l1.6 8.4L22 12l-8.4 1.6L12 24l-1.6-10.4L2 12l8.4-3.6z" />
        </svg>
      </span>
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl leading-tight font-black text-[#f5d27a] [text-shadow:0_2px_6px_rgba(0,0,0,0.6)]">Cherupushpa Mission League</h1>
        <p className="min-h-7 font-display text-xl font-bold text-cream">{subtitle}</p>
      </div>
      <div className="h-2 w-48 overflow-hidden rounded-full bg-white/15" aria-hidden>
        <div className="h-full rounded-full bg-[#f5c542] transition-[width] duration-300" style={{ width: `${Math.max(8, pct)}%` }} />
      </div>
    </div>
  );
}
