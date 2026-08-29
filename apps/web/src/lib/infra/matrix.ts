'use client';

type MatrixSdk = typeof import('matrix-js-sdk');
type MatrixClient = ReturnType<MatrixSdk['createClient']>;
type MatrixCreateRoomOptions = Parameters<MatrixClient['createRoom']>[0];

type MatrixWireClient = {
  sendEvent(
    roomId: string,
    eventType: string,
    content: Record<string, unknown>,
    txnId?: string,
  ): Promise<unknown>;
  sendStateEvent(
    roomId: string,
    eventType: string,
    content: Record<string, unknown>,
    stateKey?: string,
  ): Promise<unknown>;
};

let sdkPromise: Promise<MatrixSdk> | null = null;
let client: MatrixClient | null = null;

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
    if (!room) { try { await c.peekInRoom(roomId); room = c.getRoom(roomId); } catch { /* Best-effort peek; missing room is handled below. */ } }
    if (!room) return [];
    await c.scrollback(room, limit);
    return room.timeline?.slice(-limit) ?? [];
  } catch { return []; }
}

// LIST
export async function listPublicRooms(search?: string, limit = 50) {
  try {
    const c = await getMatrixClient();
    const res = await c.publicRooms({ limit, filter: search ? { generic_search_term: search } : undefined });
    return res?.chunk ?? [];
  } catch { return []; }
}

// WRITE (Arcanum pointer)
export async function sendArcanumPost(roomId: string, cid: string, summary?: string) {
  const c = await getMatrixClient();
  await (c as unknown as MatrixWireClient).sendEvent(roomId, 'com.arcanum.post', { cid, t: Date.now(), summary }, '');
  if (summary) {
    const body = `Arcanum post: ${summary}\nCID: ${cid}`;
    (c as unknown as MatrixWireClient).sendEvent(roomId, 'm.room.message', { msgtype: 'm.notice', body }, '').catch(() => {});
  }
}

// CREATE rooms
export async function createChannel(opts: { name: string; topic?: string; joinCost?: number }) {
  const c = await getMatrixClient();
  const res = await c.createRoom({
    name: opts.name, topic: opts.topic,
    preset: 'public_chat' as MatrixCreateRoomOptions['preset'],
    visibility: 'public' as MatrixCreateRoomOptions['visibility'],
    power_level_content_override: { invite: 50, kick: 50, ban: 50, redact: 50 }
  });
  const roomId = res?.room_id as string;
  try {
    await (c as unknown as MatrixWireClient).sendStateEvent(roomId, 'arcanum.channel.settings', { joinCost: Number(opts.joinCost) || 0 }, '');
  } catch { /* Best-effort metadata; room creation remains valid. */ }
  return roomId;
}

export async function createGroup(opts: { name: string; topic?: string }) {
  const c = await getMatrixClient();
  const res = await c.createRoom({
    name: opts.name, topic: opts.topic,
    preset: 'private_chat' as MatrixCreateRoomOptions['preset'],
    visibility: 'private' as MatrixCreateRoomOptions['visibility'],
    invite: [], is_direct: false,
    initial_state: [{ type: 'm.room.join_rules', state_key: '', content: { join_rule: 'invite' } }]
  });
  return res?.room_id as string;
}
