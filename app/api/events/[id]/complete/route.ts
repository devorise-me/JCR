import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // Find the event
    const event = await db.event.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const endDate = new Date(event.EndDate);

    // Check if event has ended
    if (now <= endDate) {
      return NextResponse.json(
        { error: "Event has not ended yet" },
        { status: 400 }
      );
    }

    // Mark event as completed by disabling it
    const updatedEvent = await db.event.update({
      where: { id },
      data: {
        disabled: true,
      },
    });

    // Log the completion
    await db.adminActivity.create({
      data: {
        userId: "system",
        action: ["إكمال فعالية تلقائياً"],
        details:[ `تم إكمال الفعالية تلقائياً: ${event.name} (انتهت في ${endDate.toLocaleDateString()})`],
        
        path: "/api/events/[id]/complete",
        type: "event_completion",
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      event: updatedEvent,
      message: "Event completed successfully",
    });
  } catch (error) {
    console.error("Error completing event:", error);
    return NextResponse.json(
      { error: "Failed to complete event" },
      { status: 500 }
    );
  }
}

// GET endpoint to check and auto-complete expired events
export async function GET() {
  try {
    const now = new Date();

    // Find all active events that have ended
    const expiredEvents = await db.event.findMany({
      where: {
        disabled: false,
        EndDate: {
          lt: now,
        },
      },
    });

    if (expiredEvents.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No expired events found",
        completedCount: 0,
      });
    }

    // Mark all expired events as completed
    const completedEvents = await db.event.updateMany({
      where: {
        id: {
          in: expiredEvents.map(event => event.id),
        },
      },
      data: {
        disabled: true,
      },
    });

    // Log the batch completion
    await db.adminActivity.create({
      data: {
        userId: "system",
        action: ["إكمال فعاليات منتهية تلقائياً"],
        details: [`تم إكمال ${expiredEvents.length} فعالية منتهية تلقائياً`],
        path: "/api/events/complete",
        type: "event_completion",
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Completed ${completedEvents.count} expired events`,
      completedCount: completedEvents.count,
      expiredEvents: expiredEvents.map(event => ({
        id: event.id,
        name: event.name,
        endDate: event.EndDate,
      })),
    });
  } catch (error) {
    console.error("Error auto-completing expired events:", error);
    return NextResponse.json(
      { error: "Failed to auto-complete expired events" },
      { status: 500 }
    );
  }
}

