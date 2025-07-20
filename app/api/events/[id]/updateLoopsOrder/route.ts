// app/api/events/[eventId]/updateLoopsOrder/route.ts
import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key";

interface LoopRankUpdate {
    id: string;
    rank: number;
}

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    
    try {
        const { id } = params;
        
        // Get request data - array of loop updates with id and rank
        const loopUpdates: LoopRankUpdate[] = await req.json();

        console.log('eventId:', id);
        console.log('loopUpdates:', loopUpdates);

        // Validate request data
        if (!id) {
            return NextResponse.json(
                { error: "معرف الفعالية مطلوب" },
                { status: 400 }
            );
        }

        if (!Array.isArray(loopUpdates) || loopUpdates.length === 0) {
            return NextResponse.json(
                { error: "بيانات ترتيب الأشواط مطلوبة" },
                { status: 400 }
            );
        }

        // Validate each loop update object
        for (const update of loopUpdates) {
            if (!update.id || typeof update.rank !== 'number') {
                return NextResponse.json(
                    { error: "بيانات ترتيب الأشواط غير صحيحة" },
                    { status: 400 }
                );
            }
        }

        // Verify that the event exists
        const event = await db.event.findUnique({
            where: { id: id }
        });

        if (!event) {
            return NextResponse.json(
                { error: "الفعالية غير موجودة" },
                { status: 404 }
            );
        }

        // Verify that all loops belong to this event
        const loopIds = loopUpdates.map(update => update.id);
        const loops = await db.loop.findMany({
            where: {
                id: { in: loopIds },
                eventId: id
            }
        });

        if (loops.length !== loopUpdates.length) {
            return NextResponse.json(
                { error: "بعض الأشواط لا تنتمي لهذه الفعالية" },
                { status: 400 }
            );
        }

        // Update loop ranks within a transaction
        await db.$transaction(async (tx) => {
            for (const update of loopUpdates) {
                await tx.loop.update({
                    where: { id: update.id },
                    data: { rank: update.rank }
                });
            }
        });

        // Fetch updated loops to return
        const updatedLoops = await db.loop.findMany({
            where: {
                id: { in: loopIds }
            },
            orderBy: { rank: 'asc' }
        });

        return NextResponse.json({
            message: 'تم تحديث ترتيب الأشواط بنجاح',
            loops: updatedLoops
        });

    } catch (error) {
        console.error('Error updating loop order:', error);
        
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json(
                { error: "رمز المصادقة غير صحيح" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: 'حدث خطأ أثناء تحديث ترتيب الأشواط' },
            { status: 500 }
        );
    }
}