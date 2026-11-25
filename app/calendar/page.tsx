"use client";

import Link from "next/link";
import { BackIcon, CheckIcon, Divider, LockIcon, Ribbon, TabBar, roundBtn } from "@/components/day";
import { missions } from "@/content/missions";
import { useEffect, useState } from "react";
import { type FullProgress, loadProgress } from "@/lib/data";
import { REAL_DAYS, dayLabel, isTrial, openDate, shownDay, todayDay } from "@/lib/game/unlock";
import { useT } from "@/lib/i18n";
import { parch, pill } from "@/lib/ui";
import { useChild } from "@/lib/useChild";

// Plain 2D: this page is the full experience on devices without WebGL.
export default function Calendar() {
  const { t, lang } = useT();
  const ctx = useChild();
  const [prog, setProg] = useState<FullProgress | null>(null);
  useEffect(() => {
    if (ctx) loadProgress(ctx.child).then(setProg, () => {});
  }, [ctx]);
  if (!ctx) return <main className="day-bg min-h-dvh p-4 text-ink">{t.loading}</main>;
  const { child, campaign } = ctx;

  const today = todayDay(campaign);
  const date = (ymd: string) =>
    new Intl.DateTimeFormat(lang === "ml" ? "ml-IN" : "en-IN", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(ymd));

  return (
    <main className="day-bg flex min-h-dvh flex-col px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] text-ink">
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

        <section className={`${parch} flex flex-col gap-3 p-4`}>
          <h2 className="text-center font-display text-2xl font-black text-crimson-dark">{t.calendar}</h2>
          <Divider />
          {today === 0 && (
            <p className="text-center font-semibold text-ink-soft">
              {t.begins} {date(campaign.start)}
            </p>
          )}

          <ol className="grid grid-cols-5 gap-2">
            {missions.map((m) => {
              const done = child.days.includes(m.day);
              const open = m.day <= today;
              const isToday = m.day === today;
              const label = `${dayLabel(m.day, t)}: ${open ? m[lang].title : `${t.locked} ${date(openDate(m.day, campaign))}`}${done ? ` (${t.completed})` : ""}`;
              const tile = `relative flex aspect-[4/5] flex-col items-center justify-center rounded-2xl border-2 font-display transition ${
                done
                  ? "border-rim bg-gradient-to-b from-[#d8333a] to-crimson-dark text-white shadow-[0_3px_0_#5a0e12]"
                  : open
                    ? "border-rim bg-gradient-to-b from-white to-[#f6e4b8] text-crimson-dark shadow-[0_3px_0_#c99a3b] active:translate-y-0.5"
                    : "border-[#e4cfa4] bg-[#f3e6c8]/70 text-ink-soft/70"
              } ${isToday && !done ? "ring-4 ring-[#f5c542] animate-pulse motion-reduce:animate-none" : ""}`;
              const body = (
                <>
                  <span className="text-2xl leading-none font-black">{shownDay(m.day)}</span>
                  {done ? (
                    <CheckIcon width={18} height={18} strokeWidth={3} />
                  ) : open ? (
                    <span className="text-[0.65rem] font-sans font-bold uppercase">{isToday ? t.today : "★"}</span>
                  ) : (
                    <>
                      <LockIcon width={14} height={14} />
                      <span className="font-sans text-[0.6rem] leading-none">{date(openDate(m.day, campaign))}</span>
                    </>
                  )}
                  {open && prog && (
                    // The day's four steps: read, Mass, task, story.
                    <span aria-hidden className="absolute bottom-1 flex gap-0.5">
                      {[prog.readDays, prog.massDays, prog.taskDays, prog.storyDays].map((list, i) => (
                        <span key={i} className={`size-1.5 rounded-full ${list.includes(m.day) ? "bg-[#f5c542]" : "bg-current opacity-30"}`} />
                      ))}
                    </span>
                  )}
                </>
              );
              return (
                <li key={m.day}>
                  {open ? (
                    <Link href={`/day/${m.day}`} className={tile} aria-label={label}>
                      {body}
                    </Link>
                  ) : (
                    <span className={tile} aria-label={label}>
                      {body}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        <div className="mt-auto">
          <TabBar current="activities" />
        </div>
      </div>
    </main>
  );
}
