import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'defualt-secret-key';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit");
    const includeHidden = searchParams.get("includeHidden") === "true";

    let whereClause = {};
    if (!includeHidden) {
      whereClause = { isVisible: true };
    }

    const news = await db.news.findMany({
      where: whereClause,
      orderBy: { date: 'desc' }, // Newest first
      take: limit ? parseInt(limit) : undefined, // No limit by default
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

    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, summary, image, date, startDate, endDate, authorId, isVisible } = await req.json();
    
    if (!title || !description || !authorId) {
      return NextResponse.json({ error: 'Missing required fields: title, description, authorId' }, { status: 400 });
    }

    // Verify the author exists and has permission
    const author = await db.user.findUnique({
      where: { id: authorId },
      select: { role: true },
    });

    if (!author || (author.role !== 'ADMIN' && author.role !== 'SUPERVISOR')) {
      return NextResponse.json({ error: 'Unauthorized to create news' }, { status: 403 });
    }

    const news = await db.news.create({
      data: {
        title,
        description,
        summary: summary || null,
        image: image || null,
        date: date ? new Date(date) : new Date(),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        author_id: authorId,
        isVisible: isVisible !== undefined ? isVisible : true,
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
        action: "إنشاء خبر جديد",
        details: `تم إنشاء خبر جديد: ${title}`,
        timestamp: new Date(),
      },
    });

    return NextResponse.json(news, { status: 201 });
  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json({ error: 'Failed to create news' }, { status: 500 });
  }
} 