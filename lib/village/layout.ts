// The 25-day plan: which village treasure each day's task unlocks, which tree decoration each day's reading unlocks,
// the bonus items bought with XP, and where each piece stands in the painted village by default.
// Malayalam names and descriptions are DRAFT, pending review.
// Spots are [u, v] in the painting from its top-left corner (0..1), where the piece meets the ground.
// Phones use the tall painting and laptops the wide one, so every spot is given for both.

import type { Lang } from "@/content/missions";
import { asset } from "../asset.ts"; // relative: the tests run in plain Node
import type { OrnamentKind } from "@/lib/tree";

type Name = Record<Lang, string>;
export type Spot = [number, number];
export type PaintingKey = "tall" | "wide";

export type WorldKey =
  | "tree" | "olive" | "wreath" | "fire" | "bell" | "lilies" | "jar" | "lantern" | "hay" | "manger"
  | "donkey" | "ox" | "shepherd1" | "shepherd2" | "camel" | "melchior" | "caspar" | "balthazar"
  | "gold" | "frankincense" | "myrrh" | "star" | "joseph" | "mary" | "baby";
export type BonusKey = "santa" | "reindeer" | "snowman" | "sheep" | "lamb" | "firewood" | "angel" | "trumpetAngel" | "candle" | `decor${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`;
/** Free gifts for going to Mass (or praying at home) on days in a row. Mirrored in 008_mass_streak_gifts.sql. */
export type StreakKey = "snowflake" | "candy" | "gingerbread" | "socks" | "gift";
export const MASS_GIFTS: [StreakKey, number][] = [
  ["snowflake", 2],
  ["candy", 4],
  ["gingerbread", 6],
  ["socks", 9],
  ["gift", 12],
];
export type PieceKey = WorldKey | BonusKey | StreakKey;

export type TreeKey = OrnamentKind | "tree" | "lights" | "lightString" | "candle" | "garland" | "topper" | "celebration";

export const REWARDS: { day: number; world: WorldKey; tree: TreeKey }[] = [
  { day: 1, world: "tree", tree: "tree" },
  { day: 2, world: "olive", tree: "lights" },
  { day: 3, world: "wreath", tree: "red" },
  { day: 4, world: "fire", tree: "gold" },
  { day: 5, world: "bell", tree: "ribbon" },
  { day: 6, world: "lilies", tree: "bell" },
  { day: 7, world: "jar", tree: "lightString" },
  { day: 8, world: "lantern", tree: "green" },
  { day: 9, world: "hay", tree: "white" },
  { day: 10, world: "manger", tree: "garland" },
  { day: 11, world: "donkey", tree: "star" },
  { day: 12, world: "ox", tree: "blue" },
  { day: 13, world: "shepherd1", tree: "snowflake" },
  { day: 14, world: "shepherd2", tree: "candle" },
  { day: 15, world: "camel", tree: "shepherd" },
  { day: 16, world: "melchior", tree: "wood" },
  { day: 17, world: "caspar", tree: "sheep" },
  { day: 18, world: "balthazar", tree: "silverbell" },
  { day: 19, world: "gold", tree: "angel" },
  { day: 20, world: "frankincense", tree: "blueribbon" },
  { day: 21, world: "myrrh", tree: "goldribbon" },
  { day: 22, world: "star", tree: "goldstar" },
  { day: 23, world: "joseph", tree: "dove" },
  { day: 24, world: "mary", tree: "topper" },
  { day: 25, world: "baby", tree: "celebration" },
];

/**
 * The village backgrounds. `horizon` is the v of the far hills; things shrink towards it.
 * `depth` turns distance below the horizon into a size: scale = depth * (v - horizon).
 */
export const PAINTINGS = {
  tall: { url: asset("/bg/village-tall.webp"), aspect: 1330 / 1182, horizon: 0.35, depth: 4.4 },
  wide: { url: asset("/bg/village-wide.webp"), aspect: 1939 / 811, horizon: 0.4, depth: 4 },
} as const;

