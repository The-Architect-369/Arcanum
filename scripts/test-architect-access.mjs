import assert from "node:assert/strict";
import { test } from "node:test";
import {
  allowedArchitect,
  architectOrigin,
} from "../apps/web/src/lib/architect-access.ts";
const owner = "the-architect@the-arcanum.net";
const valid = {
  sub: "google-subject",
  email: owner,
  email_verified: true,
  hd: "the-arcanum.net",
};
test("only the exact verified Workspace owner is allowed", () => {
  assert.equal(allowedArchitect(valid, owner), true);
  assert.equal(
    allowedArchitect({ ...valid, email: owner.toUpperCase() }, owner),
    true,
  );
  for (const profile of [
    { ...valid, email: "someone@the-arcanum.net" },
    { ...valid, email: "the-architect@the-arcanum.net.attacker.test" },
    { ...valid, email_verified: false },
    { ...valid, email_verified: "true" },
    { ...valid, hd: undefined },
    { ...valid, hd: "attacker.test" },
    { ...valid, sub: "" },
    { ...valid, sub: undefined },
    {},
  ])
    assert.equal(allowedArchitect(profile, owner), false);
  assert.equal(allowedArchitect(valid, undefined), false);
  assert.equal(allowedArchitect(valid, ""), false);
});
test("production OAuth origin cannot be redirected to siblings or lookalikes", () => {
  const prior = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  try {
    assert.equal(
      architectOrigin("https://architect.the-arcanum.net"),
      "https://architect.the-arcanum.net",
    );
    for (const value of [
      undefined,
      "https://the-arcanum.net",
      "https://updates.the-arcanum.net",
      "https://architect.the-arcanum.net.attacker.test",
      "http://architect.the-arcanum.net",
      "http://localhost:3000",
      "https://architect.the-arcanum.net/elsewhere",
      "https://user:pass@architect.the-arcanum.net",
      "https://architect.the-arcanum.net?redirect=elsewhere",
    ])
      assert.equal(architectOrigin(value), null);
  } finally {
    process.env.NODE_ENV = prior;
  }
});
