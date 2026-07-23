import express from "express";
import cors from "cors"; // Add this import
import cookieParser from "cookie-parser";

import errorHandler from "./middleware/errorMiddleware.js";

import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js"
import categoryRoutes from "./routes/categoryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import wishlistRoutes from "./routes/wishlistRoutes.js";
import adminRoutes from "./routes/dashboardRoutes.js";

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',                    // Local development
    'http://localhost:5174',
    'https://bytebuy-zeta.vercel.app'            // Your live frontend
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

// ============================================
// 2. Middleware
// ============================================
app.use(cookieParser());
app.use(express.json()); // if request body has JSON, convert into JavaScript object.

// ============================================
// 3. Routes
// ============================================
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wishlist", wishlistRoutes);

// ============================================
// 4. 404 Handler
// ============================================
app.use((req, res, next) => {
    res.status(404);
    next(new Error("Route not found"));
});

// ============================================
// 5. Error Handler
// ============================================
app.use(errorHandler); // runs only if error thrown by controller

export default app;