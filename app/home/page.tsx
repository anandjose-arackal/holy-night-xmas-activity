"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { BookIcon, CheckIcon, Chevron, GearIcon, HeartIcon, ListIcon, Ribbon, StarIcon, TabBar, XpPill } from "@/components/day";
import { LangToggle } from "@/components/LangToggle";
import { TreasureArt } from "@/components/TreasureArt";
import { missions } from "@/content/missions";
import { type FullProgress, getParish, loadProgress, setChildLang } from "@/lib/data";
import { REAL_DAYS, TRIAL_DAYS, isTrial, shownDay, todayDay } from "@/lib/game/unlock";
import { STEPS, XP, balance, currentStreak, type Step } from "@/lib/game/xp";
import { useT } from "@/lib/i18n";
import { asset } from "@/lib/asset";
import { avatars, parch, pill, redBtn, tag } from "@/lib/ui";
import { useChild } from "@/lib/useChild";
import { PIECES, rewardForDay } from "@/lib/village/layout";

const ICON: Record<Step, ReactNode> = {
  read: <BookIcon width={30} height={30} />,
  mass: <HeartIcon width={30} height={30} />,
  task: <StarIcon width={30} height={30} />,
  story: <BookIcon width={30} height={30} />,
};

/**
 * The child's dashboard: today's theme and the day's four activities (read, Mass, task, story).
 * The marks only show what is done; each row opens that step of the day.
 */
