import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit2, Trash2, Check, X, Search, Wallet, Loader2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AddView() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    openingBalance: "0.00",
  });
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    openingBalance: "0.00",
  });

  // Fetch all customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/customers");
      setCustomers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      toast.error("Failed to load customers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    toast[type](message, { position: "top-right", autoClose: 3000 });
  };

  const handleChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    const setter = isEdit ? setEditForm : setForm;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (data) => {
    if (!data.name.trim()) return "Name is required";
    if (!data.phone.trim()) return "Phone number is required";
    if (isNaN(parseFloat(data.openingBalance))) return "Opening balance must be a valid number";
    return null;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const error = validateForm(form);
    if (error) return showToast(error, "error");

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      openingBalance: parseFloat(form.openingBalance) || 0,
    };

    try {
      const res = await axios.post("http://localhost:8080/api/customers", payload);
      setCustomers([...customers, res.data]);
      setForm({ name: "", phone: "", openingBalance: "0.00" });
      showToast("Customer added successfully!");
    } catch (err) {
      console.error("Add customer error:", err);
      showToast(err.response?.data?.message || "Failed to add customer", "error");
    }
  };

  const handleEditStart = (customer) => {
    setEditingId(customer._id);
    setEditForm({
      name: customer.name,
      phone: customer.phone,
      openingBalance: customer.openingBalance.toFixed(2),
    });
  };

  const handleUpdate = async (id) => {
    const error = validateForm(editForm);
    if (error) return showToast(error, "error");

    const payload = {
      name: editForm.name.trim(),
      phone: editForm.phone.trim(),
      openingBalance: parseFloat(editForm.openingBalance) || 0,
    };

    try {
      const res = await axios.put(`http://localhost:8080/api/customers/${id}`, payload);
      setCustomers(customers.map(c => (c._id === id ? res.data : c)));
      setEditingId(null);
      showToast("Customer updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      showToast(err.response?.data?.message || "Failed to update customer", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;

    try {
      await axios.delete(`http://localhost:8080/api/customers/${id}`);
      setCustomers(customers.filter(c => c._id !== id));
      showToast("Customer deleted successfully", "info");
    } catch (err) {
      console.error("Delete error:", err);
      showToast(err.response?.data?.message || "Failed to delete customer", "error");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getBalanceStyle = (balance) => {
    if (balance > 0) return "text-emerald-400 font-semibold";
    if (balance < 0) return "text-rose-400 font-semibold";
    return "text-gray-400";
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-2 md:p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Add / Edit Form */}
      <div className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-xl">
        <h2 className="text-2xl font-bold text-blue-400 mb-5 flex items-center gap-3">
          <Wallet size={24} /> {editingId ? "Edit Customer" : "Add New Customer"}
        </h2>

        <form className="grid grid-cols-1 md:grid-cols-3 gap-5" onSubmit={editingId ? handleUpdate : handleAdd}>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Full Name *</label>
            <input
              type="text"
              name="name"
              value={editingId ? editForm.name : form.name}
              onChange={(e) => handleChange(e, !!editingId)}
              placeholder="Enter customer name"
              className="w-full px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={editingId ? editForm.phone : form.phone}
              onChange={(e) => handleChange(e, !!editingId)}
              placeholder="0801 XXX XXXX"
              className="w-full px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Opening Balance (₦)</label>
            <input
              type="number"
              name="openingBalance"
              value={editingId ? editForm.openingBalance : form.openingBalance}
              onChange={(e) => handleChange(e, !!editingId)}
              step="0.01"
              min="-99999999"
              placeholder="0.00"
              className="w-full px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Positive = customer owes us • Negative = prepaid / we owe customer
            </p>
          </div>

          <div className="md:col-span-3 flex justify-end gap-4 mt-3">
            {editingId && (
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition flex items-center gap-2"
              >
                <X size={16} /> Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center gap-2 shadow-md"
            >
              <Plus size={18} />
              {editingId ? "Save Changes" : "Add Customer"}
            </button>
          </div>
        </form>
      </div>

      {/* Customer List */}
      <div className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-blue-400">Customers & Account Balances</h2>
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or phone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-700/80 text-gray-300 text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Opening Balance</th>
                <th className="px-6 py-4">Current Balance</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredCustomers.map((c) => (
                <tr key={c._id} className="hover:bg-gray-700/40 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-100">
                    {editingId === c._id ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => handleChange(e, true)}
                        className="w-full px-3 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-100"
                      />
                    ) : (
                      c.name
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-200">
                    {editingId === c._id ? (
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => handleChange(e, true)}
                        className="w-full px-3 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-100"
                      />
                    ) : (
                      c.phone
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {editingId === c._id ? (
                      <input
                        type="number"
                        value={editForm.openingBalance}
                        onChange={(e) => handleChange(e, true)}
                        step="0.01"
                        className="w-32 px-3 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-100"
                      />
                    ) : (
                      formatCurrency(c.openingBalance)
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-lg ${getBalanceStyle(c.currentBalance)}`}>
                      {formatCurrency(c.currentBalance)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    {editingId === c._id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(c._id)}
                          className="p-2.5 text-emerald-500 hover:text-emerald-400 transition"
                          title="Save"
                        >
                          <Check size={20} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2.5 text-gray-400 hover:text-gray-200 transition"
                          title="Cancel"
                        >
                          <X size={20} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditStart(c)}
                          className="p-2.5 text-amber-400 hover:text-amber-300 transition"
                          title="Edit"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="p-2.5 text-rose-500 hover:text-rose-400 transition"
                          title="Delete"
                        >
                          <Trash2 size={20} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500 italic">
                    {loading ? "Loading customers..." : "No customers found. Add one above."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-500 text-right">
          Showing {filteredCustomers.length} of {customers.length} customers
        </div>
      </div>
    </div>
  );
}

export default AddView;