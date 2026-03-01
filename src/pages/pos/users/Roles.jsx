import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

function Roles() {
  const [roles, setRoles] = useState([]);
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [allPermissions] = useState([
    "View Reports",
    "Manage Customers",
    "Process Sales",
    "Refund Items",
    "Manage Users",
  ]);
  const [loading, setLoading] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);

  // Fetch existing roles from backend
  const fetchRoles = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/roles");
      const data = await res.json();
      if (res.ok) setRoles(data);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to fetch roles" });
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Toggle permission selection
  const togglePermission = (perm) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  // Handle form submission (create or update role)
  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!roleName || permissions.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Data",
        text: "Please provide role name and select at least one permission",
      });
      return;
    }

    setLoading(true);
    try {
      const method = editingRoleId ? "PUT" : "POST";
      const url = editingRoleId ? `http://localhost:8080/api/roles/${editingRoleId}` : "/api/roles";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roleName, permissions }),
      });

      const data = await res.json();

      if (!res.ok) {
        Swal.fire({ icon: "error", title: "Error", text: data.message || "Failed to save role" });
      } else {
        Swal.fire({
          icon: "success",
          title: editingRoleId ? "Role updated" : "Role saved",
          timer: 2000,
          showConfirmButton: false,
        });
        setRoleName("");
        setPermissions([]);
        setEditingRoleId(null);
        fetchRoles();
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Server Error", text: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  // Handle role deletion
  const handleDeleteRole = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the role permanently",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:8080/api/roles/${id}`, { method: "DELETE" });
      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: "Role deleted successfully",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchRoles();
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to delete role" });
    }
  };

  // Handle role edit
  const handleEditRole = (role) => {
    setRoleName(role.name);
    setPermissions(role.permissions);
    setEditingRoleId(role._id);
  };

  return (
    <div className="w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto bg-gray-800 text-gray-100 shadow-2xl rounded-2xl p-8 border border-gray-700">
        {/* Header */}
        <h1 className="text-3xl font-bold text-white border-b border-gray-700 pb-4 mb-8">
          Role Management
        </h1>

        {/* Form Section */}
        <form className="space-y-8" onSubmit={handleSaveRole}>
          {/* Role Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Role Name</label>
            <input
              type="text"
              placeholder="e.g. Cashier"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">Enter a descriptive name for the role.</p>
          </div>

          {/* Permissions */}
          <div>
            <p className="font-semibold text-gray-200 mb-3">Permissions</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {allPermissions.map((perm) => (
                <label
                  key={perm}
                  className="flex items-center space-x-2 p-3 bg-gray-700/60 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 transition"
                >
                  <input
                    type="checkbox"
                    checked={permissions.includes(perm)}
                    onChange={() => togglePermission(perm)}
                    className="h-4 w-4 text-blue-500 border-gray-500 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm">{perm}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-md transition"
            >
              {loading ? "Saving..." : editingRoleId ? "Update Role" : "Save Role"}
            </button>
          </div>
        </form>

        {/* Divider */}
        <hr className="my-10 border-gray-700" />

        {/* Roles Table */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Existing Roles</h2>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-700/80 text-gray-300 text-sm font-medium">
                <tr>
                  <th className="text-left py-3 px-4 border-b border-gray-600">Role</th>
                  <th className="text-left py-3 px-4 border-b border-gray-600">Permissions</th>
                  <th className="text-left py-3 px-4 border-b border-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {roles.map((role) => (
                  <tr key={role._id} className="hover:bg-gray-700/60 transition">
                    <td className="py-3 px-4 border-b border-gray-700 font-medium text-white">{role.name}</td>
                    <td className="py-3 px-4 border-b border-gray-700">
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.map((perm) => (
                          <span
                            key={perm}
                            className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-700 space-x-2">
                      <button
                        onClick={() => handleEditRole(role)}
                        className="px-3 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role._id)}
                        className="px-3 py-1 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-md transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Roles;
