import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { mapApiProduct } from "../data/products";
import type { Product, ApiProduct } from "../data/products";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { token } = useAuth();
  const {
    wishlistIds,
    pendingIds,
    toggleWishlist,
  } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [cartMessage, setCartMessage] = useState("");
  const [wishlistError, setWishlistError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      if (!id) {
        setError("Invalid product ID.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");
      setProduct(null);
      setQuantity(1);
      setSelectedImage(0);

      try {
        const response = await apiRequest<{
          success: boolean;
          data: ApiProduct;
        }>(`/api/products/${encodeURIComponent(id)}`);

        if (!response.success || !response.data) {
          throw new Error("Product not found.");
        }

        const mappedProduct = mapApiProduct(response.data);

        if (!cancelled) {
          setProduct(mappedProduct);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load product."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const isWishlisted = product
    ? wishlistIds.has(String(product.id))
    : false;

  const isWishlistPending = product
    ? pendingIds.has(String(product.id))
    : false;

  const handleToggleWishlist = async () => {
    if (!product) return;

    setWishlistError("");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await toggleWishlist(String(product.id));
    } catch (err) {
      setWishlistError(
        err instanceof Error
          ? err.message
          : "Failed to update wishlist."
      );
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 py-12">
        <p role="status" className="text-gray-600">
          Loading product details...
        </p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
        <span className="mb-4 text-5xl">🔍</span>
        <h1 className="text-2xl font-bold text-gray-900">
          Product Not Found
        </h1>
        <p className="mt-2 text-gray-600">
          {error || "This product may have been removed."}
        </p>
        <Link
          to="/products"
          className="mt-6 rounded-xl bg-gray-900 px-6 py-3 font-medium text-white hover:bg-gray-700"
        >
          Back to Products
        </Link>
      </main>
    );
  }


  const stock = Math.max(0, product.stock ?? 0);

  const images = product.images?.length
    ? product.images
    : product.image
      ? [product.image]
      : [];

  const currentImage = images[selectedImage] ?? "";
  const isOutOfStock = stock === 0;
  const totalPrice = product.price * quantity;

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
    setCartMessage("");
  };

  const increaseQuantity = () => {
    setQuantity((current) => Math.min(stock, current + 1));
    setCartMessage("");
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) return;

    setCartMessage("");

    try {
      await addToCart(product, quantity);
      setCartMessage(
        `${quantity} × ${product.name} added to your cart!`
      );
    } catch (err) {
      setCartMessage(
        err instanceof Error
          ? err.message
          : "Failed to add product to cart."
      );
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-gray-900">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-gray-900">Products</Link>
          <span>/</span>
          <span className="max-w-[200px] truncate font-medium text-gray-900">
            {product.name}
          </span>
        </nav>

        <section className="grid grid-cols-1 gap-8 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 md:p-8 lg:grid-cols-2 lg:gap-12">
          <div className="min-w-0">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.style.display = "none";
                  }}
                  className="h-full w-full object-contain p-6 sm:p-10"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-gray-400">
                  <span className="text-6xl" aria-hidden="true">📦</span>
                  <p className="mt-3 text-sm">Product image unavailable</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleToggleWishlist}
                disabled={isWishlistPending}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={isWishlisted}
                className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl shadow-md transition hover:scale-105 disabled:opacity-50 ${isWishlisted ? "text-red-500" : "text-gray-500"
                  }`}
              >
                {isWishlistPending ? "…" : isWishlisted ? "♥" : "♡"}
              </button>
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    aria-label={`View product image ${index + 1}`}
                    aria-pressed={selectedImage === index}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-gray-50 ${selectedImage === index
                      ? "border-gray-900"
                      : "border-gray-200"
                      }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.style.visibility = "hidden";
                      }}
                      className="h-full w-full object-contain p-2"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col py-2">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                {product.category ?? "ShopSphere"}
              </span>

              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isOutOfStock
                ? "bg-red-50 text-red-600"
                : stock <= 5
                  ? "bg-amber-50 text-amber-700"
                  : "bg-green-50 text-green-700"
                }`}>
                {isOutOfStock
                  ? "Out of stock"
                  : stock <= 5
                    ? `Only ${stock} left`
                    : "In stock"}
              </span>
            </div>

            <h1 className="break-words text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-lg text-amber-500">★★★★★</span>
              <span className="text-sm font-semibold text-gray-700">
                {Number(product.rating ?? 0).toFixed(1)}
              </span>
              <span className="text-sm text-gray-500">Customer rating</span>
            </div>

            <div className="mt-6 border-b border-gray-100 pb-6">
              <p className="text-sm text-gray-500">Price</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                ₹{product.price.toLocaleString("en-IN")}
              </p>
              <p className="mt-2 text-sm text-green-700">
                Inclusive of applicable taxes
              </p>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Product Description
              </h2>
              <p className="mt-2 whitespace-pre-line leading-7 text-gray-600">
                {product.description ||
                  `Discover ${product.name} at ShopSphere.`}
              </p>
            </div>

            <div className="mt-7">
              <label className="text-sm font-semibold text-gray-900">
                Quantity
              </label>

              <div className="mt-3 flex flex-wrap items-center gap-4">
                <div className="flex items-center overflow-hidden rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1 || isOutOfStock}
                    aria-label="Decrease quantity"
                    className="h-11 w-11 text-lg hover:bg-gray-100 disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="min-w-12 text-center font-semibold">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={increaseQuantity}
                    disabled={quantity >= stock || isOutOfStock}
                    aria-label="Increase quantity"
                    className="h-11 w-11 text-lg hover:bg-gray-100 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <p className="text-sm text-gray-500">
                  {isOutOfStock ? "Currently unavailable" : `${stock} available`}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 rounded-xl bg-gray-50 p-4">
              <span className="font-medium text-gray-600">Total price</span>
              <span className="text-xl font-bold text-gray-900">
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="mt-6 w-full rounded-xl bg-gray-900 px-6 py-4 font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>

            {cartMessage && (
              <p role="status" aria-live="polite" className="mt-3 rounded-xl bg-green-50 p-3 text-sm font-medium text-green-700">
                {cartMessage}
              </p>
            )}

            {wishlistError && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {wishlistError}
              </p>
            )}

            {isWishlisted && (
              <p role="status" className="mt-2 text-sm text-red-500">
                ♥ Saved to your wishlist
              </p>
            )}

            <Link
              to="/products"
              className="mt-5 text-center text-sm font-medium text-gray-600 hover:text-gray-900"
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