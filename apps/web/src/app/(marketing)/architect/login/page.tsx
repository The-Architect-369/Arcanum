import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { architectAuthReady, signIn } from "@/auth";
import { architectOrigin } from "@/lib/architect-access";
import { PublicShell, PageIntro } from "@/components/public/PublicShell";
export const metadata: Metadata = {
  title: "Architect sign-in",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function LoginPage() {
  const origin = architectOrigin(process.env.AUTH_URL);
  const host = (await headers()).get("host");
  if (origin && host !== new URL(origin).host)
    redirect(`${origin}/architect/login`);
  const ready = architectAuthReady();
  return (
    <PublicShell>
      <PageIntro
        eyebrow="Architect / Private review"
        title="Your workspace. Your account."
      >
        <p>
          Google sign-in is restricted to the designated Architect account.
          Signing in grants access to this review area only.
        </p>
      </PageIntro>
      <section className="public-shell public-section public-prose">
        {ready ? (
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
              await signIn("google", { redirectTo: "/architect/review" });
            }}
          >
            <button className="public-button" type="submit">
              Continue with Google
            </button>
          </form>
        ) : (
          <p>
            Sign-in is being set up. Private review and testing downloads remain
            locked.
          </p>
        )}
        <p>
          If access is refused, use the designated Google Workspace account. No
          other account is enrolled automatically.
        </p>
        <a href="https://updates.the-arcanum.net/">
          Return to public Updates →
        </a>
      </section>
    </PublicShell>
  );
}
