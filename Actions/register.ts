"use server";
import * as z from "zod";
import { db } from "@/lib/db";
import { RegisterSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { redirect } from "next/navigation";
import bcryptjs from "bcryptjs";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "! حقل غير صالح" };
  }

  const {
    FirstName,
    FatherName,
    GrandFatherName,
    FamilyName,
    username,
    email,
    NationalID,
    BDate,
    MobileNumber,
    role,
    password,
    swiftCode,
    IBAN,
    bankName,
  } = validatedFields.data;

  const hashedPassword = await bcryptjs.hash(password, 10);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "المستخدم موجود بالفعل" };
  }

  await db.user.create({
    data: {
      FirstName,
      FatherName,
      GrandFatherName,
      FamilyName,
      username,
      email,
      NationalID,
      BDate,
      MobileNumber,
      role,
      password: hashedPassword,
      swiftCode ,
      IBAN ,
      bankName,
    },
  });

  redirect("/admin/dashboard");

  return {
    success: "! تم انشاء الحساب",
  };
};
