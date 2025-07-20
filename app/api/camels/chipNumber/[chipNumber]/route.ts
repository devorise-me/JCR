// app/api/camels/chipNumber/[chipNumber]/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// تعطيل التخزين المؤقت وجعل الاستجابة ديناميكية
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { chipNumber: string } }
) {
  const { chipNumber } = params;

  if (!chipNumber) {
    return NextResponse.json({ error: "Chip number is required" }, { status: 400 });
  }

  try {
    const camel = await fetchCamelByChipNumber(chipNumber);
    return NextResponse.json(camel);
  } catch (error) {
    console.error("Error fetching camel:", error);
    return NextResponse.json(
      { error: "Error fetching camel" },
      { status: 500 }
    );
  }
}

async function fetchCamelByChipNumber(chipNumber: string) {
  try {
    const camel = await db.camel.findUnique({
      where: { camelID: chipNumber },
      include: {
        owner: {
          select: {
            id: true,
            FirstName: true,
            FatherName: true,
            GrandFatherName: true,
            FamilyName: true,
            username: true,
            email: true,
            NationalID: true,
            MobileNumber: true,
            IBAN: true,
            swiftCode: true,
            bankName: true,
          }
        },
        loops: {
          include: {
            loop: {
              include: {
                event: true
              }
            }
          }
        },
        RaceResult: {
          include: {
            event: true,
            loop: true
          }
        }
      }
    });

    if (!camel) {
      return NextResponse.json({ error: "Camel not found" }, { status: 404 });
    }

    return camel;
  } catch (error) {
    console.error("Error fetching camel by chip number:", error);
    throw new Error("Error fetching camel by chip number");
  }
} 