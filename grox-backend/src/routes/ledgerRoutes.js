import express from "express";
const router = express.Router();

import { getSupplierLedger, createLedgerEntry } from "../controllers/ledgerController.js";

// Get ledger entries for a supplier
router.get("/supplier/:supplierId", getSupplierLedger);

// Create a ledger entry manually (optional, can also be auto-created from purchases/payments)
router.post("/", createLedgerEntry);

export default router;
