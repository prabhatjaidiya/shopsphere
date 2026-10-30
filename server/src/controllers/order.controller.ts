import type { Request, Response } from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";

export const getMyOrders = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user?.userId;

        if (
            !userId ||
            !mongoose.Types.ObjectId.isValid(userId)
        ) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const orders = await Order.find({ user: userId })
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (error) {
        console.error("Order history error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve order history",
        });
    }
};