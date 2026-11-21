// Draws the share-a-verse picture (1080×1920) on a canvas. `fitText` is pure, so plain Node tests cover it.

export const CARD_W = 1080;
export const CARD_H = 1920;

export type CardTheme = "golden" | "moonlit" | "parchment" | "cream";
export const CARD_THEMES: CardTheme[] = ["golden", "moonlit", "parchment", "cream"];

/** Wraps on spaces at the largest font size (max..min, step 2) whose lines fit the box. */
export function fitText(text: string, width: number, height: number, measure: (s: string, size: number) => number, max = 84, min = 36, lh = 1.6) {
  const words = text.trim().split(/\s+/);
  for (let size = max; ; size -= 2) {
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      const next = line ? `${line} ${w}` : w;
      if (line && measure(next, size) > width) {
        lines.push(line);
        line = w;
      } else line = next;
    }
    if (line) lines.push(line);
    if (lines.length * size * lh <= height || size <= min) return { size, lines, lh };
  }
}

const BURGUNDY = "#6e1016";
const GOLD = "#c9962e";

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** `bg` is the Bethlehem art for the golden and moonlit themes (null while it loads or for the plain ones). */
export function drawVerseCard(ctx: CanvasRenderingContext2D, o: { verse: string; ref: string; theme: CardTheme; font: string; bg: HTMLImageElement | null }) {
  const { theme } = o;
  ctx.clearRect(0, 0, CARD_W, CARD_H);

  // Background
  if (o.bg && (theme === "golden" || theme === "moonlit")) {
    const s = Math.max(CARD_W / o.bg.width, CARD_H / o.bg.height);
    ctx.drawImage(o.bg, (CARD_W - o.bg.width * s) / 2, (CARD_H - o.bg.height * s) / 2, o.bg.width * s, o.bg.height * s);
    const tint = ctx.createLinearGradient(0, 0, 0, CARD_H);
    if (theme === "golden") {
      tint.addColorStop(0, "rgba(255,196,90,0.35)");
      tint.addColorStop(1, "rgba(120,60,10,0.25)");
    } else {
      tint.addColorStop(0, "rgba(10,15,50,0.35)");
      tint.addColorStop(1, "rgba(10,10,30,0.4)");
    }
    ctx.fillStyle = tint;
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, CARD_H);
    const [a, b] = theme === "moonlit" ? ["#1b2350", "#3b2a4a"] : theme === "golden" ? ["#f6c96a", "#c77a2a"] : theme === "parchment" ? ["#fcf1d8", "#ecd5a2"] : ["#fbf6ea", "#f6eedb"];
    g.addColorStop(0, a);
    g.addColorStop(1, b);
    ctx.fillStyle = g;
  }
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Ivory panel with a gold frame (Minimal Cream: no panel, a thin gold rule instead)
  const px = 90, py = 300, pw = CARD_W - 180, ph = 1260;
  if (theme !== "cream") {
    ctx.save();
    ctx.shadowColor = "rgba(40,20,0,0.35)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 12;
    roundRect(ctx, px, py, pw, ph, 56);
    const panel = ctx.createLinearGradient(0, py, 0, py + ph);
    panel.addColorStop(0, "#fffaf0");
    panel.addColorStop(1, theme === "parchment" ? "#f1dcae" : "#f7ead0");
    ctx.fillStyle = panel;
    ctx.fill();
    ctx.restore();
    ctx.lineWidth = 12;
    ctx.strokeStyle = GOLD;
    roundRect(ctx, px, py, pw, ph, 56);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(201,150,46,0.6)";
    roundRect(ctx, px + 22, py + 22, pw - 44, ph - 44, 40);
    ctx.stroke();
  }

  // Verse, centred in the panel
  ctx.fillStyle = BURGUNDY;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const boxTop = py + 90, boxH = ph - 230 - 50 - 90; // between the frame's top and the gold rule above the reference
  const fit = fitText(o.verse, pw - 160, boxH, (s, size) => {
    ctx.font = `700 ${size}px ${o.font}`;
    return ctx.measureText(s).width;
  });
  ctx.font = `700 ${fit.size}px ${o.font}`;
  const step = fit.size * fit.lh;
  const top = boxTop + (boxH - fit.lines.length * step) / 2 + step / 2;
  fit.lines.forEach((l, i) => ctx.fillText(l, CARD_W / 2, top + i * step));

  // Gold rule with a diamond, then the reference in a ruby pill
  const ry = py + ph - 230;
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(CARD_W / 2 - 220, ry);
  ctx.lineTo(CARD_W / 2 - 24, ry);
  ctx.moveTo(CARD_W / 2 + 24, ry);
  ctx.lineTo(CARD_W / 2 + 220, ry);
  ctx.stroke();
  ctx.fillStyle = GOLD;
  ctx.save();
  ctx.translate(CARD_W / 2, ry);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-12, -12, 24, 24);
  ctx.restore();

  ctx.font = `700 52px ${o.font}`;
  const rw = Math.min(pw - 120, ctx.measureText(o.ref).width + 120);
  const pill = ctx.createLinearGradient(0, ry + 60, 0, ry + 160);
  pill.addColorStop(0, "#c62a32");
  pill.addColorStop(1, "#7e1418");
  ctx.fillStyle = pill;
  roundRect(ctx, (CARD_W - rw) / 2, ry + 60, rw, 100, 50);
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#f5c542";
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.fillText(o.ref, CARD_W / 2, ry + 112, rw - 60);
}
