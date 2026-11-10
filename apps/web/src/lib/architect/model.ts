export const domains = ["web", "native", "technology"] as const;
export const states = [
  "reported",
  "observed",
  "implemented",
  "tested",
  "human_accepted",
  "adopted",
  "publicly_released",
  "blocked",
  "unknown",
] as const;
export type ArchitectEvent = {
  id: string;
  sourceId: string;
  sourceVersion: number;
  sourceOrder: number;
  domain: (typeof domains)[number];
  projectId: string;
  projectTitle: string;
  milestoneId: string;
  milestoneTitle: string;
  milestoneState: "proposed" | "active" | "accepted";
  title: string;
  summary: string;
  status: (typeof states)[number];
  scope: string;
  eventAt: string | null;
  observedAt: string;
  ingestedAt: string;
  sourceRef: string;
  sourceDigest: string;
  nextGate: string;
  audience: "architects";
  era?: string;
  wave?: string;
  arc?: string;
  resources: { title: string; url: string; label: string }[];
};
export type ArchitectMember = {
  id: string;
  email: string;
  googleSubject: string | null;
  version: number;
  active: boolean;
  role: "owner" | "viewer";
};
export type ArchitectStore = {
  schema: "arcanum.architect-store/v1";
  updatedAt: string;
  members: ArchitectMember[];
  events: ArchitectEvent[];
  sources: {
    id: string;
    state: "reachable" | "unreachable";
    attemptedAt: string;
    succeededAt: string | null;
  }[];
  conflicts: { eventId: string; sourceId: string; observedAt: string }[];
};
export type ArchitectReadModel = Omit<ArchitectStore, "members">;
const idPattern = /^[a-zA-Z0-9][a-zA-Z0-9_:/.-]{0,179}$/;
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid record structure.");
  return value as Record<string, unknown>;
}
function keys(value: Record<string, unknown>, allowed: string[]) {
  if (Object.keys(value).some((k) => !allowed.includes(k)))
    throw new Error("Unselected record field.");
}
function text(value: unknown, max = 800): string {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    value.length > max ||
    [...value].some(
      (c) => c.charCodeAt(0) < 32 && ![9, 10, 13].includes(c.charCodeAt(0)),
    )
  )
    throw new Error("Invalid record text.");
  return value;
}
function id(value: unknown): string {
  const result = text(value, 180);
  if (!idPattern.test(result)) throw new Error("Invalid record identity.");
  return result;
}
function integer(value: unknown, min = 0): number {
  if (!Number.isSafeInteger(value) || (value as number) < min)
    throw new Error("Invalid record version.");
  return value as number;
}
function time(value: unknown): string {
  const result = text(value, 40);
  if (!/(Z|[+-]\d\d:\d\d)$/.test(result) || Number.isNaN(Date.parse(result)))
    throw new Error("Invalid source time.");
  return result;
}
function list<T>(value: unknown, parse: (v: unknown) => T, max: number): T[] {
  if (!Array.isArray(value) || value.length > max)
    throw new Error("Invalid record collection.");
  return value.map(parse);
}
function choice<T extends string>(value: unknown, options: readonly T[]): T {
  if (!options.includes(value as T)) throw new Error("Invalid record state.");
  return value as T;
}
export function parseEvent(value: unknown): ArchitectEvent {
  const v = object(value);
  keys(v, [
    "id",
    "sourceId",
    "sourceVersion",
    "sourceOrder",
    "domain",
    "projectId",
    "projectTitle",
    "milestoneId",
    "milestoneTitle",
    "milestoneState",
    "title",
    "summary",
    "status",
    "scope",
    "eventAt",
    "observedAt",
    "ingestedAt",
    "sourceRef",
    "sourceDigest",
    "nextGate",
    "audience",
    "era",
    "wave",
    "arc",
    "resources",
  ]);
  const digest = text(v.sourceDigest, 64);
  if (!/^[a-f0-9]{64}$/.test(digest)) throw new Error("Invalid source digest.");
  const ref = text(v.sourceRef, 300);
  if (
    !ref.startsWith("urn:arcanum:") &&
    !/^https:\/\/github\.com\/The-Architect-369\/Arcanum\//.test(ref)
  )
    throw new Error("Unselected source reference.");
  const result: ArchitectEvent = {
    id: id(v.id),
    sourceId: id(v.sourceId),
    sourceVersion: integer(v.sourceVersion, 1),
    sourceOrder: integer(v.sourceOrder),
    domain: choice(v.domain, domains),
    projectId: id(v.projectId),
    projectTitle: text(v.projectTitle, 160),
    milestoneId: id(v.milestoneId),
    milestoneTitle: text(v.milestoneTitle, 160),
    milestoneState: choice(v.milestoneState, [
      "proposed",
      "active",
      "accepted",
    ]),
    title: text(v.title, 160),
    summary: text(v.summary),
    status: choice(v.status, states),
    scope: text(v.scope),
    eventAt: v.eventAt === null ? null : time(v.eventAt),
    observedAt: time(v.observedAt),
    ingestedAt: time(v.ingestedAt),
    sourceRef: ref,
    sourceDigest: digest,
    nextGate: text(v.nextGate),
    audience: choice(v.audience, ["architects"]),
    resources: list(
      v.resources,
      (x) => {
        const r = object(x);
        keys(r, ["title", "url", "label"]);
        const url = text(r.url, 500);
        const parsed = new URL(url);
        const allowed =
          parsed.protocol === "https:" &&
          !parsed.username &&
          !parsed.password &&
          !parsed.search &&
          !parsed.hash &&
          (parsed.hostname === "github.com"
            ? parsed.pathname.startsWith("/The-Architect-369/Arcanum/")
            : [
                "the-arcanum.net",
                "updates.the-arcanum.net",
                "architect.the-arcanum.net",
                "journeys.the-arcanum.net",
              ].includes(parsed.hostname));
        if (!allowed)
          throw new Error("Only selected public resources can be attached.");
        return { title: text(r.title, 120), url, label: text(r.label, 120) };
      },
      8,
    ),
  };
  for (const k of ["era", "wave", "arc"] as const)
    if (v[k] !== undefined) result[k] = text(v[k], 80);
  return result;
}
export function parseStore(value: unknown): ArchitectStore {
  const v = object(value);
  keys(v, ["schema", "updatedAt", "members", "events", "sources", "conflicts"]);
  if (v.schema !== "arcanum.architect-store/v1")
    throw new Error("Unsupported record schema.");
  const members = list(
    v.members,
    (x) => {
      const m = object(x);
      keys(m, ["id", "email", "googleSubject", "version", "active", "role"]);
      const email = text(m.email, 254).toLowerCase();
      if (!/^[^\s@]+@[^\s@]+$/.test(email) || typeof m.active !== "boolean")
        throw new Error("Invalid enrollment.");
      const role = choice(m.role, ["owner", "viewer"]);
      if (m.googleSubject === null && role !== "owner")
        throw new Error(
          "Viewers require an individually bound Google subject.",
        );
      return {
        id: id(m.id),
        email,
        googleSubject:
          m.googleSubject === null ? null : text(m.googleSubject, 255),
        version: integer(m.version, 1),
        active: m.active,
        role,
      };
    },
    100,
  );
  if (
    new Set(members.map((m) => m.id)).size !== members.length ||
    new Set(members.map((m) => m.email)).size !== members.length
  )
    throw new Error("Conflicting enrollment identity.");
  const events = list(v.events, parseEvent, 2000);
  if (new Set(events.map((e) => e.id)).size !== events.length)
    throw new Error("Duplicate event identity.");
  const projectDomains = new Map<string, string>();
  for (const e of events) {
    if (
      projectDomains.has(e.projectId) &&
      projectDomains.get(e.projectId) !== e.domain
    )
      throw new Error("Project domain conflict.");
    projectDomains.set(e.projectId, e.domain);
  }
  return {
    schema: v.schema,
    updatedAt: time(v.updatedAt),
    members,
    events,
    sources: list(
      v.sources,
      (x) => {
        const s = object(x);
        keys(s, ["id", "state", "attemptedAt", "succeededAt"]);
        return {
          id: id(s.id),
          state: choice(s.state, ["reachable", "unreachable"]),
          attemptedAt: time(s.attemptedAt),
          succeededAt: s.succeededAt === null ? null : time(s.succeededAt),
        };
      },
      100,
    ),
    conflicts: list(
      v.conflicts,
      (x) => {
        const c = object(x);
        keys(c, ["eventId", "sourceId", "observedAt"]);
        return {
          eventId: id(c.eventId),
          sourceId: id(c.sourceId),
          observedAt: time(c.observedAt),
        };
      },
      1000,
    ),
  };
}
export function readModel(store: ArchitectStore): ArchitectReadModel {
  return {
    schema: store.schema,
    updatedAt: store.updatedAt,
    events: store.events,
    sources: store.sources,
    conflicts: store.conflicts,
  };
}
export function mergeEvents(
  store: ArchitectStore,
  incoming: ArchitectEvent[],
  sourceId: string,
  now: string,
): ArchitectStore {
  const events = [...store.events],
    conflicts = [...store.conflicts];
  for (const input of incoming) {
    const event = parseEvent(input);
    if (event.sourceId !== sourceId) throw new Error("Wrong source identity.");
    const old = events.find((e) => e.id === event.id);
    if (old) {
      if (
        JSON.stringify({ ...old, ingestedAt: "" }) !==
          JSON.stringify({ ...event, ingestedAt: "" }) &&
        !conflicts.some(
          (c) => c.eventId === event.id && c.sourceId === sourceId,
        )
      )
        conflicts.push({ eventId: event.id, sourceId, observedAt: now });
      continue;
    }
    if (
      events.some(
        (e) =>
          e.projectId === event.projectId &&
          e.sourceId === sourceId &&
          e.sourceOrder === event.sourceOrder &&
          e.sourceVersion === event.sourceVersion,
      )
    ) {
      conflicts.push({ eventId: event.id, sourceId, observedAt: now });
      continue;
    }
    events.push(event);
  }
  return parseStore({
    ...store,
    updatedAt: now,
    events,
    conflicts,
    sources: [
      ...store.sources.filter((s) => s.id !== sourceId),
      { id: sourceId, state: "reachable", attemptedAt: now, succeededAt: now },
    ],
  });
}
export function projects(model: ArchitectReadModel) {
  return [...new Set(model.events.map((e) => e.projectId))].map((projectId) => {
    const events = model.events
      .filter((e) => e.projectId === projectId)
      .sort(
        (a, b) =>
          a.sourceOrder - b.sourceOrder ||
          a.sourceVersion - b.sourceVersion ||
          a.id.localeCompare(b.id),
      );
    const latest = events.at(-1)!;
    const milestones = [...new Set(events.map((e) => e.milestoneId))].map(
      (milestoneId) => ({
        id: milestoneId,
        events: events.filter((e) => e.milestoneId === milestoneId),
      }),
    );
    const accepted = events.filter((e) => e.milestoneState === "accepted");
    return {
      id: projectId,
      title: latest.projectTitle,
      domain: latest.domain,
      latest,
      current: accepted.at(-1) ?? null,
      milestones,
    };
  });
}
