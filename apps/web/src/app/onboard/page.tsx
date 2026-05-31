"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getPasskey,
  getPasskeySupport,
  registerPasskey,
  signInPasskey,
} from "@/lib/identity/passkey";
import { addReceipt } from "@/lib/mobile/persistence";
import { setAccountSession } from "@/state/useAccount";

export default function OnboardPage() {
  const router = useRouter();
  const [identity, setIdentity] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const passkeySupport = useMemo(() => getPasskeySupport(), []);

  function finish(nextPath = "/account") {
    localStorage.setItem("ARCANUM_NODE_INITIALIZED", "1");
    router.replace(nextPath);
  }

  async function handleCanonicalActivation() {
    if (!passkeySupport.supported) {
      setStatus(`Passkey unavailable: ${passkeySupport.reason}`);
      return;
    }

    setBusy(true);
    setStatus("Activating canonical identity…");

    try {
      const existing = await getPasskey();
      const passkey = existing ? await signInPasskey() : await registerPasskey();

      setAccountSession({
        trusted: true,
        identitySource: "passkey",
        identityId: passkey.id,
        chainAddress: null,
        mana: 0,
        settlementStatus: "unbound",
        statusMessage:
          "Canonical identity session is active. Continue in Account to bind ARCnet.",
      });

      await addReceipt({
        kind: "identity",
        title: "Canonical identity activated",
        summary: "Passkey continuity activated on this device.",
        status: "confirmed",
        metadata: {
          passkeyId: passkey.id,
          activationRail: "canonical-passkey",
        },
      });

      setIdentity(passkey.id);
      setStatus(
        "Canonical identity is active. Continue to Account to bind your ARCnet address."
      );
      finish();
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : String(error);
      setStatus(`Activation failed: ${message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6">
      <section className="space-y-3">
        <h1 className="text-2xl font-bold">Canonical Activation</h1>
        <p className="text-sm opacity-80">
          Live onboarding now exposes one accountable activation rail. Burner and
          developer mnemonic shortcuts are not part of this public surface.
        </p>
      </section>

      <section className="rounded-xl border p-4 text-sm opacity-85">
        <p>
          This step establishes continuity through passkey activation.
          ARCnet settlement binding remains a separate accountable step and should
          not be faked on the onboarding screen.
        </p>
      </section>

      <section className="grid gap-3">
        <button
          className="rounded-xl border px-4 py-4 text-left transition hover:bg-white/5 disabled:opacity-60"
          onClick={handleCanonicalActivation}
          disabled={busy || !passkeySupport.supported}
        >
          <div className="font-medium">Activate with Passkey</div>
          <div className="mt-1 text-sm opacity-75">
            {passkeySupport.supported
              ? "Register or resume the canonical passkey identity for this device."
              : `Unavailable here: ${passkeySupport.reason}`}
          </div>
        </button>
      </section>

      <section className="rounded-xl border p-4 text-sm opacity-75">
        <p>
          After activation, continue to Account to bind an ARCnet address and
          complete the next settlement-facing step.
        </p>
      </section>

      {status && (
        <section className="rounded-xl border p-4 text-sm">
          <p>{status}</p>
          {identity && (
            <p className="mt-2 break-all font-mono text-xs opacity-70">{identity}</p>
          )}
        </section>
      )}
    </main>
  );
}
