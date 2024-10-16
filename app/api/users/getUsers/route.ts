import { db } from "@/lib/db"; 
import { NextResponse } from "next/server";
// تعطيل التخزين المؤقت وجعل الاستجابة ديناميكية
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "6"); 
  const skip = (page - 1) * limit;

  try {
    const [users, totalCount] = await Promise.all([
      db.user.findMany({
        where: {
          role: "USER",
        },
        skip,
        take: limit,
      }),
      db.user.count({
        where: {
          role: "USER",
        },
      }),
    ]);

    const hasMore = totalCount > skip + limit;

    return NextResponse.json({ users, hasMore });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Error fetching users" }, { status: 500 });
  }
}
