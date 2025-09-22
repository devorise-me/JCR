import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";
    const includeExpired = searchParams.get("includeExpired") === "true";

    let whereClause: any = {};
    
    if (!includeInactive) {
      whereClause.isActive = true;
    }

    if (!includeExpired) {
      whereClause.endDate = {
        gte: new Date(),
      };
    }

    const ads = await db.ads.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      include: {
        author: {
          select: {
            FirstName: true,
            FamilyName: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json(ads);
  } catch (error) {
    console.error('Error fetching ads:', error);
    return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, imageUrl, startDate, endDate, isActive, authorId } = await req.json();
    
    if (!title || !description || !authorId) {
      return NextResponse.json({ error: 'Missing required fields: title, description, authorId' }, { status: 400 });
    }

    // Verify the author exists and has permission
    const author = await db.user.findUnique({
      where: { id: authorId },
      select: { role: true },
    });

    if (!author || (author.role !== 'ADMIN' && author.role !== 'SUPERVISOR')) {
      return NextResponse.json({ error: 'Unauthorized to create ads' }, { status: 403 });
    }

    const ad = await db.ads.create({
      data: {
        title,
        description,
        imageUrl: imageUrl || null,
        date: new Date(),
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: isActive !== undefined ? isActive : true,
        author_id: authorId,
      },
      include: {
        author: {
          select: {
            FirstName: true,
            FamilyName: true,
            username: true,
          },
        },
      },
    });

    // Log the action
    await db.adminActivity.create({
      data: {
        userId: authorId,
        action: "إنشاء إعلان جديد",
        details: `تم إنشاء إعلان جديد: ${title}`,
        timestamp: new Date(),
      },
    });

    return NextResponse.json(ad, { status: 201 });
  } catch (error) {
    console.error('Error creating ad:', error);
    return NextResponse.json({ error: 'Failed to create ad' }, { status: 500 });
  }
}


