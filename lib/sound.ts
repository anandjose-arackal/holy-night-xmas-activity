import { useSyncExternalStore } from "react";
import { asset } from "@/lib/asset";

// Short sounds from public/sounds/<name>.mp3, and one quiet background loop. A missing file is simply silent.
// Browsers allow sound only after the first tap; a loop asked for before then starts on that tap.

export type Sound =
  | "bell" | "camel" | "donkey" | "hohoho" | "laugh" | "prayer" | "reindeer" | "sheep" | "shimmer" | "shine" | "shine2" | "task";
export type Loop = "village-day" | "village-night";

const LOOP_VOLUME = 0.25;
const cache = new Map<string, HTMLAudioElement>();
let loopEl: HTMLAudioElement | null = null;
let muted = false;
try {
  muted = typeof localStorage !== "undefined" && localStorage.getItem("muted") === "1";
} catch {}
const listeners = new Set<() => void>();

const audio = (name: string) => {
  let a = cache.get(name);
  if (!a) {
    a = new Audio(asset(`/sounds/${name}.mp3`));
    a.preload = "auto";
    cache.set(name, a);
  }
  return a;
};

export function play(name: Sound, volume = 0.8) {
  if (muted || typeof Audio === "undefined") return;
  const a = audio(name).cloneNode() as HTMLAudioElement; // a clone, so quick taps overlap instead of cutting off
  a.volume = volume;
  a.play().catch(() => {}); // not allowed yet, or the file is missing
}

export function loop(name: Loop) {
  if (typeof Audio === "undefined") return;
  if (loopEl && loopEl.src.includes(`/${name}.mp3`)) return;
  stopLoop();
  loopEl = new Audio(asset(`/sounds/${name}.mp3`));
  loopEl.loop = true;
  loopEl.volume = LOOP_VOLUME;
  resume();
}

export function stopLoop() {
  loopEl?.pause();
  loopEl = null;
}

function resume() {
  if (!loopEl || muted || document.hidden) return;
  loopEl.play().catch(() => {
    // Not allowed before the first tap: try again on it.
    addEventListener("pointerdown", resume, { once: true });
  });
}

if (typeof document !== "undefined")
  document.addEventListener("visibilitychange", () => (document.hidden ? loopEl?.pause() : resume()));

export function setMuted(m: boolean) {
  muted = m;
  try {
    localStorage.setItem("muted", m ? "1" : "0");
  } catch {}
  if (m) loopEl?.pause();
  else resume();
  listeners.forEach((l) => l());
}

/** The mute state, for the speaker button. */
export const useMuted = () =>
  useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => muted,
    () => false,
  );
