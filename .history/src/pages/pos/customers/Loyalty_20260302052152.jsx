import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Gift, Users, PlusCircle, MinusCircle, Search, ChevronDown, Award, History, Loader2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
function Loyalty() {
  // Tiers (static configuration)
  const tiers = [
    { name: "Bronze", minPoints: 0, color: "text-amber-400", bg: "bg-amber-900/30", border: "border-amber-700" },
    { name: "Silver", minPoints: 200, color: "text-gray-300", bg: "bg-gray-700/40", border: "border-gray-500" },
    { name: "Gold", minPoints: 500, color: "text-yellow-400", bg: "bg-yellow-900/30", border: "border-yellow-600" },
    { name: "Platinum", minPoints: 1000, color: "text-cyan-400", bg: "bg-cyan-900/30", border: "border-cyan-600" },
  ];

  // State
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null); // Full loyalty data
  const [search, setSearch] = useState("");
  const [pointsToAdjust, setPointsToAdjust] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [adjustmentType, setAdjustmentType] = useState("add"); // "add" or "redeem"
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch customers on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const res = await axios.get("`${API_BASE}/api/customers");
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

  // Fetch loyalty details when customer changes
  useEffect(() => {
    if (!selectedCustomerId) {
      setSelectedCustomer(null);
      return;
    }

    const fetchLoyalty = async () => {
      setLoadingDetails(true);
      try {
        const res = await axios.get(``${API_BASE}/api/customers/${selectedCustomerId}/loyalty`);
        setSelectedCustomer(res.data);
      } catch (err) {
        console.error("Failed to fetch loyalty data:", err);
        toast.error("Failed to load loyalty details");
        setSelectedCustomer(null);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchLoyalty();
  }, [selectedCustomerId]);

  // Calculate current tier & progress
  const currentTier = useMemo(() => {
    if (!selectedCustomer?.points) return tiers[0];
    return tiers.reduce((prev, curr) =>
      selectedCustomer.points >= curr.minPoints ? curr : prev,
      tiers[0]
    );
  }, [selectedCustomer?.points]);

  const nextTier = useMemo(() => {
    return tiers.find(t => t.minPoints > currentTier.minPoints) || null;
  }, [currentTier]);

  const progressToNext = useMemo(() => {
    if (!nextTier || !selectedCustomer?.points) return 100;
    return Math.min(
      100,
      ((selectedCustomer.points - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    );
  }, [selectedCustomer?.points, currentTier, nextTier]);

  // Filtered customers for dropdown
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase())
  );

  const showToast = (message, type = "success") => {
    toast[type](message, { position: "top-right", autoClose: 3000 });
  };

  const handleAdjustPoints = async (e) => {
    e.preventDefault();

    if (!selectedCustomerId) return showToast("Select a customer first", "error");
    if (!pointsToAdjust || isNaN(pointsToAdjust) || Number(pointsToAdjust) <= 0) {
      return showToast("Enter a valid positive number", "error");
    }
    if (!adjustmentReason.trim()) return showToast("Provide a reason", "error");

    const amount = Number(pointsToAdjust);
    const payload = {
      amount,
      type: adjustmentType,
      reason: adjustmentReason.trim(),
    };

    try {
      const res = await axios.post(
        `${API_BASE}/api/customers/${selectedCustomerId}/loyalty/adjust`,
        payload
      );

      // Update local state with fresh data from backend
      setSelectedCustomer(res.data);

      showToast(
        `${adjustmentType === "add" ? "Added" : "Redeemed"} ${amount} points successfully!`,
        "success"
      );

      // Reset form
      setPointsToAdjust("");
      setAdjustmentReason("");
    } catch (err) {
      console.error("Points adjustment failed:", err);
      showToast(err.response?.data?.message || "Failed to adjust points", "error");
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-green-400 flex items-center gap-3">
          <Gift size={32} /> Loyalty Management
        </h1>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Selection + Adjustment */}
        <div className="lg:col-span-1 space-y-6">
          {/* Customer Selector */}
          <div className="bg-gray-800/90 rounded-xl border border-gray-700 p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-green-300 mb-4 flex items-center gap-2">
              <Users size={20} /> Select Customer
            </h3>

            <div className="relative mb-4">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or phone..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-green-500 outline-none"
              />
            </div>

            {loadingCustomers ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-green-500" />
              </div>
            ) : (
              <div className="relative">
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-green-500 outline-none appearance-none pr-10"
                >
                  <option value="">— Choose Customer —</option>
                  {filteredCustomers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            )}
          </div>

          {/* Adjustment Form */}
          {selectedCustomerId && (
            <div className="bg-gray-800/90 rounded-xl border border-gray-700 p-5 shadow-xl">
              <h3 className="text-lg font-semibold text-green-300 mb-4 flex items-center gap-2">
                <PlusCircle size={20} /> Adjust Points
              </h3>

              {loadingDetails ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                </div>
              ) : (
                <form onSubmit={handleAdjustPoints} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Amount</label>
                    <input
                      type="number"
                      value={pointsToAdjust}
                      onChange={(e) => setPointsToAdjust(e.target.value)}
                      placeholder="Enter points"
                      min="1"
                      className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-green-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Reason</label>
                    <input
                      type="text"
                      value={adjustmentReason}
                      onChange={(e) => setAdjustmentReason(e.target.value)}
                      placeholder="e.g. Purchase bonus, Birthday gift"
                      className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-green-500 outline-none"
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setAdjustmentType("add")}
                      className={`flex-1 py-2.5 rounded-lg font-medium transition ${
                        adjustmentType === "add"
                          ? "bg-green-600 text-white shadow-md"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      Add Points
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustmentType("redeem")}
                      className={`flex-1 py-2.5 rounded-lg font-medium transition ${
                        adjustmentType === "redeem"
                          ? "bg-yellow-600 text-white shadow-md"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      Redeem Points
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-green-700 hover:bg-green-600 text-white rounded-lg font-medium transition flex items-center justify-center gap-2 shadow-md"
                  >
                    <Gift size={18} /> Confirm Adjustment
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Customer Details */}
        {selectedCustomerId && selectedCustomer && (
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Card */}
            <div className={`rounded-xl border p-6 shadow-xl ${currentTier.bg} ${currentTier.border}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    {selectedCustomer.name}
                    <span className={`text-lg px-3 py-1 rounded-full ${currentTier.color} bg-black/30`}>
                      {currentTier.name} Tier
                    </span>
                  </h2>
                  <p className="text-gray-300 mt-1">{selectedCustomer.phone}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-white">
                    {(selectedCustomer.points || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-300">Current Points</div>
                </div>
              </div>

              {/* Progress Bar */}
              {nextTier && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-300">Next Tier: {nextTier.name}</span>
                    <span className="text-gray-300">
                      {selectedCustomer.points} / {nextTier.minPoints} pts
                    </span>
                  </div>
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${progressToNext}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-black/20 p-4 rounded-lg text-center">
                  <div className="text-xl font-bold text-green-400">
                    {(selectedCustomer.totalEarned || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">Total Earned</div>
                </div>
                <div className="bg-black/20 p-4 rounded-lg text-center">
                  <div className="text-xl font-bold text-yellow-400">
                    {(selectedCustomer.totalRedeemed || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">Total Redeemed</div>
                </div>
                <div className="bg-black/20 p-4 rounded-lg text-center col-span-2 md:col-span-1">
                  <div className="text-xl font-bold text-blue-400">
                    {((selectedCustomer.totalEarned || 0) - (selectedCustomer.totalRedeemed || 0)).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">Net Points</div>
                </div>
              </div>
            </div>

            {/* Points History Table */}
            <div className="bg-gray-800/90 rounded-xl border border-gray-700 p-5 shadow-xl">
              <h3 className="text-lg font-semibold text-green-300 mb-4 flex items-center gap-2">
                <History size={20} /> Points History
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-700/80">
                    <tr>
                      <th className="px-5 py-3 text-left font-semibold text-gray-300">Date</th>
                      <th className="px-5 py-3 text-left font-semibold text-gray-300">Action</th>
                      <th className="px-5 py-3 text-left font-semibold text-gray-300">Points</th>
                      <th className="px-5 py-3 text-left font-semibold text-gray-300">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {selectedCustomer.history?.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-gray-500">
                          No loyalty activity yet.
                        </td>
                      </tr>
                    ) : (
                      selectedCustomer.history.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-700/40 transition-colors">
                          <td className="px-5 py-3 text-gray-300">{formatDate(entry.date)}</td>
                          <td className="px-5 py-3">
                            <span
                              className={`px-2.5 py-1 rounded text-xs font-medium ${
                                entry.action === "Earned" ? "bg-green-900/50 text-green-300" : "bg-yellow-900/50 text-yellow-300"
                              }`}
                            >
                              {entry.action}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-medium">
                            <span className={entry.amount > 0 ? "text-green-400" : "text-yellow-400"}>
                              {entry.amount > 0 ? "+" : ""}{entry.amount.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-gray-300">{entry.reason}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {!selectedCustomerId && (
        <div className="bg-gray-800/50 p-12 rounded-xl text-center text-gray-400 border border-dashed border-gray-600">
          Select a customer from the left panel to view and manage their loyalty points and history.
        </div>
      )}
    </div>
  );
}

export default Loyalty;