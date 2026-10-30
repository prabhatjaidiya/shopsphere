import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { apiRequest } from "../../lib/api";
import { mapApiProduct } from "../../data/products";
import type { ApiProduct, Product } from "../../data/products";

type ProductsResponse = {
  success: boolean;
  data: ApiProduct[];
};

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await apiRequest<ProductsResponse>(
          "/api/products"
        );

        if (!response.success) {
          throw new Error("Could not load featured products.");
        }

        if (!cancelled) {
          setProducts(response.data.slice(0, 4).map(mapApiProduct));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading products."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Featured Products
          </h2>
          <p className="mt-2 text-gray-600">
            Discover some of our most popular products.
          </p>
        </div>

        {isLoading ? (
          <div
            role="status"
            aria-live="polite"
            aria-label="Loading featured products"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            <span className="sr-only">Loading featured products...</span>
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-xl bg-gray-200"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Try again
            </button>
          </div>
        ) : products.length === 0 ? (
          <p className="rounded-lg bg-white p-6 text-gray-600">
            No products are available yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;