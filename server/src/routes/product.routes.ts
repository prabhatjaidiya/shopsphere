import { Router } from "express";
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/product.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";

const router = Router();

// Public product routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin-only product mutations
router.post("/", authenticate, authorizeRoles("admin"), createProduct);
router.patch("/:id", authenticate, authorizeRoles("admin"), updateProduct);
router.delete("/:id", authenticate, authorizeRoles("admin"), deleteProduct);

export default router;