"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BackIcon, ProfileIcon, Ribbon, StarIcon, TabBar, VillageIcon, roundBtn } from "@/components/day";
import { type BoardRow, leaderboard } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { asset } from "@/lib/asset";
import { avatars, parch } from "@/lib/ui";
import { useChild } from "@/lib/useChild";

// Gold, silver, bronze: [medal face, podium block].
const MEDAL = [
  ["from-[#fff1a8] to-[#d99a1c]", "from-[#fff6d6] to-[#f6dc8e]"],
  ["from-[#ffffff] to-[#a9adb8]", "from-[#fbfbfb] to-[#dfe1e6]"],
  ["from-[#ffd2a6] to-[#b8642a]", "from-[#fff0e0] to-[#f0c9a2]"],
];

/** A round medal with the rank number. */
const Medal = ({ rank, size = "size-10" }: { rank: number; size?: string }) => (
  <span
    className={`flex ${size} shrink-0 items-center justify-center rounded-full border-2 border-[#9a6a12] bg-gradient-to-b ${MEDAL[rank - 1]?.[0] ?? "from-white to-parchment-2"} font-display text-xl font-black text-ink shadow-[0_0_0_3px_rgba(245,197,66,0.45)]`}
  >
    {rank}
  </span>
);

const XpPill = ({ xp }: { xp: number }) => (
  <span className="inline-flex items-center gap-1 rounded-full border-2 border-[#f5c542] bg-gradient-to-b from-[#d8333a] to-crimson-dark px-2.5 py-0.5 text-sm font-bold whitespace-nowrap text-white shadow">
    <StarIcon width={15} height={15} className="fill-[#f5c542] text-[#f5c542]" />
    {xp} XP
  </span>
);

/**
 * Every child, by XP: in the child's parish or in all parishes.
 * Only full names and parishes are shown.
 */
