"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BackIcon, CheckIcon, VillageIcon, Divider, Ribbon, TabBar, XpPill, roundBtn } from "@/components/day";
import { TreasureArt } from "@/components/TreasureArt";
import { buyBonus, type FullProgress, loadProgress } from "@/lib/data";
import { DAYS, isChristmas } from "@/lib/game/unlock";
import { PRICES, balance, canBuy, massGifts } from "@/lib/game/xp";
import { useT } from "@/lib/i18n";
import { asset } from "@/lib/asset";
import { parch, redBtn } from "@/lib/ui";
import { useChild } from "@/lib/useChild";
import { BONUS_KEYS, MASS_GIFTS, PIECES, REWARDS, isPlaced, sanitizeLayout, visibleWorld, type PieceKey } from "@/lib/village/layout";

/** The child's treasure chest: the 27 day treasures (earned by each day's task) and bonus treasures bought with XP. */
export default function Treasure() {
  const { t, lang } = useT();
  const ctx = useChild();
  const [prog, setProg] = useState<FullProgress | null>(null);
  const [picked, setPicked] = useState<PieceKey | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (ctx) loadProgress(ctx.child).then(setProg, () => setError(true));
  }, [ctx]);
  if (!ctx || !prog) return <main className="day-bg min-h-dvh p-4 text-ink">{t.loading}</main>;
  const { child, campaign } = ctx;

  const earned = new Set<PieceKey>([...visibleWorld(child.days, isChristmas(campaign)), ...prog.bonus, ...massGifts(prog.massOnTimeDays)]);
  const placed = sanitizeLayout(prog.layout, earned);
  const dayCount = REWARDS.filter((r) => earned.has(r.world)).length;
  const sel = picked ?? REWARDS.find((r) => earned.has(r.world))?.world ?? null;
  const xp = balance(prog);

  async function buy(k: (typeof BONUS_KEYS)[number]) {
    setBusy(true);
    setError(false);
    try {
      await buyBonus(child, k);
      setProg((p) => p && { ...p, bonus: [...p.bonus, k] });
      setPicked(k);
    } catch {
      setError(true);
    }
    setBusy(false);
  }

  const tile = (k: PieceKey, locked: boolean, extra?: React.ReactNode) => (
    <button
      key={k}
      type="button"
      aria-pressed={sel === k}
      onClick={() => setPicked(k)}
      aria-label={locked ? `${t.locked} ${PIECES[k].name[lang]}` : PIECES[k].name[lang]}
      className={`relative flex flex-col items-center gap-0.5 rounded-2xl border-2 px-1 pt-2 pb-1.5 text-center shadow-[0_3px_8px_rgba(60,30,5,0.18)] transition active:scale-95 ${
        sel === k
          ? "border-[#f5c542] bg-gradient-to-b from-[#fff3c4] to-[#f7dc8f] ring-4 ring-[#f5c542]/50"
          : locked
            ? "border-[#e9d4a8] bg-[#efe1c2]"
            : "border-[#ecd6a6] bg-gradient-to-b from-[#fffaf0] to-[#f8ebcc]"
      }`}
    >
      {!locked && (
        <span aria-hidden className="absolute -top-1.5 -right-1.5 z-10 flex size-8 items-center justify-center rounded-full border-[3px] border-[#f5c542] bg-gradient-to-b from-[#d8333a] to-crimson-dark text-white shadow">
          <CheckIcon width={16} height={16} strokeWidth={3.5} />
        </span>
      )}
      <TreasureArt k={k} size={76} locked={locked} label={PIECES[k].name.en} />
      {!locked && <span className="line-clamp-2 w-full font-display text-[0.85rem] leading-tight font-bold text-ink">{PIECES[k].name[lang]}</span>}
      {extra}
    </button>
  );

  const selPiece = sel && PIECES[sel];
  const selLocked = !!sel && !earned.has(sel);
  const selBonus = !!sel && (BONUS_KEYS as PieceKey[]).includes(sel);
  const selGift = MASS_GIFTS.find(([k]) => k === sel)?.[1];
  const selDay = sel && REWARDS.find((r) => r.world === sel)?.day;

  return (
    <main className="day-bg flex min-h-dvh flex-col px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] text-ink landscape:bg-fixed">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4">
        <header className="relative">
          <Link href="/home" aria-label={t.back} className={`${roundBtn} absolute top-1 left-0 z-30`}>
            <BackIcon width={24} height={24} strokeWidth={3} />
          </Link>
          <XpPill xp={xp} className="absolute top-2 right-0 z-30" />
          <Ribbon
            title={t.myTreasure}
            // eslint-disable-next-line @next/next/no-img-element -- small local art
            top={<img src={asset("/treasures/gold.webp")} alt="" width={92} height={92} className="relative z-0 drop-shadow-[0_0_18px_rgba(255,214,90,0.9)]" />}
            sub={
              <p className="flex items-center gap-2 rounded-full border-[3px] border-rim bg-gradient-to-b from-parchment to-parchment-2 px-4 py-1 font-display text-lg font-bold text-ink shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element -- small local art */}
                <img src={asset("/treasures/gold.webp")} alt="" width={30} height={30} />
                {dayCount} {t.of} {DAYS} {t.treasures}
              </p>
            }
          />
        </header>

        <section className={`${parch} flex flex-col gap-3 p-4`}>
          <div className="grid grid-cols-3 gap-2.5">{REWARDS.map((r) => tile(r.world, !earned.has(r.world)))}</div>
          <Divider />
          <h2 className="text-center font-display text-xl font-black text-crimson-dark">{t.bonusTreasures}</h2>
          <div className="grid grid-cols-3 gap-3">
            {BONUS_KEYS.map((k) =>
              tile(k, !earned.has(k), !earned.has(k) && <span className="text-xs font-bold text-crimson-dark">★ {PRICES[k]} XP</span>),
            )}
          </div>
          <Divider />
          <h2 className="text-center font-display text-xl font-black text-crimson-dark">{t.massGifts}</h2>
          <p className="-mt-2 text-center text-sm text-ink-soft">{t.massGiftsNote}</p>
          <div className="grid grid-cols-3 gap-3">
            {MASS_GIFTS.map(([k, n]) =>
              tile(k, !earned.has(k), !earned.has(k) && <span className="text-xs font-bold text-crimson-dark">✝ {n} {t.daysInRow}</span>),
            )}
          </div>
        </section>

        {selPiece && sel && (
          <section className={`${parch} sticky bottom-[calc(6rem+env(safe-area-inset-bottom))] z-20 flex flex-col gap-3 p-4`} aria-live="polite">
            <div className="flex items-center gap-3">
              <TreasureArt k={sel} size={96} locked={selLocked} label={selPiece.name.en} />
              <div className="flex min-w-0 flex-1 flex-col gap-1 border-l-2 border-rim/60 pl-3">
                <h2 className="font-display text-2xl leading-tight font-black text-crimson-dark">{selPiece.name[lang]}</h2>
                <p className="leading-snug">{selPiece.desc[lang]}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {selLocked && selGift && (
                <p className="text-center text-sm font-semibold text-ink-soft">
                  {t.massGiftNeed.replace("{n}", String(selGift))}
                </p>
              )}
              {selLocked && !selBonus && !selGift && (
                <p className="text-center text-sm font-semibold text-ink-soft">
                  {t.unlockOn} {selDay}
                </p>
              )}
              {selLocked && selBonus && (
                <button type="button" className={redBtn} disabled={busy || !canBuy(prog, sel as (typeof BONUS_KEYS)[number])} onClick={() => buy(sel as (typeof BONUS_KEYS)[number])}>
                  {canBuy(prog, sel as (typeof BONUS_KEYS)[number]) ? `${t.buy} · ★ ${PRICES[sel as (typeof BONUS_KEYS)[number]]}` : t.needXp}
                </button>
              )}
              {!selLocked &&
                (selPiece.fixed ? (
                  <p className="text-center text-sm font-semibold text-[#2f7a3b]">✓ {t.inVillage}</p>
                ) : (
                  <button type="button" className={redBtn}
                    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- /play reads its query once on first render; a full load guarantees it is there
                    onClick={() => location.assign(`/play?place=${sel}`)}>
                    <VillageIcon width={26} height={26} className="text-[#f5c542]" />
                    {isPlaced(placed, sel) ? t.seeVillage : t.placeInVillage}
                  </button>
                ))}
              {error && <p role="alert" className="text-sm font-semibold text-crimson-dark">{t.error}</p>}
            </div>
          </section>
        )}

        <TabBar current="treasure" />
      </div>
    </main>
  );
}
