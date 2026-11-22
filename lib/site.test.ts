import assert from "node:assert/strict";
import { test } from "node:test";
import { siteFor } from "./site.ts";

test("a diocese subdomain picks its diocese; anything else is the Kerala State site", () => {
  assert.deepEqual(siteFor("thamarassery.ourcml.in"), { diocese: "Thamarassery", subtitle: "Thamarassery Diocese" });
  assert.deepEqual(siteFor("Thamarassery.localhost"), { diocese: "Thamarassery", subtitle: "Thamarassery Diocese" });
  assert.deepEqual(siteFor("xmas.ourcml.in"), { diocese: null, subtitle: "Kerala State" });
  assert.deepEqual(siteFor("ourcml.in"), { diocese: null, subtitle: "Kerala State" });
  assert.deepEqual(siteFor(""), { diocese: null, subtitle: "Kerala State" });
});
