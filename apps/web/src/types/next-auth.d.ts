import "next-auth";
declare module "next-auth" {
  interface Session {
    architect?: { id: string; version: number };
  }
}
