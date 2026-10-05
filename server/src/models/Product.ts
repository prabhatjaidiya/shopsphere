import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    category: mongoose.Types.ObjectId;
    stock: number;
    images: string[];
    rating: number;
}

const productSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
        },

        description: {
            type: String,
            required: [true, "Product description is required"],
            trim: true,
        },

        price: {
            type: Number,
            required: [true, "Product price is required"],
            min: [0, "Price cannot be negative"],
        },

        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Product category is required"],
        },

        stock: {
            type: Number,
            required: [true, "Product stock is required"],
            min: [0, "Stock cannot be negative"],
        },

        images: {
            type: [String],
            default: [],
        },

        rating: {
            type: Number,
            min: [0, "Rating cannot be less than 0"],
            max: [5, "Rating cannot be greater than 5"],
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;