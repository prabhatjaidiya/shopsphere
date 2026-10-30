import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiRequest } from "../lib/api";
import { useAuth } from "./AuthContext";

type WishlistResponse = {
  success: boolean;
  data: {
    products: Array<{ _id: string }>;
  };
};

type WishlistContextValue = {
  wishlistIds: Set<string>;
  isLoading: boolean;
  pendingIds: Set<string>;
  error: string;
  toggleWishlist: (productId: string) => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(
  undefined
);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchWishlist = async () => {
      if (!token) {
        setWishlistIds(new Set());
        setIsLoading(false);
        setError("");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await apiRequest<WishlistResponse>(
          "/api/wishlist",
          { token }
        );

        if (!cancelled) {
          setWishlistIds(
            new Set(response.data.products.map((product) => product._id))
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load wishlist."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      void fetchWishlist();
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [token]);

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (!token) {
        throw new Error("Please log in to manage your wishlist.");
      }

      if (!/^[a-f\d]{24}$/i.test(productId)) {
        throw new Error("This product has an invalid ID.");
      }

      if (pendingIds.has(productId)) return;

      const isSaved = wishlistIds.has(productId);

      setPendingIds((current) => new Set(current).add(productId));
      setError("");

      try {
        if (isSaved) {
          await apiRequest(`/api/wishlist/${productId}`, {
            method: "DELETE",
            token,
          });

          setWishlistIds((current) => {
            const next = new Set(current);
            next.delete(productId);
            return next;
          });
        } else {
          await apiRequest("/api/wishlist", {
            method: "POST",
            token,
            body: JSON.stringify({ productId }),
          });

          setWishlistIds((current) => new Set(current).add(productId));
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to update wishlist.";

        setError(message);
        throw new Error(message, { cause: err });
      } finally {
        setPendingIds((current) => {
          const next = new Set(current);
          next.delete(productId);
          return next;
        });
      }
    },
    [token, pendingIds, wishlistIds]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        isLoading,
        pendingIds,
        error,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }

  return context;
}