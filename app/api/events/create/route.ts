import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { EventsSchema } from "@/schemas"; 
// تعطيل التخزين المؤقت وجعل الاستجابة ديناميكية
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function POST(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "العملية غير مسموح بها" });
  }

  const validation = EventsSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      error: "فشل التحقق من البيانات",
      details: validation.error.errors,
    });
  }

  const { name, StartDate, EndDate } = validation.data;

  try {
    const event = await db.event.create({
      data: {
        name,
        StartDate: new Date(StartDate),
        EndDate: new Date(EndDate),
      },
    });

    res.status(201).json({
      message: "تم إنشاء الفعالية بنجاح",
      event,
    });
  } catch (error) {
    console.error("لم يتم انشاء الفعالية:", error);

    res.status(500).json({ error: "لم يتم انشاء الفعالية" });
  }
}
