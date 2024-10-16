"use server";
import { db } from "@/lib/db";

export const deleteLoop = async (id: string) => {
  if (typeof id !== "string") {
    throw new Error("Invalid ID");
  }

  try {
    // Check if the loop exists
    const loopExists = await db.loop.findUnique({ where: { id } });
    if (!loopExists) {
      throw new Error("Loop not found");
    }

    // Delete the loop
    const result = await db.loop.delete({
      where: { id },
    });

    return result;
  } catch (error: any) {
    console.error("Error deleting loop:", error.message || error);
    throw new Error("Error deleting loop");
  }
};
