import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Fetch all camel history records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const ownerId = searchParams.get('ownerId') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { camelID: { contains: search, mode: 'insensitive' } },
        { typeOfMethode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (ownerId) {
      whereClause.ownerId = ownerId;
    }

    const [camelHistories, total] = await Promise.all([
      db.camelHistory.findMany({
        where: whereClause,
        include: {
          User: {
            select: {
              id: true,
              FirstName: true,
              FatherName: true,
              GrandFatherName: true,
              FamilyName: true,
              username: true,
              email: true,
            }
          }
        },
        orderBy: {
          Date: 'desc'
        },
        skip,
        take: limit,
      }),
      db.camelHistory.count({ where: whereClause })
    ]);

    return NextResponse.json({
      data: camelHistories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching camel histories:", error);
    return NextResponse.json(
      { error: "Failed to fetch camel histories" },
      { status: 500 }
    );
  }
}

// POST - Create new camel history record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, camelID, age, sex, ownerId, typeOfMethode } = body;

    const camelHistory = await db.camelHistory.create({
      data: {
        name,
        camelID,
        age,
        sex,
        ownerId,
        Date: new Date(),
        typeOfMethode,
      },
      include: {
        User: {
          select: {
            id: true,
            FirstName: true,
            FatherName: true,
            GrandFatherName: true,
            FamilyName: true,
            username: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json(camelHistory, { status: 201 });
  } catch (error) {
    console.error("Error creating camel history:", error);
    return NextResponse.json(
      { error: "Failed to create camel history" },
      { status: 500 }
    );
  }
} 