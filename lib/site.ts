// One deployment, several subdomains: thamarassery.ourcml.in is the Thamarassery diocese's site, every other
// host (ourcml.in, xmas.ourcml.in, localhost, ...) is the Kerala State site. Add a diocese with one line below.
const DIOCESES: Record<string, string> = {
  thamarassery: "Thamarassery",
  xmasblossoms: "Thamarassery",
};

export type Site = {
  /** The diocese this site belongs to (its name in the dioceses table), or null for the state-wide site. */
  diocese: string | null;
  /** Second line of the splash screen. */
  subtitle: string;
  /** The gold headline art on the day pages. */
  logo: { src: string; alt: string };
};

const HOLY_NIGHT = { src: "/brand/holy-night.webp", alt: "Holy Night" };
// xmasblossoms.ourcml.in carries its own name.
const LOGOS: Record<string, Site["logo"]> = { xmasblossoms: { src: "/brand/xmas-blossoms.webp", alt: "Xmas Blossoms" } };

export function siteFor(hostname: string): Site {
  const sub = hostname.split(".")[0].toLowerCase();
  const diocese = DIOCESES[sub] ?? null;
  return { diocese, subtitle: diocese ? `${diocese} Diocese` : "Kerala State", logo: LOGOS[sub] ?? HOLY_NIGHT };
}

/** This browser's site. On the server (no location) it is the state-wide site. */
export const site = (): Site => siteFor(typeof location === "undefined" ? "" : location.hostname);
