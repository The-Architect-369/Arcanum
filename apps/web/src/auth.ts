import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { allowedArchitect, architectOrigin } from "@/lib/architect-access";

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
    signIn({ account, profile }) {
      return (
        architectAuthReady() &&
        account?.provider === "google" &&
        allowedArchitect(profile ?? {}, process.env.ARCHITECT_GOOGLE_EMAIL)
      );
    },
    jwt({ token, account, profile }) {
      if (account) {
        token.architect =
          account.provider === "google" &&
          allowedArchitect(profile ?? {}, process.env.ARCHITECT_GOOGLE_EMAIL);
        token.googleSubject = profile?.sub;
        token.googleEmailVerified = profile?.email_verified;
        token.googleHostedDomain = profile?.hd;
      }
      return token;
    },
    session({ session, token }) {
      const allowed =
        token.architect === true &&
        allowedArchitect(
          {
            sub: token.googleSubject,
            email: token.email,
            email_verified: token.googleEmailVerified,
            hd: token.googleHostedDomain,
          },
          process.env.ARCHITECT_GOOGLE_EMAIL,
        );
      if (!allowed) {
        session.user.email = "";
        session.user.name = null;
        session.user.image = null;
      }
      return session;
    },
    redirect() {
      return `${architectOrigin(process.env.AUTH_URL) ?? "https://architect.the-arcanum.net"}/architect/review`;
    },
  },
});
