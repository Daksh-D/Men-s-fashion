// app/api/products/route.ts
"use client";
import { connectDB, Product } from '@/lib/db';
import { NextResponse } from 'next/server';
import { z } from 'zod';

connectDB();

const productSchema = z.object({
    name: z.string().min(1).max(255),
    price: z.number().min(0),
    category: z.string().min(1),
    description: z.string().optional(),
    images: z.array(z.string().url()).default([]), // Provide default
    rating: z.number().min(0).max(5).optional(),
    reviews: z.array(z.any()).optional(),
    sizes: z.array(z.string()).optional(),
    colors: z.array(z.string()).optional(),
    inStock: z.boolean().optional(),
});

export async function GET(request: Request) {
    try {
      await connectDB();
      const { searchParams } = new URL(request.url);
      const category = searchParams.get('category');

      const query: any = {};
      if (category) {
          query.category = category;
      }
      const products = await Product.find(query);
      return NextResponse.json(products);
    } catch (error: any) {
      console.error("GET /api/products error:", error);
      return NextResponse.json(
        { success: false, message: "Internal Server Error", error: error.message },
        { status: 500 }
      );
    }
}

export async function POST(request: Request) {
  try {
    await connectDB(); // Await the connection
    const productData = await request.json();
    const validatedData = productSchema.parse(productData);

    const newProduct = new Product(validatedData);
    const savedProduct = await newProduct.save();
    return NextResponse.json(savedProduct, { status: 201 });
  } catch (error:any) {
     if (error instanceof z.ZodError) {
       return NextResponse.json({ success: false, message: "Validation Error", errors: error.errors }, { status: 400 });
     }
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}