import { NextResponse } from "next/server";
// تعطيل التخزين المؤقت وجعل الاستجابة ديناميكية
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function POST() {
  return NextResponse.json(
    { message: "Signed out successfully" },
    { status: 200 }
  );
}
