export const CANARY = "SYNTHETIC_PRIVATE_RECORD_CANARY";
export function fixtureStore(owner = "the-architect@the-arcanum.net") {
  const now = "2026-11-10T10:00:00Z";
  const common = {
    sourceId: "fixture-source",
    sourceVersion: 1,
    domain: "web",
    projectId: "fixture/project",
    projectTitle: "Synthetic project",
    milestoneState: "active",
    summary: CANARY,
    status: "tested",
    scope: "Synthetic fixture only.",
    eventAt: now,
    observedAt: now,
    ingestedAt: now,
    sourceRef: "urn:arcanum:synthetic:boundary-test",
    sourceDigest: "a".repeat(64),
    nextGate: "Synthetic review.",
    audience: "architects",
    resources: [],
  };
  return {
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
      {
        id: "viewer",
        email: "viewer@example.test",
        googleSubject: "synthetic-viewer",
        version: 1,
        active: true,
        role: "viewer",
      },
    ],
    events: [
      {
        ...common,
        id: "fixture/one",
        sourceOrder: 1,
        milestoneId: "fixture/first",
        milestoneTitle: "Previous accepted milestone",
        milestoneState: "accepted",
        status: "human_accepted",
        title: "First snapshot",
      },
      {
        ...common,
        id: "fixture/two",
        sourceOrder: 2,
        milestoneId: "fixture/second",
        milestoneTitle: "Work in progress",
        title: "Second snapshot",
      },
    ],
    sources: [
      {
        id: "fixture-source",
        state: "reachable",
        attemptedAt: now,
        succeededAt: now,
      },
    ],
    conflicts: [],
  };
}
