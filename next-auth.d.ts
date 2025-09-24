import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    role?: string; // 👈 add custom role field
  }

  interface Session {
    user?: {
      id: string;
      role?: string;
    } & DefaultSession["user"];
  }

  interface JWT {
    id?: string;
    role?: string;
  }
}
