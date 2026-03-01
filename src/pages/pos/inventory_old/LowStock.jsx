import React from "react";

function LowStock() {
  const lowStockProducts = [
    { id: 1, name: "Milk 1L", stock: 2 },
    { id: 2, name: "Eggs (12pcs)", stock: 3 },
  ];

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="overflow-auto flex-1 rounded-xl bg-gray-800 p-4 border border-gray-700 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-red-400">Low Stock Alerts</h2>
        <table className="w-full table-fixed border-collapse">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-4 py-2 border-b border-gray-700 text-left w-3/4">Product</th>
              <th className="px-4 py-2 border-b border-gray-700 text-center w-1/4">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {lowStockProducts.map(p => (
              <tr key={p.id} className="hover:bg-gray-700">
                <td className="px-4 py-2">{p.name}</td>
                <td className="px-4 py-2 font-bold text-red-400 text-center">{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LowStock;
