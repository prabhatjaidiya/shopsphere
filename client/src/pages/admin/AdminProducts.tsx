import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { apiRequest } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

type Category = {
  _id: string;
  name: string;
  description?: string;
};

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  rating: number;
  category: Category;
};

type ProductForm = {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  image: string;
  rating: string;
};

type ProductsResponse = {
  success: boolean;
  data: Product[];
  pagination?: {
    page: number;
    limit: number;
    totalProducts: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

type ProductResponse = {
  success: boolean;
  data: Product;
};

type CategoriesResponse = {
  success: boolean;
  data: Category[];
};

const PAGE_SIZE = 10;

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  image: "",
  rating: "0",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const AdminProducts = () => {
  const { token } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const loadProducts = useCallback(async () => {
    if (!token) {
      setError("Your session is missing. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await apiRequest<ProductsResponse>(
        `/api/products?${params.toString()}`,
        { token },
      );

      setProducts(response.data ?? []);

      const pagination = response.pagination;

      setTotalProducts(pagination?.totalProducts ?? response.data.length);
      setTotalPages(Math.max(1, pagination?.totalPages ?? 1));

      setHasNextPage(
        pagination?.hasNextPage ?? page < (pagination?.totalPages ?? 1),
      );

      setHasPreviousPage(
        pagination?.hasPreviousPage ?? page > 1,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load products.",
      );
    } finally {
      setLoading(false);
    }
  }, [token, page, search]);

  const loadCategories = useCallback(async () => {
    if (!token) return;

    try {
      const response = await apiRequest<CategoriesResponse>(
        "/api/categories",
        { token },
      );

      setCategories(response.data ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load categories.",
      );
    }
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadProducts();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadProducts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadCategories();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadCategories]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setNotice("");
    setIsFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setEditingId(product._id);

    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category?._id ?? "",
      image: product.images?.[0] ?? "",
      rating: String(product.rating ?? 0),
    });

    setError("");
    setNotice("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setNotice("");

    const price = Number(form.price);
    const stock = Number(form.stock);
    const rating = Number(form.rating);

    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      setError("Rating must be between 0 and 5.");
      return;
    }

    if (!form.name.trim() || !form.description.trim() || !form.category) {
      setError("Name, description, and category are required.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid non-negative price.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError("Stock must be a non-negative whole number.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      stock,
      category: form.category,
      images: form.image.trim() ? [form.image.trim()] : [],
      rating,
    };

    setSaving(true);

    try {
      if (editingId) {
        await apiRequest<ProductResponse>(
          `/api/products/${editingId}`,
          {
            method: "PATCH",
            token: token ?? undefined,
            body: JSON.stringify(payload),
          },
        );

        setNotice("Product updated successfully.");
      } else {
        await apiRequest<ProductResponse>("/api/products", {
          method: "POST",
          token: token ?? undefined,
          body: JSON.stringify(payload),
        });

        setNotice("Product created successfully.");
        setPage(1);
      }

      closeForm();
      await loadCategories();
      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save product.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCategory = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setNotice("");

    const name = categoryName.trim();
    const description = categoryDescription.trim();

    if (!name) {
      setError("Category name is required.");
      return;
    }

    setCreatingCategory(true);

    try {
      const response = await apiRequest<{
        success: boolean;
        message: string;
        data: Category;
      }>("/api/categories", {
        method: "POST",
        token: token ?? undefined,
        body: JSON.stringify({ name, description }),
      });

      setCategories((previous) =>
        [...previous, response.data].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      );

      setCategoryName("");
      setCategoryDescription("");
      setNotice("Category created successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create category.",
      );
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setError("");
    setNotice("");
    setDeletingId(product._id);

    try {
      await apiRequest<{ success: boolean; message: string }>(
        `/api/products/${product._id}`,
        {
          method: "DELETE",
          token: token ?? undefined,
        },
      );

      setNotice("Product deleted successfully.");

      // Return to the previous page if its final product was deleted.
      if (products.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadProducts();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete product.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatPrice = (price: number) =>
    `₹${price.toLocaleString("en-IN")}`;

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
              ShopSphere / Administration
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Product management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage your catalog, inventory and product information.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            + Add new product
          </button>
        </header>

        {/* Notifications */}
        {error && (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
              className="font-bold"
            >
              ×
            </button>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700"
          >
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
              className="font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Overview cards */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total products
            </p>
            <p className="mt-3 text-3xl font-bold">
              {totalProducts}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Products in your catalog
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Categories
            </p>
            <p className="mt-3 text-3xl font-bold">
              {categories.length}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Available product categories
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Low stock on this page
            </p>
            <p className="mt-3 text-3xl font-bold text-amber-600">
              {products.filter((product) => product.stock <= 5).length}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Products with 5 or fewer items
            </p>
          </div>
        </section>

        {/* Category manager */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold">Category management</h2>
            <p className="mt-1 text-sm text-slate-500">
              Create categories to organize your products.
            </p>
          </div>

          <form
            onSubmit={handleCreateCategory}
            className="grid gap-4 sm:grid-cols-2"
          >
            <label className="text-sm font-medium text-slate-700">
              Category name
              <input
                className={`${inputClass} mt-2`}
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                maxLength={100}
                placeholder="e.g. Electronics"
                required
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Description
              <input
                className={`${inputClass} mt-2`}
                value={categoryDescription}
                onChange={(event) =>
                  setCategoryDescription(event.target.value)
                }
                maxLength={500}
                placeholder="Optional category description"
              />
            </label>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={creatingCategory}
                className="rounded-xl border border-slate-200 bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
              >
                {creatingCategory ? "Creating..." : "+ Add category"}
              </button>
            </div>
          </form>
        </section>

        {/* Product form */}
        {isFormOpen && (
          <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Product catalog
                </p>
                <h2 className="mt-2 text-xl font-bold">
                  {editingId ? "Edit product" : "Create product"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  Product name
                  <input
                    className={`${inputClass} mt-2`}
                    value={form.name}
                    maxLength={120}
                    required
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Category
                  <select
                    className={`${inputClass} mt-2`}
                    value={form.category}
                    required
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                  >
                    <option value="">Choose a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Price (₹)
                  <input
                    className={`${inputClass} mt-2`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    required
                    onChange={(event) =>
                      setForm({ ...form, price: event.target.value })
                    }
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Stock quantity
                  <input
                    className={`${inputClass} mt-2`}
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    required
                    onChange={(event) =>
                      setForm({ ...form, stock: event.target.value })
                    }
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Rating (out of 5)
                  <input
                    className={`${inputClass} mt-2`}
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={form.rating}
                    required
                    onChange={(event) =>
                      setForm({ ...form, rating: event.target.value })
                    }
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Image URL
                  <input
                    className={`${inputClass} mt-2`}
                    type="url"
                    placeholder="https://example.com/product.jpg"
                    value={form.image}
                    onChange={(event) =>
                      setForm({ ...form, image: event.target.value })
                    }
                  />
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-700">
                Description
                <textarea
                  className={`${inputClass} mt-2`}
                  rows={4}
                  maxLength={5000}
                  value={form.description}
                  required
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                />
              </label>

              <button
                type="submit"
                disabled={saving || categories.length === 0}
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save changes"
                    : "Create product"}
              </button>
            </form>
          </section>
        )}

        {/* Product catalog */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-lg font-bold">Product catalog</h2>
              <p className="mt-1 text-sm text-slate-500">
                {totalProducts} products found
              </p>
            </div>

            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search products..."
              aria-label="Search products"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:max-w-xs"
            />
          </div>

          {loading ? (
            <div className="space-y-4 p-6" role="status">
              <span className="text-sm text-slate-500">
                Loading products...
              </span>
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-14 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                📦
              </div>
              <h3 className="mt-4 font-bold">No products found</h3>
              <p className="mt-2 text-sm text-slate-500">
                Try another search or add a new product.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Product</th>
                      <th className="px-5 py-4 font-semibold">Category</th>
                      <th className="px-5 py-4 font-semibold">Price</th>
                      <th className="px-5 py-4 font-semibold">Rating</th>
                      <th className="px-5 py-4 font-semibold">Inventory</th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {products.map((product) => (
                      <tr
                        key={product._id}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-xs text-slate-400">
                              {product.images?.[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  loading="lazy"
                                  onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                  }}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                "No image"
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900">
                                {product.name}
                              </p>
                              <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {product.category?.name ?? "Uncategorized"}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 font-semibold">
                          {formatPrice(product.price)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="font-semibold text-amber-600">
                            ★ {(product.rating ?? 0).toFixed(1)}
                          </span>
                          <span className="text-slate-400"> / 5</span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={
                              product.stock <= 5
                                ? "rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700"
                                : "rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                            }
                          >
                            {product.stock <= 5
                              ? `Low stock · ${product.stock}`
                              : `In stock · ${product.stock}`}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditForm(product)}
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              disabled={deletingId === product._id}
                              onClick={() => void handleDelete(product)}
                              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            >
                              {deletingId === product._id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-900">
                    {Math.min((page - 1) * PAGE_SIZE + 1, totalProducts)}
                    {"–"}
                    {Math.min(page * PAGE_SIZE, totalProducts)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-900">
                    {totalProducts}
                  </span>{" "}
                  products
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!hasPreviousPage || loading}
                    onClick={() => setPage((current) => current - 1)}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="min-w-24 text-center text-sm font-semibold text-slate-700">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={!hasNextPage || loading}
                    onClick={() => setPage((current) => current + 1)}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
};

export default AdminProducts;