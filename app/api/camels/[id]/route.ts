// app/api/camels/[userId]/route.ts
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

// تعطيل التخزين المؤقت وجعل الاستجابة ديناميكية
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const JWT_SECRET = process.env.JWT_SECRET || "defualt-secret-key";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.pathname.split("/").pop();

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    // Determine caller role from Authorization header
    const authHeader = (request as any).headers?.get?.("Authorization");
    let isAdminOrSupervisor = false;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        if (decoded?.id) {
          const me = await db.user.findUnique({ where: { id: decoded.id }, select: { role: true } });
          if (me && (me.role === "ADMIN" || me.role === "SUPERVISOR")) {
            isAdminOrSupervisor = true;
          }
        }
      } catch {
        // ignore token errors → treated as public
      }
    }

    const camels = await fetchCamels(userId, { includeDisabled: isAdminOrSupervisor });
    return NextResponse.json(camels);
  } catch (error) {
    console.error("Error fetching camels:", error);
    return NextResponse.json(
      { error: "Error fetching camels" },
      { status: 500 }
    );
  }
}

async function fetchCamels(userId: string, opts?: { includeDisabled?: boolean }) {
  try {
    const where: any = opts?.includeDisabled ? { ownerId: userId } : { ownerId: userId, disabled: false };
    const camels = await db.camel.findMany({
      where,
    });
    return camels;
  } catch (error) {
    console.error("Error fetching camels:", error);
    throw new Error("Error fetching camels");
  }
}