export default function Home() {
  const { t, lang } = useT();
  const ctx = useChild();
  const [prog, setProg] = useState<FullProgress | null>(null);
  const [parish, setParish] = useState<string | null>(null);
  // The 1 December welcome, once per device: trial days are over and XP has started again from 0.
  const [welcome, setWelcome] = useState(false);
  const welcomeKey = ctx && `welcome-${ctx.campaign.start}`;
  useEffect(() => {
    if (!ctx || todayDay(ctx.campaign) <= TRIAL_DAYS) return;
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after mount
      if (!localStorage.getItem(welcomeKey!)) setWelcome(true);
    } catch {}
  }, [ctx, welcomeKey]);
  const closeWelcome = () => {
    setWelcome(false);
    try {
      localStorage.setItem(welcomeKey!, "1");
    } catch {}
  };
  useEffect(() => {
    if (ctx) loadProgress(ctx.child).then(setProg, () => {});
  }, [ctx]);
  useEffect(() => {
    if (ctx) getParish(ctx.child.parish_id).then((p) => setParish(p?.name ?? null), () => {});
  }, [ctx]);

  if (!ctx) return <main className="day-bg min-h-dvh p-4 text-ink">{t.loading}</main>;
  const { child, campaign } = ctx;

  const today = todayDay(campaign);
  const mission = missions.find((m) => m.day === today);
  const m = mission?.[lang];
  const reward = mission && rewardForDay(mission.day);
  const daysDone = child.days.filter((d) => !isTrial(d)).length; // trial days are practice: the journey counts 25
  const has = (s: Step) => !!prog && { read: prog.readDays, mass: prog.massDays, task: prog.taskDays, story: prog.storyDays }[s].includes(today);
  const date = new Intl.DateTimeFormat(lang === "ml" ? "ml-IN" : "en-IN", { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(campaign.start));

  const line = (s: Step) => (!m ? "" : s === "read" ? `${m.ref} · ${m.verse}` : s === "mass" ? m.massPrayer : s === "task" ? m.task : m.story.title);

  return (
    <main className="day-bg flex min-h-dvh flex-col px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] text-ink">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4">
        <header className="flex items-center gap-3">
          {/* The avatar opens "Who is taking part?": switch child, or add one. */}
          <Link
            href="/children"
            aria-label={t.whoPlays}
            className="flex size-16 shrink-0 items-center justify-center rounded-full border-4 border-[#f5c542] bg-gradient-to-b from-parchment to-parchment-2 text-4xl shadow-lg"
          >
            <span aria-hidden>{avatars[child.avatar_key] ?? "🐑"}</span>
          </Link>
          <div className="min-w-0 flex-1 drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)]">
            <h1 className="font-display text-lg leading-tight font-black break-words text-white">
              {t.hello}, {child.nickname}
            </h1>
            {parish && <p className="truncate text-sm font-semibold text-[#ffe7a3]">{parish}</p>}
          </div>
          {today > 0 && (
            <p className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-full border-[3px] border-[#f5c542] bg-gradient-to-b from-[#d8333a] to-crimson-dark px-2.5 font-display text-sm font-black whitespace-nowrap text-white shadow-md">
              <ListIcon width={20} height={20} className="text-[#f5c542]" />
              {isTrial(today) ? `${t.day} ${shownDay(today)}` : `${t.day} ${String(shownDay(today)).padStart(2, "0")} / ${REAL_DAYS}`}
            </p>
          )}
        </header>

        <div className="-mt-2 flex justify-end">
          <LangToggle className="min-h-9 text-xs" onChange={(l) => setChildLang(child.id, l).catch(() => {})} />
        </div>

        {isTrial(today) && (
          <p role="note" className={`${parch} px-4 py-3 text-center font-semibold text-crimson-dark`}>
            ⏳ {t.trialNote.replace("{n}", String(today))}
          </p>
        )}

        <Ribbon
          title={t.dailyActivities}
          sub={
            <p className="rounded-full border-[3px] border-[#f5c542] bg-gradient-to-b from-parchment to-parchment-2 px-4 py-1 text-center font-display text-sm font-bold text-crimson-dark shadow-md sm:text-base">
              {t.journeyTo}
            </p>
          }
        />

        {/* Journey progress */}
        <section className={`${parch} flex items-center gap-3 px-4 py-3`} aria-label={`${t.journeyProgress}: ${daysDone} / ${REAL_DAYS}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- small local art */}
          <img src={asset("/treasures/manger.webp")} alt="" width={60} height={60} className="shrink-0 drop-shadow-[0_0_10px_rgba(255,214,90,0.8)]" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <p className="flex items-center justify-between gap-2 font-display font-bold text-ink">
              {t.journeyProgress}
              <span className="shrink-0 rounded-full border-2 border-[#e4cfa4] bg-white/80 px-2 text-sm">
                {daysDone} / {REAL_DAYS} {t.days}
              </span>
            </p>
            <div className="h-3.5 overflow-hidden rounded-full bg-[#d9cbb0] shadow-inner">
              <div className="h-full rounded-full bg-gradient-to-b from-[#ffd75e] to-[#e0a21a]" style={{ width: `${Math.max((daysDone / REAL_DAYS) * 100, 3)}%` }} />
            </div>
            {prog && (
              <p className="flex flex-wrap gap-2 text-sm font-bold">
                <XpPill xp={balance(prog)} className="min-h-7 text-sm" />
                <span className="inline-flex min-h-7 items-center rounded-full border-[3px] border-[#f5c542] bg-white/80 px-2">
                  🔥 {currentStreak(prog.onTimeDays.filter((d) => d >= (prog.xpFrom ?? 1)), today)} {t.streak}
                </span>
              </p>
            )}
          </div>
        </section>

        {!mission || !m ? (
          <section className={`${parch} p-5 text-center font-display text-lg text-crimson-dark`}>{today === 0 ? `${t.begins} ${date}` : t.allDone}</section>
        ) : (
          <>
            {/* Today's theme */}
            <section className={`${parch} flex items-center gap-3 overflow-hidden p-3`}>
              <div className="flex size-32 shrink-0 items-center justify-center rounded-2xl bg-[radial-gradient(circle,rgba(255,244,200,0.95),rgba(255,214,90,0.25)_60%,transparent_75%)]">
                {reward && <TreasureArt k={reward.world} size={120} label={PIECES[reward.world].name.en} />}
              </div>
              <div className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center">
                <p className="font-display text-sm font-bold text-crimson-dark">— {t.todayTheme} —</p>
                <h2 className="font-display text-2xl leading-tight font-black text-crimson-dark">{m.title}</h2>
                <p className="line-clamp-3 font-display leading-snug">“{m.verse}”</p>
                <p className="font-display text-sm text-ink-soft">— {m.ref}</p>
              </div>
            </section>

            {/* Today's activities: the marks only show what is done; a row opens that step */}
            <section className={`${parch} relative mt-4 flex flex-col gap-2.5 px-3 pt-9 pb-3`}>
              <h2 className={`${tag} flex items-center gap-2`}>
                <ListIcon width={22} height={22} className="text-[#f5c542]" />
                {t.todayActivities}
              </h2>
              {STEPS.map((s) => {
                const ok = has(s);
                return (
                  <Link
                    key={s}
                    href={`/day/${today}?step=${s}`}
                    className="flex items-center gap-3 rounded-2xl border-2 border-[#ecd6a6] bg-gradient-to-b from-[#fffaf0] to-[#f8ebcc] p-3 shadow-sm transition active:scale-[0.98]"
                  >
                    <span aria-hidden className="flex size-14 shrink-0 items-center justify-center rounded-full border-[3px] border-[#f5c542] bg-gradient-to-b from-[#d8333a] to-crimson-dark text-[#ffe7a3] shadow">
                      {ICON[s]}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="font-display text-xl leading-tight font-black text-crimson-dark">{t[`step${s[0].toUpperCase()}${s.slice(1)}` as "stepRead"]}</span>
                      <span className="line-clamp-2 text-sm leading-snug text-ink">{line(s)}</span>
                    </span>
                    {ok ? (
                      <span role="img" aria-label={t.completed} className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-white bg-gradient-to-b from-[#4cb84f] to-[#2f7a3b] text-white shadow-md">
                        <CheckIcon width={22} height={22} strokeWidth={3.5} />
                      </span>
                    ) : (
                      <span role="img" aria-label={t.notDone} className="size-10 shrink-0 rounded-full border-[3px] border-[#c9873a]" />
                    )}
                  </Link>
                );
              })}

              {/* The day's treasure */}
              {reward && (
                <Link href={has("task") ? "/treasure" : `/day/${today}?step=task`} className="mt-1 flex items-center gap-3 border-t-2 border-[#ecd6a6] pt-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- small local art */}
                  <img src={asset("/treasures/gold.webp")} alt="" width={60} height={60} className="shrink-0 drop-shadow-[0_0_12px_rgba(255,214,90,0.9)]" />
                  <span className="min-w-0 flex-1 font-display leading-snug font-bold text-crimson-dark">
                    {has("task") ? `${t.unlockedToday} ${PIECES[reward.world].name[lang]}` : t.unlockHint}
                  </span>
                  {has("task") ? (
                    <Chevron width={24} height={24} strokeWidth={3} className="shrink-0 text-crimson-dark" />
                  ) : (
                    <XpPill xp={`+${STEPS.reduce((n, s) => n + XP[s], 0)}`} />
                  )}
                </Link>
              )}
            </section>
          </>
        )}

        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/bible" className={`${pill} gap-2 px-5`}>
            <BookIcon width={22} height={22} strokeWidth={2.2} />
            {t.bible}
          </Link>
          {/* Settings: children, parish, leaderboard choice, sign-out */}
          <Link href="/children" className={`${pill} gap-2 px-5`}>
            <GearIcon width={22} height={22} strokeWidth={2.2} />
            {t.settings}
          </Link>
        </div>

        <TabBar current="home" />
      </div>
      {welcome && (
        <div role="dialog" aria-modal="true" aria-labelledby="welcome-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <section className={`${parch} flex w-full max-w-sm flex-col items-center gap-3 p-6 text-center animate-[rise_.5s_ease-out] motion-reduce:animate-none`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- small local art */}
            <img src={asset("/treasures/star.webp")} alt="" width={72} height={72} className="drop-shadow-[0_0_14px_rgba(255,214,90,0.9)]" />
            <h2 id="welcome-title" className="font-display text-3xl font-black text-crimson-dark">{t.welcomeTitle}</h2>
            <p className="leading-relaxed">{t.welcomeBody}</p>
            <button type="button" autoFocus className={`${redBtn} w-full`} onClick={closeWelcome}>
              {t.welcomeGo}
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
