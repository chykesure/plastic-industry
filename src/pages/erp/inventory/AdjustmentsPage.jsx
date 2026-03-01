import React, { useState } from "react";
import { UserPlus, Edit2, Trash2 } from "lucide-react";

// -----------------------------
// Inline UI Components
// -----------------------------
const Button = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`px-4 py-2 rounded-lg text-white font-medium shadow-sm transition ${className}`}
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl shadow-md border border-gray-700 bg-gray-800 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

// -----------------------------
// Adjustments Page
// -----------------------------
const AdjustmentsPage = () => {
  const [adjustments, setAdjustments] = useState([
    { id: 1, item: "Product A", type: "Addition", quantity: 10, reason: "Restock" },
    { id: 2, item: "Product B", type: "Subtraction", quantity: 5, reason: "Damaged" },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);
  const [formData, setFormData] = useState({ item: "", type: "Addition", quantity: "", reason: "" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddAdjustment = () => {
    setAdjustments([...adjustments, { id: adjustments.length + 1, ...formData }]);
    setFormData({ item: "", type: "Addition", quantity: "", reason: "" });
    setShowAddModal(false);
  };

  const openEditModal = (adjustment) => {
    setSelectedAdjustment(adjustment);
    setFormData(adjustment);
    setShowEditModal(true);
  };

  const handleEditAdjustment = () => {
    setAdjustments(
      adjustments.map((a) =>
        a.id === selectedAdjustment.id ? { ...selectedAdjustment, ...formData } : a
      )
    );
    setSelectedAdjustment(null);
    setShowEditModal(false);
  };

  const handleDelete = (id) => setAdjustments(adjustments.filter((a) => a.id !== id));

  const filteredAdjustments = adjustments.filter((a) =>
    a.item.toLowerCase().includes(formData.item.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-semibold text-emerald-400">Inventory Adjustments</h2>
        <Button className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2" onClick={() => setShowAddModal(true)}>
          <UserPlus className="w-4 h-4" /> Add Adjustment
        </Button>
      </div>

      {/* Adjustments Table */}
      <Card>
        <CardContent>
          <table className="min-w-full text-gray-300">
            <thead className="border-b border-gray-700 text-gray-400 text-xs uppercase">
              <tr>
                <th className="py-3 text-left">Item</th>
                <th className="py-3 text-left">Type</th>
                <th className="py-3 text-left">Quantity</th>
                <th className="py-3 text-left">Reason</th>
                <th className="py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {adjustments.length > 0 ? (
                adjustments.map((a) => (
                  <tr key={a.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                    <td className="py-3">{a.item}</td>
                    <td className="py-3">{a.type}</td>
                    <td className="py-3">{a.quantity}</td>
                    <td className="py-3">{a.reason}</td>
                    <td className="py-3 flex justify-center gap-3">
                      <Edit2
                        className="w-4 h-4 text-blue-400 cursor-pointer"
                        onClick={() => openEditModal(a)}
                      />
                      <Trash2
                        className="w-4 h-4 text-red-500 cursor-pointer"
                        onClick={() => handleDelete(a.id)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    No adjustments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add Modal */}
      {showAddModal && (
        <Card className="fixed inset-0 z-50 flex items-center justify-center bg-transparent/70">
          <CardContent className="bg-gray-900 rounded-xl w-full max-w-md space-y-4">
            <h3 className="text-xl font-semibold text-emerald-400">Add Adjustment</h3>
            <input
              placeholder="Item Name"
              name="item"
              value={formData.item}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300"
            />
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300"
            >
              <option value="Addition">Addition</option>
              <option value="Subtraction">Subtraction</option>
            </select>
            <input
              type="number"
              placeholder="Quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300"
            />
            <input
              placeholder="Reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300"
            />
            <div className="flex justify-end gap-3 mt-4">
              <Button className="bg-gray-700 hover:bg-gray-600" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddAdjustment}>Save</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <Card className="fixed inset-0 z-50 flex items-center justify-center bg-transparent/70">
          <CardContent className="bg-gray-900 rounded-xl w-full max-w-md space-y-4">
            <h3 className="text-xl font-semibold text-emerald-400">Edit Adjustment</h3>
            <input
              placeholder="Item Name"
              name="item"
              value={formData.item}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300"
            />
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300"
            >
              <option value="Addition">Addition</option>
              <option value="Subtraction">Subtraction</option>
            </select>
            <input
              type="number"
              placeholder="Quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300"
            />
            <input
              placeholder="Reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300"
            />
            <div className="flex justify-end gap-3 mt-4">
              <Button className="bg-gray-700 hover:bg-gray-600" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleEditAdjustment}>Update</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdjustmentsPage;