export default function Leaderboard() {
  const { t } = useT();
  const ctx = useChild();
  const [scope, setScope] = useState<"parish" | "all">("all");
  const [rows, setRows] = useState<BoardRow[] | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!ctx) return;
    leaderboard(ctx.child, scope).then(setRows, () => setError(true));
  }, [ctx, scope]);
  if (!ctx) return <main className="day-bg min-h-dvh p-4 text-ink">{t.loading}</main>;
  const { child } = ctx;

  const me = rows?.find((r) => r.me);
  const others = rows ?? [];
  const podium = others.slice(0, 3);

  return (
    <main className="day-bg flex min-h-dvh flex-col px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] text-ink">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4">
        <header className="relative">
          <Link href="/home" aria-label={t.back} className={`${roundBtn} absolute top-1 left-0 z-30`}>
            <BackIcon width={24} height={24} strokeWidth={3} />
          </Link>
          <Ribbon
            title={t.boardTitle}
            // eslint-disable-next-line @next/next/no-img-element -- small local art
            top={<img src={asset("/treasures/star.webp")} alt="" width={70} height={70} className="relative z-0 h-[70px] w-auto drop-shadow-[0_0_14px_rgba(255,214,90,0.9)]" />}
            sub={
              <p className="rounded-full border-[3px] border-rim bg-gradient-to-b from-parchment to-parchment-2 px-5 py-0.5 font-display text-lg font-bold text-ink italic shadow-md">
                {t.boardTag}
              </p>
            }
          />
        </header>

        {podium.length > 0 && (
          <ol className="grid grid-cols-3 items-end gap-1.5" aria-label={t.boardTitle}>
            {[podium[1], podium[0], podium[2]].map(
              (r, i) =>
                r && (
                  <li key={`${r.rank}-${r.nickname}`} className="flex min-w-0 flex-col items-center">
                    <span
                      aria-hidden
                      className={`flex items-center justify-center rounded-full border-4 border-[#f5c542] bg-gradient-to-b from-parchment to-parchment-2 shadow-lg ${i === 1 ? "size-20 text-5xl" : "size-16 text-4xl"}`}
                    >
                      {avatars[r.avatar ?? ""] ?? "🐑"}
                    </span>
                    <div
                      className={`-mt-2 flex w-full flex-col items-center gap-1 rounded-t-2xl border-[3px] border-b-0 border-rim bg-gradient-to-b ${MEDAL[r.rank - 1]?.[1] ?? "from-parchment to-parchment-2"} px-1 pt-2 text-center shadow-[0_6px_14px_rgba(60,30,5,0.3)] ${i === 1 ? "pb-8" : "pb-3"}`}
                    >
                      <Medal rank={r.rank} size={i === 1 ? "size-12" : "size-10"} />
                      <span className="line-clamp-2 w-full font-display text-base leading-tight font-black break-words text-crimson-dark">{r.nickname}</span>
                      {r.parish && <span className="w-full truncate text-xs leading-tight text-ink-soft">{r.parish}</span>}
                      <XpPill xp={r.xp} />
                    </div>
                  </li>
                ),
            )}
          </ol>
        )}

        <section className={`${parch} -mt-4 flex flex-col gap-3 p-3`}>
          <div className="grid grid-cols-2 gap-1 rounded-full border-2 border-rim bg-[#f7e7c2] p-1 shadow-inner" role="tablist">
            {(["parish", "all"] as const).map((s) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={scope === s}
                className="flex min-h-11 items-center justify-center gap-1.5 rounded-full font-display text-base font-bold text-ink transition aria-selected:border-2 aria-selected:border-[#f5c542] aria-selected:bg-gradient-to-b aria-selected:from-[#d8333a] aria-selected:to-crimson-dark aria-selected:text-white aria-selected:shadow"
                onClick={() => {
                  setRows(null);
                  setScope(s);
                }}
              >
                {s === "parish" ? <VillageIcon width={20} height={20} className="text-[#c98a12]" /> : <ProfileIcon width={20} height={20} className="text-[#c98a12]" />}
                {s === "parish" ? t.myParish : t.allParishes}
              </button>
            ))}
          </div>
          {scope === "parish" && !child.parish_id && <p className="text-center text-sm text-ink-soft">{t.noParish}</p>}
          {error && <p role="alert" className="text-center font-semibold text-crimson-dark">{t.error}</p>}
          {rows && others.length === 0 && <p className="text-center text-ink-soft">{t.noBoard}</p>}
          {others.length > 0 && (
            <div className="overflow-hidden rounded-2xl border-2 border-rim bg-[#fffaf0]">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gradient-to-b from-[#b3222a] to-crimson-dark font-display text-white">
                    <th className="py-2 pl-3">{t.rank}</th>
                    <th className="px-1.5 py-2">{t.name}</th>
                    <th className="px-1.5 py-2">{t.parish}</th>
                    <th className="py-2 pr-3 text-right">XP</th>
                  </tr>
                </thead>
                <tbody>
                  {others.map((r) => (
                    <tr key={`${r.rank}-${r.nickname}-${r.me}`} className={`border-b border-rim/30 last:border-0 ${r.me ? "bg-[#fff1c9]" : ""}`}>
                      <td className="py-1.5 pl-3">{r.rank <= 3 ? <Medal rank={r.rank} size="size-8" /> : <span className="inline-block w-8 text-center font-display text-lg font-black">{r.rank}</span>}</td>
                      <td className="max-w-32 truncate px-1.5 py-2 font-display text-base font-bold text-crimson-dark">{r.nickname}</td>
                      <td className="max-w-20 truncate px-1.5 py-2 text-xs">{r.parish ?? "—"}</td>
                      <td className="py-2 pr-3 text-right font-display text-lg font-bold">{r.xp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {me && (
          <section className={`${parch} flex items-center gap-3 p-2.5 pr-4`}>
            <span aria-hidden className="flex size-14 shrink-0 items-center justify-center rounded-full border-4 border-[#f5c542] bg-gradient-to-b from-parchment to-parchment-2 text-3xl shadow">
              {avatars[child.avatar_key] ?? "🐑"}
            </span>
            <p className="flex-1 border-r-2 border-rim/60 pr-2 font-display text-lg font-black whitespace-nowrap text-crimson-dark">
              {t.yourRank}: #{me.rank}
            </p>
            <p className="flex items-center gap-1 font-display text-xl font-black text-crimson-dark">
              <StarIcon width={26} height={26} className="fill-[#f5c542] text-[#c98a12]" />
              {me.xp} XP
            </p>
          </section>
        )}

        <TabBar current="leaderboard" />
      </div>
    </main>
  );
}
