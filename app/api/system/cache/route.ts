import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Simple in-memory cache for frequently accessed data
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

function getCacheKey(type: string, params?: any): string {
  return `${type}:${params ? JSON.stringify(params) : 'all'}`;
}

function setCache(key: string, data: any, ttl: number = CACHE_TTL): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}

function getCache(key: string): any | null {
  const entry = cache.get(key) as CacheEntry;
  if (!entry) return null;
  
  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

function clearCache(pattern?: string): number {
  if (!pattern) {
    const size = cache.size;
    cache.clear();
    return size;
  }
  
  let cleared = 0;
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
      cleared++;
    }
  }
  return cleared;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (action === "stats") {
      // Get cache statistics
      const stats = {
        totalEntries: cache.size,
        entries: Array.from(cache.entries()).map(([key, entry]) => ({
          key,
          size: JSON.stringify(entry.data).length,
          age: Date.now() - (entry as CacheEntry).timestamp,
          ttl: (entry as CacheEntry).ttl,
          expired: Date.now() - (entry as CacheEntry).timestamp > (entry as CacheEntry).ttl,
        })),
      };

      return NextResponse.json(stats);
    }

    // Default: return cached data or fetch from database
    const type = searchParams.get("type");
    const cacheKey = getCacheKey(type || "events");
    
    let cachedData = getCache(cacheKey);
    if (cachedData) {
      return NextResponse.json({
        data: cachedData,
        cached: true,
        timestamp: Date.now(),
      });
    }

    // Fetch fresh data based on type
    let freshData;
    switch (type) {
      case "events":
        freshData = await db.event.findMany({
          where: { disabled: false },
          orderBy: { StartDate: 'desc' },
          take: 50,
        });
        break;
      case "news":
        freshData = await db.news.findMany({
          where: { isVisible: true },
          orderBy: { date: 'desc' },
          take: 20,
        });
        break;
      case "ads":
        freshData = await db.ads.findMany({
          where: { 
            isVisible: true,
            endDate: { gte: new Date() },
          },
          orderBy: { date: 'desc' },
          take: 20,
        });
        break;
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // Cache the fresh data
    setCache(cacheKey, freshData);

    return NextResponse.json({
      data: freshData,
      cached: false,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error handling cache request:', error);
    return NextResponse.json({ error: 'Failed to handle cache request' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, pattern } = await req.json();

    switch (action) {
      case "clear":
        const clearedCount = clearCache(pattern);
        
        // Log the cache clear action
                await db.adminActivity.create({
                  data: {
                    userId: "system",
                    action: ["مسح ذاكرة التخزين المؤقت"],
                    details: [`تم مسح ${clearedCount} عنصر من ذاكرة التخزين المؤقت${pattern ? ` (نمط: ${pattern})` : ''}`],
                    path: "/api/system/cache",
                    type: "cache_clear",
                    timestamp: new Date(),
                  },
                });

        return NextResponse.json({
          success: true,
          message: `Cleared ${clearedCount} cache entries`,
          clearedCount,
        });

      case "preload":
        // Preload frequently accessed data
        const preloadTasks = [
          { type: "events", data: await db.event.findMany({ where: { disabled: false }, take: 50 }) },
          { type: "news", data: await db.news.findMany({ where: { isVisible: true }, take: 20 }) },
          { type: "ads", data: await db.ads.findMany({ where: { isVisible: true }, take: 20 }) },
        ];

        let preloadedCount = 0;
        for (const task of preloadTasks) {
          const cacheKey = getCacheKey(task.type);
          setCache(cacheKey, task.data, CACHE_TTL * 2); // Longer TTL for preloaded data
          preloadedCount++;
        }

        return NextResponse.json({
          success: true,
          message: `Preloaded ${preloadedCount} cache entries`,
          preloadedCount,
        });

      case "cleanup":
        // Remove expired cache entries
        let cleanedCount = 0;
        for (const [key, entry] of cache.entries()) {
          const cacheEntry = entry as CacheEntry;
          if (Date.now() - cacheEntry.timestamp > cacheEntry.ttl) {
            cache.delete(key);
            cleanedCount++;
          }
        }

        return NextResponse.json({
          success: true,
          message: `Cleaned up ${cleanedCount} expired cache entries`,
          cleanedCount,
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error performing cache action:', error);
    return NextResponse.json({ error: 'Failed to perform cache action' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const totalEntries = cache.size;
    cache.clear();

    // Log the cache clear action
        await db.adminActivity.create({
          data: {
            userId: "system",
            action: ["مسح جميع ذاكرة التخزين المؤقت"],
            details: [`تم مسح جميع ${totalEntries} عنصر من ذاكرة التخزين المؤقت`],
            path: "/api/system/cache",
            type: "cache_clear",
            timestamp: new Date(),
          },
        });

    return NextResponse.json({
      success: true,
      message: `Cleared all ${totalEntries} cache entries`,
      clearedCount: totalEntries,
    });
  } catch (error) {
    console.error('Error clearing all cache:', error);
    return NextResponse.json({ error: 'Failed to clear cache' }, { status: 500 });
  }
}

