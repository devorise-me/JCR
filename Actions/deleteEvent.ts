"use server";
import { db } from "@/lib/db";

export const deleteEvent = async (id: string) => {

  if (typeof id !== "string") {
    throw new Error("Invalid ID");
  }

  try {
    // Check if the event exists
    const eventExists = await db.event.findUnique({ where: { id } });
    if (!eventExists) {
      throw new Error("Event not found");
    }

    // Delete the event
    const result = await db.event.delete({
      where: { id },
    });

    return result;
  } catch (error: any) {
  }
};
