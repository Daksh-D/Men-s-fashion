// components/AppContent.tsx
//This is a server component
"use client";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Toaster } from "./ui/toaster";

export default function AppContent({children}: {children: React.ReactNode}) {
    return (
        <>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <Toaster />
        </>
    )
}