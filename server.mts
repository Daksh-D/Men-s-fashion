import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import Stripe from "stripe";
import bcrypt from "bcrypt";
import { connectDB, Product, User, Order, Cart } from "./lib/db";
import mongoose, { isValidObjectId } from "mongoose";

// Connect to MongoDB
connectDB();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// ------------------------------
// Simple Authentication Middleware (using cookies)
// ------------------------------
function authenticateToken(
  req: Request,
  res: Response,
  next: express.NextFunction
) {
  // Read cookies "auth_id" and "auth_role"
  const userId = req.cookies["auth_id"];
  const role = req.cookies["auth_role"];
  if (!userId || !role) {
    return res.status(401).json({ message: "Not logged in" });
  }
  // Attach a basic user object to the request
  (req as any).user = { id: userId, role };
  next();
}

const app = express();
const port = process.env.PORT || 3001;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

// --- WEBHOOK ENDPOINT (before JSON parsing) ---
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      try {
        await createOrderFromSession(session);
        console.log("Order created successfully from webhook!");
      } catch (error: any) {
        console.error("Error creating order:", error);
        return res.status(500).json({ message: "Failed to create order" });
      }
    }
    res.status(200).send("Received!");
  }
);

app.use(express.json({ limit: "10mb" }));

// --- Product Endpoints ---
app.get("/api/products", async (req: Request, res: Response) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/products/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error: any) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/api/products", async (req: Request, res: Response) => {
  try {
    const {
      name,
      price,
      category,
      description,
      images,
      rating,
      reviews,
      sizes,
      colors,
      inStock,
    } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const newProduct = new Product({
      name,
      price,
      category,
      description,
      images,
      rating,
      reviews,
      sizes,
      colors,
      inStock,
    });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/products/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    const {
      name,
      price,
      category,
      description,
      images,
      rating,
      reviews,
      sizes,
      colors,
      inStock,
    } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, price, category, description, images, rating, reviews, sizes, colors, inStock },
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(updatedProduct);
  } catch (error: any) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: error.message });
  }
});

// --- DELETE Product Endpoint (Admin Only) ---
app.delete("/api/products/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: error.message });
  }
});

// --- Authentication Endpoints ---
app.post("/api/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      name,
      passwordHash,
      role: "user",
    });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing required fields" });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(400).json({ message: "Invalid credentials" });
    // Set cookies with user's role and id (plain strings)
    res.cookie("auth_role", user.role, { httpOnly: true, path: "/" });
    res.cookie("auth_id", String(user._id), { httpOnly: true, path: "/" });
    res.json({
      user: { id: user._id, email: user.email, name: user.name, role: user.role, address: user.address },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// --- Cart Endpoints ---
app.get("/api/cart", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const cart = await Cart.findOne({ userId: user.id });
    res.json(cart ? cart.items : []);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/cart", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { items } = req.body;
    let cart = await Cart.findOne({ userId: user.id });
    if (cart) {
      cart.items = items;
      cart.updatedAt = new Date();
      await cart.save();
    } else {
      cart = new Cart({ userId: user.id, items });
      await cart.save();
    }
    res.status(200).json(cart.items);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// --- Orders Endpoint (Admin Only) ---
// This endpoint fetches all orders for admin users.
app.get("/api/orders", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// --- Update User Address Endpoint ---
app.put("/api/users/me/address", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { street, city, state, zip, country } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { address: { street, city, state, zip, country } },
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// --- Admin Endpoints ---
app.get("/api/admin/users", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const users = await User.find().select("-passwordHash");
    res.json(users);
  } catch (error: any) {
    console.error("Error fetching admin users:", error);
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/admin/users/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User Deleted Successfully." });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api/admin/stats", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const orders = await Order.find();
    const revenue = orders.reduce((sum, order) => sum + order.total, 0);
    const monthlyRevenue = await Order.aggregate([
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    const formattedRevenueData = monthlyRevenue.map((item) => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
      revenue: item.revenue,
    }));
    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      revenue,
      revenueData: formattedRevenueData,
    });
  } catch (error: any) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// --- Checkout Endpoint ---
app.post("/api/checkout", async (req: Request, res: Response) => {
  try {
    const { items, userId } = req.body;
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          metadata: {
            productId: item.productId,
            size: item.size,
            color: item.color,
          },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:3000/checkout/success",
      cancel_url: "http://localhost:3000/cart",
      metadata: { userId: userId },
    });
    res.json({ url: session.url });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: error.message });
  }
});

async function createOrderFromSession(session: Stripe.Checkout.Session) {
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ["data.price.product"],
  });
  const orderItems = lineItems.data.map((item) => {
    const product = item.price?.product as Stripe.Product;
    return {
      productId: product.metadata?.productId || "unknown",
      name: product.name,
      quantity: item.quantity,
      price: item.price!.unit_amount! / 100,
      image:
        product.images && product.images.length > 0 ? product.images[0] : null,
      size: product.metadata?.size,
      color: product.metadata?.color,
    };
  });
  const newOrder = new Order({
    userId: session.metadata?.userId || "unknown",
    items: orderItems,
    total: session.amount_total! / 100,
    shippingAddress: {
      street: session.shipping_details?.address?.line1,
      city: session.shipping_details?.address?.city,
      state: session.shipping_details?.address?.state,
      zip: session.shipping_details?.address?.postal_code,
      country: session.shipping_details?.address?.country,
    },
    status: "processing",
  });
  await newOrder.save();
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
