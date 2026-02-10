import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limit store
// Note: This works best in single-instance environments (Docker/VPS).
// For multi-instance serverless, consider Upstash Redis.
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 15; // 15 requests per minute per IP

export function middleware(request: NextRequest) {
    // Only apply to API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
        // Basic IP identification
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
        const now = Date.now();

        const rateData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

        if (now - rateData.lastReset > RATE_LIMIT_WINDOW) {
            rateData.count = 1;
            rateData.lastReset = now;
        } else {
            rateData.count++;
        }

        rateLimitMap.set(ip, rateData);

        if (rateData.count > MAX_REQUESTS) {
            return new NextResponse(
                JSON.stringify({ error: 'Too many requests. Please try again in a minute.' }),
                {
                    status: 429,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};
