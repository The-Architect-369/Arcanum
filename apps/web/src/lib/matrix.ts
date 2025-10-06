'use client';

let sdkPromise: Promise<typeof import('matrix-js-sdk')> | null = null;
let client: any | null = null;

type MatrixCreds = { baseUrl?: string; accessToken?: string; userId?: string };

async function loadSdk() {
  if (!sdkPromise) sdkPromise = import('matrix-js-sdk');
  return sdkPromise;
}

export async function getMatrixClient(creds?: MatrixCreds) {
  if (client) return client;
  const { createClient } = await loadSdk();
  const baseUrl = creds?.baseUrl || process.env.NEXT_PUBLIC_MATRIX_HOMESERVER || 'https://matrix-client.matrix.org';
  client = createClient({ baseUrl, accessToken: creds?.accessToken, userId: creds?.userId });
  return client;
}

// READ
export async function fetchPublicTimeline(roomId: string, limit = 20) {
  try {
    const c = await getMatrixClient();
    let room = c.getRoom(roomId);
    if (!room) { try { /* @ts-ignore */ await c.peekInRoom(roomId); room = c.getRoom(roomId); } catch {} }
    if (!room) return [];
    // @ts-ignore
    await c.scrollback(room, limit);
    return room.timeline?.slice(-limit) ?? [];
  } catch { return []; }
}

// LIST
export async function listPublicRooms(search?: string, limit = 50) {
  try {
    const c = await getMatrixClient();
    // @ts-ignore
    const res = await c.publicRooms({ limit, filter: search ? { generic_search_term: search } : undefined });
    return res?.chunk ?? [];
  } catch { return []; }
}

// WRITE (Arcanum pointer)
export async function sendArcanumPost(roomId: string, cid: string, summary?: string) {
  const c = await getMatrixClient();
  await c.sendEvent(roomId, 'com.arcanum.post', { cid, t: Date.now(), summary }, '');
  if (summary) {
    const body = `Arcanum post: ${summary}\nCID: ${cid}`;
    c.sendEvent(roomId, 'm.room.message', { msgtype: 'm.notice', body }, '').catch(() => {});
  }
}

// CREATE rooms
export async function createChannel(opts: { name: string; topic?: string; joinCost?: number }) {
  const c = await getMatrixClient();
  const res = await c.createRoom({
    name: opts.name, topic: opts.topic, preset: 'public_chat', visibility: 'public',
    power_level_content_override: { invite: 50, kick: 50, ban: 50, redact: 50 }
  });
  const roomId = res?.room_id as string;
  try {
    await c.sendStateEvent(roomId, 'arcanum.channel.settings', { joinCost: Number(opts.joinCost) || 0 }, '');
  } catch {}
  return roomId;
}

export async function createGroup(opts: { name: string; topic?: string }) {
  const c = await getMatrixClient();
  const res = await c.createRoom({
    name: opts.name, topic: opts.topic, preset: 'private_chat', visibility: 'private',
    invite: [], is_direct: false,
    initial_state: [{ type: 'm.room.join_rules', state_key: '', content: { join_rule: 'invite' } }]
  });
  return res?.room_id as string;
}
