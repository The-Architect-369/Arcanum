'use client';

import TabDots from '@/components/ui/TabDots';
import SwipeRoutes from '@/components/ui/SwipeRoutes';
import { useEffect, useState } from 'react';
import { listPublicRooms, createChannel } from '@/lib/matrix';
import { useAccount } from '@/state/useAccount';
import CTAActivate from '@/components/shared/CTAActivate';
import { COST, canCreateChan } from '@/lib/gates';
import { trySpendMana } from '@/lib/economy';

const ORDER = ['/nexus/post', '/nexus/current', '/nexus/channel'];

export default function NexusChannelPage() {
  const acc = useAccount();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const list = await listPublicRooms();
      if (!alive) return; setRooms(list); setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const onCreate = async () => {
    setMsg(null);
    if (!acc.trusted) return setMsg('Activate your ACC to create a channel.');
    if (!canCreateChan({ trusted: acc.trusted, mana: acc.mana })) return setMsg(`Need ${COST.CREATE_CHANNEL} MANA to create.`);
    if (!name.trim()) return setMsg('Enter a channel name.');

    if (!trySpendMana(COST.CREATE_CHANNEL)) return setMsg('Could not deduct MANA.');
    try {
      const roomId = await createChannel({ name: name.trim(), joinCost: Number(price) || 0 });
      setMsg(`Channel created: ${roomId}. Upkeep is ${COST.MAINTAIN_CHANNEL} MANA/month (scheduled later).`);
      setName('');
    } catch {
      setMsg('Failed to create channel. Check homeserver auth.');
    }
  };

  return (
    <SwipeRoutes order={ORDER}>
      <TabDots tabs={[
        { href: ORDER[0], aria: 'Posts' },
        { href: ORDER[1], aria: 'Current' },
        { href: ORDER[2], aria: 'Channels' },
      ]}/>
      <div className="mx-auto max-w-5xl px-3 py-4 space-y-3">
        <h1 className="text-lg font-semibold">Nexus — Channels</h1>
        <p className="text-sm text-zinc-300">
          Creator picks the subscription price (MANA). Creating costs <b>{COST.CREATE_CHANNEL}</b> MANA and upkeep is <b>{COST.MAINTAIN_CHANNEL}</b> MANA/month.
        </p>

        {!acc.trusted ? (
          <CTAActivate />
        ) : (
          <div className="rounded-lg border border-white/10 bg-black/40 p-3 space-y-2">
            <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Channel name"
              className="w-full rounded-md border border-white/10 bg-black/20 p-2 text-sm outline-none focus:border-amber-300/50" />
            <input value={price} onChange={(e)=>setPrice(Number(e.target.value)||0)} type="number" min={0} step={1}
              placeholder="Join price (MANA, optional)"
              className="w-full rounded-md border border-white/10 bg-black/20 p-2 text-sm outline-none focus:border-amber-300/50" />
            <button onClick={onCreate}
              className="rounded-md border border-amber-300/40 px-3 py-1.5 text-xs text-amber-300 hover:bg-amber-300/10">
              Create Channel (−{COST.CREATE_CHANNEL} MANA)
            </button>
            {msg && <div className="text-xs text-amber-300">{msg}</div>}
          </div>
        )}

        {loading && <div className="text-sm text-zinc-400">Loading channels…</div>}
        <ul className="space-y-2">
          {rooms.map((r)=>(
            <li key={r.room_id} className="rounded-lg border border-white/10 bg-black/40 p-3">
              <div className="text-sm font-medium">{r.name || r.canonical_alias || r.room_id}</div>
              <div className="text-xs text-zinc-400">{r.num_joined_members ?? 0} members</div>
              {/* Joining + premium enforcement will come after we wire creator-defined price fetching */}
            </li>
          ))}
        </ul>
      </div>
    </SwipeRoutes>
  );
}
