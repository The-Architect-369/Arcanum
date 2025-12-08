export const ARCANUM_RPC = process.env.NEXT_PUBLIC_ARCANUM_RPC ?? "http://localhost:1317";
export async function getBalance(addr: string) {
  const r = await fetch(`${ARCANUM_RPC}/cosmos/bank/v1beta1/balances/${addr}`);
  return r.json();
}
