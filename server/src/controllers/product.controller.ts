import { Request, Response } from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import "../models/Category.js";
import Category from "../models/Category.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";

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

export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, description, price, category, stock, images, rating } = req.body;

        if (
            typeof name !== "string" || !name.trim() ||
            typeof description !== "string" || !description.trim() ||
            typeof category !== "string" ||
            price === undefined || stock === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, description, price, category, and stock are required",
            });
        }

        if (
            typeof price !== "number" ||
            !Number.isFinite(price) ||
            price < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Price must be a valid non-negative number",
            });
        }

        if (
            typeof stock !== "number" ||
            !Number.isInteger(stock) ||
            stock < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Stock must be a non-negative integer",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID",
            });
        }

        if (
            images !== undefined &&
            (!Array.isArray(images) ||
                !images.every((image: unknown) => typeof image === "string"))
        ) {
            return res.status(400).json({
                success: false,
                message: "Images must be an array of strings",
            });
        }

        const categoryExists = await Category.exists({ _id: category });

        if (!categoryExists) {
            return res.status(400).json({
                success: false,
                message: "Selected category does not exist",
            });
        }

        if (
            rating !== undefined &&
            (
                typeof rating !== "number" ||
                !Number.isFinite(rating) ||
                rating < 0 ||
                rating > 5
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Rating must be a number between 0 and 5",
            });
        }

        const product = await Product.create({
            name: name.trim(),
            description: description.trim(),
            price,
            category,
            stock,
            images: images ?? [],
            rating: rating ?? 0,
        });

        const populatedProduct = await Product.findById(product._id)
            .populate("category")
            .lean();

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: populatedProduct,
        });
    } catch (error) {
        console.error("Create product error:", error);

        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create product",
        });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const allowedFields = [
            "name",
            "description",
            "price",
            "category",
            "stock",
            "images",
            "rating",
        ];

        const body = req.body as Record<string, unknown>;

        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return res.status(400).json({
                success: false,
                message: "A valid update object is required",
            });
        }

        const unknownFields = Object.keys(body).filter(
            (field) => !allowedFields.includes(field)
        );

        if (unknownFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Unsupported fields: ${unknownFields.join(", ")}`,
            });
        }

        const updates: Record<string, unknown> = {};

        if ("name" in body) {
            if (typeof body.name !== "string" || !body.name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Product name cannot be empty",
                });
            }
            updates.name = body.name.trim();
        }

        if ("description" in body) {
            if (
                typeof body.description !== "string" ||
                !body.description.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Product description cannot be empty",
                });
            }
            updates.description = body.description.trim();
        }

        if ("price" in body) {
            if (
                typeof body.price !== "number" ||
                !Number.isFinite(body.price) ||
                body.price < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Price must be a valid non-negative number",
                });
            }
            updates.price = body.price;
        }

        if ("stock" in body) {
            if (
                typeof body.stock !== "number" ||
                !Number.isInteger(body.stock) ||
                body.stock < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Stock must be a non-negative integer",
                });
            }
            updates.stock = body.stock;
        }

        if ("rating" in body) {
            if (
                typeof body.rating !== "number" ||
                !Number.isFinite(body.rating) ||
                body.rating < 0 ||
                body.rating > 5
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Rating must be a number between 0 and 5",
                });
            }

            updates.rating = body.rating;
        }

        if ("category" in body) {
            if (
                typeof body.category !== "string" ||
                !mongoose.Types.ObjectId.isValid(body.category)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID",
                });
            }

            const categoryExists = await Category.exists({
                _id: body.category,
            });

            if (!categoryExists) {
                return res.status(400).json({
                    success: false,
                    message: "Selected category does not exist",
                });
            }

            updates.category = body.category;
        }

        if ("images" in body) {
            if (
                !Array.isArray(body.images) ||
                !body.images.every(
                    (image: unknown) => typeof image === "string"
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Images must be an array of strings",
                });
            }
            updates.images = body.images;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Provide at least one field to update",
            });
        }

        const product = await Product.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        }).populate("category");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product,
        });
    } catch (error) {
        console.error("Update product error:", error);

        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update product",
        });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        const orderReference = await Order.exists({
            "items.product": product._id,
        });

        if (orderReference) {
            return res.status(409).json({
                success: false,
                message: "Cannot delete a product referenced by an order",
            });
        }

        await Cart.updateMany(
            { "items.product": product._id },
            { $pull: { items: { product: product._id } } }
        );

        await Product.findByIdAndDelete(product._id);

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error) {
        console.error("Delete product error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete product",
        });
    }
};