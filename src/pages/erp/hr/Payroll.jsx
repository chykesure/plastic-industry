import React, { useState } from "react";
import { DollarSign, FileSpreadsheet } from "lucide-react";

const Button = ({ children, className = "", ...props }) => (
  <button {...props} className={`px-4 py-2 rounded-lg text-white font-medium shadow-sm transition ${className}`}>
    {children}
  </button>
);
const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl shadow-md border border-gray-700 bg-gray-800 ${className}`}>{children}</div>
);
const CardContent = ({ children, className = "" }) => <div className={`p-4 ${className}`}>{children}</div>;

const Payroll = () => {
  const [records] = useState([
    { id: 1, name: "John Doe", month: "October", salary: "₦250,000", status: "Paid" },
    { id: 2, name: "Sarah Johnson", month: "October", salary: "₦220,000", status: "Pending" },
  ]);

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-200">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-semibold text-emerald-400">Payroll Management</h2>
        <Button className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2">
          <DollarSign className="w-4 h-4" /> Process Payroll
        </Button>
      </div>

      <Card>
        <CardContent>
          <table className="min-w-full text-sm text-gray-300">
            <thead className="border-b border-gray-700 text-gray-400 uppercase tracking-wide text-xs">
              <tr>
                <th className="py-3 text-left">Employee</th>
                <th className="py-3 text-left">Month</th>
                <th className="py-3 text-left">Salary</th>
                <th className="py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="py-3">{r.name}</td>
                  <td className="py-3">{r.month}</td>
                  <td className="py-3">{r.salary}</td>
                  <td className="py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        r.status === "Paid"
                          ? "bg-emerald-700 text-emerald-200"
                          : "bg-yellow-700 text-yellow-200"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
export default Payroll;
