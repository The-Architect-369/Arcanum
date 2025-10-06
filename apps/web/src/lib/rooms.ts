'use client';

import { getMatrixClient } from './matrix';

export const ROOM_ALIAS = {
  ARCANUM_SPACE: process.env.NEXT_PUBLIC_ARCANUM_SPACE_ALIAS || '#arcanum:matrix.org',
  ARCHITECT_FEED: process.env.NEXT_PUBLIC_ARCHITECT_FEED_ALIAS || '#architect:matrix.org',
  THE_CURRENT: process.env.NEXT_PUBLIC_THE_CURRENT_ALIAS || '#thecurrent:matrix.org',
};

const cache = new Map<string, string>(); // alias -> roomId

export async function resolveRoomId(aliasOrId: string): Promise<string> {
  if (!aliasOrId) throw new Error('Missing aliasOrId');
  if (aliasOrId.startsWith('!')) return aliasOrId;
  if (cache.has(aliasOrId)) return cache.get(aliasOrId)!;

  const c = await getMatrixClient();
  // @ts-ignore runtime method
  const res = await c.getRoomIdForAlias(aliasOrId);
  const roomId = res?.room_id as string;
  if (!roomId) throw new Error(`Cannot resolve alias: ${aliasOrId}`);
  cache.set(aliasOrId, roomId);
  return roomId;
}
