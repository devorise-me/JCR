import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const startTime = Date.now();

    // Test database connectivity
    let dbStatus = 'healthy';
    let dbResponseTime = 0;
    try {
      const dbStart = Date.now();
      await db.user.count();
      dbResponseTime = Date.now() - dbStart;
    } catch (error) {
      dbStatus = 'unhealthy';
      console.error('Database health check failed:', error);
    }

    // Get system statistics
    const stats = {
      users: {
        total: await db.user.count(),
        active: await db.user.count({ where: { role: 'USER' } }),
        admins: await db.user.count({ where: { role: 'ADMIN' } }),
      },
      events: {
        total: await db.event.count(),
        active: await db.event.count({
          where: {
            AND: [
              { StartDate: { lte: new Date() } },
              { EndDate: { gte: new Date() } },
            ],
          },
        }),
        upcoming: await db.event.count({
          where: { StartDate: { gt: new Date() } },
        }),
      },
      camels: {
        total: await db.camel.count(),
        active: await db.camel.count({ where: { disabled: false } }),
      },
      results: {
        total: await db.raceResult.count(),
      },
      news: {
        total: await db.news.count(),
        published: await db.news.count({ where: { isVisible: true } }),
      },
      ads: {
        total: await db.ads.count(),
        active: await db.ads.count({ where: { isVisible: true } }),
      },
    };

    // Check for potential issues
    const issues = [];
    
    if (dbStatus === 'unhealthy') {
      issues.push('Database connectivity issues detected');
    }
    
    if (dbResponseTime > 1000) {
      issues.push('Database response time is slow (>1s)');
    }

    // Check for disabled camels (potential bug indicator)
    const disabledCamels = await db.camel.count({ where: { disabled: true } });
    if (disabledCamels > 0) {
      issues.push(`${disabledCamels} camels are currently disabled`);
    }

    // Check for inactive users waiting for activation
    const pendingActivations = await db.user.count({
      where: {
        
        role: 'USER',
        // createdAt: {
        //   gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        // },
      },
    });
    if (pendingActivations > 0) {
      issues.push(`${pendingActivations} users waiting for account activation`);
    }

    // Check for old events that should be completed
    const oldActiveEvents = await db.event.count({
      where: {
        EndDate: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // More than 1 day ago
        },
        disabled: false,
      },
    });
    if (oldActiveEvents > 0) {
      issues.push(`${oldActiveEvents} events should be marked as completed`);
    }

    const totalResponseTime = Date.now() - startTime;

    const healthStatus = {
      status: dbStatus === 'healthy' && issues.length === 0 ? 'healthy' : 'warning',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbStatus,
        responseTime: dbResponseTime,
      },
      performance: {
        responseTime: totalResponseTime,
      },
      statistics: stats,
      issues: issues,
      version: '1.0.0',
    };

    return NextResponse.json(healthStatus);
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

