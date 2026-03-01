
// src/routes/salesRoutes.js
import express from "express";
const router = express.Router();

import { createSale, getSaleByInvoice, getAllSales } from "../controllers/salesController.js";
import { printReceipt } from "../controllers/printController.js";

// ------------------------------------------------------
// 💰 Create Sale (Safe, prevents duplicate invoices)
// ------------------------------------------------------
router.post("/", createSale);

// ------------------------------------------------------
// 🔍 Fetch sale by invoice number
// ------------------------------------------------------
router.get("/invoice/:invoiceNumber", getSaleByInvoice);
router.get("/print/:invoiceNumber", printReceipt);
router.get("/", getAllSales);

export default router;
