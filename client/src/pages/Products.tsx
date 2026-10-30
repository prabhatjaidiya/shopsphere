import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import ProductCard from "../components/home/ProductCard";
import type { Product } from "../data/products";

type ApiCategory = {
  _id: string;
  name: string;
};

type ApiProduct = {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  rating: number;
  category: ApiCategory;
};

type ProductsResponse = {
  success: boolean;
  data: ApiProduct[];
  pagination: {
    page: number;
    limit: number;
    totalProducts: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

type FilterControlsProps = {
  categoryOptions: string[];
  category: string;
  handleCategoryChange: (item: string) => void;
  minPrice: number;
  maxPrice: number;
  handleMinPriceChange: (value: number) => void;
  handleMaxPriceChange: (value: number) => void;
  resetPrice: () => void;
  formatPrice: (price: number) => string;
};

const FilterControls = ({
  categoryOptions,
  category,
  handleCategoryChange,
  minPrice,
  maxPrice,
  handleMinPriceChange,
  handleMaxPriceChange,
  resetPrice,
  formatPrice,
}: FilterControlsProps) => (
  <div className="space-y-7">
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">
          Categories
        </h3>
        <span className="text-xs text-slate-400">
          {categoryOptions.length - 1} categories
        </span>
      </div>

      <div className="space-y-1.5">
        {categoryOptions.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => handleCategoryChange(item)}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
              category === item
                ? "bg-slate-900 font-semibold text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {item}
            {category === item && (
              <span aria-hidden="true">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>

    <div className="border-t border-slate-100 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">
          Price range
        </h3>
        <button
          type="button"
          onClick={resetPrice}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          Reset
        </button>
      </div>

      <div className="mb-5 flex items-center justify-between gap-2">
        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <p className="text-[10px] text-slate-400">Minimum</p>
          <p className="text-sm font-semibold text-slate-900">
            {formatPrice(minPrice)}
          </p>
        </div>

        <span className="text-slate-300">—</span>

        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <p className="text-[10px] text-slate-400">Maximum</p>
          <p className="text-sm font-semibold text-slate-900">
            {formatPrice(maxPrice)}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label
            htmlFor="min-price"
            className="mb-2 block text-xs text-slate-500"
          >
            Minimum price
          </label>
          <input
            id="min-price"
            type="range"
            min="0"
            max="500000"
            step="500"
            value={minPrice}
            onChange={(event) =>
              handleMinPriceChange(Number(event.target.value))
            }
            className="w-full accent-slate-900"
          />
        </div>

        <div>
          <label
            htmlFor="max-price"
            className="mb-2 block text-xs text-slate-500"
          >
            Maximum price
          </label>
          <input
            id="max-price"
            type="range"
            min="0"
            max="500000"
            step="500"
            value={maxPrice}
            onChange={(event) =>
              handleMaxPriceChange(Number(event.target.value))
            }
            className="w-full accent-slate-900"
          />
        </div>
      </div>
    </div>
  </div>
);

const Products = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500000);
  const [sort, setSort] = useState("popular");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categoryData, setCategoryData] = useState<ApiCategory[]>([]);
  const [page, setPage] = useState(1);

  const [pagination, setPagination] =
    useState<ProductsResponse["pagination"] | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const categoryOptions = [
    "All",
    ...categoryData.map((item) => item.name),
  ];

  // Fetch categories
  useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      try {
        const response = await apiRequest<{
          success: boolean;
          data: ApiCategory[];
        }>("/api/categories");

        if (!cancelled) {
          setCategoryData(response.data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to fetch categories:", error);
        }
      }
    };

    void fetchCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch products with filters and pagination
  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "12",
          sort,
          minPrice: String(minPrice),
          maxPrice: String(maxPrice),
        });

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (category !== "All") {
          const selectedCategory = categoryData.find(
            (item) => item.name === category,
          );

          if (!selectedCategory) {
            throw new Error(
              "Selected category could not be found. Please reset the filters.",
            );
          }

          params.set("category", selectedCategory._id);
        }

        const response = await apiRequest<ProductsResponse>(
          `/api/products?${params.toString()}`,
        );

        if (!response.success) {
          throw new Error("Unable to load products.");
        }

        if (!cancelled) {
          setProducts(response.data);
          setPagination(response.pagination);
        }
      } catch (error) {
        if (!cancelled) {
          setProducts([]);
          setPagination(null);
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load products. Please try again.",
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
  }, [
    page,
    search,
    category,
    categoryData,
    minPrice,
    maxPrice,
    sort,
    retryCount,
  ]);

  const displayProducts: Product[] = products.map((product) => ({
    ...product,
    id: product._id,
    category: product.category.name,
  }));

  const resetFilters = () => {
    setSearch("");
    setCategory("All");
    setMinPrice(0);
    setMaxPrice(500000);
    setSort("popular");
    setPage(1);
    setIsFilterOpen(false);
  };

  const resetPrice = () => {
    setMinPrice(0);
    setMaxPrice(500000);
    setPage(1);
  };

  const handleCategoryChange = (item: string) => {
    setCategory(item);
    setPage(1);
    setIsFilterOpen(false);
  };

  const handleMinPriceChange = (value: number) => {
    if (value <= maxPrice) {
      setMinPrice(value);
      setPage(1);
    }
  };

  const handleMaxPriceChange = (value: number) => {
    if (value >= minPrice) {
      setMaxPrice(value);
      setPage(1);
    }
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    setPage(1);
  };

  const totalPages = pagination?.totalPages ?? 0;

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  );

  const formatPrice = (price: number) =>
    `₹${price.toLocaleString("en-IN")}`;

  const filterProps: FilterControlsProps = {
    categoryOptions,
    category,
    handleCategoryChange,
    minPrice,
    maxPrice,
    handleMinPriceChange,
    handleMaxPriceChange,
    resetPrice,
    formatPrice,
  };

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-slate-900">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search and mobile controls */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <svg
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m16 16 4 4" />
            </svg>

            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() =>
                setIsFilterOpen((current) => !current)
              }
              aria-expanded={isFilterOpen}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold transition hover:bg-slate-50 xl:hidden"
            >
              <span>☷</span>
              Filters
            </button>

            <select
              aria-label="Sort products"
              value={sort}
              onChange={(event) =>
                handleSortChange(event.target.value)
              }
              className="h-14 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-blue-500 sm:min-w-[190px] sm:flex-none"
            >
              <option value="popular">Most popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest rated</option>
            </select>
          </div>
        </div>

        {/* Mobile filters */}
        {isFilterOpen && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:hidden">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">Filters</h2>
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-semibold text-blue-600"
              >
                Reset all
              </button>
            </div>

            <FilterControls {...filterProps} />
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-[250px_minmax(0,1fr)]">
          {/* Desktop sidebar */}
          <aside className="hidden h-fit rounded-2xl border border-slate-200 bg-white p-5 xl:sticky xl:top-24 xl:block">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold">Filters</h2>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Reset all
              </button>
            </div>

            <FilterControls {...filterProps} />
          </aside>

          {/* Product section */}
          <div className="min-w-0">
            {/* Category navigation */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
              {categoryOptions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleCategoryChange(item)}
                  className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                    category === item
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Results heading */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">
                  {category === "All" ? "All Products" : category}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {pagination?.totalProducts ?? 0} products found
                </p>
              </div>

              <span className="rounded-full bg-white px-3 py-2 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                Page {page} of {Math.max(totalPages, 1)}
              </span>
            </div>

            {/* Loading skeleton */}
            {isLoading ? (
              <div
                role="status"
                aria-label="Loading products"
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3"
                  >
                    <div className="aspect-square animate-pulse rounded-xl bg-slate-100" />
                    <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                    <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-slate-100" />
                    <div className="mt-5 h-10 animate-pulse rounded-xl bg-slate-100" />
                  </div>
                ))}
                <span className="sr-only">Loading products...</span>
              </div>
            ) : errorMessage ? (
              <div
                role="alert"
                className="rounded-2xl border border-red-100 bg-white px-6 py-16 text-center"
              >
                <div className="text-4xl">⚠️</div>
                <h3 className="mt-4 text-lg font-bold">
                  Something went wrong
                </h3>
                <p className="mt-2 text-sm text-red-600">
                  {errorMessage}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setRetryCount((count) => count + 1)
                  }
                  className="mt-5 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700"
                >
                  Try again
                </button>
              </div>
            ) : displayProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {displayProducts.map((product) => (
                    <div key={product.id} className="min-w-0">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination && totalPages > 1 && (
                  <nav
                    aria-label="Product pagination"
                    className="mt-12 flex flex-wrap items-center justify-center gap-2"
                  >
                    <button
                      type="button"
                      disabled={
                        !pagination.hasPreviousPage || isLoading
                      }
                      onClick={() =>
                        setPage((current) =>
                          Math.max(1, current - 1),
                        )
                      }
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ← Previous
                    </button>

                    {pageNumbers.map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        aria-label={`Go to page ${pageNumber}`}
                        aria-current={
                          page === pageNumber ? "page" : undefined
                        }
                        onClick={() => setPage(pageNumber)}
                        className={`h-11 min-w-11 rounded-xl px-3 text-sm font-bold transition ${
                          page === pageNumber
                            ? "bg-slate-900 text-white"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={!pagination.hasNextPage || isLoading}
                      onClick={() =>
                        setPage((current) => current + 1)
                      }
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </nav>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
                  🔎
                </div>
                <h2 className="mt-5 text-xl font-bold">
                  No products found
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  We couldn't find products matching your search
                  or filters. Try changing your search or adjusting
                  your price range.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-6 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Products;