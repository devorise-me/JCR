import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'defualt-secret-key';

async function requireAdminOrSupervisor(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await db.user.findUnique({ where: { id: decoded.id }, select: { id: true, role: true } });
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERVISOR')) {
      return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    }
    return { user };
  } catch {
    return { error: NextResponse.json({ error: 'Invalid token' }, { status: 401 }) };
  }
}

export async function GET() {
  try {
    // Single contact page by convention id 'default-contact'
    const page = await db.contactPage.findUnique({ where: { id: 'default-contact' } });
    return NextResponse.json(page || { id: 'default-contact', content: '' }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contact page' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const check = await requireAdminOrSupervisor(req);
  if ('error' in check) return check.error;

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


