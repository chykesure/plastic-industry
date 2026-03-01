import React, { useState } from "react";
import { Edit2, Trash2, Calendar } from "lucide-react";

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
    <div className={`p-4 overflow-x-auto ${className}`}>{children}</div>
);

const Modal = ({ show, onClose, title, children }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-lg">
                <h3 className="text-xl font-semibold text-emerald-400 mb-4">{title}</h3>
                {children}
                <div className="mt-4 flex justify-end">
                    <Button className="bg-gray-700 hover:bg-gray-600" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
};

// -----------------------------
// Maintenance Page
// -----------------------------
const MaintenancePage = () => {
    const [records, setRecords] = useState([
        { id: 1, asset: "Laptop Dell XPS", issue: "Battery replacement", scheduledDate: "2025-11-01" },
        { id: 2, asset: "Air Conditioner", issue: "Filter cleaning", scheduledDate: "2025-11-05" },
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [formData, setFormData] = useState({ asset: "", issue: "", scheduledDate: "" });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleAddRecord = () => {
        setRecords([...records, { id: records.length + 1, ...formData }]);
        setFormData({ asset: "", issue: "", scheduledDate: "" });
        setShowAddModal(false);
    };

    const openEditModal = (record) => {
        setSelectedRecord(record);
        setFormData(record);
        setShowEditModal(true);
    };

    const handleEditRecord = () => {
        setRecords(records.map((r) => (r.id === selectedRecord.id ? { ...selectedRecord, ...formData } : r)));
        setShowEditModal(false);
        setSelectedRecord(null);
    };

    const handleDelete = (id) => setRecords(records.filter((r) => r.id !== id));

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-emerald-400">Maintenance</h2>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowAddModal(true)}>
                    Add Record
                </Button>
            </div>

            {/* Records Table */}
            <Card>
                <CardContent>
                    <table className="min-w-full table-auto border-collapse text-gray-300">
                        <thead className="bg-gray-900 border-b border-gray-700 text-gray-400 uppercase text-xs">
                            <tr>
                                <th className="py-3 px-4 text-left w-1/4">Asset</th>
                                <th className="py-3 px-4 text-left w-1/3">Issue</th>
                                <th className="py-3 px-4 text-left w-1/4">Scheduled Date</th>
                                <th className="py-3 px-4 text-center w-1/6">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((r) => (
                                <tr
                                    key={r.id}
                                    className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors"
                                >
                                    <td className="py-3 px-4 align-middle">{r.asset}</td>
                                    <td className="py-3 px-4 align-middle">{r.issue}</td>
                                    <td className="py-3 px-4 flex items-center gap-2 align-middle">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        {r.scheduledDate}
                                    </td>
                                    <td className="py-3 px-4 align-middle">
                                        <div className="flex items-center justify-center gap-3">
                                            <Edit2
                                                className="w-5 h-5 text-blue-400 cursor-pointer hover:scale-110 transition-transform"
                                                onClick={() => openEditModal(r)}
                                            />
                                            <Trash2
                                                className="w-5 h-5 text-red-500 cursor-pointer hover:scale-110 transition-transform"
                                                onClick={() => handleDelete(r.id)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Add Modal */}
            {showAddModal && (
                <Modal title="Add Maintenance Record" show={showAddModal} onClose={() => setShowAddModal(false)}>
                    <div className="space-y-4">
                        <input
                            name="asset"
                            placeholder="Asset Name"
                            value={formData.asset}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300"
                        />
                        <input
                            name="issue"
                            placeholder="Issue Description"
                            value={formData.issue}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300"
                        />
                        <input
                            name="scheduledDate"
                            type="date"
                            value={formData.scheduledDate}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300"
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddRecord}>
                                Save
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <Modal title="Edit Maintenance Record" show={showEditModal} onClose={() => setShowEditModal(false)}>
                    <div className="space-y-4">
                        <input
                            name="asset"
                            placeholder="Asset Name"
                            value={formData.asset}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300"
                        />
                        <input
                            name="issue"
                            placeholder="Issue Description"
                            value={formData.issue}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300"
                        />
                        <input
                            name="scheduledDate"
                            type="date"
                            value={formData.scheduledDate}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300"
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleEditRecord}>
                                Update
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default MaintenancePage;
