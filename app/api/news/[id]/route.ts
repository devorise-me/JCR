import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'defualt-secret-key';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: string, role: string };
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    if (!decoded?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Fetch user to check role
    const user = await db.user.findUnique({ where: { id: decoded.id }, select: { id: true, role: true } });
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERVISOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    await db.news.delete({ where: { id } });
    return NextResponse.json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error('Error deleting news:', error);
    return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: string, role: string };
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    if (!decoded?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Fetch user to check role
    const user = await db.user.findUnique({ where: { id: decoded.id }, select: { id: true, role: true } });
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERVISOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    const { title, description, image, startDate, endDate, isPinned } = await req.json();
    if (!title || !description || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const updated = await db.news.update({
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
  } catch (error) {
    console.error('Error updating news:', error);
    return NextResponse.json({ error: 'Failed to update news' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: string, role: string };
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    if (!decoded?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Fetch user to check role
    const user = await db.user.findUnique({ where: { id: decoded.id }, select: { id: true, role: true } });
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERVISOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    const { isVisible } = await req.json();
    if (typeof isVisible !== 'boolean') {
      return NextResponse.json({ error: 'Missing or invalid isVisible' }, { status: 400 });
    }
    const updated = await db.news.update({
      where: { id },
      data: { isVisible },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error toggling news visibility:', error);
    return NextResponse.json({ error: 'Failed to update news visibility' }, { status: 500 });
  }
} 