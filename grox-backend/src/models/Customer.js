// src/models/Customer.js
import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Customer name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            unique: true,
            trim: true,
            match: [/^(\+234|0)[789][01]\d{8}$/, 'Invalid Nigerian phone number'],
            index: true,          // ← keep this (simple and clear)
        },
        // Optional fields you might want later
        email: {
            type: String,
            trim: true,
            lowercase: true,
            sparse: true, // allows null/undefined without unique constraint
            match: [/.+\@.+\..+/, 'Please provide a valid email address'],
        },
        address: {
            type: String,
            trim: true,
        },
        // Accounting fields
        openingBalance: {
            type: Number,
            default: 0,
            required: true,
        },
        currentBalance: {
            type: Number,
            default: 0,
            required: true,
        },
        creditLimit: {
            type: Number,
            default: 0, // 0 = no limit
            min: [0, 'Credit limit cannot be negative'],
        },
        // Status & metadata
        isActive: {
            type: Boolean,
            default: true,
        },
        notes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true, // adds createdAt & updatedAt automatically
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual for full name or formatted display (optional)
customerSchema.virtual('displayName').get(function () {
    return `${this.name} (${this.phone})`;
});

// Pre-save hook: ensure currentBalance starts as openingBalance on creation
customerSchema.pre('save', function (next) {
    if (this.isNew) {
        this.currentBalance = this.openingBalance;
    }
    next();
});


// Optional: method to check if customer can make a credit purchase
customerSchema.methods.canMakeCreditPurchase = function (amount) {
    if (this.creditLimit <= 0) return true; // no limit
    return this.currentBalance + amount <= this.creditLimit;
};

export default mongoose.model('Customer', customerSchema);