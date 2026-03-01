import mongoose from "mongoose";
import Ledger from "../models/Ledger.js";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import StockMovement from "../models/StockMovement.js"; // ← NEW: import StockMovement

export const getProductLedger = async (req, res) => {
  try {
    let { productName } = req.params;
    const { supplierId } = req.query;

    if (!productName) {
      return res.status(400).json({ message: "productName is required" });
    }

    // Decode URL encoding (e.g., %20 → space, + → space)
    productName = decodeURIComponent(productName.trim());

    // Normalize function (your existing logic – kept intact)
    const normalize = (str) => {
      if (!str) return "";
      return str
        .toString()
        .trim()
        .replace(/\s+/g, " ")
        .replace(/\s*[\*xX]\s*\d+.*/g, "")
        .replace(/\s*[\*xX]\s*/g, " ")
        .trim()
        .toLowerCase();
    };

    const incomingNormalized = normalize(productName);

    console.log("Incoming productName (decoded):", productName);
    console.log("Normalized incoming:", incomingNormalized);

    // Find product (tolerant matching)
    const product = await Product.findOne({
      $or: [
        { name: { $regex: `^${productName}$`, $options: "i" } },
        { name: { $regex: incomingNormalized, $options: "i" } },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const productNormalized = normalize(product.name);
    console.log("Product found in DB:", product.name);
    console.log("Product normalized:", productNormalized);

    // ──────────────────────────────────────────────
    // 1. Ledger entries (stock-in + returns)
    // ──────────────────────────────────────────────
    const ledgerFilter = {
      type: { $in: ["stock-in", "return"] },
    };

    if (supplierId && supplierId !== "null" && supplierId !== "undefined" && supplierId !== "") {
      if (mongoose.Types.ObjectId.isValid(supplierId)) {
        ledgerFilter.supplierId = new mongoose.Types.ObjectId(supplierId);
      }
    } else if (supplierId === "null" || supplierId === "undefined") {
      ledgerFilter.supplierId = null;
    }

    const allStockEntries = await Ledger.find(ledgerFilter)
      .populate("supplierId", "name")
      .sort({ date: 1 });

    const stockAndReturns = allStockEntries.filter((entry) => {
      const entryNormalized = normalize(entry.productName);
      return entryNormalized === productNormalized;
    });

    console.log(`Found ${stockAndReturns.length} matching IN/RETURN entries`);

    const ledgerEntries = stockAndReturns.map((entry) => ({
      date: entry.date,
      type: entry.type === "return" ? "RETURN" : "IN",
      referenceNumber: entry.referenceNumber || entry._id.toString(),
      supplierName: entry.supplierId?.name || "—",
      cashier: entry.processedBy || "—",
      quantityIn: entry.quantityAdded || 0,
      quantityOut: 0,
      costPrice: entry.costPrice || 0,
      sellingPrice: entry.sellingPrice || 0,
      reason: entry.type === "stock-in" ? "Stock Received" : "Return processed",
      balance: 0, // will be calculated later
    }));

    // ──────────────────────────────────────────────
    // 2. Sales (OUT from completed sales)
    // ──────────────────────────────────────────────
    const sales = await Sale.find({
      status: { $in: ["completed", "partially returned", "fully refunded"] },
    }).sort({ date: 1 });

    for (const sale of sales) {
      const relevantItems = sale.items.filter((item) => {
        const itemNameNorm = normalize(item.productName || "");
        const idMatch = item.productId?.toString() === product._id.toString();
        return itemNameNorm === productNormalized || idMatch;
      });

      for (const item of relevantItems) {
        ledgerEntries.push({
          date: sale.date || sale.createdAt,
          type: "OUT",
          referenceNumber: sale.invoiceNumber || sale._id.toString(),
          supplierName: "—",
          cashier: sale.cashier || "—",
          quantityIn: 0,
          quantityOut: item.quantity || 0,
          costPrice: 0,
          sellingPrice: item.price || item.sellingPrice || 0,
          reason: "Sale / Customer purchase",
          balance: 0,
        });
      }
    }

    // ──────────────────────────────────────────────
    // 3. NEW: Stock-outs from StockMovement
    // ──────────────────────────────────────────────
    const stockOuts = await StockMovement.find({
      product: product._id,
      type: "out",
    }).sort({ createdAt: -1 });

    for (const mov of stockOuts) {
      ledgerEntries.push({
        date: mov.createdAt,
        type: "OUT",
        referenceNumber: mov.reference || "Stock Issue",
        supplierName: "—",
        cashier: mov.recordedBy || "System",
        quantityIn: 0,
        quantityOut: mov.quantity,
        costPrice: 0,
        sellingPrice: 0,
        reason: mov.reason || "Stock consumption / issue",
        balance: 0,
      });
    }

    // ──────────────────────────────────────────────
    // 4. Sort all entries by date (oldest → newest)
    // ──────────────────────────────────────────────
    ledgerEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // ──────────────────────────────────────────────
    // 5. Calculate running balance
    // ──────────────────────────────────────────────
    let runningBalance = 0;
    const finalLedger = ledgerEntries.map((entry) => {
      runningBalance += entry.quantityIn - entry.quantityOut;
      return { ...entry, balance: runningBalance };
    });

    // Current stock should match the last balance (or use Stock model if needed)
    const currentStock = runningBalance;

    return res.json({
      product: product.name,
      currentStock,
      ledger: finalLedger,
    });
  } catch (err) {
    console.error("getProductLedger Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};