export const TEST_ACC_ABI = [
  { "type":"function","name":"mint","stateMutability":"nonpayable","inputs":[],"outputs":[{"name":"id","type":"uint256"}] },
  { "type":"function","name":"hasACC","stateMutability":"view","inputs":[{"name":"user","type":"address"}],"outputs":[{"type":"bool"}] },
  { "type":"function","name":"accId","stateMutability":"view","inputs":[{"name":"user","type":"address"}],"outputs":[{"type":"uint256"}] },
  { "type":"function","name":"owner","stateMutability":"view","inputs":[],"outputs":[{"type":"address"}] },
  { "type":"function","name":"revoke","stateMutability":"nonpayable","inputs":[{"name":"user","type":"address"}],"outputs":[] }
] as const;

export const TEST_ACC_ADDRESS =
  (process.env.NEXT_PUBLIC_TEST_ACC_ADDRESS as `0x${string}` | undefined);
export const TEST_ACC_ABI = [ /* unchanged ABI */ ] as const;

export const TEST_ACC_ADDRESS_LOCAL =
  process.env.NEXT_PUBLIC_TEST_ACC_ADDRESS_LOCAL as `0x${string}` | undefined;

export const TEST_ACC_ADDRESS_SEPOLIA =
  process.env.NEXT_PUBLIC_TEST_ACC_ADDRESS_SEPOLIA as `0x${string}` | undefined;

export function getTestAccAddress(chainId?: number) {
  // 11155111 = Sepolia
  return chainId === 11155111 ? TEST_ACC_ADDRESS_SEPOLIA! : TEST_ACC_ADDRESS_LOCAL!;
}

// Fill these with your real addresses to enable previews & actions.
export const ENTRY_POINT = '0x0000000000000000000000000000000000000000' as const; // TODO
export const SIMPLE_ACCOUNT_FACTORY = '' as `0x${string}`; // paste to use SimpleAccountPreview
export const ACC_ADDRESS = '' as `0x${string}`;

// ACC_ABI left blank for now; wire once contract is ready.
export const ACC_ABI = [] as const;