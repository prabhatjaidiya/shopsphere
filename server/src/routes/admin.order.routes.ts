import { Router } from "express";
import {
    getAllOrders,
    getOrderById,
    updateOrderStatus,
} from "../controllers/admin.order.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";

const router = Router();

// All routes in this router require an authenticated admin.
router.use(authenticate, authorizeRoles("admin"));

router.get("/", getAllOrders);
router.get("/:orderId", getOrderById);
router.patch("/:orderId/status", updateOrderStatus);

export default router;