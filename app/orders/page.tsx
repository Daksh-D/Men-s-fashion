"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Order } from "@/types";
import { Loader2 } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/user/orders", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data: Order[] = await res.json();
        setOrders(data);
      } catch (error: any) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold">You have no orders yet.</h1>
        <p className="text-muted-foreground">
          It looks like you haven't ordered any products yet. Please explore our categories.
        </p>
        <Button onClick={() => router.push("/categories")}>
          Go to Categories
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      <ul className="space-y-4">
        {orders.map((order) => (
          <li key={order._id} className="border p-4 rounded">
            <p>Order ID: {order._id}</p>
            <p>Total: ${order.total.toFixed(2)}</p>
            <p>Items: {order.items.length}</p>
            <p>Order Date: {new Date(order.createdAt).toLocaleDateString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
