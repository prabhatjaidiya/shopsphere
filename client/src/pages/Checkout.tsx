import { useState } from "react";
import ShippingAddressForm, {
  type ShippingAddress,
} from "../components/ShippingAddressForm";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";
import { useNavigate } from "react-router-dom";

type CheckoutResponse = {
  success: boolean;
  message?: string;
  data?: {
    shippingAddress: ShippingAddress;
    items: {
      productId: string;
      name: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }[];
    subtotal: number;
    currency: string;
  };
};

type CreateOrderResponse = {
  success: boolean;
  message?: string;
  data?: {
    _id: string;
    items: {
      product: string;
      name: string;
      price: number;
      quantity: number;
      lineTotal: number;
    }[];
    subtotal: number;
    shippingFee: number;
    discount: number;
    total: number;
    status: string;
    createdAt: string;
  };
};

export default function Checkout() {
  const { cart, subtotal, isLoading, error } = useCart();
  const { token, user } = useAuth();

  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress | null>(null);
  const [checkoutData, setCheckoutData] =
    useState<CheckoutResponse["data"] | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const navigate = useNavigate();

  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(price);

  async function handleAddressSubmit(address: ShippingAddress) {
    console.log("Parent checkout callback called");

    if (!token || user?.role !== "customer") {
      throw new Error("Please log in with a customer account to continue.");
    }

    setIsValidating(true);
    setCheckoutError(null);
    setCheckoutData(null);

    try {
      console.log("Sending checkout validation request");

      const response = await apiRequest<CheckoutResponse>(
        "/api/checkout/validate",
        {
          method: "POST",
          token,
          body: JSON.stringify({ shippingAddress: address }),
        }
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.message || "Checkout validation failed."
        );
      }

      setShippingAddress(response.data.shippingAddress);
      setCheckoutData(response.data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Checkout validation failed. Please try again.";

      setCheckoutError(message);
      throw new Error(message);
    } finally {
      setIsValidating(false);
    }
  }

  async function handlePlaceOrder() {
    if (!token || user?.role !== "customer") {
      setOrderError("Please log in with a customer account.");
      return;
    }

    if (!shippingAddress || !checkoutData) {
      setOrderError("Please validate your shipping address first.");
      return;
    }

    setIsCreatingOrder(true);
    setOrderError(null);

    try {
      const response = await apiRequest<CreateOrderResponse>(
        "/api/orders",
        {
          method: "POST",
          token,
          body: JSON.stringify({ shippingAddress }),
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to create order.");
      }

      navigate(`/orders/${response.data._id}/confirmation`, {
        state: { order: response.data },
        replace: true,
      });
    } catch (err) {
      setOrderError(
        err instanceof Error
          ? err.message
          : "Unable to place your order. Please try again."
      );
    } finally {
      setIsCreatingOrder(false);
    }
  }

  if (isLoading) {
    return <p className="p-6 text-gray-600">Loading your cart...</p>;
  }

  if (error) {
    return (
      <div className="p-6" role="alert">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!token || user?.role !== "customer") {
    return (
      <section className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-bold">Customer login required</h1>
        <p className="mt-2 text-gray-600">
          Please log in with a customer account to continue.
        </p>
      </section>
    );
  }

  if (cart.length === 0) {
    return (
      <section className="mx-auto max-w-2xl p-6 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-gray-600">
          Add some products before proceeding to checkout.
        </p>
      </section>
    );
  }

  return (
    <main className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-3">
      <section className="space-y-4 lg:col-span-2">
        <ShippingAddressForm
          initialAddress={shippingAddress ?? undefined}
          onSubmit={handleAddressSubmit}
        />

        {isValidating && (
          <p role="status" className="text-sm text-indigo-600">
            Validating checkout with the server...
          </p>
        )}

        {checkoutError && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {checkoutError}
          </p>
        )}

        {checkoutData && (
          <div
            role="status"
            className="rounded-lg bg-green-50 p-4 text-green-800"
          >
            <p className="font-semibold">Checkout validation successful.</p>
            <p className="mt-1 text-sm">
              Server-verified subtotal:{" "}
              {formatPrice(checkoutData.subtotal)}
            </p>
            <p className="mt-1 text-xs">
              No order has been created yet.
            </p>
          </div>
        )}
      </section>

      <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold">Order summary</h2>

        <div className="mt-5 space-y-4">
          {cart.map((item) => (
            <div
              key={String(item.product.id)}
              className="flex gap-3"
            >
              {item.product.image && (
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              )}

              <div className="min-w-0 flex-1">
                <p className="font-medium">{item.product.name}</p>
                <p className="text-sm text-gray-500">
                  Qty: {item.quantity}
                </p>
                <p className="text-sm text-gray-600">
                  {formatPrice(item.product.price)} each
                </p>
              </div>

              <p className="font-semibold">
                {formatPrice(item.product.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 border-t border-gray-200 pt-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Display subtotal</span>
            <span className="font-semibold">
              {formatPrice(subtotal)}
            </span>
          </div>

          {checkoutData && (
            <div className="mt-3 flex justify-between gap-3">
              <span className="text-gray-600">
                Server-verified subtotal
              </span>
              <span className="font-semibold text-green-700">
                {formatPrice(checkoutData.subtotal)}
              </span>
            </div>
          )}

          <p className="mt-3 text-xs text-gray-500">
            The displayed subtotal is an estimate. The server verifies
            current prices and stock. Shipping, taxes, and payment
            are not included in this validation step.
          </p>
        </div>

        {checkoutData && (
          <div className="mt-5">
            {orderError && (
              <p
                role="alert"
                className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {orderError}
              </p>
            )}

            <button
              type="button"
              onClick={() => void handlePlaceOrder()}
              disabled={isCreatingOrder || isValidating}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreatingOrder ? "Placing order..." : "Place Order"}
            </button>
          </div>
        )}
      </aside>
    </main>
  );
}