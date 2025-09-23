import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const announcement = await db.announcement.findUnique({
      where: { id: parseInt(id) },
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

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Error fetching announcement:', error);
    return NextResponse.json({ error: 'Failed to fetch announcement' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { title, content, expiryDate, isVisible, attachmentUrl } = await req.json();

    const announcement = await db.announcement.update({
      where: { id: parseInt(id) },
      data: {
        title,
        content,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isVisible,
        attachmentUrl: attachmentUrl || null,
        updatedAt: new Date(),
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
        userId: announcement.authorId,
        action: "تعديل إعلان",
        details: `تم تعديل الإعلان: ${title}`,
        timestamp: new Date(),
      },
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Error updating announcement:', error);
    return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const announcement = await db.announcement.findUnique({
      where: { id: parseInt(id) },
      select: { title: true, authorId: true },
    });

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    await db.announcement.delete({
      where: { id: parseInt(id) },
    });

    // Log the action
    await db.adminActivity.create({
      data: {
        userId: announcement.authorId,
        action: "حذف إعلان",
        details: `تم حذف الإعلان: ${announcement.title}`,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
  }
} */

