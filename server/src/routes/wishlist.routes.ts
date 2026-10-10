import { Router } from "express";
import {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
} from "../controllers/wishlist.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";

const router = Router();

router.use(authenticate, authorizeRoles("customer"));

router.get("/", getWishlist);
router.post("/", addToWishlist);
router.delete("/:productId", removeFromWishlist);

export default router;