// Turns the treasure illustrations in ../xmas-sources (grey studio backdrop, opaque PNG) into small transparent
// public/treasures/<key>.webp files. The backdrop is removed by a flood fill from the picture's edges.
// Usage: node scripts/treasure-art.mjs            (all)
//        node scripts/treasure-art.mjs ox camel   (some)
//        node scripts/treasure-art.mjs wreath --holes   (also clear backdrop inside the item)

import fs from "node:fs";
import sharp from "sharp";

const SRC = "../xmas-sources/"; // the original pictures, kept outside the project so they are not deployed
const OUT = "public/treasures/";
const ART = {
  olive: "Ancient Olive Tree in Full Fruiage-1.png",
  donkey: "Cheerful Donkey with Geometric Saddle Blanket.png",
  lamb: "Cheerful Fluffy Lamb Portrait.png",
  angel: "Radiant Angel with Golden Wings.png",
  wreath: "wreeth.png",
  bell: "bell2.png",
  mary: "Virgin Mary in Prayerful Serenity.png",
  santa: "Jolly Santa with a Gift-Laden Sack-1.png",
  trumpetAngel: "Joyful Trumpet-Blowing Angel-3.png",
  candle: "Festive Candlelit Christmas Centrepiece-2.png",
  snowflake: "Luxurious Golden Snowflake Ornament-6.png",
  candy: "Golden Holly Candy Cane Ornament-5.png",
  gingerbread: "Joyful Gingerbread Santa Cookie-3.png",
  socks: "Luxurious Gold-Embroidered Christmas Stocking-1.png",
  gift: "Ruby and Gold Holly Gift Box-4.png",
  sheep: "Cheerful Fluffy Sheep Portrait.png",
  fire: "fire.png",
  lilies: "Detailed White Lily Botanical Illustration-4.png",
  firewood: "fire.png",
  ox: "Friendly Smiling Brown Ox.png",
  star: "Glowing Golden Eight-Pointed Star-1.png",
  hay: "Golden Straw Bundle with Braided Rope-2.png",
  shepherd1: "Joyful Young Shepherd with Staff.png",
  shepherd2: "Smiling Shepherd with Crook and Woven Robes.png",
  lantern: "Ornate Antique Lantern Glow-3.png",
  myrrh: "Ornate Bronze and Red Enamel Urn-3.png",
  frankincense: "Ornate Golden Incense Censer-2.png",
  gold: "Ornate Golden Treasure Chest with Rubies-1.png",
  camel: "Ornately Adorned Smiling Camel.png",
  baby: "Peaceful Baby Jesus in a Rustic Manger.png",
  tree: "Realistic Evergreen Fir Tree with Roots-2.png",
  melchior: "wise 1 melchair.png",
  caspar: "Regal Keeper of the Golden Reliquary.png",
  balthazar: "Regal Magi King with Jeweled Vessel.png",
  manger: "Rustic Wooden Manger Filled with Straw-1.png",
  jar: "Weathered Terracotta Amphora with Leaf Bands-4.png",
  joseph: "Warmly Robed Shepherd with Staff.png",
};

const H = 900; // working height
const SIZE = 512; // output box

async function cut(key, file) {
  const { data, info } = await sharp(SRC + file).resize({ height: H }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const px = (i) => [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]];
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const grey = (c) => Math.max(...c) - Math.min(...c) < 28;

  // Backdrop colour per row, from the left and right edges (it is a soft vertical gradient).
  const rowBg = [];
  for (let y = 0; y < h; y++) {
    // Only edges that are backdrop count; an item touching one edge would tint the average.
    const edges = [px(y * w + 2), px(y * w + w - 3)].filter(grey);
    const use = edges.length ? edges : [rowBg[y - 1] ?? [200, 200, 205]];
    rowBg.push([0, 1, 2].map((k) => use.reduce((sum, c) => sum + c[k], 0) / use.length));
  }

  const bg = new Uint8Array(w * h);
  const stack = [];
  const seed = (i) => {
    if (!bg[i] && grey(px(i))) {
      bg[i] = 1;
      stack.push(i);
    }
  };
  for (let x = 0; x < w; x++) {
    seed(x);
    seed((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    seed(y * w);
    seed(y * w + w - 1);
  }
  // --holes: also clear backdrop showing through the item (the middle of a wreath), seeded from any pixel
  // that is almost exactly the backdrop colour. Off by default: it can eat silver or white parts.
  if (holes) for (let i = 0; i < w * h; i++) if (dist(px(i), rowBg[(i / w) | 0]) < 6) seed(i);
  while (stack.length) {
    const i = stack.pop();
    const x = i % w, y = (i / w) | 0;
    const c = px(i);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const j = ny * w + nx;
      if (bg[j]) continue;
      const d = px(j);
      // Smooth step from its neighbour, still close to the backdrop of its row, and colourless.
      if (dist(c, d) < 12 && dist(d, rowBg[ny]) < 48 && grey(d)) {
        bg[j] = 1;
        stack.push(j);
      }
    }
  }

  // Alpha: share of non-backdrop pixels in the 3x3 around each pixel, a one-pixel feather on the edge.
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let keep = 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const nx = Math.min(w - 1, Math.max(0, x + dx)), ny = Math.min(h - 1, Math.max(0, y + dy));
          keep += bg[ny * w + nx] ? 0 : 1;
        }
      const i = y * w + x;
      out[i * 4] = data[i * 3];
      out[i * 4 + 1] = data[i * 3 + 1];
      out[i * 4 + 2] = data[i * 3 + 2];
      out[i * 4 + 3] = Math.round((keep / 9) * 255);
    }
  const rgba = await sharp(out, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
  await sharp(await sharp(rgba).trim({ threshold: 1 }).toBuffer())
    .resize(SIZE, SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 82, alphaQuality: 90 })
    .toFile(`${OUT}${key}.webp`);
  console.log(key, fs.statSync(`${OUT}${key}.webp`).size, "bytes");
}

fs.mkdirSync(OUT, { recursive: true });
const holes = process.argv.includes("--holes");
const pick = process.argv.slice(2).filter((a) => a !== "--holes");
for (const [key, file] of Object.entries(ART)) if (!pick.length || pick.includes(key)) await cut(key, file);
