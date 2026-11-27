"use client";

import Link from "next/link";
import { BackIcon, CheckIcon, LockIcon, Ribbon, TabBar, roundBtn } from "@/components/day";
import { missions } from "@/content/missions";
import { useEffect, useState } from "react";
import { type FullProgress, loadProgress } from "@/lib/data";
import { DAYS, REAL_DAYS, dayLabel, isTrial, openDate, shownDay, todayDay } from "@/lib/game/unlock";
import { asset } from "@/lib/asset";
import { VillageIsland } from "@/components/world/VillageIsland";
import { useT } from "@/lib/i18n";
import { pill } from "@/lib/ui";
import { useChild } from "@/lib/useChild";

/**
 * One floating village per week, opening on its Sunday (days 1, 8, 15, 22: 29 Nov, 6, 13, 20 Dec),
 * in the order of the Syro-Malabar Annunciation Sundays: Zechariah in the Temple, Mary in Nazareth,
 * the Visitation in the hill country, then the stable in Bethlehem.
 */
// Models made with: node scripts/simplify-glb.mjs <weekN.glb> public/villages/weekN.glb 80000 --tex=1024 --permissive --uv=5, then node scripts/compress-glb.mjs public/villages/weekN.glb
const VILLAGES = [
  { first: 1, glb: "/villages/week1.glb", img: "/villages/week1.webp", name: { en: "The Temple", ml: "ജറുസലേം ദേവാലയം" } },
  { first: 8, glb: "/villages/week2.glb", img: "/villages/week2.webp", name: { en: "Nazareth", ml: "നസറത്ത്" } },
  { first: 15, glb: "/villages/week3.glb", img: "/villages/week3.webp", name: { en: "The Hill Village", ml: "മലനാട്ടിലെ ഗ്രാമം" } },
  { first: 22, glb: "/villages/week4.glb", img: "/villages/week4.webp", name: { en: "Bethlehem Stable", ml: "ബെത്‌ലഹേം കാലിത്തൊഴുത്ത്" } },
];
const WEEK = { en: "Week", ml: "ആഴ്ച" };
const OPENS = { en: "Opens", ml: "തുറക്കുന്നത്" };

const ROW = 50; // px between day stops
const ISLAND = 285; // px a village milestone takes
const NODE = 42; // day stop size
// Fake depth: stops swinging "back" along the path shrink and fade a little, like islands further away.
const depth = (x: number) => 1 - Math.abs(x - 50) / 220;

type Stop = { kind: "village"; w: number; x: number; y: number } | { kind: "day"; day: number; x: number; y: number; island?: number };

// The path, top to bottom: each week's village with its Sunday standing on the island, then the other days winding left and right.
const STOPS: Stop[] = [];
let y = 0;
VILLAGES.forEach((v, w) => {
  STOPS.push({ kind: "village", w, x: 50, y: y + ISLAND / 2 });
  STOPS.push({ kind: "day", day: v.first, x: 50, y: y + ISLAND / 2 - 20, island: w });
  y += ISLAND;
  const last = VILLAGES[w + 1]?.first - 1 || DAYS;
  for (let day = v.first + 1; day <= last; day++) {
    STOPS.push({ kind: "day", day, x: 50 + 26 * Math.sin((day - v.first + 1) * 0.95), y: y + ROW / 2 });
    y += ROW;
  }
});
const HEIGHT = y;

// One connection dot between neighbouring stops.
const DOTS = STOPS.slice(1).flatMap((b, i) => {
  const a = STOPS[i];
  if (b.kind === "day" && b.island !== undefined) return []; // a Sunday sits on its own village
  // A village's dots start below its label and end above its island.
  const ay = a.kind === "day" && a.island !== undefined ? STOPS[i - 1].y + 135 : a.y;
  const by = b.kind === "village" ? b.y - 125 : b.y;
  return [{ x: (a.x + b.x) / 2, y: (ay + by) / 2, i }];
});

