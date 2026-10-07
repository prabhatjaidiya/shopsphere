import { Request, Response } from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import "../models/Category.js";

export const getProducts = async (req: Request, res: Response) => {
    try {
        // 1. Read query parameters
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(
            Math.max(Number(req.query.limit) || 10, 1),
            100
        );

        const search =
            typeof req.query.search === "string"
                ? req.query.search.trim()
                : "";

        const category =
            typeof req.query.category === "string"
                ? req.query.category.trim()
                : "";

        // 2. Build MongoDB filter
        const filter: Record<string, unknown> = {};

        // Search by product name
        if (search) {
            const escapedSearch = search.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            filter.name = {
                $regex: escapedSearch,
                $options: "i",
            };
        }

        // Filter by category
        if (category) {
            if (!mongoose.Types.ObjectId.isValid(category)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID",
                });
            }

            filter.category = new mongoose.Types.ObjectId(category);
        }

        // 3. Calculate pagination
        const skip = (page - 1) * limit;

        // 4. Fetch products and total count
        const [products, totalProducts] = await Promise.all([
            Product.find(filter)
                .populate("category")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            Product.countDocuments(filter),
        ]);

        // 5. Calculate pagination information
        const totalPages = Math.ceil(totalProducts / limit);

        // 6. Send response
        return res.status(200).json({
            success: true,
            data: products,
            pagination: {
                page,
                limit,
                totalProducts,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: totalPages > 0 && page > 1,
            },
        });
    } catch (error) {
        console.error("Get products error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch products",
        });
    }
};

export const getProductById = async (
    req: Request,
    res: Response
) => {
    try {
        const id = req.params.id;

        if (typeof id !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        // Find product
        const product = await Product.findById(id)
            .populate("category")
            .lean();

        // Product doesn't exist
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Product found
        return res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        console.error("Get product by ID error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch product",
        });
    }
};