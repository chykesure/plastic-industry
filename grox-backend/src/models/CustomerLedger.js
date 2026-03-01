// src/models/CustomerLedger.js
import mongoose from 'mongoose';

const customerLedgerSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer reference is required'],
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    type: {
      type: String,
      enum: ['opening', 'sale', 'payment', 'return', 'adjustment', 'credit_note'],
      required: [true, 'Transaction type is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    reference: {
      type: String,
      trim: true,
      // e.g. INV-00123, PAY-456, RET-789
    },
    debit: {
      type: Number,
      default: 0,
      min: [0, 'Debit cannot be negative'],
    },
    credit: {
      type: Number,
      default: 0,
      min: [0, 'Credit cannot be negative'],
    },
    balance: {
      type: Number,
      default: 0,           // ← important safety default
      required: true,
    },
    recordedBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save: Automatically calculate running balance
customerLedgerSchema.pre('save', async function (next) {
  // Skip if this is an update (not new)
  if (!this.isNew) return next();

  let runningBalance = 0;

  try {
    // Find the most recent previous entry
    const lastEntry = await this.constructor
      .findOne({ customer: this.customer })
      .sort({ date: -1, createdAt: -1 })
      .select('balance')
      .lean();

    if (lastEntry && typeof lastEntry.balance === 'number') {
      runningBalance = lastEntry.balance;
    } else if (this.type === 'opening') {
      // First entry + opening type → use customer's openingBalance
      const customer = await mongoose.model('Customer')
        .findById(this.customer)
        .select('openingBalance')
        .lean();

      runningBalance = customer?.openingBalance ?? 0;
    }
    // else → first non-opening entry → start from 0

    // Calculate change safely
    const safeDebit = Number(this.debit) || 0;
    const safeCredit = Number(this.credit) || 0;
    const change = safeDebit - safeCredit;

    // Final balance
    this.balance = runningBalance - change;

    // Safety net: ensure it's always a number
    if (typeof this.balance !== 'number' || isNaN(this.balance)) {
      console.warn('Balance calculation failed – setting to 0', this);
      this.balance = 0;
    }
  } catch (err) {
    console.error('Ledger balance calculation error:', err);
    this.balance = 0; // fallback
  }

  next();
});

// Compound index: fast queries per customer + sorted by date
customerLedgerSchema.index({ customer: 1, date: -1 });

export default mongoose.model('CustomerLedger', customerLedgerSchema);