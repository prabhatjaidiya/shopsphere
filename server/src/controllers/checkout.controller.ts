import type { Request, Response } from "express";
import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { calculateCheckout } from "../services/checkout.service.js";
import { razorpay } from "../services/razorpay.service.js";
import { rupeesToPaise } from "../utils/money.js";
import PaymentAttempt from "../models/PaymentAttempt.js";
import { createHmac, timingSafeEqual } from "node:crypto";
import { finalizePaidOrder } from "../services/payment-finalization.service.js";

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

const requiredFields = [
    "fullName",
    "phone",
    "addressLine1",
    "city",
    "state",
    "postalCode",
] as const;

export const validateCheckout = async (
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

        const checkout = await calculateCheckout(
            userId,
            req.body?.shippingAddress
        );

        return res.status(200).json({
            success: true,
            message: "Checkout details validated successfully",
            data: checkout,
        });
    } catch (error) {
        const code = error instanceof Error ? error.message : "";

        const clientErrors: Record<string, string> = {
            SHIPPING_ADDRESS_REQUIRED: "Shipping address is required",
            INVALID_SHIPPING_ADDRESS: "Please provide a valid shipping address",
            CART_EMPTY: "Your cart is empty",
            INVALID_CART_ITEM: "Cart contains an invalid item or quantity",
            PRODUCT_UNAVAILABLE: "A product in your cart is no longer available",
            INSUFFICIENT_STOCK: "Insufficient stock for one or more products",
            INVALID_PRODUCT_PRICE: "A product has an invalid price",
            INVALID_ORDER_AMOUNT: "The order amount is invalid",
        };

        if (clientErrors[code]) {
            return res.status(400).json({
                success: false,
                message: clientErrors[code],
            });
        }

        console.error("Checkout validation error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to validate checkout",
        });
    }
};

export const createPaymentOrder = async (
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

        const checkout = await calculateCheckout(
            userId,
            req.body?.shippingAddress
        );

        const amount = rupeesToPaise(checkout.subtotal);

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Payment amount must be greater than zero",
            });
        }

        const razorpayOrder = await razorpay.orders.create({
            amount,
            currency: "INR",
            receipt: `checkout_${new mongoose.Types.ObjectId().toString()}`,
            notes: {
                userId,
            },
        });

        const paymentAttempt = await PaymentAttempt.create({
            user: new mongoose.Types.ObjectId(userId),
            items: checkout.items.map((item) => ({
                product: new mongoose.Types.ObjectId(item.productId),
                name: item.name,
                price: item.unitPrice,
                quantity: item.quantity,
                lineTotal: item.lineTotal,
            })),
            shippingAddress: checkout.shippingAddress,
            subtotal: checkout.subtotal,
            shippingFee: 0,
            discount: 0,
            total: checkout.subtotal,
            currency: "INR",
            status: "created",
            razorpayOrderId: razorpayOrder.id,
        });

        return res.status(201).json({
            success: true,
            message: "Payment order created successfully",
            data: {
                paymentAttemptId: paymentAttempt._id,
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                keyId: process.env.RAZORPAY_KEY_ID,
            },
        });
    } catch (error) {
        const code = error instanceof Error ? error.message : "";

        const clientErrors: Record<string, string> = {
            SHIPPING_ADDRESS_REQUIRED: "Shipping address is required",
            INVALID_SHIPPING_ADDRESS: "Please provide a valid shipping address",
            CART_EMPTY: "Your cart is empty",
            INVALID_CART_ITEM: "Cart contains an invalid item or quantity",
            PRODUCT_UNAVAILABLE: "A product in your cart is no longer available",
            INSUFFICIENT_STOCK: "Insufficient stock for one or more products",
            INVALID_PRODUCT_PRICE: "A product has an invalid price",
            INVALID_ORDER_AMOUNT: "The order amount is invalid",
        };

        if (clientErrors[code]) {
            return res.status(400).json({
                success: false,
                message: clientErrors[code],
            });
        }

        console.error("Payment order creation error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create payment order",
        });
    }
};

