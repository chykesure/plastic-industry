import React from "react";
import { CreditCard, Building2, Zap, Users } from "lucide-react";

function Expenses() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-blue-400 mb-2">Expenses</h2>
      <p className="text-gray-400 mb-6">
        Overview of operational, administrative, and capital expenditures.
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {[
          { label: "Total Expenses", value: "₦4,210,000", icon: <CreditCard className="w-5 h-5 text-red-400" /> },
          { label: "Operational", value: "₦2,500,000", icon: <Building2 className="w-5 h-5 text-blue-400" /> },
          { label: "Staff & Admin", value: "₦1,710,000", icon: <Users className="w-5 h-5 text-yellow-400" /> },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-gray-900 p-5 rounded-xl border border-gray-700 shadow-sm hover:border-blue-500/40 transition"
          >
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">{item.label}</span>
              {item.icon}
            </div>
            <p className="text-2xl font-bold text-red-400 mt-2">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Detailed Table */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full text-sm text-gray-300">
          <thead className="bg-gray-800 text-gray-300 uppercase text-xs">
            <tr>
              <th className="py-3 px-4 text-left">Category</th>
              <th className="py-3 px-4 text-left">Amount</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            <tr>
              <td className="py-3 px-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" /> Staff Salaries
              </td>
              <td className="py-3 px-4 text-red-400">₦2,000,000</td>
              <td className="py-3 px-4">Oct 10, 2025</td>
              <td className="py-3 px-4 text-gray-400">Payroll Q4</td>
            </tr>
            <tr>
              <td className="py-3 px-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" /> Office Rent
              </td>
              <td className="py-3 px-4 text-red-400">₦1,200,000</td>
              <td className="py-3 px-4">Oct 01, 2025</td>
              <td className="py-3 px-4 text-gray-400">Lease Payment</td>
            </tr>
            <tr>
              <td className="py-3 px-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" /> Utilities
              </td>
              <td className="py-3 px-4 text-red-400">₦850,000</td>
              <td className="py-3 px-4">Oct 14, 2025</td>
              <td className="py-3 px-4 text-gray-400">Electricity & Internet</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Expenses;
