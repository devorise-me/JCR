import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';

async function getUserFromSession(): Promise<{ id: string; role: string | null } | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;
    
    // Get user role from database
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true }
    });
    
    return user;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    // Only allow ADMIN or SUPERVISOR to be recorded
    if (user.role !== 'ADMIN' && user.role !== 'SUPERVISOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { type, path, element, meta } = await req.json();
    if (!type || !path) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    const item = await (db as any).adminActivity.create({
      data: { userId: user.id, type, path, element: element || null, meta: meta || null },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to record activity' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const q = url.searchParams.get('q')?.trim();

    const baseWhere: any = {};
    // If not admin/supervisor, restrict to own
    if (!(user.role === 'ADMIN' || user.role === 'SUPERVISOR')) {
      baseWhere.userId = user.id;
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
