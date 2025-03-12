import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ user: User }>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: async (email, password) => {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Login failed");
        }
        const data = await res.json();
          //console.log("Login successful, user data:", data.user); //Debugging
        set({ user: data.user, isAuthenticated: true });
        return { user: data.user };
      },
      register: async (email, password, name) => {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Registration failed");
        }
         const data = await res.json();  //Registration response does not include all user information
        set({ isAuthenticated: true }); // Important to update auth state
      },
      logout: async () => {
          try{
            const res = await fetch('/api/auth/logout', { method: 'POST' }); //call logout endpoint
            if (res.ok) {
              set({ user: null, isAuthenticated: false });
              // No need for manual cookie deletion; server handles it
            } else {
              console.error('Logout failed:', await res.text()); // Log detailed error.
            }
          }
          catch(err: any)
          {
              console.error('Logout failed:', err.message);
          }
      },
    }),
     {
        name: "auth-storage",
        //Specify storage options to avoid warnings
        storage: {
            getItem: (name) => {
              if (typeof window === 'undefined') return null; // Handle server-side rendering
              const item = localStorage.getItem(name);
              return item ? JSON.parse(item) : null;
            },
            setItem: (name, value) => {
              if (typeof window !== 'undefined') { // Handle server-side rendering
                localStorage.setItem(name, JSON.stringify(value));
              }
            },
          removeItem: (name) => {
              if (typeof window !== 'undefined') { // Handle server side rendering
                  localStorage.removeItem(name);
              }
          },
        },
    }
  )
);