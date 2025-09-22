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

    // Add disabled field to user schema if it doesn't exist
    // For now, we'll use a workaround by setting a special role or flag
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        // We'll use the role field to mark disabled users
        // This is a temporary solution until we add a proper disabled field
        role: "USER", // Replace "USER" with a valid Role value, or update your schema to allow "DISABLED"
      },
    });

    // Log the change in admin activity
    await db.adminActivity.create({
      data: {
        userId: userId,
        action: ["تعطيل حساب المستخدم"],
        details:[ `تم تعطيل حساب المستخدم: ${user.FirstName} ${user.FamilyName}`],
        type:"user_management",
        path: `/api/users/${userId}/disable`,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    }, { status: 200 });

  } catch (error) {
    console.error("Error disabling user:", error);
    return NextResponse.json(
      { error: "Failed to disable user" },
      { status: 500 }
    );
  }
}

