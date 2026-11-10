#!/usr/bin/env node
// Explicit selected-file ingestion only. No discovery, remote effects, schedules or execution dispatch.
import {
  readFile,
  writeFile,
  rename,
  open,
  unlink,
  mkdir,
} from "node:fs/promises";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import {
  parseStore,
  parseEvent,
  mergeEvents,
} from "../../apps/web/src/lib/architect/model.ts";
const args = process.argv.slice(2),
  arg = (name) => args[args.indexOf(name) + 1];
const storePath = arg("--store"),
  manifestPath = arg("--manifest");
if (
  !args.includes("--store") ||
  !args.includes("--manifest") ||
  !path.isAbsolute(storePath) ||
  !path.isAbsolute(manifestPath)
)
  throw new Error("Use explicit absolute --store and --manifest paths.");
if (
  storePath.startsWith(path.resolve("apps/web/public") + path.sep) ||
  storePath.startsWith(path.resolve("public") + path.sep)
)
  throw new Error("Private records cannot be written under public assets.");
const now = new Date().toISOString();
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
await mkdir(path.dirname(storePath), { recursive: true, mode: 0o700 });
const lock = await open(storePath + ".lock", "wx", 0o600);
let temp;
try {
  let store;
  try {
    store = parseStore(JSON.parse(await readFile(storePath, "utf8")));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const owner = arg("--owner-email");
    if (!args.includes("--owner-email") || !owner)
      throw new Error(
        "Initial store requires the explicitly authorized owner email.",
      );
    store = parseStore({
      schema: "arcanum.architect-store/v1",
      updatedAt: now,
      members: [
        {
          id: "owner",
          email: owner,
          googleSubject: null,
          version: 1,
          active: true,
          role: "owner",
        },
      ],
      events: [],
      sources: [],
      conflicts: [],
    });
  }
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (
    manifest.schema !== "arcanum.architect-selected-sources/v1" ||
    !Array.isArray(manifest.sources) ||
    manifest.sources.length > 12 ||
    Object.keys(manifest).some((k) => !["schema", "sources"].includes(k))
  )
    throw new Error("Invalid selected-source manifest.");
  let failed = 0;
  for (const selected of manifest.sources) {
    if (
      !/^[a-z0-9-]{1,80}$/.test(selected.id) ||
      !Number.isSafeInteger(selected.order) ||
      selected.order < 0 ||
      !path.isAbsolute(selected.path) ||
      !/^[a-f0-9]{64}$/.test(selected.sha256) ||
      Object.keys(selected).some(
        (k) =>
          !["id", "kind", "path", "sha256", "order", "version"].includes(k),
      )
    )
      throw new Error("Invalid selected source.");
    try {
      const bytes = await readFile(selected.path);
      if (bytes.length > 4 * 1024 * 1024 || digest(bytes) !== selected.sha256)
        throw new Error("Source no longer matches selection.");
      const source = JSON.parse(bytes);
      let event;
      const version = selected.version ?? 1;
      if (!Number.isSafeInteger(version) || version < 1)
        throw new Error("Invalid source version.");
      const common = {
        id: `${selected.id}/v${version}`,
        sourceId: selected.id,
        sourceVersion: version,
        sourceOrder: selected.order,
        domain: "web",
        projectId: "web/current",
        projectTitle: "Arcanum Current",
        milestoneId: "current-r3-preview",
        milestoneTitle: "Mobile development window",
        milestoneState: "active",
        title: "A shared place to follow development",
        summary: "A mobile-first public development window.",
        status: "observed",
        scope: "Selected project record only; not whole-program acceptance.",
        eventAt:
          source.completed_at ??
          source.recorded_at ??
          source.observedAt ??
          null,
        observedAt:
          source.completed_at ?? source.recorded_at ?? source.observedAt,
        ingestedAt: now,
        sourceRef: `urn:arcanum:selected:${selected.id}`,
        sourceDigest: digest(bytes),
        nextGate: "Human review of the bounded milestone.",
        audience: "architects",
        resources: [],
      };
      if (selected.kind === "current-preview") {
        if (
          source.state !== "preview-ready-human-review-pending" ||
          !source.head
        )
          throw new Error("Unexpected preview receipt.");
        event = {
          ...common,
          status: "tested",
          summary:
            "The Current r3 preview passed its recorded local checks. Human review was a separate gate.",
          resources: [
            {
              title: "Reviewed source",
              url: `https://github.com/The-Architect-369/Arcanum/commit/${source.head}`,
              label: "Public source",
            },
          ],
        };
      } else if (selected.kind === "current-publication") {
        if (source.state !== "published-public-verified" || !source.merge)
          throw new Error("Unexpected publication receipt.");
        event = {
          ...common,
          milestoneId: "current-public-r3",
          milestoneTitle: "Current public release",
          milestoneState: "accepted",
          status: "publicly_released",
          title: "Current is publicly available",
          summary:
            "The Human accepted the core visitor structure; the website was merged, deployed and checked anonymously.",
          scope:
            "Current website only. Native release, Google activation and broader certification stay separate.",
          eventAt: source.verified_at,
          observedAt: source.verified_at,
          nextGate:
            "Further visitor refinements and actual-device installation review.",
          resources: [
            {
              title: "Public Current",
              url: "https://updates.the-arcanum.net/",
              label: "Published website",
            },
            {
              title: "Publication source",
              url: `https://github.com/The-Architect-369/Arcanum/commit/${source.merge}`,
              label: "Adopted source",
            },
          ],
        };
      } else if (selected.kind === "native-public-listing") {
        if (source.release?.versionCode !== 34 || !source.observedAt)
          throw new Error("New native listing needs a reviewed adapter.");
        event = {
          ...common,
          domain: "native",
          projectId: "native/arcanum",
          projectTitle: "Arcanum",
          milestoneId: "native-public-34",
          milestoneTitle: "Approved Android development release",
          milestoneState: "accepted",
          status: "publicly_released",
          title: "Public Android release 34",
          summary:
            "The approved public listing is distinct from newer integrated source and private review builds.",
          scope:
            "Observed publication metadata; not acceptance of a newer build or closure of CE-W04.",
          eventAt: null,
          observedAt: source.observedAt,
          nextGate:
            "Separate Human review and explicit native publication decision for any replacement.",
          era: "Construction Era",
          wave: "CE-W04",
          resources: [
            {
              title: "Release review",
              url: "https://the-arcanum.net/download",
              label: "Public approved release",
            },
          ],
        };
      } else if (selected.kind === "native-qualification") {
        if (
          !Number.isSafeInteger(source.versionCode) ||
          source.versionCode < 1 ||
          source.qualified !== true ||
          !/^[a-f0-9]{40}$/.test(source.indexedHead) ||
          !/^[a-f0-9]{40}$/.test(source.sourceCommit) ||
          !/^[a-f0-9]{64}$/.test(source.apkSha256)
        )
          throw new Error(
            "Selected qualification binding needs reconciliation.",
          );
        event = {
          ...common,
          domain: "native",
          projectId: "native/arcanum",
          projectTitle: "Arcanum",
          milestoneId: `native-${source.versionCode ?? source.buildVersion}-walkthrough`,
          milestoneTitle: "Private walkthrough",
          status: "tested",
          title: "Isolated technical qualification recorded",
          summary: `Selected receipts bind private build ${source.versionCode} to its substantive source and deterministic index companion. Qualification is dated to its source observation.`,
          scope:
            "Dated isolated technical evidence, not fresh device-byte verification, Human visual acceptance or public release promotion.",
          eventAt: source.eventAt,
          observedAt: source.observedAt,
          nextGate:
            "Complete the Human visual/UI walkthrough and the separate full CE-W04 gates.",
          era: source.era,
          wave: source.wave,
          arc: source.arc,
        };
      } else if (selected.kind === "hub-native-status") {
        if (
          !Number.isSafeInteger(source.buildVersion) ||
          source.buildVersion < 1 ||
          !source.observedAt
        )
          throw new Error("Unexpected selected native report.");
        event = {
          ...common,
          domain: "native",
          projectId: "native/arcanum",
          projectTitle: "Arcanum",
          milestoneId: `native-${source.versionCode ?? source.buildVersion}-walkthrough`,
          milestoneTitle: "Private walkthrough",
          status: "reported",
          title: `Build ${source.buildVersion} review remains separate`,
          summary:
            "The Human reports working use. Hub distinguishes dated technical qualification from reported installation/opening, visual acceptance and the full construction review.",
          scope:
            "Reported Hub/Human state; technical binding is represented by its separate dated receipt; this reported event adds no new device verification.",
          eventAt: source.eventAt,
          observedAt: source.observedAt,
          nextGate:
            "Complete the Human walkthrough and its acceptance record. No public promotion.",
          era: source.era,
          wave: source.wave,
          arc: source.arc,
        };
      } else if (selected.kind === "home-node-direction") {
        if (!source.observedAt)
          throw new Error("Missing direction observation.");
        event = {
          ...common,
          domain: "technology",
          projectId: "technology/home-node",
          projectTitle: "Home-node foundation",
          milestoneId: "home-node-evidence-selection",
          milestoneTitle: "Design evidence selection",
          milestoneState: "proposed",
          status: "reported",
          title: "Design foundation before physical qualification",
          summary:
            "The Human frames diagrams, mathematics and design as a foundation milestone. Selected hardware resources have not yet been reconciled into this store.",
          scope:
            "Reported design/research direction. No fabrication, manufacturing or physical readiness claim.",
          eventAt: source.eventAt,
          observedAt: source.observedAt,
          nextGate:
            "Select and review exact design resources, then establish independent physical qualification.",
          resources: [
            {
              title: "Seed Node Alpha contract",
              url: "https://github.com/The-Architect-369/Arcanum/blob/268006dd0ec3c7a026aa64b2c93d0d9ed08d314c/docs/specs/app/ce-w04-seed-node-alpha.md",
              label:
                "Software implementation candidate; not hardware fabrication evidence",
            },
          ],
        };
      } else if (selected.kind === "www-baseline") {
        if (
          source.status !== 200 ||
          source.sha256 !==
            "a47f3668fa143f3fce4a53f9da23579db20e7b5c53a477d07e9e6f3eca0e91b9" ||
          !source.observedAt
        )
          throw new Error("Public baseline needs reconciliation.");
        event = {
          ...common,
          projectId: "web/www",
          projectTitle: "WWW",
          milestoneId: "www-v07-baseline",
          milestoneTitle: "Public discovery baseline",
          milestoneState: "accepted",
          status: "publicly_released",
          title: "The public discovery experience remains available",
          summary:
            "The existing main-site baseline was observed with unchanged approved bytes. Current and the protected Architect workspace are distinct destinations.",
          scope:
            "Observed public baseline, not a newly accepted redesign or an application service.",
          eventAt: null,
          observedAt: source.observedAt,
          nextGate:
            "Select future visitor refinements separately while preserving the approved baseline.",
          resources: [
            {
              title: "Public website",
              url: "https://the-arcanum.net/",
              label: "Public discovery",
            },
          ],
        };
      } else if (selected.kind === "portal-build") {
        if (source.state !== "local-first-slice-verified" || !source.observedAt)
          throw new Error("Unexpected portal build record.");
        event = {
          ...common,
          projectId: "web/architect",
          projectTitle: "Architect portal",
          milestoneId: "architect-first-slice",
          milestoneTitle: "Protected read-only first build",
          status: "tested",
          title: "First portal slice under review",
          summary:
            "The protected UI, per-request authorization and selected local ingestion were tested. Remote Google and record-transport activation remain separate.",
          eventAt: source.observedAt,
          observedAt: source.observedAt,
          nextGate:
            "Secure Google client configuration and approved durable private transport; Human preview review.",
        };
      } else throw new Error("Source adapter is not selected.");
      store = mergeEvents(store, [parseEvent(event)], selected.id, now);
    } catch {
      failed++;
      const old = store.sources.find((s) => s.id === selected.id);
      store = {
        ...store,
        updatedAt: now,
        sources: [
          ...store.sources.filter((s) => s.id !== selected.id),
          {
            id: selected.id,
            state: "unreachable",
            attemptedAt: now,
            succeededAt: old?.succeededAt ?? null,
          },
        ],
      };
    }
  }
  store = parseStore(store);
  temp = storePath + "." + randomUUID() + ".tmp";
  await writeFile(temp, JSON.stringify(store, null, 2) + "\n", { mode: 0o600 });
  await rename(temp, storePath);
  temp = undefined;
  console.log(
    JSON.stringify({
      events: store.events.length,
      conflicts: store.conflicts.length,
      failedSources: failed,
      ingestedAt: now,
    }),
  );
  if (failed) process.exitCode = 2;
} finally {
  if (temp) await unlink(temp).catch(() => {});
  await lock.close();
  await unlink(storePath + ".lock");
}
