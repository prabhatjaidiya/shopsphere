import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="shrink-0 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl"
        >
          ShopSphere
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 lg:flex">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm font-medium transition ${isActive
                ? "text-black"
                : "text-gray-500 hover:text-black"
              }`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) =>
              `text-sm font-medium transition ${isActive
                ? "text-black"
                : "text-gray-500 hover:text-black"
              }`
            }
          >
            Products
          </NavLink>

          <NavLink
            to="/orders"
            className={({ isActive }) =>
              `text-sm font-medium transition ${isActive
                ? "text-black"
                : "text-gray-500 hover:text-black"
              }`
            }
          >
            Orders
          </NavLink>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Cart */}
          <Link
            to="/cart"
            className="whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-black sm:px-3"
          >
            🛒 <span className="hidden xs:inline">Cart</span>
          </Link>

          {/* Login - Desktop only */}
          <Link
            to="/login"
            className="hidden rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 sm:block"
          >
            Login
          </Link>

          {/* Register */}
          <Link
            to="/register"
            className="whitespace-nowrap rounded-lg bg-black px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 sm:px-4"
          >
            Sign Up
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;