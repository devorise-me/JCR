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
    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Enable the user by setting role back to USER
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        role: "USER",
      },
    });

    // Log the change in admin activity
    await db.adminActivity.create({
      data: {
        userId: userId,
        action: "تفعيل حساب المستخدم",
        details: `تم تفعيل حساب المستخدم: ${user.FirstName} ${user.FamilyName}`,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    }, { status: 200 });

  } catch (error) {
    console.error("Error enabling user:", error);
    return NextResponse.json(
      { error: "Failed to enable user" },
      { status: 500 }
    );
  }
}

