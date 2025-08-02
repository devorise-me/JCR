import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const loopsWithCamels = await db.loop.findMany({
            where: {
                eventId: id
            },
            select: {
                id: true,
                age: true,
                sex: true,
                number: true,
                eventId: true,
                CamelLoop: {
                    select: {
                        registeredDate:true,
                        camel: {
                            select: {
                                id: true,
                                name: true,
                                age: true,
                                sex: true,
                                camelID: true,
                                owner: {
                                    select: {
                                        id: true,
                                        FirstName: true,
                                        FatherName: true,
                                        GrandFatherName: true,
                                        FamilyName: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        // Transform the data to match the expected format
        const formattedLoops = loopsWithCamels.map(loop => ({
            id: loop.id,
            age: loop.age,
            sex: loop.sex,
            number: loop.number,
            eventId: loop.eventId,
            camels: loop.CamelLoop.map(camelLoop => ({
                id: camelLoop.camel.id.toString(),
                name: camelLoop.camel.name,
                age: camelLoop.camel.age,
                sex: camelLoop.camel.sex,
                camelID: camelLoop.camel.camelID,
                ownerName: `${camelLoop.camel.owner.FirstName} ${camelLoop.camel.owner.FatherName ?? ''} ${camelLoop.camel.owner.GrandFatherName ?? ''} ${camelLoop.camel.owner.FamilyName ?? ''}`,
                ownerId: camelLoop.camel.owner.id,
                registeredDate: camelLoop.registeredDate,
            })),
        }));

        return NextResponse.json(formattedLoops);

    } catch (error) {
        console.error("Error fetching loops:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}