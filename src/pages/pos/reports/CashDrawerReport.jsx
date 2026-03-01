// src/pages/pos/reports/ReturnItemsHistory.jsx
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

function ReturnItemsHistory() {
  const [returnData, setReturnData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // -----------------------------
  // Fetch return history
  // -----------------------------
  useEffect(() => {
    const fetchReturns = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/returns"); // full backend URL
        setReturnData(res.data.data || []);
      } catch (err) {
        setError("Failed to load return items history");
      } finally {
        setLoading(false);
      }
    };

    fetchReturns();
  }, []);

  // -----------------------------
  // Date filtered data
  // -----------------------------
  const filteredData = returnData.filter((row) => {
    if (!startDate && !endDate) return true;
    const rowDate = new Date(row.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (start && end) return rowDate >= start && rowDate <= end;
    if (start) return rowDate >= start;
    if (end) return rowDate <= end;
    return true;
  });

  // -----------------------------
  // Calculations
  // -----------------------------
  const totals = filteredData.reduce(
    (acc, row) => {
      acc.totalRefunds += row.totalRefund || 0;
      acc.itemCount += row.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      return acc;
    },
    { totalRefunds: 0, itemCount: 0 }
  );

  const averageRefund =
    filteredData.length > 0
      ? Math.round(totals.totalRefunds / filteredData.length)
      : 0;

  // -----------------------------
  // Helpers
  // -----------------------------
  const formatDate = (isoString) =>
    new Date(isoString).toLocaleString("en-NG", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  // -----------------------------
  // Export Excel
  // -----------------------------
  const exportToExcel = () => {
    const data = filteredData.map((row) => ({
      "Date & Time": formatDate(row.date),
      "Invoice No": row.invoiceNumber,
      "Product(s)": row.items
        .map((i) => `${i.productName}${i.type ? ` (${i.type})` : ""}`)
        .join("; "),
      Quantity: row.items.reduce((sum, i) => sum + i.quantity, 0),
      "Refund Amount (₦)": row.totalRefund,
      "Refund Method": row.refundMethod,
      "Processed By": row.processedBy,
      Reason: row.reason || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Return History");
    XLSX.writeFile(workbook, "return_items_history.xlsx");
  };

  // -----------------------------
  // Export PDF
  // -----------------------------
  const exportToPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    doc.text("Return Items History Report", 14, 15);

    doc.autoTable({
      startY: 25,
      head: [
        [
          "Date & Time",
          "Invoice",
          "Product(s)",
          "Qty",
          "Refund (₦)",
          "Method",
          "Processed By",
          "Reason",
        ],
      ],
      body: filteredData.map((row) => [
        formatDate(row.date),
        row.invoiceNumber,
        row.items
          .map((i) => `${i.productName}${i.type ? ` (${i.type})` : ""}`)
          .join("\n"),
        row.items.reduce((sum, i) => sum + i.quantity, 0),
        row.totalRefund.toLocaleString(),
        row.refundMethod,
        row.processedBy,
        row.reason || "-",
      ]),
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [59, 130, 246] },
      columnStyles: { 2: { cellWidth: 60 } },
    });

    doc.save("return_items_history.pdf");
  };

  // -----------------------------
  // UI STATES
  // -----------------------------
  if (loading) return <div className="py-12 text-center text-gray-400">Loading return history...</div>;
  if (error) return <div className="py-12 text-center text-red-500">{error}</div>;
  if (returnData.length === 0) return <div className="py-12 text-center text-gray-500">No return records found</div>;

  // -----------------------------
  // MAIN RENDER
  // -----------------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-blue-500">📦 Return Items History</h2>
          <p className="text-gray-400 text-sm mt-1">
            Complete record of all returned items and refunds
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={exportToExcel}
            className="px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium shadow"
          >
            Export Excel
          </button>
          <button
            onClick={exportToPDF}
            className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex gap-3 items-end mb-4">
        <div>
          <label className="block text-sm text-gray-400">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 p-2 rounded border border-gray-600 bg-gray-800 text-gray-200"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 p-2 rounded border border-gray-600 bg-gray-800 text-gray-200"
          />
        </div>

        <button
          onClick={() => { setStartDate(""); setEndDate(""); }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Reset
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700">
          <p className="text-gray-400 text-sm">Total Return Transactions</p>
          <p className="text-2xl font-bold text-gray-100 mt-2">{filteredData.length}</p>
        </div>

        <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700">
          <p className="text-gray-400 text-sm">Total Items Returned</p>
          <p className="text-2xl font-bold text-orange-400 mt-2">{totals.itemCount}</p>
        </div>

        <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700">
          <p className="text-gray-400 text-sm">Total Refund Amount</p>
          <p className="text-2xl font-bold text-red-400 mt-2">
            ₦{totals.totalRefunds.toLocaleString()}
          </p>
        </div>

        <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700">
          <p className="text-gray-400 text-sm">Average Refund</p>
          <p className="text-2xl font-bold text-gray-200 mt-2">
            ₦{averageRefund.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-gray-800 text-gray-300 text-sm uppercase">
                <th className="px-6 py-4 text-left">Date & Time</th>
                <th className="px-6 py-4 text-left">Invoice</th>
                <th className="px-6 py-4 text-left">Products</th>
                <th className="px-6 py-4 text-right">Qty</th>
                <th className="px-6 py-4 text-right">Refund (₦)</th>
                <th className="px-6 py-4 text-left">Method</th>
                <th className="px-6 py-4 text-left">Processed By</th>
                <th className="px-6 py-4 text-left">Reason</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-700">
              {filteredData.map((row) => (
                <tr key={row._id} className="hover:bg-gray-800/50">
                  <td className="px-6 py-4 text-gray-200">{formatDate(row.date)}</td>
                  <td className="px-6 py-4 text-gray-300">#{row.invoiceNumber}</td>
                  <td className="px-6 py-4 text-gray-200 max-w-xs">
                    {row.items.map((item, i) => (
                      <div key={i}>
                        {item.productName}
                        {item.type && <span className="text-xs text-gray-500 ml-2">({item.type})</span>}
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-300">
                    {row.items.reduce((sum, i) => sum + i.quantity, 0)}
                  </td>
                  <td className="px-6 py-4 text-right text-red-400 font-semibold">
                    ₦{row.totalRefund.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-300">{row.refundMethod}</td>
                  <td className="px-6 py-4 text-gray-300">{row.processedBy}</td>
                  <td className="px-6 py-4 text-gray-400 italic">{row.reason || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReturnItemsHistory;
