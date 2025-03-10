"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export default function EditAddressPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [address, setAddress] = useState<Address>({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    }
    if (user && user.address) {
      setAddress(user.address);
    }
  }, [isAuthenticated, router, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      // PUT to update address endpoint; ensure you create this endpoint on your server
      const res = await fetch("/api/users/me/address", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(address),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update address");
      }
      toast({
        title: "Success",
        description: "Address updated successfully",
      });
      router.push("/profile");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Edit Address</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="street">Street</Label>
          <Input id="street" name="street" value={address.street} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" value={address.city} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input id="state" name="state" value={address.state} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="zip">Zip Code</Label>
          <Input id="zip" name="zip" value={address.zip} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" value={address.country} onChange={handleChange} required />
        </div>
        <Button type="submit">Save Address</Button>
      </form>
    </div>
  );
}
