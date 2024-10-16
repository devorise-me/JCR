import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUserByEmail } from "./data/user";
import { compare } from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      authorize: async (credentials) => {
        const email = credentials.email as string;

        const password = credentials.password as string;

        if (!email || !password) {
          throw new Error("يرجى تعبئة الخانات المطلوبة");
        }

        const user = await getUserByEmail(email);

        if (!user) {
          throw new Error("كلمة المرور او البريد الالكتروني غير صحيح");
        }

        const isMatched = await compare(password, user.password);

        if (!isMatched) {
          throw new Error("كلمة المرور غير صحيحة");
        }

        const userData = {
          FirstName: user.FirstName,
          LastName: user.FamilyName,
          Email: user.email,
          id: user.id,
        };

        return userData;
      },
    }),
  ],

  pages: {
    signIn: "/auth/login",
  },
});
