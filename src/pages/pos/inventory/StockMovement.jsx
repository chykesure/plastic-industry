import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Search,
  Calendar,
  Download,
  Printer,
  ChevronDown,
  Loader2,
  ArrowDown,
  Package,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function StockMovement() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [stockData, setStockData] = useState(null);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Movement form state
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  // Fixed movement type – only OUT is allowed here
  const movementType = "out";

  // Fetch products from the SAME endpoint as Sales (uses Stock.stockBalance)
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await axios.get("http://localhost:8080/api/products-with-stock");
      setProducts([...(res.data || [])]);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      toast.error("Failed to load raw materials");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch movements when product selected
  useEffect(() => {
    if (!selectedProductId) {
      setStockData(null);
      return;
    }

    const fetchMovements = async () => {
      setLoadingDetails(true);
      try {
        const res = await axios.get(
          `http://localhost:8080/api/stocks/${selectedProductId}/movements`
        );
        setStockData(res.data);
      } catch (err) {
        console.error("Failed to fetch movements:", err);
        toast.error(err.response?.data?.message || "Failed to load stock history");
        setStockData(null);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchMovements();
  }, [selectedProductId]);

  // Filter products in dropdown
  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  // Filter movements by date & search
  const filteredMovements = useMemo(() => {
    if (!stockData?.history) return [];

    let movs = [...stockData.history];

    if (dateFrom)
      movs = movs.filter((m) => new Date(m.createdAt) >= new Date(dateFrom));
    if (dateTo)
      movs = movs.filter((m) => new Date(m.createdAt) <= new Date(dateTo));

    if (search.trim()) {
      const term = search.toLowerCase();
      movs = movs.filter(
        (m) =>
          m.reason?.toLowerCase().includes(term) ||
          m.createdAt?.includes(term)
      );
    }

    return movs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [stockData?.history, search, dateFrom, dateTo]);

  // Record movement (only OUT)
  const handleRecordMovement = async (e) => {
    e.preventDefault();

    if (!selectedProductId) return toast.error("Select a material first");
    if (!quantity || Number(quantity) <= 0)
      return toast.error("Enter valid quantity");
    if (!reason.trim()) return toast.error("Provide a reason");

    const payload = {
      type: "out",
      quantity: Number(quantity),
      reason: reason.trim(),
    };

    try {
      await axios.post(
        `http://localhost:8080/api/stocks/${selectedProductId}/movements`,
        payload
      );

      // Refresh both from correct endpoints
      const [productsRes, movementsRes] = await Promise.all([
        axios.get("http://localhost:8080/api/products-with-stock"),
        axios.get(`http://localhost:8080/api/stocks/${selectedProductId}/movements`),
      ]);

      setProducts([...(productsRes.data || [])]);

      setStockData(movementsRes.data);

      // Reset & re-select current product to force dropdown refresh
      const currentId = selectedProductId;
      setSelectedProductId("");
      setTimeout(() => setSelectedProductId(currentId), 300);

      setQuantity("");
      setReason("");
      toast.success("Stock Out recorded successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record stock out");
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const formatNumber = (num) => num?.toLocaleString() || "0";

  const resetFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="p-4 md:p-6 space-y-6 text-gray-200">
      <ToastContainer />

      {/* Header + Summary */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-red-400">
            Stock Out / Issue
          </h2>
          <p className="text-gray-400 mt-1">
            Record consumption, usage in production, damage, or other outflows
          </p>
        </div>

        {selectedProductId && stockData && (
          <div className="bg-gray-800/80 px-6 py-4 rounded-xl border border-gray-700 shadow-md min-w-[220px]">
            <div className="text-sm text-gray-400 mb-1">Current Stock</div>
            <div className="text-3xl font-bold text-white">
              {formatNumber(stockData.currentStock)}
            </div>
            <div className="text-xs text-gray-500 mt-2 flex justify-between gap-4">
              <span>In: {formatNumber(stockData.totalIn)}</span>
              <span>Out: {formatNumber(stockData.totalOut)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-gray-800/60 p-5 rounded-xl border border-gray-700">
        <div className="lg:col-span-2">
          <label className="block text-sm text-gray-400 mb-1.5">
            Raw Material
          </label>
          <div className="relative">
            {loadingProducts ? (
              <div className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-red-500" />
              </div>
            ) : (
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-red-500 outline-none appearance-none pr-10"
              >
                <option value="">Select material to record outflow</option>
                {filteredProducts.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} (Stock: {formatNumber(p.stock || 0)})
                  </option>
                ))}
              </select>
            )}
            <ChevronDown
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-red-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-red-500"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={resetFilters}
            className="w-full px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Search + Export */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reason or date..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-red-500"
          />
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600/80 hover:bg-blue-700 rounded-lg text-sm flex items-center gap-2">
            <Download size={16} /> Export
          </button>
          <button className="px-4 py-2 bg-green-600/80 hover:bg-green-700 rounded-lg text-sm flex items-center gap-2">
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      {/* Record Stock Out Form */}
      {selectedProductId && (
        <div className="bg-gray-800/90 rounded-xl border border-gray-700 p-5 shadow-xl">
          <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
            <ArrowDown size={20} /> Record Stock Out
          </h3>

          <div className="mb-4 p-3 bg-red-950/30 border border-red-800/40 rounded-lg text-sm text-red-300">
            This page is for recording outflows only (usage, production, damage, etc.).
            <br />
            Stock In must be done through the Purchase / Receiving module.
          </div>

          <form onSubmit={handleRecordMovement} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Quantity to remove
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity to issue / consume"
                min="1"
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-red-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Reason for outflow
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Used in production, Damaged during handling, Issued to department, Quality control rejection"
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-red-500 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-red-700 hover:bg-red-600 text-white rounded-lg font-medium transition flex items-center justify-center gap-2 shadow-md"
            >
              <Package size={18} /> Record Stock Out
            </button>
          </form>
        </div>
      )}

      {/* History Table */}
      {selectedProductId && loadingDetails ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-red-500" />
          <span className="ml-3 text-gray-400">Loading history...</span>
        </div>
      ) : selectedProductId && filteredMovements.length === 0 ? (
        <div className="bg-gray-800/50 p-12 rounded-xl text-center text-gray-500 border border-dashed border-gray-600">
          No stock out movements found (or no matches for filters).
        </div>
      ) : selectedProductId ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700 text-sm">
              <thead className="bg-gray-700/80">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-300">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-300">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-300">
                    Qty
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-300">
                    Reason
                  </th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-300">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredMovements.map((mov) => (
                  <tr
                    key={mov._id}
                    className="hover:bg-gray-700/40 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-300 whitespace-nowrap">
                      {formatDate(mov.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-900/50 text-red-300">
                        Out
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      <span className="text-red-400">
                        -{mov.quantity.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-200">{mov.reason}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-100">
                      {formatNumber(mov.balanceAfter)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800/50 p-12 rounded-xl text-center text-gray-400 border border-dashed border-gray-600">
          Select a raw material to record stock out and view history.
        </div>
      )}
    </div>
  );
}

export default StockMovement;