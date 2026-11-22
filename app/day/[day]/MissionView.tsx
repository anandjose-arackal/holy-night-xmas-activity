"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { BackIcon, BookIcon, CheckIcon, Chevron, Divider, HeartIcon, LockIcon, MicIcon, Ribbon, ShareIcon, StarIcon, TabBar, VillageIcon, roundBtn } from "@/components/day";
import { PrayerSheet } from "@/components/PrayerSheet";
import { VerseShare } from "@/components/VerseShare";
import { useXpPop } from "@/components/XpPop";
import { DAY_PRAYERS } from "@/content/prayers";
import { TreasureArt } from "@/components/TreasureArt";
import { missions, type Mission } from "@/content/missions";
import { QUIZ, type QuizQuote } from "@/content/quiz";
import { VerseQuiz } from "@/components/VerseQuiz";
import { ClampText } from "@/components/ClampText";
import { makeQuiz } from "@/lib/quiz";
import { completeMission, completePrayer, completeStep, type FullProgress, loadProgress } from "@/lib/data";
import { isOpen } from "@/lib/game/unlock";
import { MASS_HOME, XP, type Step } from "@/lib/game/xp";
import { prayXp } from "@/lib/voice/accumulator";
import { parseRef } from "@/lib/bible";
import { useT } from "@/lib/i18n";
import { asset } from "@/lib/asset";
import { parch, pill, redBtn, tag } from "@/lib/ui";
import { useChild } from "@/lib/useChild";
import { PIECES, TREE_NAMES, rewardForDay } from "@/lib/village/layout";

const STEP_ORDER: Step[] = ["read", "mass", "task"];
const VOICE = process.env.NEXT_PUBLIC_VOICE !== "0"; // Pray now; set NEXT_PUBLIC_VOICE=0 to hide it

const shell =
  "day-bg flex min-h-dvh flex-col px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] text-ink landscape:bg-fixed";
const ghostBtn =
  `${pill} disabled:opacity-50`;

