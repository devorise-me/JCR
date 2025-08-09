import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Single contact page by convention id 'default-contact'
    const page = await db.contactPage.findUnique({ where: { id: 'default-contact' } });
    return NextResponse.json(page || { id: 'default-contact', content: '' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contact page' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { content, authorId } = await req.json();
    if (typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid content' }, { status: 400 });
    }
    const upserted = await db.contactPage.upsert({
      where: { id: 'default-contact' },
      create: { id: 'default-contact', content, author_id: authorId || null },
      update: { content, author_id: authorId || null },
    });
    return NextResponse.json(upserted);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save contact page' }, { status: 500 });
  }
}


