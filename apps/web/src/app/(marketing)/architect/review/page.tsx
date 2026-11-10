import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { architectAuthReady, signOut } from "@/auth";
import { architectOrigin } from "@/lib/architect-access";
import {
  authorizedArchitectSnapshot,
  ArchitectAccessError,
} from "@/lib/architect/authorize";
import { readModel } from "@/lib/architect/model";
import ArchitectWorkspace from "@/components/architect/ArchitectWorkspace";
import "../architect.css";
export const metadata: Metadata = {
  title: "Architect workspace",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function ReviewPage() {
  let access;
  try {
    access = await authorizedArchitectSnapshot();
  } catch (error) {
    if (error instanceof ArchitectAccessError && error.status === 403)
      redirect(
        `${architectOrigin(process.env.AUTH_URL) ?? "https://architect.the-arcanum.net"}/architect/login`,
      );
    redirect("/architect/login");
  }
  const accountControl = (
    <form
      action={async () => {
        "use server";
        const origin = architectOrigin(process.env.AUTH_URL);
        if (
          !architectAuthReady() ||
          !origin ||
          (await headers()).get("host") !== new URL(origin).host
        )
          throw new Error("Sign-out unavailable on this address.");
        await signOut({ redirectTo: "/architect/login" });
      }}
    >
      <button type="submit">Sign out</button>
    </form>
  );
  return (
    <ArchitectWorkspace
      initial={readModel(access.store)}
      accountControl={accountControl}
    />
  );
}
