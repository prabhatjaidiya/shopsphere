import { useState } from "react";
import { products } from "../data/products";
import ProductCard from "../components/home/ProductCard";

const categories = [
  "All",
  "Electronics",
  "Fashion",
  "Shoes",
  "Accessories",
];

const Products = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [sort, setSort] = useState("popular");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // -----------------------------
  // Filter products
  // -----------------------------
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || product.category === category;

    const matchesPrice =
      product.price >= minPrice && product.price <= maxPrice;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  // -----------------------------
  // Sort products
  // -----------------------------
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sort) {
      case "price-low":
        return a.price - b.price;

      case "price-high":
        return b.price - a.price;

      case "rating":
        return b.rating - a.rating;

      default:
        return 0;
    }
  });

  // -----------------------------
  // Reset
  // -----------------------------
  const resetFilters = () => {
    setSearch("");
    setCategory("All");
    setMinPrice(0);
    setMaxPrice(50000);
    setSort("popular");
    setIsFilterOpen(false);
  };

  // -----------------------------
  // Category
  // -----------------------------
  const handleCategoryChange = (item: string) => {
    setCategory(item);
    setIsFilterOpen(false);
  };

  return (
    <main className="w-full min-w-0 overflow-x-hidden bg-slate-50">
      {/* =====================================
          HERO
      ===================================== */}
      <section className="w-full border-b border-slate-200 bg-gradient-to-r from-blue-50 via-white to-blue-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 sm:text-sm">
            ShopSphere Collection
          </p>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Discover Products
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base lg:text-lg">
                Explore our collection of quality products designed for everyday life.
              </p>
            </div>

            <div className="w-fit min-w-[150px] rounded-2xl border border-blue-100 bg-white px-5 py-4 shadow-sm sm:min-w-[170px]">
              <p className="whitespace-nowrap text-xs text-slate-500 sm:text-sm">
                Products available
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {products.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================
          CONTENT
      ===================================== */}
      <section className="w-full min-w-0">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {/* ===================================
              MOBILE FILTER BUTTON
          =================================== */}
          <div className="mb-4 grid w-full min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 xl:hidden">
            <button
              type="button"
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className="flex h-12 min-w-0 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm"
            >
              <span className="shrink-0">⚙️</span>

              <span className="truncate">
                {isFilterOpen ? "Hide Filters" : "Filters"}
              </span>
            </button>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="block h-12 min-w-0 w-full rounded-2xl border border-slate-200 bg-white px-4 text-center text-sm font-medium text-slate-700 outline-none shadow-sm"
            >
              <option value="popular">Popular</option>
              <option value="price-low">Low → High</option>
              <option value="price-high">High → Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          {/* ===================================
              MOBILE FILTER PANEL
          =================================== */}
          {isFilterOpen && (
            <div className="mb-6 w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:hidden">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">
                    Filters
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Refine your search
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-sm font-medium text-blue-600"
                >
                  Reset
                </button>
              </div>

              {/* Categories */}
              <div className="mt-5 border-t border-slate-100 pt-5">
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  Categories
                </h3>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {categories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleCategoryChange(item)}
                      className={`rounded-xl px-3 py-2.5 text-sm font-medium ${category === item
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 text-slate-600"
                        }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Price Range
                  </h3>

                  <span className="text-xs text-slate-500">
                    ₹{minPrice} - ₹{maxPrice}
                  </span>
                </div>

                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="500"
                    value={minPrice}
                    onChange={(e) => {
                      const value = Number(e.target.value);

                      if (value <= maxPrice) {
                        setMinPrice(value);
                      }
                    }}
                    className="w-full accent-blue-600"
                  />

                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="500"
                    value={maxPrice}
                    onChange={(e) => {
                      const value = Number(e.target.value);

                      if (value >= minPrice) {
                        setMaxPrice(value);
                      }
                    }}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ===================================
              DESKTOP + PRODUCTS LAYOUT
          =================================== */}
          <div className="grid w-full min-w-0 max-w-full xl:grid-cols-[260px_minmax(0,1fr)] xl:gap-6">
            {/* DESKTOP SIDEBAR */}
            <aside
              className="hidden h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-24 xl:block"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Filters
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Refine your search
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-sm font-medium text-blue-600"
                >
                  Reset
                </button>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-6">
                <h3 className="mb-4 text-sm font-semibold">
                  Categories
                </h3>

                <div className="space-y-2">
                  {categories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCategory(item)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm ${category === item
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      {item}

                      {category === item && (
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-7 border-t border-slate-100 pt-6">
                <h3 className="mb-4 text-sm font-semibold">
                  Price Range
                </h3>

                <p className="mb-4 text-xs text-slate-500">
                  ₹{minPrice} - ₹{maxPrice}
                </p>

                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="500"
                    value={minPrice}
                    onChange={(e) => {
                      const value = Number(e.target.value);

                      if (value <= maxPrice) {
                        setMinPrice(value);
                      }
                    }}
                    className="w-full accent-blue-600"
                  />

                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="500"
                    value={maxPrice}
                    onChange={(e) => {
                      const value = Number(e.target.value);

                      if (value >= minPrice) {
                        setMaxPrice(value);
                      }
                    }}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>
            </aside>

            {/* PRODUCTS */}
            <div className="w-full min-w-0 max-w-full overflow-hidden">
              {/* Search + Categories Sticky Toolbar */}
              <div
                className="mb-6 w-full rounded-2xl border border-slate-200/80 bg-slate-50 p-2 shadow-sm"
              >
                {/* Search + Sort */}
                <div className="grid w-full min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <div className="min-w-0">
                    <input
                      type="text"
                      placeholder="🔍  Search products..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="block h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none shadow-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="hidden h-12 min-w-[150px] rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none shadow-sm transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 xl:block"
                  >
                    <option value="popular">Popular</option>
                    <option value="price-low">Price: Low → High</option>
                    <option value="price-high">Price: High → Low</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>

                {/* Category Pills */}
                <div className="mt-2 flex w-full max-w-full gap-2 overflow-x-auto pb-1">
                  {categories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleCategoryChange(item)}
                      className={`shrink-0 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 ${category === item
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                        }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Result */}
              <div className="mb-5 flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-900">
                    {sortedProducts.length}
                  </span>{" "}
                  products
                </p>

                {category !== "All" && (
                  <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {category}
                  </span>
                )}
              </div>

              {/* Product Grid */}
              {sortedProducts.length > 0 ? (
                <div className="grid w-full min-w-0 max-w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {sortedProducts.map((product) => (
                    <div key={product.id} className="min-w-0 max-w-full">
                      <ProductCard
                        name={product.name}
                        price={product.price}
                        rating={product.rating}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
                    🔎
                  </div>

                  <h2 className="text-xl font-bold text-slate-900">
                    No products found
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    We couldn't find products matching your current
                    filters. Try adjusting your search or price range.
                  </p>

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Products;