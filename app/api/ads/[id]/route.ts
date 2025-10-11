import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'defualt-secret-key';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const item = await db.ads.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ad' }, { status: 500 });
  }
}

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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const check = await requireAdminOrSupervisor(req);
  if ('error' in check) return check.error;
  const { id } = params;
  await db.ads.delete({ where: { id } });
  return NextResponse.json({ message: 'Ad deleted successfully' });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const check = await requireAdminOrSupervisor(req);
  if ('error' in check) return check.error;
  const { id } = params;
  const { title, description, image, startDate, endDate, isPinned } = await req.json();
  if (!title || !description || !startDate || !endDate) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const updated = await db.ads.update({
    where: { id },
    data: {
      title,
      description,
      image,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isPinned: isPinned || false,
    },
  });
  return NextResponse.json(updated);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const check = await requireAdminOrSupervisor(req);
  if ('error' in check) return check.error;
  const { id } = params;
  const { isVisible } = await req.json();
  if (typeof isVisible !== 'boolean') {
    return NextResponse.json({ error: 'Missing or invalid isVisible' }, { status: 400 });
  }
  const updated = await db.ads.update({ where: { id }, data: { isVisible } });
  return NextResponse.json(updated);
}


