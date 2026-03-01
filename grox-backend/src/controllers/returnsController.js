// src/controllers/returnsController.js
import asyncHandler from "express-async-handler";
import Sale from "../models/Sale.js";
import Stock from "../models/Stock.js";
import Ledger from "../models/Ledger.js";
import ProductLedger from "../models/ProductLedger.js";
import Return from "../models/SalesReturn.js";
import Product from "../models/Product.js";

// Helper functions for consistent date ranges
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

// -----------------------------
// Fetch sale by invoice + calculate remaining returnable
// -----------------------------
export const getSaleByInvoice = asyncHandler(async (req, res) => {
  const { invoiceNumber } = req.params;

  if (!invoiceNumber) {
    res.status(400);
    throw new Error("Invoice number is required");
  }

  const sale = await Sale.findOne({ invoiceNumber })
    .populate({
      path: "items.productId",
      select: "name",
    })
    .lean();

  if (!sale) {
    res.status(404);
    throw new Error("Sale not found");
  }

  // Get previous returns to calculate remaining
  const previousReturns = await Return.find({ saleId: sale._id }).lean();

  const returnedQtyMap = {};
  previousReturns.forEach((ret) => {
    ret.items.forEach((i) => {
      const pid = i.productId.toString();
      returnedQtyMap[pid] = (returnedQtyMap[pid] || 0) + i.quantity;
    });
  });

  const enrichedItems = sale.items.map((item) => {
    const pid = item.productId?._id?.toString() || item.productId?.toString();
    const alreadyReturned = returnedQtyMap[pid] || 0;
    const remainingReturnable = Math.max(0, item.quantity - alreadyReturned);

    return {
      ...item,
      productName: item.productName || item.productId?.name || "Unknown Item",
      productId: item.productId?._id || item.productId,
      quantity: item.quantity,
      price: item.price,
      alreadyReturned,
      remainingReturnable,
    };
  });

  res.json({
    ...sale,
    items: enrichedItems,
  });
});

// -----------------------------
// Process a Return – Adds back to stock correctly
// -----------------------------
export const createReturn = asyncHandler(async (req, res) => {
  let { saleId, items, refundMethod, reason, processedBy } = req.body;

  if (!saleId || !items || items.length === 0 || !refundMethod || !processedBy) {
    res.status(400);
    throw new Error("Missing required fields");
  }

  // Map returnQty → quantity
  items = items.map((i) => ({ ...i, quantity: i.returnQty }));

  const sale = await Sale.findById(saleId);
  if (!sale) {
    res.status(404);
    throw new Error("Sale not found");
  }

  // Get previous returns for validation
  const previousReturns = await Return.find({ saleId: sale._id });
  const returnedQtyMap = {};
  previousReturns.forEach((ret) => {
    ret.items.forEach((i) => {
      const pid = i.productId.toString();
      returnedQtyMap[pid] = (returnedQtyMap[pid] || 0) + i.quantity;
    });
  });

  // Validate return quantities
  const validatedItems = items.map((item) => {
    const originalItem = sale.items.find(
      (i) => i.productId.toString() === item.productId.toString()
    );

    if (!originalItem) {
      throw new Error(`Product ${item.productId} not found in original sale`);
    }

    const productName = item.productName || originalItem.productName || "Unknown Item";
    const alreadyReturned = returnedQtyMap[item.productId.toString()] || 0;
    const remaining = originalItem.quantity - alreadyReturned;

    if (item.quantity > remaining) {
      throw new Error(
        `Cannot return ${item.quantity} of ${productName}. Only ${remaining} remaining to return.`
      );
    }

    return {
      ...item,
      productName,
      subtotal: item.price * item.quantity,
      type: originalItem.type || "retail",
      packCount: originalItem.packCount || 0,
      sellingPricePerPiece: originalItem.sellingPricePerPiece || null,
    };
  });

  const totalRefund = validatedItems.reduce((sum, i) => sum + i.subtotal, 0);

  // === RESTOCK RETURNED ITEMS ===
  for (const item of validatedItems) {
    const product = await Product.findById(item.productId);
    if (!product) throw new Error(`Product not found: ${item.productId}`);

    let stock = await Stock.findOne({ productId: item.productId });

    if (!stock) {
      stock = await Stock.create({
        productId: item.productId,
        productName: product.name || item.productName,
        sku: product.sku || "RETURN-SKU",
        supplierId: null,
        quantity: 0,
        stockBalance: 0,
        costPrice: product.costPrice || 0,
        sellingPrice: item.price,
        referenceNumber: `RETURN-${sale.invoiceNumber}`,
        location: "Main",
      });
    }

    stock.quantity += item.quantity;
    stock.stockBalance += item.quantity;
    await stock.save();

    const newBalance = stock.quantity;

    await Ledger.create({
      productId: item.productId,
      productName: item.productName,
      supplierId: null,
      quantityAdded: item.quantity,
      balanceAfterStock: newBalance,
      costPrice: stock.costPrice || 0,
      sellingPrice: item.price,
      referenceNumber: sale.invoiceNumber,
      type: "return",
      date: new Date(),
    });

    // ProductLedger entry
    await ProductLedger.create({
      productId: item.productId,
      productName: item.productName,
      balanceAfterStock: newBalance,
      sellingPrice: item.price,
      type: "return",
      quantityReturned: item.quantity,
      paymentMode: sale.paymentMode,
      referenceId: sale._id,
      date: new Date(),
    });
  }

  // Create return record
  const returnRecord = await Return.create({
    saleId: sale._id,
    invoiceNumber: sale.invoiceNumber,
    items: validatedItems,
    totalRefund,
    refundMethod,
    reason: reason || "",
    processedBy,
    date: new Date(),
  });

  // Update sale status
  const allReturned = sale.items.every((saleItem) => {
    const pid = saleItem.productId.toString();
    const totalReturned = (returnedQtyMap[pid] || 0) + validatedItems.reduce((sum, i) => i.productId.toString() === pid ? sum + i.quantity : sum, 0);
    return totalReturned >= saleItem.quantity;
  });

  if (allReturned) {
    sale.status = "fully refunded";
  } else if (previousReturns.length > 0 || validatedItems.length > 0) {
    sale.status = "partially returned";
  }
  await sale.save();

  res.status(201).json({
    success: true,
    message: "Return processed successfully",
    returnId: returnRecord._id,
    totalRefund,
  });
});

// -----------------------------
// Get Returns by Sale ID
// -----------------------------
export const getReturnsBySale = asyncHandler(async (req, res) => {
  const { saleId } = req.params;

  const returns = await Return.find({ saleId })
    .sort({ date: -1 })
    .lean();

  res.json({
    success: true,
    data: returns,
  });
});

// -----------------------------
// Get ALL Returns – Used for Return Items History Report + Revenue Report
// NOW SUPPORTS DATE FILTERING
// -----------------------------
export const getAllReturns = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const query = {};

  // Apply date range filter if provided
  if (startDate || endDate) {
    query.date = {};

    if (startDate) {
      query.date.$gte = startOfDay(new Date(startDate));
    }

    if (endDate) {
      query.date.$lte = endOfDay(new Date(endDate));
    }
  }

  const returns = await Return.find(query)
    .sort({ date: -1 })
    .lean();

  res.status(200).json({
    success: true,
    count: returns.length,
    data: returns,
  });
});