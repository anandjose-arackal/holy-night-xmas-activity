"use client";

import { useProgress } from "@react-three/drei";
import { Brand } from "@/components/day";
import { useT } from "@/lib/i18n";

/** Full-screen cover while the child's data and then every village file load. */
export function LoadingScreen({ stage }: { stage: "data" | "assets" }) {
  const { t } = useT();
  const { progress, loaded, total } = useProgress();
  const pct = stage === "data" ? 5 : Math.max(10, Math.round(progress));
  return (
    <div className="day-bg fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 p-6" role="status" aria-live="polite">
      <Brand title={t.appName} tag={t.journeyTag} />
      <div className="w-full max-w-xs rounded-[1.75rem] border-[3px] border-rim bg-gradient-to-b from-parchment to-parchment-2 p-5 text-center text-ink shadow-2xl">
        <p className="font-display text-lg font-bold text-crimson-dark">{stage === "data" ? t.loadingData : t.loadingVillage}</p>
        <div className="relative mt-3 h-6 overflow-hidden rounded-full border-2 border-rim bg-white/70">
          <div className="h-full rounded-full bg-crimson transition-[width] duration-300" style={{ width: `${pct}%` }} />
          <span className="absolute inset-0 grid place-items-center text-xs font-bold text-ink [text-shadow:0_0_3px_#fff]">{pct}%</span>
        </div>
        {stage === "assets" && total > 0 && (
          <p className="mt-2 text-sm text-ink-soft">
            {loaded}/{total}
          </p>
        )}
      </div>
    </div>
  );
}
