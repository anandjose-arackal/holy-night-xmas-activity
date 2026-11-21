"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { LangToggle } from "@/components/LangToggle";
import { LoadingScreen } from "@/components/world/Loading";
import { OrnamentIcon } from "@/components/world/OrnamentIcon";
import type { Pickable, Quality, View, WorldApi } from "@/components/world/World";
import { missions } from "@/content/missions";
import { type FullProgress, loadProgress, loadTree, saveTree, saveVillage, setChildLang } from "@/lib/data";
import { DAYS, isChristmas, isChristmasEve, openDate, todayDay } from "@/lib/game/unlock";
import { balance, massGifts } from "@/lib/game/xp";
import { useT } from "@/lib/i18n";
import {
  LIGHT_COLORS,
  MAX_ORNAMENTS,
  ORNAMENT_KINDS,
  FEATURES,
  has,
  ornamentUnlocked,
  sanitize,
  type LightColor,
  type OrnamentKind,
  type TreeState,
} from "@/lib/tree";
import { pill, redBtn } from "@/lib/ui";
import { CloseIcon, HomeIcon, PencilIcon, XpPill, roundBtn } from "@/components/day";
import { useChild } from "@/lib/useChild";
import {
  PIECES,
  STABLE_PARTS,
  TREE_NAMES,
  dayOf,
  rewardForDay,
  isPlaced,
  sanitizeLayout,
  visibleWorld,
  type PaintingKey,
  type PieceKey,
  type VillageLayout,
} from "@/lib/village/layout";

const World = dynamic(() => import("@/components/world/World"), { ssr: false });

type Panel = { t: "stable" | "star" | "menu" } | { t: "reward"; day: number };

// On Christmas the Holy Family stands in the stable for everyone, placed or not.
const HOLY: PieceKey[] = ["manger", "mary", "joseph", "baby"];

type Drag = { kind?: OrnamentKind; from?: number; x0: number; y0: number; moved: boolean; preview: number };

const browser = typeof window !== "undefined";
const chip = "inline-flex min-h-11 items-center justify-center rounded-full border-2 border-rim bg-white/70 px-4 text-sm font-semibold text-ink transition active:scale-95 disabled:opacity-40";

/** Bottom sheet on phones, side panel on wide screens. */
function Sheet({ title, onClose, closeLabel, children }: { title: string; onClose: () => void; closeLabel: string; children: ReactNode }) {
  return (
    <section
      role="dialog"
      aria-label={title}
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 flex max-h-[46dvh] flex-col gap-3 overflow-y-auto [&>*]:shrink-0 rounded-t-[1.75rem] border-x-[3px] border-t-[3px] border-rim bg-gradient-to-b from-parchment to-parchment-2 p-4 text-ink pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl backdrop-blur animate-[sheet_.3s_ease-out] motion-reduce:animate-none md:inset-x-auto md:top-20 md:right-4 md:bottom-4 md:max-h-none md:w-96 md:rounded-[1.75rem] md:border-[3px]"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-2xl font-black text-crimson-dark">{title}</h2>
        <button type="button" aria-label={closeLabel} className={roundBtn} onClick={onClose}>
          <CloseIcon width={24} height={24} strokeWidth={3} />
        </button>
      </div>
      {children}
    </section>
  );
}

