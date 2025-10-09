import { NextResponse } from "next/server";
import { createCamel } from "@/Actions/CreateCamels";
// تعطيل التخزين المؤقت وجعل الاستجابة ديناميكية
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const result = await createCamel(data);

    if (result.error) {
      return NextResponse.json(
        {
          error: result.error,
          details: result.details || undefined
        },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error handling request:", error);
    const errorMessage = error instanceof Error ? error.message : "فعالية خطأ أثناء معالجة الطلب";
    return NextResponse.json(
      {
        error: "فعالية خطأ أثناء معالجة الطلب",
        message: errorMessage
      },
      { status: 500 }
    );
  }
}
