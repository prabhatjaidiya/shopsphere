import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-gray-950 text-gray-300">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link
              to="/"
              className="text-2xl font-bold text-white"
            >
              ShopSphere
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-6 text-gray-400">
              Discover quality products, great deals, and everything you need
              in one place.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Shop
            </h3>

            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link
                  to="/products"
                  className="transition hover:text-white"
                >
                  All Products
                </Link>
              </li>

              <li>
                <Link
                  to="/cart"
                  className="transition hover:text-white"
                >
                  Cart
                </Link>
              </li>

              <li>
                <Link
                  to="/orders"
                  className="transition hover:text-white"
                >
                  My Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Account
            </h3>

            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link
                  to="/login"
                  className="transition hover:text-white"
                >
                  Login
                </Link>
              </li>

              <li>
                <Link
                  to="/register"
                  className="transition hover:text-white"
                >
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Contact
            </h3>

            <div className="mt-4 space-y-3 text-sm text-gray-400">
              <p>Email: support@shopsphere.com</p>
              <p>Available 24/7</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col gap-4 border-t border-gray-800 pt-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} ShopSphere. All rights reserved.
          </p>

          <div className="flex gap-6">
            <Link
              to="/"
              className="transition hover:text-white"
            >
              Privacy Policy
            </Link>

            <Link
              to="/"
              className="transition hover:text-white"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;