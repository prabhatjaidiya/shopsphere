import type { Request, Response } from "express";
import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

type ShippingAddress = {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    landmark?: string;
};

const requiredAddressFields = [
    "fullName",
    "phone",
    "addressLine1",
    "city",
    "state",
    "postalCode",
] as const;

const validateShippingAddress = (
    rawAddress: unknown
): ShippingAddress | null => {
    if (
        !rawAddress ||
        typeof rawAddress !== "object" ||
        Array.isArray(rawAddress)
    ) {
        return null;
    }

    const raw = rawAddress as Record<string, unknown>;

    const address: ShippingAddress = {
        fullName:
            typeof raw.fullName === "string"
                ? raw.fullName.trim()
                : "",
        phone:
            typeof raw.phone === "string"
                ? raw.phone.trim()
                : "",
        addressLine1:
            typeof raw.addressLine1 === "string"
                ? raw.addressLine1.trim()
                : "",
        addressLine2:
            typeof raw.addressLine2 === "string"
                ? raw.addressLine2.trim()
                : "",
        city:
            typeof raw.city === "string"
                ? raw.city.trim()
                : "",
        state:
            typeof raw.state === "string"
                ? raw.state.trim()
                : "",
        postalCode:
            typeof raw.postalCode === "string"
                ? raw.postalCode.trim()
                : "",
        landmark:
            typeof raw.landmark === "string"
                ? raw.landmark.trim()
                : "",
    };

    const missingFields = requiredAddressFields.filter(
        (field) => !address[field]
    );

    if (missingFields.length > 0) {
        return null;
    }

    const phoneRegex = /^(?:\+91[\s-]?)?[6-9]\d{9}$/;
    const postalCodeRegex = /^\d{6}$/;

    if (
        !phoneRegex.test(address.phone) ||
        !postalCodeRegex.test(address.postalCode)
    ) {
        return null;
    }

    return address;
};

export const createOrder = async (
    req: Request,
    res: Response
) => {
    const session = await mongoose.startSession();

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

        const shippingAddress = validateShippingAddress(
            req.body?.shippingAddress
        );

        if (!shippingAddress) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid shipping address",
            });
        }

        let createdOrder: InstanceType<typeof Order> | null = null;

        await session.withTransaction(async () => {
            const cart = await Cart.findOne({ user: userId })
                .session(session);

            if (!cart || cart.items.length === 0) {
                throw new Error("CART_EMPTY");
            }

            const requestedItems = new Map<string, number>();

            for (const item of cart.items) {
                const productId = item.product.toString();
                const quantity = item.quantity;

                if (
                    !mongoose.Types.ObjectId.isValid(productId) ||
                    !Number.isInteger(quantity) ||
                    quantity < 1
                ) {
                    throw new Error("INVALID_CART_ITEM");
                }

                // Combine duplicate product references safely.
                requestedItems.set(
                    productId,
                    (requestedItems.get(productId) ?? 0) + quantity
                );
            }

            const productIds = Array.from(requestedItems.keys());

            const products = await Product.find({
                _id: { $in: productIds },
            })
                .session(session);

            if (products.length !== productIds.length) {
                throw new Error("PRODUCT_UNAVAILABLE");
            }

            const productMap = new Map(
                products.map((product) => [
                    product._id.toString(),
                    product,
                ])
            );

            const orderItems = [];
            let subtotal = 0;

            for (const [productId, quantity] of requestedItems) {
                const product = productMap.get(productId);

                if (!product) {
                    throw new Error("PRODUCT_UNAVAILABLE");
                }

                if (quantity > product.stock) {
                    throw new Error("INSUFFICIENT_STOCK");
                }

                if (
                    !Number.isFinite(product.price) ||
                    product.price < 0
                ) {
                    throw new Error("INVALID_PRODUCT_PRICE");
                }

                const lineTotal = product.price * quantity;

                if (!Number.isSafeInteger(lineTotal)) {
                    throw new Error("INVALID_ORDER_AMOUNT");
                }

                subtotal += lineTotal;

                if (!Number.isSafeInteger(subtotal)) {
                    throw new Error("INVALID_ORDER_AMOUNT");
                }

                orderItems.push({
                    product: product._id,
                    name: product.name,
                    price: product.price,
                    quantity,
                    lineTotal,
                });
            }

            const shippingFee = 0;
            const discount = 0;
            const total = subtotal + shippingFee - discount;

            if (!Number.isSafeInteger(total) || total < 0) {
                throw new Error("INVALID_ORDER_AMOUNT");
            }

            // Atomically reserve stock within the transaction.
            for (const [productId, quantity] of requestedItems) {
                const result = await Product.updateOne(
                    {
                        _id: productId,
                        stock: { $gte: quantity },
                    },
                    {
                        $inc: { stock: -quantity },
                    },
                    { session }
                );

                if (result.modifiedCount !== 1) {
                    throw new Error("INSUFFICIENT_STOCK");
                }
            }

            const [order] = await Order.create(
                [
                    {
                        user: new mongoose.Types.ObjectId(userId),
                        items: orderItems,
                        shippingAddress,
                        subtotal,
                        shippingFee,
                        discount,
                        total,
                        status: "pending",
                    },
                ],
                { session }
            );

            createdOrder = order;

            cart.items = [];
            await cart.save({ session });
        });

        if (!createdOrder) {
            throw new Error("ORDER_CREATION_FAILED");
        }

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: createdOrder,
        });
    } catch (error) {
        const errorCode =
            error instanceof Error ? error.message : "";

        if (errorCode === "CART_EMPTY") {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty",
            });
        }

        if (errorCode === "INVALID_CART_ITEM") {
            return res.status(400).json({
                success: false,
                message: "Cart contains an invalid item or quantity",
            });
        }

        if (errorCode === "PRODUCT_UNAVAILABLE") {
            return res.status(400).json({
                success: false,
                message: "A product in your cart is no longer available",
            });
        }

        if (errorCode === "INSUFFICIENT_STOCK") {
            return res.status(409).json({
                success: false,
                message: "Insufficient stock for one or more products",
            });
        }

        if (errorCode === "INVALID_PRODUCT_PRICE") {
            return res.status(400).json({
                success: false,
                message: "A product has an invalid price",
            });
        }

        if (errorCode === "INVALID_ORDER_AMOUNT") {
            return res.status(400).json({
                success: false,
                message: "The order amount is invalid",
            });
        }

        console.error("Order creation error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create order",
        });
    } finally {
        await session.endSession();
    }
};

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