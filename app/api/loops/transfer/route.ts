import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
const JWT_SECRET = process.env.JWT_SECRET || "defualt-secret-key";
function translateAge(age: string) {
    switch (age) {
      case "GradeOne": return "مفرد";
      case "GradeTwo": return "حقايق";
      case "GradeThree": return "لقايا";
      case "GradeFour": return "جذاع";
      case "GradeFive": return "ثنايا";
      case "GradeSixMale": return "زمول";
      case "GradeSixFemale": return "حيل";
      default: return age;
    }
  }
  function translateSex(sex: string) {
    switch (sex) {
      case "Male": return "قعدان";
      case "Female": return "بكار";
      default: return sex;
    }
  }
export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    if (!decoded?.id) {
      return NextResponse.json(
        { error: "الرجاء تسجيل الدخول" },
        { status: 401 }
      );
    }

    // Get request data
    const { camelId, newLoopId } = await req.json();

    console.log('camelId:', camelId);
    console.log('newLoopId:', newLoopId);

    // Validate request data
    if (!camelId || !newLoopId) {
      return NextResponse.json(
        { error: "البيانات المطلوبة غير مكتملة" },
        { status: 400 }
      );
    }

    // Get camel and loop info for validation and history
    const [camel, newLoop, camelWithOwner, loopWithEvent] = await Promise.all([
      db.camel.findUnique({
        where: { id: camelId },
      }),
      db.loop.findUnique({
        where: { id: newLoopId },
        include: {
          CamelLoop: true,
        }
      }),
      db.camel.findUnique({
        where: { id: camelId },
        include: {
          owner: {
            select: {
              FirstName: true,
              FamilyName: true,
              username: true,
            }
          }
        }
      }),
      db.loop.findUnique({
        where: { id: newLoopId },
        include: {
          event: {
            select: {
              name: true
            }
          }
        }
      })
    ]);

    // Validate camel exists
    if (!camel) {
      return NextResponse.json(
        { error: "المطية غير موجودة" },
        { status: 404 }
      );
    }

    // Validate new loop exists
    if (!newLoop) {
      return NextResponse.json(
        { error: "الشوط غير موجود" },
        { status: 404 }
      );
    }

    // Validate compatibility
    if (camel.age !== newLoop.age || camel.sex !== newLoop.sex) {
      return NextResponse.json(
        { error: "المطية غير متوافقة مع متطلبات الشوط" },
        { status: 400 }
      );
    }

    // Check loop capacity
    const registeredCount = await db.camelLoop.count({
      where: { loopId: newLoopId }
    });

    if (registeredCount >= newLoop.capacity) {
      return NextResponse.json(
        { error: "الشوط ممتلئ" },
        { status: 400 }
      );
    }

    // Get current registration
    const currentRegistration = await db.camelLoop.findFirst({
      where: { camelId }
    });

    // Perform transaction: remove old, add new, log history
    await db.$transaction(async (tx) => {
      // Delete old registration
      if (currentRegistration) {
        await tx.camelLoop.delete({
          where: { id: currentRegistration.id }
        });
      }

      // Add new registration
      await tx.camelLoop.create({
        data: {
          camelId,
          loopId: newLoopId,
        }
      });

      // Log camel transfer history
      if (camelWithOwner && loopWithEvent) {
        await tx.camelHistory.create({
          data: {
            name: camelWithOwner.name,
            camelID: camelWithOwner.camelID,
            age: camelWithOwner.age,
            sex: camelWithOwner.sex,
            ownerId: camelWithOwner.ownerId,
            Date: new Date(),
            typeOfMethode: `نقل المطية إلى الشوط رقم ${newLoop?.number ?? 'غير معروف'} - ${loopWithEvent.event?.name || 'غير معروف'} (الفئة: ${translateAge(newLoop?.age) ?? '؟'} - ${translateSex(newLoop?.sex)})`,
        },
        });
      }
    });

    return NextResponse.json({ message: 'تم نقل المطية إلى الشوط الجديد بنجاح' });

  } catch (error) {
    console.error('Error transferring camel to new loop:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء نقل المطية إلى الشوط الجديد' },
      { status: 500 }
    );
  }
}
