'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { hasBurner, loadBurner, createBurner, forgetBurner } from '@/lib/identity/burner';
import { getPasskey, registerPasskey, signInPasskey, clearPasskey } from '@/lib/identity/passkey';

function short(a?: string) {
  return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '';
}

export default function ConnectWallet() {
  const { address: wagmiAddress } = useAccount()
  const [localAddress, setLocalAddress] = useState<string | undefined>()
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  const injected =
    connectors.find((c) => (c as any).type === 'injected') ??
    connectors.find((c) => c.id === 'injected') ??
    connectors[0];

  // reflect burner/passkey in UI
  const [burnerAddr, setBurnerAddr] = useState<string | undefined>();
  const [pk, setPk] = useState<unknown | null>(getPasskey() as unknown);

  useEffect(() => {
    const sync = () => {
      try { setPk(getPasskey() as unknown); } catch {}
      try { setBurnerAddr(hasBurner() ? loadBurner().address : undefined); } catch {}
    };
    sync();
    const iv = setInterval(sync, 1500);
    window.addEventListener('focus', sync);
    return () => {
      clearInterval(iv);
      window.removeEventListener('focus', sync);
    };
  }, []);

  const active = address ?? burnerAddr;
  const label = useMemo(() => (active ? short(active) : 'Connect Wallet'), [active]);

  async function usePasskey() {
    try {
      const existing = getPasskey();
      const rec = existing ? await signInPasskey() : await registerPasskey();
      setPk(rec as any);
      if (!hasBurner()) {
        createBurner(); // bind a local burner for dev
      }
      setBurnerAddr(loadBurner().address);
    } catch (e) {
      console.error(e);
      alert('Passkey failed (is WebAuthn available?).');
    }
  }

  function useBurner() {
    try {
      if (!hasBurner()) createBurner();
      setBurnerAddr(loadBurner().address);
    } catch (e) {
      console.error(e);
      alert('Burner failed to load/create.');
    }
  }

  function forgetAll() {
    try { clearPasskey(); } catch {}
    try { forgetBurner(); } catch {}
    try { disconnect(); } catch {}
    setPk(null);
    setBurnerAddr(undefined);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => injected && connect({ connector: injected })}
        className="rounded-2xl px-3 py-1.5 text-sm bg-white text-black dark:bg-white/10 dark:text-white hover:opacity-90"
        disabled={isConnecting || !injected}
      >
        {label}
      </button>

      <button
        onClick={usePasskey}
        className="rounded-2xl px-3 py-1.5 text-sm bg-white/10 hover:opacity-90"
        title="Create / Sign in with a passkey, bind a burner for dev"
      >
        Use Passkey
      </button>

      <button
        onClick={useBurner}
        className="rounded-2xl px-3 py-1.5 text-sm bg-white/10 hover:opacity-90"
        title="Create/Load a local dev wallet"
      >
        Use Burner
      </button>

      {(address || burnerAddr || pk) && (
        <button
          onClick={forgetAll}
          className="rounded-2xl px-3 py-1.5 text-sm bg-white/10 hover:opacity-90"
          title="Clear passkey session, burner, and disconnect"
        >
          Forget
        </button>
      )}
    </div>
  );
}
