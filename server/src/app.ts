import express from "express";
import helmet from "helmet";
import cors from "cors";
import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { authenticate } from "./middleware/auth.middleware.js";
import { authorizeRoles } from "./middleware/authorize.middleware.js";
import cartRoutes from "./routes/cart.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import checkoutRoutes from "./routes/checkout.routes.js";
import orderRoutes from "./routes/order.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import adminOrderRoutes from "./routes/admin.order.routes.js";

const app = express();

app.use(helmet());

app.use(express.json({ limit: "10kb" }));

const allowedOrigins = [
  "http://localhost:5173",
  "https://shopsphere-coral-rho.vercel.app",
  process.env.FRONTEND_URL,
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);

app.use("/api/products", productRoutes);

app.use("/api/cart", cartRoutes);

app.use("/api/wishlist", wishlistRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/admin/orders", adminOrderRoutes);

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "ShopSphere API is running",
    });
});

app.use("/api/checkout", checkoutRoutes);

app.get(
    "/api/admin/check",
    authenticate,
    authorizeRoles("admin"),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Admin access granted",
            user: req.user,
        });
    }
);

// Handle routes that do not exist
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});

// Centralized error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);

    if (res.headersSent) {
        return next(err);
    }

    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
});

export default app;