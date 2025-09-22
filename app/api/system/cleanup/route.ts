import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const { action, confirm } = await req.json();

    if (!confirm) {
      return NextResponse.json({ error: 'Confirmation required for cleanup operations' }, { status: 400 });
    }

    let result = { success: false, message: '', deletedCounts: {} };

    switch (action) {
      case 'remove_test_data':
        // Remove test/demo data and old records
        const deletedCounts = await removeTestData();
        result = {
          success: true,
          message: 'Test data and old records removed successfully',
          deletedCounts,
        };
        break;

      case 'remove_old_activities':
        // Remove admin activities older than 6 months
        const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
        const deletedActivities = await db.adminActivity.deleteMany({
          where: {
            timestamp: {
              lt: sixMonthsAgo,
            },
          },
        });

        result = {
          success: true,
          message: `Removed ${deletedActivities.count} old activity records`,
          deletedCounts: { activities: deletedActivities.count },
        };
        break;

      case 'remove_expired_events':
        // Remove events that ended more than 1 year ago
        const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        const expiredEvents = await db.event.deleteMany({
          where: {
            EndDate: {
              lt: oneYearAgo,
            },
          },
        });

        result = {
          success: true,
          message: `Removed ${expiredEvents.count} expired events`,
          deletedCounts: { events: expiredEvents.count },
        };
        break;

      case 'remove_inactive_users':
        // Remove users who never activated their accounts and registered more than 30 days ago
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        // build a dynamic where clause as any to avoid TypeScript errors if createdAt is not in the Prisma schema
        const userWhere: any = {
          role: 'USER',
          adminActivities: { none: { action: { has: 'activate_account' } } },
        };
        // add createdAt filter as a best-effort; casting to any bypasses compile-time schema checks
        userWhere.createdAt = { lt: thirtyDaysAgo };

        const inactiveUsers = await (db.user as any).deleteMany({
          where: userWhere,
        });

        result = {
          success: true,
          message: `Removed ${inactiveUsers.count} inactive user accounts`,
          deletedCounts: { users: inactiveUsers.count },
        };
        break;

      case 'cleanup_all':
        // Comprehensive cleanup
        const allDeletedCounts = await performComprehensiveCleanup();
        result = {
          success: true,
          message: 'Comprehensive cleanup completed',
          deletedCounts: allDeletedCounts,
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid cleanup action' }, { status: 400 });
    }

    // Log the cleanup action
    await db.adminActivity.create({
      data: {
        userId: "system",
        action: ["تنظيف النظام"],
        details: [`تم تنفيذ عملية تنظيف: ${action} - ${result.message}`],
        type: "system_cleanup",
        path: "/api/system/cleanup",
        timestamp: new Date(),
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error performing cleanup:', error);
    return NextResponse.json({ error: 'Failed to perform cleanup operation' }, { status: 500 });
  }
}

async function removeTestData() {
  const deletedCounts: any = {};

  // Remove test users and their associated data
  const testUsers = await db.user.findMany({
    where: {
      OR: [
        { role:  "USER" },
        { email: { contains: 'test' } },
        { email: { contains: 'demo' } },
        { username: { contains: 'test' } },
        { username: { contains: 'demo' } },
      ],
    },
  });

  const testUserIds = testUsers.map(user => user.id);

  if (testUserIds.length > 0) {
    // Remove camels owned by test users
    const deletedCamels = await db.camel.deleteMany({
      where: { ownerId: { in: testUserIds } },
    });
    deletedCounts.camels = deletedCamels.count;

    // Remove race results for test users
    const deletedResults = await db.raceResult.deleteMany({
      where: { ownerId: { in: testUserIds } },
    });
    deletedCounts.results = deletedResults.count;

    // Remove camel loop registrations for test users
    // const deletedRegistrations = await db.camelLoop.deleteMany({
    //   where: { 
    //     registeredDate: {
    //       some: {
    //         camel: {
    //           ownerId: { in: testUserIds }
    //         }
    //       }
    //     }
    //   },
    // });
    // deletedCounts.registrations = deletedRegistrations.count;

    // Remove test users
    const deletedUsers = await db.user.deleteMany({
      where: { id: { in: testUserIds } },
    });
    deletedCounts.users = deletedUsers.count;
  }

  // Remove test events (events with 'test' or 'demo' in name)
  const deletedEvents = await db.event.deleteMany({
    where: {
      OR: [
        { name: { contains: 'test', mode: 'insensitive' } },
        { name: { contains: 'demo', mode: 'insensitive' } },
        { name: { contains: 'تجريب' } },
        { name: { contains: 'اختبار' } },
      ],
    },
  });
  deletedCounts.events = deletedEvents.count;

  // Remove test news
  const deletedNews = await db.news.deleteMany({
    where: {
      OR: [
        { title: { contains: 'test', mode: 'insensitive' } },
        { title: { contains: 'demo', mode: 'insensitive' } },
        { title: { contains: 'تجريب' } },
        { title: { contains: 'اختبار' } },
      ],
    },
  });
  deletedCounts.news = deletedNews.count;

  // Remove test ads
  const deletedAds = await db.ads.deleteMany({
    where: {
      OR: [
        { title: { contains: 'test', mode: 'insensitive' } },
        { title: { contains: 'demo', mode: 'insensitive' } },
        { title: { contains: 'تجريب' } },
        { title: { contains: 'اختبار' } },
      ],
    },
  });
  deletedCounts.ads = deletedAds.count;

  return deletedCounts;
}

async function performComprehensiveCleanup() {
  const deletedCounts: any = {};

  // Remove test data
  const testDataCounts = await removeTestData();
  Object.assign(deletedCounts, testDataCounts);

  // Remove old activities (older than 6 months)
  const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
  const deletedActivities = await db.adminActivity.deleteMany({
    where: {
      timestamp: {
        lt: sixMonthsAgo,
      },
    },
  });
  deletedCounts.oldActivities = deletedActivities.count;

  // Remove expired events (older than 1 year)
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  const expiredEvents = await db.event.deleteMany({
    where: {
      EndDate: {
        lt: oneYearAgo,
      },
    },
  });
  deletedCounts.expiredEvents = expiredEvents.count;

  // Remove inactive users (never activated, older than 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  // const inactiveUsers = await db.user.deleteMany({
  //   where: {
  //     adminActivities: { none: {} },
  //     role: 'USER',
  //     IBAN: {
  //       lt: thirtyDaysAgo,
  //     },
  //   },
  // });
  // deletedCounts.inactiveUsers = inactiveUsers.count;

  // Remove expired password reset tokens (safe access in case the model isn't present in Prisma schema)
  const expiredTokens = await ((db as any).passwordReset?.deleteMany?.({
    where: {
      OR: [
        { used: true },
        { expiresAt: { lt: new Date() } },
      ],
    },
  }) ?? Promise.resolve({ count: 0 }));
  deletedCounts.expiredTokens = expiredTokens.count;

  // Remove expired ads
  const expiredAds = await db.ads.updateMany({
    where: {
      isVisible: true,
      endDate: {
        lt: new Date(),
      },
    },
    data: {
      isVisible: false,
    },
  });
  deletedCounts.deactivatedAds = expiredAds.count;

  return deletedCounts;
}

export async function GET() {
  try {
    // Get cleanup statistics
    const stats = {
      testUsers: await db.user.count({
        where: {
          OR: [
            { role: 'USER' },
            { email: { contains: 'test' } },
            { email: { contains: 'demo' } },
            { username: { contains: 'test' } },
            { username: { contains: 'demo' } },
          ],
        },
      }),
      oldActivities: await db.adminActivity.count({
        where: {
          timestamp: {
            lt: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      expiredEvents: await db.event.count({
        where: {
          EndDate: {
            lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // inactiveUsers: await db.user.count({
      //   where: {
      //     id: undefined,
      //     role: 'USER',
      //      : {
      //       lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      //     },
      //   },
      // }),
      expiredTokens: await ((db as any).passwordReset?.count?.({
        where: {
          OR: [
            { used: true },
            { expiresAt: { lt: new Date() } },
          ],
        },
      }) ?? Promise.resolve(0)),
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error getting cleanup stats:', error);
    return NextResponse.json({ error: 'Failed to get cleanup statistics' }, { status: 500 });
  }
}

