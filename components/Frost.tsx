"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Slow snow that frosts the screen over a few minutes, edges first; a finger or a pressed mouse wipes it clean.
// One canvas over the page that never takes a tap (pointer-events: none): wiping is read from window events.

const HIDE = ["/play", "/bible/read"]; // the village drags to pan; long reading needs a clear page
const FULL_SECONDS = 2400; // formula target; edges look frosted after about 20 minutes of use (measured 10 at 1200)
const MAX_ALPHA = 0.55; // frost never hides the page fully
const FROST_SCALE = 0.5; // the frost layer is drawn at half resolution: soft and cheap
const BRUSH = 26; // wipe radius, CSS px
const FPS = 20; // slow snow moves 1–2 px a frame: smooth enough, a third of the work of 60 fps
const IDLE_MS = 2 * 60_000; // no touch, mouse, key or scroll this long: snow stops (saves battery) until the next one

type Flake = { x: number; y: number; r: number; v: number; ph: number };

export function Frost() {
  const path = usePathname();
  const hidden = HIDE.some((p) => path.startsWith(p));
  const ref = useRef<HTMLCanvasElement>(null);
  const frost = useRef<HTMLCanvasElement | null>(null); // kept across page changes, so the frost keeps building
  const [calm, setCalm] = useState(false);

  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => setCalm(q.matches);
    set();
    q.addEventListener("change", set);
    return () => q.removeEventListener("change", set);
  }, []);

  useEffect(() => {
    const cv = ref.current;
    if (!cv || hidden || calm) return;
    const ctx = cv.getContext("2d")!;
    const fr = (frost.current ??= document.createElement("canvas"));
    const fctx = fr.getContext("2d")!;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let flakes: Flake[] = [];
    const flake = (top: boolean): Flake => ({ x: Math.random() * w, y: top ? -5 : Math.random() * h, r: 1.2 + Math.random() * 2.3, v: 12 + Math.random() * 14, ph: Math.random() * 6 });

    const size = () => {
      w = innerWidth;
      h = innerHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      // Keep the frost there is, stretched to the new size.
      const old = fr.width ? Object.assign(document.createElement("canvas"), { width: fr.width, height: fr.height }) : null;
      old?.getContext("2d")!.drawImage(fr, 0, 0);
      fr.width = Math.ceil(w * FROST_SCALE);
      fr.height = Math.ceil(h * FROST_SCALE);
      if (old) fctx.drawImage(old, 0, 0, fr.width, fr.height);
      flakes = Array.from({ length: Math.round(Math.min(90, (w * h) / 9000)) }, () => flake(false));
    };
    size();

    // One soft frost spot; spots land more often near the edges, so the middle stays readable longest.
    const spot = () => {
      const x = Math.random();
      const y = Math.random();
      const edge = Math.min(x, 1 - x, y, 1 - y) * 2; // 0 at an edge, 1 in the middle
      if (Math.random() < edge * 0.85) return;
      const fx = x * fr.width;
      const fy = y * fr.height;
      const r = (18 + Math.random() * 22) * FROST_SCALE;
      const g = fctx.createRadialGradient(fx, fy, 0, fx, fy, r);
      g.addColorStop(0, "rgba(240,248,255,0.18)");
      g.addColorStop(1, "rgba(240,248,255,0)");
      fctx.globalCompositeOperation = "source-over";
      fctx.fillStyle = g;
      fctx.fillRect(fx - r, fy - r, 2 * r, 2 * r);
    };
    // Spots per second for a full cover in FULL_SECONDS: a soft spot averages ~6% white, so ~40 overlapping spots
    // of ~30 px make one point white.
    const perSecond = () => ((w * h) / (Math.PI * 30 * 30)) * 40 / FULL_SECONDS * 2; // ×2: about half are skipped

    let last: { x: number; y: number } | null = null;
    const wipe = (x: number, y: number) => {
      fctx.globalCompositeOperation = "destination-out";
      fctx.lineCap = "round";
      fctx.lineWidth = BRUSH * 2 * FROST_SCALE;
      fctx.beginPath();
      const from = last ?? { x, y };
      fctx.moveTo(from.x * FROST_SCALE, from.y * FROST_SCALE);
      fctx.lineTo(x * FROST_SCALE + 0.01, y * FROST_SCALE);
      fctx.stroke();
      last = { x, y };
    };
    const onPointer = (e: PointerEvent) => {
      wake();
      if (e.pointerType !== "mouse") return; // touch is read from touchmove, which keeps coming while the page scrolls
      if (e.buttons & 1) wipe(e.clientX, e.clientY);
      else last = null;
    };
    const onTouch = (e: TouchEvent) => {
      wake();
      const t = e.touches[0];
      if (t) wipe(t.clientX, t.clientY);
    };
    const lift = () => {
      last = null;
      document.body.style.userSelect = "";
    };
    const press = (e: PointerEvent) => {
      wake();
      last = { x: e.clientX, y: e.clientY }; // the stroke starts where the finger lands
      // A mouse wipe would also select the page's text; fields keep their own selection.
      if (e.pointerType === "mouse" && !(e.target as Element).closest?.("input, textarea, select")) document.body.style.userSelect = "none";
    };

    let raf = 0;
    let prev = performance.now();
    let owed = 0;
    let awake = prev;
    const wake = () => {
      awake = performance.now();
      if (raf) return;
      prev = awake;
      raf = requestAnimationFrame(frame);
    };
    const frame = (now: number) => {
      if (now - awake > IDLE_MS) {
        // Asleep: leave the frost as it is, without the flakes, and stop drawing.
        ctx.clearRect(0, 0, w, h);
        ctx.globalAlpha = MAX_ALPHA;
        ctx.drawImage(fr, 0, 0, w, h);
        ctx.globalAlpha = 1;
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(frame);
      const dt = (now - prev) / 1000;
      if (dt < 1 / FPS - 0.004) return; // the slack keeps 60 Hz screens at FPS, not FPS/2, despite frame jitter
      prev = now;
      if (dt > 2) return; // back from a hidden tab: no burst of frost
      owed += perSecond() * dt;
      for (; owed >= 1; owed--) spot();

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = MAX_ALPHA;
      ctx.drawImage(fr, 0, 0, w, h);
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      for (const f of flakes) {
        f.y += f.v * dt;
        f.x += Math.sin(now / 1500 + f.ph) * 8 * dt;
        if (f.y > h + 5) Object.assign(f, flake(true));
        ctx.moveTo(f.x + f.r, f.y);
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(frame);

    addEventListener("resize", size);
    addEventListener("scroll", wake, { passive: true });
    addEventListener("keydown", wake);
    addEventListener("pointermove", onPointer, { passive: true });
    addEventListener("pointerdown", press, { passive: true });
    addEventListener("pointerup", lift);
    addEventListener("touchmove", onTouch, { passive: true });
    addEventListener("touchend", lift);
    return () => {
      lift();
      cancelAnimationFrame(raf);
      removeEventListener("resize", size);
      removeEventListener("scroll", wake);
      removeEventListener("keydown", wake);
      removeEventListener("pointermove", onPointer);
      removeEventListener("pointerdown", press);
      removeEventListener("pointerup", lift);
      removeEventListener("touchmove", onTouch);
      removeEventListener("touchend", lift);
    };
  }, [hidden, calm]);

  if (hidden || calm) return null;
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-40 h-full w-full" />;
}
