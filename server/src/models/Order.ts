import mongoose, { Document, Schema } from "mongoose";

export interface IShippingAddress {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    landmark?: string;
}

export interface IOrderItem {
    product: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    lineTotal: number;
}

export interface IOrder extends Document {
    user: mongoose.Types.ObjectId;
    items: IOrderItem[];
    shippingAddress: IShippingAddress;
    subtotal: number;
    shippingFee: number;
    discount: number;
    total: number;
    status:
        | "pending"
        | "confirmed"
        | "shipped"
        | "delivered"
        | "cancelled";
}

const shippingAddressSchema = new Schema<IShippingAddress>(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        addressLine1: {
            type: String,
            required: true,
            trim: true,
        },
        addressLine2: {
            type: String,
            trim: true,
            default: "",
        },
        city: {
            type: String,
            required: true,
            trim: true,
        },
        state: {
            type: String,
            required: true,
            trim: true,
        },
        postalCode: {
            type: String,
            required: true,
            trim: true,
        },
        landmark: {
            type: String,
            trim: true,
            default: "",
        },
    },
    { _id: false }
);

const orderItemSchema = new Schema<IOrderItem>(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            validate: {
                validator: Number.isInteger,
                message: "Quantity must be an integer",
            },
        },
        lineTotal: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false }
);

const orderSchema = new Schema<IOrder>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: (items: IOrderItem[]) =>
                    items.length > 0,
                message: "An order must contain at least one item",
            },
        },
        shippingAddress: {
            type: shippingAddressSchema,
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
            min: 0,
            default: 0,
        },
        discount: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        total: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "shipped",
                "delivered",
                "cancelled",
            ],
            default: "pending",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model<IOrder>("Order", orderSchema);

export default Order;