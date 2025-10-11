import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const items = await db.ads.findMany({
      orderBy: [
        { isPinned: 'desc' },
        { startDate: 'desc' }
      ],
      include: {
        User: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, image, startDate, endDate, authorId, isPinned } = await req.json();
    if (!title || !description || !startDate || !endDate || !authorId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const item = await db.ads.create({
      data: {
        title,
        description,
        image,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        author_id: authorId,
        isPinned: isPinned || false,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create ad' }, { status: 500 });
  }
}


