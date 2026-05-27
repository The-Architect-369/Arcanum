"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSigningClient, getQueryClient } from "@/lib/cosmos/client";
import { createBurner, hasBurner, loadBurner } from "@/lib/identity/burner";
import { getPasskey, registerPasskey, signInPasskey } from "@/lib/identity/passkey";
import { addReceipt } from "@/lib/mobile/persistence";
import { setAccountSession } from "@/state/useAccount";

const baseDenom = process.env.NEXT_PUBLIC_ARCANUM_BASE_DENOM || "umana";

export default function OnboardPage() {
  const router = useRouter();
  const [mnemonic, setMnemonic] = useState("");
  const [identity, setIdentity] = useState<string | null>(null);
  const [mana, setMana] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);

  function finish(nextPath = "/hope") {
    localStorage.setItem("ARCANUM_NODE_INITIALIZED", "1");
    router.replace(nextPath);
  }

  async function handlePasskey() {
    setBusy(true);
    setStatus("Creating or resuming passkey...");
    try {
      const existing = await getPasskey();
      const passkey = existing ? await signInPasskey() : await registerPasskey();
      const burner = (await hasBurner()) ? await loadBurner() : await createBurner();

      if (!burner) {
        throw new Error("Passkey succeeded, but the device burner session could not be created.");
      }

      setAccountSession({
        trusted: true,
        identitySource: "passkey",
        identityId: passkey.id,
        chainAddress: null,
        mana: 0,
        settlementStatus: "unbound",
        statusMessage: "Passkey session is active. Bind a chain address to settle MANA.",
      });

      await addReceipt({
        kind: "identity",
        title: "Passkey activated",
        summary: "Mobile passkey session is active on this device.",
        status: "confirmed",
        metadata: {
          passkeyId: passkey.id,
          burner,
        },
      });

      setIdentity(passkey.id);
      setMana("0");
      setStatus(
        "Passkey session is ready. You can bind a chain address later from Account / Wallet."
      );
      finish();
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : String(error);
      setStatus(`Passkey failed: ${message}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleBurner() {
    setBusy(true);
    setStatus("Creating local burner...");
    try {
      const burner = (await hasBurner()) ? await loadBurner() : await createBurner();
      if (!burner) {
        throw new Error("Burner failed to initialize.");
      }

      setAccountSession({
        trusted: true,
        identitySource: "burner",
        identityId: burner,
        chainAddress: null,
        mana: 0,
        settlementStatus: "unbound",
        statusMessage: "Burner session is active. Bind a chain address to settle MANA.",
      });

      await addReceipt({
        kind: "identity",
        title: "Burner activated",
        summary: "Device-only burner session created.",
        status: "confirmed",
        metadata: {
          burner,
        },
      });

      setIdentity(burner);
      setMana("0");
      setStatus("Burner session is ready. Chain settlement is still unbound.");
      finish();
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : String(error);
      setStatus(`Burner failed: ${message}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleDevConnect() {
    setBusy(true);
    setStatus("Connecting to Arcanum-D...");
    try {
      const { account } = await getSigningClient(mnemonic.trim());
      const queryClient = await getQueryClient();
      const balances = await queryClient.getAllBalances(account.address);
      const balance = balances.find((entry) => entry.denom === baseDenom);
      const nextMana = balance ? balance.amount : "0";

      setAccountSession({
        trusted: true,
        identitySource: "mnemonic",
        identityId: account.address,
        chainAddress: account.address,
        mana: Number(nextMana),
        settlementStatus: "bound",
        lastSyncedAt: new Date().toISOString(),
        statusMessage: `Developer wallet connected to ARCnet using ${baseDenom}.`,
      });

      await addReceipt({
        kind: "wallet_sync",
        title: "Developer wallet connected",
        summary: `Connected ${account.address} with ${nextMana} ${baseDenom}.`,
        amount: Number(nextMana),
        status: "confirmed",
        metadata: {
          address: account.address,
          denom: baseDenom,
        },
      });

      setIdentity(account.address);
      setMana(nextMana);
      setStatus("Developer wallet connected. Entering Hope...");
      finish();
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : String(error);
      setStatus(`Error: ${message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6">
      <section className="space-y-3">
        <h1 className="text-2xl font-bold">Begin your Rite</h1>
        <p className="text-sm opacity-80">
          Mobile-first onboarding for Pre-Genesis testing. Passkey and burner create a mobile-safe
          identity session. ARCnet settlement stays optional until you bind a real chain address.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <button
          className="rounded-xl border px-4 py-3 text-left transition hover:bg-white/5 disabled:opacity-60"
          onClick={handlePasskey}
          disabled={busy}
        >
          <div className="font-medium">Use Passkey</div>
          <div className="mt-1 text-sm opacity-75">
            Register or resume a mobile passkey, then bind a burner session for device continuity.
          </div>
        </button>

        <button
          className="rounded-xl border px-4 py-3 text-left transition hover:bg-white/5 disabled:opacity-60"
          onClick={handleBurner}
          disabled={busy}
        >
          <div className="font-medium">Use Burner</div>
          <div className="mt-1 text-sm opacity-75">
            Create a device-only burner identity without needing a mnemonic.
          </div>
        </button>
      </section>

      <details className="rounded-xl border p-4">
        <summary className="cursor-pointer text-sm font-medium">
          Developer options (Arcanum-D mnemonic connect)
        </summary>

        <div className="mt-4 space-y-3">
          <p className="text-sm opacity-75">
            This connects a funded developer mnemonic and immediately binds mobile state to a real
            ARCnet address and live MANA balance.
          </p>

          <textarea
            className="min-h-28 w-full rounded border bg-transparent p-3"
            placeholder="Paste a funded mnemonic for Arcanum-D"
            value={mnemonic}
            onChange={(event) => setMnemonic(event.target.value)}
          />

          <button
            className="rounded-xl border px-4 py-2 transition hover:bg-white/5 disabled:opacity-60"
            onClick={handleDevConnect}
            disabled={busy || !mnemonic.trim()}
          >
            Connect to Arcanum-D
          </button>
        </div>
      </details>

      {status && (
        <section className="rounded-xl border p-4 text-sm">
          <p>{status}</p>
          {identity && (
            <p className="mt-2 break-all">
              Identity: <code>{identity}</code>
            </p>
          )}
          {mana !== null && (
            <p className="mt-2">
              MANA balance ({baseDenom}): <strong>{mana}</strong>
            </p>
          )}
        </section>
      )}
    </main>
  );
}
