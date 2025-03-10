"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      
      <div className="space-y-2">
        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-2">Address</h2>
        {user.address ? (
          <div className="space-y-1">
            <p>{user.address.street}</p>
            <p>
              {user.address.city}, {user.address.state} {user.address.zip}
            </p>
            <p>{user.address.country}</p>
          </div>
        ) : (
          <p>No address on file.</p>
        )}
      </div>

      <div className="mt-8 space-x-2">
        {user.role === "admin" && (
          <Button onClick={() => router.push("/admin")}>
            Go to Admin Dashboard
          </Button>
        )}
        {user.role === "user" && (
          <Button variant="outline" onClick={() => router.push("/orders")}>
            My Orders
          </Button>
        )}
        <Button variant="secondary" onClick={() => router.push("/profile/edit-address")}>
          {user.address ? "Edit Address" : "Add Address"}
        </Button>
        <Button variant="destructive" onClick={logout}>
          Logout
        </Button>
      </div>
    </div>
  );
}
