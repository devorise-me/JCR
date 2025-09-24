import { updateUser } from '@/Actions/updateRegiseration';
import { NextRequest, NextResponse } from 'next/server';
// تعطيل التخزين المؤقت وجعل الاستجابة ديناميكية
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function PUT(request: NextRequest) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const idString = pathParts[pathParts.length - 2]; // Extract the ID from the URL
  const id = idString; // Assuming ID is a string; adjust if it's numeric


  // Validate the ID
  if (!id) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    // Extract the body from the request
    const body = await request.json();

    // Validate that the body contains data
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: "Empty payload" }, { status: 400 });
    }

    // Update user data using the ID and received data
    await updateUser(id, body);

    return NextResponse.json({ message: "User updated successfully" });

  } catch (error) {
    console.error("Error updating user:", error);

    // Determine the error type if possible
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