/**
 * One village piece. `height` is in scene units at the front of the painting (a grown-up is about 2.5).
 * `glb` + optional `part` (one mesh of a multi-object file) once a model exists; otherwise the scene draws a stand-in.
 * `fixed` pieces are not dragged and need no placing: the decorating tree and the star in the sky.
 * `image` is the 2D picture for the treasure screens, once one is made.
 */
export type Piece = {
  name: Name;
  desc: Name;
  height: number;
  spot: Record<PaintingKey, Spot>;
  glb?: string;
  part?: number;
  image?: string;
  fixed?: boolean;
  sky?: boolean;
};

const s = (tall: Spot, wide: Spot) => ({ tall, wide });

const decor = Object.fromEntries(
  Array.from({ length: 9 }, (_, i): [string, Piece] => [
    `decor${i}`,
    {
      name: { en: `Christmas Decoration ${i + 1}`, ml: `ക്രിസ്മസ് അലങ്കാരം ${i + 1}` },
      desc: { en: "A bright decoration for the village.", ml: "ഗ്രാമത്തിന് ഒരു തിളങ്ങുന്ന അലങ്കാരം." },
      height: 1.4, // the whole file's height, so the pieces keep their sizes
      spot: s([0.52 + (i % 5) * 0.07, i < 5 ? 0.72 : 0.76], [0.3 + i * 0.06, i % 2 ? 0.9 : 0.94]),
      glb: "/models/gifts.glb",
      part: i,
    },
  ]),
) as Record<`decor${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`, Piece>;

