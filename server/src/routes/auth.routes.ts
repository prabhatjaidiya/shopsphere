import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/protected", authenticate, (req, res) => {
    res.status(200).json({
        message: "You accessed a protected route",
        user: req.user,
    });
});

export default router;