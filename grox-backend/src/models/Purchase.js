import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ["Pending", "Completed", "Cancelled"], default: "Pending" },
}, { timestamps: true });

export default mongoose.model("Purchase", purchaseSchema);
