// import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Helper: check session and role
 */
async function getSessionAndRole() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Unauthenticated", userId: null, role: null };

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return { userId, role: user?.role ?? null };
}

/**
 * GET -> return the current About Us content (from contactPage)
 */
export async function GET() {
  try {
    const about = await db.contactPage.findFirst({
      orderBy: { updatedAt: "desc" },
      include: {
        User: {
          select: {
            FirstName: true,
            FamilyName: true,
            username: true,
          },
        },
      },
    });

    if (!about) {
      return NextResponse.json(
        {
          content: "This is temporary content.",
          author: { name: "Admin" },
          updatedAt: new Date(),
        },
        { status: 200 }
      );
    }

    return NextResponse.json(about, { status: 200 });
  } catch (error) {
    console.error("Error fetching about us:", error);
    return NextResponse.json({ error: "Failed to fetch about us" }, { status: 500 });
  }
}

/**
 * POST -> create About Us (only ADMIN|SUPERVISOR)
 * If you prefer to allow anyone to create, remove role checks.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, isRTL = true, fontSize = "medium", textAlign = "right" } = body;

    if (!content) {
      return NextResponse.json({ error: "Missing required field: content" }, { status: 400 });
    }

    const { userId, role, error } = await getSessionAndRole();
    if (error || !userId) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Only allow ADMIN or SUPERVISOR
    if (role !== "ADMIN" && role !== "SUPERVISOR") {
      return NextResponse.json({ error: "Unauthorized to create about us" }, { status: 403 });
    }

    // If you want a single-about-us record, delete previous and create new (or update existing)
    // Here: create a new contactPage record
    const created = await db.contactPage.create({
      data: {
        id: undefined as any, // let Prisma generate or pass your own id if you want. If schema requires id, adapt it.
        content,
        // If you have author_id column (nullable), set it:
        author_id: userId,
      },
    });

    // Log activity - include required `type` and `path`
    await db.adminActivity.create({
      data: {
        userId,
        type: "CREATE",
        path: "/api/about-us",
        action: "إنشاء صفحة من نحن",
        details: `تم إنشاء محتوى صفحة من نحن (length=${String(content.length)})`,
      },
    });

    return NextResponse.json({ success: true, created }, { status: 201 });
  } catch (error) {
    console.error("Error creating about us:", error);
    return NextResponse.json({ error: "Failed to create about us" }, { status: 500 });
  }
}

/**
 * PUT -> update About Us (only ADMIN|SUPERVISOR)
 * Tries to update most recent contactPage; if none exists, creates one.
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, isRTL = true, fontSize = "medium", textAlign = "right" } = body;

    if (!content) {
      return NextResponse.json({ error: "Missing required field: content" }, { status: 400 });
    }

    const { userId, role, error } = await getSessionAndRole();
    if (error || !userId) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    if (role !== "ADMIN" && role !== "SUPERVISOR") {
      return NextResponse.json({ error: "Unauthorized to update about us" }, { status: 403 });
    }

    // Find the most recent about-us (contactPage)
    const existing = await db.contactPage.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    let result;
    if (existing) {
      result = await db.contactPage.update({
        where: { id: existing.id },
        data: {
          content,
          author_id: userId,
        },
      });
    } else {
      result = await db.contactPage.create({
        data: {
          id: undefined as any,
          content,
          author_id: userId,
        },
      });
    }

    // Log admin activity (required fields included)
    await db.adminActivity.create({
      data: {
        userId,
        type: "UPDATE",
        path: "/api/about-us",
        action: "تحديث صفحة من نحن",
        details: `تم تحديث محتوى صفحة من نحن (length=${String(content.length)})`,
      },
    });

    return NextResponse.json({ message: "About us updated successfully", result }, { status: 200 });
  } catch (error) {
    console.error("Error updating about us:", error);
    return NextResponse.json({ error: "Failed to update about us" }, { status: 500 });
  }
}
