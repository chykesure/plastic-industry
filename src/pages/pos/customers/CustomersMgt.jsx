import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../../partials/Sidebar";
import Header from "../../../partials/Header";
import Banner from "../../../partials/Banner";

// Import customer sub-pages
import AddCustomer from "./AddView";
import History from "./History";
import Loyalty from "./Loyalty";

function CustomersMgt() {
  const { subpage } = useParams();
  const navigate = useNavigate();

  // Redirect to /customers/add if no subpage
  useEffect(() => {
    if (!subpage) {
      navigate("/customers/add", { replace: true });
    }
  }, [subpage, navigate]);

  const activeTab = subpage || "add";

  const handleTabChange = (tab) => {
    navigate(`/customers/${tab}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "add":
        return <AddCustomer />;
      case "history":
        return <History />;
      case "loyalty":
        return <Loyalty />;
      default:
        return <AddCustomer />; // fallback
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                Customers Management
              </h1>
              <p className="text-gray-400 mt-1">
                Manage customer records, loyalty programs, and more.
              </p>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-700">
              <nav className="flex space-x-8 -mb-px">
                {["add", "history", "loyalty"].map((tab) => (
                  <button
                    key={tab}
                    className={`pb-2 text-sm font-medium transition ${
                      activeTab === tab
                        ? "border-b-2 border-green-500 text-green-400"
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

export default CustomersMgt;
