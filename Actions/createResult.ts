"use server";
import { db } from "@/lib/db";
import { raceResultSchema } from "@/schemas";

export async function createRaceResult(data: any) {
  const result = raceResultSchema.safeParse(data);
  if (!result.success) {
    console.error("Validation errors:", result.error.issues);
    throw new Error("Invalid race result data");
  }

  const {
    rank,
    eventId,
    ownerId,
    camelId,
    loopId,
    IBAN,
    bankName,
    swiftCode,
    ownerName,
    NationalID,
    camelID,
  } = result.data;

  if (!swiftCode || !ownerName || !NationalID || !camelID) {
    throw new Error("swiftCode, ownerName, NationalID, and camelID are required");
  }

  try {
    const existingResult = await db.raceResult.findMany({
      where: {
        AND: [
          { camelId: camelId },
          { loopId: loopId },
          { eventId: eventId }
        ]
      }
    });

    if (existingResult?.length) {
      await Promise.all(existingResult.map(async (result) => {
        await db.raceResult.delete({
          where: {
            id: result.id
          }
        });
      }))
    }

    const raceResult = await db.raceResult.create({
      data: {
        rank,
        eventId,
        ownerId,
        camelId,
        loopId,
        IBAN,
        bankName,
        swiftCode,
        ownerName,
        NationalID,
        camelID,
      },
    });

    return raceResult;
  } catch (error: any) {
    console.error("Error handling race result:", error);
    throw new Error("Failed to handle race result: " + error.message);
  }
}
