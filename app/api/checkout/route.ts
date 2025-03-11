// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { cookies } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia', // Use a specific, recent API version
});

const checkoutItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  price: z.number().min(0),
  image: z.string().url(),
  quantity: z.number().int().min(1),
  size: z.string().optional(),
  color: z.string().optional(),
});

const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema),
});

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('auth_id')?.value;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized: User not logged in." }, { status: 401 });
    }

    const reqData = await request.json();
    const { items } = checkoutSchema.parse(reqData);

    const lineItems = items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: [item.image],
          metadata: {
            productId: item.productId,
            // Ensure all metadata values are strings
            size: item.size || "",  //  empty string if undefined
            color: item.color || "", //  empty string if undefined
          },
        },
        unit_amount: Math.round(item.price * 100), // Ensure it's an integer
      },
    }));


    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${request.headers.get('origin')}/checkout/success`,
      cancel_url: `${request.headers.get('origin')}/cart`,
      metadata: {
        userId: userId, // Pass the userId
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'UA'],  // Add allowed countries, example only
      },
        phone_number_collection:{
            enabled: true
        }
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid request data', errors: error.errors }, { status: 400 });
    }
    console.error("Error creating checkout session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}