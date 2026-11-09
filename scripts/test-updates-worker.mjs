import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";
const origin = "https://updates.example.test";
const listeners = {};
const entries = new Map();
let offline = false;
const key = (value) =>
  new URL(
    typeof value === "string" ? value : (value.url ?? String(value)),
    origin,
  ).href;
const cache = {
  match: async (value) => entries.get(key(value))?.clone(),
  put: async (value, response) => entries.set(key(value), response.clone()),
  keys: async () => [...entries.keys()].map((url) => ({ url })),
  delete: async (value) => entries.delete(key(value)),
};
const fetch = async (value) => {
  if (offline) throw new Error("offline fixture");
  const url = new URL(key(value));
  if (url.pathname.startsWith("/_next/static/"))
    return new Response("public build asset", {
      headers: {
        "content-type": url.pathname.endsWith(".css")
          ? "text/css"
          : "application/javascript",
      },
    });
  if (url.pathname.endsWith(".png"))
    return new Response("icon", { headers: { "content-type": "image/png" } });
  if (url.pathname.endsWith("offline.html"))
    return new Response("Saved offline fallback", {
      headers: { "content-type": "text/html" },
    });
  return new Response(
    '<main data-updates-shell="true">Updates</main><script src="/_next/static/app.js"></script><link rel="stylesheet" href="/_next/static/app.css">',
    { headers: { "content-type": "text/html" } },
  );
};
vm.runInNewContext(
  await readFile(
    new URL("../apps/web/public/updates-sw.js", import.meta.url),
    "utf8",
  ),
  {
    self: {
      location: { origin },
      skipWaiting() {},
      clients: { claim: async () => {} },
      addEventListener(type, handler) {
        listeners[type] = handler;
      },
    },
    caches: {
      open: async () => cache,
      keys: async () => ["arcanum-updates-v1", "unrelated-cache"],
      delete: async () => true,
    },
    fetch,
    URL,
    Response,
    Promise,
  },
);
let install;
listeners.install({
  waitUntil(value) {
    install = value;
  },
});
await install;
assert.ok(entries.has(origin + "/_next/static/app.js"));
assert.ok(entries.has(origin + "/_next/static/app.css"));
function request(path, mode = "navigate") {
  let response;
  listeners.fetch({
    request: { url: origin + path, method: "GET", mode },
    respondWith(value) {
      response = value;
    },
  });
  return response;
}
for (const path of [
  "/architect/review",
  "/api/auth/session",
  "/updates/release.json",
  "/updates/a18/app.apk",
  "/walkthrough/app.apk",
  "/updates/manifest.webmanifest",
])
  assert.equal(request(path), undefined, `${path} must bypass this cache`);
offline = true;
assert.match(await (await request("/updates")).text(), /Updates/);
assert.match(
  await (await request("/updates/not-saved")).text(),
  /Saved offline fallback/,
);
assert.match(
  await (await request("/_next/static/app.css", "cors")).text(),
  /public build asset/,
);
assert.ok(
  ![...entries.keys()].some(
    (url) =>
      url.includes(".apk") ||
      url.includes("/architect") ||
      url.includes("/api/"),
  ),
);
console.log(
  "PASS Updates worker fixture: saved HTML/assets, offline fallback, private/API/APK exclusions. Browser installation is a separate device check.",
);
