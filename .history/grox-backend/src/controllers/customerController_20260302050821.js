// controllers/customerController.js
import asyncHandler from "express-async-handler";
import Customer from "../models/Customer.js";
import CustomerLedger from "../models/CustomerLedger.js";

// @desc    Get all customers (with basic balance info for POS dropdown)
export const getCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find()
    .select("name phone openingBalance currentBalance")
    .sort({ name: 1 })
    .lean();

  res.json(customers);
});

// @desc    Get single customer by ID
export const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id)
    .select("-__v")
    .lean();

  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  res.json(customer);
});

// @desc    Create a new customer
export const createCustomer = asyncHandler(async (req, res) => {
  const { name, phone, openingBalance = 0 } = req.body;

  if (!name || !phone) {
    res.status(400);
    throw new Error("Name and phone are required");
  }

  // Check for duplicate phone
  const existing = await Customer.findOne({ phone });
  if (existing) {
    res.status(400);
    throw new Error("Phone number already exists");
  }

  const customer = await Customer.create({
    name,
    phone,
    openingBalance: Number(openingBalance),
    currentBalance: Number(openingBalance), // starts equal to opening
  });

  // Optional: create initial ledger entry for opening balance
  if (openingBalance !== 0) {
    await CustomerLedger.create({
      customer: customer._id,
      type: "opening",
      description: "Opening balance",
      debit: openingBalance > 0 ? openingBalance : 0,
      credit: openingBalance < 0 ? Math.abs(openingBalance) : 0,
      balance: openingBalance,
    });
  }

  res.status(201).json(customer);
});

// @desc    Update customer
export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  const { name, phone, openingBalance } = req.body;

  if (name) customer.name = name;
  if (phone) customer.phone = phone;
  if (openingBalance !== undefined) {
    // If changing opening balance, also adjust current (in real system you'd adjust via ledger)
    customer.openingBalance = Number(openingBalance);
    // Optional: recalculate currentBalance if needed
    // For simplicity, we just set it directly here
    customer.currentBalance = Number(openingBalance);
  }

  const updated = await customer.save();

  res.json(updated);
});

// @desc    Delete customer
export const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  // Optional: check if has active balance or transactions before delete
  const hasTransactions = await CustomerLedger.exists({ customer: customer._id });
  if (hasTransactions) {
    res.status(400);
    throw new Error("Cannot delete customer with transaction history");
  }

  await customer.deleteOne();
  res.json({ message: "Customer removed" });
});

// @desc    Get full ledger / statement for a customer
export const getCustomerLedger = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const customer = await Customer.findById(id)
    .select("name phone openingBalance currentBalance")
    .lean();

  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  const transactions = await CustomerLedger.find({ customer: id })
    .sort({ date: -1 }) // newest first
    .lean();

  res.json({
    customer,
    openingBalance: customer.openingBalance,
    currentBalance: customer.currentBalance,
    transactions,
  });
});

// ────────────────────────────────────────────────
// NEW FUNCTION: Record a customer payment
// ────────────────────────────────────────────────
export const recordCustomerPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, mode, reference, date } = req.body;

  // Basic validation
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    res.status(400);
    throw new Error("Valid payment amount is required");
  }

  const customer = await Customer.findById(id);
  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  // Optional strict check: prevent over-payment
  // Uncomment if you want to enforce that payments cannot exceed owed amount
  // if (Number(amount) > customer.currentBalance) {
  //   res.status(400);
  //   throw new Error("Payment exceeds outstanding balance");
  // }

  const paymentDate = date ? new Date(date) : new Date();

  // Create ledger entry: credit = payment received
  const ledgerEntry = await CustomerLedger.create({
    customer: id,
    date: paymentDate,
    type: "payment",
    description: `Payment received via ${mode}${reference ? ` (Ref: ${reference})` : ""}`,
    reference: reference || null,
    debit: 0,
    credit: Number(amount),
    balance: customer.currentBalance - Number(amount), // projected balance after payment
  });

  // Reduce customer's balance (debt decreases)
  customer.currentBalance = Math.max(0, customer.currentBalance - Number(amount));
  await customer.save();

  res.status(201).json({
    success: true,
    message: "Payment recorded successfully",
    payment: {
      amount: Number(amount),
      mode,
      reference,
      date: paymentDate,
    },
    newBalance: customer.currentBalance,
    ledgerEntry,
  });
});