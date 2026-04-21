#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import shutil
import sys
import textwrap

TARGET = Path("apps/web/src/app/onboard/page.tsx")

NEW_CONTENT = textwrap.dedent("""\
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getQueryClient, getSigningClient } from '@/lib/cosmos/client'
import { createBurner, hasBurner, loadBurner } from '@/lib/identity/burner'
import { getPasskey, registerPasskey, signInPasskey } from '@/lib/identity/passkey'

const baseDenom = process.env.NEXT_PUBLIC_ARCANUM_BASE_DENOM || 'umana'

export default function OnboardPage() {
  const router = useRouter()
  const [mnemonic, setMnemonic] = useState('')
  const [identity, setIdentity] = useState<string | null>(null)
  const [mana, setMana] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('')
  const [busy, setBusy] = useState(false)

  function complete(nextIdentity?: string | null, nextMana?: string | null) {
    if (nextIdentity !== undefined) setIdentity(nextIdentity)
    if (nextMana !== undefined) setMana(nextMana)
    localStorage.setItem('ARCANUM_NODE_INITIALIZED', '1')
    setStatus('Ready. Entering Hope...')
    router.replace('/hope')
  }

  async function handlePasskey() {
    setBusy(true)
    setStatus('Creating or resuming passkey...')
    try {
      const existing = getPasskey()
      if (existing) {
        await signInPasskey()
      } else {
        await registerPasskey()
      }

      const burner = hasBurner() ? loadBurner() : createBurner()
      if (!burner) throw new Error('Passkey succeeded, but burner binding failed.')

      complete(burner, null)
    } catch (err: any) {
      console.error(err)
      setStatus(`Passkey failed: ${err?.message ?? String(err)}`)
    } finally {
      setBusy(false)
    }
  }

  function handleBurner() {
    setBusy(true)
    setStatus('Creating local burner...')
    try {
      const burner = hasBurner() ? loadBurner() : createBurner()
      if (!burner) throw new Error('Burner failed to initialize.')

      complete(burner, null)
    } catch (err: any) {
      console.error(err)
      setStatus(`Burner failed: ${err?.message ?? String(err)}`)
    } finally {
      setBusy(false)
    }
  }

  async function handleDevConnect() {
    setBusy(true)
    setStatus('Connecting to Arcanum-D...')
    try {
      const { account } = await getSigningClient(mnemonic.trim())
      const nextIdentity = account.address

      const qc = await getQueryClient()
      const balances = await qc.getAllBalances(account.address)
      const bal = balances.find((b) => b.denom === baseDenom)
      const nextMana = bal ? bal.amount : '0'

      complete(nextIdentity, nextMana)
    } catch (err: any) {
      console.error(err)
      setStatus(`Error: ${err?.message ?? String(err)}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6">
      <section className="space-y-3">
        <h1 className="text-2xl font-bold">Begin your Rite</h1>
        <p className="text-sm opacity-80">
          Mobile-first onboarding for Pre-Genesis testing. Use a passkey or local burner by
          default. Developer chain connect remains available below.
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
            Create or resume a local passkey session, then bind a burner for dev.
          </div>
        </button>

        <button
          className="rounded-xl border px-4 py-3 text-left transition hover:bg-white/5 disabled:opacity-60"
          onClick={handleBurner}
          disabled={busy}
        >
          <div className="font-medium">Use Burner</div>
          <div className="mt-1 text-sm opacity-75">
            Create a local-only burner identity without requiring a mnemonic.
          </div>
        </button>
      </section>

      <details className="rounded-xl border p-4">
        <summary className="cursor-pointer text-sm font-medium">
          Developer options (Arcanum-D mnemonic connect)
        </summary>

        <div className="mt-4 space-y-3">
          <p className="text-sm opacity-75">
            This preserves the current chain test flow for funded developer mnemonics.
          </p>

          <textarea
            className="min-h-28 w-full rounded border bg-transparent p-3"
            placeholder="Paste a funded mnemonic for Arcanum-D"
            value={mnemonic}
            onChange={(e) => setMnemonic(e.target.value)}
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
              MANA balance (base units {baseDenom}): <strong>{mana}</strong>
            </p>
          )}
        </section>
      )}
    </main>
  )
}
""")

def main() -> int:
    if not TARGET.exists():
        print(f"error: target file not found: {TARGET}", file=sys.stderr)
        return 1

    backup = TARGET.with_suffix(TARGET.suffix + ".pre-mobile-onboarding-fix.bak")
    shutil.copy2(TARGET, backup)
    TARGET.write_text(NEW_CONTENT, encoding="utf-8")

    print(f"patched: {TARGET}")
    print(f"backup:  {backup}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
