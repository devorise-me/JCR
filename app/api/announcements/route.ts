import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeExpired = searchParams.get("includeExpired") === "true";
    const includeHidden = searchParams.get("includeHidden") === "true";

    let whereClause: any = {};
    
    if (!includeHidden) {
      whereClause.isVisible = true;
    }

    if (!includeExpired) {
      whereClause.OR = [
        { expiryDate: null },
        { expiryDate: { gte: new Date() } }
      ];
    }

    const announcements = await db.announcement.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
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

    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, content, expiryDate, authorId, isVisible, attachmentUrl } = await req.json();
    
    if (!title || !content || !authorId) {
      return NextResponse.json({ error: 'Missing required fields: title, content, authorId' }, { status: 400 });
    }

    // Verify the author exists and has permission
    const author = await db.user.findUnique({
      where: { id: authorId },
      select: { role: true },
    });

    if (!author || (author.role !== 'ADMIN' && author.role !== 'SUPERVISOR')) {
      return NextResponse.json({ error: 'Unauthorized to create announcements' }, { status: 403 });
    }

    const announcement = await db.announcement.create({
      data: {
        title,
        content,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        authorId,
        isVisible: isVisible !== undefined ? isVisible : true,
        attachmentUrl: attachmentUrl || null,
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

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}

