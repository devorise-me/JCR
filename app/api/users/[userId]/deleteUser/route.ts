import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
// تعطيل التخزين المؤقت وجعل الاستجابة ديناميكية
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function DELETE(request: Request, { params }: { params: { id: string } }) {

  try {
    const { id } = params;

    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    await db.user.delete({
      where: { id },
    });

    return new NextResponse('User deleted successfully', { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return new NextResponse('Error deleting user', { status: 500 });
  }
}
