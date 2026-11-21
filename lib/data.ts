import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Lang } from "@/content/missions";
import { type Campaign, DEFAULT_CAMPAIGN, isOpen, localDate, now, openDate } from "@/lib/game/unlock";
import { MASS_HOME, XP, canBuy, earned, type Progress, type Step } from "@/lib/game/xp";
import type { PrayerSet } from "@/content/prayers";
import { hasBig, prayXp, repsOf } from "@/lib/voice/accumulator";
import type { TreeState } from "@/lib/tree";
import type { BonusKey, VillageLayout } from "@/lib/village/layout";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** null = demo mode: no keys configured, progress lives in this browser only. */
// Kept on globalThis so a development reload reuses it (two clients fight over the same sign-in).
const g = globalThis as { __supabase?: SupabaseClient };
export const supabase = url && anon ? (g.__supabase ??= createClient(url, anon)) : null;

export type Child = {
  id: string;
  nickname: string;
  avatar_key: string;
  lang: Lang;
  days: number[]; // days whose task is done
  parish_id?: string | null; // a shakha id
  on_leaderboard?: boolean;
};

const KEY = "demo-children";
const readLocal = (): Child[] => JSON.parse(localStorage.getItem(KEY) ?? "[]");
const writeLocal = (c: Child[]) => localStorage.setItem(KEY, JSON.stringify(c));

export async function signedIn(): Promise<boolean> {
  if (!supabase) return true;
  return !!(await supabase.auth.getSession()).data.session;
}

let campaign: Promise<Campaign> | null = null;

/** The active season. Dates live in the database so a new Advent needs no code change. */
export function getCampaign(): Promise<Campaign> {
  if (!supabase) return Promise.resolve(DEFAULT_CAMPAIGN);
  const db = supabase;
  return (campaign ??= (async () => {
    const { data, error } = await db
      .from("advent_campaigns")
      .select("id, start_date, christmas_date, tz")
      .eq("active", true)
      .single();
    if (error) {
      campaign = null; // let the next call retry
      throw error;
    }
    return { id: data.id, start: data.start_date, christmas: data.christmas_date, tz: data.tz };
  })());
}

export async function listChildren(): Promise<Child[]> {
  if (!supabase) return readLocal();
  const { id } = await getCampaign();
  const { data, error } = await supabase
    .from("children")
    .select("id, nickname, avatar_key, lang, parish_id, on_leaderboard, completions(day, campaign_id)")
    .order("created_at");
  if (error) throw error;
  return data.map(({ completions, ...c }) => ({
    ...c,
    days: (completions as { day: number; campaign_id: number }[]).filter((x) => x.campaign_id === id).map((x) => x.day),
  })) as Child[];
}

