import { useCallback, useEffect, useState, type FormEvent } from "react";
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
    totalProducts: number;
    totalPages: number;
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
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const AdminProducts = () => {
  const { token } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
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

  const loadData = useCallback(async () => {
    if (!token) {
      setError("Your session is missing. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [productResponse, categoryResponse] = await Promise.all([
        apiRequest<ProductsResponse>(
          "/api/products?page=1&limit=100",
          { token },
        ),
        apiRequest<CategoriesResponse>("/api/categories", { token }),
      ]);

      setProducts(productResponse.data);
      setCategories(categoryResponse.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load admin data.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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
      category: product.category._id,
      image: product.images[0] ?? "",
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

    const images = form.image.trim() ? [form.image.trim()] : [];

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      stock,
      category: form.category,
      images,
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
      }

      closeForm();
      await loadData();
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

      setCategories((previous) => [...previous, response.data].sort(
        (a, b) => a.name.localeCompare(b.name),
      ));

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
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete product.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter((product) => {
    const query = search.trim().toLowerCase();

    return (
      product.name.toLowerCase().includes(query) ||
      product.category?.name.toLowerCase().includes(query)
    );
  });

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
              ShopSphere / Admin
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Products
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Create, update, and manage your product catalog.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            + Add product
          </button>
        </header>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">
            Manage categories
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Add categories to organize your product catalog.
          </p>

          <form
            onSubmit={handleCreateCategory}
            className="mt-4 grid gap-4 sm:grid-cols-2"
          >
            <label className="block text-sm font-medium text-slate-700">
              Category name
              <input
                className={`${inputClass} mt-1.5`}
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                maxLength={100}
                placeholder="e.g. Home & Kitchen"
                required
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Description (optional)
              <input
                className={`${inputClass} mt-1.5`}
                value={categoryDescription}
                onChange={(event) => setCategoryDescription(event.target.value)}
                maxLength={500}
                placeholder="Describe this category"
              />
            </label>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={creatingCategory}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingCategory ? "Creating..." : "+ Add category"}
              </button>
            </div>
          </form>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Total products loaded</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {products.length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Categories loaded</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {categories.length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Low stock (5 or fewer)</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {products.filter((product) => product.stock <= 5).length}
            </p>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            {notice}
          </div>
        )}

        {isFormOpen && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? "Edit product" : "Create product"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Product name
                  <input
                    className={`${inputClass} mt-1.5`}
                    value={form.name}
                    maxLength={120}
                    required
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Category
                  <select
                    className={`${inputClass} mt-1.5`}
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

                <label className="block text-sm font-medium text-slate-700">
                  Price (₹)
                  <input
                    className={`${inputClass} mt-1.5`}
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

                <label className="block text-sm font-medium text-slate-700">
                  Stock
                  <input
                    className={`${inputClass} mt-1.5`}
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

                <label className="block text-sm font-medium text-slate-700">
                  Rating (out of 5)
                  <input
                    className={`${inputClass} mt-1.5`}
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
              </div>

              <label className="block text-sm font-medium text-slate-700">
                Description
                <textarea
                  className={`${inputClass} mt-1.5`}
                  rows={4}
                  maxLength={5000}
                  value={form.description}
                  required
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Image URL (optional)
                <input
                  className={`${inputClass} mt-1.5`}
                  type="url"
                  placeholder="https://example.com/product.jpg"
                  value={form.image}
                  onChange={(event) =>
                    setForm({ ...form, image: event.target.value })
                  }
                />
                <span className="mt-1 block text-xs text-slate-500">
                  Image uploads are not configured yet. This field stores one URL.
                </span>
              </label>

              <button
                type="submit"
                disabled={saving || categories.length === 0}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Product catalog
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredProducts.length} matching products
              </p>
            </div>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or category..."
              aria-label="Search products"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:max-w-xs"
            />
          </div>

          {loading ? (
            <p className="p-8 text-center text-sm text-slate-500">
              Loading products...
            </p>
          ) : filteredProducts.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">
              No products found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[840px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Product</th>
                    <th className="px-5 py-4 font-semibold">Category</th>
                    <th className="px-5 py-4 font-semibold">Price</th>
                    <th className="px-5 py-4 font-semibold">Rating</th>
                    <th className="px-5 py-4 font-semibold">Stock</th>
                    <th className="px-5 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt=""
                              className="h-12 w-12 rounded-lg border border-slate-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                              No image
                            </div>
                          )}
                          <div>
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
                      <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900">
                        ₹{product.price.toLocaleString("en-IN")}
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
                              ? "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"
                              : "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                          }
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(product)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === product._id}
                            onClick={() => void handleDelete(product)}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
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
          )}
        </section>
      </div>
    </main>
  );
};

export default AdminProducts;