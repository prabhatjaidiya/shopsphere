import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/AuthContext";

type OrderItem = {
  product: string;
  name: string;
  price: number;
  quantity: number;
  lineTotal: number;
};

type Order = {
  _id: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: string;
  createdAt: string;
};

type OrdersResponse = {
  success: boolean;
  count: number;
  data: Order[];
};

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuth();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      // TODO: Pass the JWT from your existing auth context.
      const response = await apiRequest<OrdersResponse>(
        "/api/orders/my-orders",
        {
          method: "GET",
          token: token ?? undefined,
        }
      );

      setOrders(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchOrders();
  }, []);

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-amber-100 text-amber-800";
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-3xl font-bold">My Orders</h1>

        <div className="mt-8 space-y-4" aria-label="Loading orders">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-xl bg-gray-100"
            />
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Couldn't load your orders</h1>

        <p className="mt-3 text-gray-600">{error}</p>

        <button
          type="button"
          onClick={() => void fetchOrders()}
          className="mt-6 rounded-lg bg-gray-900 px-5 py-3 text-white hover:bg-gray-700"
        >
          Try again
        </button>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <span className="text-3xl" aria-hidden="true">
            📦
          </span>
        </div>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          No orders yet
        </h1>

        <p className="mt-3 text-gray-600">
          Your purchases will appear here when you place your first order.
        </p>

        <Link
          to="/products"
          className="mt-6 inline-block rounded-lg bg-gray-900 px-6 py-3 font-medium text-white hover:bg-gray-700"
        >
          Start shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-gray-500">
          Your account
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          My Orders
        </h1>

        <p className="mt-2 text-gray-600">
          Track your purchases and review your order details.
        </p>
      </header>

      <section className="space-y-5" aria-label="Order history">
        {orders.map((order) => (
          <article
            key={order._id}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>

                <p className="mt-1 break-all font-semibold text-gray-900">
                  {order._id}
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>

              <span
                className={`w-fit rounded-full px-3 py-1 text-sm font-medium capitalize ${getStatusStyle(order.status)}`}
              >
                {order.status}
              </span>
            </div>

            <div className="mt-5 border-t border-gray-100 pt-4">
              <h2 className="font-semibold text-gray-900">
                Items ({order.items.length})
              </h2>

              <div className="mt-3 space-y-3">
                {order.items.map((item) => (
                  <div
                    key={`${order._id}-${item.product}`}
                    className="flex flex-wrap items-center justify-between gap-2"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {item.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>

                    <p className="font-medium text-gray-900">
                      {formatPrice(item.lineTotal)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4">
              <div>
                <p className="text-sm text-gray-500">Order total</p>

                <p className="mt-1 text-xl font-bold text-gray-900">
                  {formatPrice(order.total)}
                </p>
              </div>

              <Link
                to={`/orders/${order._id}/confirmation`}
                state={{ order }}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
              >
                View order
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
};

export default MyOrders;