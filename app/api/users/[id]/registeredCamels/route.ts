import { db } from "@/lib/db";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const userId = params.id;

        // Get all registered camels for the user in a single query
        const registeredCamels = await db.camelLoop.findMany({
            where: {
                camel: {
                    ownerId: userId
                },
                loop:{
                    endRegister:{
                        gt: new Date()
                    }
                }
            },
            include: {
                camel: true,
                loop: {
                    include: {
                        event: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });

        // Transform the data to match your frontend needs
        const transformedData = registeredCamels.map(registration => ({
            id: registration.camel.id.toString(),
            name: registration.camel.name,
            camelID: registration.camel.camelID,
            sex: registration.camel.sex,
            age: registration.camel.age,
            eventName: registration.loop.event.name,
            eventId: registration.loop.event.id,
            loopNumber: registration.loop.number,
            camelLoopId: registration.loopId
        }));

        return Response.json(transformedData);
    } catch (error) {
        console.error("Error fetching registered camels:", error);
        return Response.json({ error: "Failed to fetch registered camels" }, { status: 500 });
    }
}