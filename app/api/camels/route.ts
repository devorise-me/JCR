import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const camels = await db.camel.findMany({
      include: {
        owner: {
          select: {
            id: true,
            FirstName: true,
            FamilyName: true,
            username: true,
            email: true,
          }
        }
      }
    });
    return NextResponse.json(camels);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch camels" }, { status: 500 });
  }
} 