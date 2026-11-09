import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, architectAuthReady, signOut } from "@/auth";
import { architectOrigin } from "@/lib/architect-access";
import { PublicShell, PageIntro } from "@/components/public/PublicShell";
export const metadata: Metadata = {
  title: "Architect review",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function ReviewPage() {
  const origin = architectOrigin(process.env.AUTH_URL);
  if (!architectAuthReady() || !origin) redirect("/architect/login");
  if ((await headers()).get("host") !== new URL(origin).host)
    redirect(`${origin}/architect/login`);
  const session = await auth();
  if (!session?.user?.email) redirect("/architect/login");
  return (
    <PublicShell>
      <PageIntro eyebrow="Architect / Signed-in review" title="Welcome back.">
        <p>Signed in as {session.user.email}.</p>
      </PageIntro>
      <section className="public-shell public-section public-prose">
        <h2>Testing builds</h2>
        <p>
          Downloads remain withheld. A verified private delivery path must be
          established before a testing package is made available here.
        </p>
        <p>
          This workspace does not provide repository writes, deployments, agent
          execution, financial controls or governance authority.
        </p>
        <form
          action={async () => {
            "use server";
            const allowedOrigin = architectOrigin(process.env.AUTH_URL);
            if (
              !architectAuthReady() ||
              !allowedOrigin ||
              (await headers()).get("host") !== new URL(allowedOrigin).host
            )
              throw new Error("Sign-in is unavailable on this address.");
            await signOut({ redirectTo: "/architect/login" });
          }}
        >
          <button className="public-button" type="submit">
            Sign out
          </button>
        </form>
      </section>
    </PublicShell>
  );
}
