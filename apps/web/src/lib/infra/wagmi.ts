import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";

// Temporary build-safe config:
// - avoids connector barrel imports that drag MetaMask/WalletConnect internals into build
// - keeps passkey/burner flows usable while injected wallets are reintroduced later
const rpcUrl =
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ?? sepolia.rpcUrls.default.http[0];

export const config = createConfig({
  chains: [sepolia],
  connectors: [],
  transports: {
    [sepolia.id]: http(rpcUrl),
  },
  ssr: true,
});
