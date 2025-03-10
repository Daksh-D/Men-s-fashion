"use client";

import { create } from "zustand";
import { CartItem } from "@/types";

interface CartStore {
  items: CartItem[];
  fetchCart: () => Promise<void>;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  fetchCart: async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/cart", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        // Normalize each item: ensure price is a number
        const normalized = data.map((item: any) => ({
          ...item,
          price: Number(item.price),
        }));
        set({ items: normalized });
      }
    } catch (error) {
      console.error("Failed to fetch cart", error);
    }
  },
  addItem: async (item) => {
    const items = get().items;
    // Check if the item already exists (by productId and attributes)
    const existing = items.find(
      (i) =>
        i.productId === item.productId &&
        i.size === item.size &&
        i.color === item.color
    );
    let newItems;
    if (existing) {
      newItems = items.map((i) =>
        i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i
      );
    } else {
      // Assign a temporary id so that the UI can update immediately.
      newItems = [...items, { ...item, id: crypto.randomUUID() }];
    }
    set({ items: newItems });
    const token = localStorage.getItem("token");
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items: newItems }),
    });
  },
  removeItem: async (id) => {
    const newItems = get().items.filter((item) => item.id !== id);
    set({ items: newItems });
    const token = localStorage.getItem("token");
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items: newItems }),
    });
  },
  updateQuantity: async (id, quantity) => {
    const newItems = get().items.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );
    set({ items: newItems });
    const token = localStorage.getItem("token");
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items: newItems }),
    });
  },
  clearCart: async () => {
    set({ items: [] });
    const token = localStorage.getItem("token");
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items: [] }),
    });
  },
  get total() {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));
