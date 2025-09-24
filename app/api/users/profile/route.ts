// app/api/users/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ Force Serverless runtime (not Edge)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Use NextAuth session instead of JWT token verification
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized - No valid session" }, { status: 401 });
    }

    // Get user ID from session
    const userId = session.user.id;
    
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized - No user ID in session" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, role: true, FirstName: true, FamilyName: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error in /api/users/profile:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}