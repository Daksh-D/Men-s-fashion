"use client";

import { create } from "zustand";
import { CartItem } from "@/types";
import { toast } from "@/hooks/use-toast"; //Import for using inside

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
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
         const normalized = data.map((item: any) => ({
            ...item,
            price: Number(item.price),
        }));
        set({ items: normalized });
      }
      else {
        console.error("Failed to fetch cart:", await res.text()); // More detailed error
      }
    } catch (error) {
      console.error("Failed to fetch cart", error);
    }
  },
  addItem: async (item) => {
    const items = get().items;
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
      newItems = [...items, { ...item, id: crypto.randomUUID() }];
    }
    set({ items: newItems }); // Optimistic update
     try {
        const res =  await fetch("/api/cart", {  // Correct API path
          method: "POST",
          headers: { "Content-Type": "application/json"},
          body: JSON.stringify({ items: newItems }),
        });
        if(!res.ok){
             // Revert the optimistic update
             set({items});
             const errorData = await res.json();
             throw new Error(
               `Failed to add item to cart: ${res.status} - ${errorData.message}`
               );
        }
    } catch (error: any) {
        set({items}); // Revert on error
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
    }
  },
  removeItem: async (id) => {
    const currentItems = get().items
    const newItems = currentItems.filter((item) => item.id !== id);
    set({ items: newItems }); // Optimistic update
      try{
        const res = await fetch("/api/cart", { // Correct API path
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: newItems }),
        });
        if(!res.ok)
        {
          set({items: currentItems});
          const errorData = await res.json();
          throw new Error(
            `Failed to remove item: ${res.status} - ${errorData.message}`
          );
        }
      }
      catch (error: any) {
            set({items: currentItems}); // Revert on error
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
        }
  },
  updateQuantity: async (id, quantity) => {
    const currentItems = get().items;
    const newItems = currentItems.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );
    set({ items: newItems }); // Optimistic update
    try{
      const res =  await fetch("/api/cart", { // Correct API path
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: newItems }),
    });
    if(!res.ok){
      set({items: currentItems});
          const errorData = await res.json();
          throw new Error(
            `Failed to update item quantity: ${res.status} - ${errorData.message}`
          );
    }
    }
    catch (error: any) {
        set({items: currentItems}); // Revert on error
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
    }
  },
  clearCart: async () => {
    set({ items: [] }); // Optimistic update
    try{
      const res = await fetch("/api/cart", { // Correct API path
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [] }),
    });
     if(!res.ok){
        const errorData = await res.json();
        throw new Error(
          `Failed to clear the cart: ${res.status} - ${errorData.message}`
        );
      }
    }
    catch (error: any) { //Revert is not needed cuz its going to be empty anyway
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
    }
  },
  get total() {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));