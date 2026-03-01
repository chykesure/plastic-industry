import React from "react";
import { ArrowDownCircle, CalendarClock, CheckCircle2, AlertTriangle } from "lucide-react";

function Receivables() {
  const receivablesData = [
    {
      client: "PrimeTech Ltd",
      amount: "₦1,500,000",
      dueDate: "Oct 22, 2025",
      status: "Pending",
    },
    {
      client: "BlueWave Global",
      amount: "₦950,000",
      dueDate: "Oct 14, 2025",
      status: "Received",
    },
    {
      client: "Sunlite Logistics",
      amount: "₦600,000",
      dueDate: "Oct 09, 2025",
      status: "Overdue",
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "Received":
        return <span className="bg-green-500/20 text-green-400 px-3 py-1 text-xs rounded-full">Received</span>;
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
        <h2 className="text-2xl font-semibold text-blue-400">Accounts Receivables</h2>
        <p className="text-gray-400">
          Manage incoming payments, outstanding invoices, and customer credit.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {[
          { title: "Total Receivables", value: "₦3,050,000", icon: <ArrowDownCircle className="w-5 h-5 text-green-400" /> },
          { title: "Collected This Month", value: "₦1,200,000", icon: <CheckCircle2 className="w-5 h-5 text-blue-400" /> },
          { title: "Overdue", value: "₦600,000", icon: <AlertTriangle className="w-5 h-5 text-red-400" /> },
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

      {/* Receivables Table */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-md overflow-hidden">
        <table className="min-w-full text-sm text-gray-300">
          <thead className="bg-gray-800 text-gray-300 uppercase text-xs">
            <tr>
              <th className="py-3 px-4 text-left">Client</th>
              <th className="py-3 px-4 text-left">Amount</th>
              <th className="py-3 px-4 text-left">Due Date</th>
              <th className="py-3 px-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {receivablesData.map((item, i) => (
              <tr key={i}>
                <td className="py-3 px-4 flex items-center gap-2">
                  <ArrowDownCircle className="w-4 h-4 text-green-400" /> {item.client}
                </td>
                <td className="py-3 px-4 text-green-400">{item.amount}</td>
                <td className="py-3 px-4">{item.dueDate}</td>
                <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-sm text-gray-400 flex items-center gap-2">
        <CalendarClock className="w-4 h-4 text-yellow-400" /> Follow up promptly on pending and overdue invoices.
      </div>
    </div>
  );
}

export default Receivables;
