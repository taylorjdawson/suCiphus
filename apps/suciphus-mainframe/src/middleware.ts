import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Middleware to redirect paths not starting with /player to /player
export function middleware(request: NextRequest) {
  return NextResponse.redirect(new URL("/player", request.url))
}

// Configure the matcher to apply the middleware to all paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|player).*)",
  ],
}
