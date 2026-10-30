import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { apiRequest } from "../lib/api";
import { useAuth } from "./AuthContext";
import type { Product, ProductId } from "../data/products";

type CartProduct = Product & {
  stock?: number;
  images?: string[];
};

export type CartItem = {
  product: CartProduct;
  quantity: number;
};

type CartApiProduct = {
  _id: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
};

type CartApiItem = {
  product: CartApiProduct | string;
  quantity: number;
};

type CartApiResponse = {
  success: boolean;
  message?: string;
  data: {
    items: CartApiItem[];
  };
};

type CartContextType = {
  cart: CartItem[];
  isLoading: boolean;
  error: string | null;
  addToCart: (product: Product, quantity: number) => Promise<void>;
  increaseQuantity: (productId: ProductId) => Promise<void>;
  decreaseQuantity: (productId: ProductId) => Promise<void>;
  removeFromCart: (productId: ProductId) => Promise<void>;
  subtotal: number;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function mapCartResponse(response: CartApiResponse): CartItem[] {
  return response.data.items.flatMap((item) => {
    if (typeof item.product === "string") {
      return [];
    }

    const product = item.product;

    return [{
      product: {
        id: product._id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        images: product.images,
        image: product.images[0],
        category: "",
        rating: 0,
      },
      quantity: item.quantity,
    }];
  });
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCart = useCallback(async () => {
    if (!token || user?.role !== "customer") {
      setCart([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest<CartApiResponse>("/api/cart", {
        token,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to load cart");
      }

      setCart(mapCartResponse(response));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cart");
    } finally {
      setIsLoading(false);
    }
  }, [token, user?.role]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void refreshCart();
    }, 0);

    return () => clearTimeout(timer);
  }, [refreshCart]);

  const addToCart = async (product: Product, quantity: number) => {
    if (!token || user?.role !== "customer") {
      throw new Error("Please log in with a customer account to use your cart");
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("Quantity must be a positive integer");
    }

    const response = await apiRequest<CartApiResponse>("/api/cart", {
      method: "POST",
      token,
      body: JSON.stringify({
        productId: String(product.id),
        quantity,
      }),
    });

    if (!response.success) {
      throw new Error(response.message || "Failed to add product");
    }

    setCart(mapCartResponse(response));
    setError(null);
  };

  const updateQuantity = async (productId: ProductId, quantity: number) => {
    if (!token) {
      throw new Error("Please log in to update your cart");
    }

    const response = await apiRequest<CartApiResponse>(
      `/api/cart/${encodeURIComponent(String(productId))}`,
      {
        method: "PATCH",
        token,
        body: JSON.stringify({ quantity }),
      }
    );

    if (!response.success) {
      throw new Error(response.message || "Failed to update quantity");
    }

    setCart(mapCartResponse(response));
    setError(null);
  };

  const increaseQuantity = async (productId: ProductId) => {
    const item = cart.find((entry) => entry.product.id === productId);
    if (item) {
      await updateQuantity(productId, item.quantity + 1);
    }
  };

  const decreaseQuantity = async (productId: ProductId) => {
    const item = cart.find((entry) => entry.product.id === productId);
    if (item && item.quantity > 1) {
      await updateQuantity(productId, item.quantity - 1);
    }
  };

  const removeFromCart = async (productId: ProductId) => {
    if (!token) {
      throw new Error("Please log in to update your cart");
    }

    const response = await apiRequest<CartApiResponse>(
      `/api/cart/${encodeURIComponent(String(productId))}`,
      {
        method: "DELETE",
        token,
      }
    );

    if (!response.success) {
      throw new Error(response.message || "Failed to remove product");
    }

    setCart(mapCartResponse(response));
    setError(null);
  };

  const subtotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        error,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        subtotal,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}