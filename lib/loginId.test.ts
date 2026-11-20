import assert from "node:assert/strict";
import { test } from "node:test";
import { phoneEmail, readId } from "./loginId.ts";

test("one box takes an email or a phone number", () => {
  assert.deepEqual(readId(" a@b.co "), { email: "a@b.co" });
  assert.deepEqual(readId("98765 43210"), { phone: "+919876543210" }); // 10 digits: India
  assert.deepEqual(readId("+1 (555) 010-9999"), { phone: "+15550109999" });
  assert.deepEqual(readId("00447911123456"), { phone: "+447911123456" });
  assert.deepEqual(readId("09876543210"), { phone: "+919876543210" });
  assert.deepEqual(readId("919876543210"), { phone: "+919876543210" });
  assert.equal(readId("12345"), null);
  assert.equal(readId("abc@"), null);
  assert.equal(readId("919876543210@OurCML.com"), null); // a phone account's hidden address
});

test("a phone number signs in as its hidden email", () => {
  assert.equal(phoneEmail("+919876543210"), "919876543210@ourcml.com");
});
