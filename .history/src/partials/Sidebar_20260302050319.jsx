import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  Database,
  Layers,
  ShoppingCart,
  Truck,
  CornerUpLeft,
  BarChart,
  Settings,
  LogIn,
  Key,
  UserCheck,
  PlusSquare,
  Edit,
  Tag,
  Percent,
  Box,
  AlertCircle,
  FileText,
  CreditCard,
  Printer,
  Star,
  History,
  Package,
  ArrowUpDown,
} from "lucide-react";
import SidebarLinkGroup from "./SidebarLinkGroup";
import Swal from "sweetalert2";

function Sidebar({ sidebarOpen, setSidebarOpen, variant = "default" }) {
  // Get role from localStorage
  const userRole = localStorage.getItem("role");

  // Hide entire sidebar for cashiers
  if (userRole === "cashier") return null;

  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();

  const trigger = useRef(null);
  const sidebar = useRef(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
  );

  // Close sidebar on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // Close on ESC
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  // Expand/collapse state persistence
  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded);
    document.body.classList.toggle("sidebar-expanded", sidebarExpanded);
  }, [sidebarExpanded]);

  const salesTabs = [
    "/sales/scan-items",
    "/sales/adjust-qty",
    "/sales/coupons",
    "/sales/Returns",
    "/sales/receipt",
  ];

  const modules = [
    {
      title: "Users Management",
      key: "users",
      icon: <Users className="w-5 h-5" />,
      defaultPath: "/users/roles",
      flows: [
        { title: "Login", icon: <LogIn className="w-4 h-4" />, path: "/users/login" },
        { title: "Password", icon: <Key className="w-4 h-4" />, path: "/users/password" },
      ],
    },
    {
      title: "Products",
      key: "products",
      icon: <Database className="w-5 h-5" />,
      defaultPath: "/products/add",
      flows: [
        { title: "Add", icon: <PlusSquare className="w-4 h-4" />, path: "/products/add" },
        { title: "Edit", icon: <Edit className="w-4 h-4" />, path: "/products/edit" },
        { title: "Categories", icon: <Tag className="w-4 h-4" />, path: "/products/categories" },
        { title: "Expiry", icon: <Percent className="w-4 h-4" />, path: "/products/expiry" },
        { title: "Ledger", icon: <Percent className="w-4 h-4" />, path: "/products/ledger" },
      ],
    },
    {
      title: "Procurement",
      key: "purchase",
      icon: <ShoppingCart className="w-5 h-5" />,
      defaultPath: "/purchase/orders",
      flows: [
        { title: "Suppliers", icon: <Truck className="w-4 h-4" />, path: "/purchase/suppliers" },
        { title: "Ledger", icon: <FileText className="w-4 h-4" />, path: "/purchase/ledger" },
      ],
    },
    {
      title: "Inventory",
      key: "inventory",
      icon: <Package className="w-5 h-5" />,
      defaultPath: "/inventory/stock",
      flows: [
        { title: "Stock In/Out", icon: <Layers className="w-4 h-4" />, path: "/inventory/stock" },
        { title: "Movements", icon: <ArrowUpDown className="w-4 h-4" />, path: "/inventory/movements" },
        { title: "Stock List", icon: <FileText className="w-4 h-4" />, path: "/inventory/list" },
        { title: "Stock Balance", icon: <CreditCard className="w-4 h-4" />, path: "/inventory/stockbalance" },
      ],
    },
    {
      title: "Sales",
      key: "sales",
      icon: <ShoppingCart className="w-5 h-5" />,
      defaultPath: "/sales/scan-items",
      flows: [
        { title: "Scan Items", icon: <Box className="w-4 h-4" />, path: "/sales/scan-items" },
        { title: "Receipt", icon: <Printer className="w-4 h-4" />, path: "/sales/receipt" },
        { title: "Returns", icon: <CornerUpLeft className="w-4 h-4" />, path: "/sales/returns" },
      ],
    },

    // ────────────────────────────────────────────────
    // NEW: Customers module (your requested addition)
    // ────────────────────────────────────────────────
    {
      title: "Customers",
      key: "customers",
      icon: <Users className="w-5 h-5" />,   // or <WalletCards /> if you imported it
      defaultPath: "/customers/add",
      flows: [
        { title: "Add / View", icon: <PlusSquare className="w-4 h-4" />, path: "/customers/add" },
        { title: "History / Ledger", icon: <History className="w-4 h-4" />, path: "/customers/history" },
        { title: "Loyalty", icon: <Star className="w-4 h-4" />, path: "/customers/loyalty" },
        // You can add more later, e.g.
        // { title: "Credit Sales", icon: <CreditCard className="w-4 h-4" />, path: "/customers/credits" },
      ],
    },

    {
      title: "Reports",
      key: "reports",
      icon: <BarChart className="w-5 h-5" />,
      defaultPath: "/reports/sales",
      flows: [
        { title: "Sales", icon: <BarChart className="w-4 h-4" />, path: "/reports/sales" },
        { title: "Top Products", icon: <BarChart className="w-4 h-4" />, path: "/reports/top-products" },
        ...(userRole === "Super-Admin"
          ? [{ title: "Revenue", icon: <BarChart className="w-4 h-4" />, path: "/reports/revenue" }]
          : []),
        { title: "Returns History", icon: <CreditCard className="w-4 h-4" />, path: "/reports/cash-drawer" },
      ],
    },
  ];

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("authToken");
        Swal.fire("Logged out!", "You have been successfully logged out.", "success");
        navigate("/");
      }
    });
  };

  return (
    <div className="min-w-fit">
      {/* Sidebar backdrop */}
      <div
        className={`fixed inset-0 bg-gray-900/30 z-40 lg:hidden transition-opacity duration-200 ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <div
        id="sidebar"
        ref={sidebar}
        className={`flex flex-col absolute z-40 left-0 top-0
          lg:static lg:translate-x-0
          h-screen overflow-y-auto no-scrollbar
          w-64 lg:w-20 lg:sidebar-expanded:!w-64 2xl:w-64 shrink-0
          bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900
          text-gray-200 border-r border-gray-700
          transition-all duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-64"}
          ${variant === "v2" ? "border-r border-gray-700" : "shadow-lg"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-2 sticky top-0 bg-gray-900/90 backdrop-blur-sm z-10 py-3 rounded-md">
          <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent lg:hidden lg:sidebar-expanded:block 2xl:block">
            POS
          </span>
          <button
            ref={trigger}
            className="lg:hidden text-gray-400 hover:text-gray-200"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modules */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase text-gray-400 font-semibold pl-3">
            Modules
          </h3>
          <ul className="mt-2">
            {modules.map((module) => {
              const parentActive =
                module.key !== "sales"
                  ? module.flows.some(flow => pathname === flow.path || pathname.startsWith(flow.path))
                  : salesTabs.some(tabPath => pathname.startsWith(tabPath));

              return (
                <SidebarLinkGroup
                  key={module.key}
                  activecondition={parentActive}
                  initialOpen={parentActive}
                >
                  {(handleClick, open) => (
                    <>
                      {/* Parent Link */}
                      <a
                        href="#0"
                        className={`flex items-center justify-between px-3 py-2 rounded-md border-l-4 transition ${parentActive
                          ? "bg-blue-600/20 text-blue-300 font-semibold border-blue-500"
                          : "text-gray-400 hover:text-white hover:bg-gray-800/70 border-transparent"
                          }`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleClick();
                          setSidebarExpanded(true);
                          navigate(module.defaultPath);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-gray-400">{module.icon}</div>
                          <span className="text-sm font-medium lg:hidden lg:sidebar-expanded:inline 2xl:inline">
                            {module.title}
                          </span>
                        </div>
                        <svg
                          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
                          fill="currentColor"
                          viewBox="0 0 12 12"
                        >
                          <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                        </svg>
                      </a>

                      {/* Sub-links */}
                      <div className="lg:hidden lg:sidebar-expanded:block 2xl:block">
                        <ul className={`pl-8 mt-1 space-y-1 ${!open && "hidden"}`}>
                          {module.flows.map((flow, i) => (
                            <li key={i}>
                              <NavLink
                                end
                                to={flow.path}
                                className={({ isActive }) =>
                                  `flex items-center gap-2 px-2 py-1 rounded-md text-sm border-l-4 transition ${isActive
                                    ? "text-blue-300 bg-blue-600/20 border-blue-500 font-medium"
                                    : "text-gray-500 hover:text-white hover:bg-gray-800/70 border-transparent"
                                  }`
                                }
                              >
                                {flow.icon}
                                <span>{flow.title}</span>
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </SidebarLinkGroup>
              );
            })}
            {/* Logout Button */}
            <div className="mt-6 px-3">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/70 rounded-md text-sm"
              >
                <LogIn className="w-5 h-5 rotate-180" />
                <span className="lg:hidden lg:sidebar-expanded:inline 2xl:inline">Logout</span>
              </button>
            </div>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
