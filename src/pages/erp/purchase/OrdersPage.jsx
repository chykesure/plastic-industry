import React, { useState, useEffect } from "react";
import axios from "axios";
import { UserPlus, Edit2, Trash2, X } from "lucide-react";

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

const Modal = ({ title, show, onClose, children }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-emerald-400">{title}</h2>
          <X className="w-5 h-5 cursor-pointer text-gray-400 hover:text-gray-200" onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
};

// -----------------------------
// Orders Page
// -----------------------------
const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({ reference: "", supplier: "", date: "", status: "" });

  const ORDERS_API = "http://localhost:8080/purchases";
  const SUPPLIERS_API = "http://localhost:8080/suppliers";

  // Fetch orders and suppliers on mount
  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(ORDERS_API);
      setOrders(data.map(d => ({ ...d, supplier: d.supplier.name })));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data } = await axios.get(SUPPLIERS_API);
      setSuppliers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddOrder = async () => {
    try {
      const { data } = await axios.post(ORDERS_API, formData);
      setOrders([...orders, { ...data, supplier: data.supplier.name }]);
      setShowAddModal(false);
      setFormData({ reference: "", supplier: "", date: "", status: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (order) => {
    setSelectedOrder(order);
    setFormData({ ...order, supplier: suppliers.find(s => s.name === order.supplier)?._id || "" });
    setShowEditModal(true);
  };

  const handleEditOrder = async () => {
    try {
      const { data } = await axios.put(`${ORDERS_API}/${selectedOrder._id}`, formData);
      setOrders(orders.map(o => (o._id === selectedOrder._id ? { ...data, supplier: data.supplier.name } : o)));
      setShowEditModal(false);
      setSelectedOrder(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOrder = async (id) => {
    try {
      await axios.delete(`${ORDERS_API}/${id}`);
      setOrders(orders.filter(o => o._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-emerald-400">Purchase Orders</h2>
        <Button onClick={() => setShowAddModal(true)} className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Add Order
        </Button>
      </div>

      <Card>
        <CardContent>
          <table className="min-w-full text-gray-300">
            <thead className="border-b border-gray-700 text-gray-400 uppercase text-xs">
              <tr>
                <th className="py-3 text-left">Reference</th>
                <th className="py-3 text-left">Supplier</th>
                <th className="py-3 text-left">Date</th>
                <th className="py-3 text-left">Status</th>
                <th className="py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                  <td className="py-3">{order.reference}</td>
                  <td className="py-3">{order.supplier}</td>
                  <td className="py-3">{new Date(order.date).toLocaleDateString()}</td>
                  <td className="py-3">{order.status}</td>
                  <td className="py-3 text-center flex justify-center gap-3">
                    <Edit2 className="w-4 h-4 text-blue-400 cursor-pointer hover:scale-110 transition-transform" onClick={() => openEditModal(order)} />
                    <Trash2 className="w-4 h-4 text-red-500 cursor-pointer hover:scale-110 transition-transform" onClick={() => handleDeleteOrder(order._id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add Modal */}
      {showAddModal && (
        <Modal title="Add Purchase Order" show={showAddModal} onClose={() => setShowAddModal(false)}>
          <div className="space-y-4">
            <input placeholder="Reference" name="reference" value={formData.reference} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300" />

            <select name="supplier" value={formData.supplier} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300">
              <option value="" disabled>Select Supplier</option>
              {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>

            <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300" />

            <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300">
              <option value="" disabled>Select Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <div className="flex justify-end gap-3 mt-4">
              <Button className="bg-gray-700 hover:bg-gray-600" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddOrder}>Save</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <Modal title="Edit Purchase Order" show={showEditModal} onClose={() => setShowEditModal(false)}>
          <div className="space-y-4">
            <input placeholder="Reference" name="reference" value={formData.reference} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300" />

            <select name="supplier" value={formData.supplier} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300">
              <option value="" disabled>Select Supplier</option>
              {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>

            <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300" />

            <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300">
              <option value="" disabled>Select Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <div className="flex justify-end gap-3 mt-4">
              <Button className="bg-gray-700 hover:bg-gray-600" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleEditOrder}>Update</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrdersPage;
