'use client';

import TabDots from '@/components/ui/TabDots';
import SwipeRoutes from '@/components/ui/SwipeRoutes';
import { useEffect, useMemo, useState } from 'react';
import { useAccount } from '@/state/useAccount';
import CTAActivate from '@/components/shared/CTAActivate';
import { COST, canPost } from '@/lib/gates';
import { trySpendMana } from '@/lib/economy';
import type { ArcanumPostV1 } from '@/lib/post';
import { sendArcanumPost } from '@/lib/matrix';
import { resolveRoomId, ROOM_ALIAS } from '@/lib/rooms';
import { getJSONHelia, getBlobHelia } from '@/lib/infra/ipfs'
import { putFileHelia, putJSONHelia } from '@/lib/infra/ipfs'
const ORDER = ['/nexus/post', '/nexus/current', '/nexus/channel'];

type MediaItem = { file: File; cid?: string; mime: string; name: string; size: number; status: 'pending'|'done'|'error' };

export default function NexusPostPage() {
  const acc = useAccount() as any; // { trusted, mana, accId?, handle? }
  const defaultAlias = ROOM_ALIAS.ARCHITECT_FEED;
  const [target, setTarget] = useState<string>(defaultAlias); // alias or roomId
  const [roomId, setRoomId] = useState<string>('');
  const [body, setBody] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Resolve to roomId on target change
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const id = await resolveRoomId(target);
        if (!alive) return;
        setRoomId(id);
      } catch {
        setRoomId('');
      }
    })();
    return () => { alive = false; };
  }, [target]);

  const costText = useMemo(() => `Cost: ${COST.POST} MANA`, []);

  const onPickFiles = (files: FileList | null) => {
    if (!files || !files.length) return;
    const next: MediaItem[] = [];
    for (const f of Array.from(files)) {
      next.push({ file: f, mime: f.type || 'application/octet-stream', name: f.name, size: f.size, status: 'pending' });
    }
    setMedia(m => [...m, ...next]);
  };

  const uploadPendingMedia = async (): Promise<ArcanumPostV1['media']> => {
    const results: ArcanumPostV1['media'] = [];
    const copy = [...media];
    for (let i = 0; i < copy.length; i++) {
      const item = copy[i];
      if (item.cid) { results.push({ cid: item.cid, name: item.name, mime: item.mime, size: item.size }); continue; }
      try {
        const { cid } = await putFileHelia(item.file);
        copy[i] = { ...item, cid, status: 'done' };
        results.push({ cid, name: item.name, mime: item.mime, size: item.size });
      } catch {
        copy[i] = { ...item, status: 'error' };
      }
    }
    setMedia(copy);
    return results;
  };

  const onPublish = async () => {
    setMsg(null);
    if (!acc?.trusted) return setMsg('Activate your ACC to publish.');
    if (!canPost({ trusted: !!acc.trusted, mana: Number(acc.mana ?? 0) })) return setMsg(`Need ${COST.POST} MANA to post.`);
    if (!roomId) return setMsg('Cannot resolve target room. Check alias/ID.');
    if (!body.trim() && media.length === 0) return setMsg('Write something or attach media.');

    setBusy(true);
    try {
      const attachments = await uploadPendingMedia();

      const post: ArcanumPostV1 = {
        v: 1,
        author: { acc: acc.accId || 'acc:unknown', handle: acc.handle, peerId },
        room: { id: roomId },
        createdAt: new Date().toISOString(),
        body: body.trim(),
        media: attachments && attachments.length ? attachments : undefined,
      };

      const cid = await putJSONHelia(post);

      if (!trySpendMana(COST.POST)) throw new Error('Could not deduct MANA.');
      await sendArcanumPost(roomId, cid, post.body.slice(0, 120));

      setBody('');
      setMedia([]);
      setMsg(`Posted! CID: ${cid}`);
    } catch (e: any) {
      setMsg(e?.message || 'Failed to publish.');
    } finally {
      setBusy(false);
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
        <h1 className="text-lg font-semibold">Nexus — Posts</h1>
        <p className="text-sm text-zinc-300">
          Your device publishes to Helia; Matrix shares the CID. No outside hosting.
        </p>

        {!acc?.trusted ? (
          <CTAActivate />
        ) : (
          <div className="rounded-lg border border-white/10 bg-black/40 p-3 space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Room alias or ID (e.g. #architect:arcanum.tld or !room:server)"
                className="w-full rounded-md border border-white/10 bg-black/20 p-2 text-sm outline-none focus:border-amber-300/50"
              />
              <div className="text-xs text-zinc-400 flex items-center">Resolved roomId: <span className="ml-1 truncate">{roomId || '—'}</span></div>
            </div>

            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write something cosmic…"
              className="w-full resize-none rounded-md border border-white/10 bg-black/20 p-2 text-sm outline-none focus:border-amber-300/50"
              rows={4}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="inline-block">
                  <span className="sr-only">Attach files</span>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => onPickFiles(e.target.files)}
                    className="block text-xs"
                    accept="image/*,video/*,audio/*,application/pdf"
                  />
                </label>
                <div className="text-xs text-zinc-400">{costText}</div>
              </div>

              {media.length > 0 && (
                <ul className="space-y-1">
                  {media.map((m, i) => (
                    <li key={i} className="text-xs text-zinc-300 flex items-center gap-2">
                      <span className="truncate">{m.name}</span>
                      <span className="opacity-60">({Math.round(m.size/1024)} KB)</span>
                      <span className={m.status === 'error' ? 'text-red-400' : 'text-zinc-400'}>— {m.status}</span>
                      {m.cid && <span className="opacity-70 truncate">CID: {m.cid}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-end">
              <button
                onClick={onPublish}
                disabled={busy || (!body.trim() && media.length === 0)}
                className="rounded-md border border-amber-300/40 px-3 py-1.5 text-xs text-amber-300 hover:bg-amber-300/10 disabled:opacity-60"
              >
                {busy ? 'Publishing…' : 'Publish'}
              </button>
            </div>

            {msg && <div className="text-xs text-amber-300">{msg}</div>}
          </div>
        )}
      </div>
    </SwipeRoutes>
  );
}
