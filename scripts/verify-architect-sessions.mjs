import assert from "node:assert/strict";
import http from "node:http";
import net from "node:net";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
const require = createRequire(
  new URL("../apps/web/package.json", import.meta.url),
);
const { encode } = await import(
  pathToFileURL(require.resolve("next-auth/jwt"))
);
const secret = randomBytes(48).toString("hex");
const owner = "the-architect@the-arcanum.net";
const reservation = net.createServer();
await new Promise((resolve) => reservation.listen(0, "127.0.0.1", resolve));
const port = reservation.address().port;
await new Promise((resolve) => reservation.close(resolve));
const directory = await mkdtemp(path.join(tmpdir(), "architect-session-"));
const storePath = path.join(directory, "store.json");
const now = new Date().toISOString();
await writeFile(
  storePath,
  JSON.stringify({
    schema: "arcanum.architect-store/v1",
    updatedAt: now,
    members: [
      {
        id: "owner",
        email: owner,
        googleSubject: "synthetic-owner",
        version: 1,
        active: true,
        role: "owner",
      },
    ],
    events: [],
    sources: [],
    conflicts: [],
  }),
  { mode: 0o600 },
);
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
      ARCHITECT_STORE_PATH: storePath,
      AUTH_URL: "https://architect.the-arcanum.net",
      AUTH_SECRET: secret,
      AUTH_GOOGLE_ID: "synthetic-test-client",
      AUTH_GOOGLE_SECRET: "synthetic-test-secret",
      ARCHITECT_GOOGLE_EMAIL: owner,
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let logs = "";
server.stdout.on("data", (b) => (logs += b));
server.stderr.on("data", (b) => (logs += b));
const request = (path, cookie, host = "architect.the-arcanum.net") =>
  new Promise((resolve, reject) => {
    const req = http.get(
      `http://127.0.0.1:${port}${path}`,
      {
        headers: {
          Host: host,
          "X-Forwarded-Proto": "https",
          ...(cookie ? { Cookie: cookie } : {}),
        },
      },
      (res) => {
        const b = [];
        res.on("data", (c) => b.push(c));
        res.on("end", () =>
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(b).toString(),
          }),
        );
      },
    );
    req.on("error", reject);
  });
try {
  for (let i = 0; i < 60; i++) {
    try {
      await request("/api/auth/providers");
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  const providers = await request("/api/auth/providers");
  assert.equal(
    providers.status,
    200,
    `providers ${providers.status}: ${providers.body.slice(0, 400)}; server: ${logs.slice(-1600)}`,
  );
  assert.match(providers.body, /google/);
  const deniedHost = await request(
    "/api/auth/providers",
    undefined,
    "updates.the-arcanum.net",
  );
  assert.equal(deniedHost.status, 403);
  const salt = "__Secure-authjs.session-token";
  const identity = {
    sub: "synthetic-owner",
    email: owner,
    architect: true,
    architectMemberId: "owner",
    architectVersion: 1,
    googleSubject: "synthetic-owner",
    googleEmailVerified: true,
    googleHostedDomain: "the-arcanum.net",
  };
  async function cookie(token, otherSecret = secret, maxAge = 3600) {
    return `${salt}=${await encode({ secret: otherSecret, salt, token, maxAge })}`;
  }
  const allowed = await request("/architect/review", await cookie(identity));
  assert.equal(allowed.status, 200);
  assert.match(allowed.body, /Where the work stands/);
  assert.match(allowed.body, /read-only workspace|Read-only workspace/);
  assert.match(allowed.headers["cache-control"], /no-store/);
  for (const token of [
    { ...identity, email: "other@the-arcanum.net" },
    { ...identity, googleEmailVerified: false },
    { ...identity, googleHostedDomain: "attacker.test" },
    { ...identity, architect: false },
    { ...identity, googleSubject: "" },
  ]) {
    const r = await request("/architect/review?install=1", await cookie(token));
    assert.equal(r.status, 307);
    assert.match(r.headers.location, /architect\/login/);
  }
  const forged = await request(
    "/architect/review",
    await cookie(identity, "wrong-signing-secret"),
  );
  assert.equal(forged.status, 307);
  const expired = await request(
    "/architect/review",
    await cookie(identity, secret, -3600),
  );
  assert.equal(expired.status, 307);
  const sibling = await request(
    "/architect/review",
    await cookie(identity),
    "updates.the-arcanum.net",
  );
  assert.equal(sibling.status, 307);
  assert.equal(
    sibling.headers.location,
    "https://architect.the-arcanum.net/architect/login",
  );
  console.log(
    "PASS 11 synthetic-session/provider/host cases. This does not verify real Google login or device cookies.",
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  server.kill("SIGTERM");
  await new Promise((resolve) => server.once("exit", resolve));
  await rm(directory, { recursive: true, force: true });
}
