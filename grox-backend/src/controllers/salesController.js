// src/controllers/salesController.js
import asyncHandler from "express-async-handler";
import Sale from "../models/Sale.js";
import Stock from "../models/Stock.js";
import Product from "../models/Product.js";
import ProductLedger from "../models/ProductLedger.js";
import Counter from "../models/Counter.js";

import Customer from "../models/Customer.js";
import CustomerLedger from "../models/CustomerLedger.js";


// 🔢 Atomic invoice number generator (SAFE for multi-POS)
const getNextInvoiceNumber = async () => {
  const counter = await Counter.findByIdAndUpdate(
    "invoiceNumber",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return counter.seq;
};


// -----------------------------
// Create Sale (Safe, avoids duplicate invoices)
// -----------------------------
export const createSale = asyncHandler(async (req, res) => {
  const { items, paymentMode, cashier, customerId } = req.body; // ← added customerId

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("Cart is empty");
  }

  if (!paymentMode || !cashier) {
    res.status(400);
    throw new Error("Payment mode and cashier are required");
  }

  // Generate sequential invoice number
  const invoiceNumber = await getNextInvoiceNumber();

  // Check for duplicate invoice (already good)
  const existingSale = await Sale.findOne({ invoiceNumber });
  if (existingSale) {
    res.status(409);
    throw new Error(`Sale with invoice number ${invoiceNumber} already exists`);
  }

  let total = 0;
  const saleItems = [];

  for (const item of items) {
    if (!item.productId || !item.price) {
      res.status(400);
      throw new Error("Each item must have productId and price");
    }

    let actualQuantity = Number(item.quantity);
    if (item.type === "wholesale" && item.packCount && item.itemsPerPack) {
      actualQuantity = item.packCount * item.itemsPerPack;
    }

    const subtotal =
      item.type === "wholesale"
        ? (item.packCount || 0) * (item.wholesalePrice || 0)
        : actualQuantity * item.price;

    total += subtotal;

    saleItems.push({
      productId: item.productId,
      productName: item.productName || "",
      quantity: actualQuantity,
      price: Number(item.price),
      subtotal,
      type: item.type || "retail",
      packCount: item.packCount || 0,
      sellingPricePerPiece: item.sellingPricePerPiece || null,
    });
  }

  // Optional: Validate customerId if provided
  let customer = null;
  if (customerId) {
    customer = await Customer.findById(customerId);
    if (!customer) {
      res.status(400);
      throw new Error("Invalid customer ID");
    }
    // Optional future check: credit limit
    // if (customer.currentBalance + total > customer.creditLimit) {
    //   throw new Error("Credit limit exceeded");
    // }
  }

  // Create Sale record
  const sale = await Sale.create({
    invoiceNumber,
    items: saleItems,
    total,
    paymentMode,
    cashier,
    customer: customerId || null, // ← save reference (new)
  });

  const ledgerEntries = [];

  // Update stock and product ledger (your existing logic)
  for (const item of saleItems) {
    const stock = await Stock.findOne({ productId: item.productId });
    const product = await Product.findById(item.productId);

    if (!stock) continue;

    stock.quantity = Math.max(stock.quantity - item.quantity, 0);
    stock.stockBalance = stock.quantity;
    await stock.save();

    if (product) {
      product.soldQuantity = (product.soldQuantity || 0) + item.quantity;
      await product.save();
    }

    ledgerEntries.push({
      productId: item.productId,
      productName: product?.name || "Unknown Product",
      balanceAfterStock: stock.quantity,
      costPrice: product?.costPrice || 0,
      sellingPrice: item.type === "wholesale" ? item.sellingPricePerPiece || item.price : item.price,
      type: "sale",
      quantitySold: item.quantity,
      paymentMode,
      referenceId: sale._id,
      date: new Date(),
    });
  }

  if (ledgerEntries.length > 0) {
    await ProductLedger.insertMany(ledgerEntries);
  }

  // New: Customer ledger entry (only if customer selected)
  if (customerId) {
    const customerLedgerEntry = new CustomerLedger({
      customer: customerId,
      date: new Date(),
      type: "sale",
      description: `Sale - Invoice #${invoiceNumber}`,
      reference: invoiceNumber,
      debit: total,      // customer owes us more
      credit: 0,
    });

    await customerLedgerEntry.save();

    // Update customer's currentBalance (increases owed amount)
    await Customer.findByIdAndUpdate(customerId, {
      $inc: { currentBalance: total },
    });
  }

  res.status(201).json({
    message: "Sale recorded successfully",
    saleId: sale._id,
    invoiceNumber: sale.invoiceNumber,
  });
});