/** Returns the new child's id. */
export async function addChild(nickname: string, avatar_key: string, lang: Lang, parish_id: string | null = null): Promise<string> {
  nickname = nickname.trim().slice(0, 60);
  if (!nickname) throw new Error("nickname required");
  if (!supabase) {
    // randomUUID exists only on https or localhost; a phone testing over the LAN uses plain http.
    const id = crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    writeLocal([...readLocal(), { id, nickname, avatar_key, lang, parish_id, days: [] }]);
    return id;
  }
  const { data, error } = await supabase.from("children").insert({ nickname, avatar_key, lang, parish_id }).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function removeChild(id: string) {
  if (!supabase) {
    localStorage.removeItem(`tree-${id}`);
    localStorage.removeItem(progressKey(id));
    return writeLocal(readLocal().filter((c) => c.id !== id));
  }
  const { error } = await supabase.from("children").delete().eq("id", id);
  if (error) throw error;
}

export async function setChildLang(id: string, lang: Lang) {
  if (!supabase) return writeLocal(readLocal().map((c) => (c.id === id ? { ...c, lang } : c)));
  const { error } = await supabase.from("children").update({ lang }).eq("id", id);
  if (error) throw error;
}

/** Safe to call twice: the database (or the Set below) keeps one completion per day. */
export async function completeMission(id: string, day: number) {
  if (!supabase) {
    if (!isOpen(day)) throw new Error("day locked");
    const p = readProgress(id);
    writeProgress(id, { ...p, taskDates: { [day]: now().toISOString(), ...p.taskDates } }); // first completion wins
    return writeLocal(
      readLocal().map((c) => (c.id === id ? { ...c, days: [...new Set([...c.days, day])] } : c)),
    );
  }
  const { error } = await supabase.rpc("complete_mission", { p_child: id, p_day: day });
  if (error) throw error;
}

/** The saved tree as stored; pass it through sanitize() before use. */
export async function loadTree(childId: string): Promise<unknown> {
  if (!supabase) return JSON.parse(localStorage.getItem(`tree-${childId}`) ?? "null");
  const { id } = await getCampaign();
  const { data, error } = await supabase
    .from("tree_decorations")
    .select("data")
    .eq("child_id", childId)
    .eq("campaign_id", id)
    .maybeSingle();
  if (error) throw error;
  return data?.data ?? null;
}

/** The database re-checks every ornament against the child's completed days. */
export async function saveTree(childId: string, state: TreeState) {
  if (!supabase) return localStorage.setItem(`tree-${childId}`, JSON.stringify(state));
  const { error } = await supabase.rpc("save_tree", { p_child: childId, p_data: state });
  if (error) throw error;
}

export async function signOut() {
  await supabase?.auth.signOut();
  localStorage.removeItem("child");
}

export async function deleteAccount() {
  if (!supabase) {
    localStorage.removeItem(KEY);
  } else {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    const res = await fetch("/api/delete-account", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("delete failed");
  }
  await signOut();
}

// ---- Day steps, XP, the village layout and the leaderboard ----

/** Demo-mode record of everything except task days (those live on the child, as before). */
type LocalProgress = {
  read: number[];
  mass: number[];
  story: number[];
  taskDates: Record<number, string>;
  massDates: Record<number, string>;
  massXp: Record<number, number>;
  prayXp: Record<number, number>;
  prayVoice: number[];
  bonus: BonusKey[];
  layout: unknown;
};
const progressKey = (id: string) => `progress-${id}`;
const readProgress = (id: string): LocalProgress => ({
  read: [],
  mass: [],
  story: [],
  taskDates: {},
  massDates: {},
  massXp: {},
  prayXp: {},
  prayVoice: [],
  bonus: [],
  layout: null,
  ...JSON.parse(localStorage.getItem(progressKey(id)) ?? "{}"),
});
const writeProgress = (id: string, p: LocalProgress) => localStorage.setItem(progressKey(id), JSON.stringify(p));

export type FullProgress = Progress & { layout: unknown };

/** A task (or Mass) counts towards its streak only when it was done on the date its day opened. */
const onTime = (day: number, at: string | undefined, c: Campaign) => !!at && localDate(new Date(at), c.tz) === openDate(day, c);

export async function loadProgress(child: Child): Promise<FullProgress> {
  const c = await getCampaign();
  if (!supabase) {
    const p = readProgress(child.id);
    return {
      taskDays: child.days,
      readDays: p.read,
      massDays: p.mass,
      storyDays: p.story,
      onTimeDays: child.days.filter((d) => onTime(d, p.taskDates[d], c)),
      massOnTimeDays: p.mass.filter((d) => onTime(d, p.massDates[d], c)),
      massXp: p.massXp,
      prayXp: p.prayXp,
      prayVoiceDays: p.prayVoice,
      bonus: p.bonus,
      layout: p.layout,
    };
  }
  const by = <T,>(q: PromiseLike<{ data: T[] | null; error: unknown }>) =>
    Promise.resolve(q).then(({ data, error }) => {
      if (error) throw error;
      return data ?? [];
    });
  const [tasks, steps, bonus, layout] = await Promise.all([
    by<{ day: number; completed_at: string }>(supabase.from("completions").select("day, completed_at").eq("child_id", child.id).eq("campaign_id", c.id!)),
    by<{ day: number; step: Step | "pray"; done_at: string; xp: number | null; speech_seconds: number | null }>(supabase.from("day_steps").select("day, step, done_at, xp, speech_seconds").eq("child_id", child.id).eq("campaign_id", c.id!)),
    by<{ item: BonusKey }>(supabase.from("bonus_unlocks").select("item").eq("child_id", child.id).eq("campaign_id", c.id!)),
    by<{ data: unknown }>(supabase.from("village_layout").select("data").eq("child_id", child.id).eq("campaign_id", c.id!)),
  ]);
  const of = (s: Step) => steps.filter((x) => x.step === s).map((x) => x.day);
  const xpOf = (s: Step | "pray") => Object.fromEntries(steps.filter((x) => x.step === s && x.xp != null).map((x) => [x.day, x.xp!]));
  return {
    taskDays: tasks.map((t) => t.day),
    readDays: of("read"),
    massDays: of("mass"),
    storyDays: of("story"),
    onTimeDays: tasks.filter((t) => onTime(t.day, t.completed_at, c)).map((t) => t.day),
    massOnTimeDays: steps.filter((x) => x.step === "mass" && onTime(x.day, x.done_at, c)).map((x) => x.day),
    massXp: xpOf("mass"),
    prayXp: xpOf("pray"),
    prayVoiceDays: steps.filter((x) => x.step === "pray" && x.speech_seconds != null).map((x) => x.day),
    bonus: bonus.map((b) => b.item),
    layout: layout[0]?.data ?? null,
  };
}

/** Read, Mass or Story for a day. Safe to call twice. The task step is completeMission(). `church`: Mass in church (30 XP) or at home (15). */
export async function completeStep(id: string, day: number, step: Exclude<Step, "task">, church = false) {
  if (!supabase) {
    if (!isOpen(day)) throw new Error("day locked");
    const p = readProgress(id);
    const first = step === "mass" && !p.mass.includes(day); // first tick wins
    const massDates = first ? { ...p.massDates, [day]: now().toISOString() } : p.massDates;
    const massXp = first ? { ...p.massXp, [day]: church ? XP.mass : MASS_HOME } : p.massXp;
    return writeProgress(id, { ...p, [step]: [...new Set([...p[step], day])], massDates, massXp });
  }
  const { error } = await supabase.rpc("complete_step", { p_child: id, p_day: day, p_step: step, p_church: church });
  if (error) throw error;
}

/** A day's prayer set (Pray now). `speechSeconds` only when the voice check passed; the server prices it. Returns the XP. */
export async function completePrayer(id: string, day: number, set: PrayerSet, speechSeconds: number | null) {
  const xp = prayXp(set, speechSeconds != null);
  if (!supabase) {
    if (!isOpen(day)) throw new Error("day locked");
    const p = readProgress(id);
    if (p.prayXp[day] != null && (p.prayVoice.includes(day) || speechSeconds == null)) return p.prayXp[day]; // pays once; voice may upgrade a manual tick
    writeProgress(id, { ...p, prayXp: { ...p.prayXp, [day]: xp }, prayVoice: speechSeconds == null ? p.prayVoice : [...p.prayVoice, day] });
    return xp;
  }
  const { error } = await supabase.rpc("complete_prayer", {
    p_child: id,
    p_day: day,
    p_reps: repsOf(set),
    p_big: hasBig(set),
    p_speech_seconds: speechSeconds == null ? null : Math.min(600, Math.round(speechSeconds)),
  });
  if (error) throw error;
  return xp;
}

/** The database re-counts the child's XP before it allows a purchase. */
export async function buyBonus(child: Child, item: BonusKey) {
  if (!supabase) {
    const p = await loadProgress(child);
    if (!canBuy(p, item)) throw new Error("not enough XP");
    const local = readProgress(child.id);
    return writeProgress(child.id, { ...local, bonus: [...local.bonus, item] });
  }
  const { error } = await supabase.rpc("buy_bonus", { p_child: child.id, p_item: item });
  if (error) throw error;
}

/** The database keeps only pieces the child has unlocked. */
export async function saveVillage(id: string, layout: VillageLayout) {
  if (!supabase) return writeProgress(id, { ...readProgress(id), layout });
  const { error } = await supabase.rpc("save_village", { p_child: id, p_data: layout });
  if (error) throw error;
}

/** Diocese -> meghala -> parish (fest_hub's dioceses, meghalas and shakhas, read-only here). */
export type Region = { id: string; name: string; parent: string | null };
export type Regions = { dioceses: Region[]; meghalas: Region[] };

const DEMO_REGIONS: Regions & { parishes: Region[] } = {
  dioceses: [
    { id: "d1", name: "Mananthavady", parent: null },
    { id: "d2", name: "Thamarassery", parent: null },
  ],
  meghalas: [
    { id: "m1", name: "Kalpetta", parent: "d1" },
    { id: "m2", name: "Mananthavady", parent: "d1" },
    { id: "m3", name: "Kodenchery", parent: "d2" },
  ],
  parishes: [
    { id: "p1", name: "St. Mary's", parent: "m1" },
    { id: "p2", name: "St. Joseph's", parent: "m1" },
    { id: "p3", name: "St. Thomas", parent: "m2" },
    { id: "p4", name: "St. George", parent: "m3" },
  ],
};

/** Dioceses and meghalas (a few hundred rows at most). Parishes are many, so they load per meghala. */
let regionsCache: Promise<Regions> | null = null;
export function listRegions(): Promise<Regions> {
  if (!supabase) return Promise.resolve(DEMO_REGIONS);
  const db = supabase;
  regionsCache ??= (async () => {
    const [d, m] = await Promise.all([
      db.from("dioceses").select("id, name").order("name"),
      db.from("meghalas").select("id, name, diocese_id").order("name"),
    ]);
    const err = d.error ?? m.error;
    if (err) throw err;
    return {
      dioceses: (d.data ?? []).map((r) => ({ id: r.id, name: r.name, parent: null })),
      meghalas: (m.data ?? []).map((r) => ({ id: r.id, name: r.name, parent: r.diocese_id })),
    };
  })().catch((e) => {
    regionsCache = null; // try again next time
    throw e;
  });
  return regionsCache;
}

/** The parishes of one meghala. */
export async function listParishes(meghalaId: string): Promise<Region[]> {
  if (!supabase) return DEMO_REGIONS.parishes.filter((p) => p.parent === meghalaId);
  const { data, error } = await supabase.from("shakhas").select("id, name, meghala_id").eq("meghala_id", meghalaId).order("name");
  if (error) throw error;
  return (data ?? []).map((r) => ({ id: r.id, name: r.name, parent: r.meghala_id }));
}

export type RegionLevel = "diocese" | "meghala" | "parish";

/**
 * Adds a missing diocese, meghala or parish (fest_hub's tables, via add_region in 004_add_region.sql) and returns its id.
 * The same name under the same parent returns the existing one. Throws { code: "23505" } when the name is used elsewhere.
 */
export async function addRegion(level: RegionLevel, name: string, parent: string | null): Promise<string> {
  if (!supabase) {
    const list = level === "diocese" ? DEMO_REGIONS.dioceses : level === "meghala" ? DEMO_REGIONS.meghalas : DEMO_REGIONS.parishes;
    const nm = name.trim().replace(/\s+/g, " ");
    const hit = list.find((r) => r.name.toLowerCase() === nm.toLowerCase());
    if (hit && (level === "diocese" || hit.parent === parent)) return hit.id;
    if (hit) throw Object.assign(new Error("name already used elsewhere"), { code: "23505" });
    const id = `${level[0]}${Date.now().toString(36)}`;
    list.push({ id, name: nm, parent: level === "diocese" ? null : parent });
    return id;
  }
  const { data, error } = await supabase.rpc("add_region", { p_level: level, p_name: name, p_parent: parent });
  if (error) throw error;
  if (level !== "parish") regionsCache = null; // the lists above changed
  return data as string;
}

/** One parish, for its name and to start the pickers at it. */
export async function getParish(id: string | null | undefined): Promise<Region | null> {
  if (!id) return null;
  if (!supabase) return DEMO_REGIONS.parishes.find((p) => p.id === id) ?? null;
  const { data, error } = await supabase.from("shakhas").select("id, name, meghala_id").eq("id", id).maybeSingle();
  if (error) throw error;
  return data && { id: data.id, name: data.name, parent: data.meghala_id };
}

/** The parish and whether the child's nickname may appear on the leaderboard. A parent's choice, off by default. */
export async function setChildParish(id: string, parish_id: string | null) {
  if (!supabase) return writeLocal(readLocal().map((c) => (c.id === id ? { ...c, parish_id } : c)));
  const { error } = await supabase.from("children").update({ parish_id }).eq("id", id);
  if (error) throw error;
}

export type BoardRow = { rank: number; nickname: string; avatar: string | null; parish: string | null; xp: number; me: boolean };

/**
 * Opted-in children by XP, plus the asking child's own row (listed or not) so they can see their rank.
 * Only nickname, parish and XP leave the database.
 */
export async function leaderboard(child: Child, scope: "parish" | "all"): Promise<BoardRow[]> {
  if (!supabase) {
    const rows = await Promise.all(
      readLocal()
        .filter((c) => c.id === child.id || (scope === "all" || c.parish_id === child.parish_id))
        .map(async (c) => ({
          nickname: c.nickname,
          avatar: c.avatar_key,
          parish: (await getParish(c.parish_id))?.name ?? null,
          xp: earned(await loadProgress(c)),
          me: c.id === child.id,
        })),
    );
    rows.sort((a, b) => b.xp - a.xp);
    return rows.map((r) => ({ ...r, rank: rows.findIndex((x) => x.xp === r.xp) + 1 })); // ties share a rank, as in SQL
  }
  const { data, error } = await supabase.rpc("leaderboard", { p_child: child.id, p_scope: scope });
  if (error) throw error;
  return data as BoardRow[];
}
