// src/models/salesReturn.js
import mongoose from "mongoose";

const returnItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }, // original selling price
  subtotal: { type: Number, required: true }, 
  type: { type: String, enum: ["retail", "wholesale"], default: "retail" },
  packCount: { type: Number, default: 0 },
  sellingPricePerPiece: { type: Number, default: null },
}, { _id: true });

const returnSchema = new mongoose.Schema({
  saleId: { type: mongoose.Schema.Types.ObjectId, ref: "Sale", required: true },
  invoiceNumber: { type: String, required: true }, // original invoice
  items: [returnItemSchema],
  totalRefund: { type: Number, required: true },
  refundMethod: { 
    type: String, 
    enum: ["Cash", "Mobile Money", "Bank Transfer", "POS", "Store Credit"], 
    required: true 
  },
  processedBy: { 
    type: String, 
    required: true 
  },
  reason: { type: String, default: "" },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

// ✅ FIX OverwriteModelError
export default mongoose.models.Return || mongoose.model("Return", returnSchema);
