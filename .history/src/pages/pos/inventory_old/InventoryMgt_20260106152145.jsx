import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../../partials/Sidebar";
import Header from "../../../partials/Header";
import Banner from "../../../partials/Banner";

// Inventory sub-pages
import StockIn from "./StockIn";
import LowStock from "./LowStock";
import Suppliers from "./Suppliers";
import StockOut from "./StockOut";

function InventoryMgt() {
  const { subpage } = useParams();
  const navigate = useNavigate();

  // Redirect to default subpage if none selected
  useEffect(() => {
    if (!subpage) {
      navigate("/inventory/stockin", { replace: true });
    }
  }, [subpage, navigate]);

  const activeTab = subpage || "stockin";

  const handleTabChange = (tab) => {
    navigate(`/inventory/${tab}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "stockin":
        return <StockIn />;
      case "stockout":
        return <StockOut />;
      case "low-stock":
        return <LowStock />;
      case "suppliers":
        return <Suppliers />;
      default:
        return <StockIn />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Main wrapper */}
      <div className="relative flex flex-col flex-1 h-full overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* Page Header */}
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              Inventory Management
            </h1>
            <p className="text-gray-400 mt-1">
              Manage inventory: stock in/out, low stock alerts, and suppliers.
            </p>
          </div>

          {/* Tabs */}
          <div className="px-4 sm:px-6 lg:px-8 mb-4 border-b border-gray-700">
            <nav className="flex space-x-8 -mb-px">
              {["stockin", "stockout", "low-stock", "suppliers"].map((tab) => (
                <button
                  key={tab}
                  className={`pb-2 text-sm font-medium transition ${
                    activeTab === tab
                      ? "border-b-2 border-green-500 text-green-400"
                      : "border-b-2 border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500"
                  }`}
                  onClick={() => handleTabChange(tab)}
                >
                  {tab
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-4 overflow-auto">
            <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-4 rounded-xl shadow-lg border border-gray-700 min-h-full">
              {renderTabContent()}
            </div>
          </div>
        </main>

        {/* Banner / Footer */}
        <Banner />
      </div>
    </div>
  );
}

export default InventoryMgt;
