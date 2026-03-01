import React, { useState, useEffect } from "react";
import axios from "axios";

// SalesReport — Complete, production-ready React component
// - Dark/navy premium palette (no white/black)
// - Filters: cashier, payment mode, date range
// - Table shows per-invoice Amount column
// - Export CSV (properly quoted) and Copy to Clipboard
// - Loading & empty states, robust formatting

function SalesReport() {
  const [salesData, setSalesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    cashier: "",
    paymentMode: "",
    fromDate: "",
    toDate: "",
  });

  // Utility: format currency (NGN)
  const formatCurrency = (value) => {
    const n = Number(value || 0);
    return n.toLocaleString(undefined, { minimumFractionDigits: 0 });
  };

  // Fetch sales from backend
  useEffect(() => {
    let cancelled = false;

    const fetchSales = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get("http://localhost:8080/api/sales");
        if (cancelled) return;
        const data = Array.isArray(res.data) ? res.data : [];
        setSalesData(data);
        setFilteredData(data);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to fetch sales:", err);
        setError("Unable to load sales. Check server or network.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSales();
    return () => {
      cancelled = true;
    };
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...salesData];

    const cashier = filters.cashier.trim().toLowerCase();
    const paymentMode = filters.paymentMode.trim().toLowerCase();

    if (cashier) {
      filtered = filtered.filter((sale) =>
        (sale.cashier || "").toLowerCase().includes(cashier)
      );
    }

    if (paymentMode) {
      filtered = filtered.filter(
        (sale) => (sale.paymentMode || "").toLowerCase() === paymentMode
      );
    }

    if (filters.fromDate) {
      const from = new Date(filters.fromDate);
      filtered = filtered.filter((sale) => new Date(sale.date) >= from);
    }

    if (filters.toDate) {
      const to = new Date(filters.toDate);
      // include whole day
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter((sale) => new Date(sale.date) <= to);
    }

    setFilteredData(filtered);
  }, [filters, salesData]);

  // Stats
  const totalAmount = filteredData.reduce(
    (sum, sale) => sum + (Number(sale.total) || 0),
    0
  );
  const totalTransactions = filteredData.length;

  // Export CSV (quoted values to handle commas)
  const exportCSV = () => {
    const cols = ["S/N", "Cashier", "Invoice Number", "Date", "Payment Mode", "Amount"];

    const quote = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

    const rows = filteredData.map((s, i) => {
      const row = [
        i + 1,
        s.cashier ?? "",
        s.invoiceNumber ?? "",
        new Date(s.date).toLocaleDateString(),
        s.paymentMode ?? "",
        (Number(s.total) || 0).toFixed(0),
      ];
      return row.map(quote).join(",");
    });

    const csv = [cols.map(quote).join(","), ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales_report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Copy CSV to clipboard (useful for quick paste)
  const copyCSVToClipboard = async () => {
    try {
      const cols = ["S/N", "Cashier", "Invoice Number", "Date", "Payment Mode", "Amount"];
      const rows = filteredData.map((s, i) => [
        i + 1,
        s.cashier ?? "",
        s.invoiceNumber ?? "",
        new Date(s.date).toLocaleDateString(),
        s.paymentMode ?? "",
        (Number(s.total) || 0).toFixed(0),
      ].join("\t"));

      const tsv = [cols.join("\t"), ...rows].join("\n");
      await navigator.clipboard.writeText(tsv);
      alert("Report copied to clipboard (TSV) — paste in Excel/Sheets.");
    } catch (err) {
      console.error(err);
      alert("Unable to copy to clipboard.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center bg-gradient-to-br from-[#0b1d33] to-[#0f2747] text-gray-200">
        <div className="text-gray-300">Loading sales report…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6 bg-gradient-to-br from-[#0b1d33] to-[#0f2747] text-gray-200">
      {/* Top */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#8fc3ff]">Sales Report</h1>
          <p className="text-sm text-gray-300">Overview of transactions filtered live.</p>
        </div>

        <div className="flex gap-3 items-center">
          <div className="px-4 py-3 rounded-lg bg-[#11263f] border border-[#1c3555]">
            <div className="text-xs text-gray-300">Total Amount</div>
            <div className="font-semibold text-[#cfe6ff]">₦{formatCurrency(totalAmount)}</div>
          </div>

          <div className="px-4 py-3 rounded-lg bg-[#11263f] border border-[#1c3555]">
            <div className="text-xs text-gray-300">Transactions</div>
            <div className="font-semibold text-[#cfe6ff]">{totalTransactions}</div>
          </div>

          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded-lg bg-[#1b4f7a] hover:bg-[#24639e] transition font-medium"
          >
            Export CSV
          </button>

          <button
            onClick={copyCSVToClipboard}
            className="px-3 py-2 rounded-lg bg-[#163a5b] hover:bg-[#1b5a80] transition text-sm"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-[#11263f] p-4 rounded-xl border border-[#1c3555]">
        <div>
          <label className="text-sm text-gray-300">Cashier</label>
          <input
            className="mt-1 w-full px-3 py-2 rounded bg-[#0b1d33] border border-[#1c3555]"
            placeholder="Search cashier"
            value={filters.cashier}
            onChange={(e) => setFilters({ ...filters, cashier: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm text-gray-300">Payment Mode</label>
          <select
            className="mt-1 w-full px-3 py-2 rounded bg-[#0b1d33] border border-[#1c3555]"
            value={filters.paymentMode}
            onChange={(e) => setFilters({ ...filters, paymentMode: e.target.value })}
          >
            <option value="">All</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-300">From</label>
          <input
            type="date"
            className="mt-1 w-full px-3 py-2 rounded bg-[#0b1d33] border border-[#1c3555]"
            value={filters.fromDate}
            onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm text-gray-300">To</label>
          <input
            type="date"
            className="mt-1 w-full px-3 py-2 rounded bg-[#0b1d33] border border-[#1c3555]"
            value={filters.toDate}
            onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="text-red-300 bg-[#3b1a1a] p-3 rounded">{error}</div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-[#11263f] rounded-xl border border-[#1c3555] shadow">
        <table className="w-full min-w-[800px]">
          <thead className="bg-[#163457] text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">S/N</th>
              <th className="px-4 py-3 text-left">Cashier</th>
              <th className="px-4 py-3 text-left">Invoice #</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Payment</th>
              <th className="px-4 py-3 text-right">Amount</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  No sales records found for the selected filters.
                </td>
              </tr>
            ) : (
              filteredData.map((sale, idx) => (
                <tr key={sale._id || idx} className="border-b border-[#1c3555] hover:bg-[#1a3352] transition">
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-200">{sale.cashier ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-300">{sale.invoiceNumber ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-300">{sale.date ? new Date(sale.date).toLocaleDateString() : "-"}</td>
                  <td className="px-4 py-3 text-gray-300">{sale.paymentMode ?? "-"}</td>
                  <td className="px-4 py-3 text-right text-[#cfe6ff] font-semibold">₦{formatCurrency(sale.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SalesReport;
