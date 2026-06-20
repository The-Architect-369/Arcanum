'use client';

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import AppStage from '@/components/ui/AppStage';
import ModuleMatrixShell from '@/components/ui/ModuleMatrixShell';
import CTAActivate from '@/components/shared/CTAActivate';
import FreeBadge from '@/components/shared/FreeBadge';
import { LockHint } from '@/components/shared/LockHint';
import { cn } from '@/lib/cn';
import { fetchPublicTimeline, listPublicRooms, createChannel, sendArcanumPost } from '@/lib/matrix';
import type { ArcanumPostV1 } from '@/lib/post';
import { resolveRoomId, ROOM_ALIAS } from '@/lib/rooms';
import { getJSONHelia, getBlobHelia, putFileHelia, putJSONHelia } from '@/lib/infra/ipfs';
import { getNexusState, recordNexusProposal, createNexusContext, type NexusState } from '@/lib/nexus/context';
import { captureTempusContext } from '@/lib/tempus/context';
import { COST, canCreateChan, canPost } from '@/lib/gates';
import { trySpendMana } from '@/lib/economy';
import { useAccount } from '@/state/useAccount';

export type NexusFamilyId = 'current' | 'post' | 'channel';
type CardId = string;
type FamilyMotion = 'idle' | 'next' | 'prev';
type MediaView = { url: string; mime: string; name?: string };

type Row = {
  author?: string;
  body?: string;
  when?: number;
  media?: Array<{ cid: string; name?: string; mime?: string; size?: number }>;
};

type MediaItem = {
  file: File;
  cid?: string;
  mime: string;
  name: string;
  size: number;
  status: 'pending' | 'done' | 'error';
};

type CardConfig = {
  id: CardId;
  title: string;
  caption: string;
  navLabel: string;
  render: () => React.ReactNode;
};

type FamilyConfig = {
  href: string;
  label: string;
  shellAction: React.ReactNode;
  cards: CardConfig[];
};

const ORDER = ['/nexus/current', '/nexus/post', '/nexus/channel'] as const;
const FAMILY_BY_HREF: Record<(typeof ORDER)[number], NexusFamilyId> = {
  '/nexus/current': 'current',
  '/nexus/post': 'post',
  '/nexus/channel': 'channel',
};
const FAMILY_INDEX: Record<NexusFamilyId, number> = { current: 0, post: 1, channel: 2 };
const CURRENT_ALIAS = ROOM_ALIAS.THE_CURRENT;
const EMPTY_NEXUS: NexusState = { proposals: [], updatedAt: null };

function familyFromPathname(pathname: string): NexusFamilyId | null {
  const clean = pathname.split('?')[0]?.split('#')[0] || '';
  if (clean in FAMILY_BY_HREF) return FAMILY_BY_HREF[clean as keyof typeof FAMILY_BY_HREF];
  return null;
}

function motionForFamilyChange(from: NexusFamilyId, to: NexusFamilyId): FamilyMotion {
  if (from === to) return 'idle';
  return FAMILY_INDEX[to] > FAMILY_INDEX[from] ? 'next' : 'prev';
}

function subtitleFromCardTitle(title: string) {
  return title.replace(/^Nexus\s*-\s*/i, '');
}

