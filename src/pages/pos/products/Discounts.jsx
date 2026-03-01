import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ExpiryManagement() {
  const [records, setRecords] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    productId: "",
    expiryDate: "",
  });
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const API_BASE = "http://localhost:8080/api";

  // Load products & expiry records
  useEffect(() => {
    fetchProducts();
    fetchRecords();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/products`);
      setProducts(res.data);
    } catch (err) {
      toast.error("Failed to load products");
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/expiry`);
      setRecords(res.data);
    } catch (err) {
      toast.error("Failed to load expiry records");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.productId || !formData.expiryDate) {
      toast.error("Please select product and expiry date!");
      return;
    }

    try {
      setSubmitting(true);

      if (editItem) {
        await axios.put(`${API_BASE}/expiry/${editItem._id}`, formData);
        toast.success("Expiry record updated!");
      } else {
        await axios.post(`${API_BASE}/expiry`, formData);
        toast.success("Expiry record added!");
      }

      setFormData({ productId: "", expiryDate: "" });
      setEditItem(null);
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({
      productId: item.productId._id,
      expiryDate: item.expiryDate?.split("T")[0],
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      await axios.delete(`${API_BASE}/expiry/${id}`);
      toast.info("Record deleted");
      fetchRecords();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const getStatus = (exp) => {
    const today = new Date();
    const expiry = new Date(exp);

    if (expiry < today) return "Expired";

    const diff = (expiry - today) / (1000 * 60 * 60 * 24);

    return diff <= 7 ? "Expiring Soon" : "Valid";
  };

  const filtered = records.filter((r) => {
    const name = r.productId?.name?.toLowerCase() || "";
    const sku = r.productId?.sku?.toLowerCase() || "";
    return name.includes(search.toLowerCase()) || sku.includes(search.toLowerCase());
  });

  return (
    <div className="text-gray-200">
      <ToastContainer position="top-right" autoClose={3000} />

      <h2 className="text-2xl font-bold mb-2">Expiry Management</h2>
      <p className="text-gray-400 mb-6">
        Track product expiry dates and statuses.
      </p>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-md text-center">
          <h4 className="text-sm text-gray-400">Total Tracked</h4>
          <p className="text-xl font-semibold">{records.length}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-md text-center">
          <h4 className="text-sm text-gray-400">Expiring Soon (≤ 7 days)</h4>
          <p className="text-xl font-semibold">
            {records.filter((r) => getStatus(r.expiryDate) === "Expiring Soon").length}
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-md text-center">
          <h4 className="text-sm text-gray-400">Expired</h4>
          <p className="text-xl font-semibold">
            {records.filter((r) => getStatus(r.expiryDate) === "Expired").length}
          </p>
        </div>
      </div>

      {/* ADD / EDIT FORM */}
      <div className="mb-6">
        <form className="grid grid-cols-4 gap-3" onSubmit={handleSubmit}>
          <select
            name="productId"
            value={formData.productId}
            onChange={handleChange}
            className="px-3 py-2 rounded-md bg-gray-800 border border-gray-700"
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>

          <input
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            className="px-3 py-2 rounded-md bg-gray-800 border border-gray-700"
          />

          <button
            type="submit"
            disabled={submitting}
            className={`px-4 py-2 rounded-md text-white transition ${submitting ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"
              }`}
          >
            {submitting ? "Saving..." : editItem ? "Update" : "Add"}
          </button>
        </form>
      </div>

      {/* SEARCH BAR */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search product or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded-md bg-gray-800 border border-gray-700 w-1/3"
        />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-700 rounded-md text-gray-200">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left">Product</th>
              <th className="px-4 py-2">SKU</th>
              <th className="px-4 py-2">Expiry Date</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="py-4 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-4 text-center text-gray-400">
                  No records found
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item._id} className="border-t border-gray-700 hover:bg-gray-800/40">
                  <td className="px-4 py-2">{item.productId?.name}</td>
                  <td className="px-4 py-2">{item.productId?.sku}</td>
                  <td className="px-4 py-2">{item.expiryDate?.split("T")[0]}</td>
                  <td className="px-4 py-2">
                    {(() => {
                      const status = getStatus(item.expiryDate);
                      return (
                        <span
                          className={`px-2 py-1 text-xs rounded ${status === "Expired"
                            ? "bg-red-600"
                            : status === "Expiring Soon"
                              ? "bg-yellow-600"
                              : "bg-green-600"
                            }`}
                        >
                          {status}
                        </span>
                      );
                    })()}
                  </td>

                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="px-2 py-1 bg-yellow-600 rounded hover:bg-yellow-500 flex items-center gap-1"
                    >
                      <FaEdit /> Edit
                    </button>

                    <button
                      onClick={() => handleDelete(item._id)}
                      className="px-2 py-1 bg-red-600 rounded hover:bg-red-500 flex items-center gap-1"
                    >
                      <FaTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExpiryManagement;
