'use client';
import { privateKeyToAccount } from 'viem/accounts';
const KEY = 'arcanum:burner';
export type Burner = { address: `0x${string}`; privateKey: `0x${string}` };

function randomPriv(): `0x${string}` {
  const b = new Uint8Array(32); crypto.getRandomValues(b);
  return '0x' + Array.from(b).map(x => x.toString(16).padStart(2,'0')).join('');
}
export function hasBurner(){ return !!localStorage.getItem(KEY); }
export function createBurner(): Burner {
  const pk = randomPriv(); const acct = privateKeyToAccount(pk);
  const b: Burner = { address: acct.address, privateKey: pk };
  localStorage.setItem(KEY, JSON.stringify(b)); return b;
}
export function loadBurner(): Burner { const r = localStorage.getItem(KEY)!; return JSON.parse(r) as Burner; }
export function forgetBurner(){ localStorage.removeItem(KEY); }