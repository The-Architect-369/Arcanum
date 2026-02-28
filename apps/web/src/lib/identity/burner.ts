// src/lib/identity/burner.ts

const STORAGE_KEY = 'arcanum.burner'

export function hasBurner(): boolean {
  return typeof localStorage !== 'undefined' &&
    localStorage.getItem(STORAGE_KEY) !== null
}

export function loadBurner(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(STORAGE_KEY)
}

export function createBurner(): string {
  const key = crypto.randomUUID()
  localStorage.setItem(STORAGE_KEY, key)
  return key
}

export function forgetBurner(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}