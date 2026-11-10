import "server-only";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { parseStore, type ArchitectStore, type ArchitectMember } from "./model";
import { allowedArchitect, type GoogleIdentity } from "../architect-access";
export class StoreUnavailable extends Error {
  constructor() {
    super("Workspace authorization/snapshot unavailable.");
  }
}
export async function loadArchitectStore(): Promise<ArchitectStore> {
  try {
    let body: string;
    if (process.env.ARCHITECT_STORE_URL) {
      const u = new URL(process.env.ARCHITECT_STORE_URL);
      if (
        u.protocol !== "https:" ||
        u.username ||
        u.password ||
        u.search ||
        u.hash ||
        !process.env.ARCHITECT_STORE_TOKEN
      )
        throw new StoreUnavailable();
      const response = await fetch(u, {
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(4000),
        headers: {
          Authorization: `Bearer ${process.env.ARCHITECT_STORE_TOKEN}`,
          Accept: "application/json",
        },
      });
      if (!response.ok) throw new StoreUnavailable();
      body = await response.text();
    } else {
      const file = process.env.ARCHITECT_STORE_PATH;
      if (
        !file ||
        !path.isAbsolute(file) ||
        path
          .resolve(file)
          .startsWith(path.resolve(process.cwd(), "public") + path.sep)
      )
        throw new StoreUnavailable();
      if ((await stat(file)).size > 8 * 1024 * 1024)
        throw new StoreUnavailable();
      body = await readFile(file, "utf8");
    }
    if (body.length > 8 * 1024 * 1024) throw new StoreUnavailable();
    return parseStore(JSON.parse(body));
  } catch {
    throw new StoreUnavailable();
  }
}
export function enrolledIdentity(
  store: ArchitectStore,
  identity: GoogleIdentity,
): ArchitectMember | null {
  if (
    typeof identity.email !== "string" ||
    identity.email_verified !== true ||
    typeof identity.sub !== "string" ||
    !identity.sub
  )
    return null;
  const member = store.members.find(
    (m) => m.active && m.email === identity.email?.toString().toLowerCase(),
  );
  if (!member) return null;
  if (
    member.role === "owner" &&
    !allowedArchitect(identity, process.env.ARCHITECT_GOOGLE_EMAIL)
  )
    return null;
  if (member.googleSubject !== null && member.googleSubject !== identity.sub)
    return null;
  return member;
}
