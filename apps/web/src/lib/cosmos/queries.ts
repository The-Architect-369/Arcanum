import { getQueryClient } from "./client";

export async function getBalance({ rpc, address, denom }:{rpc:string; address:string; denom:string}) {
  const c = await getQueryClient(rpc);
  return await c.getBalance(address, denom);
}
