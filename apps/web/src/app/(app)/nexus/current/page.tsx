'use client';

import TabDots from '@/components/ui/TabDots';
import SwipeRoutes from '@/components/ui/SwipeRoutes';
import { useEffect, useMemo, useState } from 'react';
import { fetchPublicTimeline } from '@/lib/matrix';
import FreeBadge from '@/components/shared/FreeBadge';
import type { ArcanumPostV1 } from '@/lib/post';
import { resolveRoomId, ROOM_ALIAS } from '@/lib/rooms';
import { canSpend } from "@/lib/economy";
import { publishPost, uploadToIPFS } from "@/lib/infra";

const ORDER = ['/nexus/post', '/nexus/current', '/nexus/channel'];
const CURRENT_ALIAS = ROOM_ALIAS.THE_CURRENT;

type Row = {
  author?: string;
  body?: string;
  when?: number;
  media?: Array<{ cid: string; name?: string; mime?: string; size?: number }>;
};

type MediaView = { url: string; mime: string; name?: string };

export default function NexusCurrentPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [previews, setPreviews] = useState<Record<string, MediaView>>({}); // cid -> blob url

  // Preload timeline from #thecurrent alias
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const roomId = await resolveRoomId(CURRENT_ALIAS);
        const events = await fetchPublicTimeline(roomId, 50);

        const out: Row[] = [];
        for (const ev of events) {
          const t = ev?.event?.type;
          if (t === 'com.arcanum.post') {
            const cid = ev?.event?.content?.cid as string | undefined;
            if (!cid) continue;
            const post = await getJSONHelia<ArcanumPostV1>(cid);
            out.push({
              author: post?.author?.handle || post?.author?.acc || ev?.sender?.userId,
              body: post?.body,
              when: post ? Date.parse(post.createdAt) : ev?.event?.origin_server_ts,
              media: post?.media,
            });
          } else if (t === 'm.room.message') {
            out.push({
              author: ev?.sender?.userId,
              body: ev?.event?.content?.body,
              when: ev?.event?.origin_server_ts,
            });
          }
        }

        if (!alive) return;
        setRows(out);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // When rows change, fetch previews for small/previewable media (images/audio/video)
  useEffect(() => {
    let closed = false;
    const fetchPreviews = async () => {
      const seen = new Set(Object.keys(previews));
      const next: Record<string, MediaView> = {};
      for (const r of rows) {
        for (const m of (r.media || [])) {
          if (!m.cid || seen.has(m.cid)) continue;
          if (!m.mime) continue;
          // Only preview common types (avoid huge PDFs); still in-memory in MVP
          const isPreviewable = /^image\/|^video\/|^audio\//i.test(m.mime);
          if (!isPreviewable) continue;

          const blob = await getBlobHelia(m.cid, m.mime);
          if (!blob) continue;
          const url = URL.createObjectURL(blob);
          next[m.cid] = { url, mime: m.mime, name: m.name };
        }
      }
      if (!closed) setPreviews(p => ({ ...p, ...next }));
    };
    fetchPreviews();
    return () => { closed = true; Object.values(previews).forEach(p => URL.revokeObjectURL(p.url)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const renderMedia = (m: { cid: string; name?: string; mime?: string }) => {
    const view = m.cid ? previews[m.cid] : undefined;
    if (!view) {
      return (
        <div className="text-[11px] text-zinc-400">
          Attachment: {m.name || m.cid} {m.mime ? `(${m.mime})` : ''}
        </div>
      );
    }
    if (/^image\//i.test(view.mime)) {
      return <img src={view.url} alt={m.name || 'image'} className="max-h-64 w-auto rounded-md border border-white/10" />;
    }
    if (/^video\//i.test(view.mime)) {
      return <video src={view.url} controls className="max-h-64 w-auto rounded-md border border-white/10" />;
    }
    if (/^audio\//i.test(view.mime)) {
      return <audio src={view.url} controls className="w-full" />;
    }
    return <div className="text-[11px] text-zinc-400">Attachment: {m.name || m.cid}</div>;
  };

  const header = useMemo(() => (
    <div className="mb-1 flex items-center gap-2">
      <h1 className="text-lg font-semibold">Nexus — Current</h1>
      <FreeBadge />
    </div>
  ), []);

  return (
    <SwipeRoutes order={ORDER}>
      <TabDots tabs={[
        { href: ORDER[0], aria: 'Posts' },
        { href: ORDER[1], aria: 'Current' },
        { href: ORDER[2], aria: 'Channels' },
      ]}/>
      <div className="mx-auto max-w-5xl px-3 py-4 space-y-3">
        {header}
        <p className="text-sm text-zinc-300">
          Reading from <code>{CURRENT_ALIAS}</code>. Arcanum posts load directly from Helia by CID.
        </p>

        {loading && <div className="text-sm text-zinc-400">Loading…</div>}
        {!loading && rows.length === 0 && <div className="text-sm text-zinc-400">No messages found.</div>}

        <div className="space-y-3">
          {rows.map((r, i) => (
            <article key={i} className="rounded-md border border-white/10 bg-black/40 p-3">
              <div className="text-xs text-zinc-400">
                {r.author || 'unknown'} {r.when ? `· ${new Date(r.when).toLocaleString()}` : null}
              </div>
              {r.body && <div className="mt-1 text-sm whitespace-pre-wrap break-words">{r.body}</div>}
              {r.media && r.media.length > 0 && (
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {r.media.map((m, idx) => (
                    <div key={idx} className="rounded-md bg-black/30 p-2 border border-white/10">
                      {renderMedia(m)}
                      <div className="mt-1 text-[11px] text-zinc-500 truncate">{m.name || m.cid}</div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </SwipeRoutes>
  );
}
