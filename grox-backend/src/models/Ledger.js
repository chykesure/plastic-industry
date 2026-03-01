// models/Ledger.js
import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: false,   // ← Changed from true to false
      default: null,     // ← Explicitly allow null
    },
    quantityAdded: {
      type: Number,
      required: true,
    },
    balanceAfterStock: {
      type: Number,
      required: true,
    },
    costPrice: {
      type: Number,
      required: true,
    },
    sellingPrice: {
      type: Number,
      required: true,
    },

    // ✅ NEW FIELD: To connect transactions
    referenceNumber: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["stock-in", "stock-out", "adjustment", "stock-update", "stock-deleted", "return"],
      default: "stock-in",
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Ledger", ledgerSchema);