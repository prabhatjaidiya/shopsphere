import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";

const ORDER_STATUSES = [
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
] as const;

type OrderStatus = (typeof ORDER_STATUSES)[number];

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
};

// GET /api/admin/orders?page=1&limit=10
export const getAllOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const pageValue = req.query.page ?? "1";
        const limitValue = req.query.limit ?? "10";

        if (
            typeof pageValue !== "string" ||
            typeof limitValue !== "string" ||
            !/^[1-9]\d*$/.test(pageValue) ||
            !/^[1-9]\d*$/.test(limitValue)
        ) {
            return res.status(400).json({
                success: false,
                message: "Page and limit must be positive integers",
            });
        }

        const page = Number(pageValue);
        const limit = Number(limitValue);

        if (
            !Number.isSafeInteger(page) ||
            !Number.isSafeInteger(limit) ||
            limit > 50
        ) {
            return res.status(400).json({
                success: false,
                message: "Page must be a safe integer and limit cannot exceed 50",
            });
        }

        const skip = (page - 1) * limit;

        if (!Number.isSafeInteger(skip)) {
            return res.status(400).json({
                success: false,
                message: "Invalid pagination values",
            });
        }

        const [orders, totalOrders] = await Promise.all([
            Order.find()
                .populate("user", "name email")
                .sort({ createdAt: -1, _id: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Order.countDocuments(),
        ]);

        return res.status(200).json({
            success: true,
            data: orders,
            pagination: {
                page,
                limit,
                totalOrders,
                totalPages: Math.ceil(totalOrders / limit),
                hasNextPage: page * limit < totalOrders,
                hasPreviousPage: page > 1,
            },
        });
    } catch (error) {
        return next(error);
    }
};

// GET /api/admin/orders/:orderId
export const getOrderById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const orderId = req.params.orderId;

        if (typeof orderId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }

        const order = await Order.findById(orderId)
            .populate("user", "name email")
            .lean();

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: order,
        });
    } catch (error) {
        return next(error);
    }
};

// PATCH /api/admin/orders/:orderId/status
export const updateOrderStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const orderId = req.params.orderId;

        if (typeof orderId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }
        
        const requestedStatus: unknown = req.body?.status;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }

        if (
            typeof requestedStatus !== "string" ||
            !ORDER_STATUSES.includes(requestedStatus as OrderStatus)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status",
                allowedStatuses: ORDER_STATUSES,
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        const currentStatus = order.status as OrderStatus;
        const nextStatus = requestedStatus as OrderStatus;

        if (!ALLOWED_TRANSITIONS[currentStatus].includes(nextStatus)) {
            return res.status(400).json({
                success: false,
                message: `Cannot transition order from ${currentStatus} to ${nextStatus}`,
            });
        }

        order.status = nextStatus;
        await order.save();

        await order.populate("user", "name email");

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: order,
        });
    } catch (error) {
        return next(error);
    }
};