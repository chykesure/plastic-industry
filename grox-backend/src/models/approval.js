import mongoose from "mongoose";

const approvalSchema = new mongoose.Schema(
  {
    order: { type: String, required: true, unique: true },
    supplier: { type: String, required: true },
    requestedBy: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Approval", approvalSchema);
