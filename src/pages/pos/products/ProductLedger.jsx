import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ProductLedger() {
  const [products, setProducts] = useState([]);
  const [ledgerData, setLedgerData] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = "http://localhost:8080/api/product-ledger";

  // Load products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/products");
        setProducts(res.data || []);
        if (res.data.length > 0 && !selectedProduct) {
          setSelectedProduct(res.data[0].name);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load products");
      }
    };
    fetchProducts();
  }, []);

  // Fetch ledger when product is selected
  useEffect(() => {
    if (!selectedProduct) return;

    const fetchLedger = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE}/${encodeURIComponent(selectedProduct)}`
        );
        setLedgerData(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load product ledger");
        setLedgerData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, [selectedProduct]);

  const ledger = ledgerData?.ledger || [];
  const productName = ledgerData?.product || selectedProduct;
  const currentStock = ledgerData?.currentStock || 0;

  // Filter logic
  const filteredLedger = ledger.filter((row) => {
    const supplierMatch = selectedSupplier
      ? row.supplierName === selectedSupplier || row.supplierName === "—"
      : true;

    const startMatch = startDate ? new Date(row.date) >= new Date(startDate) : true;
    const endMatch = endDate ? new Date(row.date) <= new Date(endDate) : true;

    return supplierMatch && startMatch && endMatch;
  });

  // Running balance on filtered data
  let runningBalance = 0;
  const ledgerWithBalance = filteredLedger.map((row) => {
    const change = (row.quantityIn || 0) - (row.quantityOut || 0);
    runningBalance += change;
    return { ...row, balanceAfter: runningBalance };
  });

  const suppliers = [...new Set(ledger.map(l => l.supplierName).filter(Boolean))];

  // Determine display style & label
  const getMovementInfo = (row) => {
    const type = (row.type || "").toUpperCase();
    const reason = row.reason || row.note || "";

    if (type === "OUT") {
      return {
        label: "OUT",
        bgColor: "bg-red-600",
        textColor: "text-white",
        rowBg: "bg-red-900/15 hover:bg-red-900/25",
        qtyOutDisplay: `-${row.quantityOut || 0}`,
        reasonDisplay: reason || "Stock consumption / issue"
      };
    }

    if (type === "RETURN" || reason.toLowerCase().includes("return")) {
      return {
        label: "RETURN",
        bgColor: "bg-yellow-600",
        textColor: "text-yellow-100",
        rowBg: "bg-yellow-900/10 hover:bg-yellow-900/20",
        qtyOutDisplay: row.quantityOut ? `-${row.quantityOut}` : "—",
        reasonDisplay: reason || "Return processed"
      };
    }

    if (type === "IN") {
      return {
        label: "IN",
        bgColor: "bg-green-600",
        textColor: "text-white",
        rowBg: "bg-green-900/10 hover:bg-green-900/20",
        qtyOutDisplay: "—",
        reasonDisplay: "Stock received / purchase"
      };
    }

    return {
      label: type || "OTHER",
      bgColor: "bg-gray-600",
      textColor: "text-gray-100",
      rowBg: "hover:bg-gray-800/40",
      qtyOutDisplay: row.quantityOut ? `-${row.quantityOut}` : "—",
      reasonDisplay: reason || "—"
    };
  };

  return (
    <div className="text-gray-200 p-4 md:p-6 space-y-6">
      <ToastContainer />
      <h2 className="text-2xl md:text-3xl font-bold">Product Ledger</h2>
      <p className="text-gray-400">Track all stock movements per product (purchases, returns, stock-outs)</p>

      {/* Product selector */}
      <div className="max-w-md">
        <label className="block mb-2 text-gray-300 font-medium">Product</label>
        <select
          value={selectedProduct}
          onChange={(e) => {
            setSelectedProduct(e.target.value);
            setSelectedSupplier("");
          }}
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 outline-none"
        >
          <option value="">— Select Product —</option>
          {products.map((p) => (
            <option key={p._id} value={p.name}>
              {p.name} ({p.sku})
            </option>
          ))}
        </select>
      </div>

      {selectedProduct && (
        <>
          {/* Current stock card */}
          <div className="bg-gradient-to-r from-blue-950 to-indigo-950 border border-blue-800/50 rounded-xl p-6 text-center shadow-lg">
            <h3 className="text-xl font-semibold text-blue-300 mb-3">{productName}</h3>
            <div className="text-5xl font-bold text-white mb-1">{currentStock}</div>
            <p className="text-gray-400">Current Stock Balance</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-5 mb-6">
            <div className="min-w-[200px]">
              <label className="block mb-1 text-gray-400">Supplier</label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg"
              >
                <option value="">All Suppliers</option>
                {suppliers.map((s, i) => (
                  <option key={i} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-gray-400">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="p-2.5 bg-gray-800 border border-gray-700 rounded-lg"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-400">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="p-2.5 bg-gray-800 border border-gray-700 rounded-lg"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto bg-gray-800 rounded-xl border border-gray-700 shadow-2xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Type</th>
                  <th className="px-6 py-4 text-left">Reference</th>
                  <th className="px-6 py-4 text-center">In</th>
                  <th className="px-6 py-4 text-center">Out</th>
                  <th className="px-6 py-4 text-left">Supplier</th>
                  <th className="px-6 py-4 text-left">Reason</th>
                  <th className="px-6 py-4 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr><td colSpan={8} className="text-center py-12">Loading ledger...</td></tr>
                ) : ledgerWithBalance.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-500">No movements found</td></tr>
                ) : (
                  ledgerWithBalance.map((row, index) => {
                    const info = getMovementInfo(row);
                    return (
                      <tr key={index} className={`border-t ${info.rowBg}`}>
                        <td className="px-6 py-4">
                          {new Date(row.date).toLocaleString("en-NG", {
                            dateStyle: "medium",
                            timeStyle: "short"
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${info.bgColor} ${info.textColor}`}>
                            {info.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-300">{row.referenceNumber || "—"}</td>
                        <td className="px-6 py-4 text-center text-green-400 font-medium">
                          {row.quantityIn ? `+${row.quantityIn}` : "—"}
                        </td>
                        <td className="px-6 py-4 text-center text-red-400 font-medium">
                          {info.qtyOutDisplay}
                        </td>
                        <td className="px-6 py-4">{row.supplierName || "—"}</td>
                        <td className="px-6 py-4 text-gray-300 max-w-xs truncate">
                          {info.reasonDisplay}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-100">
                          {row.balanceAfter}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default ProductLedger;