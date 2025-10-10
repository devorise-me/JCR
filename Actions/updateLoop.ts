"use server";
import { db } from "@/lib/db";
import { Loop } from "@prisma/client";

export const updateLoop = async (id: string, updatedData: Partial<Loop>) => {
 

  // التحقق من صحة المدخلات
  if (typeof id !== "string" || typeof updatedData !== "object") {
    throw new Error("Invalid input: ID or data format is incorrect");
  }
  // test commit
  if (!updatedData || Object.keys(updatedData).length === 0) {
    throw new Error("No data provided to update");
  }

  try {
    // التحقق من وجود الشوط في قاعدة البيانات
    const loopExists = await db.loop.findUnique({ where: { id } });
    if (!loopExists) {
      throw new Error("Loop not found");
    }

    // تحديث بيانات الشوط
    const result = await db.loop.update({
      where: { id },
      data: updatedData,
    });

    return result;
  } catch (error:any) {
    console.error("Error updating loop:", error);
    throw new Error(`Error updating loop: ${error.message}`);
  }
};