export default function Play() {
  const { t, lang } = useT();
  const ctx = useChild();
  const [ready, setReady] = useState(false); // every village file loaded
  const api = useRef<WorldApi>({ pick: () => -1 });

  // ?new=8 arrives from the mission page; ?focus=tree deep-links to decorating. Read once.
  const [query] = useState(() => new URLSearchParams(browser ? location.search : ""));
  const fresh = Number(query.get("new")) || 0;
  const placeKey = query.get("place") as PieceKey | null; // from "Place in Village" on the treasure screens
  const [mode, setMode] = useState<"world" | "tree">(query.get("focus") === "tree" ? "tree" : "world");
  const [arranging, setArranging] = useState(false); // moving and turning pieces
  // Arriving from a finished task (?place= / ?new=) opens on the whole village; the new piece pops in place, no zoom.
  const [view, setView] = useState<View>(() => (mode === "tree" ? "tree" : "home"));
  const [panel, setPanel] = useState<Panel | null>(fresh ? { t: "reward", day: fresh } : null);
  const [reducedMotion] = useState(() => browser && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [quality, setQuality] = useState<Quality>(() => {
    if (!browser) return "balanced";
    const saved = localStorage.getItem("quality");
    if (saved === "low" || saved === "balanced" || saved === "high") return saved;
    return (navigator.hardwareConcurrency ?? 8) <= 4 ? "low" : "balanced";
  });

  // ----- Christmas tree -----
  const [tree, setTree] = useState<TreeState | null>(null);
  const [history, setHistory] = useState<TreeState[]>([]);
  const dirty = useRef(false);
  const [save, setSave] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [armed, setArmed] = useState<OrnamentKind | null>(null);
  const [selected, setSelected] = useState(-1);
  const drag = useRef<Drag | null>(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<{ anchor: number; kind: OrnamentKind } | null>(null);
  const [ghost, setGhost] = useState<{ x: number; y: number; kind: OrnamentKind } | null>(null);
  const [finaleSeen, setFinaleSeen] = useState(() => (browser ? localStorage.getItem("finale") : null));
  const setApi = useCallback((patch: Partial<WorldApi>) => {
    Object.assign(api.current, patch);
  }, []);

  const child = ctx?.child;
  const days = child?.days;
  const [prog, setProg] = useState<FullProgress | null>(null);
  const [layout, setLayout] = useState<VillageLayout>({ tall: {}, wide: {} });
  const layoutDirty = useRef(false);
  const christmasNow = !!ctx && isChristmas(ctx.campaign);
  useEffect(() => {
    if (!child) return;
    loadProgress(child).then(async (p) => {
      setProg(p);
      const unlocked = new Set<PieceKey>([...visibleWorld(p.taskDays, christmasNow), ...p.bonus, ...massGifts(p.massOnTimeDays)]);
      const l = sanitizeLayout(p.layout, unlocked);
      // Arriving from "Place in Village": stand the treasure on its default spot.
      if (placeKey && unlocked.has(placeKey) && !isPlaced(l, placeKey) && !PIECES[placeKey].fixed) {
        for (const k of ["tall", "wide"] as const) l[k][placeKey] = [...PIECES[placeKey].spot[k], 0];
        layoutDirty.current = true;
      }
      setLayout(l);
      // A failed load leaves the tree unset (nothing to save over), never an empty tree that would replace the saved one.
      try {
        setTree(sanitize(await loadTree(child.id), p.readDays));
      } catch {
        setSave("error");
      }
    });
  }, [child, christmasNow, placeKey]);
  // Saves wait 0.7 s after the last change; one still waiting when the page closes runs then, never dropped.
  const pendingSaves = useRef<{ village?: () => void; tree?: () => void }>({});
  useEffect(() => () => Object.values(pendingSaves.current).forEach((run) => run?.()), []);
  const [villageError, setVillageError] = useState(false);
  useEffect(() => {
    if (!child || !layoutDirty.current) return;
    const run = () => {
      pendingSaves.current.village = undefined;
      saveVillage(child.id, layout).then(
        () => setVillageError(false),
        () => setVillageError(true),
      );
    };
    pendingSaves.current.village = run;
    const id = setTimeout(run, 700);
    return () => clearTimeout(id);
  }, [layout, child]);
  const movePiece = useCallback((key: PieceKey, at: [number, number, number], k: PaintingKey) => {
    layoutDirty.current = true;
    setLayout((l) => ({ ...l, [k]: { ...l[k], [key]: at } }));
  }, []);

  const persist = useCallback(
    (state: TreeState) => {
      if (!child) return;
      setSave("saving");
      saveTree(child.id, state).then(
        () => setSave("saved"),
        () => setSave("error"), // never show "saved" for a write that did not land
      );
    },
    [child],
  );
  useEffect(() => {
    if (!tree || !dirty.current) return;
    const run = () => {
      pendingSaves.current.tree = undefined;
      persist(tree);
    };
    pendingSaves.current.tree = run;
    const id = setTimeout(run, 700);
    return () => clearTimeout(id);
  }, [tree, persist]);

  const change = useCallback(
    (next: (s: TreeState) => TreeState) => {
      if (!tree) return;
      setHistory((h) => [...h.slice(-29), tree]);
      dirty.current = true;
      setTree(next(tree));
    },
    [tree],
  );
  const place = useCallback(
    (k: OrnamentKind, a: number) =>
      change((s) => (a < 0 || s.items.length >= MAX_ORNAMENTS || s.items.some((i) => i.a === a) ? s : { ...s, items: [...s.items, { k, a }] })),
    [change],
  );

  // Drag and drop: from the tray (kind) or an ornament already on the tree (from). One pointer listener serves both.
  const startDrag = useCallback((e: { clientX: number; clientY: number }, d: { kind?: OrnamentKind; from?: number }) => {
    drag.current = { ...d, x0: e.clientX, y0: e.clientY, moved: false, preview: -1 };
    setDragging(true);
  }, []);
  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => {
      const d = drag.current!;
      if (Math.hypot(e.clientX - d.x0, e.clientY - d.y0) > 8) d.moved = true;
      if (!d.moved) return;
      d.preview = api.current.pick(e.clientX, e.clientY, d.from);
      const kind = d.kind ?? tree?.items.find((i) => i.a === d.from)?.k;
      setPreview(d.preview >= 0 && kind ? { anchor: d.preview, kind } : null);
      setGhost(d.kind ? { x: e.clientX, y: e.clientY, kind: d.kind } : null);
    };
    const end = (e: PointerEvent) => {
      const d = drag.current!;
      if (e.type === "pointerup") {
        if (!d.moved) {
          if (d.kind) setArmed((k) => (k === d.kind ? null : d.kind!));
          else setSelected((a) => (a === d.from ? -1 : d.from!));
        } else if (d.preview >= 0) {
          if (d.kind) place(d.kind, d.preview);
          else change((s) => ({ ...s, items: s.items.map((i) => (i.a === d.from ? { ...i, a: d.preview } : i)) }));
          setSelected(-1);
        }
      }
      drag.current = null;
      setDragging(false);
      setPreview(null);
      setGhost(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [dragging, tree, place, change]);

  const home = useCallback(() => {
    setMode("world");
    setPanel(null);
    setView("home");
    setArmed(null);
    setSelected(-1);
  }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === "Escape" && home();
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [home]);

  const campaign = ctx?.campaign;

  if (!ctx || !child || !days || !campaign || !prog) return <LoadingScreen stage="data" />;
  const readDays = prog.readDays;
  const unlocked = new Set<PieceKey>([...visibleWorld(days, isChristmas(campaign)), ...prog.bonus, ...massGifts(prog.massOnTimeDays)]);
  const shown = [...unlocked].filter((k) => !PIECES[k].fixed && (isPlaced(layout, k) || (isChristmas(campaign) && HOLY.includes(k))));
  // The Baby Jesus model lies in his own manger, so the empty manger steps aside once he is in the village.
  const pieces = shown.includes("baby") ? shown.filter((k) => k !== "manger") : shown;

  const today = todayDay(campaign);
  const christmas = isChristmas(campaign);
  const finale = christmas && finaleSeen !== campaign.christmas; // Christmas morning: the reveal shows once per season
  const todayOpen = today >= 1 && !days.includes(today);
  const dateLabel = (ymd: string) =>
    new Intl.DateTimeFormat(lang === "ml" ? "ml-IN" : "en-IN", { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(ymd));

  function enterTree() {
    setMode("tree");
    setPanel(null);
    setView("tree");
  }
  function go(what: Pickable) {
    if (mode === "tree") return;
    if (what === "tree") return enterTree();
    setView(what);
    setPanel({ t: what });
  }

  const unlockedKinds = ORNAMENT_KINDS.filter((k) => ornamentUnlocked(k, readDays));
  const full = (tree?.items.length ?? 0) >= MAX_ORNAMENTS;
  const latest = missions.find((m) => m.day === Math.max(today, 1))!;
  const reward = panel?.t === "reward" ? rewardForDay(panel.day) : undefined;

  return (
    <main className="relative h-dvh overflow-hidden select-none">
      {!ready && <LoadingScreen stage="assets" />}
      <div className="absolute inset-0">
        <World
          onReady={() => setReady(true)}
          readDays={readDays}
          christmas={christmas}
          eve={isChristmasEve(campaign)}
          view={finale ? "stable" : view}
          mode={mode}
          fresh={placeKey ?? rewardForDay(fresh)?.world ?? null}
          arranging={arranging && mode === "world"}
          pieces={pieces}
          layout={layout}
          showTree={unlocked.has("tree")}
          showStar={unlocked.has("star")}
          onMove={movePiece}
          quality={quality}
          reducedMotion={reducedMotion}
          controlsEnabled={!dragging}
          tree={tree}
          selected={selected}
          preview={preview}
          onApi={setApi}
          onPick={go}
          onMiss={() => mode === "world" && panel && home()}
          onTreeTap={(a) => {
            if (armed && a >= 0) place(armed, a);
            else setSelected(-1);
          }}
          onOrnamentDown={(a, e) => startDrag(e, { from: a })}
          fallback={
            <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
              <p>{t.noWebgl}</p>
              <Link href="/calendar" className={redBtn}>
                {t.calendar}
              </Link>
            </div>
          }
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between">
        <header className="pointer-events-auto flex items-center justify-between gap-2 p-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <Link href="/home" className={`${pill} min-w-0 px-3 text-sm`} aria-label={t.dashboard}>
            {/* truncate on the flex pill itself clips both ends; the inner span gets a proper ellipsis */}
            <span className="truncate">{child.nickname}</span>
          </Link>
          <p className={`${pill} px-3 text-sm`} aria-label={`${t.completed}: ${days.length}/${DAYS}`}>
            ★ {days.length}/{DAYS}
          </p>
          <XpPill xp={balance(prog)} className="self-center text-sm" />
          <LangToggle className="px-2 text-xs" onChange={(l) => setChildLang(child.id, l).catch(() => {})} />
        </header>
        {villageError && (
          <p role="alert" className="pointer-events-auto absolute top-[calc(3.5rem+env(safe-area-inset-top))] left-1/2 -translate-x-1/2 rounded-full bg-crimson px-4 py-1 text-sm font-semibold whitespace-nowrap text-white shadow">
            {t.saveFailed}
          </p>
        )}

        {mode === "world" && !panel && !finale && arranging && (
          <nav className="pointer-events-auto mx-auto flex w-full max-w-md items-center gap-2 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <p className="min-w-0 flex-1 rounded-full bg-black/55 px-4 py-2 text-center text-sm font-semibold text-white">{t.arrangeHint}</p>
            <button type="button" className={redBtn} onClick={() => setArranging(false)}>
              ✓ {t.arrangeDone}
            </button>
          </nav>
        )}
        {mode === "world" && !panel && !finale && !arranging && (
          <nav className="pointer-events-auto mx-auto flex w-full max-w-md items-center gap-2 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <Link href="/home" aria-label={t.home} className={roundBtn}>
              <HomeIcon width={24} height={24} strokeWidth={2.5} />
            </Link>
            {pieces.length > 0 && (
              <button type="button" aria-label={t.arrange} title={t.arrange} className={roundBtn} onClick={() => setArranging(true)}>
                <PencilIcon width={22} height={22} strokeWidth={2.5} />
              </button>
            )}
            <button type="button" className={pill} onClick={() => setPanel({ t: "menu" })}>
              {t.menu}
            </button>
            <Link href="/treasure" className={`${pill} flex-1`}>
              {t.treasure}
            </Link>
            {todayOpen ? (
              <Link href={`/day/${today}`} className={`${redBtn} flex-1`}>
                {t.todayMission}
              </Link>
            ) : (
              today === 0 && (
                <p className="flex-1 content-center text-center text-sm">
                  {t.begins} {dateLabel(campaign.start)}
                </p>
              )
            )}
          </nav>
        )}
      </div>

      {/* ----- contextual panels ----- */}
      {mode === "world" && panel?.t === "menu" && (
        <Sheet title={t.places} onClose={home} closeLabel={t.close}>
          <div className="grid grid-cols-2 gap-2">
            {(["stable", "star"] as const).map((p) => (
              <button key={p} type="button" className={chip} onClick={() => go(p)}>
                {t[p]}
              </button>
            ))}
            {unlocked.has("tree") && (
              <button type="button" className={chip} onClick={() => go("tree")}>
                {t.tree}
              </button>
            )}
            <Link href="/calendar" className={chip}>
              {t.calendar}
            </Link>
          </div>
          <fieldset>
            <legend className="text-sm text-ink-soft">{t.quality}</legend>
            <div className="mt-1 flex gap-2">
              {(["low", "balanced", "high"] as const).map((q) => (
                <button
                  key={q}
                  type="button"
                  aria-pressed={quality === q}
                  className={`${chip} flex-1 aria-pressed:border-crimson aria-pressed:bg-crimson aria-pressed:text-white`}
                  onClick={() => {
                    localStorage.setItem("quality", q);
                    setQuality(q);
                  }}
                >
                  {t[q]}
                </button>
              ))}
            </div>
          </fieldset>
        </Sheet>
      )}

      {mode === "world" && panel?.t === "stable" && (
        <Sheet title={t.stableProgress} onClose={home} closeLabel={t.close}>
          <ul className="flex flex-col gap-1">
            {STABLE_PARTS.map((k) => {
              const day = dayOf(k);
              const done = unlocked.has(k);
              return (
                <li key={k} className="flex items-center justify-between gap-2 rounded-xl bg-white/60 px-3 py-2">
                  <span className={done ? "font-semibold text-crimson-dark" : ""}>
                    {done ? "✓ " : "○ "}
                    {PIECES[k].name[lang]}
                  </span>
                  {!done &&
                    (k === "baby" ? (
                      <span className="text-sm text-ink-soft">{t.waitsForChristmas}</span>
                    ) : day <= today ? (
                      <Link href={`/day/${day}`} className="min-h-11 content-center text-sm underline">
                        {t.day} {day}
                      </Link>
                    ) : (
                      <span className="text-sm text-ink-soft">
                        {t.day} {day} · {dateLabel(openDate(day, campaign))}
                      </span>
                    ))}
                </li>
              );
            })}
          </ul>
        </Sheet>
      )}

      {mode === "world" && panel?.t === "star" && (
        <Sheet title={t.todayScripture} onClose={home} closeLabel={t.close}>
          {today === 0 ? (
            <p>
              {t.begins} {dateLabel(campaign.start)}
            </p>
          ) : (
            <>
              <p className="text-lg font-semibold">{latest[lang].ref}</p>
              <p>{latest[lang].reflection}</p>
              <Link href={`/day/${latest.day}`} className={redBtn}>
                {t.openDay} {latest.day}
              </Link>
            </>
          )}
        </Sheet>
      )}

      {mode === "world" && reward && (
        <Sheet title={t.newGift} onClose={home} closeLabel={t.close}>
          <p>
            <span className="text-sm text-ink-soft">{t.inBethlehem}</span>
            <br />
            <span className="text-lg font-semibold">{PIECES[reward.world].name[lang]}</span>
            {reward.world === "baby" && !christmas && <span className="text-sm"> — {t.waitsForChristmas}</span>}
          </p>
          <p>
            <span className="text-sm text-ink-soft">{t.forTree}</span>
            <br />
            <span className="text-lg font-semibold">{TREE_NAMES[reward.tree][lang]}</span>
          </p>
          <button type="button" className={redBtn} onClick={enterTree}>
            {t.decorate}
          </button>
        </Sheet>
      )}

      {finale && (
        <section
          role="dialog"
          aria-label={t.christmasTitle}
          className="pointer-events-auto absolute inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-md flex-col gap-3 rounded-[1.75rem] border-[3px] border-rim bg-gradient-to-b from-parchment to-parchment-2 p-5 text-center text-ink shadow-2xl backdrop-blur"
        >
          <h2 className="font-display text-3xl font-black text-crimson-dark">{t.christmasTitle}</h2>
          <p className="text-lg">{t.christmasText}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`${redBtn} flex-1`}
              onClick={() => {
                localStorage.setItem("finale", campaign.christmas);
                setFinaleSeen(campaign.christmas);
                home();
              }}
            >
              {t.enter}
            </button>
          </div>
        </section>
      )}

      {/* ----- tree decoration mode ----- */}
      {mode === "tree" && tree && (
        <Sheet title={t.decorate} onClose={home} closeLabel={t.finish}>
          <p className="text-sm text-ink-soft" role="status">
            {full ? t.treeFull : armed ? t.placing : unlockedKinds.length ? t.howToPlace : t.noOrnaments}
          </p>
          {unlockedKinds.length > 0 && (
            <ul className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap" aria-label={t.ornaments}>
              {unlockedKinds.map((k) => (
                <li key={k}>
                  <button
                    type="button"
                    aria-pressed={armed === k}
                    aria-label={TREE_NAMES[k][lang]}
                    title={TREE_NAMES[k][lang]}
                    disabled={full}
                    className="flex size-14 touch-none items-center justify-center rounded-2xl border-2 border-rim bg-white/80 aria-pressed:border-crimson aria-pressed:ring-2 aria-pressed:ring-crimson disabled:opacity-40"
                    onPointerDown={(e) => startDrag(e, { kind: k })}
                    onClick={(e) => e.detail === 0 && setArmed((a) => (a === k ? null : k))} // keyboard
                  >
                    <OrnamentIcon kind={k} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {selected >= 0 && (
              <button
                type="button"
                className={`${chip} border-crimson text-crimson`}
                onClick={() => {
                  change((s) => ({ ...s, items: s.items.filter((i) => i.a !== selected) }));
                  setSelected(-1);
                }}
              >
                {t.remove}
              </button>
            )}
            <button
              type="button"
              className={chip}
              disabled={!history.length}
              onClick={() => {
                const prev = history.at(-1);
                if (!prev) return;
                setHistory((h) => h.slice(0, -1));
                dirty.current = true;
                setSelected(-1);
                setTree(prev);
              }}
            >
              {t.undo}
            </button>
            <button
              type="button"
              className={chip}
              disabled={!tree.items.length}
              onClick={() => confirm(t.confirmReset) && change((s) => ({ ...s, items: [] }))}
            >
              {t.reset}
            </button>
          </div>

          {has(readDays, FEATURES.lights) && (
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" aria-pressed={tree.lights} className={chip} onClick={() => change((s) => ({ ...s, lights: !s.lights }))}>
                {t.lights}: {tree.lights ? t.on : t.off}
              </button>
              {(Object.keys(LIGHT_COLORS) as LightColor[])
                .filter((c) => has(readDays, LIGHT_COLORS[c]))
                .map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={tree.color === c}
                    className={`${chip} aria-pressed:border-crimson aria-pressed:bg-crimson aria-pressed:text-white`}
                    onClick={() => change((s) => ({ ...s, color: c, lights: true }))}
                  >
                    {t[c]}
                  </button>
                ))}
            </div>
          )}

          <p role="status" className="min-h-6 text-sm">
            {save === "saving" && t.saving}
            {save === "saved" && <span className="font-semibold text-[#2f7a3b]">✓ {t.saved}</span>}
            {save === "error" && (
              <>
                <span className="text-crimson">{t.saveFailed}</span>{" "}
                <button type="button" className="min-h-11 underline" onClick={() => persist(tree)}>
                  {t.retry}
                </button>
              </>
            )}
          </p>
        </Sheet>
      )}

      {ghost && (
        <div className="pointer-events-none fixed z-40 -translate-x-1/2 -translate-y-1/2" style={{ left: ghost.x, top: ghost.y }}>
          <OrnamentIcon kind={ghost.kind} />
        </div>
      )}
    </main>
  );
}