// Plain 2D: this page is the full experience on devices without WebGL.
export default function Calendar() {
  const { t, lang } = useT();
  const ctx = useChild();
  const [prog, setProg] = useState<FullProgress | null>(null);
  useEffect(() => {
    if (ctx) loadProgress(ctx.child).then(setProg, () => {});
  }, [ctx]);
  const ready = !!ctx;
  useEffect(() => {
    if (ready) document.getElementById("today-stop")?.scrollIntoView({ block: "center" });
  }, [ready]);
  if (!ctx) return <main className="day-bg min-h-dvh p-4 text-ink">{t.loading}</main>;
  const { child, campaign } = ctx;

  const today = todayDay(campaign);
  const date = (ymd: string, weekday = false) =>
    new Intl.DateTimeFormat(lang === "ml" ? "ml-IN" : "en-IN", { day: "numeric", month: "short", weekday: weekday ? "short" : undefined, timeZone: "UTC" }).format(
      new Date(ymd),
    );
  // A dot is gold once the path has reached the stop after it.
  const reached = (s: Stop) => (s.kind === "village" ? VILLAGES[s.w].first : s.day) <= today;

  return (
    <main className="day-bg sky-bg flex min-h-dvh flex-col px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] text-ink">
      <div aria-hidden className="sky-clouds far" />
      <div aria-hidden className="sky-clouds" />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4">
        <header className="flex flex-col gap-1">
          <Link href="/home" aria-label={t.back} className={`${roundBtn} self-start`}>
            <BackIcon width={24} height={24} strokeWidth={3} />
          </Link>
          <Ribbon
            title={t.activities}
            sub={
              <p className={`${pill} min-h-9 text-lg`}>
                ★ {child.days.filter((d) => !isTrial(d)).length} {t.of} {REAL_DAYS}
              </p>
            }
          />
        </header>

        {today === 0 && (
          <p className={`${pill} self-center px-4`}>
            {t.begins} {date(campaign.start)}
          </p>
        )}

        <ol className="relative w-full" style={{ height: HEIGHT }}>
          {DOTS.map((d, k) => (
            <li
              key={`dot${k}`}
              aria-hidden
              className={`absolute -translate-1/2 rounded-full ${"island" in STOPS[d.i] ? "size-3 ring-2 ring-white" : "size-2"} ${reached(STOPS[d.i + 1]) ? "bg-[#f5c542] shadow-[0_0_6px_#f5c542]" : "bg-white/70"}`}
              style={{ left: `${d.x}%`, top: d.y }}
            />
          ))}

          {STOPS.map((s) => {
            if (s.kind === "village") {
              const v = VILLAGES[s.w];
              const open = v.first <= today;
              const last = VILLAGES[s.w + 1]?.first - 1 || DAYS;
              const done = child.days.filter((d) => d >= v.first && d <= last).length;
              return (
                <li
                  key={`v${s.w}`}
                  className="absolute flex w-60 -translate-1/2 flex-col items-center text-center"
                  style={{ left: `${s.x}%`, top: s.y }}
                  aria-label={`${WEEK[lang]} ${s.w + 1}: ${v.name[lang]}${open ? "" : `. ${OPENS[lang]} ${date(openDate(v.first, campaign), true)}`}`}
                >
                  <div className="relative">
                    {/* The island's soft shadow on the haze below: sells the float. */}
                    <span aria-hidden className="absolute -bottom-3 left-1/2 h-5 w-28 -translate-x-1/2 rounded-[50%] bg-[#1d4f86]/30 blur-md" />
                    <div
                      style={{ animationDelay: `${-s.w * 1.3}s` }}
                      className={open ? "animate-[float_6s_ease-in-out_infinite] drop-shadow-[0_8px_20px_rgba(255,236,170,0.7)] motion-reduce:animate-none" : "opacity-70 grayscale-[.7] saturate-50"}
                    >
                      <VillageIsland glb={asset(v.glb)} img={asset(v.img)} size={210} />
                    </div>
                  </div>
                  <p className="relative z-10 -mt-3 rounded-full border-[3px] border-[#f5c542] bg-gradient-to-b from-parchment to-parchment-2 px-4 py-0.5 font-display font-black text-crimson-dark shadow-md">
                    {WEEK[lang]} {s.w + 1} · {v.name[lang]}
                  </p>
                  <p className="mt-1 text-sm font-bold text-white drop-shadow-[0_1px_2px_rgba(10,40,90,0.8)]">
                    {open ? `${date(openDate(v.first, campaign), true)} · ★ ${done} / ${last - v.first + 1}` : `${OPENS[lang]} ${date(openDate(v.first, campaign), true)}`}
                  </p>
                </li>
              );
            }

            const m = missions.find((x) => x.day === s.day);
            const done = child.days.includes(s.day);
            const open = s.day <= today;
            const isToday = s.day === today;
            const sunday = s.island !== undefined; // the day its village opens, standing on that island
            const label = `${dayLabel(s.day, t)}: ${open && m ? m[lang].title : `${t.locked} ${date(openDate(s.day, campaign))}`}${done ? ` (${t.completed})` : ""}`;
            const tile = `relative flex flex-col items-center justify-center rounded-full border-[3px] font-display transition ${
              done
                ? "border-[#f5c542] bg-gradient-to-b from-[#d8333a] to-crimson-dark text-white shadow-[0_4px_0_#5a0e12]"
                : open
                  ? "border-[#f5c542] bg-gradient-to-b from-white to-[#f6e4b8] text-crimson-dark shadow-[0_4px_0_#c99a3b] active:translate-y-0.5"
                  : "border-white/30 bg-[#f3e6c8]/40 text-white/70"
            } ${isToday && !done ? "ring-4 ring-[#f5c542] animate-pulse motion-reduce:animate-none" : sunday ? "ring-[3px] ring-white/90" : ""}`;
            const body = (
              <>
                <span className="text-base leading-none font-black">{shownDay(s.day)}</span>
                {done ? (
                  <CheckIcon width={12} height={12} strokeWidth={3.5} />
                ) : !open ? (
                  <LockIcon width={10} height={10} />
                ) : null}
                {open && prog && (
                  // The day's four steps: read, Mass, task, story.
                  <span aria-hidden className="absolute -bottom-2.5 flex gap-0.5 rounded-full bg-crimson-dark/80 px-1 py-0.5">
                    {[prog.readDays, prog.massDays, prog.taskDays, prog.storyDays].map((list, i) => (
                      <span key={i} className={`size-1 rounded-full ${list.includes(s.day) ? "bg-[#f5c542]" : "bg-white/35"}`} />
                    ))}
                  </span>
                )}
              </>
            );
            const k = depth(s.x);
            return (
              <li
                key={s.day}
                id={isToday ? "today-stop" : undefined}
                className={`absolute z-10 -translate-1/2 ${sunday && open ? "animate-[float_6s_ease-in-out_infinite] motion-reduce:animate-none" : ""}`}
                style={{ left: `${s.x}%`, top: s.y, width: NODE, height: NODE, scale: sunday ? 1.2 : k, opacity: 0.55 + k * 0.45, animationDelay: `${-(s.island ?? 0) * 1.3}s` }}
              >
                {open ? (
                  <Link href={`/day/${s.day}`} className={`${tile} size-full`} aria-label={label}>
                    {body}
                  </Link>
                ) : (
                  <span className={`${tile} size-full`} aria-label={label}>
                    {body}
                  </span>
                )}
                {/* The date beside the stop, on the side with more room. A Sunday's date is under its village's name. */}
                {!sunday && (
                  <span
                    aria-hidden
                    className={`absolute top-1/2 -translate-y-1/2 text-xs font-bold whitespace-nowrap text-white drop-shadow-[0_1px_2px_rgba(10,40,90,0.8)] ${
                      s.x > 50 ? "right-full mr-2" : "left-full ml-2"
                    }`}
                  >
                    {date(openDate(s.day, campaign))}
                  </span>
                )}
              </li>
            );
          })}
        </ol>

        <div className="mt-auto">
          <TabBar current="activities" />
        </div>
      </div>
    </main>
  );
}
