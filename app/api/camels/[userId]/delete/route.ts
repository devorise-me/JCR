import { deleteCamel } from '@/Actions/deleteCamel';
import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
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

    // Get camel details before deletion
    const camel = await db.camel.findUnique({
      where: { id: camelId },
      include: {
        owner: {
          select: {
            FirstName: true,
            FamilyName: true,
            username: true
          }
        }
      }
    });

    if (!camel) {
      return NextResponse.json(
        { error: "المطية غير موجودة" },
        { status: 404 }
      );
    }

    // Create camel history record for the deletion
    await db.camelHistory.create({
      data: {
        name: camel.name,
        camelID: camel.camelID,
        age: camel.age,
        sex: camel.sex,
        ownerId: camel.ownerId,
        Date: new Date(),
        typeOfMethode: `حذف المطية - المالك السابق: ${camel.owner?.FirstName || 'غير محدد'} ${camel.owner?.FamilyName || ''}`,
      },
    });

    // Call the deleteCamel function
    await deleteCamel(camelId);
    return NextResponse.json({ message: "Camel deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting camel:", error);
    return NextResponse.json({ error: "Error deleting camel" }, { status: 500 });
  }
}
