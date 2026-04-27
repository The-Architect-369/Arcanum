#!/usr/bin/env python3

from pathlib import Path
import shutil
import textwrap

FILES = {
    "apps/web/src/components/ui/AppStage.tsx": textwrap.dedent("""\
        import * as React from "react";
        import { cn } from "@/lib/cn";

        export default function AppStage({
          children,
          className,
        }: {
          children: React.ReactNode;
          className?: string;
        }) {
          return <div className={cn("flex min-h-full flex-col", className)}>{children}</div>;
        }
    """),

    "apps/web/src/app/(app)/nexus/current/page.tsx": textwrap.dedent("""\
        'use client';

        import TabDots from '@/components/ui/TabDots';
        import SwipeRoutes from '@/components/ui/SwipeRoutes';
        import AppStage from '@/components/ui/AppStage';
        import PanelShell from '@/components/ui/PanelShell';
        import { useEffect, useMemo, useState } from 'react';
        import { fetchPublicTimeline } from '@/lib/matrix';
        import FreeBadge from '@/components/shared/FreeBadge';
        import type { ArcanumPostV1 } from '@/lib/post';
        import { resolveRoomId, ROOM_ALIAS } from '@/lib/rooms';
        import { getJSONHelia, getBlobHelia } from '@/lib/infra/ipfs';

        const ORDER = ['/nexus/post', '/nexus/current', '/nexus/channel'] as const;
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
          const [previews, setPreviews] = useState<Record<string, MediaView>>({});

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
            return () => {
              alive = false;
            };
          }, []);

          useEffect(() => {
            let closed = false;
            const fetchPreviews = async () => {
              const seen = new Set(Object.keys(previews));
              const next: Record<string, MediaView> = {};
              for (const r of rows) {
                for (const m of r.media || []) {
                  if (!m.cid || seen.has(m.cid)) continue;
                  if (!m.mime) continue;
                  const isPreviewable = /^image\\/|^video\\/|^audio\\//i.test(m.mime);
                  if (!isPreviewable) continue;

                  const blob = await getBlobHelia(m.cid);
                  if (!blob) continue;
                  const url = URL.createObjectURL(blob);
                  next[m.cid] = { url, mime: m.mime, name: m.name };
                }
              }
              if (!closed) setPreviews((p) => ({ ...p, ...next }));
            };
            fetchPreviews();
            return () => {
              closed = true;
              Object.values(previews).forEach((p) => URL.revokeObjectURL(p.url));
            };
          }, [rows, previews]);

          const renderMedia = (m: { cid: string; name?: string; mime?: string }) => {
            const view = m.cid ? previews[m.cid] : undefined;
            if (!view) {
              return (
                <div className="text-[11px] text-zinc-400">
                  Attachment: {m.name || m.cid} {m.mime ? `(${m.mime})` : ''}
                </div>
              );
            }
            if (/^image\\//i.test(view.mime)) {
              return (
                <img
                  src={view.url}
                  alt={m.name || 'image'}
                  className="max-h-64 w-auto rounded-md border border-white/10"
                />
              );
            }
            if (/^video\\//i.test(view.mime)) {
              return (
                <video
                  src={view.url}
                  controls
                  className="max-h-64 w-auto rounded-md border border-white/10"
                />
              );
            }
            if (/^audio\\//i.test(view.mime)) {
              return <audio src={view.url} controls className="w-full" />;
            }
            return <div className="text-[11px] text-zinc-400">Attachment: {m.name || m.cid}</div>;
          };

          const title = useMemo(
            () => (
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">Nexus — Current</h1>
                <FreeBadge />
              </div>
            ),
            []
          );

          return (
            <SwipeRoutes order={ORDER}>
              <AppStage>
                <TabDots
                  tabs={[
                    { href: ORDER[0], aria: 'Posts' },
                    { href: ORDER[1], aria: 'Current' },
                    { href: ORDER[2], aria: 'Channels' },
                  ]}
                />
                <PanelShell title={title} flush className="flex-1">
                  <div className="space-y-3">
                    <p className="text-sm text-zinc-300">
                      Reading from <code>{CURRENT_ALIAS}</code>. Arcanum posts load directly from Helia by CID.
                    </p>

                    {loading && <div className="text-sm text-zinc-400">Loading…</div>}
                    {!loading && rows.length === 0 && (
                      <div className="text-sm text-zinc-400">No messages found.</div>
                    )}

                    <div className="space-y-3">
                      {rows.map((r, i) => (
                        <article key={i} className="rounded-md border border-white/10 bg-black/40 p-3">
                          <div className="text-xs text-zinc-400">
                            {r.author || 'unknown'} {r.when ? `· ${new Date(r.when).toLocaleString()}` : null}
                          </div>
                          {r.body && (
                            <div className="mt-1 break-words whitespace-pre-wrap text-sm">{r.body}</div>
                          )}
                          {r.media && r.media.length > 0 && (
                            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                              {r.media.map((m, idx) => (
                                <div key={idx} className="rounded-md border border-white/10 bg-black/30 p-2">
                                  {renderMedia(m)}
                                  <div className="mt-1 truncate text-[11px] text-zinc-500">
                                    {m.name || m.cid}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  </div>
                </PanelShell>
              </AppStage>
            </SwipeRoutes>
          );
        }
    """),

    "apps/web/src/app/(app)/nexus/post/page.tsx": textwrap.dedent("""\
        'use client';

        import TabDots from '@/components/ui/TabDots';
        import SwipeRoutes from '@/components/ui/SwipeRoutes';
        import AppStage from '@/components/ui/AppStage';
        import PanelShell from '@/components/ui/PanelShell';
        import { useEffect, useMemo, useState } from 'react';
        import { useAccount } from '@/state/useAccount';
        import CTAActivate from '@/components/shared/CTAActivate';
        import { COST, canPost } from '@/lib/gates';
        import { trySpendMana } from '@/lib/economy';
        import type { ArcanumPostV1 } from '@/lib/post';
        import { sendArcanumPost } from '@/lib/matrix';
        import { resolveRoomId, ROOM_ALIAS } from '@/lib/rooms';
        import { putFileHelia, putJSONHelia } from '@/lib/infra/ipfs';

        const ORDER = ['/nexus/post', '/nexus/current', '/nexus/channel'] as const;

        type MediaItem = {
          file: File;
          cid?: string;
          mime: string;
          name: string;
          size: number;
          status: 'pending' | 'done' | 'error';
        };

        export default function NexusPostPage() {
          const acc = useAccount() as any;
          const peerId = typeof acc?.peerId === 'string' ? acc.peerId : undefined;
          const defaultAlias = ROOM_ALIAS.ARCHITECT_FEED;
          const [target, setTarget] = useState<string>(defaultAlias);
          const [roomId, setRoomId] = useState<string>('');
          const [body, setBody] = useState('');
          const [media, setMedia] = useState<MediaItem[]>([]);
          const [msg, setMsg] = useState<string | null>(null);
          const [busy, setBusy] = useState(false);

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
            return () => {
              alive = false;
            };
          }, [target]);

          const costText = useMemo(() => `Cost: ${COST.POST} MANA`, []);

          const onPickFiles = (files: FileList | null) => {
            if (!files || !files.length) return;
            const next: MediaItem[] = [];
            for (const f of Array.from(files)) {
              next.push({
                file: f,
                mime: f.type || 'application/octet-stream',
                name: f.name,
                size: f.size,
                status: 'pending',
              });
            }
            setMedia((m) => [...m, ...next]);
          };

          const uploadPendingMedia = async (): Promise<ArcanumPostV1['media']> => {
            const results: ArcanumPostV1['media'] = [];
            const copy = [...media];
            for (let i = 0; i < copy.length; i++) {
              const item = copy[i];
              if (item.cid) {
                results.push({ cid: item.cid, name: item.name, mime: item.mime, size: item.size });
                continue;
              }
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
            if (!canPost({ trusted: !!acc.trusted, mana: Number(acc.mana ?? 0) })) {
              return setMsg(`Need ${COST.POST} MANA to post.`);
            }
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

              const { cid } = await putJSONHelia(post);

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
              <AppStage>
                <TabDots
                  tabs={[
                    { href: ORDER[0], aria: 'Posts' },
                    { href: ORDER[1], aria: 'Current' },
                    { href: ORDER[2], aria: 'Channels' },
                  ]}
                />
                <PanelShell title="Nexus — Posts" flush className="flex-1">
                  <div className="space-y-3">
                    <p className="text-sm text-zinc-300">
                      Your device publishes to Helia; Matrix shares the CID. No outside hosting.
                    </p>

                    {!acc?.trusted ? (
                      <CTAActivate />
                    ) : (
                      <div className="space-y-3 rounded-lg border border-white/10 bg-black/40 p-3">
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            placeholder="Room alias or ID"
                            className="w-full rounded-md border border-white/10 bg-black/20 p-2 text-sm outline-none focus:border-amber-300/50"
                          />
                          <div className="flex items-center text-xs text-zinc-400">
                            Resolved roomId:
                            <span className="ml-1 truncate">{roomId || '—'}</span>
                          </div>
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
                                <li key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                                  <span className="truncate">{m.name}</span>
                                  <span className="opacity-60">({Math.round(m.size / 1024)} KB)</span>
                                  <span className={m.status === 'error' ? 'text-red-400' : 'text-zinc-400'}>
                                    — {m.status}
                                  </span>
                                  {m.cid && <span className="truncate opacity-70">CID: {m.cid}</span>}
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
                </PanelShell>
              </AppStage>
            </SwipeRoutes>
          );
        }
    """),

    "apps/web/src/app/(app)/nexus/channel/page.tsx": textwrap.dedent("""\
        'use client';

        import TabDots from '@/components/ui/TabDots';
        import SwipeRoutes from '@/components/ui/SwipeRoutes';
        import AppStage from '@/components/ui/AppStage';
        import PanelShell from '@/components/ui/PanelShell';
        import { useEffect, useState } from 'react';
        import { listPublicRooms, createChannel } from '@/lib/matrix';
        import { useAccount } from '@/state/useAccount';
        import CTAActivate from '@/components/shared/CTAActivate';
        import { COST, canCreateChan } from '@/lib/gates';
        import { trySpendMana } from '@/lib/economy';

        const ORDER = ['/nexus/post', '/nexus/current', '/nexus/channel'] as const;

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
              if (!alive) return;
              setRooms(list);
              setLoading(false);
            })();
            return () => {
              alive = false;
            };
          }, []);

          const onCreate = async () => {
            setMsg(null);
            if (!acc.trusted) return setMsg('Activate your ACC to create a channel.');
            if (!canCreateChan({ trusted: acc.trusted, mana: acc.mana })) {
              return setMsg(`Need ${COST.CREATE_CHANNEL} MANA to create.`);
            }
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
              <AppStage>
                <TabDots
                  tabs={[
                    { href: ORDER[0], aria: 'Posts' },
                    { href: ORDER[1], aria: 'Current' },
                    { href: ORDER[2], aria: 'Channels' },
                  ]}
                />
                <PanelShell title="Nexus — Channels" flush className="flex-1">
                  <div className="space-y-3">
                    <p className="text-sm text-zinc-300">
                      Creator picks the subscription price (MANA). Creating costs <b>{COST.CREATE_CHANNEL}</b> MANA and upkeep is <b>{COST.MAINTAIN_CHANNEL}</b> MANA/month.
                    </p>

                    {!acc.trusted ? (
                      <CTAActivate />
                    ) : (
                      <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-3">
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Channel name"
                          className="w-full rounded-md border border-white/10 bg-black/20 p-2 text-sm outline-none focus:border-amber-300/50"
                        />
                        <input
                          value={price}
                          onChange={(e) => setPrice(Number(e.target.value) || 0)}
                          type="number"
                          min={0}
                          step={1}
                          placeholder="Join price (MANA, optional)"
                          className="w-full rounded-md border border-white/10 bg-black/20 p-2 text-sm outline-none focus:border-amber-300/50"
                        />
                        <button
                          onClick={onCreate}
                          className="rounded-md border border-amber-300/40 px-3 py-1.5 text-xs text-amber-300 hover:bg-amber-300/10"
                        >
                          Create Channel (−{COST.CREATE_CHANNEL} MANA)
                        </button>
                        {msg && <div className="text-xs text-amber-300">{msg}</div>}
                      </div>
                    )}

                    {loading && <div className="text-sm text-zinc-400">Loading channels…</div>}
                    <ul className="space-y-2">
                      {rooms.map((r) => (
                        <li key={r.room_id} className="rounded-lg border border-white/10 bg-black/40 p-3">
                          <div className="text-sm font-medium">{r.name || r.canonical_alias || r.room_id}</div>
                          <div className="text-xs text-zinc-400">{r.num_joined_members ?? 0} members</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </PanelShell>
              </AppStage>
            </SwipeRoutes>
          );
        }
    """),

    "apps/web/src/app/(app)/text/contacts/page.tsx": textwrap.dedent("""\
        'use client';

        import TabDots from '@/components/ui/TabDots';
        import SwipeRoutes from '@/components/ui/SwipeRoutes';
        import AppStage from '@/components/ui/AppStage';
        import PanelShell from '@/components/ui/PanelShell';

        const ORDER = ['/text/contacts', '/text/messages', '/text/groups'] as const;

        export default function TextContactsPage() {
          return (
            <SwipeRoutes order={ORDER}>
              <AppStage>
                <TabDots
                  tabs={[
                    { href: ORDER[0], aria: 'Contacts' },
                    { href: ORDER[1], aria: 'Messages' },
                    { href: ORDER[2], aria: 'Groups' },
                  ]}
                />
                <PanelShell title="Text — Contacts" flush className="flex-1">
                  <p className="text-sm text-zinc-300">
                    Your address book preview. ACC syncs Chain Code links.
                  </p>
                </PanelShell>
              </AppStage>
            </SwipeRoutes>
          );
        }
    """),

    "apps/web/src/app/(app)/text/messages/page.tsx": textwrap.dedent("""\
        'use client';

        import TabDots from '@/components/ui/TabDots';
        import SwipeRoutes from '@/components/ui/SwipeRoutes';
        import AppStage from '@/components/ui/AppStage';
        import PanelShell from '@/components/ui/PanelShell';
        import { useEffect, useMemo, useState } from 'react';
        import { fetchPublicTimeline } from '@/lib/matrix';
        import { resolveRoomId, ROOM_ALIAS } from '@/lib/rooms';
        import FreeBadge from '@/components/shared/FreeBadge';

        const ORDER = ['/text/contacts', '/text/messages', '/text/groups'] as const;

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
            return () => {
              alive = false;
            };
          }, [currentAlias]);

          const title = useMemo(
            () => (
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">Text — Messages</h1>
                <FreeBadge />
              </div>
            ),
            []
          );

          return (
            <SwipeRoutes order={ORDER}>
              <AppStage>
                <TabDots
                  tabs={[
                    { href: ORDER[0], aria: 'Contacts' },
                    { href: ORDER[1], aria: 'Messages' },
                    { href: ORDER[2], aria: 'Groups' },
                  ]}
                />
                <PanelShell title={title} flush className="flex-1">
                  <div className="space-y-3">
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
                        <div
                          key={i}
                          className={`max-w-[80%] rounded-lg border border-white/10 bg-black/40 p-2 ${i % 2 ? 'ml-auto' : ''}`}
                        >
                          <div className="text-[11px] text-zinc-400">
                            {m.sender} · {new Date(m.at).toLocaleString()}
                          </div>
                          <div className="break-words whitespace-pre-wrap text-sm">{m.body}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </PanelShell>
              </AppStage>
            </SwipeRoutes>
          );
        }
    """),

    "apps/web/src/app/(app)/text/groups/page.tsx": textwrap.dedent("""\
        'use client';

        import TabDots from '@/components/ui/TabDots';
        import SwipeRoutes from '@/components/ui/SwipeRoutes';
        import AppStage from '@/components/ui/AppStage';
        import PanelShell from '@/components/ui/PanelShell';
        import { useEffect, useState } from 'react';
        import { listPublicRooms, createGroup } from '@/lib/matrix';
        import { useAccount } from '@/state/useAccount';
        import CTAActivate from '@/components/shared/CTAActivate';
        import { COST, canCreateGrp } from '@/lib/gates';
        import { trySpendMana } from '@/lib/economy';

        const ORDER = ['/text/contacts', '/text/messages', '/text/groups'] as const;

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
              if (!alive) return;
              setRooms(list);
              setLoading(false);
            })();
            return () => {
              alive = false;
            };
          }, []);

          const onCreate = async () => {
            setMsg(null);
            if (!acc.trusted) return setMsg('Activate your ACC to create a group.');
            if (!canCreateGrp({ trusted: acc.trusted, mana: acc.mana })) {
              return setMsg(`Need ${COST.CREATE_GROUP} MANA to create.`);
            }
            if (!name.trim()) return setMsg('Enter a group name.');

            if (!trySpendMana(COST.CREATE_GROUP)) return setMsg('Could not deduct MANA.');
            try {
              const roomId = await createGroup({ name: name.trim() });
              setMsg(`Group created: ${roomId}. (Invites & private join coming next)`);
              setName('');
            } catch {
              setMsg('Failed to create group.');
            }
          };

          return (
            <SwipeRoutes order={ORDER}>
              <AppStage>
                <TabDots
                  tabs={[
                    { href: ORDER[0], aria: 'Contacts' },
                    { href: ORDER[1], aria: 'Messages' },
                    { href: ORDER[2], aria: 'Groups' },
                  ]}
                />
                <PanelShell title="Text — Groups" flush className="flex-1">
                  <div className="space-y-3">
                    <p className="text-sm text-zinc-300">
                      Creating a group costs <b>{COST.CREATE_GROUP}</b> MANA. Small, meaningful circles.
                    </p>

                    {!acc.trusted ? (
                      <CTAActivate />
                    ) : (
                      <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-3">
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Group name"
                          className="w-full rounded-md border border-white/10 bg-black/20 p-2 text-sm outline-none focus:border-amber-300/50"
                        />
                        <button
                          onClick={onCreate}
                          className="rounded-md border border-amber-300/40 px-3 py-1.5 text-xs text-amber-300 hover:bg-amber-300/10"
                        >
                          Create Group (−{COST.CREATE_GROUP} MANA)
                        </button>
                        {msg && <div className="text-xs text-amber-300">{msg}</div>}
                      </div>
                    )}

                    {loading && <div className="text-sm text-zinc-400">Loading groups…</div>}
                    <ul className="space-y-2">
                      {rooms.map((r) => (
                        <li key={r.room_id} className="rounded-lg border border-white/10 bg-black/40 p-3">
                          <div className="text-sm font-medium">{r.name || r.canonical_alias || r.room_id}</div>
                          <div className="text-xs text-zinc-400">{r.num_joined_members ?? 0} members</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </PanelShell>
              </AppStage>
            </SwipeRoutes>
          );
        }
    """),

    "apps/web/src/app/(app)/vitae/grade/page.tsx": textwrap.dedent("""\
        'use client';

        import TabDots from '@/components/ui/TabDots';
        import SwipeRoutes from '@/components/ui/SwipeRoutes';
        import AppStage from '@/components/ui/AppStage';
        import PanelShell from '@/components/ui/PanelShell';

        const ORDER = ['/vitae/grade', '/vitae/path', '/vitae/mastery'] as const;

        export default function VitaeGradePage() {
          return (
            <SwipeRoutes order={ORDER}>
              <AppStage>
                <TabDots
                  tabs={[
                    { href: ORDER[0], aria: 'Grade' },
                    { href: ORDER[1], aria: 'Path' },
                    { href: ORDER[2], aria: 'Mastery' },
                  ]}
                />
                <PanelShell title="Vitae — Grade" flush className="flex-1">
                  <p className="text-sm text-zinc-300">
                    Grade 1: The Guardian — core practices preview.
                  </p>
                </PanelShell>
              </AppStage>
            </SwipeRoutes>
          );
        }
    """),

    "apps/web/src/app/(app)/vitae/path/page.tsx": textwrap.dedent("""\
        'use client';

        import TabDots from '@/components/ui/TabDots';
        import SwipeRoutes from '@/components/ui/SwipeRoutes';
        import AppStage from '@/components/ui/AppStage';
        import PanelShell from '@/components/ui/PanelShell';

        const ORDER = ['/vitae/grade', '/vitae/path', '/vitae/mastery'] as const;

        export default function VitaePathPage() {
          return (
            <SwipeRoutes order={ORDER}>
              <AppStage>
                <TabDots
                  tabs={[
                    { href: ORDER[0], aria: 'Grade' },
                    { href: ORDER[1], aria: 'Path' },
                    { href: ORDER[2], aria: 'Mastery' },
                  ]}
                />
                <PanelShell title="Vitae — Path" flush className="flex-1">
                  <p className="text-sm text-zinc-300">
                    Choose a specialization path (guest: browse only).
                  </p>
                </PanelShell>
              </AppStage>
            </SwipeRoutes>
          );
        }
    """),

    "apps/web/src/app/(app)/vitae/mastery/page.tsx": textwrap.dedent("""\
        'use client';

        import TabDots from '@/components/ui/TabDots';
        import SwipeRoutes from '@/components/ui/SwipeRoutes';
        import AppStage from '@/components/ui/AppStage';
        import PanelShell from '@/components/ui/PanelShell';
        import { LockHint } from '@/components/shared/LockHint';

        const ORDER = ['/vitae/grade', '/vitae/path', '/vitae/mastery'] as const;

        export default function VitaeMasteryPage() {
          return (
            <SwipeRoutes order={ORDER}>
              <AppStage>
                <TabDots
                  tabs={[
                    { href: ORDER[0], aria: 'Grade' },
                    { href: ORDER[1], aria: 'Path' },
                    { href: ORDER[2], aria: 'Mastery' },
                  ]}
                />
                <PanelShell
                  title={
                    <div className="flex items-center gap-3">
                      <h1 className="text-lg font-semibold">Vitae — Mastery</h1>
                      <LockHint label="ACC to track progress & MANA" />
                    </div>
                  }
                  flush
                  className="flex-1"
                >
                  <p className="text-sm text-zinc-300">Mastery ledger (guest preview).</p>
                </PanelShell>
              </AppStage>
            </SwipeRoutes>
          );
        }
    """),
}


def backup(path: Path):
    if not path.exists():
        return None
    backup_path = path.with_suffix(path.suffix + ".pre-global-shell-parity.bak")
    shutil.copy2(path, backup_path)
    return backup_path


def main() -> int:
    for path_str, content in FILES.items():
        path = Path(path_str)
        path.parent.mkdir(parents=True, exist_ok=True)
        bak = backup(path)
        path.write_text(content, encoding="utf-8")
        print(f"patched: {path}")
        if bak:
            print(f"backup:  {bak}")

    print()
    print("what this pass changes:")
    print("  - moves Nexus onto AppStage + PanelShell")
    print("  - moves Text onto AppStage + PanelShell")
    print("  - moves Vitae onto AppStage + PanelShell")
    print("  - keeps global bottom five-tab navigation as-is")
    print("  - does not redesign local module tabs yet")
    print()
    print("next:")
    print("  pnpm -C apps/web typecheck")
    print("  pnpm -C apps/web build")
    print("  bash scripts/repo-index.sh")
    print("  bash scripts/verify-sync.sh")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
