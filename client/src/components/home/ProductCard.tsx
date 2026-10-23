import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import type { Product } from "../../data/products";

interface ProductCardProps {
    product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
    const { addToCart } = useCart();
    const [cartMessage, setCartMessage] = useState("");

    const { id, name, price, rating } = product;

    const { token } = useAuth();
    const { wishlistIds, pendingIds, toggleWishlist } = useWishlist();
    const navigate = useNavigate();

    const [wishlistError, setWishlistError] = useState("");

    const productId = String(id);
    const isWishlisted = wishlistIds.has(productId);
    const isWishlistPending = pendingIds.has(productId);

    const handleToggleWishlist = async () => {
        setWishlistError("");

        if (!token) {
            navigate("/login");
            return;
        }

        try {
            await toggleWishlist(productId);
        } catch (error) {
            setWishlistError(
                error instanceof Error
                    ? error.message
                    : "Failed to update wishlist."
            );
        }
    };

    const [isAdding, setIsAdding] = useState(false);
    const [cartError, setCartError] = useState("");

    const handleAddToCart = async () => {
        setIsAdding(true);
        setCartMessage("");
        setCartError("");

        try {
            await addToCart(product, 1);
            setCartMessage(`${product.name} added to your cart!`);
        } catch (error) {
            setCartError(
                error instanceof Error
                    ? error.message
                    : "Failed to add product to cart."
            );
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="relative">
                <Link
                    to={`/products/${id}`}
                    aria-label={`View details for ${name}`}
                    className="block"
                >
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-gray-100">
                        {product.images?.[0] ? (
                            <img
                                src={product.images[0]}
                                alt={name}
                                loading="lazy"
                                onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                }}
                                className="block h-full w-full object-contain p-3"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                                <span className="text-5xl" aria-hidden="true">
                                    🛍️
                                </span>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleToggleWishlist}
                            disabled={isWishlistPending}
                            aria-label={
                                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                            }
                            aria-pressed={isWishlisted}
                            className={`absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-2xl shadow-md transition hover:scale-105 disabled:opacity-60 ${isWishlisted ? "text-red-500" : "text-gray-500"
                                }`}
                        >
                            {isWishlistPending ? "…" : isWishlisted ? "♥" : "♡"}
                        </button>
                    </div>
                </Link>

                <button
                    type="button"
                    onClick={handleToggleWishlist}
                    disabled={isWishlistPending}
                    aria-label={
                        isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                    }
                    aria-pressed={isWishlisted}
                    className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-2xl shadow-sm transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60 ${isWishlisted ? "text-red-500" : "text-gray-500"
                        }`}
                >
                    {isWishlistPending ? "…" : isWishlisted ? "♥" : "♡"}
                </button>
            </div>

            <div className="flex flex-1 flex-col p-4 sm:p-5">
                <Link
                    to={`/products/${id}`}
                    className="block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                    <h3 className="truncate text-base font-semibold text-gray-900 transition group-hover:text-gray-600 sm:text-lg">
                        {name}
                    </h3>
                </Link>

                <div className="mt-2 flex items-center gap-1 text-sm">
                    <span className="text-amber-500">★</span>
                    <span className="font-medium text-gray-700">
                        {rating}
                    </span>
                </div>

                <p className="mt-3 text-lg font-bold text-gray-900 sm:text-xl">
                    ₹{price.toLocaleString("en-IN")}
                </p>

                <div className="mt-auto pt-4">
                    {cartError && (
                        <p role="alert" className="mt-2 text-sm text-red-600">
                            {cartError}
                        </p>
                    )}
                    {wishlistError && (
                        <p role="alert" className="mt-2 text-sm text-red-600">
                            {wishlistError}
                        </p>
                    )}
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={isAdding}
                        className="block w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isAdding ? "Adding..." : "Add to Cart"}
                    </button>

                    {cartMessage && (
                        <p
                            role="status"
                            className="mt-2 text-sm text-green-700"
                        >
                            {cartMessage}
                        </p>
                    )}

                    <Link
                        to={`/products/${id}`}
                        className="mt-3 block text-center text-sm font-medium text-gray-600 transition hover:text-black"
                    >
                        View Details →
                    </Link>
                </div>
            </div>
        </article>
    );
};

export default ProductCard;