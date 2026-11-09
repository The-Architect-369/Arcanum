import { siteLog } from "@/lib/public-site";
export type UpdatePost = {
  id: string;
  date: string;
  title: string;
  detail: string;
  category: "development" | "website";
  status: string;
  source?: string;
};
export const developmentPosts: UpdatePost[] = [
  {
    id: "a19-core-integrated",
    date: "2026-10-14",
    title: "A19 core is integrated",
    category: "development",
    status: "Integrated · public download unchanged",
    detail:
      "A19 core closure is recorded on canonical main. The public Android channel remains A18, version 34. Manual portable backup restoration remains deferred; this integration does not close that separate qualification or CE-W04.",
    source: "https://github.com/The-Architect-369/Arcanum/pull/102",
  },
  {
    id: "a18-public-release",
    date: "2026-10-05",
    title: "A reviewed Android development release",
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
  category: "website",
  status:
    entry.state === "merged"
      ? "Recorded website integration"
      : "Dated website journal",
  source: "pullRequest" in entry ? entry.pullRequest : undefined,
}));
export const allUpdatePosts = [...developmentPosts, ...websitePosts].sort(
  (a, b) => b.date.localeCompare(a.date),
);
