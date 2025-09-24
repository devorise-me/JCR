import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { EventsSchema } from "@/schemas";

// تعطيل التخزين المؤقت وجعل الاستجابة ديناميكية
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // validate with Zod schema
    const validation = EventsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "فشل التحقق من البيانات",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { name, StartDate, EndDate } = validation.data;

    const event = await db.event.create({
      data: {
        name,
        StartDate: new Date(StartDate),
        EndDate: new Date(EndDate),
      },
    });

    return NextResponse.json(
      {
        message: "تم إنشاء الفعالية بنجاح",
        event,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("لم يتم انشاء الفعالية:", error);
    return NextResponse.json(
      { error: "لم يتم انشاء الفعالية" },
      { status: 500 }
    );
  }
}