// -----------------------------
// Get Sale by Invoice
// -----------------------------
export const getSaleByInvoice = async (req, res) => {
  try {
    const { invoiceNumber } = req.params;

    const sale = await Sale.findOne({ invoiceNumber })
      .populate({
        path: 'customer',
        select: 'name phone address balance'  // only what you need
      })
      .populate({
        path: 'items.productId',
        select: 'name sku barcode sellingPrice wholesalePrice' // optional but useful
      })
      .lean();

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // Recalculate totals properly (your existing logic + safety)
    let newTotal = 0;
    const itemsWithNames = await Promise.all(
      sale.items.map(async (item) => {
        // Use populated product if available, fallback to stored name
        const productName = item.productId?.name || item.productName || "Unknown Product";

        let calculatedSubtotal = item.subtotal;

        // Wholesale adjustment (your existing logic)
        if (item.type === "wholesale") {
          calculatedSubtotal = item.price * item.quantity;
        }

        newTotal += calculatedSubtotal;

        return {
          productId: item.productId?._id || item.productId,
          productName,
          quantity: item.quantity,
          price: item.price,
          subtotal: calculatedSubtotal,
          type: item.type,
          packCount: item.packCount,
          sellingPricePerPiece: item.sellingPricePerPiece || null,
        };
      })
    );

    res.json({
      _id: sale._id,
      invoiceNumber: sale.invoiceNumber,
      items: itemsWithNames,
      total: newTotal,               // use recalculated total
      paymentMode: sale.paymentMode,
      date: sale.date,
      cashier: sale.cashier,
      customer: sale.customer || null,   // ← now has name, phone, etc.
      status: sale.status,
      createdAt: sale.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// -----------------------------
// Search Sale by Invoice
// -----------------------------
export const searchSaleByInvoice = asyncHandler(async (req, res) => {
  const { query } = req.params;

  const sales = await Sale.find({ invoiceNumber: { $regex: query, $options: "i" } }).lean();
  if (!sales || sales.length === 0) return res.status(404).json({ message: "No sales found" });

  const results = await Promise.all(
    sales.map(async (sale) => {
      const itemsWithNames = await Promise.all(
        sale.items.map(async (item) => {
          const product = await Product.findById(item.productId).lean();
          return {
            productId: item.productId,
            productName: product ? product.name : "Unknown Product",
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
          };
        })
      );

      return {
        _id: sale._id,
        invoiceNumber: sale.invoiceNumber,
        items: itemsWithNames,
        total: sale.total,
        paymentMode: sale.paymentMode,
        date: sale.date,
        status: sale.status,
      };
    })
  );

  res.json(results);
});
// -----------------------------
// Get All Sales for Report
// -----------------------------
export const getAllSales = asyncHandler(async (req, res) => {
  const sales = await Sale.find().sort({ date: -1 }).lean();

  const results = await Promise.all(
    sales.map(async (sale) => {

      const itemsWithNames = await Promise.all(
        sale.items.map(async (item) => {
          const product = await Product.findById(item.productId).lean();

          // Calculate subtotal properly
          let calculatedSubtotal;

          if (item.type === "wholesale") {
            calculatedSubtotal = item.price * item.quantity;   // wholesale rule
          } else {
            calculatedSubtotal = item.price * item.quantity;    // retail rule
          }

          return {
            productId: item.productId,
            productName: product ? product.name : "Unknown Product",
            quantity: item.quantity,
            price: item.price,
            type: item.type,
            packCount: item.packCount,
            subtotal: calculatedSubtotal,
          };
        })
      );

      // Recalculate sale total using updated subtotals
      const newTotal = itemsWithNames.reduce((sum, i) => sum + i.subtotal, 0);

      return {
        _id: sale._id,
        invoiceNumber: sale.invoiceNumber,
        items: itemsWithNames,
        total: newTotal,
        paymentMode: sale.paymentMode,
        date: sale.date,
        status: sale.status || "completed",
        cashier: sale.cashier || "N/A",
      };
    })
  );

  res.json(results);
});
