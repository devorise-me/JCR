import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(
  req: NextRequest,
  { params }: { params: { eventId: string; loopId: string } }
) {
  const { eventId, loopId } = params;

  try {
    const { camelId, newRank } = await req.json();

    if (!camelId || !newRank || newRank < 1) {
      return NextResponse.json(
        { error: "Invalid camelId or rank" },
        { status: 400 }
      );
    }

    // Find the result to update
    const existingResult = await db.raceResult.findFirst({
      where: {
        eventId: eventId,
        loopId: loopId,
        camelId: parseInt(camelId),
      },
    });

    if (!existingResult) {
      return NextResponse.json(
        { error: "Result not found" },
        { status: 404 }
      );
    }

    const oldRank = existingResult.rank;

    // Get all results for this loop to handle rank adjustments
    const allResults = await db.raceResult.findMany({
      where: {
        eventId: eventId,
        loopId: loopId,
      },
      orderBy: {
        rank: 'asc',
      },
    });

    // Update ranks to accommodate the change
    if (newRank !== oldRank) {
      // If moving up in rank (lower number)
      if (newRank < oldRank) {
        // Shift down all results between newRank and oldRank
        await db.raceResult.updateMany({
          where: {
            eventId: eventId,
            loopId: loopId,
            rank: {
              gte: newRank,
              lt: oldRank,
            },
          },
          data: {
            rank: {
              increment: 1,
            },
          },
        });
      } else {
        // Moving down in rank (higher number)
        // Shift up all results between oldRank and newRank
        await db.raceResult.updateMany({
          where: {
            eventId: eventId,
            loopId: loopId,
            rank: {
              gt: oldRank,
              lte: newRank,
            },
          },
          data: {
            rank: {
              decrement: 1,
            },
          },
        });
      }
    }

    // Update the target result
    const updatedResult = await db.raceResult.update({
      where: {
        id: existingResult.id,
      },
      data: {
        rank: newRank,
      },
      include: {
        camel: true,
        owner: true,
      },
    });

    // Log the change in camel history
    await db.camelHistory.create({
      data: {
        name: updatedResult.camel.name,
        camelID: updatedResult.camel.camelID,
        age: updatedResult.camel.age,
        sex: updatedResult.camel.sex,
        ownerId: updatedResult.camel.ownerId,
        Date: new Date(),
        typeOfMethode: `تعديل نتيجة السباق - الرتبة من ${oldRank} إلى ${newRank}`,
      },
    });

    return NextResponse.json({ 
      success: true, 
      result: updatedResult 
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating result:", error);
    return NextResponse.json(
      { error: "Failed to update result" },
      { status: 500 }
    );
  }
}

