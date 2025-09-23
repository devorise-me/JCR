import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BACKUP_DIR = path.join(process.cwd(), 'backups');

// Ensure backup directory exists
async function ensureBackupDir() {
  if (!existsSync(BACKUP_DIR)) {
    await mkdir(BACKUP_DIR, { recursive: true });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (action === "list") {
      // List available backups
      await ensureBackupDir();
      const fs = require('fs');
      const files = fs.readdirSync(BACKUP_DIR)
        .filter((file: string) => file.endsWith('.json'))
        .map((file: string) => {
          const stats = fs.statSync(path.join(BACKUP_DIR, file));
          return {
            filename: file,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
          };
        })
        .sort((a: any, b: any) => b.created - a.created);

      return NextResponse.json({ backups: files });
    }

    if (action === "download") {
      // Download a specific backup
      const filename = searchParams.get("filename");
      if (!filename) {
        return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
      }

      const backupPath = path.join(BACKUP_DIR, filename);
      if (!existsSync(backupPath)) {
        return NextResponse.json({ error: 'Backup file not found' }, { status: 404 });
      }

      const backupData = await readFile(backupPath, 'utf-8');
      
      return new NextResponse(backupData, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error handling backup request:', error);
    return NextResponse.json({ error: 'Failed to handle backup request' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, includeTestData } = await req.json();

    if (action === "create") {
      await ensureBackupDir();

      // Create comprehensive backup
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup-${timestamp}.json`;

      // Collect all data
      const backupData: any = {
        metadata: {
          version: "1.0",
          created: new Date().toISOString(),
          includeTestData: includeTestData || false,
        },
        users: await db.user.findMany({
          where: includeTestData ? undefined : { role: { not: 'TEST' as any } },
        }),
        events: await db.event.findMany(),
        camels: await db.camel.findMany({
          where: includeTestData ? undefined : { owner: { role: { not: 'TEST' as any } } },
          include: { owner: true },
        }),
        camelLoops: await db.camelLoop.findMany(),
        raceResults: await db.raceResult.findMany(),
        news: await db.news.findMany(),
        ads: await db.ads.findMany(),
        announcements: await db.announcement.findMany(),
        aboutUs: await db.aboutUs.findMany(),
        adminActivity: await db.adminActivity.findMany({
          where: {
            timestamp: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        }),
        adsConfig: await db.adsConfig.findMany(),
      };

      // Calculate statistics
      const stats = {
        totalUsers: backupData.users.length,
        totalEvents: backupData.events.length,
        totalCamels: backupData.camels.length,
        totalResults: backupData.raceResults.length,
        totalNews: backupData.news.length,
        totalAds: backupData.ads.length,
        totalAnnouncements: backupData.announcements.length,
        totalActivities: backupData.adminActivity.length,
      };

      backupData.metadata = { ...backupData.metadata, stats };

      // Save backup file
      const backupPath = path.join(BACKUP_DIR, filename);
      await writeFile(backupPath, JSON.stringify(backupData, null, 2));

      // Log the backup creation
      await db.adminActivity.create({
        data: {
          userId: "system",
          action: ["إنشاء نسخة احتياطية"],
          details: [`تم إنشاء نسخة احتياطية: ${filename} (${stats.totalUsers} مستخدم، ${stats.totalEvents} فعالية)`],
          type: "backup_creation",
          path: "/api/system/backup",
          timestamp: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        filename,
        stats,
        message: "Backup created successfully",
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('backup') as File;
    const restoreMode = formData.get('mode') as string || 'merge';

    if (!file) {
      return NextResponse.json({ error: 'Backup file is required' }, { status: 400 });
    }

    const backupContent = await file.text();
    let backupData;

    try {
      backupData = JSON.parse(backupContent);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid backup file format' }, { status: 400 });
    }

    // Validate backup structure
    if (!backupData.metadata || !backupData.users || !backupData.events) {
      return NextResponse.json({ error: 'Invalid backup file structure' }, { status: 400 });
    }

    const restoredStats = {
      users: 0,
      events: 0,
      camels: 0,
      results: 0,
      news: 0,
      ads: 0,
      announcements: 0,
      errors: [] as string[],
    };

    // Begin transaction for data restoration
    await db.$transaction(async (tx) => {
      try {
        // Clear existing data if full restore
        if (restoreMode === 'replace') {
          await tx.adminActivity.deleteMany();
          await tx.raceResult.deleteMany();
          await tx.camelLoop.deleteMany();
          await tx.camel.deleteMany();
          await tx.event.deleteMany();
          await tx.news.deleteMany();
          await tx.ads.deleteMany();
          await tx.announcement.deleteMany();
          await tx.aboutUs.deleteMany();
          await tx.adsConfig.deleteMany();
          await tx.user.deleteMany({ where: { role: { not: 'ADMIN' } } });
        }

        // Restore users (skip if exists in merge mode)
        for (const user of backupData.users) {
          try {
            if (restoreMode === 'merge') {
              await tx.user.upsert({
                where: { id: user.id },
                update: user,
                create: user,
              });
            } else {
              await tx.user.create({ data: user });
            }
            restoredStats.users++;
          } catch (error) {
            restoredStats.errors.push(`User ${user.id}: ${error}`);
          }
        }

        // Restore events
        for (const event of backupData.events) {
          try {
            if (restoreMode === 'merge') {
              await tx.event.upsert({
                where: { id: event.id },
                update: event,
                create: event,
              });
            } else {
              await tx.event.create({ data: event });
            }
            restoredStats.events++;
          } catch (error) {
            restoredStats.errors.push(`Event ${event.id}: ${error}`);
          }
        }

        // Restore camels
        for (const camel of backupData.camels) {
          try {
            const { owner, ...camelData } = camel;
            if (restoreMode === 'merge') {
              await tx.camel.upsert({
                where: { id: camel.id },
                update: camelData,
                create: camelData,
              });
            } else {
              await tx.camel.create({ data: camelData });
            }
            restoredStats.camels++;
          } catch (error) {
            restoredStats.errors.push(`Camel ${camel.id}: ${error}`);
          }
        }

        // Restore other data similarly...
        if (backupData.news) {
          for (const news of backupData.news) {
            try {
              if (restoreMode === 'merge') {
                await tx.news.upsert({
                  where: { id: news.id },
                  update: news,
                  create: news,
                });
              } else {
                await tx.news.create({ data: news });
              }
              restoredStats.news++;
            } catch (error) {
              restoredStats.errors.push(`News ${news.id}: ${error}`);
            }
          }
        }

        // Continue with other entities...
      } catch (error) {
        throw new Error(`Transaction failed: ${error}`);
      }
    });

    // Log the restoration
    await db.adminActivity.create({
      data: {
        userId: "system",
        action: ["استعادة نسخة احتياطية"],
        details:[ `تم استعادة البيانات (${restoreMode}): ${restoredStats.users} مستخدم، ${restoredStats.events} فعالية`],
        type: "backup_restore",
        path: "/api/system/backup",
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      stats: restoredStats,
      message: "Backup restored successfully",
    });
  } catch (error) {
    console.error('Error restoring backup:', error);
    return NextResponse.json({ error: 'Failed to restore backup' }, { status: 500 });
  }
}

