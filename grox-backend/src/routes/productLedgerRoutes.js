import express from "express";
import { getProductLedger } from "../controllers/productLedgerController.js";

const router = express.Router();

// GET /api/product-ledger/:productName
router.get("/:productName", getProductLedger);


export default router;
