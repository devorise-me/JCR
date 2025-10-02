// next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

// Extend built-in types
declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;       // 👈 ensure `id` is always there
    role?: string;    // 👈 optional role field
  }

  interface Session {
    user: {
      id: string;
      role?: string;
    } & DefaultSession["user"];
  }

  interface JWT {
    id: string;
    role?: string;
  }
}
