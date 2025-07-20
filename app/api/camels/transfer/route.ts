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

        // Get camel details before transfer
        const camel = await db.camel.findUnique({
            where: { id: camelId },
            include: {
                owner: {
                    select: {
                        FirstName: true,
                        FamilyName: true,
                        username: true
                    }
                }
            }
        });

        if (!camel) {
            return NextResponse.json(
                { error: "المطية غير موجودة" },
                { status: 404 }
            );
        }

        // Get new owner details
        const newOwner = await db.user.findUnique({
            where: { id: newOwnerId },
            select: {
                FirstName: true,
                FamilyName: true,
                username: true
            }
        });

        if (!newOwner) {
            return NextResponse.json(
                { error: "المالك الجديد غير موجود" },
                { status: 404 }
            );
        }

        // Update camel ownership
        await db.camel.update({
            where: { id: camelId },
            data: { ownerId: newOwnerId },
        });

        // Create camel history record for the transfer
        await db.camelHistory.create({
            data: {
                name: camel.name,
                camelID: camel.camelID,
                age: camel.age,
                sex: camel.sex,
                ownerId: newOwnerId,
                Date: new Date(),
                typeOfMethode: `نقل من ${camel.owner?.FirstName || 'غير محدد'} ${camel.owner?.FamilyName || ''} إلى ${newOwner.FirstName} ${newOwner.FamilyName}`,
            },
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