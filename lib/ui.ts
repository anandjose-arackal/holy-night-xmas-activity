// Night screens (village, missions, calendar)
export const btn =
  "inline-flex min-h-11 items-center justify-center rounded-xl bg-gold px-4 py-3 font-semibold text-night transition active:scale-95 disabled:opacity-50";
export const btnGhost =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-cream/30 px-4 py-3 text-cream transition active:scale-95";
export const card = "rounded-2xl bg-night-2 p-4";
export const input =
  "min-h-11 w-full rounded-xl border border-cream/30 bg-night px-3 py-2 text-cream placeholder:text-cream/50";
export const page = "mx-auto flex w-full max-w-md flex-1 flex-col gap-4 p-4";

// Day screens (sign-in, home, who is playing)
export const parch =
  "rounded-[1.75rem] border-[3px] border-rim bg-gradient-to-b from-parchment to-parchment-2 text-ink shadow-[0_10px_30px_rgba(60,30,5,0.35),inset_0_1px_0_rgba(255,255,255,0.8)]";
export const redBtn =
  "inline-flex min-h-13 items-center justify-center gap-2 rounded-full border-[3px] border-rim bg-gradient-to-b from-[#d8333a] to-crimson-dark px-6 font-display text-xl font-bold text-white shadow-[0_4px_0_#5a0e12,0_8px_16px_rgba(90,14,18,0.35)] transition active:translate-y-0.5 active:shadow-[0_2px_0_#5a0e12] disabled:opacity-50";
export const field =
  "flex min-h-13 items-center gap-3 rounded-2xl border border-[#e4cfa4] bg-[#fffaf0] px-4 text-ink shadow-[inset_0_2px_4px_rgba(60,30,5,0.08)] focus-within:border-crimson focus-within:ring-2 focus-within:ring-crimson/30";
/** Cream button or label with a gold edge, as on the treasure and leaderboard screens. */
export const pill =
  "inline-flex min-h-11 items-center justify-center gap-1 whitespace-nowrap rounded-full border-[3px] border-[#f5c542] bg-gradient-to-b from-[#fffaf0] to-[#f3dfae] px-4 font-display font-bold text-crimson-dark shadow-[0_3px_0_#c99a3b,0_6px_12px_rgba(60,30,5,0.25)] transition active:translate-y-0.5";
/** Crimson tab that sits on the top edge of a card ("Today's mission", "Day 3"). */
export const tag =
  "absolute -top-5 left-1/2 -translate-x-1/2 rounded-full border-[3px] border-[#f5c542] bg-gradient-to-b from-[#d8333a] to-crimson-dark px-6 py-1.5 font-display text-xl font-bold whitespace-nowrap text-white shadow-md [text-shadow:0_2px_0_#5a0e12]";
/** Crimson XP badge with a gold edge. */
export const xpPill =
  "inline-flex min-h-9 items-center gap-1.5 rounded-full border-[3px] border-[#f5c542] bg-gradient-to-b from-[#d8333a] to-crimson-dark px-3 font-display font-black whitespace-nowrap text-white shadow-md";

export const avatars: Record<string, string> = { sheep: "🐑", donkey: "🐴", angel: "👼", star: "🌟" };
