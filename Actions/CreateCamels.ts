"use server";
import * as z from "zod";
import { db } from "@/lib/db";
import { camelSchema } from "@/schemas";

export const createCamel = async (values: z.infer<typeof camelSchema>) => {
  const validatedFields = camelSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "! حقل غير صالح", details: validatedFields.error.errors };
  }

  const { name, camelID, age, sex, ownerId } = validatedFields.data;

  try {
    const existingCamel = await db.camel.findUnique({
      where: { camelID },
    });

    if (existingCamel) {
      return { error: "الجمل موجود بالفعل" };
    }

    await db.camel.create({
      data: {
        name,
        camelID,
        age,
        sex,
        ownerId,
      },
    });

    return {
      success: "! تم انشاء الجمل",
    };
  } catch (error) {
    console.error("Error creating camel in database:", error);
    return { error: "فعالية خطأ أثناء إضافة الجمل", details: error };
  }
};
