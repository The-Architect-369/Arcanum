export * from './contracts';
export * from './guards';
export * from './economy';
export * from './tokens';

// G2/G3: economy not active yet.
// Safe stub to unblock compilation; real enforcement remains protocol-side later.
export function canSpend(): boolean {
  return false;
}