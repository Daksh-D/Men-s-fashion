// app/api/admin/users/route.ts
import { connectDB, User } from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';  // Import jwtVerify

connectDB();

export async function GET(request: Request) {
  try {
      // --- Get and verify JWT ---
      const cookieStore = cookies();
      const token = cookieStore.get('auth')?.value;

      if (!token) {
          return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);

      // --- Check Role ---
      if (payload.role !== "admin") {  // Use the role from the JWT
          return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }

    const users = await User.find().select("-passwordHash"); // Exclude passwordHash
    return NextResponse.json(users);
  } catch (error: any) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}