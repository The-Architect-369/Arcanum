import { getBalance } from "@/lib/cosmos/queries";
const denom = process.env.NEXT_PUBLIC_ARC_DENOM!;

export async function hasMana(rpc:string, address:string, needed:number) {
  const bal = await getBalance({ rpc, address, denom });
  return Number(bal.amount) >= needed;
}
