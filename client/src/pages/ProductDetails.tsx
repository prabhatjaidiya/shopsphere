import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { products } from "../data/products";

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();

  // Find product using the numeric ID from the URL
  const productId = Number(id);

  const product = products.find(
    (item) => item.id === productId
  );

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  // Handle invalid or missing product IDs
  if (!id || !Number.isInteger(productId) || productId <= 0 || !product) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <span className="mb-4 text-5xl">🔍</span>

        <h1 className="text-2xl font-bold text-gray-900">
          Product Not Found
        </h1>

        <p className="mt-2 text-gray-600">
          Sorry, this product doesn't exist or may have been removed.
        </p>

        <Link
          to="/products"
          className="mt-6 rounded-xl bg-gray-900 px-6 py-3 font-medium text-white transition hover:bg-gray-700"
        >
          Back to Products
        </Link>
      </main>
    );
  }

  /*
   * Adapt these field names to your existing mock data.
   * This page expects: image, name, category, price, rating,
   * description, stock, and optionally images.
   */
  const stock = Math.max(0, product.stock ?? 10);

  const images =
    product.images?.length
      ? product.images
      : product.image
        ? [product.image]
        : [];

  const currentImage = images[selectedImage] ?? "";

  const totalPrice = product.price * quantity;
  const isOutOfStock = stock === 0;

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
    setCartMessage("");
  };

  const increaseQuantity = () => {
    setQuantity((current) => Math.min(stock, current + 1));
    setCartMessage("");
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    // Temporary interaction for Day 6.
    // Real cart state/context will be integrated later.
    setCartMessage(
      `${quantity} × ${product.name} added to your cart!`
    );
  };

  return (
    <main className="bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link
            to="/"
            className="transition hover:text-gray-900"
          >
            Home
          </Link>

          <span className="mx-2">/</span>

          <Link
            to="/products"
            className="transition hover:text-gray-900"
          >
            Products
          </Link>

          <span className="mx-2">/</span>

          <span className="font-medium text-gray-900">
            {product.name}
          </span>
        </nav>

        {/* Product details */}
        <section className="grid grid-cols-1 gap-8 rounded-3xl bg-white p-5 shadow-sm sm:p-8 lg:grid-cols-2 lg:gap-12">
          {/* Image gallery */}
          <div>
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gray-100">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="h-full w-full object-contain p-6 transition duration-300 hover:scale-105"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <span className="text-6xl">📦</span>
                  <p className="mt-3 text-sm">
                    Product image unavailable
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  setIsWishlisted((current) => !current)
                }
                aria-label={
                  isWishlisted
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
                aria-pressed={isWishlisted}
                className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-sm transition hover:scale-110 ${isWishlisted
                    ? "text-red-500"
                    : "text-gray-500"
                  }`}
              >
                {isWishlisted ? "♥" : "♡"}
              </button>
            </div>

            {/* Thumbnail gallery */}
            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    aria-label={`View product image ${index + 1}`}
                    aria-pressed={selectedImage === index}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-gray-50 transition ${selectedImage === index
                        ? "border-gray-900"
                        : "border-transparent hover:border-gray-300"
                      }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="h-full w-full object-contain p-2"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product information */}
          <div className="flex flex-col">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                {product.category ?? "ShopSphere"}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${isOutOfStock
                    ? "bg-red-50 text-red-600"
                    : stock <= 5
                      ? "bg-amber-50 text-amber-700"
                      : "bg-green-50 text-green-700"
                  }`}
              >
                {isOutOfStock
                  ? "Out of stock"
                  : stock <= 5
                    ? `Only ${stock} left`
                    : "In stock"}
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-lg tracking-wide text-amber-500">
                ★★★★★
              </span>

              <span className="text-sm font-semibold text-gray-700">
                {Number(product.rating ?? 0).toFixed(1)}
              </span>

              <span className="text-sm text-gray-500">
                Customer rating
              </span>
            </div>

            {/* Price */}
            <div className="mt-6 border-b border-gray-100 pb-6">
              <p className="text-sm text-gray-500">
                Price
              </p>

              <p className="mt-1 text-3xl font-bold text-gray-900">
                ₹{product.price.toLocaleString("en-IN")}
              </p>

              <p className="mt-2 text-sm text-green-700">
                Inclusive of applicable taxes
              </p>
            </div>

            {/* Description */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Product Description
              </h2>

              <p className="mt-2 leading-7 text-gray-600">
                {product.description ??
                  `Discover ${product.name} at ShopSphere. Explore its features and add it to your collection.`}
              </p>
            </div>

            {/* Quantity selector */}
            <div className="mt-7">
              <label className="text-sm font-semibold text-gray-900">
                Quantity
              </label>

              <div className="mt-3 flex items-center gap-4">
                <div className="flex items-center overflow-hidden rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1 || isOutOfStock}
                    aria-label="Decrease quantity"
                    className="h-11 w-11 text-lg transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    −
                  </button>

                  <span
                    aria-live="polite"
                    className="min-w-12 text-center font-semibold text-gray-900"
                  >
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    disabled={quantity >= stock || isOutOfStock}
                    aria-label="Increase quantity"
                    className="h-11 w-11 text-lg transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <p className="text-sm text-gray-500">
                  {isOutOfStock
                    ? "Currently unavailable"
                    : `${stock} available`}
                </p>
              </div>
            </div>

            {/* Total */}
            <div className="mt-6 flex items-center justify-between rounded-xl bg-gray-50 p-4">
              <span className="font-medium text-gray-600">
                Total price
              </span>

              <span className="text-xl font-bold text-gray-900">
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Add to cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="mt-6 w-full rounded-xl bg-gray-900 px-6 py-4 font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>

            {/* Feedback */}
            {cartMessage && (
              <p
                role="status"
                aria-live="polite"
                className="mt-3 rounded-xl bg-green-50 p-3 text-sm font-medium text-green-700"
              >
                ✓ {cartMessage}
              </p>
            )}

            {isWishlisted && (
              <p
                role="status"
                className="mt-2 text-sm text-red-500"
              >
                ♥ Saved to your wishlist
              </p>
            )}

            {/* Back link */}
            <Link
              to="/products"
              className="mt-5 text-center text-sm font-medium text-gray-600 transition hover:text-gray-900"
            >
              ← Back to Products
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ProductDetails;