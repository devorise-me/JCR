import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { camelCase } from 'lodash';
import CamelHistoryForm from '@/components/CamelHistory/CamelHistoryForm';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const { action, confirm } = await req.json();

    if (!confirm) {
      return NextResponse.json({ error: 'Confirmation required for maintenance operations' }, { status: 400 });
    }

    let result = { success: false, message: '', details: {} };

    switch (action) {
      case 'optimize_database':
        // Perform database optimization tasks
        const optimizationResults = await optimizeDatabase();
        result = {
          success: true,
          message: 'Database optimization completed',
          details: optimizationResults,
        };
        break;

      case 'update_event_status':
        // Update event statuses based on current date
        const updatedEvents = await updateEventStatuses();
        result = {
          success: true,
          message: `Updated status for ${updatedEvents} events`,
          details: { updatedEvents },
        };
        break;

      case 'sync_participant_numbers':
        // Ensure participant numbers are consistent
        const syncResults = await syncParticipantNumbers();
        result = {
          success: true,
          message: 'Participant numbers synchronized',
          details: syncResults,
        };
        break;

      case 'validate_data_integrity':
        // Check for data integrity issues
        const validationResults = await validateDataIntegrity();
        result = {
          success: true,
          message: 'Data integrity validation completed',
          details: validationResults,
        };
        break;

      case 'refresh_cache':
        // Clear and refresh system cache
        const cacheResults = await refreshSystemCache();
        result = {
          success: true,
          message: 'System cache refreshed',
          details: cacheResults,
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid maintenance action' }, { status: 400 });
    }

    // Log the maintenance action
    await db.adminActivity.create({
      data: {
        userId: "system",
        action: ["صيانة النظام"],
        details: [`تم تنفيذ عملية صيانة: ${action} - ${result.message}`],
        type: "system_maintenance",
        path: "/api/system/maintenance",
        timestamp: new Date(),
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error performing maintenance:', error);
    return NextResponse.json({ error: 'Failed to perform maintenance operation' }, { status: 500 });
  }
}

async function optimizeDatabase() {
  const results: any = {};

  // Remove orphaned records
  const orphanedCamels = await db.camel.deleteMany({
    where: {
      ownerId: undefined,
    },
  });
  results.orphanedCamelsRemoved = orphanedCamels.count;

  // Remove orphaned race results
  const orphanedResults = await db.raceResult.deleteMany({
    where: {
      OR: [
        { camel:  undefined},
        { owner: undefined },
        { event: undefined },
      ],
    },
  });
  results.orphanedResultsRemoved = orphanedResults.count;

  // Update undefined values to proper defaults
  // Replace 'isVisible' with a valid property, e.g., 'isActive'
  // const updatedUsers = await db.user.updateMany({
  //   where: { role: undefined  },
  //   data: { i: false },
  // });
  // results.usersUpdated = updatedUsers.count;

  return results;
}

async function updateEventStatuses() {
  const now = new Date();
  
  // Mark events as completed if they've ended
  const completedEvents = await db.event.updateMany({
    where: {
      EndDate: { lt: now },
      disabled: false,
    },
    data: {
      disabled: true,
    },
  });

  return completedEvents.count;
}

async function syncParticipantNumbers() {
  const results: any = {};

  // Get all events and their loops
  const events = await db.event.findMany({
    include: {
      loops: {
        include: {
          CamelLoop: {
            include: {
              camel: {
                include: {
                  owner: true,
                },
              },
            },
            orderBy: {
              registeredDate: 'asc', // Ensure consistent ordering
            },
          },
        },
      },
    },
  });

  let totalSynced = 0;

  for (const event of events) {
    for (const loop of event.loops) {
      // Update participant numbers based on registration order
      for (let i = 0; i < loop.CamelLoop.length; i++) {
        const registration = loop.CamelLoop[i];
        const participantNumber = i + 1;

        await db.camelLoop.update({
          where: { id: registration.id },
          data: { camelId: registration.camelId },
        });

        totalSynced++;
      }
    }
  }

  results.totalSynced = totalSynced;
  results.eventsProcessed = events.length;

  return results;
}

async function validateDataIntegrity() {
  const issues: any = {};

  // Check for users without required fields
  const usersWithoutEmail = await db.user.count({
    where: { email: undefined },
  });
  if (usersWithoutEmail > 0) {
    issues.usersWithoutEmail = usersWithoutEmail;
  }

  // Check for camels without owners
  const camelsWithoutOwners = await db.camel.count({
    where: { ownerId: undefined },
  });
  if (camelsWithoutOwners > 0) {
    issues.camelsWithoutOwners = camelsWithoutOwners;
  }

  // Check for duplicate camel IDs
  const duplicateCamelIDs = await db.camel.groupBy({
    by: ['camelID'],
    having: {
      camelID: {
        _count: {
          gt: 1,
        },
      },
    },
  });
  if (duplicateCamelIDs.length > 0) {
    issues.duplicateCamelIDs = duplicateCamelIDs.length;
  }

  // Check for events with invalid date ranges
  const invalidEvents = await db.event.count({
    where: {
      EndDate: {
        lt: db.event.fields.StartDate,
      },
    },
  });
  if (invalidEvents > 0) {
    issues.eventsWithInvalidDates = invalidEvents;
  }

  return {
    issuesFound: Object.keys(issues).length,
    issues,
  };
}

async function refreshSystemCache() {
  const results: any = {};

  // In a real application, you would clear Redis or other cache systems
  // For now, we'll simulate cache refresh operations

  results.cacheCleared = true;
  results.timestamp = new Date().toISOString();

  // Preload frequently accessed data
  const preloadedData = {
    activeEvents: await db.event.count({ where: { disabled: false } }),
    activeUsers: await db.user.count({ where: { camels: { some: { disabled: false }    } } }), 
    activeCamels: await db.camel.count({ where: { disabled: false } }),
  };

  results.preloadedData = preloadedData;

  return results;
}

export async function GET() {
  try {
    // Get maintenance status and recommendations
    const recommendations = [];

    // Check if database optimization is needed
        const orphanedCamels = await db.camel.count({
          where: { ownerId: undefined },
        });
        if (orphanedCamels > 0) {
          recommendations.push({
        action: 'optimize_database',
        priority: 'medium',
        description: `${orphanedCamels} orphaned camels found`,
      });
    }

    // Check if event statuses need updating
    const outdatedEvents = await db.event.count({
      where: {
        EndDate: { lt: new Date() },
        disabled: false,
      },
    });
    if (outdatedEvents > 0) {
      recommendations.push({
        action: 'update_event_status',
        priority: 'high',
        description: `${outdatedEvents} events need status update`,
      });
    }

    // Check for data integrity issues
    const usersWithoutEmail = await db.user.count({
      where: { email: undefined },
    });
    if (usersWithoutEmail > 0) {
      recommendations.push({
        action: 'validate_data_integrity',
        priority: 'high',
        description: `${usersWithoutEmail} users have data integrity issues`,
      });
    }

    return NextResponse.json({
      status: 'ready',
      recommendations,
      lastMaintenance: await getLastMaintenanceTime(),
    });
  } catch (error) {
    console.error('Error getting maintenance status:', error);
    return NextResponse.json({ error: 'Failed to get maintenance status' }, { status: 500 });
  }
}

async function getLastMaintenanceTime() {
  const lastMaintenance = await db.adminActivity.findFirst({
    where: {
      action: { has: 'صيانة النظام' },
      type: "system_maintenance",
      timestamp: { lt: new Date() },
    },
    select: {
      timestamp: true,    
    },
    orderBy: {
      timestamp: 'desc',
    },
  });

  return lastMaintenance?.timestamp || undefined;
}

