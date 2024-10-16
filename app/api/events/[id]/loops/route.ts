import { createLoop } from "@/Actions/CreateLoops";
import { NextRequest, NextResponse } from "next/server";

// تعطيل التخزين المؤقت وجعل الاستجابة ديناميكية
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const body = await req.json();

    const result = await createLoop(body, eventId);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: result.success }, { status: 201 });
  } catch (error) {
    console.error("Error in creating loop:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
