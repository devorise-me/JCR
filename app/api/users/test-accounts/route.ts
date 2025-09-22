import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeTest = searchParams.get("includeTest") === "true";
    const testOnly = searchParams.get("testOnly") === "true";

    let whereClause = {};

    if (testOnly) {
      // Only test accounts (emails containing 'test' or usernames containing 'test')
      whereClause = {
        OR: [
          { email: { contains: "test", mode: "insensitive" } },
          { username: { contains: "test", mode: "insensitive" } },
          { FirstName: { contains: "test", mode: "insensitive" } },
        ],
      };
    } else if (!includeTest) {
      // Exclude test accounts
      whereClause = {
        AND: [
          { email: { not: { contains: "test", mode: "insensitive" } } },
          { username: { not: { contains: "test", mode: "insensitive" } } },
          { FirstName: { not: { contains: "test", mode: "insensitive" } } },
        ],
      };
    }

    const users = await db.user.findMany({
      where: whereClause,
      select: {
        id: true,
        FirstName: true,
        FatherName: true,
        GrandFatherName: true,
        FamilyName: true,
        username: true,
        email: true,
        role: true,
        MobileNumber: true,
        NationalID: true,
        _count: {
          select: {
            camels: true,
            RaceResult: true,
          },
        },
      },
      orderBy: {
        FirstName: "asc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, userIds } = await req.json();

    if (!action || !userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { error: "Invalid request. Action and userIds array required." },
        { status: 400 }
      );
    }

    if (action === "markAsTest") {
      // Mark users as test accounts by adding 'test_' prefix to username
      const updates = await Promise.all(
        userIds.map(async (userId: string) => {
          const user = await db.user.findUnique({
            where: { id: userId },
          });

          if (user && !user.username.startsWith("test_")) {
            return db.user.update({
              where: { id: userId },
              data: {
                username: `test_${user.username}`,
              },
            });
          }
          return user;
        })
      );

      // Log the action
      await db.adminActivity.create({
        data: {
          userId: userIds[0], // Use first user ID for logging
          action: "تحديد حسابات تجريبية",
          details: `تم تحديد ${userIds.length} حساب كحسابات تجريبية`,
          timestamp: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Marked ${updates.length} users as test accounts`,
      });
    } else if (action === "deleteTestAccounts") {
      // Delete test accounts that have no associated data
      let deletedCount = 0;
      const errors = [];

      for (const userId of userIds) {
        try {
          const user = await db.user.findUnique({
            where: { id: userId },
            include: {
              camels: true,
              RaceResult: true,
            },
          });

          if (user && user.camels.length === 0 && user.RaceResult.length === 0) {
            await db.user.delete({
              where: { id: userId },
            });
            deletedCount++;
          } else {
            errors.push(`User ${user?.username || userId} has associated data`);
          }
        } catch (error) {
          errors.push(`Failed to delete user ${userId}`);
        }
      }

      // Log the action
      await db.adminActivity.create({
        data: {
          userId: userIds[0],
          action: "حذف حسابات تجريبية",
          details: `تم حذف ${deletedCount} حساب تجريبي من أصل ${userIds.length}`,
          timestamp: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Deleted ${deletedCount} test accounts`,
        errors: errors.length > 0 ? errors : undefined,
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error managing test accounts:", error);
    return NextResponse.json(
      { error: "Failed to manage test accounts" },
      { status: 500 }
    );
  }
}

