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

const CardContent = ({ children, className = "" }) => <div className={`p-4 ${className}`}>{children}</div>;

const Modal = ({ title, show, onClose, children }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-900 rounded-xl shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-emerald-400">{title}</h3>
          <Button className="bg-red-600 hover:bg-red-700" onClick={onClose}>X</Button>
        </div>
        {children}
      </div>
    </div>
  );
};

// -----------------------------
// RegisterPage Component
// -----------------------------
const RegisterPage = () => {
  const [assets, setAssets] = useState([
    { id: 1, name: "Laptop Dell XPS", type: "IT Equipment", location: "HQ", value: 350000 },
    { id: 2, name: "Office Chair", type: "Furniture", location: "Branch A", value: 45000 },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [formData, setFormData] = useState({ name: "", type: "", location: "", value: "" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddAsset = () => {
    setAssets([...assets, { id: assets.length + 1, ...formData }]);
    setShowAddModal(false);
    setFormData({ name: "", type: "", location: "", value: "" });
  };

  const openEditModal = (asset) => {
    setSelectedAsset(asset);
    setFormData(asset);
    setShowEditModal(true);
  };

  const handleEditAsset = () => {
    setAssets(assets.map((a) => (a.id === selectedAsset.id ? { ...selectedAsset, ...formData } : a)));
    setShowEditModal(false);
    setSelectedAsset(null);
  };

  const handleDeleteAsset = (id) => setAssets(assets.filter((a) => a.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-emerald-400">Assets Register</h2>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Add Asset
        </Button>
      </div>

      <Card>
        <CardContent>
          <table className="min-w-full text-gray-300">
            <thead className="border-b border-gray-700 text-gray-400 uppercase text-xs">
              <tr>
                <th className="py-3 text-left">Name</th>
                <th className="py-3 text-left">Type</th>
                <th className="py-3 text-left">Location</th>
                <th className="py-3 text-right">Value (₦)</th>
                <th className="py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                  <td className="py-3">{a.name}</td>
                  <td className="py-3">{a.type}</td>
                  <td className="py-3">{a.location}</td>
                  <td className="py-3 text-right">{Number(a.value).toLocaleString()}</td>
                  <td className="py-3 text-center flex justify-center gap-3">
                    <Edit2
                      className="w-4 h-4 text-blue-400 cursor-pointer hover:scale-110 transition-transform"
                      onClick={() => openEditModal(a)}
                    />
                    <Trash2
                      className="w-4 h-4 text-red-500 cursor-pointer hover:scale-110 transition-transform"
                      onClick={() => handleDeleteAsset(a.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add Modal */}
      {showAddModal && (
        <Modal title="Add Asset" show={showAddModal} onClose={() => setShowAddModal(false)}>
          <div className="space-y-4">
            <input
              name="name"
              placeholder="Asset Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300"
            />
            <input
              name="type"
              placeholder="Asset Type"
              value={formData.type}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300"
            />
            <input
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300"
            />
            <input
              name="value"
              type="number"
              placeholder="Value"
              value={formData.value}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300"
            />
            <div className="flex justify-end gap-3 mt-4">
              <Button className="bg-gray-700 hover:bg-gray-600" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddAsset}>
                Save
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <Modal title="Edit Asset" show={showEditModal} onClose={() => setShowEditModal(false)}>
          <div className="space-y-4">
            <input
              name="name"
              placeholder="Asset Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300"
            />
            <input
              name="type"
              placeholder="Asset Type"
              value={formData.type}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300"
            />
            <input
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300"
            />
            <input
              name="value"
              type="number"
              placeholder="Value"
              value={formData.value}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300"
            />
            <div className="flex justify-end gap-3 mt-4">
              <Button className="bg-gray-700 hover:bg-gray-600" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleEditAsset}>
                Update
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RegisterPage;
