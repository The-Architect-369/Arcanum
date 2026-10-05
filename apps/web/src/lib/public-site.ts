export const repository = "https://github.com/The-Architect-369/Arcanum";
export const editorialBase = "77b59d6a2d0f46f17e6334f2f954472b8dc8b66e";
export const source = (path: string) =>
  `${repository}/blob/${editorialBase}/${path}`;

export const pillars = [
  {
    slug: "tempus",
    name: "TEMPUS",
    theme: "Time · Place · Meaning",
    number: "01",
    title: "Find your rhythm in a larger world.",
    intro:
      "A day has a shape. A season has a rhythm. A moment can matter. TEMPUS is being built to help you orient yourself in time and place, while leaving the meaning of your experience with you.",
    summary:
      "A place for cycles, calendars, and chosen moments. Time gives context; you give it meaning.",
    sections: [
      {
        title: "Time you can return to",
        body: "Calendars, cycles, and windows of participation offer a structure for practice and reflection. The design makes room for rest, return, and changing readiness. Missing a window carries no penalty.",
      },
      {
        title: "A point of view in space",
        body: "An astronomical observation depends on where it is observed and which frame describes it. TEMPUS records that context when relevant. A simple clock record does not need your location, and private location is not a condition of participation.",
      },
      {
        title: "Meaning belongs to you",
        body: "Solar and lunar cycles can provide observable context. Cultural and symbolic associations can offer optional lenses. Neither determines your character, predicts your future, or tells you what a moment must mean.",
      },
    ],
    example:
      "Imagine choosing an evening to reflect on a new beginning. TEMPUS could hold the time and its source; HOPE could offer a question. You decide what to keep and what the experience means. This is an illustration of the design, not a live calendar or forecast.",
    boundary:
      "Time is context. It never measures worth, grants permission, or advances Vitae on its own.",
    status:
      "The repository contains a temporal provenance contract and local runtime work. The wider astronomical and participant experience is still developing.",
    sources: [
      {
        label: "Temporal Model · canonical",
        path: "docs/doctrine/temporal-model.md",
      },
      {
        label: "TempusAnchor · implementation contract",
        path: "docs/specs/tempus/tempus-anchor.md",
      },
      { label: "TEMPUS module · draft", path: "docs/modules/tempus/tempus.md" },
    ],
  },
  {
    slug: "hope",
    name: "HOPE",
    theme: "Reflection · Choice",
    number: "02",
    title: "Room to hear yourself.",
    intro:
      "Pause. Follow a question. Find your own words. HOPE is Arcanum’s reflective interface, designed to support clarity while leaving the direction of your journey with you.",
    summary:
      "A reflective presence that invites clarity and leaves the decisions with you.",
    sections: [
      {
        title: "An invitation to reflect",
        body: "The design begins with availability. You choose when to engage, how much guidance to invite, and when to leave. Reflection has room to be unfinished, quiet, or entirely private.",
      },
      {
        title: "Continuity with consent",
        body: "Your chosen reflections may provide context for a later conversation. The governing boundary excludes private HOPE and Journey interiors from Architect development memory and exports by default. Any disclosure needs its own selected scope and consent.",
      },
      {
        title: "A companion with limits",
        body: "HOPE may ask questions and offer perspective. It cannot decide who you are, enforce progression, place judgments about your interior life on a chain, or change an economic balance directly.",
      },
    ],
    example:
      "A useful opening might be: “What feels more clear today?” You can answer, change the question, or close the conversation. This is an illustrative prompt, not an active chat service.",
    boundary:
      "Your interior life is yours. A reflection is never a score of your worth.",
    status:
      "Local reflection and native HOPE work exist in the repository. This public website does not collect reflections or provide a HOPE conversation.",
    sources: [
      {
        label: "Canonical module boundaries",
        path: "docs/architecture/canonical-modules.md",
      },
      {
        label: "Native HOPE · implementation contract",
        path: "docs/specs/app/ce-w03-native-hope.md",
      },
      { label: "HOPE module · draft", path: "docs/modules/hope/hope.md" },
      {
        label: "Development memory & privacy contract",
        path: "docs/governance/architectgpt/conversation-memory-contract.md",
      },
    ],
  },
  {
    slug: "vitae",
    name: "VITAE",
    theme: "Learning · Responsibility",
    number: "03",
    title: "Let growth become something you can carry.",
    intro:
      "Choose something to learn. Put it into practice. Return and see what has become steady. Vitae connects that work with responsibility and recognition of durable capacity.",
    summary:
      "Learning, practice, and recognition of sustained capacity, without ranking people.",
    sections: [
      {
        title: "A structure for learning",
        body: "The curriculum describes foundations, grades, and paths of specialization. These give learning a coherent shape while preserving the distinction between a written curriculum and a person’s lived development.",
      },
      {
        title: "Recognition after stabilization",
        body: "A moment of success and a sustained capacity are different. Vitae’s stability-first posture recognizes what has become dependable over time. Speed, activity counts, and payment cannot stand in for that evidence.",
      },
      {
        title: "Responsibility without a worth hierarchy",
        body: "Recognition can name a bounded responsibility. It does not make someone more valuable as a person. Silence and non-participation remain valid, and recognition is not a transferable credential for purchasing authority.",
      },
    ],
    example:
      "Learning a practice, returning to it, and becoming able to hold a responsibility is the kind of journey Vitae is designed to recognize. A streak counter cannot establish that journey for you.",
    boundary: "Capacity can be recognized. Human dignity is never graded.",
    status:
      "The public repository contains the Vitae constitution, curriculum, and implementation specifications. This site does not award grades or certify a participant’s readiness.",
    sources: [
      { label: "Vitae overview · canonical", path: "docs/vitae/overview.md" },
      {
        label: "Vitae constitution",
        path: "docs/vitae/constitution/master-constitution-and-architecture.md",
      },
      { label: "Vitae reading index", path: "docs/vitae/index.md" },
    ],
  },
  {
    slug: "arcnet",
    name: "ARCnet",
    theme: "Continuity · Shared Infrastructure",
    number: "04",
    title: "A network that can witness without defining you.",
    intro:
      "Explore what people can build together. ARCnet is the developing network beneath Arcanum, designed to connect identity continuity, factual receipts, value exchange, and governed execution through explicit boundaries.",
    summary:
      "The developing network for identity continuity, factual receipts, and governed exchange.",
    sections: [
      {
        title: "Identity with continuity",
        body: "An identity anchor is intended to let a person maintain continuity across interactions without turning that person into a dossier. Identity remains under participant control and cannot be traded or reduced to a reputation score.",
      },
      {
        title: "Receipts for what happened",
        body: "A receipt can establish that an event was recorded. Optional protocol witnessing and finality are separate steps. Private experience does not need a chain transaction merely to be real, and a receipt does not decide what that experience means.",
      },
      {
        title: "A wider field for building",
        body: "The architecture makes room for applications and shared infrastructure to use bounded network services. Nexus describes connection and discourse; the wallet presents custody and permitted transactions; Treasury and governance constrain shared stewardship.",
      },
    ],
    example:
      "Arcanum is the place a person would interact. A local runtime can record an event. Selected facts could later be submitted to ARCnet under separate authorization. Those are distinct operations, not an automatic chain of effects.",
    boundary:
      "The network may witness facts and enforce rules. It cannot define personal meaning or human growth.",
    status:
      "ARCnet remains Pre-Genesis. Local runtime and application work do not establish a live public settlement network.",
    sources: [
      {
        label: "System overview · canonical",
        path: "docs/architecture/arcanum-system-overview.md",
      },
      {
        label: "Layer boundaries · canonical",
        path: "docs/doctrine/layer-boundaries.md",
      },
      {
        label: "Identity Model · canonical",
        path: "docs/doctrine/identity-model.md",
      },
    ],
  },
  {
    slug: "mana",
    name: "MANA",
    theme: "Utility · Exchange · Stewardship",
    number: "05",
    title: "Value in service of meaningful work.",
    intro:
      "Bring useful work into the world. MANA is designed as ARCnet’s shared primitive for utility and transferable value, supporting services, creation, contribution, and durable infrastructure within constitutional limits.",
    summary:
      "A designed economy for useful services and contribution, with human dignity outside the balance sheet.",
    sections: [
      {
        title: "Capacity and exchange",
        body: "The Economic Constitution gives MANA two connected roles: access to bounded optional utilities and infrastructure, and voluntary exchange of value. Payments, rewards, compensation, and new issuance must remain distinguishable.",
      },
      {
        title: "Contribution with a factual basis",
        body: "A reward or payment needs an identified purpose, funding source, authorization, and receipt. Calling something a reward does not create funds or minting authority. Private reflection and Vitae recognition cannot become an economic score.",
      },
      {
        title: "Stewardship with boundaries",
        body: "Treasury and governance have defined responsibilities and limits. Holding MANA creates no automatic yield, constitutional privilege, or governance supremacy. Unresolved rates and numerical parameters require their own design and ratification.",
      },
    ],
    example:
      "A future authorized payment for a useful service would record the service, amount, source, recipient, and actual monetary operation. That record would say what was exchanged; it would not rank either person.",
    boundary: "Authority is not for sale. Human worth is not denominated.",
    status:
      "This describes the constitutional economic design. No token sale, public reward program, yield offer, or live MANA economy is offered here.",
    sources: [
      {
        label: "Economic Constitution · controlling canon",
        path: "docs/economics/economic-constitution.md",
      },
      {
        label: "Treasury Constitution",
        path: "docs/governance/treasury-constitution.md",
      },
      {
        label: "Governance specification",
        path: "docs/governance/governance-specification.md",
      },
    ],
  },
] as const;