export function NexusModuleScreen({ family }: { family: NexusFamilyId }) {
  const acc = useAccount() as any;
  const peerId = typeof acc?.peerId === 'string' ? acc.peerId : undefined;
  const [activeFamilyId, setActiveFamilyId] = useState<NexusFamilyId>(family);
  const [activeCardId, setActiveCardId] = useState<CardId>('a1');
  const [familyMotion, setFamilyMotion] = useState<FamilyMotion>('idle');
  const [familyMotionKey, setFamilyMotionKey] = useState(0);
  const [rows, setRows] = useState<Row[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [previews, setPreviews] = useState<Record<string, MediaView>>({});
  const [nexusState, setNexusState] = useState<NexusState>(EMPTY_NEXUS);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [target, setTarget] = useState<string>(ROOM_ALIAS.ARCHITECT_FEED);
  const [roomId, setRoomId] = useState<string>('');
  const [body, setBody] = useState('');
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalKind, setProposalKind] = useState<'event' | 'ritual' | 'post' | 'channel'>('event');
  const [includeTempusContext, setIncludeTempusContext] = useState(true);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [channelPrice, setChannelPrice] = useState<number>(0);

  const nexusContext = useMemo(
    () => createNexusContext({ identityId: acc.identityId, activeChannelId: roomId || target, visibility: 'private_draft', source: 'local_draft' }),
    [acc.identityId, roomId, target]
  );

  async function loadNexusState() {
    const next = await getNexusState();
    setNexusState(next);
  }

  async function loadCurrent() {
    setLoadingFeed(true);
    try {
      const [room, localNexusState] = await Promise.all([resolveRoomId(CURRENT_ALIAS), getNexusState()]);
      const events = await fetchPublicTimeline(room, 50);
      const out: Row[] = [];
      for (const ev of events) {
        const t = ev?.event?.type;
        if (t === 'com.arcanum.post') {
          const cid = ev?.event?.content?.cid as string | undefined;
          if (!cid) continue;
          const post = await getJSONHelia<ArcanumPostV1>(cid);
          out.push({ author: post?.author?.handle || post?.author?.acc || ev?.sender?.userId, body: post?.body, when: post ? Date.parse(post.createdAt) : ev?.event?.origin_server_ts, media: post?.media });
        } else if (t === 'm.room.message') {
          out.push({ author: ev?.sender?.userId, body: ev?.event?.content?.body, when: ev?.event?.origin_server_ts });
        }
      }
      setRows(out);
      setNexusState(localNexusState);
    } catch {
      setRows([]);
      await loadNexusState();
    } finally {
      setLoadingFeed(false);
    }
  }

  async function loadRooms() {
    setLoadingRooms(true);
    try {
      const list = await listPublicRooms();
      setRooms(list);
    } finally {
      setLoadingRooms(false);
    }
  }

  useEffect(() => { void loadCurrent(); void loadRooms(); }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const id = await resolveRoomId(target);
        if (alive) setRoomId(id);
      } catch {
        if (alive) setRoomId('');
      }
    })();
    return () => { alive = false; };
  }, [target]);

  useEffect(() => {
    let closed = false;
    const objectUrls: string[] = [];
    const fetchMediaPreviews = async () => {
      const next: Record<string, MediaView> = {};
      for (const r of rows) {
        for (const m of r.media || []) {
          if (!m.cid || !m.mime) continue;
          const isPreviewable = /^image\/|^video\/|^audio\//i.test(m.mime);
          if (!isPreviewable) continue;
          const blob = await getBlobHelia(m.cid);
          if (!blob) continue;
          const url = URL.createObjectURL(blob);
          objectUrls.push(url);
          next[m.cid] = { url, mime: m.mime, name: m.name };
        }
      }
      if (!closed) setPreviews(next);
    };
    void fetchMediaPreviews();
    return () => { closed = true; objectUrls.forEach((url) => URL.revokeObjectURL(url)); };
  }, [rows]);

  useEffect(() => {
    const timer = window.setTimeout(() => setFamilyMotion('idle'), 190);
    return () => window.clearTimeout(timer);
  }, [familyMotionKey]);

  const onPickFiles = (files: FileList | null) => {
    if (!files || !files.length) return;
    const next: MediaItem[] = Array.from(files).map((f) => ({ file: f, mime: f.type || 'application/octet-stream', name: f.name, size: f.size, status: 'pending' }));
    setMedia((m) => [...m, ...next]);
  };

  const uploadPendingMedia = async (): Promise<ArcanumPostV1['media']> => {
    const results: ArcanumPostV1['media'] = [];
    const copy = [...media];
    for (let i = 0; i < copy.length; i += 1) {
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

  const onSaveProposalDraft = async () => {
    setMessage(null);
    if (!acc?.trusted) return setMessage('Activate your ACC to save a Nexus proposal draft.');
    if (!body.trim()) return setMessage('Write a proposal summary first.');
    setBusy(true);
    try {
      const result = await recordNexusProposal({ kind: proposalKind, title: proposalTitle.trim() || body.trim().slice(0, 72), summary: body.trim(), proposedBy: acc.accId || acc.identityId || null, activeChannelId: roomId || target, visibility: 'private_draft', tempusContext: includeTempusContext ? captureTempusContext(new Date(), { depth: 'seasonal' }) : undefined, executionAuthority: 'human_review' });
      if (!result.ok) { setMessage(result.message); return; }
      setProposalTitle('');
      setBody('');
      setMessage('Nexus proposal draft recorded locally. It has not been published, scheduled, or ratified.');
      await loadNexusState();
    } catch (e: any) {
      setMessage(e?.message || 'Failed to record Nexus proposal draft.');
    } finally {
      setBusy(false);
    }
  };

  const onPublish = async () => {
    setMessage(null);
    if (!acc?.trusted) return setMessage('Activate your ACC to publish.');
    if (!canPost({ trusted: !!acc.trusted, mana: Number(acc.mana ?? 0) })) return setMessage(`Need ${COST.POST} MANA to post.`);
    if (!roomId) return setMessage('Cannot resolve target room. Check alias/ID.');
    if (!body.trim() && media.length === 0) return setMessage('Write something or attach media.');
    setBusy(true);
    try {
      const attachments = await uploadPendingMedia();
      const post: ArcanumPostV1 = { v: 1, author: { acc: acc.accId || 'acc:unknown', handle: acc.handle, peerId }, room: { id: roomId }, createdAt: new Date().toISOString(), body: body.trim(), media: attachments && attachments.length ? attachments : undefined };
      const { cid } = await putJSONHelia(post);
      if (!trySpendMana(COST.POST)) throw new Error('Could not deduct MANA.');
      await sendArcanumPost(roomId, cid, post.body.slice(0, 120));
      setBody('');
      setMedia([]);
      setMessage(`Posted! CID: ${cid}`);
      await loadCurrent();
    } catch (e: any) {
      setMessage(e?.message || 'Failed to publish.');
    } finally {
      setBusy(false);
    }
  };

  const onCreateChannel = async () => {
    setMessage(null);
    if (!acc.trusted) return setMessage('Activate your ACC to create a channel.');
    if (!canCreateChan({ trusted: acc.trusted, mana: acc.mana })) return setMessage(`Need ${COST.CREATE_CHANNEL} MANA to create.`);
    if (!channelName.trim()) return setMessage('Enter a channel name.');
    if (!trySpendMana(COST.CREATE_CHANNEL)) return setMessage('Could not deduct MANA.');
    try {
      const createdRoomId = await createChannel({ name: channelName.trim(), joinCost: Number(channelPrice) || 0 });
      setMessage(`Channel created: ${createdRoomId}. Upkeep is ${COST.MAINTAIN_CHANNEL} MANA/month (scheduled later).`);
      setChannelName('');
      await loadRooms();
    } catch {
      setMessage('Failed to create channel. Check homeserver auth.');
    }
  };

  const families = useMemo<Record<NexusFamilyId, FamilyConfig>>(() => ({
    current: {
      href: ORDER[0],
      label: 'Current',
      shellAction: <div className="text-xs text-zinc-400">A track · feed, drafts, and media reading</div>,
      cards: [
        { id: 'a1', navLabel: 'A1', title: 'Nexus - A1 Feed', caption: 'The feed layer reads the current stream. Arcanum posts load from Helia by CID and render into a shared public timeline.', render: () => <FeedCard rows={rows} loading={loadingFeed} previews={previews} /> },
        { id: 'a2', navLabel: 'A2', title: 'Nexus - A2 Drafts', caption: 'The draft layer surfaces local Nexus proposals. These are advisory drafts only and do not publish, schedule, execute, or ratify anything.', render: () => <DraftsCard nexusState={nexusState} /> },
        { id: 'a3', navLabel: 'A3', title: 'Nexus - A3 Media', caption: 'The media layer emphasizes attachment reading and local Helia-backed previews for image, video, and audio objects.', render: () => <MediaCard rows={rows} previews={previews} /> },
      ],
    },
    post: {
      href: ORDER[1],
      label: 'Post',
      shellAction: <div className="text-xs text-zinc-400">B track · compose, draft, and publish flows</div>,
      cards: [
        { id: 'b1', navLabel: 'B1', title: 'Nexus - B1 Compose', caption: 'Compose is the writing surface. The user chooses a target room, writes the body, and prepares any local media attachments.', render: () => <ComposeCard target={target} setTarget={setTarget} roomId={roomId} body={body} setBody={setBody} media={media} onPickFiles={onPickFiles} /> },
        { id: 'b2', navLabel: 'B2', title: 'Nexus - B2 Draft', caption: 'The draft layer preserves non-executing proposal drafts with optional Tempus context and explicit human review boundaries.', render: () => <PostDraftCard acc={acc} proposalTitle={proposalTitle} setProposalTitle={setProposalTitle} proposalKind={proposalKind} setProposalKind={setProposalKind} includeTempusContext={includeTempusContext} setIncludeTempusContext={setIncludeTempusContext} onSaveProposalDraft={onSaveProposalDraft} busy={busy} body={body} nexusContext={nexusContext} /> },
        { id: 'b3', navLabel: 'B3', title: 'Nexus - B3 Publish', caption: 'Publish sends Helia-backed content into the resolved Matrix room. Posting has a MANA cost and still does not imply governance authority.', render: () => <PublishCard acc={acc} body={body} media={media} busy={busy} message={message} onPublish={onPublish} /> },
      ],
    },
    channel: {
      href: ORDER[2],
      label: 'Channels',
      shellAction: <div className="text-xs text-zinc-400">C track · directory, creation, and access economics</div>,
      cards: [
        { id: 'c1', navLabel: 'C1', title: 'Nexus - C1 Directory', caption: 'The directory layer lists currently visible public rooms and their current membership counts.', render: () => <DirectoryCard rooms={rooms} loading={loadingRooms} /> },
        { id: 'c2', navLabel: 'C2', title: 'Nexus - C2 Create', caption: 'The creation layer allows a trusted user to create a channel with a chosen join cost, while the module applies MANA gates.', render: () => <CreateChannelCard acc={acc} channelName={channelName} setChannelName={setChannelName} channelPrice={channelPrice} setChannelPrice={setChannelPrice} onCreateChannel={onCreateChannel} /> },
        { id: 'c3', navLabel: 'C3', title: 'Nexus - C3 Access', caption: 'The access layer states what channel economics mean: creation cost, upkeep, and the difference between paid access and authority.', render: () => <AccessCard message={message} /> },
      ],
    },
  }), [rows, loadingFeed, previews, nexusState, target, roomId, body, media, proposalTitle, proposalKind, includeTempusContext, busy, acc, nexusContext, rooms, loadingRooms, channelName, channelPrice, message]);

  const activeFamily = families[activeFamilyId];
  const activeCard = activeFamily.cards.find((card) => card.id === activeCardId) ?? activeFamily.cards[0];
  const verticalTabs = activeFamily.cards.map((card) => ({ id: card.id, label: card.navLabel }));
  const titleSubtitle = subtitleFromCardTitle(activeCard.title);

  const transitionToFamily = (nextFamily: NexusFamilyId, syncHistory: boolean) => {
    if (nextFamily === activeFamilyId) return;
    const motion = motionForFamilyChange(activeFamilyId, nextFamily);
    if (syncHistory) window.history.replaceState(window.history.state, '', families[nextFamily].href);
    setFamilyMotion(motion);
    setFamilyMotionKey((value) => value + 1);
    setActiveFamilyId(nextFamily);
  };

  useEffect(() => { transitionToFamily(family, false); }, [family]);
  useEffect(() => { setActiveCardId(activeFamily.cards[0]?.id ?? 'a1'); }, [activeFamilyId]);
  useEffect(() => {
    const onPopState = () => {
      const nextFamily = familyFromPathname(window.location.pathname);
      if (nextFamily) transitionToFamily(nextFamily, false);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [activeFamilyId, families]);

  const onHorizontalChange = (href: string) => {
    const nextFamily = familyFromPathname(href);
    if (nextFamily) transitionToFamily(nextFamily, true);
  };

  const swipeStart = React.useRef<{ x: number; y: number } | null>(null);
  const swipeLock = React.useRef<'h' | 'v' | null>(null);
  const onTouchStartCapture = (e: React.TouchEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest('[data-no-route-swipe="true"]')) return;
    const t = e.touches[0]; swipeStart.current = { x: t.clientX, y: t.clientY }; swipeLock.current = null;
  };
  const onTouchMoveCapture = (e: React.TouchEvent) => {
    if (!swipeStart.current) return;
    const t = e.touches[0]; const dx = t.clientX - swipeStart.current.x; const dy = t.clientY - swipeStart.current.y; const ax = Math.abs(dx); const ay = Math.abs(dy);
    if (!swipeLock.current) { if (ax >= 12 && ax > ay * 1.06) swipeLock.current = 'h'; else if (ay >= 12 && ay > ax) swipeLock.current = 'v'; else return; }
    if (swipeLock.current === 'h') e.preventDefault();
  };
  const onTouchEndCapture = (e: React.TouchEvent) => {
    if (!swipeStart.current) return;
    const t = e.changedTouches[0]; const dx = t.clientX - swipeStart.current.x; const dy = t.clientY - swipeStart.current.y; swipeStart.current = null;
    const ax = Math.abs(dx); const ay = Math.abs(dy); if (ax < 12 || ax <= ay * 1.06) return;
    const currentIndex = ORDER.indexOf(activeFamily.href as (typeof ORDER)[number]); if (currentIndex === -1) return;
    const nextIndex = dx < 0 ? currentIndex + 1 : currentIndex - 1; if (nextIndex < 0 || nextIndex >= ORDER.length) return;
    transitionToFamily(FAMILY_BY_HREF[ORDER[nextIndex]], true);
  };

  return (
    <AppStage>
      <div className="h-full min-h-0" onTouchStartCapture={onTouchStartCapture} onTouchMoveCapture={onTouchMoveCapture} onTouchEndCapture={onTouchEndCapture}>
        <ModuleMatrixShell
          title={<div key={`title-${activeFamilyId}-${familyMotionKey}`} className={cn('tempus-title-shell flex min-w-0 items-baseline gap-3 sm:gap-4', familyMotion === 'next' && 'tempus-title-shell--next', familyMotion === 'prev' && 'tempus-title-shell--prev')}><span className="tempus-title-word truncate">Nexus</span><span className="tempus-title-subtitle truncate">{titleSubtitle}</span><FreeBadge /></div>}
          actions={activeFamily.shellAction}
          horizontalTabs={Object.values(families).map(({ href, label }) => ({ href, label }))}
          activeHorizontalHref={activeFamily.href}
          onHorizontalChange={onHorizontalChange}
          verticalTabs={verticalTabs}
          activeVerticalId={activeCard.id}
          onVerticalChange={(id) => setActiveCardId(id)}
          className="min-h-0 flex-1"
        >
          <div key={`${activeFamilyId}-${familyMotionKey}`} className={cn('tempus-family-panel space-y-4', familyMotion === 'next' && 'tempus-family-panel--next', familyMotion === 'prev' && 'tempus-family-panel--prev')}>
            <p className="text-sm text-zinc-300">{activeCard.caption}</p>
            {activeCard.render()}
          </div>
        </ModuleMatrixShell>
      </div>
    </AppStage>
  );
}

function FeedCard({ rows, loading, previews }: { rows: Row[]; loading: boolean; previews: Record<string, MediaView> }) {
  return <div className="space-y-3">{loading ? <div className="text-sm text-zinc-400">Loading…</div> : rows.length === 0 ? <div className="text-sm text-zinc-400">No messages found.</div> : rows.slice(0, 8).map((r, i) => <article key={i} className="rounded-2xl border border-white/10 bg-black/40 p-4"><div className="text-xs text-zinc-400">{r.author || 'unknown'} {r.when ? `· ${new Date(r.when).toLocaleString()}` : null}</div>{r.body ? <div className="mt-1 break-words whitespace-pre-wrap text-sm">{r.body}</div> : null}{r.media && r.media.length > 0 ? <div className="mt-3 grid gap-2 sm:grid-cols-2">{r.media.map((m, idx) => <div key={idx} className="rounded-xl border border-white/10 bg-black/30 p-2">{renderMedia(m, previews)}<div className="mt-1 truncate text-[11px] text-zinc-500">{m.name || m.cid}</div></div>)}</div> : null}</article>)}</div>;
}

function DraftsCard({ nexusState }: { nexusState: NexusState }) {
  return <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4"><div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Local proposal drafts</div><h3 className="mt-2 text-base font-semibold text-zinc-100">Non-executing draft memory</h3><div className="mt-4 space-y-3">{nexusState.proposals.length === 0 ? <div className="text-sm text-zinc-400">No local Nexus proposal drafts recorded yet.</div> : nexusState.proposals.slice(0, 8).map((proposal) => <article key={proposal.id} className="rounded-2xl border border-white/10 bg-black/30 p-4"><div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400"><span>{proposal.kind}</span><span>•</span><span>{proposal.status}</span><span>•</span><span>{new Date(proposal.createdAt).toLocaleString()}</span><span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase">{proposal.authority}</span></div><div className="mt-2 text-sm font-medium text-zinc-100">{proposal.title}</div><div className="mt-1 whitespace-pre-wrap text-sm text-zinc-300">{proposal.summary}</div>{proposal.tempusContext ? <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-zinc-400"><div className="font-medium text-zinc-300">Tempus context attached</div><div className="mt-1 flex flex-wrap gap-x-3 gap-y-1"><span>{proposal.tempusContext.phase} window</span><span>{proposal.tempusContext.solar.season}</span><span>{proposal.tempusContext.lunar.phase}</span></div><div className="mt-1 text-[11px] text-zinc-500">Draft only; not scheduled, published, executed, or ratified.</div></div> : null}</article>)}</div></div>;
}