export const PIECES: Record<PieceKey, Piece> = {
  tree: {
    name: { en: "Christmas Tree", ml: "ക്രിസ്മസ് ട്രീ" },
    desc: { en: "An evergreen tree, waiting to be decorated.", ml: "അലങ്കരിക്കാൻ കാത്തിരിക്കുന്ന ഒരു നിത്യഹരിത മരം." },
    height: 0,
    spot: s([0.14, 0.68], [0.2, 0.76]),
    glb: "/models/tree.glb",
    fixed: true,
  },
  olive: {
    name: { en: "Olive Tree", ml: "ഒലിവ് മരം" },
    desc: { en: "A sign of God's peace in the Holy Land.", ml: "വിശുദ്ധ നാട്ടിലെ ദൈവസമാധാനത്തിന്റെ അടയാളം." },
    height: 3,
    spot: s([0.05, 0.56], [0.94, 0.55]),
    glb: "/models/olive.glb",
  },
  wreath: {
    name: { en: "Advent Wreath", ml: "ആഗമനകാല റീത്ത്" },
    desc: { en: "A circle of green: God's love never ends.", ml: "പച്ചയുടെ വൃത്തം: ദൈവസ്നേഹത്തിന് അവസാനമില്ല." },
    height: 1,
    spot: s([0.27, 0.6], [0.05, 0.8]),
    glb: "/models/wreath.glb",
  },
  fire: {
    name: { en: "Warm Fire", ml: "തീക്കുണ്ഡം" },
    desc: { en: "A fire to keep everyone warm on the cold nights of Advent.", ml: "ആഗമനകാലത്തെ തണുത്ത രാത്രികളിൽ എല്ലാവർക്കും ചൂട് നൽകാൻ ഒരു തീ." },
    height: 0.9,
    spot: s([0.45, 0.74], [0.32, 0.9]),
    glb: "/models/fire.glb",
  },
  bell: {
    name: { en: "Bell", ml: "മണി" },
    desc: { en: "It rings out the good news: Jesus is coming!", ml: "സന്തോഷവാർത്ത മുഴക്കുന്നു: ഈശോ വരുന്നു!" },
    height: 0.8,
    spot: s([0.92, 0.82], [0.28, 0.72]),
    glb: "/models/bell.glb",
  },
  lilies: {
    name: { en: "Lily", ml: "ലില്ലിപ്പൂവ്" },
    desc: { en: "White and pure, like Mary's yes to God.", ml: "ദൈവത്തോടുള്ള മറിയത്തിന്റെ സമ്മതം പോലെ വെണ്മയും വിശുദ്ധിയും." },
    height: 0.9,
    spot: s([0.06, 0.75], [0.2, 0.98]),
    glb: "/models/lilies.glb",
  },
  jar: {
    name: { en: "Water Jar", ml: "മൺകുടം" },
    desc: { en: "Fresh water for weary travellers.", ml: "ക്ഷീണിച്ച യാത്രക്കാർക്ക് ശുദ്ധജലം." },
    height: 0.8,
    spot: s([0.75, 0.73], [0.95, 0.82]),
  },
  lantern: {
    name: { en: "Oil Lantern", ml: "എണ്ണവിളക്ക്" },
    desc: { en: "A small light to guide the way in the dark.", ml: "ഇരുട്ടിൽ വഴികാട്ടുന്ന ഒരു ചെറിയ വെളിച്ചം." },
    height: 0.9,
    spot: s([0.7, 0.78], [0.3, 0.8]),
  },
  hay: {
    name: { en: "Hay Bundle", ml: "വൈക്കോൽക്കെട്ട്" },
    desc: { en: "Soft hay to make a bed for the Baby.", ml: "ഉണ്ണിക്ക് കിടക്കയൊരുക്കാൻ മൃദുവായ വൈക്കോൽ." },
    height: 0.8,
    spot: s([0.49, 0.645], [0.47, 0.8]),
    glb: "/models/hay.glb",
  },
  manger: {
    name: { en: "The Manger", ml: "പുൽത്തൊട്ടി" },
    desc: { en: "A simple and humble cradle prepared for the Child Jesus.", ml: "ഉണ്ണീശോയ്ക്കായി ഒരുക്കിയ ലളിതവും എളിയതുമായ തൊട്ടിൽ." },
    height: 1,
    spot: s([0.585, 0.65], [0.57, 0.81]),
    glb: "/models/manger.glb",
  },
  donkey: {
    name: { en: "Donkey", ml: "കഴുത" },
    desc: { en: "It carried Mary gently to Bethlehem.", ml: "മറിയത്തെ സൗമ്യമായി ബേത്‌ലെഹേമിലേക്ക് ചുമന്നു." },
    height: 1.8,
    spot: s([0.72, 0.67], [0.79, 0.86]),
    glb: "/models/donkey.glb",
  },
  ox: {
    name: { en: "Ox", ml: "കാള" },
    desc: { en: "It kept the stable warm on that holy night.", ml: "ആ വിശുദ്ധരാത്രിയിൽ തൊഴുത്തിന് ചൂട് നൽകി." },
    height: 1.8,
    spot: s([0.34, 0.71], [0.73, 0.85]),
    glb: "/models/ox.glb",
  },
  shepherd1: {
    name: { en: "Shepherd", ml: "ആട്ടിടയൻ" },
    desc: { en: "He watched his sheep and heard the angels sing.", ml: "ആടുകളെ കാവൽ കാത്ത അവൻ മാലാഖമാരുടെ ഗാനം കേട്ടു." },
    height: 2.5,
    spot: s([0.22, 0.72], [0.25, 0.78]),
    glb: "/models/shepherd1.glb",
  },
  shepherd2: {
    name: { en: "Young Shepherd", ml: "ഇളയ ആട്ടിടയൻ" },
    desc: { en: "He ran to Bethlehem to see the Baby.", ml: "ഉണ്ണിയെ കാണാൻ അവൻ ബേത്‌ലെഹേമിലേക്ക് ഓടി." },
    height: 2.2,
    spot: s([0.2, 0.92], [0.17, 0.9]),
    glb: "/models/shepherd2.glb",
  },
  camel: {
    name: { en: "Camel", ml: "ഒട്ടകം" },
    desc: { en: "It carried the wise men across the desert.", ml: "ജ്ഞാനികളെ മരുഭൂമി കടത്തി കൊണ്ടുവന്നു." },
    height: 3,
    spot: s([0.86, 0.7], [0.93, 0.72]),
    glb: "/models/camel.glb",
  },
  melchior: {
    name: { en: "King Melchior", ml: "മെൽക്കിയോർ രാജാവ്" },
    desc: { en: "A wise man who followed the star.", ml: "നക്ഷത്രത്തെ പിന്തുടർന്ന ഒരു ജ്ഞാനി." },
    height: 2.6,
    spot: s([0.38, 0.8], [0.33, 0.88]),
    glb: "/models/melchior.glb",
  },
  caspar: {
    name: { en: "King Caspar", ml: "കാസ്പർ രാജാവ്" },
    desc: { en: "He travelled far to worship the newborn King.", ml: "പുതുതായി പിറന്ന രാജാവിനെ ആരാധിക്കാൻ അവൻ ദൂരം താണ്ടി." },
    height: 2.6,
    spot: s([0.3, 0.86], [0.4, 0.93]),
    glb: "/models/caspar.glb",
  },
  balthazar: {
    name: { en: "King Balthazar", ml: "ബാൽത്തസാർ രാജാവ്" },
    desc: { en: "He knelt before Jesus with a joyful heart.", ml: "സന്തോഷഹൃദയത്തോടെ അവൻ ഈശോയുടെ മുമ്പിൽ മുട്ടുകുത്തി." },
    height: 2.6,
    spot: s([0.68, 0.86], [0.72, 0.92]),
    glb: "/models/balthazar.glb",
  },
  gold: {
    name: { en: "Gold", ml: "പൊന്ന്" },
    desc: { en: "A gift for a King.", ml: "ഒരു രാജാവിനുള്ള സമ്മാനം." },
    height: 0.7,
    spot: s([0.36, 0.9], [0.62, 0.9]),
    glb: "/models/gold.glb",
  },
  frankincense: {
    name: { en: "Frankincense", ml: "കുന്തുരുക്കം" },
    desc: { en: "A gift for God: its smoke rises like prayer.", ml: "ദൈവത്തിനുള്ള സമ്മാനം: അതിന്റെ പുക പ്രാർത്ഥന പോലെ ഉയരുന്നു." },
    height: 0.7,
    spot: s([0.46, 0.92], [0.68, 0.94]),
    glb: "/models/frankincense.glb",
  },
  myrrh: {
    name: { en: "Myrrh", ml: "മീറ" },
    desc: { en: "A gift that tells of Jesus giving his life for us.", ml: "നമുക്കായി ജീവൻ നൽകുന്ന ഈശോയെക്കുറിച്ച് പറയുന്ന സമ്മാനം." },
    height: 0.7,
    spot: s([0.56, 0.94], [0.74, 0.97]),
    glb: "/models/myrrh.glb",
  },
  star: {
    name: { en: "Star of Bethlehem", ml: "ബേത്‌ലെഹേമിലെ നക്ഷത്രം" },
    desc: { en: "It shone over the stable to show the way.", ml: "വഴികാട്ടാൻ അത് തൊഴുത്തിനു മുകളിൽ പ്രകാശിച്ചു." },
    height: 1,
    spot: s([0.55, 0.1], [0.56, 0.12]),
    glb: "/models/star.glb",
    fixed: true,
    sky: true,
  },
  joseph: {
    name: { en: "Saint Joseph", ml: "വിശുദ്ധ യൗസേപ്പ്" },
    desc: { en: "Joseph trusted God and lovingly cared for Mary and Jesus.", ml: "യൗസേപ്പ് ദൈവത്തിൽ ആശ്രയിച്ച് മറിയത്തെയും ഈശോയെയും സ്നേഹത്തോടെ സംരക്ഷിച്ചു." },
    height: 2.6,
    spot: s([0.53, 0.645], [0.52, 0.8]), // Joseph on the left of the manger, Mary on the right
    glb: "/models/joseph.glb",
  },
  mary: {
    name: { en: "Mother Mary", ml: "പരിശുദ്ധ മറിയം" },
    desc: { en: "She said yes to God and became the Mother of Jesus.", ml: "അവൾ ദൈവത്തോട് സമ്മതം പറഞ്ഞ് ഈശോയുടെ അമ്മയായി." },
    height: 1.87, // kneeling (mary2.glb)
    spot: s([0.64, 0.645], [0.62, 0.8]),
    glb: "/models/mary.glb",
  },
  baby: {
    name: { en: "Baby Jesus", ml: "ഉണ്ണീശോ" },
    desc: { en: "God's greatest gift: the Saviour is born!", ml: "ദൈവത്തിന്റെ ഏറ്റവും വലിയ സമ്മാനം: രക്ഷകൻ പിറന്നു!" },
    height: 1.1, // the model includes his own manger
    spot: s([0.585, 0.655], [0.57, 0.815]),
    glb: "/models/baby.glb",
  },
  santa: {
    name: { en: "Santa Claus", ml: "സാന്താക്ലോസ്" },
    desc: { en: "Saint Nicholas loved to give in secret.", ml: "രഹസ്യമായി നൽകാൻ ഇഷ്ടപ്പെട്ട വിശുദ്ധ നിക്കോളാസ്." },
    height: 1.8,
    spot: s([0.3, 0.66], [0.18, 0.68]),
    glb: "/models/santa.glb",
  },
  reindeer: {
    name: { en: "Reindeer", ml: "റെയിൻഡിയർ" },
    desc: { en: "Santa's sleigh, ready to deliver joy.", ml: "സന്തോഷം എത്തിക്കാൻ ഒരുങ്ങിയ സാന്തായുടെ വണ്ടി." },
    height: 1.8,
    spot: s([0.2, 0.64], [0.08, 0.7]),
    glb: "/models/reindeer.glb",
  },
  snowman: {
    name: { en: "Snowman", ml: "മഞ്ഞുമനുഷ്യൻ" },
    desc: { en: "A cheerful friend from snowy lands.", ml: "മഞ്ഞുനാടുകളിൽ നിന്നുള്ള ഒരു സന്തോഷവാനായ കൂട്ടുകാരൻ." },
    height: 1.5,
    spot: s([0.94, 0.7], [0.96, 0.95]),
    glb: "/models/snowman.glb",
  },
  sheep: {
    name: { en: "Sheep", ml: "ആട്" },
    desc: { en: "The shepherds' flock, resting near Bethlehem.", ml: "ബേത്‌ലെഹേമിനടുത്ത് വിശ്രമിക്കുന്ന ഇടയന്മാരുടെ ആട്ടിൻകൂട്ടം." },
    height: 1.3,
    spot: s([0.8, 0.8], [0.73, 0.77]),
    glb: "/models/sheep.glb",
  },
  lamb: {
    name: { en: "Little Lamb", ml: "കുഞ്ഞാട്" },
    desc: { en: "Jesus is the Lamb of God.", ml: "ഈശോ ദൈവത്തിന്റെ കുഞ്ഞാടാണ്." },
    height: 0.9,
    spot: s([0.8, 0.9], [0.8, 0.98]),
    glb: "/models/lamb.glb",
  },
  firewood: {
    name: { en: "Firewood", ml: "വിറക്" },
    desc: { en: "Wood to keep the shepherds warm at night.", ml: "രാത്രിയിൽ ഇടയന്മാർക്ക് ചൂട് നൽകാൻ വിറക്." },
    height: 0.8,
    spot: s([0.28, 0.76], [0.22, 0.86]),
    glb: "/models/firewood.glb",
  },
  angel: {
    name: { en: "Angel", ml: "മാലാഖ" },
    desc: { en: "Glory to God in the highest, and peace on earth!", ml: "അത്യുന്നതങ്ങളിൽ ദൈവത്തിനു മഹത്വം, ഭൂമിയിൽ സമാധാനം!" },
    height: 1.8,
    spot: s([0.08, 0.66], [0.15, 0.63]),
    glb: "/models/angel.glb",
  },
  trumpetAngel: {
    name: { en: "Angel with Trumpet", ml: "കാഹളമൂതുന്ന മാലാഖ" },
    desc: { en: "The angels announced the good news of Jesus' birth.", ml: "ഈശോയുടെ ജനനത്തിന്റെ സന്തോഷവാർത്ത മാലാഖമാർ അറിയിച്ചു." },
    height: 1.8,
    spot: s([0.16, 0.62], [0.1, 0.66]),
    glb: "/models/angel-trumpet.glb",
  },
  candle: {
    name: { en: "Christmas Candles", ml: "ക്രിസ്മസ് മെഴുകുതിരികൾ" },
    desc: { en: "Jesus is the Light of the World.", ml: "ഈശോ ലോകത്തിന്റെ പ്രകാശമാണ്." },
    height: 0.8,
    spot: s([0.46, 0.7], [0.3, 0.84]),
    glb: "/models/candle.glb",
  },
  snowflake: {
    name: { en: "Snowflake", ml: "മഞ്ഞുതുള്ളി" },
    desc: { en: "No two snowflakes are alike; God made each of us special too.", ml: "രണ്ട് മഞ്ഞുതുള്ളികളും ഒരുപോലെയല്ല; ദൈവം നമ്മെ ഓരോരുത്തരെയും പ്രത്യേകമായി സൃഷ്ടിച്ചു." },
    height: 1,
    spot: s([0.36, 0.78], [0.26, 0.92]),
    glb: "/models/snowflake.glb",
  },
  candy: {
    name: { en: "Candy Cane", ml: "മിഠായിക്കോൽ" },
    desc: { en: "Shaped like a shepherd's crook: Jesus is our Good Shepherd.", ml: "ഇടയന്റെ വടി പോലെ: ഈശോ നമ്മുടെ നല്ല ഇടയനാണ്." },
    height: 1,
    spot: s([0.42, 0.82], [0.48, 0.97]),
    glb: "/models/candy.glb",
  },
  gingerbread: {
    name: { en: "Gingerbread", ml: "ജിഞ്ചർബ്രെഡ്" },
    desc: { en: "A sweet treat to share with family at Christmas.", ml: "ക്രിസ്മസിന് കുടുംബത്തോടൊപ്പം പങ്കിടാൻ ഒരു മധുരം." },
    height: 0.8,
    spot: s([0.5, 0.86], [0.58, 0.98]),
    glb: "/models/gingerbread.glb",
  },
  socks: {
    name: { en: "Christmas Stocking", ml: "ക്രിസ്മസ് സോക്സ്" },
    desc: { en: "St. Nicholas left gifts in stockings for children in need.", ml: "വിശുദ്ധ നിക്കോളാസ് ആവശ്യക്കാരായ കുട്ടികൾക്കായി സോക്സുകളിൽ സമ്മാനങ്ങൾ വെച്ചു." },
    height: 0.9,
    spot: s([0.58, 0.9], [0.82, 0.9]),
    glb: "/models/socks.glb",
  },
  gift: {
    name: { en: "Christmas Gift", ml: "ക്രിസ്മസ് സമ്മാനം" },
    desc: { en: "Jesus is God's gift to us; Mass is where we meet Him.", ml: "ഈശോ ദൈവം നമുക്ക് നൽകിയ സമ്മാനമാണ്; വിശുദ്ധ കുർബാനയിൽ നാം അവിടുത്തെ കണ്ടുമുട്ടുന്നു." },
    height: 0.9,
    spot: s([0.66, 0.94], [0.95, 0.9]),
    glb: "/models/gift.glb",
  },
  ...decor,
};

