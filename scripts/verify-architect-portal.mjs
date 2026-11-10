import assert from "node:assert/strict";
import http from "node:http";
import net from "node:net";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { randomBytes } from "node:crypto";
import { fixtureStore, CANARY } from "./fixtures/architect-store.mjs";
const require = createRequire(
  new URL("../apps/web/package.json", import.meta.url),
);
const { encode } = await import(
  pathToFileURL(require.resolve("next-auth/jwt"))
);
const dir = await mkdtemp(path.join(tmpdir(), "architect-http-")),
  file = path.join(dir, "store.json");
let data = fixtureStore();
await writeFile(file, JSON.stringify(data), { mode: 0o600 });
const secret = randomBytes(48).toString("hex"),
  reservation = net.createServer();
await new Promise((r) => reservation.listen(0, "127.0.0.1", r));
const port = reservation.address().port;
await new Promise((r) => reservation.close(r));
const server = spawn(
  process.execPath,
  [
    require.resolve("next/dist/bin/next"),
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    String(port),
  ],
  {
    cwd: new URL("../apps/web", import.meta.url),
    env: {
      ...process.env,
      VERCEL_ENV: "production",
      AUTH_URL: "https://architect.the-arcanum.net",
      AUTH_SECRET: secret,
      AUTH_GOOGLE_ID: "synthetic-client",
      AUTH_GOOGLE_SECRET: "synthetic-secret",
      ARCHITECT_GOOGLE_EMAIL: "the-architect@the-arcanum.net",
      ARCHITECT_STORE_PATH: file,
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let logs = "",
  checks = 0;
server.stdout.on("data", (b) => (logs += b));
server.stderr.on("data", (b) => (logs += b));
const salt = "__Secure-authjs.session-token";
const identity = {
  sub: "synthetic-owner",
  email: "the-architect@the-arcanum.net",
  architect: true,
  architectMemberId: "owner",
  architectVersion: 1,
  googleSubject: "synthetic-owner",
  googleEmailVerified: true,
  googleHostedDomain: "the-arcanum.net",
};
const cookie = async (token = identity, key = secret, maxAge = 3600) =>
  `${salt}=${await encode({ secret: key, salt, token, maxAge })}`;
function request(
  route,
  {
    cookie,
    host = "architect.the-arcanum.net",
    headers = {},
    method = "GET",
    body,
  } = {},
) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      `http://127.0.0.1:${port}${route}`,
      {
        method,
        headers: {
          Host: host,
          ...(cookie ? { Cookie: cookie } : {}),
          ...headers,
        },
      },
      (res) => {
        let b = "";
        res.on("data", (x) => (b += x));
        res.on("end", () =>
          resolve({ status: res.statusCode, body: b, headers: res.headers }),
        );
      },
    );
    req.on("error", reject);
    req.setTimeout(15000, () => req.destroy(new Error("Request timeout")));
    req.end(body);
  });
}
const save = () => writeFile(file, JSON.stringify(data));
try {
  for (let i = 0; i < 80; i++) {
    try {
      await request("/api/auth/providers");
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 150));
    }
  }
  for (const route of [
    "/api/architect/records",
    "/architect/review",
    "/architect/review?_rsc=probe",
  ]) {
    const r = await request(route, { headers: { RSC: "1" } });
    assert.ok([401, 307, 200].includes(r.status));
    assert.ok(!r.body.includes(CANARY));
    assert.match(r.headers["cache-control"], /no-store/);
    checks++;
  }
  const approved = await request("/api/architect/records", {
    cookie: await cookie(),
  });
  assert.equal(approved.status, 200);
  const model = JSON.parse(approved.body);
  assert.ok(approved.body.includes(CANARY));
  assert.equal(model.members, undefined);
  assert.ok(!approved.body.includes("viewer@example.test"));
  assert.match(approved.headers["cache-control"], /no-store/);
  checks++;
  const html = await request("/architect/review", { cookie: await cookie() });
  assert.equal(html.status, 200);
  assert.ok(html.body.includes(CANARY));
  checks++;
  const viewer = {
    ...identity,
    sub: "synthetic-viewer",
    email: "viewer@example.test",
    googleSubject: "synthetic-viewer",
    googleHostedDomain: "example.test",
    architectMemberId: "viewer",
  };
  const shared = await request("/api/architect/records", {
    cookie: await cookie(viewer),
  });
  assert.equal(shared.status, 200);
  assert.deepEqual(JSON.parse(shared.body).events, model.events);
  checks++;
  for (const token of [
    { ...identity, email: "other@the-arcanum.net", googleSubject: "other" },
    { ...identity, googleEmailVerified: false },
    { ...identity, googleHostedDomain: "wrong.test" },
    { ...identity, architectMemberId: "viewer" },
    { ...identity, architectVersion: 0 },
    { ...identity, googleSubject: "other" },
    { ...identity, architect: false },
  ]) {
    const r = await request("/api/architect/records", {
      cookie: await cookie(token),
    });
    assert.equal(r.status, 401);
    assert.ok(!r.body.includes(CANARY));
    checks++;
  }
  for (const encoded of [
    await cookie(identity, "wrong-key"),
    await cookie(identity, secret, -3600),
  ]) {
    const r = await request("/api/architect/records", { cookie: encoded });
    assert.equal(r.status, 401);
    checks++;
  }
  const alias = await request("/api/architect/records", {
    cookie: await cookie(),
    host: "updates.the-arcanum.net",
    headers: { "X-Forwarded-Host": "architect.the-arcanum.net" },
  });
  assert.equal(alias.status, 403);
  assert.ok(!alias.body.includes(CANARY));
  checks++;
  data.members[0].active = false;
  await save();
  assert.equal(
    (await request("/api/architect/records", { cookie: await cookie() }))
      .status,
    401,
  );
  assert.equal(
    (await request("/api/architect/records", { cookie: await cookie(viewer) }))
      .status,
    200,
  );
  checks += 2;
  data.members[0].active = true;
  data.members[0].version = 2;
  await save();
  assert.equal(
    (await request("/api/architect/records", { cookie: await cookie() }))
      .status,
    401,
  );
  const fresh = await cookie({ ...identity, architectVersion: 2 });
  assert.equal(
    (await request("/api/architect/records", { cookie: fresh })).status,
    200,
  );
  checks += 2;
  const extra = {
    ...data.events[1],
    id: "fixture/new",
    sourceOrder: 3,
    milestoneState: "accepted",
    status: "human_accepted",
    title: "Synthetic newer milestone",
  };
  data.events.push(extra);
  await save();
  const updated = JSON.parse(
    (await request("/api/architect/records", { cookie: fresh })).body,
  );
  assert.equal(updated.events.length, 3);
  assert.ok(updated.events.some((e) => e.id === "fixture/one"));
  checks++;
  data.sources[0].state = "unreachable";
  await save();
  const stale = JSON.parse(
    (await request("/api/architect/records", { cookie: fresh })).body,
  );
  assert.equal(stale.sources[0].state, "unreachable");
  assert.equal(stale.events.length, 3);
  checks++;
  await writeFile(file, "invalid private state");
  const invalid = await request("/api/architect/records", { cookie: fresh });
  assert.equal(invalid.status, 503);
  assert.ok(!invalid.body.includes(CANARY));
  checks++;
  await save();
  const post = await request("/api/architect/records", {
    cookie: fresh,
    method: "POST",
    body: "{}",
  });
  assert.equal(post.status, 405);
  checks++;
  assert.equal((await request("/architect/preview")).status, 404);
  checks++;
  const csrf = await request("/api/auth/csrf");
  assert.equal(csrf.status, 200);
  const csrfCookie = (csrf.headers["set-cookie"] ?? [])
    .map((x) => x.split(";")[0])
    .join("; ");
  const token = JSON.parse(csrf.body).csrfToken;
  const logout = await request("/api/auth/signout", {
    method: "POST",
    cookie: fresh + "; " + csrfCookie,
    headers: {
      Origin: "https://architect.the-arcanum.net",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      csrfToken: token,
      callbackUrl: "https://attacker.test/",
    }).toString(),
  });
  assert.ok([302, 303].includes(logout.status));
  assert.ok(
    logout.headers.location.startsWith("https://architect.the-arcanum.net/"),
  );
  assert.ok(
    (logout.headers["set-cookie"] ?? []).some(
      (x) => x.startsWith(salt + "=;") && /Max-Age=0/.test(x),
    ),
  );
  checks++;
  assert.ok(!logs.includes(CANARY));
  assert.ok(!logs.includes(secret));
  console.log(
    `PASS ${checks} protected HTTP/session/revocation/read-model/logout cases. Google identity exchange and physical cookies are not verified.`,
  );
} finally {
  server.kill("SIGTERM");
  await new Promise((r) => server.once("exit", r));
  await rm(dir, { recursive: true, force: true });
}
