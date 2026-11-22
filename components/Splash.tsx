"use client";

// Full-screen splash on every fresh page load: warms the pictures every screen uses and the first API calls,
// so the app opens ready. The second line follows the subdomain (lib/site.ts).
import { useEffect, useState } from "react";
import { asset } from "@/lib/asset";
import { getCampaign, listRegions } from "@/lib/data";
import { site } from "@/lib/site";
import { parch } from "@/lib/ui";

const IMAGES = [
  "/brand/cml-logo.webp",
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
      className={`fixed inset-0 z-[100] bg-[radial-gradient(circle_at_50%_35%,#fffaf0,#f3e2bd_75%)] flex flex-col items-center justify-center gap-6 p-6 text-center transition-opacity duration-500 ${done ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      {/* Plain cream, no picture: the splash shows at once. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- local art with alpha */}
      <img src={asset("/brand/cml-logo.webp")} alt="" width={180} height={180} className="size-44 drop-shadow-[0_8px_16px_rgba(60,20,0,0.45)]" />
      <div className={`${parch} w-full max-w-xs p-5`}>
        <p className="font-display text-2xl leading-tight font-black text-crimson-dark">Cherupushpa Mission League</p>
        <p className="mt-1 min-h-7 font-display text-lg font-bold text-ink-soft">{subtitle}</p>
        <div className="mt-3 h-4 overflow-hidden rounded-full border-2 border-rim bg-white/70" aria-hidden>
          <div className="h-full rounded-full bg-crimson transition-[width] duration-300" style={{ width: `${Math.max(8, pct)}%` }} />
        </div>
      </div>
    </div>
  );
}

/** The league's logo, name and the site's diocese or "Kerala State", as on the splash (sign-in page). */
export function OrgName() {
  const [subtitle, setSubtitle] = useState("");
  useEffect(() => setSubtitle(site().subtitle), []); // eslint-disable-line react-hooks/set-state-in-effect -- the hostname is known only in the browser
  return (
    <div className={`${parch} mx-auto flex w-fit items-center gap-3 rounded-full! py-1.5 pr-5 pl-1.5`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- local art with alpha */}
      <img src={asset("/brand/cml-logo.webp")} alt="" width={56} height={56} className="size-14" />
      <div className="text-left">
        <p className="font-display text-base leading-tight font-black text-crimson-dark">Cherupushpa Mission League</p>
        <p className="min-h-5 font-display text-sm font-bold text-ink-soft">{subtitle}</p>
      </div>
    </div>
  );
}
