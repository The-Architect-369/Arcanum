import { defineChain } from 'viem';
import { sepolia } from 'viem/chains';

export const localAnvil = defineChain({
  id: 31337,
  name: 'Anvil (Local)',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545'] },
    public:  { http: [process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545'] },
  },
  testnet: true,
});

export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_4337_CHAIN_ID || 11155111);
export const RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || '';
export const BUNDLER_URL = process.env.NEXT_PUBLIC_BUNDLER_URL || '';