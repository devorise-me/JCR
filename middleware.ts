import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";

// Simple rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute per IP

// Performance monitoring
const requestMetrics = {
  totalRequests: 0,
  slowRequests: 0,
  errorRequests: 0,
  lastReset: Date.now(),
};

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
  return `rate_limit:${ip}`;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    const newEntry = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
    rateLimitStore.set(key, newEntry);
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetTime: newEntry.resetTime,
    };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  entry.count++;
  rateLimitStore.set(key, entry);
  
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - entry.count,
    resetTime: entry.resetTime,
  };
}

function cleanupRateLimit(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Cleanup rate limit store every 5 minutes
setInterval(cleanupRateLimit, 5 * 60 * 1000);

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  requestMetrics.totalRequests++;

  // Apply auth middleware first
  const authResult = await auth(request);
  if (authResult) {
    return authResult;
  }

  // Skip rate limiting for static assets and internal API calls
  const pathname = request.nextUrl.pathname;
  const isStaticAsset = pathname.startsWith('/_next/') || 
                       pathname.startsWith('/static/') ||
                       pathname.includes('.');
  
  const isInternalAPI = pathname.startsWith('/api/system/') ||
                       pathname.startsWith('/api/admin/');

  // Apply rate limiting for public API endpoints
  if (pathname.startsWith('/api/') && !isInternalAPI && !isStaticAsset) {
    const rateLimitKey = getRateLimitKey(request);
    const rateLimit = checkRateLimit(rateLimitKey);

    if (!rateLimit.allowed) {
      requestMetrics.errorRequests++;
      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());
    
    // Add performance headers
    const processingTime = Date.now() - startTime;
    response.headers.set('X-Response-Time', `${processingTime}ms`);
    
    if (processingTime > 1000) {
      requestMetrics.slowRequests++;
    }

    return response;
  }

  // Add security headers for all responses
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Performance headers
  const processingTime = Date.now() - startTime;
  response.headers.set('X-Response-Time', `${processingTime}ms`);
  
  if (processingTime > 1000) {
    requestMetrics.slowRequests++;
  }

  // Cache headers for static assets
  if (isStaticAsset) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

// Export metrics for monitoring
export { requestMetrics };