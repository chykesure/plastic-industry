import React from "react";
import { BarChart3, LineChart, DollarSign, ArrowUpRight } from "lucide-react";

function Revenue() {
  return (
    <div
      className="space-y-8 overflow-y-scroll pr-2"
      style={{
        scrollbarWidth: "none",        // Firefox
        msOverflowStyle: "none",       // IE & Edge
      }}
    >
      <style>
        {`
          /* Chrome, Safari, Opera */
          div::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-emerald-400">Revenue Analysis</h2>
        <p className="text-gray-400">
          Explore income streams, performance insights, and growth metrics over time.
        </p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            title: "Total Revenue (YTD)",
            value: "₦12,640,000",
            change: "+15.2%",
            icon: <DollarSign className="text-emerald-400 w-5 h-5" />,
            color: "emerald",
          },
          {
            title: "Monthly Average",
            value: "₦1,053,000",
            change: "+6.8%",
            icon: <BarChart3 className="text-blue-400 w-5 h-5" />,
            color: "blue",
          },
          {
            title: "Top Performing Month",
            value: "₦1,420,000",
            change: "July 2025",
            icon: <ArrowUpRight className="text-indigo-400 w-5 h-5" />,
            color: "indigo",
          },
          {
            title: "Growth Rate",
            value: "12.5%",
            change: "vs last year",
            icon: <LineChart className="text-teal-400 w-5 h-5" />,
            color: "teal",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-gray-900 p-5 rounded-xl border border-gray-700 shadow-md hover:border-emerald-500/40 transition"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-gray-400 text-sm">{item.title}</h3>
              {item.icon}
            </div>
            <p className="text-2xl font-bold text-gray-100 mt-2">{item.value}</p>
            <span
              className={`text-sm mt-1 inline-block ${
                item.color === "emerald"
                  ? "text-emerald-400"
                  : item.color === "blue"
                  ? "text-blue-400"
                  : item.color === "indigo"
                  ? "text-indigo-400"
                  : "text-teal-400"
              }`}
            >
              {item.change}
            </span>
          </div>
        ))}
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-emerald-400 mb-3">
          Revenue Breakdown by Source
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          Distribution of total revenue across primary business units.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-gray-300 border border-gray-700 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-800 text-gray-400 text-sm uppercase tracking-wider">
                <th className="py-3 px-4 text-left">Source</th>
                <th className="py-3 px-4 text-right">Amount (₦)</th>
                <th className="py-3 px-4 text-right">Share (%)</th>
                <th className="py-3 px-4 text-right">Trend</th>
              </tr>
            </thead>
            <tbody>
              {[
                { source: "Product Sales", amount: 5600000, share: 44.3, trend: "+10.2%" },
                { source: "Consulting Services", amount: 3200000, share: 25.1, trend: "+7.8%" },
                { source: "Subscription Plans", amount: 2800000, share: 22.1, trend: "+14.3%" },
                { source: "Affiliate Revenue", amount: 1080000, share: 8.5, trend: "+3.4%" },
              ].map((row, i) => (
                <tr
                  key={i}
                  className="border-t border-gray-700 hover:bg-gray-800/50 transition"
                >
                  <td className="py-3 px-4">{row.source}</td>
                  <td className="py-3 px-4 text-right">
                    {row.amount.toLocaleString("en-NG")}
                  </td>
                  <td className="py-3 px-4 text-right">{row.share}%</td>
                  <td className="py-3 px-4 text-right text-emerald-400">{row.trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-emerald-400 mb-2">
          Revenue Trends (12-Month Overview)
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          Visualize the company’s revenue trajectory month over month.
        </p>
        <div className="h-72 flex items-center justify-center text-gray-500 italic border border-gray-700 rounded-lg">
          [Chart Placeholder — integrate Recharts or Chart.js here]
        </div>
      </div>
    </div>
  );
}

export default Revenue;
