import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
// تعطيل التخزين المؤقت وجعل الاستجابة ديناميكية
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id: eventId } = params;

        // console.log(eventId);

        const loops = await db.loop.findMany({ where: { eventId: eventId, RaceResult: { some: {} } }, include: { RaceResult: true } });

        console.log(loops[0].RaceResult.length);


        if (loops.length === 0) {
            return NextResponse.json({ error: "No loops found for this event" }, { status: 404 });
        }

        return NextResponse.json(loops, { status: 200 });

    } catch (error) {
        console.error("Error fetching loops:", error);

        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
