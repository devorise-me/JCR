// app/api/loops/transfer/route.ts
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
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

        if (!decoded?.id) {
            return NextResponse.json(
                { error: "الرجاء تسجيل الدخول" },
                { status: 401 }
            );
        }

        // Get request data
        const { camelId, newLoopId } = await req.json();

        console.log('camelId:', camelId);
        console.log('newLoopId:', newLoopId);

        // Validate request data
        if (!camelId || !newLoopId) {
            return NextResponse.json(
                { error: "البيانات المطلوبة غير مكتملة" },
                { status: 400 }
            );
        }

        // Get camel and new loop details to validate compatibility
        const [camel, newLoop] = await Promise.all([
            db.camel.findUnique({
                where: { id: camelId },
            }),
            db.loop.findUnique({
                where: { id: newLoopId },
                include: {
                    CamelLoop: true, // Include registered camels to check capacity
                }
            })
        ]);

        // Validate camel exists
        if (!camel) {
            return NextResponse.json(
                { error: "المطية غير موجودة" },
                { status: 404 }
            );
        }

        // Validate new loop exists
        if (!newLoop) {
            return NextResponse.json(
                { error: "الشوط غير موجود" },
                { status: 404 }
            );
        }

        // Validate age and sex compatibility
        if (camel.age !== newLoop.age || camel.sex !== newLoop.sex) {
            return NextResponse.json(
                { error: "المطية غير متوافقة مع متطلبات الشوط" },
                { status: 400 }
            );
        }

        // Check loop capacity
        const registeredCount = await db.camelLoop.count({
            where: { loopId: newLoopId }
        });

        if (registeredCount >= newLoop.capacity) {
            return NextResponse.json(
                { error: "الشوط ممتلئ" },
                { status: 400 }
            );
        }

        // Get current loop registration
        const currentRegistration = await db.camelLoop.findFirst({
            where: { camelId }
        });

        // Perform the transfer within a transaction
        await db.$transaction(async (tx) => {
            // Delete current registration if it exists
            if (currentRegistration) {
                await tx.camelLoop.delete({
                    where: { id: currentRegistration.id }
                });
            }

            // Create new registration
            await tx.camelLoop.create({
                data: {
                    camelId,
                    loopId: newLoopId,
                }
            });
        });

        return NextResponse.json({ message: 'تم نقل المطية إلى الشوط الجديد بنجاح' });

    } catch (error) {
        console.error('Error transferring camel to new loop:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء نقل المطية إلى الشوط الجديد' },
            { status: 500 }
        );
    }
}