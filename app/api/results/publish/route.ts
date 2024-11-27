import { createRaceResult } from "@/Actions/createResult";
import { NextResponse } from "next/server";

// تعطيل التخزين المؤقت وجعل الاستجابة ديناميكية
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const raceResults = await Promise.all(
      data.map(async (result: any) => {
        try {
          return await createRaceResult(result);
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


