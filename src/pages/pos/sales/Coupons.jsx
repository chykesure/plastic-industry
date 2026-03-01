import React, { useState, useEffect } from "react";
import axios from "axios";

function Coupons({ productId }) {
  const [transactions, setTransactions] = useState([]);
  const [selectedType, setSelectedType] = useState("all"); // filter by stock-in / sale / all

  // Fetch product transaction history
  const fetchHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/products/${productId}/history`);
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [productId]);

  // Filter transactions by type
  const filteredTransactions = transactions.filter(tx => selectedType === "all" || tx.type === selectedType);

  // Totals
  const totalAdded = filteredTransactions
    .filter(tx => tx.type === "stock-in")
    .reduce((sum, tx) => sum + (tx.quantityAdded || 0), 0);

  const totalSold = filteredTransactions
    .filter(tx => tx.type === "sale")
    .reduce((sum, tx) => sum + (tx.quantitySold || 0), 0);

  return (
    <div className="flex flex-col bg-gray-900 text-gray-200 p-6">
      <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
        Product Transaction History
      </h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Transactions Table */}
        <div className="flex-1 overflow-y-auto bg-gray-800 rounded-lg p-4 shadow-lg">
          {/* Filter */}
          <div className="mb-4">
            <label className="mr-2">Show:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="p-1 rounded bg-gray-700 border border-gray-600"
            >
              <option value="all">All</option>
              <option value="stock-in">Stock In</option>
              <option value="sale">Sale</option>
            </select>
          </div>

          <table className="w-full table-auto border border-gray-700">
            <thead>
              <tr className="bg-gray-700">
                <th className="px-2 py-1 border-b border-gray-600">Type</th>
                <th className="px-2 py-1 border-b border-gray-600">Qty</th>
                <th className="px-2 py-1 border-b border-gray-600">Balance</th>
                <th className="px-2 py-1 border-b border-gray-600">Price</th>
                <th className="px-2 py-1 border-b border-gray-600">Payment Mode</th>
                <th className="px-2 py-1 border-b border-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx, idx) => (
                <tr key={idx} className="hover:bg-gray-700">
                  <td className="px-2 py-1">{tx.type}</td>
                  <td className="px-2 py-1">{tx.quantityAdded || tx.quantitySold}</td>
                  <td className="px-2 py-1">{tx.balanceAfterStock}</td>
                  <td className="px-2 py-1">₦{tx.sellingPrice || 0}</td>
                  <td className="px-2 py-1">{tx.paymentMode || "-"}</td>
                  <td className="px-2 py-1">{new Date(tx.date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-4 p-4 bg-gray-700 rounded space-y-2">
            <div className="flex justify-between font-semibold">
              <span>Total Stock Added:</span>
              <span>{totalAdded}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total Sold:</span>
              <span>{totalSold}</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Optional Actions */}
        <div className="w-full md:w-1/4 flex flex-col gap-4">
          <p className="text-gray-400">
            Use the filter above to view Stock-In or Sale transactions.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Coupons;
