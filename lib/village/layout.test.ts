import assert from "node:assert/strict";
import { test } from "node:test";
import { PIECES, REWARDS, sanitizeLayout, visibleWorld, walkable, type PaintingKey, type PieceKey, type WorldKey } from "./layout.ts";

test("every day 1..27 has exactly one reward, and every treasure is a different piece", () => {
  assert.deepEqual(REWARDS.map((r) => r.day), Array.from({ length: 27 }, (_, i) => i + 1));
  assert.equal(new Set(REWARDS.map((r) => r.world)).size, 27);
});

test("every piece starts on walkable ground in both paintings (sky pieces inside the picture)", () => {
  for (const painting of ["tall", "wide"] as PaintingKey[])
    for (const [k, p] of Object.entries(PIECES)) {
      const [u, v] = p.spot[painting];
      assert.ok(u >= 0 && u <= 1 && v >= 0 && v <= 1, `${k} is outside the ${painting} painting`);
      if (!p.sky) assert.ok(walkable(painting, p.spot[painting]), `${k} starts off the ground in the ${painting} painting`);
    }
});

test("only completed days show, and Baby Jesus waits for Christmas", () => {
  const all = REWARDS.map((r) => r.day);
  assert.deepEqual([...visibleWorld([3, 4], false)], ["wreath", "fire"]);
  assert.equal(visibleWorld(all, false).has("baby"), false);
  assert.equal(visibleWorld(all, false).has("joseph"), true);
});

test("on Christmas the Holy Family is there for everyone", () => {
  const v = visibleWorld([], true);
  for (const k of ["manger", "mary", "joseph", "baby"] as WorldKey[]) assert.equal(v.has(k), true);
  assert.equal(v.has("ox"), false);
});

test("sanitizeLayout keeps unlocked pieces with spots in range only, per painting", () => {
  const unlocked = new Set<PieceKey>(["wreath", "snowman"]);
  const tall = { wreath: [0.2, 0.7, 1], snowman: [2, 0.5, 0], ox: [0.5, 0.7, 0], unicorn: [0.5, 0.5, 0], bell: "x" };
  assert.deepEqual(sanitizeLayout({ tall, wide: "x" }, unlocked), { tall: { wreath: [0.2, 0.7, 1] }, wide: {} });
  assert.deepEqual(sanitizeLayout(null, unlocked), { tall: {}, wide: {} });
});

test("walkable: lawn, path and stable floor yes; sky, rocks and walls no", () => {
  assert.ok(walkable("tall", [0.3, 0.75])); // lawn
  assert.ok(walkable("tall", [0.57, 0.64])); // stable floor
  assert.ok(!walkable("tall", [0.5, 0.2])); // sky
  assert.ok(!walkable("tall", [0.05, 0.6])); // rock
  assert.ok(!walkable("tall", [0.55, 0.5])); // stable wall
  assert.ok(walkable("wide", [0.55, 0.8])); // stable floor
  assert.ok(!walkable("wide", [0.04, 0.68])); // rock
});

test("sanitizeLayout sends a piece saved on a wall back to its default spot", () => {
  const unlocked = new Set<PieceKey>(["baby"]);
  const out = sanitizeLayout({ tall: {}, wide: { baby: [0.55, 0.5, 2] } }, unlocked); // inside the stable's wall
  assert.deepEqual(out.wide.baby, [...PIECES.baby.spot.wide, 2]);
});
