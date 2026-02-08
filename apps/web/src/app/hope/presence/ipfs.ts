export async function submitReflectionToIPFS(
  reflection: Record<string, unknown>
): Promise<string> {
  const res = await fetch("/api/ipfs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reflection),
  });

  if (!res.ok) {
    throw new Error("Failed to submit reflection to IPFS");
  }

  const data = await res.json();

  // Expected shape: { cid: "..." }
  return data.cid;
}
