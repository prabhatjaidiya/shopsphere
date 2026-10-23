import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";

interface WishlistProduct {
  _id: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
}

const Wishlist = () => {
  const { token } = useAuth();
  const { toggleWishlist, pendingIds } = useWishlist();

  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadWishlist = async () => {
      if (!token) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await apiRequest<{
          success: boolean;
          data: { products: WishlistProduct[] };
        }>("/api/wishlist", { token });

        if (!response.success) {
          throw new Error("Failed to load wishlist.");
        }

        if (!cancelled) {
          setProducts(response.data.products ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your wishlist."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadWishlist();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleRemove = async (productId: string) => {
    try {
      await toggleWishlist(productId);
      setProducts((current) =>
        current.filter((product) => product._id !== productId)
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to remove product."
      );
    }
  };

  if (!token) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">Your Wishlist</h1>
        <p className="mt-3 text-gray-600">
          Log in to view your saved products.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-xl bg-gray-900 px-6 py-3 text-white"
        >
          Log In
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wider text-gray-500">
            Your collection
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            My Wishlist
          </h1>
          <p className="mt-2 text-gray-600">
            {products.length} saved {products.length === 1 ? "product" : "products"}
          </p>
        </div>

        {loading ? (
          <p role="status" className="py-16 text-center text-gray-600">
            Loading your wishlist...
          </p>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-5 text-red-700">
            <p role="alert">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 font-semibold underline"
            >
              Try again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
            <span className="text-5xl" aria-hidden="true">♡</span>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Your wishlist is empty
            </h2>
            <p className="mt-2 text-gray-600">
              Save products you love and find them here later.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-block rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white hover:bg-gray-700"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <article
                key={product._id}
                className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <Link
                  to={`/products/${product._id}`}
                  className="flex aspect-[4/3] items-center justify-center bg-gray-100 p-4"
                >

                  <div className="flex h-64 items-center justify-center overflow-hidden bg-gray-100 p-4">
                    <img
                      src={product.images?.[0] || "/placeholder.png"}
                      alt={product.name}
                      className="h-full w-full object-contain"
                      onError={(event) => {
                        event.currentTarget.style.visibility = "hidden";
                      }}
                    />
                  </div>
                </Link>

                <div className="flex flex-1 flex-col p-4">
                  <Link
                    to={`/products/${product._id}`}
                    className="font-semibold text-gray-900 hover:text-gray-600"
                  >
                    {product.name}
                  </Link>

                  <p className="mt-2 text-xl font-bold text-gray-900">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>

                  <div className="mt-auto flex gap-2 pt-4">
                    <Link
                      to={`/products/${product._id}`}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-semibold hover:bg-gray-50"
                    >
                      View
                    </Link>

                    <button
                      type="button"
                      disabled={pendingIds.has(product._id)}
                      onClick={() => void handleRemove(product._id)}
                      className="flex-1 rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
                    >
                      {pendingIds.has(product._id) ? "Removing..." : "♥ Remove"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Wishlist;