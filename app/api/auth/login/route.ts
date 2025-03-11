// app/api/auth/login/route.ts
import { connectDB, User } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { SignJWT } from 'jose'; // Import jose
import { cookies } from 'next/headers';

connectDB();

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export async function POST(request: Request) {
    try {
        const requestData = await request.json();
        const { email, password } = loginSchema.parse(requestData);

        const user = await User.findOne({ email }).lean(); // Use .lean()

        if (!user) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 }); // 401 for authentication failure
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }

        // --- JWT Creation ---
        const secret = new TextEncoder().encode(process.env.JWT_SECRET); // Encode the secret
        const alg = 'HS256'; // HMAC using SHA-256

        const jwt = await new SignJWT({
            uid: user._id, // Now, Typescript is happy.
            role: user.role,
        })
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setExpirationTime('7d') // Set expiration time (e.g., 7 days)
        .sign(secret);


        // --- Set Cookie ---
          cookies().set({
            name: 'auth',
            value: jwt, //set the jwt in the auth cookie
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days (MUST match expiration time)
          });

        return NextResponse.json({
            user: { id: user._id, email: user.email, name: user.name, role: user.role, address: user.address },
        });

    } catch (error: any) {
        console.error("Login error:", error);
          if (error instanceof z.ZodError) {
            return NextResponse.json({ message: 'Invalid request data', errors: error.errors }, { status: 400 });
          }
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}