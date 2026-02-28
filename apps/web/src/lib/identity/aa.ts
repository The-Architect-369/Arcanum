// src/lib/identity/aa.ts

export const CHAIN_ID = 'arcanum'
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL ?? ''
export const BUNDLER_URL = process.env.NEXT_PUBLIC_BUNDLER_URL ?? ''

// Identity layer exposes configuration only.
// No minting. No enforcement. No economic logic.