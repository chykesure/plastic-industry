import React, { useState } from "react";
import { Database, Store, ShoppingCart, Users, Truck } from "lucide-react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import Header from "../partials/Header";

function Menu() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const modules = [
    {
      title: "ERP",
      description: "Manage products, users, roles, inventory & reports.",
      icon: Database,
      link: "/erp-login",
      gradient: "from-indigo-500 to-indigo-700",
      buttonColor: "text-indigo-700",
      available: true,
    },
    {
      title: "POS",
      description: "Cashier system for in-store sales & payments.",
      icon: Store,
      link: "/pos-login",
      gradient: "from-green-500 to-green-700",
      buttonColor: "text-green-700",
      available: true,
    },
    {
      title: "Warehouse",
      description: "Receive goods, stock counts, and manage adjustments.",
      icon: ShoppingCart,
      link: "/warehouse",
      gradient: "from-orange-500 to-orange-700",
      buttonColor: "text-orange-700",
      available: false,
    },
    {
      title: "E-commerce",
      description: "Customer portal for browsing and placing online orders.",
      icon: Users,
      link: "/ecommerce",
      gradient: "from-blue-500 to-blue-700",
      buttonColor: "text-blue-700",
      available: false,
    },
    {
      title: "Driver",
      description: "Delivery app for drivers to manage assigned orders.",
      icon: Truck,
      link: "/driver",
      gradient: "from-pink-500 to-pink-700",
      buttonColor: "text-pink-700",
      available: false,
    },
  ];

  const handleModuleClick = (mod) => {
    if (!mod.available) {
      Swal.fire({
        title: "Coming Soon",
        text: `${mod.title} module is under development!`,
        icon: "info",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      window.location.href = mod.link;
    }, 800);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <motion.div
            className="h-16 w-16 border-4 border-t-indigo-600 border-b-indigo-400 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
          <p className="mt-4 text-gray-700 font-medium text-lg animate-pulse text-center">
            Loading, please wait...
          </p>
        </div>
      )}

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow relative">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/banner1.jpg')" }}>
            <div className="absolute inset-0 bg-black/50"></div>
          </div>

          <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-20">
              {modules.map((mod) => (
                <motion.div
                  key={mod.title}
                  className={`rounded-2xl p-6 flex flex-col items-center justify-between text-white shadow-md transition-all duration-300 hover:shadow-xl bg-gradient-to-r ${mod.gradient}`}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 bg-white/20 rounded-full mb-4 flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32">
                      <mod.icon className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-white" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-semibold">{mod.title}</h2>
                    <p className="text-sm sm:text-base opacity-90 mt-2">{mod.description}</p>
                  </div>

                  <button
                    onClick={() => handleModuleClick(mod)}
                    className="mt-6 inline-block text-center bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm sm:text-base transition"
                  >
                    <span className={mod.buttonColor}>Go to {mod.title}</span>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Menu;
