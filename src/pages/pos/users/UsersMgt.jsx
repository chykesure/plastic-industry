import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../../partials/Sidebar";
import Header from "../../../partials/Header";
import Banner from "../../../partials/Banner";

// Import tab pages
import Roles from "./Roles";
import Login from "./Login";
import Password from "./Password";

function UsersMgt() {
  const { subpage } = useParams();
  const navigate = useNavigate();

  // Redirect to /users/roles if no subpage
  useEffect(() => {
    if (!subpage) {
      navigate("/users/roles", { replace: true });
    }
  }, [subpage, navigate]);

  const activeTab = subpage || "roles";

  const handleTabChange = (tab) => {
    navigate(`/users/${tab}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "login":
        return <Login />;
      case "password":
        return <Password />;
      default:
        return <Login />;
    }
  };

  return (
    <div className="flex  overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-200">
      <Sidebar />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-6 w-full ">
            <div className="mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-gray-400 mt-1">
                Manage roles, login access, and password policies.
              </p>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-700">
              <nav className="flex space-x-8 -mb-px">
                {["login", "password"].map((tab) => (
                  <button
                    key={tab}
                    className={`pb-2 text-sm font-medium transition ${
                      activeTab === tab
                        ? "border-b-2 border-blue-500 text-blue-400"
                        : "border-b-2 border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500"
                    }`}
                    onClick={() => handleTabChange(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab content */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg border border-gray-700">
              {renderTabContent()}
            </div>
          </div>
        </main>

        <Banner />
      </div>
    </div>
  );
}

export default UsersMgt;
