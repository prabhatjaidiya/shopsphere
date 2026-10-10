import { Request, Response } from "express";
import mongoose from "mongoose";
import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

export const getWishlist = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user?.userId;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const wishlist = await Wishlist.findOne({ user: userId })
            .populate("products", "name price stock images")
            .lean();

        return res.status(200).json({
            success: true,
            data: wishlist ?? { products: [] },
        });
    } catch (error) {
        console.error("Get wishlist error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch wishlist",
        });
    }
};

export const addToWishlist = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user?.userId;
        const { productId } = req.body;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        if (
            typeof productId !== "string" ||
            !mongoose.Types.ObjectId.isValid(productId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const product = await Product.findById(productId).select("_id");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        let wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: userId,
                products: [product._id],
            });
        } else if (
            !wishlist.products.some(
                (id) => id.toString() === productId
            )
        ) {
            wishlist.products.push(product._id);
            await wishlist.save();
        }

        await wishlist.populate("products", "name price stock images");

        return res.status(200).json({
            success: true,
            message: "Product added to wishlist",
            data: wishlist,
        });
    } catch (error) {
        console.error("Add to wishlist error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to add product to wishlist",
        });
    }
};

export const removeFromWishlist = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user?.userId;
        const { productId } = req.params;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        if (
            typeof productId !== "string" ||
            !mongoose.Types.ObjectId.isValid(productId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: "Wishlist not found",
            });
        }

        const index = wishlist.products.findIndex(
            (id) => id.toString() === productId
        );

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not found in wishlist",
            });
        }

        wishlist.products.splice(index, 1);
        await wishlist.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist",
            data: wishlist,
        });
    } catch (error) {
        console.error("Remove from wishlist error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to remove product from wishlist",
        });
    }
};