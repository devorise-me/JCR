"use server";
import { db } from "@/lib/db";

interface UpdateEventData {
  name?: string;
  StartDate?: string; // Assuming this is a string in ISO format
  EndDate?: string;   // Same as above
  disabled?: boolean;
  type?: string;
}

export const updateEvent = async (id: string, data: UpdateEventData) => {

  if (typeof id !== "string" || !id.trim()) {
    throw new Error("Invalid ID provided");
  }

  if (!data || Object.keys(data).length === 0) {
    throw new Error("No data provided for update");
  }

  try {
    const eventExists = await db.event.findUnique({ where: { id } });
    if (!eventExists) {
      throw new Error("Event with the provided ID does not exist.");
    }

    const updatedData: any = {}; // Using `any` for flexibility

    // Handle date conversion if present
    if (data.StartDate) {
      updatedData.StartDate = new Date(data.StartDate);
    }
    if (data.EndDate) {
      updatedData.EndDate = new Date(data.EndDate);
    }
    if (data.name) {
      updatedData.name = data.name; // Keep the name if provided
    }

    if (data.disabled !== undefined) {
      updatedData.disabled = data.disabled;
    }

    if (data.type !== undefined) {
      updatedData.type = data.type;
    }

    const updatedEvent = await db.event.update({
      where: { id },
      data: updatedData,
    });

    return updatedEvent;
  } catch (error: any) {
    console.error("Error updating event:", error.message || error);
    throw new Error(`Error updating event: ${error.message || error}`);
  }
};
