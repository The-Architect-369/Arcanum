'use client'

import { useState } from 'react'
import { getQueryClient, getSigningClient } from '@/lib/cosmos/client'

const baseDenom = process.env.NEXT_PUBLIC_ARCANUM_BASE_DENOM || 'umana'

export default function OnboardPage() {
  const [mnemonic, setMnemonic] = useState('')
  const [address, setAddress] = useState<string | null>(null)
  const [mana, setMana] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('')

  async function handleConnect() {
    setStatus('Connecting to Arcanum-D...')
    try {
      const { account } = await getSigningClient(mnemonic)
      setAddress(account.address)

      const qc = await getQueryClient()
      const balances = await qc.getAllBalances(account.address)
      const bal = balances.find(b => b.denom === baseDenom)
      setMana(bal ? bal.amount : '0')

      setStatus('Connected')
    } catch (err: any) {
      console.error(err)
      setStatus(`Error: ${err?.message ?? String(err)}`)
    }
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Begin your Rite</h1>
      <p className="text-sm opacity-80">Dev-only burner flow (will be replaced with Keplr/Leap).</p>
      <textarea
        className="border rounded p-2 w-full h-24"
        placeholder="Paste a mnemonic with some umana"
        value={mnemonic}
        onChange={e => setMnemonic(e.target.value)}
      />
      <button
        className="border px-4 py-2 rounded"
        onClick={handleConnect}
      >
        Connect to Arcanum-D
      </button>

      {status && <p className="text-sm mt-2">{status}</p>}
      {address && (
        <p className="text-sm">
          Address: <code>{address}</code>
        </p>
      )}
      {mana !== null && (
        <p className="text-sm">
          MANA balance (base units {baseDenom}): <strong>{mana}</strong>
        </p>
      )}
    </main>
  )
}
