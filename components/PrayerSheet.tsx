"use client";

// Pray now: the day's prayers one repetition at a time, a bead for each, filled by on-device voice detection.
import { useState } from "react";
import { CheckIcon, CloseIcon, MicIcon } from "@/components/day";
import { PRAYERS, type PrayerSet } from "@/content/prayers";
import type { Lang } from "@/content/missions";
import { beadAt, prayXp, requiredMs as needMs } from "@/lib/voice/accumulator";
import { useVoicePrayer, type VoiceError } from "@/lib/voice/useVoicePrayer";
import type { useT } from "@/lib/i18n";
import { parch, pill, redBtn, xpPill } from "@/lib/ui";

type T = ReturnType<typeof useT>["t"];
const MIC_ERR: Record<VoiceError, keyof T> = {
  denied: "micDenied",
  nomic: "micNone",
  busy: "micBusy",
  insecure: "micInsecure",
  old: "micOld",
  download: "micDownload",
  unknown: "micUnknown",
};

export function PrayerSheet({ set, t, lang, onSave, onClose }: {
  set: PrayerSet;
  t: T;
  lang: Lang;
  /** Saves the prayer; speechSeconds is null for a manual "I prayed". Resolves once the server confirmed. */
  onSave: (speechSeconds: number | null) => Promise<void>;
  onClose: () => void;
}) {
  const required = needMs(set);
  const [save, setSave] = useState<{ state: "idle" | "saving" | "saved" | "failed"; secs: number | null }>({ state: "idle", secs: null });
  const doSave = (secs: number | null) => {
    setSave({ state: "saving", secs });
    onSave(secs).then(
      () => setSave({ state: "saved", secs }),
      () => setSave({ state: "failed", secs }),
    );
  };
  const v = useVoicePrayer({ requiredMs: required, onVerified: doSave });
  const at = beadAt(set, v.confirmedMs);
  const ghost = beadAt(set, v.optimisticMs);
  const cur = set[at.item];
  const lines = PRAYERS[cur.key].text[lang];
  const close = () => {
    v.stop();
    onClose();
  };

  const label =
    v.status === "loading" ? t.prayPreparing
    : v.status === "listening" ? (v.speaking ? t.prayHeard : v.nudge ? t.prayKeepGoing : t.prayListening)
    : v.status === "paused" ? (v.autoPaused ? t.prayAutoPaused : t.prayPaused)
    : v.status === "timeout" ? t.prayTimeout
    : null;
  const finished = save.state !== "idle";

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-label={t.prayTitle}
      className="day-bg fixed inset-0 z-50 overflow-y-auto px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] animate-[sheet_.35s_ease-out] motion-reduce:animate-none"
    >
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-black text-white [text-shadow:0_2px_3px_rgba(0,0,0,0.6)]">{t.prayTitle}</h2>
          <button type="button" aria-label={t.prayClose} onClick={close} className="flex size-12 items-center justify-center rounded-full border-[3px] border-rim bg-parchment text-crimson-dark shadow-md">
            <CloseIcon width={24} height={24} strokeWidth={3} />
          </button>
        </div>

        {/* Bead strings: one row group per prayer, 10 beads a row; a big prayer is one large bead. */}
        <div className={`${parch} flex flex-col gap-3 p-4`}>
          {set.map((p, i) => {
            const big = PRAYERS[p.key].big;
            const state = (rep: number) => (i < at.item || (i === at.item && (rep < at.rep || at.done)) ? 1 : i === at.item && rep === at.rep ? at.fill : 0);
            const faint = (rep: number) => (i === ghost.item && rep === ghost.rep ? ghost.fill : 0);
            return (
              <div key={i} aria-label={`${PRAYERS[p.key].text[lang][0].slice(0, 40)} × ${p.count}`} className={big ? "flex justify-center" : "grid grid-cols-10 justify-items-center gap-1.5"}>
                {Array.from({ length: p.count }, (_, rep) => {
                  const f = state(rep);
                  const g = Math.max(f, faint(rep));
                  const size = big ? "size-16" : "size-6";
                  return (
                    <span
                      key={rep}
                      aria-hidden
                      className={`${size} rounded-full border-2 ${f === 1 ? "border-[#9a6a12] bg-gradient-to-b from-[#ffe48a] to-[#e0a92a] shadow-[0_0_8px_rgba(255,214,90,0.8)]" : "border-rim"}`}
                      style={f < 1 ? { background: `conic-gradient(#e0a92a ${f * 360}deg, rgba(224,169,42,0.35) ${f * 360}deg ${g * 360}deg, #fffaf0 ${g * 360}deg)` } : undefined}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* The prayer to say now */}
        <article className={`${parch} flex flex-col gap-2 p-5`}>
          {set[at.item].count > 1 && !at.done && (
            <p className="font-display text-sm font-bold text-ink-soft">
              {at.rep + 1} / {cur.count}
            </p>
          )}
          <p className="font-display text-2xl leading-[1.8] font-bold text-crimson-dark">{lines[at.rep % lines.length]}</p>
        </article>

        {finished ? (
          <div className={`${parch} flex flex-col items-center gap-3 p-5 text-center`}>
            <p className="flex items-center gap-2 font-display text-2xl font-black text-[#2f7a3b]">
              <CheckIcon width={28} height={28} strokeWidth={3} /> {t.prayFinished}
            </p>
            {save.state === "saving" && <p className="text-ink-soft">{t.praySaving}</p>}
            {save.state === "saved" && <p className={`${xpPill} text-xl`}>+{prayXp(set, save.secs != null)} XP</p>}
            {save.state === "failed" && (
              <>
                <p role="alert" className="font-semibold text-crimson-dark">{t.error}</p>
                <button type="button" className={redBtn} onClick={() => doSave(save.secs)}>
                  {t.prayRetry}
                </button>
              </>
            )}
            {save.state === "saved" && (
              <button type="button" className={`${redBtn} w-full`} onClick={close}>
                {t.next}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            {/* Mic bubble: halo rings while the child is speaking */}
            <div className="relative flex size-28 items-center justify-center">
              {v.speaking && (
                <>
                  <span aria-hidden className="absolute inset-0 rounded-full bg-[#f5c542]/50 motion-safe:animate-ping" />
                  <span aria-hidden className="absolute -inset-2 rounded-full border-4 border-[#f5c542]/70" />
                </>
              )}
              <span
                aria-hidden
                className={`relative flex size-24 items-center justify-center rounded-full border-4 border-[#f5c542] text-white shadow-lg transition-transform ${
                  v.status === "listening" ? "bg-gradient-to-b from-[#d8333a] to-crimson-dark" : "bg-gradient-to-b from-[#a08a6a] to-[#6b5a40]"
                } ${v.speaking ? "motion-safe:scale-110" : ""} ${v.status === "loading" ? "motion-safe:animate-pulse" : ""}`}
              >
                <MicIcon width={44} height={44} strokeWidth={2.2} />
              </span>
            </div>
            <p aria-live="polite" className="min-h-7 text-center font-display text-lg font-bold text-white [text-shadow:0_2px_3px_rgba(0,0,0,0.7)]">
              {label}
            </p>

            {v.status === "error" && v.error && (
              <div role="alert" className={`${parch} flex w-full flex-col gap-1 p-4 text-center`}>
                <p className="font-display text-lg font-bold text-crimson-dark">{t[MIC_ERR[v.error]] as string}</p>
                {v.error === "denied" && <p className="text-sm text-ink-soft" lang="en">{t.micDeniedParent}</p>}
                <p className="text-sm text-ink-soft" lang="en">{t.micHelpParent}</p>
              </div>
            )}

            <div className="flex w-full flex-wrap justify-center gap-2">
              {(v.status === "idle" || v.status === "error" || v.status === "timeout") && (
                <button type="button" className={`${redBtn} flex-1`} onClick={v.start}>
                  <MicIcon width={24} height={24} /> {v.status === "idle" ? t.prayStart : t.prayRetry}
                </button>
              )}
              {v.status === "listening" && (
                <button type="button" className={`${pill} min-h-12 flex-1 text-lg`} onClick={v.pause}>
                  {t.prayPause}
                </button>
              )}
              {v.status === "paused" && (
                <button type="button" className={`${redBtn} flex-1`} onClick={v.resume}>
                  {t.prayResume}
                </button>
              )}
            </div>
            {(v.status === "error" || v.status === "timeout") && (
              <button type="button" className={`${pill} min-h-12 text-lg`} onClick={() => { v.stop(); doSave(null); }}>
                {t.prayManual} · +{prayXp(set, false)} XP
              </button>
            )}

            {v.status === "idle" && (
              <div className="rounded-2xl bg-black/45 p-3 text-center text-sm text-white">
                <p>{t.prayPrivacyChild}</p>
                <p className="mt-1 text-white/80" lang="en">{t.prayPrivacyParent}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
