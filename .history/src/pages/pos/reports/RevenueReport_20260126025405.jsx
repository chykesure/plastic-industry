import React, { useState, useEffect } from "react";
import axios from "axios";

function RevenueReport() {
  const [summaryTotals, setSummaryTotals] = useState({
    sales: 0,
    cost: 0,
    returns: 0,
    netSales: 0,
    grossProfit: 0,
    netProfit: 0,
  });

  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(");
  const [endDate, setEndDate] = useState(");
  const [selectedPeriod, setSelectedPeriod] = useState("all");

  // Fetch both revenue and returns (filtered by date when provided)
  const fetchData = async (start = "", end = "") => {
    setLoading(true);
    try {
      const params = {};
      if (start) params.startDate = start;
      if (end) params.endDate = end;

      // 1. Revenue totals (already handles date filtering in backend)
      const revenueRes = await axios.get(`${API_BASE}/api/revenue", { params });
      const revenueTotals = revenueRes.data.totals || {
        sales: 0,
        cost: 0,
        returns: 0, // we will override this
        netSales: 0,
        grossProfit: 0,
        netProfit: 0,
      };

      // 2. Filtered returns from /api/returns
      const returnsRes = await axios.get(`${ API_BASE } / api / returns", { params });
      const returnsData = returnsRes.data.data || [];

      // Calculate accurate returns total from filtered records
      const calculatedReturns = returnsData.reduce((sum, record) => {
        return sum + (Number(record.totalRefund) || 0);
      }, 0);

      // Merge: keep revenue numbers, but use real filtered returns
      setSummaryTotals({
        ...revenueTotals,
        returns: Number(calculatedReturns.toFixed(2)),
      });

    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Quick period selection logic
  const setPeriod = (period) => {
    setSelectedPeriod(period);

    const now = new Date();
    let start = null;
    const end = now;

    switch (period) {
      case "day":
        start = new Date(now);
        break;
      case "week":
        const dayOfWeek = now.getDay();
        start = new Date(now);
        start.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
        break;
      case "month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "2month":
        start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        break;
      case "3month":
        start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      default:
        start = null;
    }

    if (start) {
      const s = start.toISOString().split("T")[0];
      const e = end.toISOString().split("T")[0];
      setStartDate(s);
      setEndDate(e);
      fetchData(s, e);
    } else {
      setStartDate(");
      setEndDate(");
      fetchData();
    }
  };

  const formatCurrency = (amount) =>
    "₦" + Number(amount || 0).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Prepare single summary row
  const getTableData = () => {
    let periodLabel = "All Time";
    let dateLabel = "—";

    if (startDate || endDate) {
      switch (selectedPeriod) {
        case "day": periodLabel = "Today"; break;
        case "week": periodLabel = "This Week"; break;
        case "month": periodLabel = "This Month"; break;
        case "2month": periodLabel = "Last 2 Months"; break;
        case "3month": periodLabel = "Last 3 Months"; break;
        default: periodLabel = "Custom Range";
      }
      dateLabel = startDate && endDate ? `${startDate} → ${endDate}` : (startDate || endDate || "—");
    }

    return [{
      period: periodLabel,
      date: dateLabel,
      sales: summaryTotals.sales,
      cost: summaryTotals.cost,
      profit: summaryTotals.grossProfit || summaryTotals.netSales,
      returns: summaryTotals.returns,
      netProfit: summaryTotals.netProfit,
    }];
  };

  const tableData = getTableData();

  if (loading) {
    return <div className="p-10 text-center text-blue-500 text-xl">Loading report...</div>;
  }

  return (
    <div className="p-6 min-h-screen bg-gray-900 text-gray-100">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
        <div>
          <h1 className="text-3xl font-bold text-blue-400">💰 Revenue Report</h1>
          <p className="text-gray-400 mt-1">
            {startDate || endDate
              ? `From ${startDate || "—"} to ${endDate || "now"}`
              : "Showing all available data"}
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full md:w-auto">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setPeriod("day")} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">Today</button>
            <button onClick={() => setPeriod("week")} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">This Week</button>
            <button onClick={() => setPeriod("month")} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">This Month</button>
            <button onClick={() => setPeriod("2month")} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">Last 2 Months</button>
            <button onClick={() => setPeriod("3month")} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">Last 3 Months</button>
          </div>

          <div className="flex flex-wrap gap-3 items-center bg-gray-700 p-3 rounded-lg">
            <span className="text-sm text-gray-300">From</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value); setSelectedPeriod("custom");
              }}
              className="bg-gray-600 px-3 py-2 rounded text-white text-sm border border-gray-500 focus:outline-none focus:border-blue-500"
            />
            <span className="text-sm text-gray-300">To</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setSelectedPeriod("custom"); }}
              className="bg-gray-600 px-3 py-2 rounded text-white text-sm border border-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button onClick={() => fetchData(startDate, endDate)} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white transition">Apply</button>
            <button onClick={() => { setStartDate("); setEndDate("); setSelectedPeriod("all"); fetchData(); }} className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded text-white transition">Reset</button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-800 p-6 rounded-xl border-l-4 border-blue-500 shadow-md">
          <p className="text-gray-400 text-sm uppercase font-semibold tracking-wide">TOTAL SALES</p>
          <p className="text-4xl font-bold mt-2">{formatCurrency(summaryTotals.sales)}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border-l-4 border-red-500 shadow-md">
          <p className="text-gray-400 text-sm uppercase font-semibold tracking-wide">TOTAL RETURNS</p>
          <p className="text-4xl font-bold mt-2 text-red-400">{formatCurrency(summaryTotals.returns)}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border-l-4 border-green-500 shadow-md">
          <p className="text-gray-400 text-sm uppercase font-semibold tracking-wide">NET PROFIT</p>
          <p className={`text-4xl font-bold mt-2 ${summaryTotals.netProfit >= 0 ? "text-green-400" : "text-red-500"}`}>
            {formatCurrency(summaryTotals.netProfit)}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-gray-700 text-gray-300 text-sm uppercase tracking-wider">
              <tr>
                <th className="p-5">PERIOD</th>
                <th className="p-5">DATE RANGE</th>
                <th className="p-5 text-right">SALES</th>
                <th className="p-5 text-right">COST</th>
                <th className="p-5 text-right">PROFIT</th>
                <th className="p-5 text-right">RETURNS</th>
                <th className="p-5 text-right">NET PROFIT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-base">
              {tableData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-750 transition-colors">
                  <td className="p-5 font-medium">{row.period}</td>
                  <td className="p-5">{row.date}</td>
                  <td className="p-5 text-right">{formatCurrency(row.sales)}</td>
                  <td className="p-5 text-right">{formatCurrency(row.cost)}</td>
                  <td className="p-5 text-right">{formatCurrency(row.profit)}</td>
                  <td className="p-5 text-right text-red-400">{formatCurrency(row.returns)}</td>
                  <td className="p-5 text-right font-bold">{formatCurrency(row.netProfit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div >
  );
}

export default RevenueReport;