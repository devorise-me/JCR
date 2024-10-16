import { updateCamel } from '@/Actions/updateCamel';
import { NextRequest, NextResponse } from 'next/server';
// تعطيل التخزين المؤقت وجعل الاستجابة ديناميكية
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function PUT(request: NextRequest) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const idString = pathParts[pathParts.length - 2]; // استخراج الـ ID من الـ URL
  const id = parseInt(idString, 10);


  // التحقق من صحة الـ IDz
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

    // تحديث بيانات الجمل باستخدام الـ ID والبيانات المستلمة
    await updateCamel(id, body);

    return NextResponse.json({ message: "Camel updated successfully" });

  } catch (error) {
    console.error("Error updating camel:", error);

    // تحديد نوع الخطأ إذا أمكن
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
