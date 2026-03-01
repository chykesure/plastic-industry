import React, { useState } from "react";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import FilterButton from "../../components/DropdownFilter";
import Datepicker from "../../components/Datepicker";
import Banner from "../../partials/Banner";

// Import some chart components from your charts folder (adjust names as needed)
import BarChart01 from "../../charts/BarChart01";
import LineChart01 from "../../charts/LineChart01";
import DoughnutChart from "../../charts/DoughnutChart";

// Icons
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Clock, AlertCircle } from "lucide-react";

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock data - replace with real API data later
  const kpiData = [
    { title: "Total Sales", value: "₦2,845,670", change: "+12.4%", isUp: true, icon: DollarSign, color: "from-emerald-500 to-teal-600" },
    { title: "Orders Today", value: "187", change: "+8.2%", isUp: true, icon: ShoppingCart, color: "from-blue-500 to-indigo-600" },
    { title: "Avg. Order Value", value: "₦15,220", change: "-2.1%", isUp: false, icon: Clock, color: "from-purple-500 to-pink-600" },
    { title: "Low Stock Items", value: "14", change: "+3", isUp: false, icon: AlertCircle, color: "from-rose-500 to-red-600" },
  ];

  const recentTransactions = [
    { id: "INV-23891", date: "Today, 14:32", customer: "Aisha Bello", items: 8, total: "₦78,500", status: "Completed" },
    { id: "INV-23890", date: "Today, 13:15", customer: "Chinedu Okeke", items: 3, total: "₦22,400", status: "Pending" },
    { id: "INV-23889", date: "Today, 11:40", customer: "Fatima Yusuf", items: 12, total: "₦145,000", status: "Completed" },
    { id: "INV-23888", date: "Yesterday, 17:20", customer: "Tunde Adebayo", items: 5, total: "₦56,800", status: "Completed" },
    { id: "INV-23887", date: "Yesterday, 09:55", customer: "Ngozi Eze", items: 1, total: "₦9,200", status: "Returned" },
  ];

  const statusColors = {
    Completed: "bg-emerald-600/80 text-emerald-100",
    Pending: "bg-amber-600/80 text-amber-100",
    Returned: "bg-rose-600/80 text-rose-100",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[1920px] mx-auto">
            {/* Page Header + Controls */}
            <div className="sm:flex sm:justify-between sm:items-center mb-10">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  POS Dashboard
                </h1>
                <p className="text-gray-400 mt-2 text-lg">
                  Real-time overview of your store performance • {new Date().toLocaleDateString("en-NG")}
                </p>
              </div>

              <div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
                <Datepicker align="right" />
                <FilterButton align="right" />
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {kpiData.map((kpi, idx) => (
                <div
                  key={idx}
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${kpi.color} p-6 shadow-xl hover:scale-[1.02] transition-all duration-300 group`}
                >
                  <div className="absolute -right-6 -top-6 opacity-20 text-9xl text-white/20">
                    <kpi.icon />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white/90">{kpi.title}</h3>
                      <div className={`flex items-center text-sm font-medium ${kpi.isUp ? "text-emerald-200" : "text-rose-200"}`}>
                        {kpi.isUp ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                        {kpi.change}
                      </div>
                    </div>
                    <p className="text-4xl font-bold text-white mt-4 tracking-tight">{kpi.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
              {/* Sales by Hour / Day */}
              <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-2xl col-span-1 lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Sales Trend</h3>
                  <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300">
                    <option>This Week</option>
                    <option>This Month</option>
                    <option>Last 30 Days</option>
                  </select>
                </div>
                <div className="h-80">
                  <LineChart01 /> {/* Replace with your actual chart */}
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-6">Top Categories</h3>
                <div className="h-80 flex items-center justify-center">
                  <DoughnutChart /> {/* Your doughnut chart component */}
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
                <button className="text-sm text-blue-400 hover:text-blue-300 transition flex items-center gap-1.5">
                  View All <span aria-hidden="true">→</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-gray-300 text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-left text-gray-400 uppercase tracking-wider text-xs">
                      <th className="pb-4 font-semibold">Invoice</th>
                      <th className="pb-4 font-semibold">Date / Time</th>
                      <th className="pb-4 font-semibold">Customer</th>
                      <th className="pb-4 font-semibold text-center">Items</th>
                      <th className="pb-4 font-semibold text-right">Total</th>
                      <th className="pb-4 font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/70">
                    {recentTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="py-4 font-medium text-white">{tx.id}</td>
                        <td className="py-4 text-gray-400">{tx.date}</td>
                        <td className="py-4">{tx.customer}</td>
                        <td className="py-4 text-center">{tx.items}</td>
                        <td className="py-4 text-right font-medium text-emerald-400">{tx.total}</td>
                        <td className="py-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[tx.status]}`}
                          >
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {recentTransactions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No recent transactions to display.
                </div>
              )}
            </div>
          </div>
        </main>

        <Banner />
      </div>
    </div>
  );
}

export default Dashboard;