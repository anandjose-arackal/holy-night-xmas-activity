import assert from "node:assert/strict";
import { test } from "node:test";
import { ANCHORS, MAX_ORNAMENTS, nearestFree, sanitize } from "./tree.ts";

const all = Array.from({ length: 25 }, (_, i) => i + 1);

test("anchors fit the database limit and are spaced apart", () => {
  assert.ok(ANCHORS.length > 60 && ANCHORS.length < 200, `got ${ANCHORS.length}`);
  for (let i = 0; i < ANCHORS.length; i++)
    for (let j = i + 1; j < ANCHORS.length; j++) {
      const [a, b] = [ANCHORS[i], ANCHORS[j]];
      assert.ok(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) > 0.2, `anchors ${i} and ${j} overlap`);
    }
});

test("nearestFree snaps to the closest free anchor and skips taken ones", () => {
  const [x, y, z] = ANCHORS[5];
  assert.equal(nearestFree({ x, y, z }, new Set()), 5);
  assert.notEqual(nearestFree({ x, y, z }, new Set([5])), 5);
  assert.equal(nearestFree({ x: 50, y: 50, z: 50 }, new Set()), -1);
});

test("sanitize drops locked, unknown, duplicate and out-of-range ornaments", () => {
  const raw = {
    items: [
      { k: "red", a: 1 },
      { k: "red", a: 1 }, // duplicate anchor
      { k: "dove", a: 2 }, // day 23 not done
      { k: "unicorn", a: 3 },
      { k: "gold", a: 999 },
      { k: "gold", a: 1.5 },
      { k: "gold", a: 4, extra: "x" },
    ],
    lights: true,
    color: "candle", // day 14 not done
  };
  const s = sanitize(raw, [1, 2, 3, 4]);
  assert.deepEqual(s.items, [
    { k: "red", a: 1 },
    { k: "gold", a: 4 },
  ]);
  assert.equal(s.color, "champagne");
  assert.equal(s.lights, true);
});

test("sanitize turns lights off until they are unlocked and caps the count", () => {
  assert.equal(sanitize({ lights: true }, [1]).lights, false);
  const items = ANCHORS.map((_, a) => ({ k: "red", a }));
  assert.equal(sanitize({ items }, all).items.length, MAX_ORNAMENTS);
  assert.deepEqual(sanitize("garbage", []).items, []);
});
