import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'
import { SigningStargateClient, StargateClient } from '@cosmjs/stargate'

const rpcEndpoint = process.env.NEXT_PUBLIC_ARCANUM_RPC || 'http://127.0.0.1:26657'
const chainId = process.env.NEXT_PUBLIC_ARCANUM_CHAIN_ID || 'arcanum-local-1'
const bech32Prefix = process.env.NEXT_PUBLIC_ARCANUM_BECH32_PREFIX || 'arca'

export async function getQueryClient() {
  return await StargateClient.connect(rpcEndpoint)
}

// Dev-only burner wallet helper – later replace with Keplr/Leap.
export async function getSigningClient(mnemonic: string) {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: bech32Prefix })
  const [account] = await wallet.getAccounts()
  const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet)
  return { client, account }
}
