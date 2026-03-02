import React, { useState } from "react";
import { UserPlus, Edit2, Trash2, Search, X } from "lucide-react";

// -----------------------------
// Reusable Components
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
// Modal Component
// -----------------------------
const Modal = ({ title, show, onClose, children }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg p-6 shadow-2xl animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-emerald-400">{title}</h3>
          <X
            onClick={onClose}
            className="w-5 h-5 text-gray-400 hover:text-red-400 cursor-pointer transition"
          />
        </div>
        {children}
      </div>
    </div>
  );
};

// -----------------------------
// Main Employees Page
// -----------------------------
const Employees = () => {
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState([
    { id: 1, name: "John Doe", department: "Finance", role: "Accountant", email: "john@erp.com" },
    { id: 2, name: "Sarah Johnson", department: "HR", role: "HR Manager", email: "sarah@erp.com" },
    { id: 3, name: "Michael Brown", department: "IT", role: "Software Engineer", email: "michael@erp.com" },
    { id: 4, name: "Emily Clark", department: "Marketing", role: "Brand Manager", email: "emily@erp.com" },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    role: "",
    email: "",
  });

  // Handle Search
  const filtered = employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase())
  );

  // Handle Input Changes
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Add Employee
  const handleAddEmployee = () => {
    const newEmployee = {
      id: employees.length + 1,
      ...formData,
    };
    setEmployees([...employees, newEmployee]);
    setShowAddModal(false);
    setFormData({ name: "", department: "", role: "", email: "" });
  };

  // Edit Employee
  const handleEditEmployee = () => {
    setEmployees(
      employees.map((emp) =>
        emp.id === selectedEmployee.id ? { ...selectedEmployee, ...formData } : emp
      )
    );
    setShowEditModal(false);
    setSelectedEmployee(null);
  };

  // Open Edit Modal
  const openEditModal = (emp) => {
    setSelectedEmployee(emp);
    setFormData(emp);
    setShowEditModal(true);
  };

  // Delete Employee
  const handleDelete = (id) => {
    setEmployees(employees.filter((emp) => emp.id !== id));
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-200">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-semibold text-emerald-400 tracking-tight">
          Employee Directory
        </h2>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Add Employee
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
      </div>

      {/* Employee Table */}
      <Card>
        <CardContent>
          <table className="min-w-full text-sm text-gray-300">
            <thead className="border-b border-gray-700 text-gray-400 uppercase tracking-wide text-xs">
              <tr>
                <th className="py-3 text-left">Name</th>
                <th className="py-3 text-left">Department</th>
                <th className="py-3 text-left">Role</th>
                <th className="py-3 text-left">Email</th>
                <th className="py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((emp) => (
                  <tr
                    key={emp.id}
                    className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="py-3">{emp.name}</td>
                    <td className="py-3">{emp.department}</td>
                    <td className="py-3">{emp.role}</td>
                    <td className="py-3">{emp.email}</td>
                    <td className="py-3 flex justify-center gap-3">
                      <Edit2
                        onClick={() => openEditModal(emp)}
                        className="w-4 h-4 text-blue-400 cursor-pointer hover:scale-110 transition-transform"
                      />
                      <Trash2
                        onClick={() => handleDelete(emp.id)}
                        className="w-4 h-4 text-red-500 cursor-pointer hover:scale-110 transition-transform"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add Employee Modal */}
      <Modal
        title="Add New Employee"
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
      >
        <div className="space-y-4">
          <input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <input
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />

          {/* Role Dropdown */}
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="" disabled>
              Select Role
            </option>
            <option value="Super-Admin">Super-Admin</option>
            <option value="Manager">Manager</option>
            <option value="Cashier">Cashier</option>
          </select>

          <input
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />

          <div className="flex justify-end gap-3 mt-4">
            <Button
              onClick={() => setShowAddModal(false)}
              className="bg-gray-700 hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddEmployee}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        title="Edit Employee"
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
      >
        <div className="space-y-4">
          <input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <input
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />

          {/* Role Dropdown */}
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="" disabled>
              Select Role
            </option>
            <option value="Super-Admin">Super-Admin</option>
            <option value="Manager">Manager</option>
            <option value="Cashier">Cashier</option>
          </select>

          <input
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />

          <div className="flex justify-end gap-3 mt-4">
            <Button
              onClick={() => setShowEditModal(false)}
              className="bg-gray-700 hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditEmployee}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Update
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Employees;
