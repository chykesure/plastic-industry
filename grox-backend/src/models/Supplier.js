// src/models/Supplier.js
import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
}, { timestamps: true });

export default mongoose.model("Supplier", supplierSchema);
