// app/api/auth/register/route.ts
import { connectDB, User } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

connectDB();

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6), // Example minimum length
    name: z.string().min(1),
});

export async function POST(request: Request) {
    try {
        const requestData = await request.json();
        const { email, password, name } = registerSchema.parse(requestData);

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = new User({
            email,
            name,
            passwordHash,
            role: "user", // Default role
        });

        await newUser.save();
        // Use lean() *after* saving to get a plain JS object
        const leanUser = await User.findOne({ email: newUser.email }).lean();

         if (!leanUser) {
          return NextResponse.json({ message: "Failed to retrieve created user" }, { status: 500 }); // Should not happen, but good to check
        }

        // --- JWT Creation (Same as login) ---
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const alg = 'HS256';

        const jwt = await new SignJWT({
             uid: leanUser._id, // Now TypeScript knows this is a string
             role: leanUser.role
            })
            .setProtectedHeader({ alg })
            .setIssuedAt()
            .setExpirationTime('7d') // Set expiration time (e.g., 7 days)
            .sign(secret);

        // --- Set Cookie (Same as login) ---
          cookies().set({
            name: 'auth',
            value: jwt,
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days (MUST match expiration time)
          });


        return NextResponse.json({ message: "User registered successfully" }, {status: 201});

    } catch (error: any) {
       if (error instanceof z.ZodError) {
          return NextResponse.json({message: 'Invalid request data', errors: error.errors }, {status: 400});
        }
        console.error("Registration error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}