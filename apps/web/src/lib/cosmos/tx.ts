// src/lib/cosmos/tx.ts

import { SigningStargateClient } from '@cosmjs/stargate'
import type { OfflineSigner } from '@cosmjs/proto-signing'

export async function getSigningClient(
  rpc: string,
  signer: OfflineSigner
) {
  const client = await SigningStargateClient.connectWithSigner(rpc, signer)
  return { client }
}