import React from "react";
import { Wallet, CalendarClock, AlertTriangle, CheckCircle2 } from "lucide-react";

function Payables() {
  const payablesData = [
    {
      vendor: "TechEdge Supplies",
      amount: "₦1,200,000",
      dueDate: "Oct 25, 2025",
      status: "Pending",
    },
    {
      vendor: "OfficePro Nigeria Ltd",
      amount: "₦850,000",
      dueDate: "Oct 15, 2025",
      status: "Paid",
    },
    {
      vendor: "FinServe Consulting",
      amount: "₦400,000",
      dueDate: "Oct 10, 2025",
      status: "Overdue",
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "Paid":
        return <span className="bg-green-500/20 text-green-400 px-3 py-1 text-xs rounded-full">Paid</span>;
      case "Pending":
        return <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 text-xs rounded-full">Pending</span>;
      case "Overdue":
        return <span className="bg-red-500/20 text-red-400 px-3 py-1 text-xs rounded-full">Overdue</span>;
      default:
        return <span className="bg-gray-500/20 text-gray-400 px-3 py-1 text-xs rounded-full">{status}</span>;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-blue-400">Accounts Payables</h2>
        <p className="text-gray-400">
          Track and manage all outstanding payments to vendors and suppliers.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {[
          { title: "Total Payables", value: "₦2,450,000", icon: <Wallet className="w-5 h-5 text-yellow-400" /> },
          { title: "Due This Month", value: "₦1,600,000", icon: <CalendarClock className="w-5 h-5 text-blue-400" /> },
          { title: "Overdue", value: "₦400,000", icon: <AlertTriangle className="w-5 h-5 text-red-400" /> },
        ].map((item, index) => (
          <div
            key={index}
            className="bg-gray-900 border border-gray-700 rounded-xl p-5 hover:border-blue-500/40 transition"
          >
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">{item.title}</span>
              {item.icon}
            </div>
            <p className="text-2xl font-bold text-gray-100 mt-2">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Payables Table */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-md overflow-hidden">
        <table className="min-w-full text-sm text-gray-300">
          <thead className="bg-gray-800 text-gray-300 uppercase text-xs">
            <tr>
              <th className="py-3 px-4 text-left">Vendor</th>
              <th className="py-3 px-4 text-left">Amount</th>
              <th className="py-3 px-4 text-left">Due Date</th>
              <th className="py-3 px-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {payablesData.map((item, i) => (
              <tr key={i}>
                <td className="py-3 px-4 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-blue-400" /> {item.vendor}
                </td>
                <td className="py-3 px-4 text-yellow-400">{item.amount}</td>
                <td className="py-3 px-4">{item.dueDate}</td>
                <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Summary */}
      <div className="mt-6 text-sm text-gray-400 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-green-400" /> Ensure timely payments to avoid late fees.
      </div>
    </div>
  );
}

export default Payables;
