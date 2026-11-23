// Christmas tree: which decorations unlock on which day, where they may hang, and what a saved tree looks like.
// The day numbers here are mirrored in supabase/migrations/002_campaign_tree.sql (save_tree). Change both together.

export type Shape = "ball" | "bell" | "bow" | "star" | "snowflake" | "crook" | "sheep" | "angel" | "dove";

export const ORNAMENTS = {
  red: { day: 3, shape: "ball", color: "#b02a32" },
  gold: { day: 4, shape: "ball", color: "#d6a443" },
  ribbon: { day: 5, shape: "bow", color: "#9e2438" },
  bell: { day: 6, shape: "bell", color: "#d4a24a" },
  green: { day: 8, shape: "ball", color: "#2f7a4f" },
  white: { day: 9, shape: "ball", color: "#f3ede2" },
  star: { day: 11, shape: "star", color: "#e8c46a" },
  blue: { day: 12, shape: "ball", color: "#3a5f9e" },
  snowflake: { day: 13, shape: "snowflake", color: "#eef4ff" },
  shepherd: { day: 15, shape: "crook", color: "#8a5a32" },
  wood: { day: 16, shape: "star", color: "#a86a3c" },
  silverstar: { day: 17, shape: "star", color: "#dfe3ea" },
  rubyball: { day: 18, shape: "ball", color: "#8e1b3a" },
  sheep: { day: 19, shape: "sheep", color: "#f4efe6" },
  silverbell: { day: 20, shape: "bell", color: "#c9ccd4" },
  angel: { day: 21, shape: "angel", color: "#f6eedc" },
  blueribbon: { day: 22, shape: "bow", color: "#355c9a" },
  goldribbon: { day: 23, shape: "bow", color: "#d1a347" },
  goldstar: { day: 24, shape: "star", color: "#ffd56b" },
  dove: { day: 25, shape: "dove", color: "#ffffff" },
} as const satisfies Record<string, { day: number; shape: Shape; color: string }>;

export type OrnamentKind = keyof typeof ORNAMENTS;
export const ORNAMENT_KINDS = Object.keys(ORNAMENTS) as OrnamentKind[];

/** Light colours and the day each unlocks. */
export const LIGHT_COLORS = { champagne: 2, multi: 7, candle: 14 } as const;
export type LightColor = keyof typeof LIGHT_COLORS;

/** Tree features that are not hung by hand. */
export const FEATURES = { lights: 2, lightString: 7, garland: 10, topper: 26, celebration: 27 } as const;

export const MAX_ORNAMENTS = 80;

export type TreeItem = { k: OrnamentKind; a: number }; // a = index into ANCHORS
export type TreeState = { v: 1; items: TreeItem[]; lights: boolean; color: LightColor };

// Tree shape in tree-local units: stacked cone tiers, trunk at the origin.
export const TIERS = [
  { y: 0.75, h: 1.7, r: 1.7 },
  { y: 1.6, h: 1.5, r: 1.35 },
  { y: 2.4, h: 1.3, r: 1.0 },
  { y: 3.1, h: 1.1, r: 0.66 },
];
export const TREE_TOP = 4.2;

type V3 = [number, number, number];
const radiusIn = (t: (typeof TIERS)[number], y: number) => t.r * (1 - (y - t.y) / t.h);

/** Outer radius of the tree at height y (the widest tier at that height). */
export function treeRadius(y: number) {
  let r = 0;
  for (const t of TIERS) if (y >= t.y && y <= t.y + t.h) r = Math.max(r, radiusIn(t, y));
  return r;
}

/** Branch points where an ornament may hang: two rings near the lower edge of each tier. */
export const ANCHORS: V3[] = TIERS.flatMap((t, i) =>
  [0.12, 0.4].flatMap((f, row) => {
    const y = t.y + t.h * f;
    const r = radiusIn(t, y) + 0.05;
    const n = Math.max(5, Math.round((2 * Math.PI * r) / 0.42));
    return Array.from({ length: n }, (_, j): V3 => {
      const ang = ((j + row * 0.5 + i * 0.3) / n) * Math.PI * 2;
      return [Math.sin(ang) * r, y, Math.cos(ang) * r];
    });
  }),
);

/** Nearest anchor to a point on the tree that is not taken, or -1 if none is close enough. */
export function nearestFree(p: { x: number; y: number; z: number }, used: Set<number>, maxDist = 0.75, anchors: V3[] = ANCHORS) {
  let best = -1;
  let bestD = maxDist;
  anchors.forEach(([x, y, z], i) => {
    if (used.has(i)) return;
    const dist = Math.hypot(x - p.x, y - p.y, z - p.z);
    if (dist < bestD) [best, bestD] = [i, dist];
  });
  return best;
}

/** Points on a spiral wrapped around the tree, bottom to top. */
export function spiral(count: number, turns: number, phase = 0, out = 0.06): V3[] {
  return Array.from({ length: count }, (_, i) => {
    const u = (i + 0.5) / count;
    const y = 0.85 + u * 3.15;
    const ang = phase + u * turns * Math.PI * 2;
    const r = treeRadius(y) + out;
    return [Math.sin(ang) * r, y, Math.cos(ang) * r];
  });
}

export const has = (days: number[], day: number) => days.includes(day);
export const ornamentUnlocked = (k: OrnamentKind, days: number[]) => has(days, ORNAMENTS[k].day);

export const emptyTree = (days: number[]): TreeState => ({
  v: 1,
  items: [],
  lights: has(days, FEATURES.lights),
  color: "champagne",
});

/** Turns whatever was stored (or sent) into a valid tree: unknown, locked, misplaced and duplicate items are dropped. */
export function sanitize(raw: unknown, days: number[]): TreeState {
  const base = emptyTree(days);
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<TreeState>;
  const used = new Set<number>();
  const items = (Array.isArray(r.items) ? r.items : []).filter((it): it is TreeItem => {
    if (!it || typeof it !== "object") return false;
    const ok =
      typeof it.k === "string" &&
      it.k in ORNAMENTS &&
      ornamentUnlocked(it.k, days) &&
      Number.isInteger(it.a) &&
      it.a >= 0 &&
      it.a < ANCHORS.length &&
      !used.has(it.a);
    if (ok) used.add(it.a);
    return ok;
  });
  const color = r.color && r.color in LIGHT_COLORS && has(days, LIGHT_COLORS[r.color]) ? r.color : "champagne";
  return {
    v: 1,
    items: items.slice(0, MAX_ORNAMENTS).map(({ k, a }) => ({ k, a })),
    lights: typeof r.lights === "boolean" ? r.lights && has(days, FEATURES.lights) : base.lights,
    color,
  };
}
