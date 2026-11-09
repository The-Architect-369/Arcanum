import { siteLog } from "@/lib/public-site";
export type UpdatePost = {
  id: string;
  date: string;
  title: string;
  detail: string;
  summary?: string;
  topic?: "arcanum" | "arcnet" | "website";
  updateType?: "release" | "progress" | "website";
  category: "development" | "website";
  status: string;
  source?: string;
};
export const developmentPosts: UpdatePost[] = [
  {
    id: "a19-core-integrated",
    date: "2026-10-14",
    title: "A steadier home for reflections",
    summary:
      "Protected reflection collections are integrated, moving the work toward a more dependable everyday experience.",
    topic: "arcanum",
    updateType: "progress",
    category: "development",
    status: "Integrated · public download unchanged",
    detail:
      "A19 core closure is recorded on canonical main. The public Android channel remains A18, version 34. Manual portable backup restoration remains deferred; this integration does not close that separate qualification or CE-W04.",
    source: "https://github.com/The-Architect-369/Arcanum/pull/102",
  },
  {
    id: "a18-public-release",
    date: "2026-10-05",
    title: "A conversation you choose to keep",
    summary:
      "A reviewed Android release offers local-model conversations and a separate choice about what enters development memory.",
    topic: "arcanum",
    updateType: "release",
    category: "development",
    status: "Public Android · version 34",
    detail:
      "The approved A18 development release supports reviewed requests to a separately configured home-local model and a separate choice to save answers into development memory. Downloading the app does not connect an AI provider. Android confirms installation and updates.",
    source: "https://updates.the-arcanum.net/updates/release.json",
  },
];
export const websitePosts: UpdatePost[] = siteLog.entries.map((entry) => ({
  id: entry.id,
  date: entry.date,
  title: entry.title,
  detail: entry.detail,
  summary: (
    {
      "v07-living-light-baseline":
        "A continuous visual introduction connects the ideas behind Arcanum, with deliberate paths into deeper reading.",
      "a18-reviewed-conversation-release":
        "The website introduces reviewed conversations and explains what local-model setup requires.",
      "shared-release-discovery":
        "One reviewed listing keeps the website and compatible Android clients pointed at the same approved release.",
      "a14-2-download":
        "The download page added inspected build details so visitors could make an informed installation choice.",
      "public-site-v2":
        "Dedicated introductions and source readings give visitors more ways to explore at their own pace.",
      "public-site-v1":
        "The first public home established an invitation to explore the project and follow its development.",
    } as Record<string, string>
  )[entry.id],
  topic: "website",
  updateType: "website",
  category: "website",
  status:
    entry.state === "merged"
      ? "Recorded website integration"
      : "Dated website journal",
  source: "pullRequest" in entry ? entry.pullRequest : "/site-log.json",
}));
export const allUpdatePosts = [...developmentPosts, ...websitePosts].sort(
  (a, b) => b.date.localeCompare(a.date),
);
