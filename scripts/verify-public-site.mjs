#!/usr/bin/env node
// Run against `next start`, not the dev server: the production device gate matters.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import http from "node:http";
import https from "node:https";

const origin = process.argv[2] || "http://127.0.0.1:3000";
const routes = [
  "/",
  "/about",
  "/explore",
  "/principles",
  "/updates",
  "/download",
  "/journeys",
  "/architect",
  ...["tempus", "hope", "vitae", "arcnet", "mana"].map(
    (slug) => `/explore/${slug}`,
  ),
];
const agents = {
  desktop: "Mozilla/5.0 (X11; Linux x86_64)",
  mobile: "Mozilla/5.0 (Linux; Android 14) Mobile",
};
let checks = 0;
// Native fetch can override Host with the URL hostname. Use an HTTP request
// here so this test actually exercises the production domain rules locally.
function requestHost(path, host, userAgent) {
  const url = new URL(path, origin);
  return new Promise((resolve, reject) => {
    const request = (url.protocol === "https:" ? https : http).get(
      url,
      {
        headers: { Host: host, "User-Agent": userAgent },
      },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () =>
          resolve({ status: response.statusCode, body: Buffer.concat(chunks) }),
        );
        response.on("error", reject);
      },
    );
    request.setTimeout(15000, () =>
      request.destroy(new Error("Host probe timed out")),
    );
    request.on("error", reject);
  });
}
// Host routing is exercised against the production server, not a mock of
// next.config. Similar names must not acquire another hostname's landing page.
for (const ua of Object.values(agents)) {
  for (const [host, heading] of [
    ["the-arcanum.net", "A Human Journey."],
    ["updates.the-arcanum.net", "Take Arcanum with you."],
    ["journeys.the-arcanum.net", "Go somewhere. Come back with a question."],
    ["architect.the-arcanum.net", "Follow the build."],
    ["architectXthe-arcanumYnet", "A Human Journey."],
    ["journeysXthe-arcanumYnet", "A Human Journey."],
    ["journeys.the-arcanum.net.example.org", "A Human Journey."],
  ]) {
    const response = await requestHost("/?from=verification", host, ua);
    assert.equal(
      response.status,
      200,
      `${host} landing remains directly available`,
    );
    const html = response.body.toString("utf8");
    assert.ok(
      html.match(/<h1[\s\S]*?<\/h1>/)?.[0].includes(heading),
      `${host} has the intended landing`,
    );
    assert.ok(
      html.includes('href="https://the-arcanum.net/"'),
      "Every lane can return to Arcanum",
    );
    if (host === "architect.the-arcanum.net") {
      assert.doesNotMatch(
        html,
        /app\.notion\.com|drive\.google\.com|docs\.google\.com|chatgpt\.com\/agents/,
        "Public dashboard excludes private provider links",
      );
      assert.match(html, /That access system is not implemented here/);
    }
    checks++;
  }
}
const approvedRelease = JSON.parse(
  await readFile(
    new URL("../apps/web/public/updates/release.json", import.meta.url),
  ),
);
for (const path of [
  "/updates/release.json",
  new URL(approvedRelease.manifestUrl).pathname,
  new URL(approvedRelease.apkUrl).pathname,
]) {
  const response = await requestHost(
    path,
    "updates.the-arcanum.net",
    agents.desktop,
  );
  assert.equal(
    response.status,
    200,
    `${path} has no redirect after hostname routing`,
  );
  const bytes = response.body;
  const original = await readFile(
    new URL(`../apps/web/public${path}`, import.meta.url),
  );
  assert.deepEqual(bytes, original, `${path} bytes remain unchanged`);
  if (path.endsWith(".apk")) {
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      approvedRelease.sha256,
    );
  }
  checks++;
}
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
      const listing = await fetch(new URL("/updates/release.json", origin), {
        redirect: "manual",
      });
      assert.equal(listing.status, 200, "Release listing is directly public");
      assert.match(listing.headers.get("cache-control"), /no-store/);
      assert.match(listing.headers.get("cache-control"), /max-age=0/);
      const release = await listing.json();
      assert.match(html, /Approved development release/);
      assert.ok(
        html.includes(`href="${release.apkUrl}"`),
        "Page APK agrees with approved listing",
      );
      assert.ok(
        html.includes(release.sha256),
        "Page hash agrees with approved listing",
      );
      assert.ok(
        html.includes(release.signerSha256),
        "Page signer agrees with approved listing",
      );
      assert.ok(
        html.includes(`href="${release.manifestUrl}"`),
        "Page manifest agrees with approved listing",
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
assert.equal(log.apkPublication, "verified-development-candidate");
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
  `PASS public site: ${checks} route/log/gate cases, both device classes; verified development APK offered.`,
);
