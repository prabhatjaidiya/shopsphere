import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    subtotal,
  } = useCart();

  if (cart.length === 0) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <span className="text-6xl">🛒</span>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Your cart is empty
        </h1>
        <p className="mt-2 text-gray-600">
          Looks like you haven't added anything yet.
        </p>
        <Link
          to="/products"
          className="mt-6 rounded-xl bg-gray-900 px-6 py-3 font-medium text-white transition hover:bg-gray-700"
        >
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-[60vh] bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900">
          Shopping Cart
        </h1>
        <p className="mt-2 text-gray-600">
          {cart.reduce((total, item) => total + item.quantity, 0)} items in your cart
        </p>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <section className="space-y-4 lg:col-span-2">
            {cart.map((item) => (
              <article
                key={item.product.id}
                className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center"
              >
                <div className="flex h-28 w-full shrink-0 items-center justify-center rounded-xl bg-gray-100 sm:w-28">
                  {item.product.image ? (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-full w-full rounded-xl object-contain p-2"
                    />
                  ) : (
                    <span className="text-3xl">📦</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-gray-900">
                    {item.product.name}
                  </h2>
                  <p className="mt-1 text-gray-600">
                    ₹{item.product.price.toLocaleString("en-IN")}
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    Item total: ₹
                    {(item.product.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <div className="flex items-center overflow-hidden rounded-lg border border-gray-200">
                    <button
                      type="button"
                      onClick={() => decreaseQuantity(item.product.id)}
                      disabled={item.quantity <= 1}
                      aria-label={`Decrease ${item.product.name} quantity`}
                      className="h-10 w-10 hover:bg-gray-100 disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="min-w-10 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => increaseQuantity(item.product.id)}
                      aria-label={`Increase ${item.product.name} quantity`}
                      className="h-10 w-10 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}

            <Link
              to="/products"
              className="inline-block pt-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              ← Continue Shopping
            </Link>
          </section>

          <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Order Summary
            </h2>

            <div className="mt-5 flex justify-between gap-4 text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>

            <p className="mt-3 text-sm text-gray-500">
              Shipping and taxes are calculated at checkout.
            </p>

            <Link
              to="/checkout"
              className="mt-6 block rounded-xl bg-gray-900 px-5 py-3 text-center font-semibold text-white transition hover:bg-gray-700"
            >
              Proceed to Checkout
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Cart;