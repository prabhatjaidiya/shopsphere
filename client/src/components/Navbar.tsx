import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav>
      <Link to="/">ShopSphere</Link>

      <div>
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/login">Login</Link>
      </div>
    </nav>
  );
};

export default Navbar;