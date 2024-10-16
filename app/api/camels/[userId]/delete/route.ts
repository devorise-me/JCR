import { deleteCamel } from '@/Actions/deleteCamel';
import { NextResponse } from 'next/server';
// تعطيل التخزين المؤقت وجعل الاستجابة ديناميكية
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');

    // Extract the camelId from the URL path
    const camelIdStr = pathParts[pathParts.length - 2]; // Adjust based on path


    // Convert camelId to number
    const camelId = parseInt(camelIdStr, 10);

    if (isNaN(camelId)) {
      return NextResponse.json({ error: "Invalid camelId" }, { status: 400 });
    }

    // Call the deleteCamel function
    await deleteCamel(camelId);
    return NextResponse.json({ message: "Camel deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting camel:", error);
    return NextResponse.json({ error: "Error deleting camel" }, { status: 500 });
  }
}
