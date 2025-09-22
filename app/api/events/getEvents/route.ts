import { db } from "@/lib/db";
import { NextResponse } from "next/server";
// تعطيل التخزين المؤقت وجعل الاستجابة ديناميكية
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const includeDisabled = searchParams.get("includeDisabled") === "true";

    const events = await db.event.findMany({
      where: includeDisabled ? {} : { disabled: false },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Error fetching events" },
      { status: 500 }
    );
  }
}
