// app/api/orders/route.ts
"use client";

import { connectDB, Order } from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { jwtVerify } from 'jose';

connectDB();
 export const dynamic = 'force-dynamic';
// Zod schema for order items
const orderItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  quantity: z.number().int().min(1),
  price: z.number().min(0),
  image: z.string().url(),
  size: z.string().optional(),
  color: z.string().optional(),
});

// Zod schema for shipping address
const shippingAddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
});

// Zod schema for the entire order (POST request body) -  NOT USED, but kept as example.
const orderSchema = z.object({
  items: z.array(orderItemSchema),
  total: z.number().min(0),
  shippingAddress: shippingAddressSchema,
});

// GET /api/orders (for a *user* to get *their* orders)
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

    const orders = await Order.find({ userId }).sort({ createdAt: -1 }); // Find orders for *this* user
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

//This endpoint is not being used. The order is created after the checkout
// session from the webhook endpoint.
//Leaving this for study purposes.
// POST /api/orders (for a user to *create* an order)
export async function POST(request: Request) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('auth')?.value;

        if (!token) {
          return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        const userId = payload.uid as string; // Extract userId from JWT


        const orderData = await request.json();
        const validatedOrder = orderSchema.parse(orderData);

        const newOrder = new Order({
            userId: userId, // Use the userId from the JWT
            ...validatedOrder,  // Spread the validated order data
            status: "pending",  // Set initial status
        });

        const savedOrder = await newOrder.save();
        return NextResponse.json(savedOrder, { status: 201 });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
          return NextResponse.json({ message: 'Invalid request data', errors: error.errors }, { status: 400 });
        }
        console.error("Error creating order:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}