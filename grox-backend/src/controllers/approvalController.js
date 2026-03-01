import Approval from "../models/approval.js";

export const getApprovals = async (req, res) => {
  try {
    const approvals = await Approval.find().sort({ createdAt: -1 });
    res.json(approvals);
  } catch (err) {
    res.status(500).json({ message: "Error fetching approvals", error: err.message });
  }
};

export const approveOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const approval = await Approval.findByIdAndUpdate(id, { status: "Approved" }, { new: true });
    res.json(approval);
  } catch (err) {
    res.status(500).json({ message: "Error approving order", error: err.message });
  }
};

export const rejectOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const approval = await Approval.findByIdAndUpdate(id, { status: "Rejected" }, { new: true });
    res.json(approval);
  } catch (err) {
    res.status(500).json({ message: "Error rejecting order", error: err.message });
  }
};
