"use server";
import * as z from "zod";
import { LoginSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "! حقل غير صالح" };
  }

  const { password, email } = validatedFields.data;
  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return { error: "! المستخدم غير موجود" };
  }

  const isMatched = await compare(password, existingUser.password);
  if (!isMatched) {
    return { error: "! كلمة المرور غير صحيحة" };
  }

  const token = generateToken(existingUser);
  return {
    token,
    success: "! تم تسجيل الدخول بنجاح",
    role: existingUser.role || "user",
  };
};

function generateToken(existingUser: {
  id: string;
  email: string;
  username: string;
  role: string | null;
}) {
  try {
    const payload = {
      id: existingUser.id,
      email: existingUser.email,
      username: existingUser.username,
      role: existingUser.role || "user",
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
  } catch (error) {
    console.error("Error generating token:", error);
    throw new Error("Could not generate token");
  }
}
