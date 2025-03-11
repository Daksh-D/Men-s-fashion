// File: types/index.ts
export interface Product {
  id: string; // Keep this for frontend convenience (virtual field)
  _id: string; // Add _id: string;  This is the MongoDB ID.
  name: string;
  description?: string; //description is optional
  price: number;
  images?: string[];//images is optional
  category: string;
  rating?: number;// rating is optional
  reviews?: Review[]; //reviews is optional
  sizes?: string[]; // sizes is optional
  colors?: string[]; // colors is optional
  inStock?: boolean; //inStock is optional
  createdAt?: string; //createdAt is optional
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number; // Add missing fields from your previous code
  comment: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  address?: Address;
}


export interface Order {
  _id: string;
  userId: string; // Link to User
  items: {
    productId: string; // Link to Product (using string for frontend convenience)
    name: string;
    quantity: number;
    price: number;
    image: string; // Keep image URL for display
    size?: string; // Optional size
    color?: string; // Optional color
  }[];
  total: number;
  shippingAddress: {  // Basic address (expand as needed)
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}