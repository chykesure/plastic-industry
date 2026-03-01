// src/controllers/stockMovementController.js
import asyncHandler from "express-async-handler";
import StockMovement from "../models/StockMovement.js";
import Product from "../models/Product.js";
import Stock from "../models/Stock.js";

export const getStockMovements = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  // Get current stock from Stock model (same as /api/products-with-stock)
  const stockDoc = await Stock.findOne({ productId }).lean();
  const currentStock = stockDoc ? stockDoc.stockBalance : 0;

  // Get movements (audit log)
  const movements = await StockMovement.find({ product: productId })
    .sort({ createdAt: -1 })
    .lean();

  const totalIn = movements.reduce((sum, m) => sum + (m.type === "in" ? m.quantity : 0), 0);
  const totalOut = movements.reduce((sum, m) => sum + (m.type === "out" ? m.quantity : 0), 0);

  res.json({
    currentStock,
    totalIn,
    totalOut,
    history: movements,
  });
});

export const recordStockMovement = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { type, quantity, reason, reference } = req.body;

  // Only allow 'out' on this endpoint
  if (type !== "out") {
    res.status(400);
    throw new Error("This endpoint only supports stock-out (type: 'out')");
  }

  if (!quantity || quantity <= 0) {
    res.status(400);
    throw new Error("Quantity must be positive");
  }

  if (!reason?.trim()) {
    res.status(400);
    throw new Error("Reason is required");
  }

  const product = await Product.findById(productId).select("name sku").lean();
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Get real current stock from Stock model (same source as Sales & dropdown)
  const stockDoc = await Stock.findOne({ productId }).lean();
  const currentBalance = stockDoc ? stockDoc.stockBalance : 0;

  if (currentBalance < quantity) {
    res.status(400);
    throw new Error(`Insufficient stock. Available: ${currentBalance}`);
  }

  const newBalance = currentBalance - quantity;

  // Audit trail (StockMovement)
  const movement = await StockMovement.create({
    product: productId,
    type: "out",
    quantity,
    reason: reason.trim(),
    reference: reference?.trim() || null,
    balanceAfter: newBalance,
    recordedBy: req.user?.username || "System",
  });

  // Update real stock in Stock model (this keeps Sales & dropdown in sync)
  await Stock.findOneAndUpdate(
    { productId },
    { $set: { stockBalance: newBalance, quantity: newBalance } },
    { upsert: true, new: true }
  );

  res.status(201).json({
    success: true,
    movement,
    currentStock: newBalance,
  });
});