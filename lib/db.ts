import mongoose, { Schema, Document, Model } from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI environment variable is not set.");
}

export interface IProduct extends Document {
  _id: string;
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

export interface IUser extends Document {
  email: string;
  name: string;
  passwordHash: string;
  role: "user" | "admin";
  address?: Address;
}

export interface IOrder extends Document {
  _id: string;
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
ProductSchema.virtual("id").get(function () {
  return this._id.toString();
});

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
UserSchema.virtual("id").get(function (this: mongoose.Document<any, any, IUser> & IUser) {
  return this._id.toString();
});

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
OrderSchema.virtual("id").get(function () {
  return this._id.toString();
});

// --- Cart Interfaces & Schema ---
export interface ICartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface ICart extends Document {
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
      },
    ],
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
CartSchema.virtual("id").get(function (this: mongoose.Document<any, any, ICart> & ICart) {
  return this._id.toString();
});

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

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    throw error;
  }
}
