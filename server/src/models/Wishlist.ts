import mongoose, { Document, Schema } from "mongoose";

export interface IWishlist extends Document {
    user: mongoose.Types.ObjectId;
    products: mongoose.Types.ObjectId[];
}

const wishlistSchema = new Schema<IWishlist>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Wishlist user is required"],
            unique: true,
        },
        products: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                },
            ],
            default: [],
        },
    },
    { timestamps: true }
);

const Wishlist = mongoose.model<IWishlist>(
    "Wishlist",
    wishlistSchema
);

export default Wishlist;