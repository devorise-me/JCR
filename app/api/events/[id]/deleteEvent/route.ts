import { deleteEvent } from "@/Actions/deleteEvent";
import { NextResponse } from "next/server";

// تعطيل التخزين المؤقت وجعل الاستجابة ديناميكية
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  
  const idString = pathParts[pathParts.length - 2];
  

  if (!idString || typeof idString !== "string") {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    await deleteEvent(idString);
    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
  }
}
