// app/admin/layout.tsx
"use client";
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import AdminSidebar from '@/components/admin/sidebar'; // Import the sidebar
import { useState, useEffect } from 'react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const inter = Inter({ subsets: ['latin'] });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

  function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }
  return (

      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className={cn("flex h-screen", inter.className)}>
            <AdminSidebar />
            <div className="flex-1 overflow-auto">
                <main>{children}</main>
            </div>
         </div>
         <Toaster />
      </ThemeProvider>

  );
}