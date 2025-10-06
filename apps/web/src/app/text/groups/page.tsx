'use client';

import TabDots from '@/components/ui/TabDots';
import SwipeRoutes from '@/components/ui/SwipeRoutes';
import { useEffect, useState } from 'react';
import { listPublicRooms, createGroup } from '@/lib/matrix';
import { useAccount } from '@/state/useAccount';
import CTAActivate from '@/components/shared/CTAActivate';
import { COST, canCreateGrp } from '@/lib/gates';
import { trySpendMana } from '@/lib/economy';

const ORDER = ['/text/contacts', '/text/messages', '/text/groups'];

export default function TextGroupsPage() {
  const acc = useAccount();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const list = await listPublicRooms('group');
      if (!alive) return; setRooms(list); setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const onCreate = async () => {
    setMsg(null);
    if (!acc.trusted) return setMsg('Activate your ACC to create a group.');
    if (!canCreateGrp({ trusted: acc.trusted, mana: acc.mana })) return setMsg(`Need ${COST.CREATE_GROUP} MANA to create.`);
    if (!name.trim()) return setMsg('Enter a group name.');

    if (!trySpendMana(COST.CREATE_GROUP)) return setMsg('Could not deduct MANA.');
    try {
      const roomId = await createGroup({ name: name.trim() });
      setMsg(`Group created: ${roomId}. (Invites & private join coming next)`);
      setName('');
    } catch { setMsg('Failed to create group.'); }
  };

  return (
    <SwipeRoutes order={ORDER}>
      <TabDots tabs={[
        { href: ORDER[0], aria: 'Contacts' },
        { href: ORDER[1], aria: 'Messages' },
        { href: ORDER[2], aria: 'Groups' },
      ]}/>
      <div className="mx-auto max-w-5xl px-3 py-4 space-y-3">
        <h1 className="text-lg font-semibold">Text — Groups</h1>
        <p className="text-sm text-zinc-300">Creating a group costs <b>{COST.CREATE_GROUP}</b> MANA. Small, meaningful circles.</p>

        {!acc.trusted ? (
          <CTAActivate />
        ) : (
          <div className="rounded-lg border border-white/10 bg-black/40 p-3 space-y-2">
            <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Group name"
              className="w-full rounded-md border border-white/10 bg-black/20 p-2 text-sm outline-none focus:border-amber-300/50" />
            <button onClick={onCreate}
              className="rounded-md border border-amber-300/40 px-3 py-1.5 text-xs text-amber-300 hover:bg-amber-300/10">
              Create Group (−{COST.CREATE_GROUP} MANA)
            </button>
            {msg && <div className="text-xs text-amber-300">{msg}</div>}
          </div>
        )}

        {loading && <div className="text-sm text-zinc-400">Loading groups…</div>}
        <ul className="space-y-2">
          {rooms.map((r)=>(
            <li key={r.room_id} className="rounded-lg border border-white/10 bg-black/40 p-3">
              <div className="text-sm font-medium">{r.name || r.canonical_alias || r.room_id}</div>
              <div className="text-xs text-zinc-400">{r.num_joined_members ?? 0} members</div>
            </li>
          ))}
        </ul>
      </div>
    </SwipeRoutes>
  );
}
