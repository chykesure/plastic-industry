import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

function TopProductsReport() {
  const [topProducts, setTopProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get("http://localhost:8080/api/reports/top-products"),
          axios.get("http://localhost:8080/api/categories"),
        ]);
        setTopProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = selectedCategory
    ? topProducts.filter((p) => p.category === selectedCategory)
    : topProducts;

  const totalQty = filteredProducts.reduce((sum, p) => sum + p.qtySold, 0);
  const totalRevenue = filteredProducts.reduce((sum, p) => sum + p.revenue, 0);

  const bestSeller = filteredProducts.reduce(
    (max, p) => (p.revenue > max.revenue ? p : max),
    filteredProducts[0] || {}
  );

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredProducts);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Top Products");
    XLSX.writeFile(wb, "TopProductsReport.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Top Products Report", 14, 15);
    doc.autoTable({
      head: [["Product", "Category", "Quantity Sold", "Revenue (₦)"]],
      body: filteredProducts.map((p) => [
        p.productName,
        p.category || "-",
        p.qtySold,
        `₦${p.revenue.toLocaleString()}`,
      ]),
      foot: [["", "TOTAL", totalQty, `₦${totalRevenue.toLocaleString()}`]],
      startY: 20,
    });
    doc.save("TopProductsReport.pdf");
  };

  if (loading) return <p className="text-gray-300">Loading top products…</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-[#0b1d33] to-[#0f2747] rounded-xl text-gray-200">
      <h2 className="text-2xl font-bold text-blue-400">Top Products Report</h2>
      <p className="text-gray-400">See your best-selling products by quantity and revenue.</p>

      {/* Category Filter */}
      <div className="flex gap-3 items-center">
        <label className="text-gray-300">Filter by Category:</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 rounded bg-[#0b1d33] border border-[#1c3555] text-gray-200"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow"
        >
          Export Excel
        </button>
        <button
          onClick={exportToPDF}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow"
        >
          Export PDF
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow-lg border border-[#1c3555]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#163457] text-gray-300 text-sm">
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-right">Quantity Sold</th>
              <th className="px-4 py-3 text-right">Revenue (₦)</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((item, idx) => (
              <tr
                key={idx}
                className={`border-b border-[#1c3555] text-gray-200 hover:bg-[#1a3352] transition ${item._id === bestSeller._id ? "bg-blue-900/40" : ""
                  }`}
              >
                <td className="px-4 py-2 flex items-center gap-2">
                  {item.productName}
                  {item._id === bestSeller._id && (
                    <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded">🏆 Best Seller</span>
                  )}
                </td>
                <td className="px-4 py-2">{item.category || "-"}</td>
                <td className="px-4 py-2 text-right">{item.qtySold}</td>
                <td className="px-4 py-2 text-right">₦{item.revenue.toLocaleString()}</td>
              </tr>
            ))}
            {filteredProducts.length > 0 && (
              <tr className="bg-gray-900 font-semibold text-gray-300">
                <td colSpan={2} className="px-4 py-3 text-right">
                  TOTAL
                </td>
                <td className="px-4 py-3 text-right">{totalQty}</td>
                <td className="px-4 py-3 text-right">₦{totalRevenue.toLocaleString()}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TopProductsReport;
