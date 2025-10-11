import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'defualt-secret-key';

export async function GET() {
  try {
    const news = await db.news.findMany({
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
    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, image, startDate, endDate, authorId, isPinned } = await req.json();
    if (!title || !description || !startDate || !endDate || !authorId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    // Optionally: check if the user is admin here
    const news = await db.news.create({
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
    return NextResponse.json(news, { status: 201 });
  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json({ error: 'Failed to create news' }, { status: 500 });
  }
} 