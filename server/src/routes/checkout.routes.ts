import { Router } from "express";
import { validateCheckout } from "../controllers/checkout.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";

const router = Router();

router.use(authenticate, authorizeRoles("customer"));

router.post("/validate", validateCheckout);

export default router;