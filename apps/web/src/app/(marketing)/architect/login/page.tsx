import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { architectAuthReady, signIn } from "@/auth";
import { architectOrigin } from "@/lib/architect-access";
import { loadArchitectStore } from "@/lib/architect/store";
import ArchitectGate from "@/components/architect/ArchitectGate";
import "../architect.css";
export const metadata: Metadata = {
  title: "Architect sign-in",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const origin = architectOrigin(process.env.AUTH_URL);
  if (origin && (await headers()).get("host") !== new URL(origin).host)
    redirect(`${origin}/architect/login`);
  let registryReady = false;
  try {
    const store = await loadArchitectStore();
    registryReady = store.members.some((m) => m.active);
  } catch {
    /* Missing authorization source keeps sign-in locked. */
  }
  const ready = architectAuthReady() && registryReady;
  return (
    <ArchitectGate title="Your Architect workspace.">
      <p>
        A protected, read-only view of selected project records. Google
        identifies you; explicit enrollment determines access. No other Google
        account is enrolled automatically.
      </p>
      {error && (
        <p role="alert">
          Sign-in was not completed or this account is not enrolled. No project
          access has been granted.
        </p>
      )}
      {ready ? (
        <form
          action={async () => {
            "use server";
            const approved = architectOrigin(process.env.AUTH_URL);
            if (
              !architectAuthReady() ||
              !approved ||
              (await headers()).get("host") !== new URL(approved).host
            )
              throw new Error("Sign-in unavailable on this address.");
            await signIn("google", { redirectTo: "/architect/review" });
          }}
        >
          <button className="public-button" type="submit">
            Continue with Google
          </button>
        </form>
      ) : (
        <p className="architect-notice">
          Sign-in is being set up. Google connection and a reachable
          authorization source are required; real project records and testing
          downloads remain locked.
        </p>
      )}
      {process.env.VERCEL_ENV === "preview" && (
        <p>
          <a href="/architect/preview">View the synthetic layout preview →</a>
        </p>
      )}
      <details className="current-project">
        <summary>Passkey status</summary>
        <p>
          Google may offer a passkey for your Google account. That is Google’s
          sign-in, not a portal-enrolled passkey. Portal passkeys are not
          enabled in this first build; their credential storage and recovery
          path require a separate verified setup.
        </p>
        <p>
          Your device handles fingerprint, face or PIN. This portal does not
          collect biometric templates.
        </p>
      </details>
    </ArchitectGate>
  );
}
