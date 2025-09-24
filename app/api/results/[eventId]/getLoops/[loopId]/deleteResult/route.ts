import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function DELETE(
  req: NextRequest,
  { params }: { params: { eventId: string; loopId: string } }
) {
  const { eventId, loopId } = params;

  try {
    const { camelId } = await req.json();

    if (!camelId) {
      return NextResponse.json(
        { error: "camelId is required" },
        { status: 400 }
      );
    }

    // Find the result to delete
    const resultToDelete = await db.raceResult.findFirst({
      where: {
        eventId: eventId,
        loopId: loopId,
        camelId: parseInt(camelId),
      },
      include: {
        camel: true,
      },
    });

    if (!resultToDelete) {
      return NextResponse.json(
        { error: "Result not found" },
        { status: 404 }
      );
    }

    const deletedRank = resultToDelete.rank;

    // Delete the result
    await db.raceResult.delete({
      where: {
        id: resultToDelete.id,
      },
    });

    // Adjust ranks of remaining results
    await db.raceResult.updateMany({
      where: {
        eventId: eventId,
        loopId: loopId,
        rank: {
          gt: deletedRank,
        },
      },
      data: {
        rank: {
          decrement: 1,
        },
      },
    });

    // Log the change in camel history
    await db.camelHistory.create({
      data: {
        name: resultToDelete.camel.name,
        camelID: resultToDelete.camel.camelID,
        age: resultToDelete.camel.age,
        sex: resultToDelete.camel.sex,
        ownerId: resultToDelete.camel.ownerId,
        Date: new Date(),
        typeOfMethode: `حذف نتيجة السباق - الرتبة ${deletedRank}`,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Result deleted successfully" 
    }, { status: 200 });

  } catch (error) {
    console.error("Error deleting result:", error);
    return NextResponse.json(
      { error: "Failed to delete result" },
      { status: 500 }
    );
  }
}

