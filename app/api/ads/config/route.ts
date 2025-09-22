import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // Get ads configuration from environment or database
    const config = {
      apiKey: process.env.ADS_API_KEY ? "***configured***" : null,
      apiEndpoint: process.env.ADS_API_ENDPOINT || null,
      isEnabled: process.env.ADS_API_ENABLED === "true",
      status: process.env.ADS_API_KEY ? "configured" : "not_configured",
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching ads config:', error);
    return NextResponse.json({ error: 'Failed to fetch ads configuration' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { apiKey, apiEndpoint, isEnabled, cloudName } = await req.json();
    
    if (!apiKey || !apiEndpoint) {
      return NextResponse.json({ error: 'API key and endpoint are required' }, { status: 400 });
    }

    // In a real application, you would store these securely
    // For now, we'll create a configuration record in the database
    const config = await db.adsConfig.
    upsert({
  where: { id: 1 },
  update: {
    apiKey,
    apiEndpoint,
    isEnabled: isEnabled ?? true,
    updatedAt: new Date(),
  },
  create: {
    id: 1,
    apiKey,
    apiSecret: "",   // <-- required, replace "" with the actual value or fetch from req/json/env
    cloudName: cloudName,   // <-- required
    apiEndpoint,
    isEnabled: isEnabled ?? true,
  },
});
    // Test the API connection
    let testResult = { success: false, message: "API key saved but not tested" };
    
    if (isEnabled) {
      try {
        // Test API connection (replace with actual ads API test)
        const testResponse = await fetch(apiEndpoint, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (testResponse.ok) {
          testResult = { success: true, message: "API connection successful" };
        } else {
          testResult = { success: false, message: `API test failed: ${testResponse.status}` };
        }
      } catch (error) {
        testResult = { success: false, message: `API test error: ${error}` };
      }
    }

    // Log the configuration change
    await db.adminActivity.create({
      data: {
        userId: "system",
        action: "تكوين API الإعلانات",
        details: `تم ${config.isEnabled ? "تفعيل" : "تعطيل"} API الإعلانات`,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      config: {
        apiKey: "***configured***",
        apiEndpoint: config.apiEndpoint,
        isEnabled: config.isEnabled,
        status: "configured",
      },
      test: testResult,
    });
  } catch (error) {
    console.error('Error configuring ads API:', error);
    return NextResponse.json({ error: 'Failed to configure ads API' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { isEnabled } = await req.json();
    
    const config = await db.adsConfig.update({
      where: { id: 1 },
      data: {
        isEnabled: isEnabled,
        updatedAt: new Date(),
      },
    });

    // Log the status change
    await db.adminActivity.create({
      data: {
        userId: "system",
        action: isEnabled ? "تفعيل API الإعلانات" : "تعطيل API الإعلانات",
        details: `تم ${isEnabled ? "تفعيل" : "تعطيل"} API الإعلانات`,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      config: {
        apiKey: "***configured***",
        apiEndpoint: config.apiEndpoint,
        isEnabled: config.isEnabled,
        status: "configured",
      },
    });
  } catch (error) {
    console.error('Error updating ads API status:', error);
    return NextResponse.json({ error: 'Failed to update ads API status' }, { status: 500 });
  }
}

