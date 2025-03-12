// app/api/users/me/address/route.ts
import { connectDB, User } from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { jwtVerify } from 'jose';

connectDB();
 export const dynamic = 'force-dynamic';

const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
});

export async function PUT(request: Request) {
    try {
      const cookieStore = cookies();
      const token = cookieStore.get('auth')?.value;

      if (!token) {
          return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret); //Verify token

      const userId = payload.uid as string; //Extract userId

      const addressData = await request.json();
      const validatedAddress = addressSchema.parse(addressData);


      const updatedUser = await User.findByIdAndUpdate(
        userId, //Use userId from JWT
        { address: validatedAddress },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return NextResponse.json({ message: "User not found" }, {status: 404});
      }
      return NextResponse.json(updatedUser);
    } catch (error: any) {
          if (error instanceof z.ZodError) {
            return NextResponse.json({message: 'Invalid request data', errors: error.errors }, {status: 400});
          }
        console.error("PUT /api/users/me/address error:", error);
        return NextResponse.json({ message: error.message }, {status: 500});
    }
}