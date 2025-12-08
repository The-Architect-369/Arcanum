export type ChainInfo = {
  chainId: string; chainName: string;
  rpc: string; rest: string; bech32: string; denom: string; decimals: number;
};

export async function suggestChainToKeplr(c: ChainInfo) {
  // Minimal suggest; extend as needed
  await (window as any).keplr.experimentalSuggestChain({
    chainId: c.chainId, chainName: c.chainName, rpc: c.rpc, rest: c.rest,
    stakeCurrency: { coinMinimalDenom: c.denom, coinDenom: c.denom.toUpperCase(), coinDecimals: c.decimals },
    bech32Config: { bech32PrefixAccAddr: c.bech32, bech32PrefixAccPub: c.bech32+"pub",
      bech32PrefixValAddr: c.bech32+"valoper", bech32PrefixValPub: c.bech32+"valoperpub",
      bech32PrefixConsAddr: c.bech32+"valcons", bech32PrefixConsPub: c.bech32+"valconspub" },
    currencies: [{ coinMinimalDenom: c.denom, coinDenom: c.denom.toUpperCase(), coinDecimals: c.decimals }],
    feeCurrencies: [{ coinMinimalDenom: c.denom, coinDenom: c.denom.toUpperCase(), coinDecimals: c.decimals }],
    features: ["stargate","no-legacy-stdTx"]
  });
}

export async function getKeplrSigner(chainId: string) {
  const keplr = (window as any).keplr;
  if (!keplr) throw new Error("Keplr not found");
  await keplr.enable(chainId);
  return keplr.getOfflineSignerAuto(chainId);
}
