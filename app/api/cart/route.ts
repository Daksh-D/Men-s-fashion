import { connectDB, Cart } from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { jwtVerify } from 'jose';

connectDB();

const cartItemSchema = z.object({
    productId: z.string(),
    name: z.string(),
    price: z.number().min(0),
    image: z.string().url(),
    quantity: z.number().int().min(1),
    size: z.string().optional(),
    color: z.string().optional(),
    id: z.string() //Validate id of the cart item, as its not coming from db
});

const cartSchema = z.object({
    items: z.array(cartItemSchema)
});

// Get cart items
export async function GET(request: Request) {

    try {
      const cookieStore = cookies();
      const token = cookieStore.get('auth')?.value;

      if (!token) {
          return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const userId = payload.uid as string;

        const cart = await Cart.findOne({ userId });
        return NextResponse.json(cart ? cart.items : [], {status: 200});
    } catch (error: any) {
         console.error("Error on getting the cart", error.message)
        return NextResponse.json({ message: error.message }, {status: 500});
    }
}

// Update/Create the cart
export async function POST(request: Request) {
 try {
     const cookieStore = cookies();
     const token = cookieStore.get('auth')?.value;
     if (!token) {
       return NextResponse.json({message: 'Unauthorized'}, {status: 401});
     }

     const secret = new TextEncoder().encode(process.env.JWT_SECRET);
     const { payload } = await jwtVerify(token, secret);
     const userId = payload.uid as string;

    const { items } = await request.json();
    const validatedData = cartSchema.parse({items}); //Validate with zod

    let cart = await Cart.findOne({ userId });

    if (cart) {
      cart.items = validatedData.items;
      cart.updatedAt = new Date();
      await cart.save();
    } else {
      cart = new Cart({ userId, items: validatedData.items });
      await cart.save();
    }
    return NextResponse.json(cart.items, {status: 200});
  } catch (error: any) {
     if (error instanceof z.ZodError) {
         return NextResponse.json({message: 'Invalid request data', errors: error.errors }, {status: 400});
     }
     console.error("POST /api/cart error:", error);
    return NextResponse.json({ message: error.message }, {status: 500});
  }
}