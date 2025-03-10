import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  
  if (isAdminRoute) {
    console.log("Middleware: isAdminRoute is true");
    // Read the "auth_role" cookie (set on login)
    const role = request.cookies.get("auth_role")?.value;
    console.log("Middleware: auth_role:", role);
    
    if (role !== "admin") {
      console.log("Middleware: Not authorized, redirecting to /auth/login");
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  console.log("Middleware: Allowing request to proceed.");
  return NextResponse.next();
}

export const config = {
  runtime: 'nodejs', // Use Node runtime to support any Node modules
  matcher: '/admin/:path*',
};