/** One parchment section with a round icon badge; a green tick once its step is done. */
function Part({ icon, title, done, children }: { icon: ReactNode; title: string; done?: boolean; children: ReactNode }) {
  return (
    <section className={`${parch} flex gap-3 p-4`}>
      <span
        aria-hidden
        className={`flex size-11 shrink-0 items-center justify-center rounded-full border-[3px] border-[#f5c542] text-white shadow ${
          done ? "bg-[#2f7a3b]" : "bg-gradient-to-b from-[#d8333a] to-crimson-dark"
        }`}
      >
        {done ? <CheckIcon width={22} height={22} strokeWidth={3} /> : icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h2 className="font-display text-lg font-black text-crimson-dark">{title}</h2>
        {children}
      </div>
    </section>
  );
}

function Done({ label }: { label: string }) {
  return (
    <p className="flex items-center gap-1 font-semibold text-[#2f7a3b]">
      <CheckIcon width={20} height={20} strokeWidth={3} /> {label}
    </p>
  );
}

export function MissionView({ mission }: { mission: Mission }) {
  const { t, lang } = useT();
  const router = useRouter();
  const ctx = useChild();
  const [prog, setProg] = useState<FullProgress | null>(null);
  const [busy, setBusy] = useState<Step | null>(null);
  const [quizOk, setQuizOk] = useState(false);
  const [error, setError] = useState(false);
  const [sheet, setSheet] = useState<"pray" | "share" | null>(null);
  const xpPop = useXpPop();
  // After the task: the treasure unlock, then the day's story, each as its own full-screen scene.
  const asked = useSearchParams().get("step"); // from the dashboard's activity links
  const [scene, setScene] = useState<"unlock" | "story" | null>(asked === "story" ? "story" : null);
  // The step shown; until chosen, the one the link named, else the first one not done.
  const [pick, setPick] = useState<number | null>(() => {
    const i = STEP_ORDER.indexOf(asked as Step);
    return i < 0 ? null : i;
  });
  useEffect(() => {
    if (ctx) loadProgress(ctx.child).then(setProg, () => setError(true));
  }, [ctx]);
  // Next keeps this page alive between visits, so follow the link again each time it is shown.
  useEffect(() => {
    const i = STEP_ORDER.indexOf(asked as Step);
    /* eslint-disable react-hooks/set-state-in-effect -- the link is the source of truth on every visit */
    setPick(i < 0 ? null : i);
    setScene(asked === "story" ? "story" : null);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [asked]);
  if (!ctx || !prog)
    return (
      // A quiet placeholder in the page's own shape, so the content does not jump in when it arrives.
      <main className={shell} aria-busy="true">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 motion-safe:animate-pulse">
          <span className={`${roundBtn} opacity-60`} />
          <div className={`${parch} mt-4 h-40 opacity-70`} />
          <div className={`${parch} h-72 opacity-60`} />
          <span className="sr-only">{t.loading}</span>
        </div>
      </main>
    );
  const { child, campaign } = ctx;

  const m = mission[lang];
  const day = mission.day;
  const reward = rewardForDay(day)!;
  const piece = PIECES[reward.world];
  const has = { read: prog.readDays, mass: prog.massDays, task: prog.taskDays, story: prog.storyDays };
  const done = (s: Step) => has[s].includes(day);
  // The read step ends with a fill-the-missing-word quiz; "I read it" appears once it is solved.
  // The day's Bible quote when there is one, else the day's own verse.
  const pickLang = (q: QuizQuote) => (lang === "ml" ? q.ml : q);
  const quote = QUIZ[day] && pickLang(QUIZ[day]);
  const quiz = quote
    ? makeQuiz(quote.text, Object.entries(QUIZ).filter(([d]) => +d !== day).map(([, q]) => pickLang(q!).blank), day, quote.blank)
    : makeQuiz(m.verse, missions.filter((o) => o.day !== day).map((o) => o[lang].verse), day);
  const quizRef = quote?.ref ?? m.ref;
  const firstOpen = STEP_ORDER.findIndex((s) => !done(s));
  const at = pick ?? (firstOpen < 0 ? 2 : firstOpen);
  // Change step: back to the top first, so the new card slides in where the eye is.
  const go = (i: number) => {
    setPick(i);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = (
    <Link href="/calendar" aria-label={t.back} className={`${roundBtn} self-start`}>
      <BackIcon width={24} height={24} strokeWidth={3} />
    </Link>
  );

  if (!isOpen(day, campaign)) {
    return (
      <main className={shell}>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4">
          {back}
          <section className={`${parch} mt-auto mb-auto flex flex-col items-center gap-3 p-8 text-center`}>
            <LockIcon width={40} height={40} className="text-crimson-dark" />
            <p className="font-display text-xl font-black text-crimson-dark">{t.locked}</p>
          </section>
        </div>
      </main>
    );
  }

  async function finish(step: Step, church = false) {
    setBusy(step);
    setError(false);
    try {
      if (step === "task") await completeMission(child.id, day);
      else await completeStep(child.id, day, step, church);
      const key = step === "read" ? "readDays" : step === "mass" ? "massDays" : step === "task" ? "taskDays" : "storyDays";
      const gained = step === "mass" ? (church ? XP.mass : MASS_HOME) : XP[step];
      setProg((p) => p && { ...p, [key]: [...p[key], day], massXp: step === "mass" ? { ...p.massXp, [day]: gained } : p.massXp });
      xpPop.pop(`+${gained} XP`);
      if (step === "read" || step === "mass") go(STEP_ORDER.indexOf(step) + 1);
      if (step === "task") setScene("unlock");
      if (step === "story") router.push("/home");
    } catch {
      setError(true);
    }
    setBusy(null);
  }
  const massXp = prog.massXp[day] ?? 10; // a tick from before church/home counts 10
  const dayXp =
    (done("read") ? XP.read : 0) + (done("mass") ? massXp : 0) + XP.task + (done("story") ? XP.story : 0) + (prog.prayXp[day] ?? 0);
  const prayers = VOICE ? DAY_PRAYERS[day] : undefined;
  const bibleAt = parseRef(mission.en.ref); // the day's passage, opened in the Bible reader
  const prayedVoice = prog.prayVoiceDays.includes(day);
  async function savePrayer(secs: number | null) {
    const before = prog!.prayXp[day];
    const xp = await completePrayer(child.id, day, prayers!, secs);
    setProg((p) => p && { ...p, prayXp: { ...p.prayXp, [day]: xp }, prayVoiceDays: secs == null ? p.prayVoiceDays : [...p.prayVoiceDays, day] });
    const base = prayXp(prayers!, false);
    if (before == null) xpPop.pop(`+${base} XP`);
    if (secs != null && xp > base) xpPop.pop(`+${xp - base} XP · ${t.prayVoiceBonus}`, before == null ? 500 : 0);
  }

  return (
    <main className={shell}>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4">
        {back}

        <header className={`${parch} relative mt-4 flex flex-col items-center gap-1 px-5 pt-8 pb-5 text-center`}>
          <p className={tag}>
            {t.day} {day}
          </p>
          <h1 className="font-display text-3xl leading-tight font-black text-crimson-dark">{m.title}</h1>
          <p className="font-display text-ink-soft italic">{m.ref}</p>
          <ol className="mt-2 flex gap-2" aria-label={t.activities}>
            {STEP_ORDER.map((s, i) => (
              <li key={s}>
                <button
                  type="button"
                  aria-current={i === at ? "step" : undefined}
                  onClick={() => go(i)}
                  className={`min-h-9 rounded-full border-[3px] px-3 font-display text-sm font-bold ${
                    i === at ? "border-[#f5c542] bg-gradient-to-b from-[#d8333a] to-crimson-dark text-white" : done(s) ? "border-[#f5c542] bg-[#fff6dc] text-crimson-dark" : "border-rim/60 bg-white/70 text-ink-soft"
                  }`}
                >
                  {done(s) ? "✓ " : `${i + 1}. `}
                  {t[`step${s[0].toUpperCase()}${s.slice(1)}` as "stepRead"]}
                </button>
              </li>
            ))}
          </ol>
        </header>

        <div key={at} className="animate-[rise_.35s_ease-out] motion-reduce:animate-none">
        {
          [
            <Part key="read" icon={<BookIcon width={22} height={22} />} title={`1. ${t.stepRead}`} done={done("read")}>
                    <ClampText lines={5}><blockquote className="font-display text-lg leading-relaxed italic">“{m.verse}”</blockquote></ClampText>
                    <div className="flex items-center justify-between gap-2">
                      {bibleAt ? (
                        <Link
                          href={`/bible/read?b=${bibleAt.b}&c=${bibleAt.c}&v=${mission.en.ref.split(":")[1].replace(/\s/g, "")}`}
                          className="flex min-h-11 items-center gap-1 text-sm font-semibold text-crimson-dark underline decoration-rim decoration-2 underline-offset-4"
                        >
                          <BookIcon width={18} height={18} /> {m.ref}
                        </Link>
                      ) : (
                        <p className="text-sm font-semibold text-ink-soft">— {m.ref}</p>
                      )}
                      <button type="button" aria-label={t.shareVerse} onClick={() => setSheet("share")} className="flex size-11 shrink-0 items-center justify-center rounded-full border-[3px] border-[#f5c542] bg-[#fffaf0] text-crimson-dark shadow">
                        <ShareIcon width={22} height={22} strokeWidth={2.2} />
                      </button>
                    </div>
                    <p className="leading-relaxed">{m.reflection}</p>
                    {quiz && <VerseQuiz key={`${day}-${lang}`} quiz={quiz} quoteRef={quizRef} quoteTitle={quote?.title} solved={quizOk || done("read")} onSolved={() => setQuizOk(true)} />}
                    {done("read") ? (
                      <Done label={`${t.newOrnament} ${TREE_NAMES[reward.tree][lang]}`} />
                    ) : (quizOk || !quiz) && (
                      <button type="button" className={ghostBtn} disabled={!!busy} onClick={() => finish("read")}>
                        {t.readDone} · +{XP.read} XP
                      </button>
                    )}
                  </Part>,
            <Part key="mass" icon={<HeartIcon width={22} height={22} />} title={`2. ${t.stepMass}`} done={done("mass")}>
                    <p className="font-display leading-relaxed italic">{m.massPrayer}</p>
                    <p className="text-sm text-ink-soft">{t.massNote}</p>
                    {done("mass") ? (
                      <Done label={`+${massXp} XP`} />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className={ghostBtn} disabled={!!busy} onClick={() => finish("mass", true)}>
                          {t.massWent} · +{XP.mass} XP
                        </button>
                        <button type="button" className={ghostBtn} disabled={!!busy} onClick={() => finish("mass", false)}>
                          {t.massHome} · +{MASS_HOME} XP
                        </button>
                      </div>
                    )}
                  </Part>,
            <Part key="task" icon={<StarIcon width={22} height={22} />} title={`3. ${t.stepTask}`} done={done("task")}>
                    <p className="text-lg leading-relaxed">{m.task}</p>
                    <p className="font-display leading-relaxed italic">{m.prayer}</p>
                    {prayers &&
                      (prayedVoice ? (
                        <Done label={`${t.prayDone} · +${prog.prayXp[day]} XP`} />
                      ) : (
                        <>
                          {prog.prayXp[day] != null && <Done label={`${t.prayDone} · +${prog.prayXp[day]} XP`} />}
                          <button type="button" className={`${ghostBtn} min-h-12 text-lg`} onClick={() => setSheet("pray")}>
                            <MicIcon width={22} height={22} /> {t.prayNow} · +{prayXp(prayers, true)} XP
                          </button>
                        </>
                      ))}
                    {done("task") ? (
                      <Done label={t.completed} />
                    ) : (
                      <button type="button" className={redBtn} disabled={!!busy} onClick={() => finish("task")}>
                        {t.done} · +{XP.task} XP
                      </button>
                    )}
                  </Part>,
          ][at]
        }
        </div>

        {error && (
          <p role="alert" className={`${parch} p-3 text-center font-semibold text-crimson-dark`}>
            {t.error}
          </p>
        )}

        {/* One step at a time: back, and skip (not done yet) or next (done). The task's next is the story. */}
        <nav className="sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-10 mt-auto flex items-center gap-2 py-2">
          {at > 0 && (
            <button type="button" aria-label={t.back} className={roundBtn} onClick={() => go(at - 1)}>
              <BackIcon width={24} height={24} strokeWidth={3} />
            </button>
          )}
          {at < 2 ? (
            <button type="button" className={`${done(STEP_ORDER[at]) ? redBtn : pill} flex-1`} onClick={() => go(at + 1)}>
              {done(STEP_ORDER[at]) ? t.next : t.skip} <Chevron width={22} height={22} strokeWidth={3} />
            </button>
          ) : (
            <button type="button" className={`${done("task") ? redBtn : pill} flex-1`} onClick={() => setScene("story")}>
              {done("task") ? (
                <>
                  <BookIcon width={24} height={24} className="text-[#f5c542]" />
                  {done("story") ? t.todayStory : t.nextStory}
                </>
              ) : (
                <>
                  {t.skip} <Chevron width={22} height={22} strokeWidth={3} />
                </>
              )}
            </button>
          )}
        </nav>

        <TabBar current="activities" />
      </div>

      {sheet === "pray" && prayers && <PrayerSheet set={prayers} t={t} lang={lang} onSave={savePrayer} onClose={() => setSheet(null)} />}
      {sheet === "share" && <VerseShare verse={m.verse} verseRef={m.ref} fileName={`verse-day-${day}`} t={t} onClose={() => setSheet(null)} />}
      {xpPop.node}

      {scene === "unlock" && (
        <section
          role="dialog"
          aria-label={`${t.day} ${day} ${t.completeBang}`}
          className="day-bg fixed inset-0 z-50 overflow-y-auto px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] text-center animate-[rise_.5s_ease-out] motion-reduce:animate-none"
        >
          <div className="mx-auto flex w-full max-w-md flex-col items-center">
            {/* Gold medal with a tick on top of the ribbon */}
            <span aria-hidden className="relative z-20 flex size-16 items-center justify-center rounded-full border-4 border-[#f5c542] bg-gradient-to-b from-[#d8333a] to-crimson-dark text-white shadow-[0_0_0_3px_#9a6a12,0_6px_14px_rgba(0,0,0,0.35)]">
              <CheckIcon width={34} height={34} strokeWidth={3.5} />
            </span>
            <div className="-mt-1 w-full">
              <Ribbon title={`${t.day} ${String(day).padStart(2, "0")} ${t.completeBang}`} />
            </div>
            <p className="relative z-10 mt-3 flex items-center gap-2 rounded-full border-[3px] border-rim bg-gradient-to-b from-parchment to-parchment-2 py-1 pr-5 pl-2 font-display text-xl font-black text-crimson-dark shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element -- small local art */}
              <img src={asset("/treasures/gold.webp")} alt="" width={44} height={44} className="-my-2 drop-shadow-[0_0_10px_rgba(255,214,90,0.9)]" />
              {t.newTreasure}
            </p>

            {/* The treasure in a slow ring of light */}
            <div className="relative my-2 flex size-60 items-center justify-center">
              <span
                aria-hidden
                className="absolute inset-[-20%] animate-[spin_40s_linear_infinite] rounded-full bg-[repeating-conic-gradient(rgba(255,236,170,0.65)_0deg_7deg,transparent_7deg_18deg)] [mask-image:radial-gradient(circle,black_25%,transparent_68%)] motion-reduce:animate-none"
              />
              <span aria-hidden className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle,rgba(255,244,200,0.95),rgba(255,214,90,0.35)_55%,transparent_72%)]" />
              <span className="relative animate-[rise_.8s_ease-out] motion-reduce:animate-none">
                <TreasureArt k={reward.world} size={220} label={piece.name.en} />
              </span>
            </div>

            <div className={`${parch} relative mt-6 flex w-full flex-col items-center gap-3 px-5 pt-9 pb-5`}>
              <h2 className={`absolute -top-6 left-1/2 max-w-[90%] -translate-x-1/2 truncate rounded-full border-[3px] border-[#f5c542] bg-gradient-to-b from-[#d8333a] to-crimson-dark px-6 py-1.5 font-display ${[...piece.name[lang]].length > 12 ? "text-[clamp(1.1rem,5vw,1.5rem)]" : "text-[clamp(1.5rem,7vw,2rem)]"} font-black whitespace-nowrap text-white shadow-lg [text-shadow:0_2px_0_#5a0e12]`}>
                {piece.name[lang]}
              </h2>
              <h3 className="font-display text-2xl leading-tight font-black text-crimson-dark">{m.title}</h3>
              <p className="text-lg leading-snug">{piece.desc[lang]}</p>
              <blockquote className="w-full rounded-xl border-2 border-[#e2c58a] bg-gradient-to-b from-[#fbecc8] to-[#f1d9a4] px-4 py-3 font-display text-lg leading-snug font-bold text-crimson-dark italic shadow-[inset_0_2px_6px_rgba(120,70,10,0.18)]">
                <ClampText lines={4}>“{m.verse}”</ClampText>
                <span className="mt-1 block text-base font-semibold text-ink not-italic">— {m.ref}</span>
              </blockquote>
              <p className="flex items-center gap-2 rounded-full border-[3px] border-[#f5c542] bg-gradient-to-b from-[#d8333a] to-crimson-dark py-1 pr-6 pl-2 font-display text-2xl font-black text-white shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element -- small local art */}
                <img src={asset("/treasures/star.webp")} alt="" width={40} height={40} className="-my-2" />+{dayXp} XP
              </p>
              {reward.world !== "tree" && reward.world !== "star" ? (
                <button type="button" className={`${redBtn} w-full px-4! text-[clamp(0.9rem,4.6vw,1.25rem)]! whitespace-nowrap`}
                  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- /play reads its query once on first render; a full load guarantees it is there
                  onClick={() => location.assign(`/play?place=${reward.world}`)}>
                  <VillageIcon width={28} height={28} className="text-[#f5c542]" />
                  {t.addToVillage}
                </button>
              ) : (
                <button type="button" className={`${redBtn} w-full`}
                  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- /play reads its query once on first render; a full load guarantees it is there
                  onClick={() => location.assign(`/play?new=${day}`)}>
                  <VillageIcon width={28} height={28} className="text-[#f5c542]" />
                  {t.seeVillage}
                </button>
              )}
              <button
                type="button"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-[3px] border-rim bg-gradient-to-b from-[#fffaf0] to-parchment-2 font-display text-xl font-bold text-crimson-dark shadow-md transition active:scale-[0.98]"
                onClick={() => setScene("story")}
              >
                <BookIcon width={22} height={22} /> {t.nextStory} <Chevron width={22} height={22} strokeWidth={3} />
              </button>
            </div>
          </div>
        </section>
      )}

      {scene === "story" && (
        <section
          role="dialog"
          aria-label={m.story.title}
          className="day-bg fixed inset-0 z-50 overflow-y-auto px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] animate-[rise_.5s_ease-out] motion-reduce:animate-none"
        >
          <div className="mx-auto flex w-full max-w-md flex-col gap-4">
            <button type="button" aria-label={t.back} className={`${roundBtn} self-start`} onClick={() => setScene(null)}>
              <BackIcon width={24} height={24} strokeWidth={3} />
            </button>
            <Ribbon title={t.todayStory} />
            <article className={`${parch} relative mt-2 flex flex-col gap-3 overflow-hidden p-5`}>
              {/* The day's picture, once added as public/stories/<day>.webp; hidden until then. */}
              {/* eslint-disable-next-line @next/next/no-img-element -- local art, optional */}
              <img
                src={asset(`/stories/${day}.webp`)}
                alt=""
                className="-mx-5 -mt-5 mb-1 aspect-[4/3] w-[calc(100%+2.5rem)] max-w-none object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <h2 className="text-center font-display text-3xl leading-tight font-black text-crimson-dark">{m.story.title}</h2>
              <Divider />
              <p className="text-lg leading-relaxed whitespace-pre-line">{m.story.body}</p>
            </article>
            {done("story") ? (
              <button type="button" className={redBtn} onClick={() => router.push("/home")}>
                {t.continueJourney} <Chevron width={22} height={22} strokeWidth={3} />
              </button>
            ) : (
              <button type="button" className={redBtn} disabled={!!busy} onClick={() => finish("story")}>
                <CheckIcon width={24} height={24} strokeWidth={3} /> {t.storyDone} · +{XP.story} XP
              </button>
            )}
            {error && <p role="alert" className="text-center font-semibold text-white">{t.error}</p>}
          </div>
        </section>
      )}
    </main>
  );
}
