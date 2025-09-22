import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
    try {
        const { eventIds, action } = await request.json();

        if (!Array.isArray(eventIds) || eventIds.length === 0) {
            return NextResponse.json(
                { error: "Invalid event IDs provided" },
                { status: 400 }
            );
        }

        if (action !== 'enable' && action !== 'disable') {
            return NextResponse.json(
                { error: "Invalid action provided" },
                { status: 400 }
            );
        }

        // Update all events in a single transaction
        await db.$transaction(
            eventIds.map((id) =>
                db.event.update({
                    where: { id },
                    data: { disabled: action === 'disable' },
                })
            )
        );

        // Log the action
        await db.adminActivity.create({
            data: {
                userId: "system", // System action
                action: action === 'disable' ? "إخفاء فعاليات" : "إظهار فعاليات",
                details: `تم ${action === 'disable' ? "إخفاء" : "إظهار"} ${eventIds.length} فعالية`,
                timestamp: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            message: `Events ${action}d successfully`
        });
    } catch (error) {
        console.error("Error toggling events:", error);
        return NextResponse.json(
            { error: "Failed to update events" },
            { status: 500 }
        );
    }
}