import React, { useState } from "react";
import { Download, TrendingUp, TrendingDown } from "lucide-react";

// -----------------------------
// Inline UI Components
// -----------------------------
const Button = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`px-4 py-2 rounded-lg text-white font-medium shadow-sm transition ${className}`}
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl shadow-md border border-gray-700 bg-gray-800 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => <div className={`p-4 ${className}`}>{children}</div>;

// -----------------------------
// Financial Report Page
// -----------------------------
const FinancialPage = () => {
  const [financialData] = useState([
    { id: 1, type: "Revenue", amount: "₦5,000,000" },
    { id: 2, type: "Expenses", amount: "₦2,200,000" },
    { id: 3, type: "Profit", amount: "₦2,800,000" },
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-emerald-400">Financial Report</h2>
        <Button className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Financial
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        {financialData.map((item) => (
          <Card key={item.id} className="text-center p-6">
            <h3 className="text-gray-400 uppercase text-sm">{item.type}</h3>
            <p className="text-2xl font-bold text-emerald-400 mt-2">{item.amount}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent>
          <h3 className="text-lg font-semibold text-emerald-400 mb-4">Transactions</h3>
          <table className="min-w-full text-gray-300 border border-gray-700">
            <thead className="bg-gray-800 text-gray-400 uppercase text-xs border-b border-gray-700">
              <tr>
                <th className="py-3 px-4 text-left">Type</th>
                <th className="py-3 px-4 text-left">Amount</th>
                <th className="py-3 px-4 text-left">Trend</th>
              </tr>
            </thead>
            <tbody>
              {financialData.map((item) => (
                <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4">{item.type}</td>
                  <td className="py-3 px-4">{item.amount}</td>
                  <td className="py-3 px-4">
                    {item.type === "Revenue" ? (
                      <TrendingUp className="w-4 h-4 text-emerald-400 inline-block" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 inline-block" />
                    )}
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

export default FinancialPage;
