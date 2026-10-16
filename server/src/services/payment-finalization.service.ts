import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import PaymentAttempt from "../models/PaymentAttempt.js";
import Product from "../models/Product.js";

export const finalizePaidOrder = async (
    paymentAttemptId: string,
    userId: string,
) => {
    const session = await mongoose.startSession();

    try {
        let finalizedOrderId: string | null = null;

        await session.withTransaction(async () => {
            const attempt = await PaymentAttempt.findOne({
                _id: paymentAttemptId,
                user: userId,
            }).session(session);

            if (!attempt || attempt.status !== "paid") {
                throw new Error("PAYMENT_NOT_VERIFIED");
            }

            // Idempotency: reuse the existing order.
            if (attempt.order) {
                finalizedOrderId = attempt.order.toString();
                return;
            }

            if (!attempt.razorpayPaymentId) {
                throw new Error("PAYMENT_DETAILS_MISSING");
            }

            const cart = await Cart.findOne({
                user: userId,
            }).session(session);

            if (!cart || cart.items.length === 0) {
                throw new Error("CART_EMPTY");
            }

            // Aggregate quantities to handle duplicate product IDs.
            const quantities = new Map<string, number>();

            for (const item of cart.items) {
                const productId = item.product.toString();
                quantities.set(
                    productId,
                    (quantities.get(productId) ?? 0) + item.quantity,
                );
            }

            const products = await Product.find({
                _id: { $in: [...quantities.keys()] },
            }).session(session);

            if (products.length !== quantities.size) {
                throw new Error("PRODUCT_UNAVAILABLE");
            }

            const productMap = new Map(
                products.map((product) => [
                    product._id.toString(),
                    product,
                ]),
            );

            // Verify that the current cart still matches the paid snapshot.
            if (quantities.size !== attempt.items.length) {
                throw new Error("CART_CHANGED_AFTER_PAYMENT");
            }

            for (const paidItem of attempt.items) {
                const productId = paidItem.product.toString();
                const product = productMap.get(productId);

                if (
                    !product ||
                    quantities.get(productId) !== paidItem.quantity ||
                    product.name !== paidItem.name ||
                    Math.round(product.price * 100) !==
                    Math.round(paidItem.price * 100)
                ) {
                    throw new Error("CART_CHANGED_AFTER_PAYMENT");
                }

                if (product.stock < paidItem.quantity) {
                    throw new Error("INSUFFICIENT_STOCK_AFTER_PAYMENT");
                }
            }

            // Decrement stock atomically inside the transaction.
            for (const paidItem of attempt.items) {
                const result = await Product.updateOne(
                    {
                        _id: paidItem.product,
                        stock: { $gte: paidItem.quantity },
                    },
                    {
                        $inc: { stock: -paidItem.quantity },
                    },
                    { session },
                );

                if (result.modifiedCount !== 1) {
                    throw new Error("INSUFFICIENT_STOCK_AFTER_PAYMENT");
                }
            }

            const [order] = await Order.create(
                [
                    {
                        user: attempt.user,
                        items: attempt.items,
                        shippingAddress: attempt.shippingAddress,
                        subtotal: attempt.subtotal,
                        shippingFee: attempt.shippingFee,
                        discount: attempt.discount,
                        total: attempt.total,
                        status: "pending",
                        paymentStatus: "paid",
                        razorpayOrderId: attempt.razorpayOrderId,
                        razorpayPaymentId: attempt.razorpayPaymentId,
                    },
                ],
                { session },
            );

            await Cart.updateOne(
                { _id: cart._id, user: userId },
                { $set: { items: [] } },
                { session },
            );

            attempt.order = order._id;
            await attempt.save({ session });

            finalizedOrderId = order._id.toString();
        });

        if (!finalizedOrderId) {
            throw new Error("ORDER_FINALIZATION_FAILED");
        }

        return finalizedOrderId;
    } catch (error) {
        // Another request may have finalized this payment first.
        const attempt = await PaymentAttempt.findOne({
            _id: paymentAttemptId,
            user: userId,
        }).select("order");

        if (attempt?.order) {
            return attempt.order.toString();
        }

        throw error;
    } finally {
        await session.endSession();
    }
};