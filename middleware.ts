// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // Import jwtVerify
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
    const cookieStore = cookies();
    const jwt = cookieStore.get('auth')?.value; // Get the JWT from the 'auth' cookie


  if (isAdminRoute) {
    console.log("Middleware: isAdminRoute is true");

    if (!jwt) {
      console.log("Middleware: No JWT, redirecting to /auth/login");
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(jwt, secret); // Verify the JWT

      // If verification is successful, the 'payload' will contain the decoded JWT data
      console.log("Middleware: JWT payload:", payload);

        if (payload.role !== "admin") {
            console.log("Middleware: Not authorized, redirecting to /auth/login");
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }


    } catch (error) {
      // If verification fails (e.g., token is expired or invalid), redirect to login
      console.error("Middleware: JWT verification failed:", error);
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  console.log("Middleware: Allowing request to proceed.");
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/users/me/address'],
};