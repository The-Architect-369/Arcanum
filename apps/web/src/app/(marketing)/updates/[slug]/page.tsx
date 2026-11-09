import { notFound } from "next/navigation";
import { PublicShell } from "@/components/public/PublicShell";
import { allUpdatePosts } from "@/lib/update-posts";
import "../updates.css";
export function generateStaticParams() {
  return allUpdatePosts.map((post) => ({ slug: post.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = allUpdatePosts.find((p) => p.id === slug);
  return {
    title: post?.title ?? "Update not found",
    alternates: {
      canonical: `https://updates.the-arcanum.net/updates/${slug}`,
    },
  };
}
export default async function UpdateDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = allUpdatePosts.find((p) => p.id === slug);
  if (!post) notFound();
  return (
    <PublicShell>
      <article className="updates-detail">
        <a
          href={`/updates?view=${post.category === "website" ? "website" : "updates"}`}
        >
          ← Back to Updates
        </a>
        <p className="updates-meta">
          <time dateTime={post.date}>{post.date}</time> · {post.status}
        </p>
        <h1>{post.title}</h1>
        <p>{post.detail}</p>
        {post.source && (
          <p>
            <a href={post.source}>Inspect the source record ↗</a>
          </p>
        )}
        <p className="updates-footnote">
          Dated record. Integration, public availability and Human acceptance
          are separate states.
        </p>
      </article>
    </PublicShell>
  );
}
