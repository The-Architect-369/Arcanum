import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { architectOrigin } from "@/lib/architect-access";

import { enrolledIdentity, loadArchitectStore } from "@/lib/architect/store";

export function architectAuthReady() {
  return Boolean(
    (process.env.AUTH_SECRET?.length ?? 0) >= 32 &&
      process.env.AUTH_GOOGLE_ID &&
      process.env.AUTH_GOOGLE_SECRET &&
      process.env.ARCHITECT_GOOGLE_EMAIL &&
      architectOrigin(process.env.AUTH_URL),
  );
}
export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  debug: false,
  logger: {
    error() {
      console.error("Architect authentication request failed.");
    },
  },
  trustHost: true, // Handlers below accept only the fixed configured Architect origin.
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
      checks: ["pkce", "state", "nonce"],
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "select_account",
          access_type: "online",
        },
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 60 * 60 },
  pages: { signIn: "/architect/login", error: "/architect/login" },
  callbacks: {
    async signIn({ account, profile }) {
      if (!architectAuthReady() || account?.provider !== "google") return false;
      try {
        return Boolean(
          enrolledIdentity(await loadArchitectStore(), profile ?? {}),
        );
      } catch {
        return false;
      }
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.architect = false;
        if (account.provider === "google") {
          token.googleSubject = profile?.sub;
          token.googleEmailVerified = profile?.email_verified;
          token.googleHostedDomain = profile?.hd;
          try {
            const member = enrolledIdentity(
              await loadArchitectStore(),
              profile ?? {},
            );
            if (member) {
              token.architect = true;
              token.architectMemberId = member.id;
              token.architectVersion = member.version;
            }
          } catch {
            /* Authorization unavailable: no access. */
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      let member = null;
      try {
        member = enrolledIdentity(await loadArchitectStore(), {
          sub: token.googleSubject,
          email: token.email,
          email_verified: token.googleEmailVerified,
          hd: token.googleHostedDomain,
        });
      } catch {
        /* Fail closed, including stale/removed enrollment. */
      }
      const allowed =
        token.architect === true &&
        member &&
        member.id === token.architectMemberId &&
        member.version === token.architectVersion;
      session.architect =
        allowed && member
          ? { id: member.id, version: member.version }
          : undefined;
      if (!allowed) {
        session.user.email = "";
        session.user.name = null;
        session.user.image = null;
      }
      return session;
    },
    redirect({ url }) {
      const origin =
        architectOrigin(process.env.AUTH_URL) ??
        "https://architect.the-arcanum.net";
      try {
        const target = new URL(url, origin);
        if (
          target.origin === origin &&
          [
            "/architect/login",
            "/architect/review",
            "/architect/denied",
          ].includes(target.pathname)
        )
          return target.href;
      } catch {
        /* Fixed safe destination. */
      }
      return `${origin}/architect/review`;
    },
  },
});
