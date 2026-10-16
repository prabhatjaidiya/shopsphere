import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export type ShippingAddress = {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    landmark?: string;
};

export type CheckoutLineItem = {
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
};

export type CheckoutData = {
    shippingAddress: ShippingAddress;
    items: CheckoutLineItem[];
    subtotal: number;
    currency: "INR";
};

const requiredFields = [
    "fullName",
    "phone",
    "addressLine1",
    "city",
    "state",
    "postalCode",
] as const;

export const validateShippingAddress = (
    rawAddress: unknown
): ShippingAddress => {
    if (
        !rawAddress ||
        typeof rawAddress !== "object" ||
        Array.isArray(rawAddress)
    ) {
        throw new Error("SHIPPING_ADDRESS_REQUIRED");
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

    const missingFields = requiredFields.filter(
        (field) => !address[field]
    );

    if (missingFields.length > 0) {
        throw new Error("INVALID_SHIPPING_ADDRESS");
    }

    const phoneRegex = /^(?:\+91[\s-]?)?[6-9]\d{9}$/;
    const postalCodeRegex = /^\d{6}$/;

    if (
        !phoneRegex.test(address.phone) ||
        !postalCodeRegex.test(address.postalCode)
    ) {
        throw new Error("INVALID_SHIPPING_ADDRESS");
    }

    return address;
};

export const calculateCheckout = async (
    userId: string,
    rawAddress: unknown
): Promise<CheckoutData> => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("INVALID_USER");
    }

    const shippingAddress = validateShippingAddress(rawAddress);

    const cart = await Cart.findOne({ user: userId }).lean();

    if (!cart || cart.items.length === 0) {
        throw new Error("CART_EMPTY");
    }

    const quantities = new Map<string, number>();

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

        quantities.set(
            productId,
            (quantities.get(productId) ?? 0) + quantity
        );
    }

    const productIds = [...quantities.keys()];

    const products = await Product.find({
        _id: { $in: productIds },
    })
        .select("name price stock")
        .lean();

    if (products.length !== productIds.length) {
        throw new Error("PRODUCT_UNAVAILABLE");
    }

    const productMap = new Map(
        products.map((product) => [
            product._id.toString(),
            product,
        ])
    );

    const items: CheckoutLineItem[] = [];
    let subtotalPaise = 0;

    for (const [productId, quantity] of quantities) {
        const product = productMap.get(productId);

        if (!product) {
            throw new Error("PRODUCT_UNAVAILABLE");
        }

        if (quantity > product.stock) {
            throw new Error("INSUFFICIENT_STOCK");
        }

        if (
            !Number.isFinite(product.price) ||
            product.price < 0 ||
            Math.round(product.price * 100) !==
            product.price * 100
        ) {
            throw new Error("INVALID_PRODUCT_PRICE");
        }

        const unitPricePaise = Math.round(product.price * 100);
        const lineTotalPaise = unitPricePaise * quantity;

        if (!Number.isSafeInteger(lineTotalPaise)) {
            throw new Error("INVALID_ORDER_AMOUNT");
        }

        subtotalPaise += lineTotalPaise;

        if (!Number.isSafeInteger(subtotalPaise)) {
            throw new Error("INVALID_ORDER_AMOUNT");
        }

        items.push({
            productId,
            name: product.name,
            quantity,
            unitPrice: unitPricePaise / 100,
            lineTotal: lineTotalPaise / 100,
        });
    }

    return {
        shippingAddress,
        items,
        subtotal: subtotalPaise / 100,
        currency: "INR",
    };
};