import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    // If the path starts with /admin or /api/admin
    if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/api/admin')) {
        // Enforce that this is only accessible during local development
        if (process.env.NODE_ENV !== "development") {
            // Return a 404 response in production
            return new NextResponse(null, { status: 404 });
        }
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
