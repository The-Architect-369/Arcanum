import { redirect } from "next/navigation";
import type { Metadata } from "next";
import CurrentExperience, {
  CurrentTabs,
} from "@/components/public/CurrentExperience";
import UpdatesNext from "@/components/public/UpdatesNext";
import UpdatesFeed from "@/components/public/UpdatesFeed";
import UpdatesAvailable from "@/components/public/UpdatesAvailable";
import UpdatesTray from "@/components/public/UpdatesTray";
import { PublicShell } from "@/components/public/PublicShell";
import { allUpdatePosts } from "@/lib/update-posts";
import "./updates.css";
export const metadata: Metadata = {
  title: "Arcanum Current · Follow the developing ARCnet",
  description: "Come back, see what changed, and understand why it matters.",
  applicationName: "Arcanum Current",
  manifest: "/updates/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Arcanum Current",
    statusBarStyle: "default",
  },
  alternates: { canonical: "https://updates.the-arcanum.net/" },
};
export default async function UpdatesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view: requested } = await searchParams;
  if (requested === "website") redirect("/updates/archive?category=website");
  if (requested === "history") redirect("/updates/archive");
  const selected =
    requested === "latest" || requested === "app"
      ? "available"
      : requested === "ahead" || requested === "roadmap"
        ? "next"
        : requested === "feed"
          ? "updates"
          : requested;
  const view =
    selected === "available" || selected === "next" ? selected : "updates";
  return (
    <CurrentExperience initialView={view}>
      <PublicShell
        showFooter={false}
        className="updates-app"
        bottomNavigation={<UpdatesTray active={view} />}
      >
        <div
          className="updates-hub updates-experience"
          data-updates-shell="true"
        >
          <CurrentTabs
            updates={
              <section aria-labelledby="development-feed">
                <UpdatesFeed posts={allUpdatePosts} />
              </section>
            }
            available={<UpdatesAvailable />}
            next={<UpdatesNext />}
          />
        </div>
      </PublicShell>
    </CurrentExperience>
  );
}
