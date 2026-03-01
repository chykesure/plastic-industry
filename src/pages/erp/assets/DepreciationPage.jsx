import React, { useState } from "react";
import { Edit2, Trash2 } from "lucide-react";

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

const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-lg">
        <h3 className="text-xl font-semibold text-emerald-400 mb-4">{title}</h3>
        {children}
        <div className="mt-4 flex justify-end">
          <Button className="bg-gray-700 hover:bg-gray-600 mr-2" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

// -----------------------------
// Depreciation Page
// -----------------------------
const DepreciationPage = () => {
  const [assets, setAssets] = useState([
    { id: 1, name: "Laptop Dell XPS", purchaseValue: 400000, currentValue: 300000, depreciationRate: "25%" },
    { id: 2, name: "Office Chair", purchaseValue: 50000, currentValue: 40000, depreciationRate: "20%" },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [formData, setFormData] = useState({ name: "", purchaseValue: "", currentValue: "", depreciationRate: "" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddAsset = () => {
    setAssets([...assets, { id: assets.length + 1, ...formData }]);
    setFormData({ name: "", purchaseValue: "", currentValue: "", depreciationRate: "" });
    setShowAddModal(false);
  };

  const openEditModal = (asset) => {
    setSelectedAsset(asset);
    setFormData(asset);
    setShowEditModal(true);
  };

  const handleEditAsset = () => {
    setAssets(assets.map(a => (a.id === selectedAsset.id ? { ...selectedAsset, ...formData } : a)));
    setShowEditModal(false);
    setSelectedAsset(null);
  };

  const handleDelete = (id) => setAssets(assets.filter(a => a.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-emerald-400">Depreciation</h2>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowAddModal(true)}>Add Asset</Button>
      </div>

      <Card>
        <CardContent>
          <table className="min-w-full text-gray-300">
            <thead className="border-b border-gray-700 text-gray-400 uppercase text-xs">
              <tr>
                <th className="py-3 text-left">Asset Name</th>
                <th className="py-3 text-left">Purchase Value</th>
                <th className="py-3 text-left">Current Value</th>
                <th className="py-3 text-left">Depreciation Rate</th>
                <th className="py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                  <td className="py-3">{asset.name}</td>
                  <td className="py-3">₦{Number(asset.purchaseValue).toLocaleString()}</td>
                  <td className="py-3">₦{Number(asset.currentValue).toLocaleString()}</td>
                  <td className="py-3">{asset.depreciationRate}</td>
                  <td className="py-3 flex justify-center gap-3">
                    <Edit2 className="w-4 h-4 text-blue-400 cursor-pointer hover:scale-110 transition-transform" onClick={() => openEditModal(asset)} />
                    <Trash2 className="w-4 h-4 text-red-500 cursor-pointer hover:scale-110 transition-transform" onClick={() => handleDelete(asset.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add/Edit Modals */}
      {showAddModal && (
        <Modal title="Add Asset" show={showAddModal} onClose={() => setShowAddModal(false)}>
          <div className="space-y-4">
            <input name="name" placeholder="Asset Name" value={formData.name} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300" />
            <input name="purchaseValue" placeholder="Purchase Value" type="number" value={formData.purchaseValue} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300" />
            <input name="currentValue" placeholder="Current Value" type="number" value={formData.currentValue} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300" />
            <input name="depreciationRate" placeholder="Depreciation Rate (%)" value={formData.depreciationRate} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300" />
            <div className="flex justify-end gap-3 mt-4">
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddAsset}>Save</Button>
            </div>
          </div>
        </Modal>
      )}

      {showEditModal && (
        <Modal title="Edit Asset" show={showEditModal} onClose={() => setShowEditModal(false)}>
          <div className="space-y-4">
            <input name="name" placeholder="Asset Name" value={formData.name} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300" />
            <input name="purchaseValue" placeholder="Purchase Value" type="number" value={formData.purchaseValue} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300" />
            <input name="currentValue" placeholder="Current Value" type="number" value={formData.currentValue} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300" />
            <input name="depreciationRate" placeholder="Depreciation Rate (%)" value={formData.depreciationRate} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300" />
            <div className="flex justify-end gap-3 mt-4">
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleEditAsset}>Update</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DepreciationPage;
