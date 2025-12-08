import { SigningStargateClient, StargateClient, GasPrice } from "@cosmjs/stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

export async function getQueryClient(rpc: string) {
  return await StargateClient.connect(rpc);
}

export async function getSigningClient(rpc: string, offlineSigner: any, gasPrice: string) {
  return await SigningStargateClient.connectWithSigner(rpc, offlineSigner, { gasPrice: GasPrice.fromString(gasPrice) });
}
