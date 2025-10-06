'use client';

import { useEffect, useState } from 'react';
import { createPublicClient, http, type Address, isAddress } from 'viem';
import { sepolia } from 'viem/chains';
import { useAccount } from 'wagmi';
import { loadBurner } from '@/lib/burner';

const RPC = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || '';

const FACTORY_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'uint256', name: 'salt', type: 'uint256' },
    ],
    name: 'getAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export default function SimpleAccountPreview() {
  const { address: wagmiAddr } = useAccount();
  const [burner, setBurner] = useState<Address | undefined>();
  const [owner, setOwner] = useState<Address | ''>('');
  const [factory, setFactory] = useState<Address | ''>('');
  const [salt, setSalt] = useState<string>('0'); // uint256 as string
  const [computed, setComputed] = useState<Address | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    try {
      setBurner(loadBurner().address as Address);
    } catch {}
  }, []);

  useEffect(() => {
    const o = (wagmiAddr ?? burner) as Address | undefined;
    if (o) setOwner(o);
  }, [wagmiAddr, burner]);

  async function compute() {
    setErr(null);
    setComputed(null);
    try {
      if (!RPC) throw new Error('Set NEXT_PUBLIC_SEPOLIA_RPC_URL in your .env');
      if (!factory || !owner) throw new Error('Owner or Factory missing');
      if (!isAddress(owner)) throw new Error('Owner is not a valid address');
      if (!isAddress(factory)) throw new Error('Factory is not a valid address');

      const client = createPublicClient({ chain: sepolia, transport: http(RPC) });
      const addr = (await client.readContract({
        abi: FACTORY_ABI,
        address: factory,
        functionName: 'getAddress',
        args: [owner, BigInt(salt || '0')],
      })) as Address;

      setComputed(addr);
    } catch (e: any) {
      setErr(e.message || String(e));
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-zinc-800 p-4">
      <div className="text-sm opacity-80 mb-2">SimpleAccount · Counterfactual Preview</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <div className="opacity-70 mb-1">Owner Address</div>
          <input
            value={owner}
            onChange={(e) => setOwner(e.target.value as Address)}
            placeholder="0x..."
            className="w-full rounded-xl bg-zinc-900 px-3 py-2 outline-none border border-zinc-800"
          />
          <div className="text-xs mt-1 opacity-60">Uses connected wallet or burner by default. You can override.</div>
        </label>
        <label className="text-sm">
          <div className="opacity-70 mb-1">SimpleAccountFactory Address</div>
          <input
            value={factory}
            onChange={(e) => setFactory(e.target.value as Address)}
            placeholder="0x... (paste your factory)"
            className="w-full rounded-xl bg-zinc-900 px-3 py-2 outline-none border border-zinc-800"
          />
          <div className="text-xs mt-1 opacity-60">This is the factory contract you plan to use (editable).</div>
        </label>
        <label className="text-sm">
          <div className="opacity-70 mb-1">Salt (uint256)</div>
          <input
            value={salt}
            onChange={(e) => setSalt(e.target.value)}
            className="w-full rounded-xl bg-zinc-900 px-3 py-2 outline-none border border-zinc-800"
          />
        </label>
        <div className="flex items-end">
          <button onClick={compute} className="rounded-xl px-4 py-2 bg-white/10 hover:bg-white/20 transition">
            Compute Address
          </button>
        </div>
      </div>

      {computed && (
        <div className="mt-4 text-sm">
          <div className="opacity-70">Counterfactual Address</div>
          <code className="text-emerald-400">{computed}</code>
        </div>
      )}
      {err && <div className="mt-3 text-sm text-amber-400">Error: {err}</div>}
    </div>
  );
}
