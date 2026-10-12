import type { Request, Response } from "express";
import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

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

        // 1. Validate authenticated user
        if (
            !userId ||
            !mongoose.Types.ObjectId.isValid(userId)
        ) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        // 2. Validate shipping address payload
        const rawAddress = req.body?.shippingAddress;

        if (
            !rawAddress ||
            typeof rawAddress !== "object" ||
            Array.isArray(rawAddress)
        ) {
            return res.status(400).json({
                success: false,
                message: "Shipping address is required",
            });
        }

        const address: ShippingAddress = {
            fullName:
                typeof rawAddress.fullName === "string"
                    ? rawAddress.fullName.trim()
                    : "",
            phone:
                typeof rawAddress.phone === "string"
                    ? rawAddress.phone.trim()
                    : "",
            addressLine1:
                typeof rawAddress.addressLine1 === "string"
                    ? rawAddress.addressLine1.trim()
                    : "",
            addressLine2:
                typeof rawAddress.addressLine2 === "string"
                    ? rawAddress.addressLine2.trim()
                    : "",
            city:
                typeof rawAddress.city === "string"
                    ? rawAddress.city.trim()
                    : "",
            state:
                typeof rawAddress.state === "string"
                    ? rawAddress.state.trim()
                    : "",
            postalCode:
                typeof rawAddress.postalCode === "string"
                    ? rawAddress.postalCode.trim()
                    : "",
            landmark:
                typeof rawAddress.landmark === "string"
                    ? rawAddress.landmark.trim()
                    : "",
        };

        const missingFields = requiredFields.filter(
            (field) => !address[field]
        );

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required shipping fields",
                errors: missingFields,
            });
        }

        // 3. Validate Indian mobile number
        const phoneRegex = /^(?:\+91[\s-]?)?[6-9]\d{9}$/;

        if (!phoneRegex.test(address.phone)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid Indian mobile number",
            });
        }

        // 4. Validate Indian PIN code format
        const postalCodeRegex = /^\d{6}$/;

        if (!postalCodeRegex.test(address.postalCode)) {
            return res.status(400).json({
                success: false,
                message: "PIN code must contain exactly six digits",
            });
        }

        // 5. Retrieve the authenticated user's cart
        const cart = await Cart.findOne({ user: userId }).lean();

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty",
            });
        }

        // 6. Fetch current product data and calculate trusted totals
        const lineItems: {
            productId: string;
            name: string;
            quantity: number;
            unitPrice: number;
            lineTotal: number;
        }[] = [];

        let subtotal = 0;

        for (const item of cart.items) {
            const productId = item.product.toString();
            const quantity = item.quantity;

            if (
                !Number.isInteger(quantity) ||
                quantity < 1
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Cart contains an invalid quantity",
                });
            }

            const product = await Product.findById(productId)
                .select("name price stock")
                .lean();

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: "A product in your cart is no longer available",
                    productId,
                });
            }

            if (quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`,
                    productId,
                    availableStock: product.stock,
                    requestedQuantity: quantity,
                });
            }

            const lineTotal = product.price * quantity;

            subtotal += lineTotal;

            lineItems.push({
                productId,
                name: product.name,
                quantity,
                unitPrice: product.price,
                lineTotal,
            });
        }

        // 7. Return a validated checkout preview.
        // No order is created and no payment is processed here.
        return res.status(200).json({
            success: true,
            message: "Checkout details validated successfully",
            data: {
                shippingAddress: address,
                items: lineItems,
                subtotal,
                currency: "INR",
            },
        });
    } catch (error) {
        console.error("Checkout validation error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to validate checkout",
        });
    }
};