import { createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { http } from 'viem'

const RPC = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL!

export const config = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: { [sepolia.id]: http(RPC) },
  ssr: true,
})