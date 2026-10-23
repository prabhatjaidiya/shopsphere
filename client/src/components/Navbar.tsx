import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="shrink-0 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl"
        >
          ShopSphere
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          <NavLink to="/" className="text-sm font-medium text-gray-600 hover:text-black">
            Home
          </NavLink>

          <NavLink to="/products" className="text-sm font-medium text-gray-600 hover:text-black">
            Products
          </NavLink>

          <NavLink to="/orders" className="text-sm font-medium text-gray-600 hover:text-black">
            Orders
          </NavLink>
          <NavLink
            to="/wishlist"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-red-500"
          >
            <span aria-hidden="true">♡</span>
            <span>Wishlist</span>
          </NavLink>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            to="/cart"
            className="whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 sm:px-3"
          >
            🛒 <span className="hidden xs:inline">Cart</span>
          </Link>

          {user ? (
            <>
              <span className="hidden text-sm font-medium text-gray-700 sm:inline">
                Hi, {user.name}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="whitespace-nowrap rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:px-4"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:block"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="whitespace-nowrap rounded-lg bg-black px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 sm:px-4"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;