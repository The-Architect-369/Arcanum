'use client';

import { createHelia, Helia } from 'helia';
import { strings } from '@helia/strings';
import { unixfs } from '@helia/unixfs';
import { createLibp2p } from 'libp2p';
import { webSockets } from '@libp2p/websockets';
import { webRTC } from '@libp2p/webrtc';
import { webTransport } from '@libp2p/webtransport';
import { bootstrap } from '@libp2p/bootstrap';
import { mplex } from '@libp2p/mplex';
import { noise } from '@chainsafe/libp2p-noise';

let heliaPromise: Promise<Helia> | null = null;

export async function getHelia(): Promise<Helia> {
  if (heliaPromise) return heliaPromise;

  heliaPromise = (async () => {
    const list = (process.env.NEXT_PUBLIC_LIBP2P_BOOTSTRAPS || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const libp2p = await createLibp2p({
      transports: [webSockets(), webRTC(), webTransport()],
      streamMuxers: [mplex()],
      connectionEncryption: [noise()],
      peerDiscovery: list.length ? [bootstrap({ list })] : [],
    });

    return await createHelia({ libp2p });
  })();

  return heliaPromise;
}

export async function getStringApi() {
  const h = await getHelia();
  return strings(h);
}
export async function getFsApi() {
  const h = await getHelia();
  return unixfs(h);
}

export async function getPeerId(): Promise<string> {
  const h = await getHelia();
  return h.libp2p.peerId.toString();
}
