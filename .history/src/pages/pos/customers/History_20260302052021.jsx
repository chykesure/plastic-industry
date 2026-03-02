import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Search, Calendar, Download, Printer, ChevronDown, Loader2, DollarSign, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function History() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [ledgerData, setLedgerData] = useState(null);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingLedger, setLoadingLedger] = useState(false);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const res = await axios.get("http://localhost:8080/api/customers");
        setCustomers(res.data || []);
      } catch (err) {
        console.error("Failed to fetch customers:", err);
        toast.error("Failed to load customers");
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, []);

  // Fetch ledger
  useEffect(() => {
    if (!selectedCustomerId) {
      setLedgerData(null);
      return;
    }

    const fetchLedger = async () => {
      setLoadingLedger(true);
      try {
        const res = await axios.get(`${API_BASE}/api/customers/${selectedCustomerId}/ledger`);
        setLedgerData(res.data);
      } catch (err) {
        console.error("Failed to fetch ledger:", err);
        toast.error("Failed to load ledger");
        setLedgerData(null);
      } finally {
        setLoadingLedger(false);
      }
    };

    fetchLedger();
  }, [selectedCustomerId]);

  // --- Recalculation & Sorting (Using Timestamp) ---
  const processedTransactions = useMemo(() => {
    if (!ledgerData?.transactions) return [];

    // 1. Sort Chronologically (Oldest to Newest) using TIMESTAMP for precision
    let txs = [...ledgerData.transactions].sort((a, b) => {
      // Use timestamp if available, otherwise fallback to date
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : new Date(a.date).getTime();
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : new Date(b.date).getTime();
      return timeA - timeB;
    });

    // 2. Calculate Running Balance
    let runningBalance = ledgerData.openingBalance || 0;

    const txsWithBalances = txs.map((tx) => {
      if (tx.debit > 0) {
        runningBalance += tx.debit;
      } else if (tx.credit > 0) {
        runningBalance -= tx.credit;
      }
      return { ...tx, calculatedBalance: runningBalance };
    });

    // 3. Apply Filters (Date Range & Search)
    let filtered = txsWithBalances;

    if (dateFrom) filtered = filtered.filter((t) => t.date >= dateFrom);
    if (dateTo) filtered = filtered.filter((t) => t.date <= dateTo);

    if (search.trim()) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description?.toLowerCase().includes(term) ||
          t.reference?.toLowerCase().includes(term) ||
          t.date.includes(term)
      );
    }

    // 4. Final Sort: Keep Ascending (Previous Date First / Newest Date Down)
    return filtered.sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : new Date(a.date).getTime();
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : new Date(b.date).getTime();
      return timeA - timeB;
    });
  }, [ledgerData, search, dateFrom, dateTo]);

  // Get Current Balance (Latest balance from the end of the list)
  const currentBalance = processedTransactions.length > 0 
    ? processedTransactions[processedTransactions.length - 1].calculatedBalance 
    : (ledgerData?.currentBalance || 0);
    
  const openingBalance = ledgerData?.openingBalance || 0;

  const formatCurrency = (amt) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amt || 0);

  const getBalanceColor = (bal) => {
    if (bal > 0) return "text-emerald-400";
    if (bal < 0) return "text-rose-400";
    return "text-gray-200";
  };

  const resetFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
  };

  // Record Payment
  const handleRecordPayment = async () => {
    if (!selectedCustomerId) return toast.error("No customer selected");
    if (!paymentAmount || isNaN(paymentAmount) || Number(paymentAmount) <= 0) {
      return toast.error("Enter a valid payment amount");
    }

    setPaymentSubmitting(true);

    try {
      const payload = {
        amount: Number(paymentAmount),
        mode: paymentMode,
        reference: paymentReference.trim() || null,
        date: paymentDate || new Date().toISOString(),
      };

      const res = await axios.post(
        `${API_BASE}/api/customers/${selectedCustomerId}/payment`,
        payload
      );

      toast.success(`Payment of ${formatCurrency(paymentAmount)} recorded!`);

      // Refresh ledger
      const ledgerRes = await axios.get(`${API_BASE}/api/customers/${selectedCustomerId}/ledger`);
      setLedgerData(ledgerRes.data);

      // Reset form
      setPaymentAmount("");
      setPaymentReference("");
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setShowPaymentModal(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to record payment");
    } finally {
      setPaymentSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 text-gray-200 bg-gray-900 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      {/* Header + Balance Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-blue-400 tracking-tight">Customer Ledger</h2>
          <p className="text-gray-400 mt-1">
            Track credit sales, payments, and running balances
          </p>
        </div>

        {selectedCustomerId && ledgerData && (
          <div className="bg-gray-800 px-8 py-6 rounded-xl border border-gray-700 shadow-lg min-w-[320px]">
            <div className="text-gray-400 text-sm font-medium uppercase tracking-wide mb-2">
              Current Balance
            </div>
            <div className={`text-4xl font-bold ${getBalanceColor(currentBalance)} leading-none`}>
              {formatCurrency(currentBalance)}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500 flex justify-between">
              <span>Opening Balance</span>
              <span className="text-gray-300 font-medium">{formatCurrency(openingBalance)}</span>
            </div>

            {/* Record Payment Button */}
            {currentBalance > 0 && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <DollarSign size={18} />
                Record Payment
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-gray-800/60 p-5 rounded-xl border border-gray-700">
        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Customer</label>
          <div className="relative">
            {loadingCustomers ? (
              <div className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              </div>
            ) : (
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-blue-500 outline-none appearance-none pr-10 transition-colors cursor-pointer"
              >
                <option value="">Select a customer to view ledger</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} — {c.phone}
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
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">From Date</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-blue-500 outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">To Date</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-blue-500 outline-none text-sm"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={resetFilters}
            className="w-full px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-sm font-medium text-gray-200 border border-gray-600"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Search + Export */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search description, invoice # or date..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-blue-500 outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600/80 hover:bg-blue-700 rounded-lg text-sm flex items-center gap-2 transition shadow-lg shadow-blue-900/20">
            <Download size={16} /> Export
          </button>
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm flex items-center gap-2 transition border border-gray-600">
            <Printer size={16} /> Print Statement
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      {!selectedCustomerId ? (
        <div className="bg-gray-800/50 p-12 rounded-xl text-center text-gray-400 border border-dashed border-gray-600">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-700/50 mb-4">
            <Search size={24} className="text-gray-500" />
          </div>
          <p>Select a customer above to view their full transaction history and balance.</p>
        </div>
      ) : loadingLedger ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3" />
          <span className="text-gray-400">Loading ledger data...</span>
        </div>
      ) : processedTransactions.length === 0 ? (
        <div className="bg-gray-800/50 p-12 rounded-xl text-center text-gray-500 border border-dashed border-gray-600">
          <p>No transactions found for this customer (or matching your filters).</p>
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-400 mb-3 flex items-center gap-2">
            <span className="bg-gray-700 text-xs px-2 py-1 rounded text-gray-300">{processedTransactions.length}</span>
            transactions found
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700 text-sm">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-300 sticky top-0 bg-gray-700/50 backdrop-blur-md z-10">Date</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-300 sticky top-0 bg-gray-700/50 backdrop-blur-md z-10">Description</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-300 sticky top-0 bg-gray-700/50 backdrop-blur-md z-10">Ref</th>
                    <th className="px-6 py-4 text-right font-semibold text-rose-400 sticky top-0 bg-gray-700/50 backdrop-blur-md z-10 w-40">Debit (Out)</th>
                    <th className="px-6 py-4 text-right font-semibold text-emerald-400 sticky top-0 bg-gray-700/50 backdrop-blur-md z-10 w-40">Credit (In)</th>
                    <th className="px-6 py-4 text-right font-semibold text-gray-200 sticky top-0 bg-gray-700/50 backdrop-blur-md z-10 w-48">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {processedTransactions.map((tx, index) => (
                    <tr 
                      key={tx._id} 
                      className="hover:bg-gray-700/40 transition-colors group"
                    >
                      <td className="px-6 py-4 text-gray-300 whitespace-nowrap font-mono text-xs">
                        {new Date(tx.date).toLocaleDateString("en-NG")}
                      </td>
                      <td className="px-6 py-4 text-gray-200 font-medium">{tx.description}</td>
                      <td className="px-6 py-4 text-gray-400 font-mono text-xs">{tx.reference || "—"}</td>
                      
                      <td className="px-6 py-4 text-right">
                        {tx.debit > 0 ? (
                          <div className="flex items-center justify-end gap-2 text-rose-400 font-mono tabular-nums">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity"><ArrowUpRight size={14}/></span>
                            <span>{formatCurrency(tx.debit)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-600 font-mono">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {tx.credit > 0 ? (
                          <div className="flex items-center justify-end gap-2 text-emerald-400 font-mono tabular-nums">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity"><ArrowDownLeft size={14}/></span>
                            <span>{formatCurrency(tx.credit)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-600 font-mono">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right font-bold bg-gray-800/30">
                        <span className={`font-mono tabular-nums ${getBalanceColor(tx.calculatedBalance)}`}>
                          {formatCurrency(tx.calculatedBalance)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Table Footer Summary */}
            <div className="bg-gray-700/30 px-6 py-3 border-t border-gray-700 flex justify-end items-center gap-4 text-xs text-gray-400">
              <span>End of Period</span>
            </div>
          </div>
        </>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/20 rounded-lg"><DollarSign size={20} /></div>
                Record Payment
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-500 hover:text-white transition">
                <span className="sr-only">Close</span>
                &times;
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5 font-medium">Amount Paying (NGN)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-emerald-500 outline-none font-mono text-lg"
                  min="0"
                  step="0.01"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-emerald-500 outline-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="POS">POS</option>
                    <option value="Mobile Money">Mobile Money</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Date</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Reference / Note</label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="e.g. Bank ref #ABC123"
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-700/50">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRecordPayment}
                  disabled={paymentSubmitting || !paymentAmount || Number(paymentAmount) <= 0}
                  className={`flex-1 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 text-white shadow-lg shadow-emerald-900/20 ${
                    paymentSubmitting || !paymentAmount || Number(paymentAmount) <= 0
                      ? "bg-emerald-800/50 cursor-not-allowed opacity-60"
                      : "bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.02]"
                  }`}
                >
                  {paymentSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Payment"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default History;