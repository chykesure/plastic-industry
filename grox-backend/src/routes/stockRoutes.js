// src/routes/stockRoutes.js
import express from "express";
import {
  getSupplierSummary,
  getStockItems,
  saveStockInvoice,
  confirmStockInvoice,
  createStockItem,
  updateStockItem,
  deleteStockItem,
  getStockBySKU,
  getStockBalance, // ✅ import the new function
} from "../controllers/stockController.js";

const router = express.Router();

// Existing routes
router.get("/", getStockItems);
router.get("/supplier-summary", getSupplierSummary);
router.get("/balance", getStockBalance); // ✅ new route
router.post("/invoice/save", saveStockInvoice);
router.post("/invoice/confirm", confirmStockInvoice);
router.post("/", createStockItem);
router.get("/:sku", getStockBySKU);
router.put("/:sku", updateStockItem);
router.delete("/:sku", deleteStockItem);

// Optional: delete all stock by supplier
router.delete("/supplier/:supplierId", async (req, res) => {
  try {
    const { supplierId } = req.params;
    const deleted = await Stock.deleteMany({ supplierId });
    res.json({ message: `Deleted ${deleted.deletedCount} items for supplier.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
