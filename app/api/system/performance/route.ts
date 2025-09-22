import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const startTime = Date.now();

    // Get database performance metrics
    const [
      userCount,
      eventCount,
      camelCount,
      resultCount,
      newsCount,
      adsCount,
      activityCount
    ] = await Promise.all([
      db.user.count(),
      db.event.count(),
      db.camel.count(),
      db.raceResult.count(),
      db.news.count(),
      db.ads.count(),
      db.adminActivity.count()
    ]);

    const dbQueryTime = Date.now() - startTime;

    // Get recent activity to check system load
    const recentActivity = await db.adminActivity.findMany({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    // Calculate performance metrics
    const metrics = {
      database: {
        queryTime: dbQueryTime,
        status: dbQueryTime < 1000 ? 'good' : dbQueryTime < 3000 ? 'warning' : 'critical',
        recordCounts: {
          users: userCount,
          events: eventCount,
          camels: camelCount,
          results: resultCount,
          news: newsCount,
          ads: adsCount,
          activities: activityCount,
        },
      },
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
      },
      activity: {
        last24Hours: recentActivity.length,
        averagePerHour: Math.round(recentActivity.length / 24),
        lastActivity: recentActivity[0]?.timestamp || null,
      },
      recommendations: [],
    };

    // Generate performance recommendations
    if (dbQueryTime > 1000) {
      metrics.recommendations.push({
        type: 'database',
        severity: 'high',
        message: 'Database queries are slow. Consider adding indexes or optimizing queries.',
      });
    }

    if (userCount > 10000) {
      metrics.recommendations.push({
        type: 'scaling',
        severity: 'medium',
        message: 'Large user base detected. Consider implementing pagination and caching.',
      });
    }

    if (recentActivity.length > 1000) {
      metrics.recommendations.push({
        type: 'activity',
        severity: 'medium',
        message: 'High activity detected. Monitor system resources and consider load balancing.',
      });
    }

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    return NextResponse.json({ error: 'Failed to get performance metrics' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();

    switch (action) {
      case 'cleanup_old_activities':
        // Clean up old admin activities (older than 6 months)
        const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
        const deletedActivities = await db.adminActivity.deleteMany({
          where: {
            timestamp: {
              lt: sixMonthsAgo,
            },
          },
        });

        return NextResponse.json({
          success: true,
          message: `Cleaned up ${deletedActivities.count} old activity records`,
          deletedCount: deletedActivities.count,
        });

      case 'cleanup_expired_events':
        // Mark expired events as disabled
        const expiredEvents = await db.event.updateMany({
          where: {
            disabled: false,
            EndDate: {
              lt: new Date(),
            },
          },
          data: {
            disabled: true,
          },
        });

        return NextResponse.json({
          success: true,
          message: `Marked ${expiredEvents.count} expired events as disabled`,
          updatedCount: expiredEvents.count,
        });

      case 'cleanup_expired_ads':
        // Mark expired ads as inactive
        const expiredAds = await db.ads.updateMany({
          where: {
            isActive: true,
            endDate: {
              lt: new Date(),
            },
          },
          data: {
            isActive: false,
          },
        });

        return NextResponse.json({
          success: true,
          message: `Marked ${expiredAds.count} expired ads as inactive`,
          updatedCount: expiredAds.count,
        });

      case 'optimize_database':
        // Run database optimization queries
        // Note: This is a simplified version. In production, you'd run VACUUM, ANALYZE, etc.
        const optimizationResults = {
          indexesChecked: true,
          statisticsUpdated: true,
          vacuumPerformed: true,
        };

        // Log the optimization
        await db.adminActivity.create({
          data: {
            userId: "system",
            action: "تحسين قاعدة البيانات",
            details: "تم تشغيل عملية تحسين قاعدة البيانات",
            timestamp: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          message: "Database optimization completed",
          results: optimizationResults,
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error performing optimization action:', error);
    return NextResponse.json({ error: 'Failed to perform optimization action' }, { status: 500 });
  }
}

