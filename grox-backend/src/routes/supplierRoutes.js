// routes/supplierRoutes.js
import express from "express";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierLedger
} from "../controllers/supplierController.js";

const router = express.Router();

router.get("/", getSuppliers);
router.post("/", createSupplier);
router.put("/:id", updateSupplier);
router.delete("/:id", deleteSupplier);

// Supplier ledger route
router.get("/ledger/:supplierId", getSupplierLedger);

export default router;
