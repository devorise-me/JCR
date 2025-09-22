import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;

  try {
    const { camelId } = await req.json();

    if (!camelId) {
      return NextResponse.json(
        { error: "camelId is required" },
        { status: 400 }
      );
    }

    // Find the camel to enable
    const camel = await db.camel.findFirst({
      where: {
        id: parseInt(camelId),
        ownerId: userId,
      },
    });

    if (!camel) {
      return NextResponse.json(
        { error: "Camel not found or not owned by user" },
        { status: 404 }
      );
    }

    // Enable the camel
    const updatedCamel = await db.camel.update({
      where: {
        id: parseInt(camelId),
      },
      data: {
        disabled: false,
      },
      include: {
        owner: {
          select: {
            FirstName: true,
            FamilyName: true,
            username: true,
          },
        },
      },
    });

    // Log the change in camel history
    await db.camelHistory.create({
      data: {
        name: updatedCamel.name,
        camelID: updatedCamel.camelID,
        age: updatedCamel.age,
        sex: updatedCamel.sex,
        ownerId: updatedCamel.ownerId,
        Date: new Date(),
        typeOfMethode: "تفعيل المطية",
      },
    });

    return NextResponse.json({ 
      success: true, 
      camel: updatedCamel 
    }, { status: 200 });

  } catch (error) {
    console.error("Error enabling camel:", error);
    return NextResponse.json(
      { error: "Failed to enable camel" },
      { status: 500 }
    );
  }
}

