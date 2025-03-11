// app/api/admin/users/[id]/route.ts
import { connectDB, User, Cart, Order } from '@/lib/db';
import { NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose'; // Import jwtVerify

connectDB();

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        // --- Get and verify JWT ---
        const cookieStore = cookies();
        const token = cookieStore.get('auth')?.value;
        if (!token) {
          return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        // --- Check Role ---
        if (payload.role !== "admin") { // Use the role from the JWT
          return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }


        const { id } = params;
        if (!isValidObjectId(id)) {
            return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
        }

        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Cascade delete related documents.
        await Cart.deleteMany({ userId: id });
        await Order.deleteMany({ userId: id });

        return NextResponse.json({ message: "User Deleted Successfully." });
    } catch (error: any) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}