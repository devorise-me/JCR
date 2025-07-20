import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Fetch all camel history records
export async function GET(request: Request) {
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

// PUT - Update camel history record
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const camelHistoryId = parseInt(id);
    const body = await request.json();
    const { name, camelID, age, sex, ownerId, Date, typeOfMethode } = body;

    if (isNaN(camelHistoryId)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!name || !age || !sex) {
      return NextResponse.json(
        { error: "Name, age, and sex are required" },
        { status: 400 }
      );
    }

    const updatedCamelHistory = await db.camelHistory.update({
      where: { id: camelHistoryId },
      data: {
        name,
        camelID,
        age,
        sex,
        ownerId,
        Date: Date ? new Date(Date) : undefined,
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

    return NextResponse.json(updatedCamelHistory);
  } catch (error) {
    console.error("Error updating camel history:", error);
    return NextResponse.json(
      { error: "Failed to update camel history" },
      { status: 500 }
    );
  }
}

// DELETE - Delete camel history record
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const camelHistoryId = parseInt(id);

    if (isNaN(camelHistoryId)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }

    await db.camelHistory.delete({
      where: { id: camelHistoryId }
    });

    return NextResponse.json(
      { message: "Camel history deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting camel history:", error);
    return NextResponse.json(
      { error: "Failed to delete camel history" },
      { status: 500 }
    );
  }
} 