export const siteLog = {
  schema: "arcanum.public-site-log/v1",
  kind: "editorial-publication-log",
  siteVersion: "2.1",
  recordedOn: "2026-10-04",
  sourceRepository: repository,
  editorialBase,
  authorityEffect: "none",
  apkPublication: "verified-development-candidate",
  scope:
    "Public website editorial history; not a TempusAnchor, protocol receipt, or APK update manifest.",
  entries: [
    {
      id: "shared-release-discovery",
      date: "2026-10-04",
      title: "One approved release listing",
      detail:
        "The website and compatible Android clients read the same reviewed release listing. Checking for an update does not install it; Android confirmation is still required. The listing stays on the previously published artifact until a new release passes acceptance.",
      state: "included-in-this-build",
    },
    {
      id: "a14-2-download",
      date: "2026-09-30",
      title: "Verified Android development candidate",
      detail:
        "The download page links the inspected A14.2 APK with checksum, signer and exact build provenance. A15 recovery and chain integration remain gated.",
      state: "included-in-this-build",
    },
    {
      id: "public-site-v2",
      date: "2026-09-28",
      title: "A fuller introduction to Arcanum",
      detail:
        "Dedicated pillar pages, a TEMPUS feature, principles and source readings, persistent navigation, and a public editorial log. APK publication is paused while the public experience is refined.",
      state: "included-in-this-build",
    },
    {
      id: "public-site-v1",
      date: "2026-09-28",
      title: "The public threshold",
      detail:
        "The first public home was integrated into apps/web through PR #65. It introduced the project and kept the Android download marked Release pending.",
      state: "merged",
      commit: editorialBase,
      pullRequest: `${repository}/pull/65`,
    },
  ],
};
