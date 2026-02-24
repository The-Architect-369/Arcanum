// src/lib/identity/burner.ts

export function bytesToHex(bytes: Uint8Array): `0x${string}` {
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return (`0x${hex}`) as `0x${string}`
}