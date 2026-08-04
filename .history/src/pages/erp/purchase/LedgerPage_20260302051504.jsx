import React, { useState, useEffect } from "react";
import axios from "axios";

// -----------------------------
// Inline UI Components
// -----------------------------
const Button = ({ children, className = "", ...props }) => (
  <button {...props} className={`px-4 py-2 rounded-lg text-white font-medium shadow-sm transition ${className}`}>
    {children}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl shadow-md border border-gray-700 bg-gray-800 ${className}`}>{children}</div>
);

const CardContent = ({ children, className = "" }) => <div className={`p-4 ${className}`}>{children}</div>;

// -----------------------------
// Ledger Page Component
// -----------------------------
const LedgerPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);

  const SUPPLIERS_API = "http://localhost:8080/suppliers";
  const LEDGER_API = "http://localhost:8080/suppliers/ledger"; // Updated endpoint

  // Fetch all suppliers on mount
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const { data } = await axios.get(SUPPLIERS_API);
        setSuppliers(data);
      } catch (err) {
        console.error("Error fetching suppliers:", err);
      }
    };
    fetchSuppliers();
  }, []);

  // Fetch ledger for selected supplier
  const fetchLedger = async (supplierId) => {
    if (!supplierId) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${LEDGER_API}/${supplierId}`);
      setLedger(data); // backend sends running balance already
    } catch (err) {
      console.error("Error fetching ledger:", err);
      setLedger([]);
    }
    setLoading(false);
  };

  const handleSupplierChange = (e) => {
    const supplierId = e.target.value;
    setSelectedSupplier(supplierId);
    fetchLedger(supplierId);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-emerald-400">Supplier Ledger</h2>
        <select
          className="bg-gray-800 border border-gray-700 text-gray-300 px-4 py-2 rounded-lg"
          value={selectedSupplier}
          onChange={handleSupplierChange}
        >
          <option value="">Select Supplier</option>
          {suppliers.map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
      </div>

      <Card>
        <CardContent>
          {loading ? (
            <p className="text-gray-300">Loading ledger...</p>
          ) : (
            <table className="min-w-full text-gray-300">
              <thead className="border-b border-gray-700 text-gray-400 uppercase text-xs">
                <tr>
                  <th className="py-3 text-left">Date</th>
                  <th className="py-3 text-left">Reference No</th>
                  <th className="py-3 text-left">Amount In</th>
                  <th className="py-3 text-left">Amount Out</th>
                  <th className="py-3 text-left">Balance</th>
                </tr>
              </thead>
              <tbody>
                {ledger.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-gray-400">
                      No ledger entries found.
                    </td>
                  </tr>
                ) : (
                  ledger.map((entry) => (
                    <tr key={entry._id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                      <td className="py-3">{new Date(entry.date).toLocaleDateString()}</td>
                      <td className="py-3">{entry.referenceNumber || "-"}</td>
                      <td className="py-3">{entry.amountIn?.toLocaleString("en-NG", { style: "currency", currency: "NGN" }) || "₦0"}</td>
                      <td className="py-3">{entry.amountOut?.toLocaleString("en-NG", { style: "currency", currency: "NGN" }) || "₦0"}</td>
                      <td className="py-3">{entry.balance?.toLocaleString("en-NG", { style: "currency", currency: "NGN" }) || "₦0"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LedgerPage;
