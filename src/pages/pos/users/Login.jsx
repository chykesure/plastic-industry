import React, { useEffect, useState } from "react";
import {
  cilUser,
  cilSave,
  cilPencil,
  cilTrash,
  cilCheckCircle,
  cilFilter,
} from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import Swal from "sweetalert2";

function Login() {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Select Role");
  const [status, setStatus] = useState("Active");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState("");


  // Fetch users from backend
  // Inside your component
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/users", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (res.ok) {
        setUsers(Array.isArray(data) ? data : [data]);
      } else {
        console.error("Fetch users failed:", data.message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to fetch users",
        });
        setUsers([]);
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Unable to fetch users",
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };


  // Filter safely
  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole
      ? u.role?.name?.toLowerCase() === filterRole.toLowerCase()
      : true;
    return matchesSearch && matchesRole;
  });


  useEffect(() => {
    fetchUsers();
  }, []);

  // Add User
  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!email || role === "Select Role" || !status) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Data",
        text: "Please fill all fields correctly",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, status }),
      });

      const data = await res.json();
      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to add user",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "User added successfully",
          timer: 2000,
          showConfirmButton: false,
        });
        setEmail("");
        setRole("Select Role");
        setStatus("Active");
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditEmail(user.email);
    setEditRole(user.role?.name || "");
    setEditStatus(user.status);
  };


  const handleUpdateUser = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://localhost:8080/api/users/${editingUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: editEmail,
          role: editRole,
          status: editStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Swal.fire("Error", data.message || "Failed to update user", "error");
        return;
      }

      Swal.fire("Updated", "User updated successfully", "success");
      setEditingUser(null);
      fetchUsers();

    } catch (error) {
      Swal.fire("Error", "Server error", "error");
    }
  };


  // Delete User
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the user permanently",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:8080/api/users/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          Swal.fire({
            icon: "success",
            title: "Deleted",
            text: "User deleted successfully",
            timer: 2000,
            showConfirmButton: false,
          });
          fetchUsers();
        }
      } catch (err) {
        console.error(err);
        Swal.fire({ icon: "error", title: "Error", text: "Failed to delete" });
      }
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 space-y-8 text-gray-100">
      {/* Add / Manage User Form */}
      <div className="w-full bg-gray-800 shadow-xl rounded-2xl border border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center font-semibold">
          <CIcon icon={cilUser} className="w-5 h-5 mr-2" />
          Add / Manage User Login
        </div>
        <div className="p-6">
          <form
            onSubmit={handleAddUser}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Username
              </label>
              <input
                type="text"
                placeholder="e.g. pascal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-600 bg-gray-700 text-gray-100 rounded-lg px-3 py-2 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Assign Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-gray-600 bg-gray-700 text-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option>Select Role</option>
                <option>Super-Admin</option>
                <option>Admin</option>
                <option>Cashier</option>
                <option>Manager</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-600 bg-gray-700 text-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>

            <div className="col-span-1 md:col-span-3 text-right">
              <button
                type="submit"
                disabled={loading}
                className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg inline-flex items-center gap-2 shadow-lg transition ${loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
              >
                <CIcon icon={cilSave} className="w-4 h-4" />
                {loading ? "Saving..." : "Save User"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Users Table */}
      <div className="w-full bg-gray-800 shadow-xl rounded-2xl border border-gray-700 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-4 bg-gray-700/60 border-b border-gray-700 gap-3">
          <span className="font-semibold text-white">User Accounts</span>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <div className="flex items-center border border-gray-600 rounded-lg overflow-hidden bg-gray-700 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-2 w-full bg-transparent text-gray-100 focus:outline-none placeholder-gray-400"
              />
            </div>

            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-100"
            >
              <option value="Super-Admin">Super-Admin</option>
              <option value="Admin">Admin</option>
              <option value="Cashier">Cashier</option>
              <option value="Manager">Manager</option>
            </select>


            <button
              className="bg-gray-600 hover:bg-gray-500 text-gray-100 font-medium px-4 py-2 rounded-lg inline-flex items-center gap-2 w-full md:w-auto transition"
              onClick={() => fetchUsers()}
            >
              <CIcon icon={cilFilter} className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-gray-200">
            <thead className="bg-gray-700 text-left text-gray-300">
              <tr>
                <th className="px-6 py-3">Username</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="text-center py-4">Loading...</td>
                </tr>
              )}

              {!loading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4">No users found</td>
                </tr>
              )}

              {!loading &&
                filteredUsers.map((user) => (
                  <tr key={user._id} className="border-t border-gray-700 hover:bg-gray-700/50 transition">
                    <td className="px-6 py-3">{user.email || "N/A"}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === "Super-Admin"
                          ? "bg-purple-600/20 text-purple-400"
                          : user.role === "Admin"
                            ? "bg-blue-600/20 text-blue-400"
                            : user.role === "Cashier"
                              ? "bg-green-600/20 text-green-400"
                              : "bg-yellow-600/20 text-yellow-400"
                          }`}
                      >
                        {user.role || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${user.status === "Active"
                          ? "bg-green-600/20 text-green-400"
                          : "bg-red-600/20 text-red-400"
                          }`}
                      >
                        {user.status || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-3 flex justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-2 bg-blue-600/20 hover:bg-blue-600/40 rounded-lg text-blue-400"
                      >
                        <CIcon icon={cilPencil} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="p-2 bg-red-600/20 hover:bg-red-600/40 rounded-lg text-red-400"
                      >
                        <CIcon icon={cilTrash} className="w-4 h-4" />
                      </button>

                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {editingUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md border border-gray-700 shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-4">Edit User</h2>

              <form onSubmit={handleUpdateUser} className="space-y-4">

                <div>
                  <label className="text-gray-300 text-sm">Username</label>
                  <input
                    type="text"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-100"
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm">Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-100"
                  >
                    <option>Super-Admin</option>
                    <option>Admin</option>
                    <option>Cashier</option>
                    <option>Manager</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 text-sm">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-100"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 rounded-lg bg-gray-600 text-gray-200 hover:bg-gray-500"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                  >
                    <CIcon icon={cilSave} className="w-4 h-4" /> Update
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
