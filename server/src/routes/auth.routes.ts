import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many authentication attempts. Please try again later.",
    },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/protected", authenticate, (req, res) => {
    res.status(200).json({
        message: "You accessed a protected route",
        user: req.user,
    });
});

export default router;