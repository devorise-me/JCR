import { updateLoop } from "@/Actions/updateLoop";
import { NextResponse } from "next/server";
// تعطيل التخزين المؤقت وجعل الاستجابة ديناميكية
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function PUT(request: Request) {
  try {
    
    // Extract loopsId directly from request URL pathname
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');

    // Assuming 'updateLoop' is at the end of the path, loopsId should be right before it
    const loopsIdIndex = pathParts.findIndex(part => part === 'updateLoop') - 1;
    const loopsId = pathParts[loopsIdIndex];


    // Validate loopsId
    if (!loopsId || typeof loopsId !== "string") {
      return NextResponse.json({ error: "Invalid loopsId" }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();

    // Call updateLoop with loopsId and body
    await updateLoop(loopsId, body);

    // Return success response
    return NextResponse.json({ message: "Loop updated successfully" });
  } catch (error) {
    console.error("Error updating loop:", error);
    return NextResponse.json({ error: "Error updating loop" }, { status: 500 });
  }
}
