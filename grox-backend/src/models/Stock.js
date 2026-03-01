// models/Stock.js
import mongoose from "mongoose";

const stockSchema = new mongoose.Schema(
  {
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    stockBalance: {
      type: Number,
      default: 0,
    },
    costPrice: {
      type: Number,
      default: 0,
    },
    sellingPrice: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
      default: "Main",
    },

    // ✅ USER-DEFINED REFERENCE NUMBER
    referenceNumber: {
      type: String,
      required: true,
    },

    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Stock", stockSchema);
