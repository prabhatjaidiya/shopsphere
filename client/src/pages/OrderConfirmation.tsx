import { useLocation, Link } from "react-router-dom";

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

const OrderConfirmation = () => {
  const location = useLocation();

  // Checkout should navigate here with the created order.
  const order = location.state?.order as Order | undefined;

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);

  if (!order) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">
          Order details unavailable
        </h1>

        <p className="mt-3 text-gray-600">
          We couldn't find the order details for this confirmation.
          Please check your order history.
        </p>

        <Link
          to="/orders"
          className="mt-6 inline-block rounded-lg bg-gray-900 px-5 py-3 text-white"
        >
          View My Orders
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <section className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
          ✓
        </div>

        <h1 className="mt-5 text-3xl font-bold text-gray-900">
          Order confirmed!
        </h1>

        <p className="mt-2 text-gray-600">
          Thank you for shopping with ShopSphere.
        </p>
      </section>

      <section className="mt-8 rounded-xl border p-6">
        <p className="text-sm text-gray-500">Order ID</p>
        <p className="mt-1 break-all font-semibold">
          {order._id}
        </p>

        <p className="mt-4 text-sm text-gray-500">Order date</p>
        <p className="mt-1 font-medium">
          {new Date(order.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        <p className="mt-4 text-sm text-gray-500">Status</p>
        <span className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-sm font-medium capitalize text-amber-800">
          {order.status}
        </span>
      </section>

      <section className="mt-6 rounded-xl border p-6">
        <h2 className="text-xl font-semibold">Order items</h2>

        <div className="mt-4 divide-y">
          {order.items.map((item) => (
            <div
              key={item.product}
              className="flex flex-wrap items-center justify-between gap-3 py-4"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {formatPrice(item.price)} × {item.quantity}
                </p>
              </div>

              <p className="font-semibold">
                {formatPrice(item.lineTotal)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2 border-t pt-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span>{formatPrice(order.shippingFee)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Discount</span>
            <span>−{formatPrice(order.discount)}</span>
          </div>

          <div className="flex justify-between border-t pt-3 text-lg font-bold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          to="/orders"
          className="rounded-lg bg-gray-900 px-6 py-3 text-white hover:bg-gray-700"
        >
          View My Orders
        </Link>

        <Link
          to="/products"
          className="rounded-lg border px-6 py-3 hover:bg-gray-50"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
};

export default OrderConfirmation;