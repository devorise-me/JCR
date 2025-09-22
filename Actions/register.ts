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

  // Check if user already exists by email
  const existingUserByEmail = await getUserByEmail(email);
  if (existingUserByEmail) {
    return { error: "المستخدم موجود بالفعل بهذا البريد الإلكتروني" };
  }

  // Check if username is already taken
  const existingUserByUsername = await db.user.findUnique({
    where: { username },
  });
  if (existingUserByUsername) {
    return { error: "اسم المستخدم مستخدم بالفعل" };
  }

  // Check if National ID is already used (if provided)
  if (NationalID) {
    const existingUserByNationalID = await db.user.findFirst({
      where: { NationalID },
    });
    if (existingUserByNationalID) {
      return { error: "الرقم الوطني مستخدم بالفعل" };
    }
  }

  // Check if mobile number is already used (if provided)
  if (MobileNumber) {
    const existingUserByMobile = await db.user.findFirst({
      where: { MobileNumber },
    });
    if (existingUserByMobile) {
      return { error: "رقم الهاتف مستخدم بالفعل" };
    }
  }

  try {
    const newUser = await db.user.create({
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
        swiftCode,
        IBAN,
        bankName,
      },
    });

    // Log the registration
    await db.adminActivity.create({
      data: {
        userId: newUser.id,
        action: "إنشاء حساب جديد",
        details: `تم إنشاء حساب جديد للمستخدم: ${email} (${role})`,
        timestamp: new Date(),
      },
    });

    // For admin roles, redirect to dashboard
    redirect("/admin/dashboard");

    return {
      success: "! تم إنشاء الحساب بنجاح",
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
      },
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى" };
  }
};
