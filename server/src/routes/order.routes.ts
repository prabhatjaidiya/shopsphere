import { Router } from "express";
import { getMyOrders } from "../controllers/order.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";

const router = Router();

router.use(authenticate, authorizeRoles("customer"));

router.get("/my-orders", getMyOrders);

export default router;