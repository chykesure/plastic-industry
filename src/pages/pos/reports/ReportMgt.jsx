// src/pages/reports/ReportMgt.jsx
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../../partials/Sidebar";
import Header from "../../../partials/Header";
import Banner from "../../../partials/Banner";

// Import report sub-pages
import SalesReport from "./SalesReport";
import TopProductsReport from "./TopProductsReport";
import RevenueReport from "./RevenueReport";
import CashDrawerReport from "./CashDrawerReport";

function ReportMgt() {
  const { subpage } = useParams();
  const navigate = useNavigate();

  const userRole = localStorage.getItem("role");

  // Redirect to /reports/sales if no subpage
  useEffect(() => {
    if (!subpage) {
      navigate("/reports/sales", { replace: true });
    }
    // If user is not super-admin and tries to access revenue, redirect
    if (subpage === "revenue" && userRole !== "Super-Admin") {
      navigate("/reports/sales", { replace: true });
    }
  }, [subpage, navigate, userRole]);

  const activeTab = subpage || "sales";

  const handleTabChange = (tabKey) => {
    // Prevent non-super-admin from navigating to Revenue
    if (tabKey === "revenue" && userRole !== "Super-Admin") return;
    navigate(`/reports/${tabKey}`);
  };

  // Tabs array filtered by role
  const tabs = [
    { key: "sales", label: "Sales" },
    { key: "top-products", label: "Top Products" },
    ...(userRole === "Super-Admin" ? [{ key: "revenue", label: "Revenue" }] : []),
    { key: "cash-drawer", label: "Return History" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "sales":
        return <SalesReport />;
      case "top-products":
        return <TopProductsReport />;
      case "revenue":
        return userRole === "Super-Admin" ? <RevenueReport /> : <SalesReport />;
      case "cash-drawer":
        return <CashDrawerReport />;
      default:
        return <SalesReport />; // fallback
    }
  };

  return (
    <div className="flex overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Main wrapper */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <Header />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-4 w-full">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Reports Management
              </h1>
              <p className="text-gray-400 mt-1">
                Monitor sales, revenue, product performance, and Retruns history.
              </p>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-700">
              <nav className="flex space-x-8 -mb-px">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    className={`pb-2 text-sm font-medium transition ${
                      activeTab === tab.key
                        ? "border-b-2 border-blue-500 text-blue-400"
                        : "border-b-2 border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500"
                    }`}
                    onClick={() => handleTabChange(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-4 rounded-xl shadow-lg border border-gray-700 overflow-y-auto max-h-[calc(100vh-200px)]">
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

export default ReportMgt;
