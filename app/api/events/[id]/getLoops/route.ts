import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
// تعطيل التخزين المؤقت وجعل الاستجابة ديناميكية
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params;


    const loops = await db.loop.findMany({ where: { eventId: eventId } });


    if (loops.length === 0) {
      return NextResponse.json({ error: "No loops found for this event" }, { status: 404 });
    }

    return NextResponse.json(loops, { status: 200 });

  } catch (error) {
    console.error("Error fetching loops:", error);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
