import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";

import CustomerLayout from "./layouts/CustomerLayout";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyOrders from "./pages/MyOrders";
import OrderConfirmation from "./pages/OrderConfirmation";

import AdminRoute from "./components/AdminRoute";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";

const App = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/orders/:orderId/confirmation" element={<OrderConfirmation />} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;