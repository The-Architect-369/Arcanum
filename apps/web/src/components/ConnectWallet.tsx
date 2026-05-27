'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { hasBurner, loadBurner, createBurner, forgetBurner } from '@/lib/identity/burner';
import {
  getPasskey,
  getPasskeySupport,
  registerPasskey,
  signInPasskey,
  clearPasskey,
} from '@/lib/identity/passkey';

function short(a?: string) {
  return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '';
}

export default function ConnectWallet() {
  const { address: wagmiAddress } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  const injected =
    connectors.find((c) => (c as any).type === 'injected') ??
    connectors.find((c) => c.id === 'injected') ??
    connectors[0];

  const [burnerAddr, setBurnerAddr] = useState<string | undefined>();
  const [pk, setPk] = useState<unknown | null>(null);
  const [passkeySupport] = useState(() => getPasskeySupport());

  useEffect(() => {
    let active = true;

    const sync = async () => {
      try {
        const passkey = await getPasskey();
        if (active) setPk(passkey as unknown);
      } catch {
        if (active) setPk(null);
      }

      try {
        const burner = (await hasBurner()) ? await loadBurner() : null;
        if (active) setBurnerAddr(burner ?? undefined);
      } catch {
        if (active) setBurnerAddr(undefined);
      }
    };

    void sync();
    const iv = setInterval(() => {
      void sync();
    }, 1500);
    const onFocus = () => {
      void sync();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      active = false;
      clearInterval(iv);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const active = wagmiAddress ?? burnerAddr;
  const label = useMemo(() => (active ? short(active) : 'Connect Wallet'), [active]);

  async function usePasskey() {
    if (!passkeySupport.supported) {
      alert(`Passkey unavailable: ${passkeySupport.reason}`);
      return;
    }

    try {
      const existing = await getPasskey();
      const rec = existing ? await signInPasskey() : await registerPasskey();
      setPk(rec as unknown);
      if (!(await hasBurner())) {
        await createBurner();
      }
      const burner = await loadBurner();
      setBurnerAddr(burner ?? undefined);
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : 'Passkey failed.');
    }
  }

  async function useBurner() {
    try {
      if (!(await hasBurner())) await createBurner();
      const burner = await loadBurner();
      setBurnerAddr(burner ?? undefined);
    } catch (e) {
      console.error(e);
      alert('Burner failed to load/create.');
    }
  }

  async function forgetAll() {
    try {
      await clearPasskey();
    } catch {}
    try {
      await forgetBurner();
    } catch {}
    try {
      disconnect();
    } catch {}
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
        onClick={() => {
          void usePasskey();
        }}
        className="rounded-2xl px-3 py-1.5 text-sm bg-white/10 hover:opacity-90 disabled:opacity-50"
        title={
          passkeySupport.supported
            ? 'Create / Sign in with a passkey, bind a burner for dev'
            : `Passkey unavailable: ${passkeySupport.reason}`
        }
        disabled={!passkeySupport.supported}
      >
        Use Passkey
      </button>

      <button
        onClick={() => {
          void useBurner();
        }}
        className="rounded-2xl px-3 py-1.5 text-sm bg-white/10 hover:opacity-90"
        title="Create/Load a local dev wallet"
      >
        Use Burner
      </button>

      {(wagmiAddress || burnerAddr || Boolean(pk)) && (
        <button
          onClick={() => {
            void forgetAll();
          }}
          className="rounded-2xl px-3 py-1.5 text-sm bg-white/10 hover:opacity-90"
          title="Clear passkey session, burner, and disconnect"
        >
          Forget
        </button>
      )}
    </div>
  );
}
