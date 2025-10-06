#!/usr/bin/env tsx
import 'dotenv/config';

type Sdk = typeof import('matrix-js-sdk');

async function main() {
  const homeserver = process.env.MATRIX_HOMESERVER!;
  const userId     = process.env.MATRIX_ADMIN_USER_ID!;
  const token      = process.env.MATRIX_ADMIN_ACCESS_TOKEN!;
  const SPACE_ALIAS = process.env.ARCANUM_SPACE_ALIAS || '#arcanum:matrix.org';
  const FEED_ALIAS  = process.env.ARCHITECT_FEED_ALIAS || '#architect:matrix.org';
  const CUR_ALIAS   = process.env.THE_CURRENT_ALIAS   || '#thecurrent:matrix.org';

  if (!homeserver || !userId || !token) {
    throw new Error('Missing MATRIX_* env. Put them in apps/web/.env.seed');
  }

  const sdk: Sdk = await import('matrix-js-sdk');
  const client = sdk.createClient({ baseUrl: homeserver, accessToken: token, userId });

  async function ensureAlias(alias: string, asSpace = false, worldReadable = false) {
    const local = alias.slice(1).split(':')[0];
    try {
      // @ts-ignore
      const { room_id } = await client.getRoomIdForAlias(alias);
      console.log('Exists:', alias, room_id);
      return room_id as string;
    } catch {
      console.log('Creating:', alias);
      const res = await client.createRoom({
        room_alias_name: local,
        name: local,
        preset: 'public_chat',
        visibility: 'public',
        creation_content: asSpace ? { type: 'm.space' } : undefined,
        initial_state: worldReadable ? [
          { type: 'm.room.history_visibility', state_key: '', content: { history_visibility: 'world_readable' } },
          { type: 'm.room.join_rules', state_key: '', content: { join_rule: 'public' } }
        ] : []
      });
      return res.room_id as string;
    }
  }

  async function link(spaceId: string, childId: string) {
    try {
      const via = userId.split(':')[1];
      await client.sendStateEvent(spaceId, 'm.space.child', { via: [via] }, childId);
      console.log('Linked child → space:', childId);
    } catch (e) {
      console.warn('Link failed (maybe already linked):', childId);
    }
  }

  const spaceId = await ensureAlias(SPACE_ALIAS, true, false);
  const feedId  = await ensureAlias(FEED_ALIAS,  false, true);
  const curId   = await ensureAlias(CUR_ALIAS,   false, true);

  await link(spaceId, feedId);
  await link(spaceId, curId);

  // Drop a welcome message into #thecurrent so UI shows something
  try {
    await client.sendEvent(curId, 'm.room.message', {
      msgtype: 'm.text',
      body: '👋 Welcome to The Current — seeded by Room Seeder.',
    }, '');
    console.log('Sent welcome message to', CUR_ALIAS);
  } catch (e) {
    console.warn('Could not send welcome message:', e);
  }

  console.log('\nSeed complete:');
  console.log('Space  ', spaceId, SPACE_ALIAS);
  console.log('Feed   ', feedId,  FEED_ALIAS);
  console.log('Current', curId,   CUR_ALIAS);
}

main().catch((e) => { console.error(e); process.exit(1); });
