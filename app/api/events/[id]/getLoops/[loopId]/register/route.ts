import { registerCamelInLoop } from "@/Actions/camelRegister";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// تعطيل التخزين المؤقت وجعل الاستجابة ديناميكية
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(
  req: NextRequest,
  { params }: { params: { loopId: string } }
) {
  try {
    const body = await req.json();
    const { camelId } = body;

    const loopId = params.loopId;

    // Get camel and loop details before registration for history
    const camel = await db.camel.findUnique({
      where: { id: parseInt(camelId) },
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

    const loop = await db.loop.findUnique({
      where: { id: loopId },
      include: {
        event: {
          select: {
            name:  true
          }
        }
      }
    });

    if (!camel) {
      return NextResponse.json({ error: "Camel not found" }, { status: 404 });
    }

    if (!loop) {
      return NextResponse.json({ error: "Loop not found" }, { status: 404 });
    }

    const result = await registerCamelInLoop({ camelId, loopId });

    if (result.error) {
      return NextResponse.json(result, { status: 400 });
    }

    // Create camel history record for the registration
    await db.camelHistory.create({
      data: {
        name: camel.name,
        camelID: camel.camelID,
        age: camel.age,
        sex: camel.sex,
        ownerId: camel.ownerId,
        Date: new Date(),
        typeOfMethode: `تسجيل المطية في الحدث: ${loop.event.name}}   الشوط: ${loop.number}`,
      },
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error registering camel:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
