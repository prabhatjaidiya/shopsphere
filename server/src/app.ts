import express from "express";
import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { authenticate } from "./middleware/auth.middleware.js";
import { authorizeRoles } from "./middleware/authorize.middleware.js";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/products", productRoutes);

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "ShopSphere API is running",
    });
});

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