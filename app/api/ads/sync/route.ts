import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    // Get ads configuration
    const config = await db.adsConfig.findUnique({
      where: { id: 1 },
    });

    if (!config || !config.isEnabled) {
      return NextResponse.json({ error: 'Ads API is not configured or disabled' }, { status: 400 });
    }

    // Fetch ads from external API
    let externalAds = [];
    try {
      const response = await fetch(config.apiendpoint, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      externalAds = await response.json();
    } catch (error) {
      return NextResponse.json({ 
        error: 'Failed to fetch ads from external API',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    // Process and sync ads
    let syncedCount = 0;
    let errors = [];

    for (const externalAd of externalAds) {
      try {
        // Map external ad format to internal format
        const adData = {
          title: externalAd.title || externalAd.name || 'Untitled Ad',
          description: externalAd.description || externalAd.content || '',
          imageUrl: externalAd.imageUrl || externalAd.image || null,
          startDate: externalAd.startDate ? new Date(externalAd.startDate) : new Date(),
          endDate: externalAd.endDate ? new Date(externalAd.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          isActive: externalAd.isActive !== undefined ? externalAd.isActive : true,
          externalId: externalAd.id || externalAd.adId,
          author_id: "system", // System-generated ads
        };

        // Check if ad already exists
        const existingAd = await db.ads.findFirst({
          where: { externalId: adData.externalId },
        });

        if (existingAd) {
          // Update existing ad
          await db.ads.update({
            where: { id: existingAd.id },
            data: {
              title: adData.title,
              description: adData.description,
              imageUrl: adData.imageUrl,
              startDate: adData.startDate,
              endDate: adData.endDate,
              isActive: adData.isActive,
              updatedAt: new Date(),
            },
          });
        } else {
          // Create new ad
          await db.ads.create({
            data: adData,
          });
        }

        syncedCount++;
      } catch (error) {
        errors.push(`Failed to sync ad ${externalAd.id}: ${error}`);
      }
    }

    // Log the sync operation
    await db.adminActivity.create({
      data: {
        userId: "system",
        action: "مزامنة إعلانات خارجية",
        details: `تم مزامنة ${syncedCount} إعلان من API خارجي`,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      syncedCount,
      totalFetched: externalAds.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error syncing ads:', error);
    return NextResponse.json({ error: 'Failed to sync ads' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Get sync status and last sync time
    const config = await db.adsConfig.findUnique({
      where: { id: 1 },
    });

    const lastSyncActivity = await db.adminActivity.findFirst({
      where: { action: "مزامنة إعلانات خارجية" },
      orderBy: { timestamp: 'desc' },
    });

    const externalAdsCount = await db.ads.count({
      where: { author_id: "system" },
    });

    return NextResponse.json({
      isConfigured: !!config,
      isEnabled: config?.isEnabled || false,
      lastSync: lastSyncActivity?.timestamp || null,
      externalAdsCount,
      status: config?.isEnabled ? "ready" : "disabled",
    });
  } catch (error) {
    console.error('Error getting sync status:', error);
    return NextResponse.json({ error: 'Failed to get sync status' }, { status: 500 });
  }
}