// Pieces with a picture in public/treasures (made by scripts/treasure-art.mjs). The rest show a medallion.
const ART: PieceKey[] = [
  "olive", "donkey", "lamb", "sheep", "fire", "lilies", "firewood", "ox", "star", "hay", "shepherd1", "shepherd2", "lantern",
  "myrrh", "frankincense", "gold", "camel", "baby", "tree", "melchior", "caspar", "balthazar", "manger", "jar", "joseph", "angel", "wreath", "bell", "mary", "santa", "trumpetAngel", "candle",
  "snowflake", "candy", "gingerbread", "socks", "gift",
];
for (const k of ART) PIECES[k].image = asset(`/treasures/${k}.webp`);
for (const p of Object.values(PIECES)) if (p.glb) p.glb = asset(p.glb);

export const WORLD_KEYS: WorldKey[] = REWARDS.map((r) => r.world);
export const STREAK_KEYS = MASS_GIFTS.map(([k]) => k);
export const BONUS_KEYS = (Object.keys(PIECES) as PieceKey[]).filter(
  (k) => !WORLD_KEYS.includes(k as WorldKey) && !STREAK_KEYS.includes(k as StreakKey),
) as BonusKey[];

export const TREE_NAMES: Record<TreeKey, Name> = {
  tree: { en: "Christmas tree", ml: "ക്രിസ്മസ് ട്രീ" },
  lights: { en: "First lights", ml: "ആദ്യ വിളക്കുകൾ" },
  red: { en: "Red bauble", ml: "ചുവന്ന ബോൾ" },
  gold: { en: "Gold bauble", ml: "സ്വർണ്ണ ബോൾ" },
  ribbon: { en: "Ribbon", ml: "റിബൺ" },
  bell: { en: "Bell", ml: "മണി" },
  lightString: { en: "Light string", ml: "വിളക്കുമാല" },
  green: { en: "Green ornament", ml: "പച്ച അലങ്കാരം" },
  white: { en: "White ornament", ml: "വെള്ള അലങ്കാരം" },
  garland: { en: "Golden garland", ml: "സ്വർണ്ണമാല" },
  star: { en: "Star ornament", ml: "നക്ഷത്ര അലങ്കാരം" },
  blue: { en: "Blue ornament", ml: "നീല അലങ്കാരം" },
  snowflake: { en: "Snowflake", ml: "ഹിമകണം" },
  candle: { en: "Warm lights", ml: "മെഴുകുതിരി വെളിച്ചം" },
  shepherd: { en: "Shepherd ornament", ml: "ഇടയന്റെ അലങ്കാരം" },
  wood: { en: "Wooden decoration", ml: "മരം കൊണ്ടുള്ള അലങ്കാരം" },
  sheep: { en: "Sheep ornament", ml: "ആട്ടിൻകുട്ടി അലങ്കാരം" },
  silverbell: { en: "Silver bell", ml: "വെള്ളി മണി" },
  angel: { en: "Angel ornament", ml: "മാലാഖ അലങ്കാരം" },
  blueribbon: { en: "Blue ribbon", ml: "നീല റിബൺ" },
  goldribbon: { en: "Gold ribbon", ml: "സ്വർണ്ണ റിബൺ" },
  goldstar: { en: "Golden star", ml: "സ്വർണ്ണ നക്ഷത്രം" },
  dove: { en: "Dove of peace (special)", ml: "സമാധാനത്തിന്റെ പ്രാവ്" },
  topper: { en: "Tree topper", ml: "ട്രീയുടെ മുകളിലെ നക്ഷത്രം" },
  celebration: { en: "Christmas celebration", ml: "ക്രിസ്മസ് ആഘോഷം" },
};

