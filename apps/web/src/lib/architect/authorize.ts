import "server-only";
import { headers } from "next/headers";
import { auth, architectAuthReady } from "@/auth";
import { architectOrigin } from "../architect-access";
import { loadArchitectStore } from "./store";
export class ArchitectAccessError extends Error {
  constructor(public status: number) {
    super("Architect access unavailable.");
  }
}
export async function authorizedArchitectSnapshot() {
  const origin = architectOrigin(process.env.AUTH_URL);
  if (!architectAuthReady() || !origin) throw new ArchitectAccessError(503);
  if ((await headers()).get("host") !== new URL(origin).host)
    throw new ArchitectAccessError(403);
  const session = await auth();
  if (!session) throw new ArchitectAccessError(401);
  const store = await loadArchitectStore();
  if (!session?.architect || !session.user?.email)
    throw new ArchitectAccessError(401);
  const member = store.members.find(
    (m) =>
      m.active &&
      m.id === session.architect?.id &&
      m.version === session.architect?.version,
  );
  if (!member) throw new ArchitectAccessError(403);
  return { store, member };
}
