import { Request, Response } from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import "../models/Category.js";
import Category from "../models/Category.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";

export const getProducts = async (req: Request, res: Response) => {
    try {
        // 1. Read and validate pagination parameters
        const pageParam = req.query.page;
        const limitParam = req.query.limit;

        if (
            pageParam !== undefined &&
            (
                typeof pageParam !== "string" ||
                !/^[1-9]\d*$/.test(pageParam) ||
                !Number.isSafeInteger(Number(pageParam))
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Page must be a positive integer",
            });
        }

        if (
            limitParam !== undefined &&
            (
                typeof limitParam !== "string" ||
                !/^[1-9]\d*$/.test(limitParam) ||
                !Number.isSafeInteger(Number(limitParam)) ||
                Number(limitParam) > 100
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Limit must be an integer between 1 and 100",
            });
        }

        const page = pageParam === undefined ? 1 : Number(pageParam);
        const limit = limitParam === undefined ? 10 : Number(limitParam);

        const searchParam = req.query.search;
        const searchArrayParam = req.query["search[]"];

        if (
            searchParam !== undefined &&
            typeof searchParam !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Search must be a string",
            });
        }

        if (searchArrayParam !== undefined) {
            return res.status(400).json({
                success: false,
                message: "Search must be a string",
            });
        }

        const search =
            typeof searchParam === "string"
                ? searchParam.trim()
                : "";

        const categoryParam = req.query.category;
        const categoryArrayParam = req.query["category[]"];

        if (
            categoryParam !== undefined &&
            typeof categoryParam !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Category must be a string",
            });
        }

        if (categoryArrayParam !== undefined) {
            return res.status(400).json({
                success: false,
                message: "Category must be a string",
            });
        }

        const category =
            typeof categoryParam === "string"
                ? categoryParam.trim()
                : "";

        // 2. Validate price filters
        const minPriceArrayParam = req.query["minPrice[]"];
        const maxPriceArrayParam = req.query["maxPrice[]"];

        if (
            minPriceArrayParam !== undefined ||
            maxPriceArrayParam !== undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Price filters must be single numeric values",
            });
        }

        const minPriceParam = req.query.minPrice;
        const maxPriceParam = req.query.maxPrice;

        if (
            minPriceParam !== undefined &&
            (
                typeof minPriceParam !== "string" ||
                minPriceParam.trim() === "" ||
                !Number.isFinite(Number(minPriceParam)) ||
                Number(minPriceParam) < 0
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Minimum price must be a valid non-negative number",
            });
        }

        if (
            maxPriceParam !== undefined &&
            (
                typeof maxPriceParam !== "string" ||
                maxPriceParam.trim() === "" ||
                !Number.isFinite(Number(maxPriceParam)) ||
                Number(maxPriceParam) < 0
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Maximum price must be a valid non-negative number",
            });
        }

        const minPrice =
            minPriceParam !== undefined
                ? Number(minPriceParam)
                : undefined;

        const maxPrice =
            maxPriceParam !== undefined
                ? Number(maxPriceParam)
                : undefined;

        if (
            minPrice !== undefined &&
            maxPrice !== undefined &&
            minPrice > maxPrice
        ) {
            return res.status(400).json({
                success: false,
                message: "Minimum price cannot exceed maximum price",
            });
        }

        // 3. Validate sorting against supported options
        if (req.query["sort[]"] !== undefined) {
            return res.status(400).json({
                success: false,
                message: "Sort must be a string",
            });
        }

        const sortParam = req.query.sort;

        if (
            sortParam !== undefined &&
            typeof sortParam !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Sort must be a string",
            });
        }

        const sort =
            typeof sortParam === "string"
                ? sortParam
                : "popular";

        const sortOptionsByKey: Record<
            string,
            Record<string, 1 | -1>
        > = {
            popular: { createdAt: -1, _id: -1 },
            "price-low": { price: 1, _id: 1 },
            "price-high": { price: -1, _id: -1 },
            rating: { rating: -1, _id: -1 },
        };

        if (!Object.prototype.hasOwnProperty.call(sortOptionsByKey, sort)) {
            return res.status(400).json({
                success: false,
                message: "Unsupported sort option",
            });
        }

        const sortOptions = sortOptionsByKey[sort];

        // 4. Build MongoDB filter
        const filter: Record<string, unknown> = {};

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

        if (category) {
            if (!mongoose.Types.ObjectId.isValid(category)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID",
                });
            }

            filter.category = new mongoose.Types.ObjectId(category);
        }

        // Apply both price bounds together when provided
        if (minPrice !== undefined || maxPrice !== undefined) {
            const priceFilter: {
                $gte?: number;
                $lte?: number;
            } = {};

            if (minPrice !== undefined) {
                priceFilter.$gte = minPrice;
            }

            if (maxPrice !== undefined) {
                priceFilter.$lte = maxPrice;
            }

            filter.price = priceFilter;
        }

        // 5. Calculate pagination
        const skip = (page - 1) * limit;

        // 6. Filter, sort, and paginate on the database
        const [products, totalProducts] = await Promise.all([
            Product.find(filter)
                .populate("category")
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .lean(),

            Product.countDocuments(filter),
        ]);

        // 7. Calculate pagination metadata
        const totalPages = Math.ceil(totalProducts / limit);

        // 8. Return the existing response structure
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
        if (
            typeof req.body !== "object" ||
            req.body === null ||
            Array.isArray(req.body)
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid product object is required",
            });
        }

        const { name, description, price, category, stock, images, rating } = req.body;

        if (
            typeof name !== "string" || !name.trim() ||
            typeof description !== "string" || !description.trim() ||
            price === undefined || stock === undefined ||
            category === undefined || category === null || category === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, description, price, category, and stock are required",
            });
        }

        if (typeof category !== "string") {
            return res.status(400).json({
                success: false,
                message: "Category must be a string",
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