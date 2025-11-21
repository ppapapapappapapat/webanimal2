import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Add your middleware logic here
  // For example, authentication checks, redirects, etc.
  return NextResponse.next();
}

// Define the middleware matcher configuration
export const config = {
  // Match all routes except:
  // - /_next (Next.js internal routes)
  // - /api (API routes)
  // - /static (static files)
  // - /login (login page)
  // - /register (registration page)
  // - /favicon.ico, /robots.txt, etc.
  matcher: [
    '/((?!_next|api|static|login|register|favicon.ico|robots.txt).*)',
  ],
} 