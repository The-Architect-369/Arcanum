#!/usr/bin/env node
// Run against `next start`, not the dev server: the production device gate matters.
import assert from "node:assert/strict";

const origin = process.argv[2] || "http://127.0.0.1:3000";
const routes = [
  "/",
  "/about",
  "/explore",
  "/principles",
  "/updates",
  "/download",
  ...["tempus", "hope", "vitae", "arcnet", "mana"].map(
    (slug) => `/explore/${slug}`,
  ),
];
const agents = {
  desktop: "Mozilla/5.0 (X11; Linux x86_64)",
  mobile: "Mozilla/5.0 (Linux; Android 14) Mobile",
};
let checks = 0;
for (const [device, ua] of Object.entries(agents)) {
  for (const path of routes) {
    const response = await fetch(new URL(path, origin), {
      headers: { "User-Agent": ua },
      redirect: "manual",
    });
    assert.equal(
      response.status,
      200,
      `${device} ${path} must be directly public`,
    );
    const html = await response.text();
    assert.match(html, /id="public-main"/, `${path} has public content`);
    assert.equal(
      (html.match(/<h1[ >]/g) || []).length,
      1,
      `${path} has one primary heading`,
    );
    assert.match(
      html,
      /name="viewport"[^>]*user-scalable=yes/,
      `${path} permits zoom`,
    );
    for (const link of html.matchAll(/href="(\/[^"?#]*)[^"]*"/g)) {
      if (link[1].startsWith("/_next/") || /\.(svg|ico|json)$/.test(link[1]))
        continue;
      assert.ok(
        routes.includes(link[1]),
        `${path} links to a known public route: ${link[1]}`,
      );
    }
    if (path === "/download") {
      assert.match(html, /Release pending/);
      assert.doesNotMatch(
        html,
        /href="[^"]*\.apk(?:["?#])/i,
        "No unverified APK link",
      );
    }
    checks++;
  }
}
const logResponse = await fetch(new URL("/site-log.json", origin));
assert.equal(logResponse.status, 200);
assert.match(logResponse.headers.get("content-type"), /application\/json/);
assert.match(logResponse.headers.get("cache-control"), /max-age=0/);
const log = await logResponse.json();
assert.equal(log.schema, "arcanum.public-site-log/v1");
assert.equal(log.apkPublication, "paused");
assert.equal(log.authorityEffect, "none");
assert.match(log.scope, /not a TempusAnchor/);
assert.equal(
  new Set(log.entries.map((entry) => entry.id)).size,
  log.entries.length,
);
for (const entry of log.entries)
  assert.match(entry.date, /^\d{4}-\d{2}-\d{2}$/);
checks++;
for (const path of ["/app", "/alpha"]) {
  const response = await fetch(new URL(path, origin), {
    headers: { "User-Agent": agents.desktop },
    redirect: "manual",
  });
  assert.equal(response.status, 307, "Existing desktop alpha gate must remain");
  assert.equal(
    new URL(response.headers.get("location"), origin).pathname,
    "/mobile-only",
  );
  checks++;
}
console.log(
  `PASS public site: ${checks} route/log/gate cases, both device classes; no APK offered.`,
);
