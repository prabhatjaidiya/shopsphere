import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

type OrderItem = {
  product: string;
  name: string;
  price: number;
  quantity: number;
  lineTotal: number;
};

type Customer = {
  _id: string;
  name: string;
  email: string;
} | null;

type AdminOrder = {
  _id: string;
  user: Customer;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: "pending" | "paid" | "failed";
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    landmark?: string;
  };
  createdAt: string;
};

type OrdersResponse = {
  success: boolean;
  data: AdminOrder[];
  pagination: {
    page: number;
    limit: number;
    totalOrders: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

type OrderResponse = {
  success: boolean;
  data: AdminOrder;
};

const statuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const statusStyle = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "shipped":
      return "bg-blue-100 text-blue-800";
    case "confirmed":
      return "bg-indigo-100 text-indigo-800";
    default:
      return "bg-amber-100 text-amber-800";
  }
};

const AdminOrders = () => {
  const { token } = useAuth();

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadOrders = useCallback(async (requestedPage: number) => {
    if (!token) {
      setError("Your session is missing. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiRequest<OrdersResponse>(
        `/api/admin/orders?page=${requestedPage}&limit=10`,
        { token },
      );

      setOrders(response.data);
      setPage(response.pagination.page);
      setTotalPages(response.pagination.totalPages);
      setTotalOrders(response.pagination.totalOrders);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load orders.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadOrders(1);
  }, [loadOrders]);

  const viewOrder = async (orderId: string) => {
    if (!token) return;

    setDetailsLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await apiRequest<OrderResponse>(
        `/api/admin/orders/${orderId}`,
        { token },
      );

      setSelectedOrder(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load order details.",
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const changeStatus = async (
    order: AdminOrder,
    nextStatus: OrderStatus,
  ) => {
    if (!token || updatingId) return;

    if (!allowedTransitions[order.status].includes(nextStatus)) {
      setError(
        `Cannot change order from ${order.status} to ${nextStatus}.`,
      );
      return;
    }

    const confirmed = window.confirm(
      `Change order status from "${order.status}" to "${nextStatus}"?`,
    );

    if (!confirmed) return;

    setUpdatingId(order._id);
    setError("");
    setNotice("");

    try {
      const response = await apiRequest<OrderResponse>(
        `/api/admin/orders/${order._id}/status`,
        {
          method: "PATCH",
          token,
          body: JSON.stringify({ status: nextStatus }),
        },
      );

      const updatedOrder = response.data;

      setOrders((previous) =>
        previous.map((item) =>
          item._id === updatedOrder._id ? updatedOrder : item,
        ),
      );

      setSelectedOrder((previous) =>
        previous?._id === updatedOrder._id
          ? updatedOrder
          : previous,
      );

      setNotice("Order status updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update order status.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const currentPageOrderCount = orders.length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Admin dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Order management
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Review customer orders and manage fulfillment status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadOrders(page)}
            disabled={loading}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh orders"}
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              className="font-semibold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            {notice}
          </div>
        )}

        <section className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total orders</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalOrders}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Orders on this page</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {currentPageOrderCount}
            </p>
          </div>
        </section>

        <section
          aria-label="Customer orders"
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          {loading ? (
            <div className="space-y-4 p-6" aria-label="Loading orders">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-semibold text-slate-900">
                No orders found
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Customer orders will appear here when available.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-slate-100 text-xs uppercase tracking-wider text-slate-600">
                    <tr>
                      <th className="px-5 py-4">Order</th>
                      <th className="px-5 py-4">Customer</th>
                      <th className="px-5 py-4">Total</th>
                      <th className="px-5 py-4">Payment</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((order) => {
                      const nextStatuses =
                        allowedTransitions[order.status];

                      return (
                        <tr key={order._id} className="align-top">
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-900">
                              #{order._id.slice(-8).toUpperCase()}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {order.items.length} item(s)
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-medium text-slate-900">
                              {order.user?.name ?? "Unknown customer"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {order.user?.email ?? "No email"}
                            </p>
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                            {formatPrice(order.total)}
                          </td>
                          <td className="px-5 py-4">
                            <span className="capitalize text-slate-700">
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle(order.status)}`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col items-start gap-2">
                              <button
                                type="button"
                                onClick={() => void viewOrder(order._id)}
                                className="font-semibold text-blue-700 hover:underline"
                              >
                                View details
                              </button>

                              {nextStatuses.length > 0 && (
                                <select
                                  aria-label={`Update status for order ${order._id}`}
                                  value=""
                                  disabled={updatingId !== null}
                                  onChange={(event) => {
                                    const value = event.target.value;
                                    if (
                                      statuses.includes(value as OrderStatus)
                                    ) {
                                      void changeStatus(
                                        order,
                                        value as OrderStatus,
                                      );
                                    }
                                  }}
                                  className="max-w-40 rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs disabled:opacity-50"
                                >
                                  <option value="" disabled>
                                    Update status
                                  </option>
                                  {nextStatuses.map((status) => (
                                    <option key={status} value={status}>
                                      {status}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">
                <p className="text-sm text-slate-600">
                  Page {page} of {Math.max(totalPages, 1)}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1 || loading}
                    onClick={() => void loadOrders(page - 1)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages || loading}
                    onClick={() => void loadOrders(page + 1)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </footer>
            </>
          )}
        </section>

        {detailsLoading && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600"
          >
            Loading order details...
          </div>
        )}


        {selectedOrder && (
          <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white p-5 sm:p-7">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                    Order details
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle(selectedOrder.status)}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>

                <h2 className="mt-3 break-all text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  #{selectedOrder._id}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Placed {formatDate(selectedOrder.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Close details
              </button>
            </div>

            <div className="space-y-6 p-5 sm:p-7">
              {/* Summary cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <span className="text-lg">₹</span>
                    </span>
                    Order total
                  </div>
                  <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                    {formatPrice(selectedOrder.total)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Including shipping and discounts
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      <span className="text-lg">▤</span>
                    </span>
                    Items ordered
                  </div>
                  <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                    {selectedOrder.items.reduce(
                      (total, item) => total + item.quantity,
                      0,
                    )}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedOrder.items.length} unique product(s)
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5 sm:col-span-2 lg:col-span-1">
                  <p className="text-sm text-slate-500">Payment status</p>
                  <div className="mt-4 flex items-center gap-3">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${selectedOrder.paymentStatus === "paid"
                          ? "bg-emerald-50 text-emerald-700"
                          : selectedOrder.paymentStatus === "failed"
                            ? "bg-red-50 text-red-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                    >
                      <span className="text-lg">
                        {selectedOrder.paymentStatus === "paid"
                          ? "✓"
                          : selectedOrder.paymentStatus === "failed"
                            ? "!"
                            : "◷"}
                      </span>
                    </span>
                    <div>
                      <p className="font-semibold capitalize text-slate-900">
                        {selectedOrder.paymentStatus}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Payment information
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order progress */}
              <div className="rounded-2xl border border-slate-200 p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900">Order progress</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Current fulfillment status
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle(selectedOrder.status)}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>

                {selectedOrder.status === "cancelled" ? (
                  <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">
                    This order has been cancelled.
                  </div>
                ) : (
                  <div className="mt-6 grid grid-cols-4 gap-2">
                    {(["pending", "confirmed", "shipped", "delivered"] as const).map(
                      (status, index, steps) => {
                        const currentIndex = steps.indexOf(
                          selectedOrder.status as (typeof steps)[number],
                        );
                        const complete =
                          currentIndex >= 0 && index <= currentIndex;

                        return (
                          <div key={status}>
                            <div
                              className={`h-1.5 rounded-full ${complete ? "bg-emerald-500" : "bg-slate-100"
                                }`}
                            />
                            <p
                              className={`mt-2 text-xs capitalize ${complete
                                  ? "font-semibold text-slate-900"
                                  : "text-slate-400"
                                }`}
                            >
                              {status}
                            </p>
                          </div>
                        );
                      },
                    )}
                  </div>
                )}
              </div>

              {/* Customer and shipping */}
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-700">
                      {(selectedOrder.user?.name ?? "C").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Customer</h3>
                      <p className="text-sm text-slate-500">
                        Customer information
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Full name
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {selectedOrder.user?.name ?? "Unknown customer"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Email address
                      </p>
                      <p className="mt-1 break-all text-sm text-slate-700">
                        {selectedOrder.user?.email ?? "No email available"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      <span className="text-lg">⌖</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Shipping address</h3>
                      <p className="text-sm text-slate-500">
                        Delivery information
                      </p>
                    </div>
                  </div>

                  <address className="mt-5 space-y-1 border-t border-slate-100 pt-4 text-sm not-italic leading-6 text-slate-600">
                    <p className="font-semibold text-slate-900">
                      {selectedOrder.shippingAddress.fullName}
                    </p>
                    <p>{selectedOrder.shippingAddress.phone}</p>
                    <p>{selectedOrder.shippingAddress.addressLine1}</p>
                    {selectedOrder.shippingAddress.addressLine2 && (
                      <p>{selectedOrder.shippingAddress.addressLine2}</p>
                    )}
                    {selectedOrder.shippingAddress.landmark && (
                      <p>Near {selectedOrder.shippingAddress.landmark}</p>
                    )}
                    <p>
                      {[
                        selectedOrder.shippingAddress.city,
                        selectedOrder.shippingAddress.state,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <p>{selectedOrder.shippingAddress.postalCode}</p>
                  </address>
                </div>
              </div>

              {/* Products */}
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                  <h3 className="font-bold text-slate-900">Order items</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedOrder.items.length} product(s) in this order
                  </p>
                </div>

                <div className="divide-y divide-slate-100 px-5">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={`${item.product}-${index}`}
                      className="flex flex-wrap items-center gap-4 py-5"
                    >
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
                        <span className="text-2xl">▦</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>

                      <p className="font-bold text-slate-900">
                        {formatPrice(item.lineTotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price summary */}
              <div className="flex justify-end">
                <div className="w-full rounded-2xl border border-slate-200 p-5 sm:max-w-md sm:p-6">
                  <h3 className="font-bold text-slate-900">Payment summary</h3>

                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between gap-4 text-slate-600">
                      <span>Subtotal</span>
                      <span>{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between gap-4 text-slate-600">
                      <span>Shipping</span>
                      <span>{formatPrice(selectedOrder.shippingFee)}</span>
                    </div>
                    <div className="flex justify-between gap-4 text-slate-600">
                      <span>Discount</span>
                      <span>
                        −{formatPrice(selectedOrder.discount)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-200 pt-5">
                    <div>
                      <p className="font-bold text-slate-900">Order total</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {selectedOrder.paymentStatus === "paid"
                          ? "Payment received"
                          : "Payment not confirmed"}
                      </p>
                    </div>
                    <p className="text-2xl font-bold tracking-tight text-slate-900">
                      {formatPrice(selectedOrder.total)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default AdminOrders;