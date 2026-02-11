'use client';

import TabDots from '@/components/ui/TabDots';
import SwipeRoutes from '@/components/ui/SwipeRoutes';
import { useEffect, useMemo, useState } from 'react';
import { fetchPublicTimeline } from '@/lib/matrix';
import { resolveRoomId, ROOM_ALIAS } from '@/lib/rooms';
import FreeBadge from '@/components/shared/FreeBadge';

const ORDER = ['/text/contacts', '/text/messages', '/text/groups'];

type Row = { sender: string; body: string; at: number };

export default function TextMessagesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const currentAlias = ROOM_ALIAS.THE_CURRENT;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const roomId = await resolveRoomId(currentAlias);
        const events = await fetchPublicTimeline(roomId, 50);
        const mapped: Row[] = (events || [])
          .filter((e: any) => e?.event?.type === 'm.room.message')
          .map((e: any) => ({
            sender: e?.sender?.userId || 'unknown',
            body: e?.event?.content?.body || '',
            at: e?.event?.origin_server_ts || Date.now(),
          }));
        if (!alive) return;
        setRows(mapped);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || 'Failed to load timeline');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [currentAlias]);

  const header = useMemo(() => (
    <div className="mb-1 flex items-center gap-2">
      <h1 className="text-lg font-semibold">Text — Messages</h1>
      <FreeBadge />
    </div>
  ), []);

  return (
    <SwipeRoutes order={ORDER}>
      <TabDots tabs={[
        { href: ORDER[0], aria: 'Contacts' },
        { href: ORDER[1], aria: 'Messages' },
        { href: ORDER[2], aria: 'Groups' },
      ]}/>
      <div className="mx-auto max-w-5xl px-3 py-4 space-y-3">
        {header}
        <p className="text-sm text-zinc-300">
          Reading from <code>{currentAlias}</code>. Public, read-only preview.
        </p>

        {loading && <div className="text-sm text-zinc-400">Loading…</div>}
        {err && <div className="text-xs text-red-400">{err}</div>}
        {!loading && !err && rows.length === 0 && (
          <div className="text-sm text-zinc-400">
            No messages found. After seeding, a welcome message will appear here.
          </div>
        )}

        <div className="space-y-2">
          {rows.map((m, i) => (
            <div key={i} className={`max-w-[80%] rounded-lg border border-white/10 bg-black/40 p-2 ${i % 2 ? 'ml-auto' : ''}`}>
              <div className="text-[11px] text-zinc-400">
                {m.sender} · {new Date(m.at).toLocaleString()}
              </div>
              <div className="text-sm whitespace-pre-wrap break-words">{m.body}</div>
            </div>
          ))}
        </div>
      </div>
    </SwipeRoutes>
  );
}
