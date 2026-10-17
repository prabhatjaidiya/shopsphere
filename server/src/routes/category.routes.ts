import { Router } from "express";
import Category from "../models/Category.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";

const router = Router();

router.get("/", async (_req, res, next) => {
    try {
        const categories = await Category.find()
            .select("name description")
            .sort({ name: 1 })
            .lean();

        res.status(200).json({
            success: true,
            data: categories,
        });
    } catch (error) {
        next(error);
    }
});

router.post(
    "/",
    authenticate,
    authorizeRoles("admin"),
    async (req, res, next) => {
        try {
            const name =
                typeof req.body.name === "string"
                    ? req.body.name.trim()
                    : "";

            const description =
                typeof req.body.description === "string"
                    ? req.body.description.trim()
                    : "";

            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: "Category name is required",
                });
            }

            const existingCategory = await Category.findOne({
                name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
            });

            if (existingCategory) {
                return res.status(409).json({
                    success: false,
                    message: "Category already exists",
                });
            }

            const category = await Category.create({
                name,
                description,
            });

            return res.status(201).json({
                success: true,
                message: "Category created successfully",
                data: category,
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;