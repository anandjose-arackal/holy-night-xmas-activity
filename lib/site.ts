// One deployment, several subdomains: thamarassery.ourcml.in is the Thamarassery diocese's site, every other
// host (ourcml.in, xmas.ourcml.in, localhost, ...) is the Kerala State site. Add a diocese with one line below.
const DIOCESES: Record<string, string> = {
  thamarassery: "Thamarassery",
};

export type Site = {
  /** The diocese this site belongs to (its name in the dioceses table), or null for the state-wide site. */
  diocese: string | null;
  /** Second line of the splash screen. */
  subtitle: string;
};

export function siteFor(hostname: string): Site {
  const diocese = DIOCESES[hostname.split(".")[0].toLowerCase()] ?? null;
  return { diocese, subtitle: diocese ? `${diocese} Diocese` : "Kerala State" };
}

/** This browser's site. On the server (no location) it is the state-wide site. */
export const site = (): Site => siteFor(typeof location === "undefined" ? "" : location.hostname);
