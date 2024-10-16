import { deleteLoop } from "@/Actions/deleteLoop";
import { NextResponse } from "next/server";

// تعطيل التخزين المؤقت وجعل الاستجابة ديناميكية
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');

    // Extract the actual loopId from the correct index in the URL
    const loopId = pathParts[pathParts.length - 2];  // Get the second last part of the URL, assuming the last part is "deleteLoop"

    if (!loopId || typeof loopId !== "string") {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await deleteLoop(loopId); // Delete loop using the correct loopId
    return NextResponse.json({ message: "Loop deleted successfully" });
  } catch (error) {
    console.error("Error deleting loop:", error || error);  
    return NextResponse.json({ error: "Error deleting loop" }, { status: 500 });
  }
}
