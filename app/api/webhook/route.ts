// app/api/webhook/route.ts
"use client";

import { connectDB, Order } from '@/lib/db';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

connectDB();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia', // Use a specific API version
});

async function createOrderFromSession(session: Stripe.Checkout.Session) {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ["data.price.product"],
    });

    const orderItems = lineItems.data.map((item) => {
        const product = item.price?.product as Stripe.Product;
        return  {
            productId: product.metadata?.productId || "unknown",
            name: product.name,
            quantity: item.quantity,
            price: item.price!.unit_amount! / 100,
            image:
              product.images && product.images.length > 0 ? product.images[0] : null,
            size: product.metadata?.size,
            color: product.metadata?.color,
        }
    });
    const newOrder = new Order({
      userId: session.metadata?.userId || "unknown",
      items: orderItems,
      total: session.amount_total! / 100,
      shippingAddress: {
        street: session.shipping_details?.address?.line1 || null,  // Use null as default
        city: session.shipping_details?.address?.city || null,
        state: session.shipping_details?.address?.state || null,
        zip: session.shipping_details?.address?.postal_code || null,
        country: session.shipping_details?.address?.country || null,
      },
      status: "processing",
    });

    await newOrder.save();
  }

export async function POST(req: Request) {
  const body = await req.text(); // Get raw body as text
  const sig = headers().get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    return NextResponse.json({ message: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
        await createOrderFromSession(session);
      console.log("Order created successfully from webhook!");
    } catch (error: any) {
      console.error("Error creating order:", error);
      return NextResponse.json({ message: "Failed to create order" }, { status: 500 });
    }
  }
  return NextResponse.json({ received: true });
}
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'