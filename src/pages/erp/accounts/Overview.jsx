import React from "react";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";

function Overview() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-blue-400">Financial Overview</h2>
        <p className="text-gray-400">
          A consolidated snapshot of your organization's financial health and trends.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          {
            title: "Total Revenue",
            value: "₦8,450,000",
            change: "+12.4%",
            icon: <TrendingUp className="text-green-400 w-5 h-5" />,
            color: "green",
          },
          {
            title: "Total Expenses",
            value: "₦4,210,000",
            change: "+5.2%",
            icon: <TrendingDown className="text-red-400 w-5 h-5" />,
            color: "red",
          },
          {
            title: "Net Profit",
            value: "₦4,240,000",
            change: "+8.9%",
            icon: <DollarSign className="text-blue-400 w-5 h-5" />,
            color: "blue",
          },
          {
            title: "Profit Margin",
            value: "52.4%",
            change: "+3.1%",
            icon: <PieChart className="text-yellow-400 w-5 h-5" />,
            color: "yellow",
          },
        ].map((item, index) => (
          <div
            key={index}
            className="bg-gray-900 p-5 rounded-xl border border-gray-700 shadow-md hover:border-blue-500/40 transition"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-gray-400 text-sm">{item.title}</h3>
              {item.icon}
            </div>
            <p className="text-2xl font-bold text-gray-100 mt-2">{item.value}</p>
            <span
              className={`text-sm mt-1 inline-block ${
                item.color === "green"
                  ? "text-green-400"
                  : item.color === "red"
                  ? "text-red-400"
                  : item.color === "blue"
                  ? "text-blue-400"
                  : "text-yellow-400"
              }`}
            >
              {item.change} from last month
            </span>
          </div>
        ))}
      </div>

      {/* Summary Chart Placeholder */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-blue-400 mb-2">Financial Trends</h3>
        <p className="text-gray-400 text-sm mb-4">
          Graphical summary of revenue and expenses over time.
        </p>
        <div className="h-64 flex items-center justify-center text-gray-500 italic border border-gray-700 rounded-lg">
          [Chart Placeholder — integrate Chart.js or Recharts here]
        </div>
      </div>
    </div>
  );
}

export default Overview;
