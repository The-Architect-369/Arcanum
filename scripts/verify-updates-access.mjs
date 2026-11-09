import assert from "node:assert/strict";
import http from "node:http";
import { readFile } from "node:fs/promises";
const origin = process.argv[2] ?? "http://127.0.0.1:3126";
let checks = 0;
function request(path, host = "updates.the-arcanum.net", extra = {}) {
  return new Promise((resolve, reject) => {
    const req = http.get(
      new URL(path, origin),
      {
        headers: { Host: host, "User-Agent": "Mozilla/5.0 Desktop", ...extra },
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () =>
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks).toString(),
          }),
        );
      },
    );
    req.on("error", reject);
    req.setTimeout(15000, () => req.destroy(new Error("timeout")));
  });
}
for (const ua of ["Mozilla/5.0 Desktop", "Mozilla/5.0 Android Mobile"]) {
  for (const view of ["feed", "app", "roadmap", "website", "history"]) {
    const r = await request(`/?view=${view}`, undefined, { "User-Agent": ua });
    assert.equal(r.status, 200);
    assert.match(r.body, /<h1>Arcanum Updates<\/h1>/);
    assert.match(
      r.body,
      new RegExp(`href="\\?view=${view}" aria-current="page"`),
    );
    assert.doesNotMatch(
      r.body,
      /drive\.google\.com|a20recoverytest|5ad17c03|arcanum-a20-review-106\.apk/,
    );
    checks++;
  }
  const r = await request("/updates/a19-core-integrated", undefined, {
    "User-Agent": ua,
  });
  assert.equal(r.status, 200);
  assert.match(r.body, /A19 core is integrated/);
  checks++;
  const missing = await request("/updates/not-a-real-post", undefined, {
    "User-Agent": ua,
  });
  assert.equal(missing.status, 404);
  checks++;
  for (const suffix of ["", "?install=1"]) {
    const r = await request(
      "/architect/review" + suffix,
      "architect.the-arcanum.net",
      { "User-Agent": ua, Cookie: "authjs.session-token=forged" },
    );
    assert.equal(r.status, 307);
    assert.match(r.headers.location, /architect\/login/);
    assert.match(r.headers["cache-control"], /no-store/);
    assert.doesNotMatch(r.body, /Welcome back|5ad17c03/);
    checks++;
  }
}
const login = await request("/architect/login", "architect.the-arcanum.net");
assert.equal(login.status, 200);
assert.match(login.body, /being set up/);
assert.doesNotMatch(login.body, /Continue with Google/);
checks++;
const session = await request("/api/auth/session", "architect.the-arcanum.net");
assert.equal(session.status, 503);
assert.match(session.headers["cache-control"], /no-store/);
checks++;
const release = await request("/updates/release.json");
assert.equal(release.status, 200);
const data = JSON.parse(release.body);
assert.equal(data.versionCode, 34);
assert.equal(data.sourceCommit, "75cad68cb3733a44b5b13bcea153f2f77dfa7bda");
checks++;
const original = await readFile(
  new URL("../apps/web/public/updates/release.json", import.meta.url),
  "utf8",
);
assert.equal(release.body, original);
checks++;
const sw = await request("/sw.js");
assert.match(sw.body, /arcanum-shell-v2/);
assert.match(sw.body, /url.pathname.startsWith\("\/architect"\)/);
assert.match(sw.body, /url.pathname.startsWith\("\/api\/auth"\)/);
checks++;
console.log(
  `PASS ${checks} production HTTP access/content cases; Google login and browser rendering not tested.`,
);
