import mongoose, { Schema, type Document } from "mongoose";
import type { IShippingAddress, IOrderItem } from "./Order.js";

export interface IPaymentAttempt extends Document {
    user: mongoose.Types.ObjectId;
    items: IOrderItem[];
    shippingAddress: IShippingAddress;
    subtotal: number;
    shippingFee: number;
    discount: number;
    total: number;
    currency: "INR";
    status: "created" | "paid" | "failed" | "recovery_required";
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    createdAt: Date;
    updatedAt: Date;
    order?: mongoose.Types.ObjectId;
}

const paymentAttemptSchema = new Schema<IPaymentAttempt>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        items: {
            type: [{
                product: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                name: { type: String, required: true },
                price: { type: Number, required: true, min: 0 },
                quantity: { type: Number, required: true, min: 1 },
                lineTotal: { type: Number, required: true, min: 0 },
            }],
            required: true,
        },
        shippingAddress: {
            type: Schema.Types.Mixed,
            required: true,
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
        shippingFee: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        discount: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        total: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            enum: ["INR"],
            required: true,
            default: "INR",
        },
        status: {
            type: String,
            enum: ["created", "paid", "failed", "recovery_required"],
            required: true,
            default: "created",
        },
        razorpayOrderId: {
            type: String,
            required: true,
            unique: true,
        },
        razorpayPaymentId: {
            type: String,
            sparse: true,
        },
        order: {
            type: Schema.Types.ObjectId,
            ref: "Order",
        },
    },
    { timestamps: true }
);

const PaymentAttempt = mongoose.model<IPaymentAttempt>(
    "PaymentAttempt",
    paymentAttemptSchema
);

export default PaymentAttempt;