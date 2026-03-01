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
          <Button className="bg-gray-700 hover:bg-gray-600" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

// -----------------------------
// Roles Page
// -----------------------------
const RolesPage = () => {
  const [roles, setRoles] = useState([
    { id: 1, name: "Admin", permissions: ["Manage Users", "View Reports", "Manage Assets"] },
    { id: 2, name: "HR Manager", permissions: ["Manage Employees", "View Payroll"] },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({ name: "", permissions: [] });

  const permissionOptions = [
    "Manage Users",
    "View Reports",
    "Manage Assets",
    "Manage Employees",
    "View Payroll",
    "Manage Inventory",
  ];

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === "permissions") {
      if (checked) {
        setFormData({ ...formData, permissions: [...formData.permissions, value] });
      } else {
        setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== value) });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddRole = () => {
    setRoles([...roles, { id: roles.length + 1, ...formData }]);
    setFormData({ name: "", permissions: [] });
    setShowAddModal(false);
  };

  const openEditModal = (role) => {
    setSelectedRole(role);
    setFormData(role);
    setShowEditModal(true);
  };

  const handleEditRole = () => {
    setRoles(roles.map(r => (r.id === selectedRole.id ? { ...selectedRole, ...formData } : r)));
    setShowEditModal(false);
    setSelectedRole(null);
  };

  const handleDeleteRole = (id) => setRoles(roles.filter(r => r.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-emerald-400">Roles & Permissions</h2>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowAddModal(true)}>
          Add Role
        </Button>
      </div>

      <Card>
        <CardContent>
          <table className="min-w-full text-gray-300">
            <thead className="border-b border-gray-700 text-gray-400 uppercase text-xs">
              <tr>
                <th className="py-3 text-left">Role</th>
                <th className="py-3 text-left">Permissions</th>
                <th className="py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                  <td className="py-3">{r.name}</td>
                  <td className="py-3">
                    {r.permissions.map((p, idx) => (
                      <span key={idx} className="inline-block bg-gray-700 text-gray-300 px-2 py-1 rounded-full mr-1 text-xs">
                        {p}
                      </span>
                    ))}
                  </td>
                  <td className="py-3 flex justify-center gap-3">
                    <Edit2 className="w-4 h-4 text-blue-400 cursor-pointer hover:scale-110 transition-transform" onClick={() => openEditModal(r)} />
                    <Trash2 className="w-4 h-4 text-red-500 cursor-pointer hover:scale-110 transition-transform" onClick={() => handleDeleteRole(r.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add/Edit Modals */}
      {showAddModal && (
        <Modal title="Add Role" show={showAddModal} onClose={() => setShowAddModal(false)}>
          <div className="space-y-4">
            <input name="name" placeholder="Role Name" value={formData.name} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300" />
            <div className="flex flex-wrap gap-2">
              {permissionOptions.map((p) => (
                <label key={p} className="flex items-center gap-1 text-gray-300 text-sm">
                  <input type="checkbox" name="permissions" value={p} checked={formData.permissions.includes(p)} onChange={handleChange} />
                  {p}
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddRole}>Save</Button>
            </div>
          </div>
        </Modal>
      )}

      {showEditModal && (
        <Modal title="Edit Role" show={showEditModal} onClose={() => setShowEditModal(false)}>
          <div className="space-y-4">
            <input name="name" placeholder="Role Name" value={formData.name} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300" />
            <div className="flex flex-wrap gap-2">
              {permissionOptions.map((p) => (
                <label key={p} className="flex items-center gap-1 text-gray-300 text-sm">
                  <input type="checkbox" name="permissions" value={p} checked={formData.permissions.includes(p)} onChange={handleChange} />
                  {p}
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleEditRole}>Update</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RolesPage;
