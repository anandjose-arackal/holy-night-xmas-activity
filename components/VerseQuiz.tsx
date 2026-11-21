"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n";
import type { Quiz } from "@/lib/quiz";

// Long passages: the quiz shows only the sentence holding the blank, with "…" where text was cut.
const LIMIT = 160;
const lead = (s: string) => {
  if (s.length <= LIMIT) return s;
  const cut = Math.max(s.lastIndexOf(". "), s.lastIndexOf("? "), s.lastIndexOf("! "));
  return "… " + (cut >= 0 && s.length - cut < LIMIT ? s.slice(cut + 2) : s.slice(-LIMIT).replace(/^\S*\s/, ""));
};
const tail = (s: string) => {
  if (s.length <= LIMIT) return s;
  const m = s.match(/[.?!](\s|$)/);
  return (m && m.index! < LIMIT ? s.slice(0, m.index! + 1) : s.slice(0, LIMIT).replace(/\s\S*$/, "")) + " …";
};

/** The verse again with one word missing; the child taps the word that fits. Wrong picks fade out, the right one fills the gap. */
export function VerseQuiz({ quiz, quoteRef, quoteTitle, solved, onSolved }: { quiz: Quiz; quoteRef: string; quoteTitle?: string; solved: boolean; onSolved: () => void }) {
  const { t } = useT();
  const [wrong, setWrong] = useState<string[]>([]);
  const filled = solved;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border-2 border-[#e2c58a] bg-gradient-to-b from-[#fbecc8] to-[#f1d9a4] p-3 shadow-[inset_0_2px_6px_rgba(120,70,10,0.18)]">
      <p className="text-center font-display font-black text-crimson-dark">{t.quizTitle}</p>
      <p className="font-display text-lg leading-relaxed">
        {lead(quiz.before)}
        <span
          className={`mx-0.5 rounded-lg border-b-[3px] px-1.5 font-black not-italic [box-decoration-break:clone] [overflow-wrap:anywhere] ${
            filled ? "border-[#2f7a3b] bg-[#dff3d8] text-[#2f7a3b]" : "border-crimson bg-white/70 text-transparent"
          }`}
        >
          {filled ? quiz.answer : " ".repeat(14)}
        </span>
        {tail(quiz.after)}
      </p>
      <p className="-mt-2 text-right font-display text-sm font-semibold text-ink-soft">— {quoteRef}</p>
      {/* The title often names the missing word, so it shows once the quiz is solved. */}
      {filled && quoteTitle && <p className="text-center font-display text-lg font-black text-crimson-dark">{quoteTitle}</p>}
      {!filled && (
        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label={t.quizTitle}>
          {quiz.options.map((o) => {
            const bad = wrong.includes(o);
            return (
              <button
                key={o}
                type="button"
                disabled={bad}
                onClick={() => (o === quiz.answer ? onSolved() : setWrong((w) => [...w, o]))}
                className={`min-h-12 max-w-full rounded-2xl border-[3px] font-display leading-tight ${[...o].length > 14 ? "px-3 text-sm" : "px-4 text-base"} font-bold [overflow-wrap:anywhere] transition active:scale-95 ${
                  bad ? "border-[#e0a0a0] bg-[#f6dede] text-crimson/50 line-through" : "border-[#f5c542] bg-gradient-to-b from-[#fffaf0] to-[#f3dfae] text-crimson-dark shadow-[0_3px_0_#c99a3b]"
                }`}
              >
                {o}
              </button>
            );
          })}
        </div>
      )}
      <p role="status" className="text-center text-sm font-bold empty:hidden">
        {filled ? <span className="text-[#2f7a3b]">✓ {t.quizRight}</span> : wrong.length > 0 ? <span className="text-crimson-dark">{t.quizWrong}</span> : null}
      </p>
    </div>
  );
}
