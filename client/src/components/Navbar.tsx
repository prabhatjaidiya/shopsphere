import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    navigate("/login");
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-3 py-2 text-sm font-medium transition ${isActive
      ? "bg-gray-100 text-black"
      : "text-gray-600 hover:bg-gray-100 hover:text-black"
    }`;

  return (
    <header className="relative w-full border-b border-gray-200 bg-white">
      <nav className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="shrink-0 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl"
        >
          ShopSphere
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 lg:flex">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>

          <NavLink to="/products" className={navLinkClass}>
            Products
          </NavLink>

          <NavLink to="/orders" className={navLinkClass}>
            Orders
          </NavLink>

          <NavLink to="/wishlist" className={navLinkClass}>
            Wishlist
          </NavLink>
        </div>

        {/* Cart, Auth and Mobile Menu */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            to="/cart"
            onClick={closeMenu}
            className="whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 sm:px-3"
          >
            🛒 <span className="hidden sm:inline">Cart</span>
          </Link>

          {user ? (
            <span className="hidden text-sm font-medium text-gray-700 sm:inline">
              Hi, {user.name}
            </span>
          ) : (
            <>
              <Link
                to="/login"
                onClick={closeMenu}
                className="hidden rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:block"
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={closeMenu}
                className="whitespace-nowrap rounded-lg bg-black px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 sm:px-4"
              >
                Sign Up
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 transition hover:bg-gray-100 lg:hidden"
          >
            <span className="text-xl" aria-hidden="true">
              {isMenuOpen ? "✕" : "☰"}
            </span>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div
            id="mobile-navigation"
            className="absolute left-4 right-4 top-full z-50 mt-2 rounded-xl border border-gray-200 bg-white p-3 shadow-lg lg:hidden"
          >
            <div className="flex flex-col gap-1">
              <NavLink
                to="/"
                className={navLinkClass}
                onClick={closeMenu}
              >
                Home
              </NavLink>

              <NavLink
                to="/products"
                className={navLinkClass}
                onClick={closeMenu}
              >
                Products
              </NavLink>

              <NavLink
                to="/orders"
                className={navLinkClass}
                onClick={closeMenu}
              >
                Orders
              </NavLink>

              <NavLink
                to="/wishlist"
                className={navLinkClass}
                onClick={closeMenu}
              >
                Wishlist
              </NavLink>

              {user && (
                <>
                  <div className="my-2 border-t border-gray-200" />

                  <div className="px-3 py-2 text-sm font-medium text-gray-500">
                    Hi, {user.name}
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;