import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "6");
  const searchType = url.searchParams.get("searchType") || "general";
  const searchTerm = url.searchParams.get("search") || "";
  const skip = (page - 1) * limit;

  try {
    let whereClause = {
      role: "USER"
    } as any;

    if (searchType === 'camelId' && searchTerm) {
      // First find the camel owner
      const camel = await db.camel.findUnique({
        where: { camelID: searchTerm },
        select: { ownerId: true }
      });

      console.log(camel)

      if (camel) {
        whereClause = {
          ...whereClause,
          id: camel.ownerId
        };
      } else {
        return NextResponse.json({ users: [], hasMore: false });
      }
    } else if (searchTerm) {
      whereClause = {
        ...whereClause,
        OR: [
          { username: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { FirstName: { contains: searchTerm, mode: 'insensitive' } },
          { FatherName: { contains: searchTerm, mode: 'insensitive' } },
          { GrandFatherName: { contains: searchTerm, mode: 'insensitive' } },
          { FamilyName: { contains: searchTerm, mode: 'insensitive' } },
          { NationalID: { contains: searchTerm, mode: 'insensitive' } },
          { MobileNumber: { contains: searchTerm, mode: 'insensitive' } },
        ],
      };
    }

    const [users, totalCount] = await Promise.all([
      db.user.findMany({
        where: whereClause,
        skip,
        take: limit,
      }),
      db.user.count({
        where: whereClause,
      }),
    ]);

    console.log(users)

    const hasMore = totalCount > skip + limit;

    return NextResponse.json({ users, hasMore });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Error fetching users" }, { status: 500 });
  }
}