// app/api/camels/[userId]/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// تعطيل التخزين المؤقت وجعل الاستجابة ديناميكية
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.pathname.split("/").pop();

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const camels = await fetchCamels(userId);
    return NextResponse.json(camels);
  } catch (error) {
    console.error("Error fetching camels:", error);
    return NextResponse.json(
      { error: "Error fetching camels" },
      { status: 500 }
    );
  }
}

async function fetchCamels(userId: string) {
  try {
    const camels = await db.camel.findMany({
      where: { ownerId: userId },
    });
    return camels;
  } catch (error) {
    console.error("Error fetching camels:", error);
    throw new Error("Error fetching camels");
  }
}

