import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../../partials/ErpSidebar";
import Header from "../../../partials/Header";
import Banner from "../../../partials/Banner";

// -----------------------------
// Import Settings sub-pages
// -----------------------------
import RolesPage from "./RolesPage";
import CompanyPage from "./CompanyPage";

function SettingsMgt() {
  const { subpage } = useParams();
  const navigate = useNavigate();

  // Redirect to default subpage if none is specified
  useEffect(() => {
    if (!subpage) {
      navigate("/erp/settings/roles", { replace: true });
    }
  }, [subpage, navigate]);

  const activeTab = subpage || "roles";

  const handleTabChange = (tab) => {
    navigate(`/erp/settings/${tab}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "roles":
        return <RolesPage />;
      case "company":
        return <CompanyPage />;
      default:
        return <RolesPage />;
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
                Settings
              </h1>
              <p className="text-gray-400 mt-1">
                Manage roles, permissions, company information, and logout settings.
              </p>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-700">
              <nav className="flex space-x-8 -mb-px">
                {["roles", "company"].map((tab) => (
                  <button
                    key={tab}
                    className={`pb-2 text-sm font-medium transition ${
                      activeTab === tab
                        ? "border-b-2 border-emerald-500 text-emerald-400"
                        : "border-b-2 border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500"
                    }`}
                    onClick={() => handleTabChange(tab)}
                  >
                    {tab === "roles" ? "Roles & Permissions" : "Company Info"}
                  </button>
                ))}
                {/* Logout button outside content tab */}
                <button
                  onClick={() => navigate("/erp-login")}
                  className="pb-2 text-sm font-medium text-red-500 hover:text-red-400"
                >
                  Logout
                </button>
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

export default SettingsMgt;
