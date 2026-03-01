import React, { useState } from "react";

function Suppliers() {
    const [suppliers, setSuppliers] = useState([
        { id: 1, name: "Dairy Co.", contact: "John Doe", email: "john@dairyco.com", phone: "08012345678", address: "Lagos" },
        { id: 2, name: "Bakery Supplies", contact: "Jane Smith", email: "jane@bakerysup.com", phone: "08087654321", address: "Abuja" },
        { id: 3, name: "Egg Farmers Ltd.", contact: "Mike Brown", email: "mike@eggfarmers.com", phone: "08098765432", address: "Port Harcourt" },
    ]);

    // Modals
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [modalSupplier, setModalSupplier] = useState({ name: "", contact: "", email: "", phone: "", address: "" });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [supplierToDelete, setSupplierToDelete] = useState(null);

    // Toast
    const [toast, setToast] = useState({ message: "", show: false, type: "success" });

    const openAddModal = () => {
        setModalSupplier({ name: "", contact: "", email: "", phone: "", address: "" });
        setEditingSupplier(null);
        setShowModal(true);
    };

    const openEditModal = (supplier) => {
        setModalSupplier({ ...supplier });
        setEditingSupplier(supplier);
        setShowModal(true);
    };

    const saveSupplier = () => {
        if (!modalSupplier.name.trim()) return;

        if (editingSupplier) {
            setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? modalSupplier : s));
            showToast("Supplier updated successfully!");
        } else {
            setSuppliers([...suppliers, { ...modalSupplier, id: Date.now() }]);
            showToast("Supplier added successfully!");
        }

        setShowModal(false);
        setEditingSupplier(null);
        setModalSupplier({ name: "", contact: "", email: "", phone: "", address: "" });
    };

    const confirmDeleteSupplier = (supplier) => {
        setSupplierToDelete(supplier);
        setShowDeleteConfirm(true);
    };

    const showToast = (message, type = "success") => {
        setToast({ message, show: true, type });
        setTimeout(() => setToast({ message: "", show: false, type }), 3000);
    };

    // Inside your Suppliers component
    const [deleteReason, setDeleteReason] = useState("");

    const deleteSupplier = () => {
        if (!deleteReason.trim()) return; // just a safeguard
        setSuppliers(suppliers.filter(s => s.id !== supplierToDelete.id));
        showToast(`Supplier deleted. Reason: ${deleteReason}`);
        setShowDeleteConfirm(false);
        setSupplierToDelete(null);
        setDeleteReason(""); // reset reason
    };


    return (
        <div className="flex flex-col h-full gap-4 p-4 relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-green-400">Suppliers</h2>
                <button onClick={openAddModal} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md">
                    Add Supplier
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl bg-gray-800 p-4 border border-gray-700 shadow-lg">
                <table className="min-w-full table-fixed border-collapse">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-4 py-2 border-b border-gray-700 text-left w-2/6">Supplier Name</th>
                            <th className="px-4 py-2 border-b border-gray-700 text-left w-1/6">Contact</th>
                            <th className="px-4 py-2 border-b border-gray-700 text-left w-1/6">Email</th>
                            <th className="px-4 py-2 border-b border-gray-700 text-left w-1/6">Phone</th>
                            <th className="px-4 py-2 border-b border-gray-700 text-left w-1/6">Address</th>
                            <th className="px-4 py-2 border-b border-gray-700 text-center w-1/6">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {suppliers.map(s => (
                            <tr key={s.id} className="hover:bg-gray-700">
                                <td className="px-4 py-2 break-words">{s.name}</td>
                                <td className="px-4 py-2 break-words">{s.contact}</td>
                                <td className="px-4 py-2 break-words">{s.email}</td>
                                <td className="px-4 py-2 break-words">{s.phone}</td>
                                <td className="px-4 py-2 whitespace-normal">{s.address}</td>
                                <td className="px-4 py-2 flex justify-center gap-2">
                                    <button className="p-1 rounded hover:bg-gray-700" onClick={() => openEditModal(s)}>
                                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6 6L21 9l-6-6-6 6z" />
                                        </svg>
                                    </button>
                                    <button className="p-1 rounded hover:bg-gray-700" onClick={() => confirmDeleteSupplier(s)}>
                                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7L5 7m5 0v12m4-12v12M6 7l1-3h10l1 3M4 7h16" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-50 z-50">
                    <div className="bg-gray-900 p-6 rounded-xl w-96 shadow-lg">
                        <h3 className="text-lg font-semibold text-green-400 mb-4">
                            {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
                        </h3>
                        <div className="flex flex-col gap-3">
                            {["name", "contact", "email", "phone", "address"].map(field => (
                                <input
                                    key={field}
                                    className="px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                    value={modalSupplier[field]}
                                    onChange={e => setModalSupplier({ ...modalSupplier, [field]: e.target.value })}
                                />
                            ))}
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={() => { setShowModal(false); setEditingSupplier(null); }} className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white">Cancel</button>
                            <button onClick={saveSupplier} className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white">Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-50 z-50">
                    <div className="bg-gray-900 p-6 rounded-xl w-80 shadow-lg text-center">
                        <h3 className="text-lg font-semibold text-red-400 mb-4">Confirm Delete</h3>
                        <p className="text-white mb-2">
                            Are you sure you want to delete <strong>{supplierToDelete.name}</strong>?
                        </p>
                        <p className="text-white mb-4 text-sm">Please provide a reason for deletion:</p>
                        <input
                            type="text"
                            className="w-full px-3 py-2 mb-4 rounded bg-gray-800 border border-gray-700 text-white"
                            placeholder="Enter reason..."
                            value={deleteReason}
                            onChange={e => setDeleteReason(e.target.value)}
                        />
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => { setShowDeleteConfirm(false); setDeleteReason(""); }}
                                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={deleteSupplier}
                                disabled={!deleteReason.trim()}
                                className={`px-4 py-2 rounded text-white ${deleteReason.trim() ? "bg-red-500 hover:bg-red-600" : "bg-gray-600 cursor-not-allowed"}`}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast.show && (
                <div className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg transition-opacity duration-500 ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}

export default Suppliers;
