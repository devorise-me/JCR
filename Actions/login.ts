"use server";
import * as z from "zod";
import { LoginSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "! حقل غير صالح" };
  }

  const { password, email } = validatedFields.data;
  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return { error: "! البريد الإلكتروني أو كلمة المرور غير صحيحة" };
  }

  const isMatched = await compare(password, existingUser.password);
  if (!isMatched) {
    // Log failed login attempt
    await db.adminActivity.create({
      data: {
        userId: existingUser.id,
        action: "محاولة دخول فاشلة",
        details: `محاولة دخول فاشلة للمستخدم: ${email}`,
        timestamp: new Date(),
      },
    });

    return { error: "! البريد الإلكتروني أو كلمة المرور غير صحيحة" };
  }

  // Log successful login
  await db.adminActivity.create({
    data: {
      userId: existingUser.id,
      action: "تسجيل دخول",
      details: `تم تسجيل الدخول بنجاح للمستخدم: ${email}`,
      timestamp: new Date(),
    },
  });

  const token = generateToken(existingUser);
  return {
    token,
    success: "! تم تسجيل الدخول بنجاح",
    role: existingUser.role || "user",
    user: {
      id: existingUser.id,
      email: existingUser.email,
      username: existingUser.username,
      firstName: existingUser.FirstName,
      lastName: existingUser.FamilyName,
    },
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
      iat: Math.floor(Date.now() / 1000),
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
  } catch (error) {
    console.error("Error generating token:", error);
    throw new Error("Could not generate token");
  }
}
