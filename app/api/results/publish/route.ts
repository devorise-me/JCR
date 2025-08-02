import { createRaceResult } from "@/Actions/createResult";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// تعطيل التخزين المؤقت وجعل الاستجابة ديناميكية
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const loopId = data[0]?.loopId;
    if (!loopId) {
      return NextResponse.json(
        { success: false, error: "loopId is required" },
        { status: 400 }
      );
    }

    // Fetch loop and its associated event
    const loop = await db.loop.findUnique({
      where: { id: loopId },
      include: { event: true }
    });

    if (!loop || !loop.event) {
      return NextResponse.json(
        { success: false, error: "Loop or associated event not found" },
        { status: 404 }
      );
    }

    // Delete old race results for this loop
    await db.raceResult.deleteMany({
      where: { loopId: loopId }
    });

    const raceResults = await Promise.all(
      data.map(async (result: any) => {
        try {
          const createdResult = await createRaceResult(result);

          if (createdResult && createdResult.camelId) {
            const camel = await db.camel.findUnique({
              where: { id: createdResult.camelId },
              include: {
                owner: {
                  select: {
                    FirstName: true,
                    FamilyName: true,
                    username: true
                  }
                }
              }
            });

            if (camel) {
              await db.camelHistory.create({
                data: {
                  name: camel.name,
                  camelID: camel.camelID,
                  age: camel.age,
                  sex: camel.sex,
                  ownerId: camel.ownerId,
                  Date: new Date(),
                  typeOfMethode: `نشر نتيجة السباق - الحدث: ${loop.event.name}, الرتبة: ${createdResult.rank}}`,
                },
              });
            }
          }

          return createdResult;
        } catch (error) {
          console.error("Error creating individual race result:", error);
          return null;
        }
      })
    );

    const successfulResults = raceResults.filter(result => result !== null);

    return NextResponse.json({ success: true, raceResults: successfulResults });
  } catch (error: any) {
    console.error("Error creating race results:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
