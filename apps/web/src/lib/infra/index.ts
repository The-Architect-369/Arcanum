export * from './chains';
export * from './ipfs';
export * from './matrix';
export * from './wagmi';
export * from './helia';

// Posting pipeline not active yet.
// Stubs unblock build while preserving “not live” semantics.
export async function uploadToIPFS(): Promise<never> {
  throw new Error('uploadToIPFS is not enabled in this build.');
}

export async function publishPost(): Promise<never> {
  throw new Error('publishPost is not enabled in this build.');
}