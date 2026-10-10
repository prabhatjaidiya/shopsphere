import { Request, Response } from "express";
import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import "../models/Product.js";

export const getCart = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const cart = await Cart.findOne({ user: userId })
            .populate({
                path: "items.product",
                select: "name price stock images",
            })
            .lean();

        if (!cart) {
            return res.status(200).json({
                success: true,
                data: {
                    items: [],
                },
            });
        }

        return res.status(200).json({
            success: true,
            data: cart,
        });
    } catch (error) {
        console.error("Get cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch cart",
        });
    }
};

export const addToCart = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const { productId } = req.body;
        const quantity = req.body.quantity ?? 1;

        if (
            typeof productId !== "string" ||
            !mongoose.Types.ObjectId.isValid(productId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        if (
            typeof quantity !== "number" ||
            !Number.isInteger(quantity) ||
            quantity < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer",
            });
        }

        const product = await mongoose.model("Product").findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        let cart = await Cart.findOne({ user: userId });

        const existingItem = cart?.items.find(
            (item) => item.product.toString() === productId
        );

        const newQuantity = existingItem
            ? existingItem.quantity + quantity
            : quantity;

        if (newQuantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} units are currently in stock`,
            });
        }

        if (!cart) {
            cart = await Cart.create({
                user: userId,
                items: [{ product: productId, quantity }],
            });
        } else if (existingItem) {
            existingItem.quantity = newQuantity;
            await cart.save();
        } else {
            cart.items.push({
                product: new mongoose.Types.ObjectId(productId),
                quantity,
            });
            await cart.save();
        }

        await cart.populate({
            path: "items.product",
            select: "name price stock images",
        });

        return res.status(200).json({
            success: true,
            message: "Product added to cart",
            data: cart,
        });
    } catch (error) {
        console.error("Add to cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to add product to cart",
        });
    }
};

export const updateCartItem = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user?.userId;
        const { productId } = req.params;
        const { quantity } = req.body;

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

        if (
            typeof quantity !== "number" ||
            !Number.isInteger(quantity) ||
            quantity < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer",
            });
        }

        const product = await mongoose
            .model("Product")
            .findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} units are currently in stock`,
            });
        }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        const item = cart.items.find(
            (cartItem) => cartItem.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart",
            });
        }

        item.quantity = quantity;
        await cart.save();

        await cart.populate({
            path: "items.product",
            select: "name price stock images",
        });

        return res.status(200).json({
            success: true,
            message: "Cart quantity updated",
            data: cart,
        });
    } catch (error) {
        console.error("Update cart item error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update cart item",
        });
    }
};

export const removeCartItem = async (
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

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart",
            });
        }

        cart.items.splice(itemIndex, 1);
        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            data: cart,
        });
    } catch (error) {
        console.error("Remove cart item error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to remove cart item",
        });
    }
};