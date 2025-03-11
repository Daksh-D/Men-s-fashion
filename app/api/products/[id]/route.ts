// app/api/products/[id]/route.ts
import { connectDB, Product } from '@/lib/db';
import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import { z } from 'zod';

connectDB();
// Zod schema for product creation and updating(reusing the schema)
const productSchema = z.object({
    name: z.string().min(1).max(255),
    price: z.number().min(0),
    category: z.string().min(1),
    description: z.string().optional(),
    images: z.array(z.string().url()).optional(),
    rating: z.number().min(0).max(5).optional(),
    reviews: z.array(z.any()).optional(), // Define a proper Zod schema for reviews if possible.
    sizes: z.array(z.string()).optional(),
    colors: z.array(z.string()).optional(),
    inStock: z.boolean().optional(),
});

// GET /api/products/[id]
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
     if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });
    }
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Error fetching product by ID:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
 // PUT /api/products/[id]
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
      const { id } = params;
     if (!isValidObjectId(id)) {
        return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });
      }

    const reqData = await request.json();
    const validatedData = productSchema.parse(reqData); //Validate with zod

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      validatedData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(updatedProduct);

  } catch (error: any) {
       if (error instanceof z.ZodError) {
          return NextResponse.json({ success: false, message: "Validation Error", errors: error.errors }, { status: 400 });
      }
      console.error("Error updating product:", error);
       return NextResponse.json({ message: error.message }, {status: 500});
  }
}

// DELETE /api/products/[id]
  export async function DELETE(request: Request, { params }: { params: { id: string } }) {

    // In a real app, you'd check auth here, e.g., using middleware.
    //  const user =  ... get user from request ...
    //  if (!user || user.role !== "admin") {
    //      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    //  }
    try{
       const { id } = params;
        if (!isValidObjectId(id)) {
           return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });
        }
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
          return NextResponse.json({ message: "Product not found" }, { status: 404 });
        }
          return NextResponse.json({ message: "Product deleted successfully" }, {status: 200});

    } catch (error: any) {
        console.error("Error deleting product:", error);
        return NextResponse.json({ message: error.message }, {status: 500});
    }

  }