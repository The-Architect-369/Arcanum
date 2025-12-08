import { getSigningClient } from "./client";
import { DeliverTxResponse } from "@cosmjs/stargate";

export async function broadcastTx({
  rpc, signer, sender, msgs, fee
}: { rpc:string, signer:any, sender:string, msgs:any[], fee:{amount:string; denom:string; gas:string} }): Promise<DeliverTxResponse> {
  const client = await getSigningClient(rpc, signer, `${fee.amount}${fee.denom}`);
  const res = await client.signAndBroadcast(sender, msgs, { amount:[{ amount: fee.amount, denom: fee.denom }], gas: fee.gas });
  if (res.code !== 0) throw new Error(`Tx failed: ${res.rawLog}`);
  return res;
}
