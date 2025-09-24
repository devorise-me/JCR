// auth.ts (or auth.config.ts depending on your setup)
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Your login logic here
        return { id: "1", name: "Test User", email: "test@example.com", role: "admin" };
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
});
