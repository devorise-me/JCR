import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const items = await db.ads.findMany({ orderBy: { date: 'desc' } });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, date, authorId } = await req.json();
    if (!title || !description || !date || !authorId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const item = await db.ads.create({
      data: { title, description, date: new Date(date), author_id: authorId },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create ad' }, { status: 500 });
  }
}


