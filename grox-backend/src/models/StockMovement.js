// src/models/StockMovement.js
import mongoose from 'mongoose';

const stockMovementSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['in', 'out'],
      required: [true, 'Movement type is required (in or out)'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
      maxlength: [200, 'Reason cannot exceed 200 characters'],
    },
    balanceAfter: {
      type: Number,
      required: [true, 'Balance after movement is required'],
    },
    recordedBy: {
      type: String,
      trim: true,
      default: 'System',
    },
    reference: {
      type: String,
      trim: true,
      // Optional: e.g. PO-123, Transfer-456, Production-Batch-789
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast queries per product + date
stockMovementSchema.index({ product: 1, date: -1 });

export default mongoose.model('StockMovement', stockMovementSchema);