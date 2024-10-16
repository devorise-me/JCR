import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// تعطيل التخزين المؤقت وجعل الاستجابة ديناميكية
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: Request,
  { params }: { params: { eventId: string; loopId: string } }
) {
  const { searchParams } = new URL(req.url);
  const { loopId } = params;
  const userId = searchParams.get("userId");

  try {
    let registeredCamels;

    if (userId) {
      registeredCamels = await db.camelLoop.findMany({
        where: {
          loopId: String(loopId),
          camel: {
            ownerId: String(userId),
          },
        },
        include: {
          camel: {
            include: {
              owner: {
                select: {
                  id: true,
                  FirstName: true,
                  FatherName: true,
                  GrandFatherName: true,
                  FamilyName: true,
                  IBAN: true,
                  bankName: true,
                  swiftCode: true,
                  NationalID: true, // إضافة NationalID
                },
              },
            },
          },
        },
      });
    } else {
      registeredCamels = await db.camelLoop.findMany({
        where: {
          loopId: String(loopId),
        },
        include: {
          camel: {
            include: {
              owner: {
                select: {
                  id: true,
                  FirstName: true,
                  FatherName: true,
                  GrandFatherName: true,
                  FamilyName: true,
                  IBAN: true,
                  bankName: true,
                  swiftCode: true,
                  NationalID: true, // إضافة NationalID
                },
              },
            },
          },
        },
      });
    }

    const camels = registeredCamels.map((camelLoop) => ({
      id: camelLoop.camel.id,
      name: camelLoop.camel.name,
      age: camelLoop.camel.age,
      sex: camelLoop.camel.sex,
      camelID: camelLoop.camel.camelID, // إضافة camelID (رقم الشريحة)
      IBAN: camelLoop.camel.owner?.IBAN || "N/A",
      bankName: camelLoop.camel.owner?.bankName || "N/A",
      ownerId: camelLoop.camel.owner?.id || "N/A",
      swiftCode: camelLoop.camel.owner?.swiftCode || "N/A",
      NationalID: camelLoop.camel.owner?.NationalID || "N/A", // إضافة NationalID (الرقم الوطني)
      ownerName: `${camelLoop.camel.owner.FirstName} ${camelLoop.camel.owner.FatherName} ${camelLoop.camel.owner.GrandFatherName} ${camelLoop.camel.owner.FamilyName}`,
    }));

    return NextResponse.json(camels);
  } catch (error) {
    console.error("Error fetching registered camels:", error);
    return NextResponse.json(
      { error: "Error fetching registered camels" },
      { status: 500 }
    );
  }
}
