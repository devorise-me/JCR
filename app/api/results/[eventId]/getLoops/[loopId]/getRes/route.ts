import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string; loopId: string } }
) {
  const { eventId, loopId } = params;

  try {
    const results = await db.raceResult.findMany({
      where: {
        eventId: eventId,
        loopId: loopId,
      },
      include: {
        camel: true,
        owner: true,
      },
      orderBy: {
        rank: 'asc', // Order by rank, lowest first
      },
    });

    const formattedResults = results.map((result) => ({
      rank: result.rank,
      camelId: result.camel.id,
      camelName: result.camel.name,
      ownerName: result.ownerName,
      camelID: result.camel.camelID,
      IBAN: result.IBAN,
      SwiftCode: result.swiftCode,
      bankName: result.bankName,
      NationalID: result.owner.NationalID,
    }));

    return NextResponse.json(formattedResults, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
