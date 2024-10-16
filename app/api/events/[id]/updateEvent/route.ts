import { updateEvent } from '@/Actions/updateEvent';
import { NextRequest, NextResponse } from 'next/server';
// تعطيل التخزين المؤقت وجعل الاستجابة ديناميكية
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function PUT(request: NextRequest) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const idString = pathParts[pathParts.length - 2];


  if (!idString) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const body = await request.json();


    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: "Empty payload" }, { status: 400 });
    }

    await updateEvent(idString, body);

    return NextResponse.json({ message: "Event updated successfully" });
  } catch (error) {

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
