import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, readFile, rm, chmod } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  parseStore,
  readModel,
  mergeEvents,
  projects,
} from "../apps/web/src/lib/architect/model.ts";
import { fixtureStore } from "./fixtures/architect-store.mjs";
test("strict selected schema rejects private fields/audiences/resources and unbound viewers", () => {
  const base = fixtureStore();
  assert.equal(parseStore(base).events.length, 2);
  for (const mutate of [
    (s) => (s.privateHope = "interior"),
    (s) => (s.events[0].privateDeviceId = "device"),
    (s) => (s.events[0].audience = "private"),
    (s) => (s.members[1].googleSubject = null),
    (s) =>
      (s.events[0].resources = [
        { title: "X", url: "file:///private", label: "X" },
      ]),
    (s) =>
      (s.events[0].resources = [
        {
          title: "X",
          url: "https://github.com/The-Architect-369/Arcanum/../../private",
          label: "X",
        },
      ]),
    (s) =>
      (s.events[0].resources = [
        {
          title: "X",
          url: "https://the-arcanum.net/?token=secret",
          label: "X",
        },
      ]),
    (s) => s.events.push(s.events[0]),
  ]) {
    const s = structuredClone(base);
    mutate(s);
    assert.throws(() => parseStore(s));
  }
  assert.equal("members" in readModel(parseStore(base)), false);
});
test("replay deduplicates, conflicts retain original, source ordering and accepted history survive", () => {
  let store = parseStore(fixtureStore());
  const old = structuredClone(store.events);
  store = mergeEvents(
    store,
    [{ ...store.events[0], ingestedAt: "2026-11-10T11:00:00Z" }],
    "fixture-source",
    "2026-11-10T11:00:00Z",
  );
  assert.deepEqual(store.events, old);
  store = mergeEvents(
    store,
    [{ ...old[0], summary: "Changed payload" }],
    "fixture-source",
    "2026-11-10T11:00:00Z",
  );
  assert.equal(store.conflicts.length, 1);
  assert.deepEqual(store.events, old);
  let p = projects(readModel(store))[0];
  assert.equal(p.current.milestoneId, "fixture/first");
  const accepted = {
    ...old[1],
    id: "fixture/three",
    sourceOrder: 3,
    milestoneState: "accepted",
    status: "human_accepted",
  };
  store = mergeEvents(
    store,
    [accepted],
    "fixture-source",
    "2026-11-10T11:01:00Z",
  );
  p = projects(readModel(store))[0];
  assert.equal(p.current.milestoneId, "fixture/second");
  assert.equal(p.milestones.length, 2);
  assert.equal(p.milestones[0].events.length, 1);
});
test("selected importer persists real-shaped records, replay and failed source retain evidence; lock blocks concurrent write", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "architect-ingest-"));
  try {
    const input = path.join(dir, "source.json"),
      manifest = path.join(dir, "manifest.json"),
      store = path.join(dir, "store.json");
    await writeFile(
      input,
      JSON.stringify({
        state: "preview-ready-human-review-pending",
        head: "1".repeat(40),
        completed_at: "2026-11-10T10:00:00Z",
      }),
    );
    const hash = createHash("sha256")
      .update(await readFile(input))
      .digest("hex");
    const selected = {
      schema: "arcanum.architect-selected-sources/v1",
      sources: [
        {
          id: "preview",
          kind: "current-preview",
          path: input,
          sha256: hash,
          order: 1,
          version: 1,
        },
      ],
    };
    await writeFile(manifest, JSON.stringify(selected));
    const run = () =>
      spawnSync(
        process.execPath,
        [
          "scripts/architect/ingest-portal.mjs",
          "--store",
          store,
          "--manifest",
          manifest,
          "--owner-email",
          "the-architect@the-arcanum.net",
        ],
        { encoding: "utf8" },
      );
    assert.equal(run().status, 0);
    const first = parseStore(JSON.parse(await readFile(store, "utf8")));
    assert.equal(first.events.length, 1);
    assert.equal(run().status, 0);
    assert.equal(
      parseStore(JSON.parse(await readFile(store, "utf8"))).events.length,
      1,
    );
    await rm(input);
    assert.equal(run().status, 2);
    const failed = parseStore(JSON.parse(await readFile(store, "utf8")));
    assert.deepEqual(failed.events, first.events);
    assert.equal(failed.sources[0].state, "unreachable");
    assert.ok(failed.sources[0].succeededAt);
    await writeFile(store + ".lock", "lock", { mode: 0o600 });
    assert.notEqual(run().status, 0);
    assert.deepEqual(
      parseStore(JSON.parse(await readFile(store, "utf8"))).events,
      first.events,
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
