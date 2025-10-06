'use client';
import { getPasskey } from './passkey';
import { hasBurner, createBurner, loadBurner } from './burner';
import { CHAIN_ID, RPC_URL, BUNDLER_URL } from './chains';

export async function getSAClient(sponsor = true) {
  if (!hasBurner()) { try { createBurner(); } catch {} }
  const burner = hasBurner() ? loadBurner() : undefined;
  return {
    account: burner ? { address: burner.address } : undefined,
    chainId: CHAIN_ID,
    rpcUrl: RPC_URL,
    bundlerUrl: BUNDLER_URL,
    sponsor,
    needsPasskey: !getPasskey(),
  };
}