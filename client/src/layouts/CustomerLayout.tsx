import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const CustomerLayout = () => {
  return (
    <div className="flex min-h-screen w-full min-w-0 flex-col overflow-x-clip bg-gray-50">
      <Navbar />

      <main className="w-full min-w-0 flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default CustomerLayout;