function MediaCard({ rows, previews }: { rows: Row[]; previews: Record<string, MediaView> }) {
  const media = rows.flatMap((row) => row.media || []);
  return <div className="rounded-3xl border border-white/10 bg-black/20 p-4"><div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Media surface</div><h3 className="mt-2 text-base font-semibold text-zinc-100">Helia-backed attachments</h3><div className="mt-4 grid gap-3 sm:grid-cols-2">{media.length === 0 ? <div className="text-sm text-zinc-400">No media attachments found in the current slice.</div> : media.slice(0, 8).map((m, idx) => <div key={idx} className="rounded-2xl border border-white/10 bg-black/30 p-3">{renderMedia(m, previews)}<div className="mt-2 truncate text-xs text-zinc-500">{m.name || m.cid}</div></div>)}</div></div>;
}

function ComposeCard({ target, setTarget, roomId, body, setBody, media, onPickFiles }: { target: string; setTarget: (value: string) => void; roomId: string; body: string; setBody: (value: string) => void; media: MediaItem[]; onPickFiles: (files: FileList | null) => void; }) {
  return <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4"><div className="grid gap-2 sm:grid-cols-2"><input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Room alias or ID" className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-amber-300/50" /><div className="flex items-center text-xs text-zinc-400">Resolved roomId:<span className="ml-1 truncate">{roomId || '—'}</span></div></div><textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write something cosmic…" className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-amber-300/50" rows={5} /><div className="space-y-2"><label className="inline-block"><span className="sr-only">Attach files</span><input type="file" multiple onChange={(e) => onPickFiles(e.target.files)} className="block text-xs" accept="image/*,video/*,audio/*,application/pdf" /></label>{media.length > 0 ? <ul className="space-y-1">{media.map((m, i) => <li key={i} className="flex items-center gap-2 text-xs text-zinc-300"><span className="truncate">{m.name}</span><span className="opacity-60">({Math.round(m.size / 1024)} KB)</span><span className={m.status === 'error' ? 'text-red-400' : 'text-zinc-400'}>— {m.status}</span>{m.cid ? <span className="truncate opacity-70">CID: {m.cid}</span> : null}</li>)}</ul> : null}</div></div>;
}

function PostDraftCard({ acc, proposalTitle, setProposalTitle, proposalKind, setProposalKind, includeTempusContext, setIncludeTempusContext, onSaveProposalDraft, busy, body, nexusContext }: any) {
  return !acc?.trusted ? <CTAActivate /> : <div className="space-y-4"><div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4"><div className="grid gap-2 sm:grid-cols-2"><input value={proposalTitle} onChange={(e) => setProposalTitle(e.target.value)} placeholder="Optional proposal title" className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-amber-300/50" /><select value={proposalKind} onChange={(e) => setProposalKind(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-amber-300/50"><option value="event">Event proposal</option><option value="ritual">Ritual proposal</option><option value="post">Post proposal</option><option value="channel">Channel proposal</option></select></div><label className="mt-4 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs text-zinc-400"><input type="checkbox" checked={includeTempusContext} onChange={(event) => setIncludeTempusContext(event.target.checked)} className="mt-1" /><span><span className="block text-sm text-zinc-100">Attach Tempus context to local proposal draft</span><span>Factual timing context only. It does not schedule or authorize the proposal.</span></span></label><div className="mt-4 flex justify-end"><button onClick={onSaveProposalDraft} disabled={busy || !body.trim()} className="rounded-md border border-white/20 px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/10 disabled:opacity-60">{busy ? 'Saving…' : 'Save proposal draft'}</button></div></div><div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300"><div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Draft context</div><div className="mt-2">{nexusContext.version} · {nexusContext.visibility} · {nexusContext.source}</div>{nexusContext.warnings.length > 0 ? <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-zinc-400">{nexusContext.warnings.map((warning: string) => <li key={warning}>{warning}</li>)}</ul> : null}</div></div>;
}

function PublishCard({ acc, body, media, busy, message, onPublish }: any) {
  return <div className="space-y-4">{!acc?.trusted ? <CTAActivate /> : <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4"><div className="flex items-center justify-between gap-3"><div><div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Publish</div><h3 className="mt-2 text-base font-semibold text-zinc-100">Helia + Matrix distribution</h3></div><div className="text-xs text-zinc-400">Cost: {COST.POST} MANA</div></div><div className="mt-4 flex justify-end"><button onClick={onPublish} disabled={busy || (!body.trim() && media.length === 0)} className="rounded-md border border-amber-300/40 px-3 py-1.5 text-xs text-amber-300 hover:bg-amber-300/10 disabled:opacity-60">{busy ? 'Publishing…' : 'Publish'}</button></div>{message ? <div className="mt-3 text-xs text-amber-300">{message}</div> : null}</div>}<div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">Your device publishes to Helia; Matrix shares the CID. Local proposal drafts do not publish, schedule, execute, or ratify anything.</div></div>;
}

function DirectoryCard({ rooms, loading }: { rooms: any[]; loading: boolean }) {
  return <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4"><div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Public rooms</div><h3 className="mt-2 text-base font-semibold text-zinc-100">Channel directory</h3><div className="mt-4 space-y-2">{loading ? <div className="text-sm text-zinc-400">Loading channels…</div> : rooms.map((r) => <div key={r.room_id} className="rounded-2xl border border-white/10 bg-black/30 p-3"><div className="text-sm font-medium">{r.name || r.canonical_alias || r.room_id}</div><div className="text-xs text-zinc-400">{r.num_joined_members ?? 0} members</div></div>)}</div></div>;
}

function CreateChannelCard({ acc, channelName, setChannelName, channelPrice, setChannelPrice, onCreateChannel }: any) {
  return !acc.trusted ? <CTAActivate /> : <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 space-y-3"><input value={channelName} onChange={(e) => setChannelName(e.target.value)} placeholder="Channel name" className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-amber-300/50" /><input value={channelPrice} onChange={(e) => setChannelPrice(Number(e.target.value) || 0)} type="number" min={0} step={1} placeholder="Join price (MANA, optional)" className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-amber-300/50" /><button onClick={onCreateChannel} className="rounded-md border border-amber-300/40 px-3 py-1.5 text-xs text-amber-300 hover:bg-amber-300/10">Create Channel (−{COST.CREATE_CHANNEL} MANA)</button></div>;
}

function AccessCard({ message }: { message: string | null }) {
  return <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"><div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4"><div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Access economics</div><h3 className="mt-2 text-base font-semibold text-zinc-100">Creation and upkeep</h3><div className="mt-4 space-y-3"><PolicyLine text={`Creating costs ${COST.CREATE_CHANNEL} MANA.`} /><PolicyLine text={`Upkeep is ${COST.MAINTAIN_CHANNEL} MANA/month.`} /><PolicyLine text="Channel cost affects access, not governance authority." /></div></div><div className="rounded-3xl border border-white/10 bg-black/20 p-4"><div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Message</div><h3 className="mt-2 text-base font-semibold text-zinc-100">Latest status</h3><div className="mt-4 text-sm text-zinc-300">{message ?? 'No channel action message yet.'}</div></div></div>;
}

function PolicyLine({ text }: { text: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm text-zinc-300">{text}</div>; }

function renderMedia(m: { cid: string; name?: string; mime?: string }, previews: Record<string, MediaView>) {
  const view = m.cid ? previews[m.cid] : undefined;
  if (!view) return <div className="text-[11px] text-zinc-400">Attachment: {m.name || m.cid} {m.mime ? `(${m.mime})` : ''}</div>;
  if (/^image\//i.test(view.mime)) return <img src={view.url} alt={m.name || 'image'} className="max-h-64 w-auto rounded-md border border-white/10" />;
  if (/^video\//i.test(view.mime)) return <video src={view.url} controls className="max-h-64 w-auto rounded-md border border-white/10" />;
  if (/^audio\//i.test(view.mime)) return <audio src={view.url} controls className="w-full" />;
  return <div className="text-[11px] text-zinc-400">Attachment: {m.name || m.cid}</div>;
}
