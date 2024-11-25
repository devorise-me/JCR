import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
export const dynamic = 'force-dynamic';
export const revalidate = 0;
const JWT_SECRET = process.env.JWT_SECRET || "defualt-secret-key";

export async function POST(req: Request) {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

        if (!decoded?.id) {
            return NextResponse.json(
                { error: "الرجاء تسجيل الدخول" },
                { status: 401 }
            );
        }

        const { camelId, newOwnerId } = await req.json();

        console.log('camelId:', camelId);
        console.log('newOwnerId:', newOwnerId);

        await db.camel.update({
            where: { id: camelId },
            data: { ownerId: newOwnerId },
        });

        return NextResponse.json({ message: 'تم نقل المطية بنجاح' });
    } catch (error) {
        console.error('Error transferring camel:', error);
        return NextResponse.json(
            { message: 'حدث خطأ أثناء نقل المطية' },
            { status: 500 }
        );
    }
}