export const verifyPayment = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const {
            paymentAttemptId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body ?? {};

        if (
            typeof paymentAttemptId !== "string" ||
            !mongoose.Types.ObjectId.isValid(paymentAttemptId) ||
            typeof razorpay_order_id !== "string" ||
            typeof razorpay_payment_id !== "string" ||
            typeof razorpay_signature !== "string" ||
            !/^[a-f0-9]{64}$/i.test(razorpay_signature)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment verification details",
            });
        }

        const attempt = await PaymentAttempt.findOne({
            _id: paymentAttemptId,
            user: userId,
            razorpayOrderId: razorpay_order_id,
        });

        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: "Payment attempt not found",
            });
        }

        if (attempt.order) {
            if (
                !attempt.razorpayPaymentId ||
                attempt.razorpayPaymentId !== razorpay_payment_id
            ) {
                return res.status(409).json({
                    success: false,
                    message: "Payment verification details do not match",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Payment already verified",
                data: {
                    orderId: attempt.order.toString(),
                },
            });
        }

        const secret = process.env.RAZORPAY_KEY_SECRET;

        if (!secret) {
            throw new Error("Missing Razorpay secret");
        }

        const expectedSignature = createHmac("sha256", secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest();

        const receivedSignature = Buffer.from(
            razorpay_signature,
            "hex",
        );

        if (
            expectedSignature.length !== receivedSignature.length ||
            !timingSafeEqual(expectedSignature, receivedSignature)
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment signature verification failed",
            });
        }

        // Check payment status directly with Razorpay.
        const payment = await razorpay.payments.fetch(
            razorpay_payment_id,
        );

        if (
            payment.order_id !== razorpay_order_id ||
            payment.amount !== rupeesToPaise(attempt.total) ||
            payment.currency !== "INR" ||
            payment.status !== "captured"
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment is not successfully captured",
            });
        }

        await PaymentAttempt.updateOne(
            {
                _id: paymentAttemptId,
                user: userId,
                status: "paid",
                order: { $exists: false },
            },
            {
                $set: { status: "recovery_required" },
            },
        );

        if (
            attempt.status === "failed"
        ) {
            return res.status(409).json({
                success: false,
                message: "This payment attempt cannot be finalized",
            });
        }

        if (attempt.status === "created") {
            attempt.status = "paid";
            attempt.razorpayPaymentId = razorpay_payment_id;
            await attempt.save();
        } else if (attempt.status === "recovery_required") {
            if (attempt.razorpayPaymentId !== razorpay_payment_id) {
                return res.status(409).json({
                    success: false,
                    message: "Payment ID does not match this attempt",
                });
            }

            attempt.status = "paid";
            await attempt.save();
        } else if (
            attempt.razorpayPaymentId !== razorpay_payment_id
        ) {
            return res.status(409).json({
                success: false,
                message: "Payment ID does not match this attempt",
            });
        }

        const orderId = await finalizePaidOrder(
            paymentAttemptId,
            userId,
        );

        return res.status(200).json({
            success: true,
            message: "Payment verified and order finalized",
            data: { orderId },
        });
    } catch (error) {
        const code = error instanceof Error ? error.message : "";

        if (
            code === "INSUFFICIENT_STOCK_AFTER_PAYMENT" ||
            code === "CART_CHANGED_AFTER_PAYMENT" ||
            code === "PRODUCT_UNAVAILABLE"
        ) {
            console.error("Paid checkout requires recovery:", error);

            return res.status(409).json({
                success: false,
                message:
                    "Payment was captured, but the order needs recovery. Please contact support.",
                code: "PAID_ORDER_RECOVERY_REQUIRED",
            });
        }

        if (
            code === "PAYMENT_NOT_VERIFIED" ||
            code === "PAYMENT_DETAILS_MISSING"
        ) {
            return res.status(409).json({
                success: false,
                message: "Payment cannot be finalized",
            });
        }

        console.error("Payment verification error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to verify or finalize payment",
        });
    }
};