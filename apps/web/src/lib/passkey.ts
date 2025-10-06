'use client';
const KEY = 'arcanum:passkey';
export function getPasskey(){ try{ const r=localStorage.getItem(KEY); return r?JSON.parse(r):null; }catch{ return null; } }
export function clearPasskey(){ try{ localStorage.removeItem(KEY);}catch{} }

export async function registerPasskey(){
  try{
    if ((navigator as any).credentials?.create){
      await (navigator as any).credentials.create({
        publicKey:{
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp:{ name:'Arcanum (dev)' },
          user:{ id: crypto.getRandomValues(new Uint8Array(16)), name:'guest', displayName:'Guest' },
          pubKeyCredParams:[{ type:'public-key', alg:-7 }],
          authenticatorSelection:{ userVerification:'preferred' }, timeout:60000
        }
      });
    }
  }catch{}
  localStorage.setItem(KEY, JSON.stringify({ createdAt: Date.now() }));
  return getPasskey();
}
export async function signInPasskey(){
  try{
    if ((navigator as any).credentials?.get){
      await (navigator as any).credentials.get({
        publicKey:{ challenge: crypto.getRandomValues(new Uint8Array(32)), userVerification:'preferred', timeout:60000 }
      });
    }
  }catch{}
  const v = getPasskey() || { createdAt: Date.now() }; (v as any).lastSignIn = Date.now();
  localStorage.setItem(KEY, JSON.stringify(v)); return v;
}