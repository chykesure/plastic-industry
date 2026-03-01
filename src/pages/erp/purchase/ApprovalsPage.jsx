import React, { useState, useEffect } from "react";
import axios from "axios";
import { Check, X, Eye } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-emerald-400">{title}</h2>
          <X className="w-5 h-5 cursor-pointer text-gray-400 hover:text-gray-200" onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
};

// -----------------------------
// Approvals Page Component
// -----------------------------
const ApprovalsPage = () => {
  const [approvals, setApprovals] = useState([]);
  const [loadingIds, setLoadingIds] = useState([]); // Track loading for approve/reject buttons
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);

  // Fetch approvals from backend
  const fetchApprovals = async () => {
    try {
      const res = await axios.get("http://localhost:8080/approvals");
      setApprovals(res.data);
    } catch (err) {
      toast.error("Failed to fetch approvals");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  // Approve order
  const handleApprove = async (id) => {
    setLoadingIds((prev) => [...prev, id]);
    try {
      await axios.put(`http://localhost:8080/approvals/approve/${id}`);
      setApprovals((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: "Approved" } : a))
      );
      toast.success("Order approved successfully");
    } catch (err) {
      toast.error("Failed to approve order");
    } finally {
      setLoadingIds((prev) => prev.filter((i) => i !== id));
    }
  };

  // Reject order
  const handleReject = async (id) => {
    setLoadingIds((prev) => [...prev, id]);
    try {
      await axios.put(`http://localhost:8080/approvals/reject/${id}`);
      setApprovals((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: "Rejected" } : a))
      );
      toast.success("Order rejected successfully");
    } catch (err) {
      toast.error("Failed to reject order");
    } finally {
      setLoadingIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const openDetailModal = (approval) => {
    setSelectedApproval(approval);
    setShowDetailModal(true);
  };

  return (
    <div>
      <Toaster position="top-right" reverseOrder={false} />
      <h2 className="text-2xl font-semibold text-emerald-400 mb-6">Approvals</h2>

      <Card>
        <CardContent>
          <table className="min-w-full text-gray-300">
            <thead className="border-b border-gray-700 text-gray-400 uppercase text-xs">
              <tr>
                <th className="py-3 text-left">Order</th>
                <th className="py-3 text-left">Supplier</th>
                <th className="py-3 text-left">Requested By</th>
                <th className="py-3 text-left">Status</th>
                <th className="py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvals.map((a) => (
                <tr key={a._id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                  <td className="py-3">{a.order}</td>
                  <td className="py-3">{a.supplier}</td>
                  <td className="py-3">{a.requestedBy}</td>
                  <td className="py-3">{a.status}</td>
                  <td className="py-3 flex justify-center gap-3">
                    {a.status === "Pending" && (
                      <>
                        <Button
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleApprove(a._id)}
                          disabled={loadingIds.includes(a._id)}
                        >
                          {loadingIds.includes(a._id) ? "..." : "Approve"}
                        </Button>
                        <Button
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleReject(a._id)}
                          disabled={loadingIds.includes(a._id)}
                        >
                          {loadingIds.includes(a._id) ? "..." : "Reject"}
                        </Button>
                      </>
                    )}
                    <Button
                      className="bg-gray-600 hover:bg-gray-500"
                      onClick={() => openDetailModal(a)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {showDetailModal && selectedApproval && (
        <Modal
          title={`Approval Details - ${selectedApproval.order}`}
          show={showDetailModal}
          onClose={() => setShowDetailModal(false)}
        >
          <div className="space-y-4 text-gray-300">
            <p><strong>Order:</strong> {selectedApproval.order}</p>
            <p><strong>Supplier:</strong> {selectedApproval.supplier}</p>
            <p><strong>Requested By:</strong> {selectedApproval.requestedBy}</p>
            <p><strong>Status:</strong> {selectedApproval.status}</p>
            <div className="flex justify-end mt-4">
              <Button
                className="bg-gray-700 hover:bg-gray-600"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ApprovalsPage;
