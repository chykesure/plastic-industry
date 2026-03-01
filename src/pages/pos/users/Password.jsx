import React, { useEffect, useState } from "react";
import CIcon from "@coreui/icons-react";
import { cilLockLocked, cilReload, cilShieldAlt } from "@coreui/icons";
import Swal from "sweetalert2";

function Password() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forceChange, setForceChange] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
        Swal.fire({ icon: "error", title: "Error", text: "Failed to fetch users" });
      }
    };
    fetchUsers();
  }, []);

  // Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Data",
        text: "Please select a user and enter a new password",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/users/reset-password/${selectedUser}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword, forceChange }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");

      Swal.fire({ icon: "success", title: "Success", text: "Password reset successfully", timer: 2000, showConfirmButton: false });
      setSelectedUser("");
      setNewPassword("");
      setForceChange(false);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error", text: err.message || "Server error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-gray-800 rounded-2xl shadow-xl border border-gray-600">
        <div className="bg-blue-700 text-white px-6 py-4 flex items-center gap-2 rounded-t-2xl">
          <CIcon icon={cilLockLocked} className="w-5 h-5" />
          <h1 className="text-lg font-semibold">Password Management</h1>
        </div>

        <div className="p-6 space-y-8 text-gray-200">
          <form className="grid gap-6" onSubmit={handleResetPassword}>
            {/* Select User */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Select User</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Force Change */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="forceChange"
                checked={forceChange}
                onChange={(e) => setForceChange(e.target.checked)}
                className="h-4 w-4 text-blue-500 bg-gray-900 border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="forceChange" className="text-sm text-gray-300">Force password change on next login</label>
            </div>

            {/* Submit */}
            <div className="text-right">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg inline-flex items-center gap-2 shadow-md"
              >
                <CIcon icon={cilReload} className="w-4 h-4" />
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>

          {/* Password Policy */}
          <div>
            <h2 className="text-base font-semibold text-gray-100 flex items-center gap-2 mb-3">
              <CIcon icon={cilShieldAlt} className="w-5 h-5 text-blue-500" />
              Password Policy
            </h2>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Minimum 8 characters</li>
              <li>At least 1 uppercase, 1 number, 1 special character</li>
              <li>Password expires every 90 days</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Password;