export const STABLE_PARTS: WorldKey[] = ["hay", "manger", "donkey", "ox", "joseph", "mary", "baby"];

export const rewardForDay = (day: number) => REWARDS.find((r) => r.day === day);
export const dayOf = (key: WorldKey) => REWARDS.find((r) => r.world === key)!.day;

/** Day treasures the child has earned (task done). Baby Jesus waits for Christmas Day; then the Holy Family is there for everyone. */
export function visibleWorld(days: number[], christmas: boolean): Set<WorldKey> {
  const set = new Set(REWARDS.filter((r) => days.includes(r.day)).map((r) => r.world));
  set.delete("baby");
  if (christmas) for (const k of ["manger", "mary", "joseph", "baby"] as const) set.add(k);
  return set;
}

/** Where each placed piece stands in one painting: [u, v, turn]. */
export type Placement = Partial<Record<PieceKey, [number, number, number]>>;
/**
 * Spots are per painting, because the same [u, v] is a different place in the tall and the wide picture.
 * A piece in neither is still in the treasure chest; a piece placed in only one stands on its default spot in the other.
 */
export type VillageLayout = Record<PaintingKey, Placement>;

export const isPlaced = (l: VillageLayout, k: PieceKey) => !!(l.tall[k] || l.wide[k]);

