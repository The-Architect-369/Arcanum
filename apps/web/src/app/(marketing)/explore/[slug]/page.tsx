import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pillars } from "@/lib/public-site";
import {
  PublicShell,
  PageIntro,
  SourceList,
  TempusFigure,
} from "@/components/public/PublicShell";
export const dynamicParams = false;
export function generateStaticParams() {
  return pillars.map(({ slug }) => ({ slug }));
}
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pillar = pillars.find((p) => p.slug === slug);
  return {
    title: pillar?.name,
    description: pillar?.summary,
    alternates: { canonical: `/explore/${slug}` },
  };
}
export default async function PillarPage({ params }: Props) {
  const { slug } = await params;
  const pillar = pillars.find((p) => p.slug === slug);
  if (!pillar) notFound();
  return (
    <PublicShell>
      <PageIntro
        eyebrow={`${pillar.name} / ${pillar.theme}`}
        title={pillar.title}
      >
        <p>{pillar.intro}</p>
      </PageIntro>
      <div className="public-shell public-article-grid">
        <article className="public-prose">
          {pillar.sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
          <section className="public-example">
            <p className="public-eyebrow">In human terms</p>
            <p>{pillar.example}</p>
          </section>
          <blockquote>{pillar.boundary}</blockquote>
          <section>
            <p className="public-eyebrow">Where it stands</p>
            <p>{pillar.status}</p>
          </section>
        </article>
        <div className="public-aside">
          {slug === "tempus" && <TempusFigure />}
          <SourceList sources={pillar.sources} />
        </div>
      </div>
      <div className="public-shell public-section">
        <Link className="public-text-link" href="/explore">
          ← Explore the other pillars
        </Link>
      </div>
    </PublicShell>
  );
}
