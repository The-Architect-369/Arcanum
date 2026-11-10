import { parseStore, readModel } from "./model";
const stamp = "2026-11-10T12:00:00Z";
export const architectDemo = readModel(
  parseStore({
    schema: "arcanum.architect-store/v1",
    updatedAt: stamp,
    members: [],
    sources: [
      {
        id: "synthetic",
        state: "reachable",
        attemptedAt: stamp,
        succeededAt: stamp,
      },
    ],
    conflicts: [],
    events: [
      {
        id: "demo-web-v1",
        domain: "web",
        projectId: "example/web",
        projectTitle: "Example web project",
        milestoneId: "example-web-preview",
        milestoneTitle: "Preview exploration",
        milestoneState: "active",
        title: "Example design revision",
        summary:
          "Synthetic illustration of a tested snapshot awaiting a separate review.",
        status: "tested",
        sourceOrder: 1,
      },
      {
        id: "demo-web-v2",
        domain: "web",
        projectId: "example/web",
        projectTitle: "Example web project",
        milestoneId: "example-web-accepted",
        milestoneTitle: "Example accepted milestone",
        milestoneState: "accepted",
        title: "Example milestone progression",
        summary:
          "Synthetic illustration of current and historical milestones. This is not an actual acceptance receipt.",
        status: "human_accepted",
        sourceOrder: 2,
      },
      {
        id: "demo-native-v1",
        domain: "native",
        projectId: "example/native",
        projectTitle: "Example application project",
        milestoneId: "example-native-review",
        milestoneTitle: "Participant review",
        milestoneState: "active",
        title: "Example review boundary",
        summary:
          "Synthetic illustration of reported progress, separate from tested or publicly released status.",
        status: "reported",
        sourceOrder: 1,
      },
      {
        id: "demo-tech-v1",
        domain: "technology",
        projectId: "example/technology",
        projectTitle: "Example design research",
        milestoneId: "example-tech-design",
        milestoneTitle: "Select design evidence",
        milestoneState: "proposed",
        title: "Example research direction",
        summary:
          "Synthetic illustration of design work with physical qualification still unknown.",
        status: "unknown",
        sourceOrder: 1,
      },
    ].map((event) => ({
      ...event,
      sourceId: "synthetic",
      sourceVersion: 1,
      scope:
        "Synthetic visual fixture only. No actual project state or authorization is established.",
      eventAt: stamp,
      observedAt: stamp,
      ingestedAt: stamp,
      sourceRef: "urn:arcanum:synthetic:portal-preview",
      sourceDigest: "0".repeat(64),
      nextGate:
        "Human review of this interface; real data requires configured authenticated transport.",
      audience: "architects",
      resources: [],
    })),
  }),
);
