 //app/api/auth/logout/route.ts
 import { NextResponse } from 'next/server';
 import { cookies } from 'next/headers';

 export async function POST(request: Request) {
     try {
       const cookieStore = cookies();
       cookieStore.delete('auth'); // Correctly delete cookies

     return NextResponse.json({ message: "Logged out successfully" });
     } catch(err: any)
     {
       console.log("Logout error", err.message);
       return NextResponse.json({ message: "Internal Server Error" }, {status: 500});
     }

 }