function cleanPlacement(raw: unknown, unlocked: Set<PieceKey>, painting: PaintingKey): Placement {
  const out: Placement = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [k, v] of Object.entries(raw)) {
    if (!(k in PIECES) || !unlocked.has(k as PieceKey) || !Array.isArray(v) || v.length !== 3) continue;
    const [u, w, turn] = v;
    if (![u, w, turn].every((n) => typeof n === "number" && Number.isFinite(n)) || u < 0 || u > 1 || w < 0 || w > 1) continue;
    const piece = PIECES[k as PieceKey];
    // A spot saved on an older background can land on a wall or rock of the new one: back to its default spot.
    out[k as PieceKey] = piece.sky || walkable(painting, [u, w]) ? [u, w, turn] : [...piece.spot[painting], turn];
  }
  return out;
}

/** Keeps only known, unlocked pieces with numbers in range; anything else from storage or the network is dropped. */
export function sanitizeLayout(raw: unknown, unlocked: Set<PieceKey>): VillageLayout {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<Record<PaintingKey, unknown>>;
  return { tall: cleanPlacement(r.tall, unlocked, "tall"), wide: cleanPlacement(r.wide, unlocked, "wide") };
}

// Where a piece may stand: the painted ground, minus rocks, walls and the tree. Traced by eye in painting pixels.
type Px = [number, number];
type Rect = [number, number, number, number]; // left, top, right, bottom
const GROUND: Record<PaintingKey, { size: Px; area: Px[]; blocked: Rect[] }> = {
  tall: {
    size: [1330, 1182],
    area: [[0, 621], [384, 584], [709, 458], [1330, 443], [1330, 1182], [0, 1182]],
    blocked: [
      [377, 369, 1020, 717],
      [414, 717, 609, 798],
      [904, 717, 987, 768],
      [1020, 488, 1271, 768],
      [0, 296, 495, 606],
      [30, 680, 170, 739],
      [266, 643, 355, 672],
      [1204, 746, 1300, 783],
      [0, 961, 177, 1086],
      [1005, 1064, 1153, 1167],
    ],
  },
  wide: {
    size: [1939, 811],
    area: [[0, 526], [609, 416], [1385, 249], [1939, 222], [1939, 812], [0, 812]],
    blocked: [
      [561, 180, 1413, 616],
      [616, 609, 873, 693],
      [1274, 609, 1371, 658],
      [1440, 305, 1787, 651],
      [0, 152, 609, 492],
      [28, 526, 145, 575],
      [83, 706, 249, 812],
      [1655, 699, 1801, 796],
      [443, 589, 512, 623],
      [533, 609, 596, 640],
      [1454, 623, 1537, 665],
      [1710, 637, 1787, 665],
    ],
  },
};

function inside(poly: Px[], x: number, y: number) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

/** Can a piece's feet stand at this spot of the painting? */
export function walkable(k: PaintingKey, [u, v]: Spot) {
  const g = GROUND[k];
  const x = u * g.size[0];
  const y = v * g.size[1];
  return inside(g.area, x, y) && !g.blocked.some(([l, t, r, b]) => x >= l && x <= r && y >= t && y <= b);
}
