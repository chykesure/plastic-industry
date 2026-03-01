// src/models/Sale.js
import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    subtotal: { type: Number, required: true },

    // New fields for wholesale/retail
    type: { type: String, enum: ["retail", "wholesale"], default: "retail" },
    packCount: { type: Number, default: 0 },
    sellingPricePerPiece: { type: Number, default: null },
  },
  { _id: true }
);

const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    items: [saleItemSchema],
    total: { type: Number, required: true },
    paymentMode: {
      type: String,
      enum: ["Cash", "Mobile Money", "Bank Transfer", "POS", "Credit", "Card"],
      required: true,
    },

    // ── NEW: Customer reference ──
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",           // Must match your Customer model name
      default: null,              // null = walk-in / anonymous
    },

    date: { type: Date, default: Date.now },
    cashier: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes: { type: String },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled", "partially returned", "fully refunded"],
      default: "completed",
    },
  },
  { timestamps: true }
);

// Optional: index for faster customer-based queries/reports
saleSchema.index({ customer: 1, date: -1 });

export default mongoose.model("Sale", saleSchema);