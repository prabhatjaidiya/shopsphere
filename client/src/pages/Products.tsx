import { useState } from "react";
import ShippingAddressForm, {
  type ShippingAddress,
} from "../components/ShippingAddressForm";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";

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

export default function Checkout() {
  const { cart, subtotal, isLoading, error } = useCart();
  const { token, user } = useAuth();

  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutData, setCheckoutData] =
    useState<CheckoutResponse["data"] | null>(null);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(price);

  async function handleAddressSubmit(address: ShippingAddress) {
    console.log("Checkout submit handler called", address);
    if (!token || user?.role !== "customer") {
      throw new Error("Please log in with a customer account to continue.");
    }

    if (cart.length === 0) {
      throw new Error("Your cart is empty.");
    }

    setIsValidating(true);
    setCheckoutError(null);
    setCheckoutData(null);

    try {
      const response = await apiRequest<CheckoutResponse>(
        "/api/checkout/validate",
        {
          method: "POST",
          token,
          body: JSON.stringify({
            shippingAddress: address,
          }),
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
          : "Unable to validate checkout. Please try again.";

      setCheckoutError(message);
      throw new Error(message);
    } finally {
      setIsValidating(false);
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12">
        <p className="text-gray-600">Loading your cart...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12">
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700"
        >
          Unable to load your cart: {error}
        </div>
      </main>
    );
  }

  if (!token || user?.role !== "customer") {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h1 className="text-xl font-bold text-gray-900">
            Customer login required
          </h1>
          <p className="mt-2 text-gray-600">
            Please log in with a customer account to continue checkout.
          </p>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Your cart is empty
          </h1>
          <p className="mt-2 text-gray-600">
            Add products to your cart before proceeding to checkout.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-indigo-600">
          SHOPSPHERE CHECKOUT
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
          Complete your checkout
        </h1>
        <p className="mt-2 text-gray-600">
          Confirm your shipping details and review your order.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2">
          <ShippingAddressForm
            initialAddress={shippingAddress ?? undefined}
            onSubmit={handleAddressSubmit}
          />

          {isValidating && (
            <p role="status" className="text-sm text-indigo-600">
              Validating address, product prices, and stock...
            </p>
          )}

          {checkoutError && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {checkoutError}
            </div>
          )}

          {checkoutData && (
            <div
              role="status"
              className="rounded-xl border border-green-200 bg-green-50 p-5"
            >
              <h2 className="font-semibold text-green-800">
                Checkout details validated
              </h2>
              <p className="mt-1 text-sm text-green-700">
                Your shipping address, current product prices, and stock
                passed validation. No order has been placed yet.
              </p>
            </div>
          )}
        </section>

        <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Order summary
          </h2>

          <div className="mt-5 space-y-5">
            {cart.map((item) => (
              <div
                key={String(item.product.id)}
                className="flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">
                    {item.product.name}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Qty: {item.quantity} ×{" "}
                    {formatPrice(item.product.price)}
                  </p>
                </div>

                <p className="shrink-0 font-semibold text-gray-900">
                  {formatPrice(
                    item.product.price * item.quantity
                  )}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3 border-t border-gray-200 pt-5">
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-gray-600">
                Display subtotal
              </span>
              <span className="font-medium text-gray-900">
                {formatPrice(subtotal)}
              </span>
            </div>

            {checkoutData && (
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-gray-600">
                  Server-verified subtotal
                </span>
                <span className="font-semibold text-green-700">
                  {formatPrice(checkoutData.subtotal)}
                </span>
              </div>
            )}

            <p className="text-xs leading-5 text-gray-500">
              The displayed subtotal is an estimate. The server-verified
              amount uses current database prices. Shipping fees, taxes,
              and payment are not included in this validation step.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}