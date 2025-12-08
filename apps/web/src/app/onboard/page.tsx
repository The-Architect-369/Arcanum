"use client";
import React, { useState } from "react";
import { suggestChainToKeplr, getKeplrSigner } from "@/lib/cosmos/wallets";
import { broadcastTx } from "@/lib/cosmos/tx";
// import { MsgMint } from "@/lib/cosmos/arcanum-types/chaincode/v1/tx";

const CHAIN = {
  chainId: process.env.NEXT_PUBLIC_ARC_CHAIN_ID!,
  chainName: "Arcanum-D (local)",
  rpc: process.env.NEXT_PUBLIC_ARC_RPC!,
  rest: process.env.NEXT_PUBLIC_ARC_REST!,
  bech32: process.env.NEXT_PUBLIC_ARC_BECH32_PREFIX!,
  denom: process.env.NEXT_PUBLIC_ARC_DENOM!, decimals: 6
};

export default function Onboard() {
  const [addr, setAddr] = useState<string>(""); const [status, setStatus] = useState<string>("");

  const connect = async () => {
    await suggestChainToKeplr(CHAIN as any);
    const signer = await getKeplrSigner(CHAIN.chainId);
    const accounts = await signer.getAccounts();
    setAddr(accounts[0].address);
  };

  const mintChainCode = async () => {
    setStatus("Minting…");
    const signer = await getKeplrSigner(CHAIN.chainId);
    const accounts = await signer.getAccounts();
    const sender = accounts[0].address;

    // const msg: MsgMint = { owner: sender, tokenId: "<tokenId>", metadataCid: "<cid>" };
    // const typeUrl = "/arcanum.chaincode.v1.MsgMint";
    // const encoded = { typeUrl, value: msg };

    // TEMP placeholder until proto types are generated:
    const encoded = { typeUrl: "/arcanum.chaincode.v1.MsgMint", value: { owner: sender, tokenId: "sbt:"+Date.now(), metadataCid: "bafy..." } };

    await broadcastTx({
      rpc: CHAIN.rpc, signer, sender,
      msgs: [encoded],
      fee: { amount: "2000", denom: CHAIN.denom, gas: "200000" }
    });
    setStatus("ChainCode minted ✔");
  };

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Activate your Arcanum Identity</h1>
      <button onClick={connect} className="px-4 py-2 rounded bg-black text-white">Connect Keplr</button>
      {addr && <p className="text-sm break-all">Address: {addr}</p>}
      <button onClick={mintChainCode} disabled={!addr} className="px-4 py-2 rounded bg-zinc-800 text-white disabled:opacity-40">
        Mint ChainCode (SBT)
      </button>
      {status && <p>{status}</p>}
    </main>
  );
}
