import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const CustomerLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default CustomerLayout;