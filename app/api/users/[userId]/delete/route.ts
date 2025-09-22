import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;

  try {
    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        camels: true,
        RaceResult: true,
        news: true,
        ads: true,
        contactPages: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has associated data that would prevent deletion
    const hasAssociatedData = 
      user.camels.length > 0 || 
      user.RaceResult.length > 0 || 
      user.news.length > 0 || 
      user.ads.length > 0 || 
      user.contactPages.length > 0;

    if (hasAssociatedData) {
      return NextResponse.json(
        { 
          error: "Cannot delete user with associated data. Consider disabling instead.",
          details: {
            camels: user.camels.length,
            raceResults: user.RaceResult.length,
            news: user.news.length,
            ads: user.ads.length,
            contactPages: user.contactPages.length,
          }
        },
        { status: 400 }
      );
    }

    // Log the deletion before actually deleting
    await db.adminActivity.create({
      data: {
        userId: userId,
        action: "حذف حساب المستخدم",
        details: `تم حذف حساب المستخدم: ${user.FirstName} ${user.FamilyName} (${user.email})`,
        timestamp: new Date(),
      },
    });

    // Delete the user
    await db.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ 
      success: true, 
      message: "User deleted successfully" 
    }, { status: 200 });

  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}

