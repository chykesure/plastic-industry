import React, { useState } from "react";
import { Download, Package } from "lucide-react";

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
// Inventory Report Page
// -----------------------------
const InventoryPage = () => {
  const [stockData] = useState([
    { id: 1, item: "Laptop Dell XPS", quantity: 15, status: "In Stock" },
    { id: 2, item: "Office Chair", quantity: 5, status: "Low Stock" },
    { id: 3, item: "Projector", quantity: 2, status: "Critical" },
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-emerald-400">Inventory Report</h2>
        <Button className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Inventory
        </Button>
      </div>

      <Card>
        <CardContent>
          <h3 className="text-lg font-semibold text-emerald-400 mb-4">Stock Levels</h3>
          <table className="min-w-full text-gray-300 border border-gray-700">
            <thead className="bg-gray-800 text-gray-400 uppercase text-xs border-b border-gray-700">
              <tr>
                <th className="py-3 px-4 text-left">Item</th>
                <th className="py-3 px-4 text-left">Quantity</th>
                <th className="py-3 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {stockData.map((stock) => (
                <tr key={stock.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4">{stock.item}</td>
                  <td className="py-3 px-4">{stock.quantity}</td>
                  <td className={`py-3 px-4 ${stock.status === "Critical" ? "text-red-500" : stock.status === "Low Stock" ? "text-yellow-400" : "text-emerald-400"}`}>
                    {stock.status}
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

export default InventoryPage;
