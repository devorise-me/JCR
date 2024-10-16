import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// تعطيل التخزين المؤقت وجعل الاستجابة ديناميكية
export const dynamic = 'force-dynamic';
export const revalidate = 0;
const prisma = new PrismaClient();

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get('query') || '';

  try {
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: query,
          mode: 'insensitive', // البحث غير حساس لحالة الأحرف
        },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: 'فعالية خطأ أثناء البحث' }, { status: 500 });
  }
}
