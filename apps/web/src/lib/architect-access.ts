// Pure policy: Google authentication is required in addition to this allowlist.
export type GoogleIdentity = {
  sub?: unknown;
  email?: unknown;
  email_verified?: unknown;
  hd?: unknown;
};
export function allowedArchitect(
  identity: GoogleIdentity,
  ownerEmail: string | undefined,
): boolean {
  const owner = ownerEmail?.trim().toLowerCase();
  if (!owner || !owner.includes("@")) return false;
  return (
    typeof identity.sub === "string" &&
    identity.sub.length > 0 &&
    typeof identity.email === "string" &&
    identity.email.toLowerCase() === owner &&
    identity.email_verified === true &&
    identity.hd === owner.split("@")[1]
  );
}
export function architectOrigin(value: string | undefined): string | null {
  try {
    const url = new URL(value ?? "");
    if (
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    )
      return null;
    if (url.origin === "https://architect.the-arcanum.net") return url.origin;
    if (
      process.env.NODE_ENV !== "production" &&
      url.protocol === "http:" &&
      url.hostname === "localhost"
    )
      return url.origin;
  } catch {
    /* Missing configuration denies access. */
  }
  return null;
}
