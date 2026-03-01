// src/routes/returnsRoutes.js
import express from "express";
import {
  createReturn,
  getReturnsBySale,
  getAllReturns,
  getSaleByInvoice,
} from "../controllers/returnsController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a return
router.post("/", createReturn);

// Get sale by invoice number (for return initiation)
router.get("/sale/invoice/:invoiceNumber", getSaleByInvoice);

// Get all returns for a specific sale
router.get("/sale/:saleId", getReturnsBySale);

// Get ALL returns – for Return Items History report
router.get("/", getAllReturns);

// Optional: dedicated /history route
// router.get("/history", protect, getAllReturns);

export default router;
