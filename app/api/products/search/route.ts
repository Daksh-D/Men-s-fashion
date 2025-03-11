// app/api/products/search/route.ts
import { connectDB, Product } from '@/lib/db';
import { NextResponse } from 'next/server';
import { z } from 'zod';

connectDB();

const searchSchema = z.object({
    q: z.string().min(1).max(255), // Validate 'q' query parameter
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q');

        // Validate the query parameter using Zod
        const validatedQuery = searchSchema.safeParse({ q }); // Use safeParse

        if (!validatedQuery.success) {
          return NextResponse.json(
            { message: "Invalid search query", errors: validatedQuery.error.errors },
            { status: 400 }
          );
        }
        //If validation is successful, proceed
        const query = validatedQuery.data.q;



        // Use a text index for search (requires index to be created in MongoDB)
        const products = await Product.find({ $text: { $search: query } });
        return NextResponse.json(products);
    } catch (error: any) {
        console.error("Error during product search:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}