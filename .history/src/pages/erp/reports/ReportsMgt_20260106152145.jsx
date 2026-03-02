import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../../partials/ErpSidebar";
import Header from "../../../partials/Header";
import Banner from "../../../partials/Banner";

// Import Reports sub-pages
import SummaryPage from "./SummaryPage";
import FinancialPage from "./FinancialPage";
import HrPage from "./HrPage";
import InventoryPage from "./InventoryPage";

// -----------------------------
// Inline UI Components
// -----------------------------
const Button = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`px-4 py-2 rounded-lg text-white font-medium shadow-sm transition ${className}`}
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl shadow-md border border-gray-700 bg-gray-800 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => <div className={`p-4 ${className}`}>{children}</div>;

function ReportsMgt() {
  const { subpage } = useParams();
  const navigate = useNavigate();

  // Redirect to default subpage if none is specified
  useEffect(() => {
    if (!subpage) {
      navigate("/erp/reports/summary", { replace: true });
    }
  }, [subpage, navigate]);

  const activeTab = subpage || "summary";

  const handleTabChange = (tab) => {
    navigate(`/erp/reports/${tab}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "summary":
        return <SummaryPage />;
      case "financial":
        return <FinancialPage />;
      case "hr":
        return <HrPage />;
      case "inventory":
        return <InventoryPage />;
      default:
        return <SummaryPage />;
    }
  };

  return (
    <div className="flex overflow-hidden bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 text-gray-200 min-h-screen">
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-600 bg-clip-text text-transparent">
                Reports Management
              </h1>
              <p className="text-gray-400 mt-1">
                View and manage summary, financial, HR, and inventory reports efficiently.
              </p>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-700">
              <nav className="flex space-x-8 -mb-px">
                {["summary", "financial", "hr", "inventory"].map((tab) => (
                  <button
                    key={tab}
                    className={`pb-2 text-sm font-medium transition ${
                      activeTab === tab
                        ? "border-b-2 border-emerald-500 text-emerald-400"
                        : "border-b-2 border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500"
                    }`}
                    onClick={() => handleTabChange(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg border border-gray-700">
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

export default ReportsMgt;
