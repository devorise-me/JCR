import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'defualt-secret-key';

function getUserIdFromAuth(req: NextRequest): string | null {
  const auth = req.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return decoded?.id || null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromAuth(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // Only allow ADMIN or SUPERVISOR to be recorded
    const me = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!me || (me.role !== 'ADMIN' && me.role !== 'SUPERVISOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { type, path, element, meta } = await req.json();
    if (!type || !path) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    const item = await (db as any).adminActivity.create({
      data: { userId, type, path, element: element || null, meta: meta || null },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to record activity' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromAuth(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Determine role to allow admins/supervisors to view all
    const me = await db.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const q = url.searchParams.get('q')?.trim();

    const baseWhere: any = {};
    // If not admin/supervisor, restrict to own
    if (!(me.role === 'ADMIN' || me.role === 'SUPERVISOR')) {
      baseWhere.userId = userId;
    }
    if (q && q.length > 0) {
      baseWhere.user = {
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { FirstName: { contains: q, mode: 'insensitive' } },
          { FamilyName: { contains: q, mode: 'insensitive' } },
        ],
      };
    }

    const items = await (db as any).adminActivity.findMany({
      where: {
        ...baseWhere,
        userId: { not: '1' },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 500),
      include: {
        user: { select: { id: true, username: true, FirstName: true, FamilyName: true, role: true } },
      },
    });
    return NextResponse.json(items);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}


