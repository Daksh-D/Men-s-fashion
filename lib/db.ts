import mongoose, { Schema, Document, Model } from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI environment variable is not set.");
}

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  images?: string[];
  category: string;
  rating?: number;
  reviews?: any[];
  sizes?: string[];
  colors?: string[];
  inStock?: boolean;
  createdAt?: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface IUser extends Document  {
  email: string;
  name: string;
  passwordHash: string;
  role: "user" | "admin";
  address?: Address;
}

export interface IOrder extends Document  {
  userId: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
    size?: string;
    color?: string;
  }[];
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

// --- Product Schema ---
const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    images: [String],
    category: { type: String, required: true },
    rating: Number,
    reviews: [{ type: Schema.Types.Mixed }],
    sizes: [String],
    colors: [String],
    inStock: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);


// --- User Schema (with address) ---
const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);


// --- Order Schema ---
const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: String, ref: "User", required: true },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        image: { type: String, required: true },
        size: String,
        color: String,
      },
    ],
    total: { type: Number, required: true },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
      country: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// --- Cart Interfaces & Schema ---
export interface ICartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  id: string;
}

export interface ICart extends Document  {
  userId: string;
  items: ICartItem[];
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>(
  {
    userId: { type: String, required: true, unique: true },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String, required: true },
        quantity: { type: Number, required: true },
        size: String,
        color: String,
        id: {type: String, required: true}
      },
    ],
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// --- Create and Export Models ---
export const Product =
  (mongoose.models.Product as Model<IProduct>) ||
  mongoose.model<IProduct>("Product", ProductSchema);
export const User =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);
export const Order =
  (mongoose.models.Order as Model<IOrder>) ||
  mongoose.model<IOrder>("Order", OrderSchema);
export const Cart =
  (mongoose.models.Cart as Model<ICart>) ||
  mongoose.model<ICart>("Cart", CartSchema);

  let cachedConnection: typeof mongoose | null = null; // Cache the connection

  export async function connectDB() {
    if (cachedConnection) {
      console.log("Using cached MongoDB connection");
      return cachedConnection;
    }

    try {
      console.log("Attempting to connect to MongoDB with URI:", process.env.MONGO_URI); // Log the URI
      const connection = await mongoose.connect(process.env.MONGO_URI!);
      cachedConnection = connection; // Store the connection
      console.log("Connected to MongoDB");
      return connection;
    } catch (error) {
      console.error("MongoDB Connection Error:", error);
      throw error; // Re-throw the error to be caught by the caller
    }
  }