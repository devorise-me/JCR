import { createRaceResult } from "@/Actions/createResult";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// تعطيل التخزين المؤقت وجعل الاستجابة ديناميكية
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const loopId = data[0].loopId;
    if (!loopId) {
      return NextResponse.json(
        { success: false, error: "loopId is required" },
        { status: 400 }
      );
    }

    await db.raceResult.deleteMany({
      where: {
        loopId: loopId
      }
    });

    const raceResults = await Promise.all(
      data.map(async (result: any) => {
        try {
          const createdResult = await createRaceResult(result);
          
          // Create camel history record for the race result
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
                  typeOfMethode: `نشر نتيجة السباق - الحدث: ${loop.event.name}, الرتبة: ${createdResult.rank}, المالك: ${camel.owner?.FirstName || 'غير محدد'} ${camel.owner?.FamilyName || ''}`,
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


