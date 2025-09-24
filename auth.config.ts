// import type { NextAuthConfig } from "next-auth/config";
import GitHub from "next-auth/providers/github";

export default {
  providers: [GitHub],
  pages: {
    signIn: "/auth/login",
  },
}

