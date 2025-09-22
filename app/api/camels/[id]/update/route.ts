import { updateCamel } from '@/Actions/updateCamel';
import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";
// تعطيل التخزين المؤقت وجعل الاستجابة ديناميكية
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(request: NextRequest) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const idString = pathParts[pathParts.length - 2]; // استخراج الـ ID من الـ URL
  const id = parseInt(idString, 10);

  // التحقق من صحة الـ ID
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    // استخراج الجسم من الطلب
    const body = await request.json();

    // التحقق من أن الجسم يحتوي على البيانات المطلوبة
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: "Empty payload" }, { status: 400 });
    }

    // Get camel details before update
    const camel = await db.camel.findUnique({
      where: { id: id },
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

    // تحديث بيانات الجمل باستخدام الـ ID والبيانات المستلمة
    await updateCamel(id, body);

    // Create camel history record for the update
    await db.camelHistory.create({
      data: {
        name: camel.name,
        camelID: camel.camelID,
        age: camel.age,
        sex: camel.sex,
        ownerId: camel.ownerId,
        Date: new Date(),
        typeOfMethode: `تحديث بيانات المطية`,
      },
    });

    return NextResponse.json({ message: "Camel updated successfully" });

  } catch (error) {
    console.error("Error updating camel:", error);

    // تحديد نوع الخطأ إذا أمكن
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
