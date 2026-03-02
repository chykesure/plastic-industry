import express from "express";
const router = express.Router();

import User from "./models/User.js"; // Adjust this path to your User.js file
import supplierRoutes from "./supplierRoutes.js";
import purchaseRoutes from "./purchaseRoutes.js";
import ledgerRoutes from "./ledgerRoutes.js";
import approvalRoutes from "./approvalRoutes.js";
import stockRoutes from "./stockRoutes.js";
import productRoutes from "./productRoutes.js";
import salesRoutes from "./salesRoutes.js";
import accountsRoutes from "./accountsRoutes.js";
import reportRoutes from "./reportRoutes.js";
import productLedgerRoutes from "./productLedgerRoutes.js";
import revenueRoutes from "./revenueRoutes.js";
import returnsRoutes from "./returnsRoutes.js";
import customerRoutes from "./customerRoutes.js";
import stockMovementRoutes from './stockMovementRoutes.js';

// ────────────────────────────────────────────────
// TEMPORARY TEST ROUTE – add this block here
// Remove after confirming collections appear in Atlas


router.get('/init-db', async (req, res) => {
  try {
    // 1. Check if an admin already exists to prevent duplicates
    const existingUser = await User.findOne({ email: "admin@grox.com" });

    if (existingUser) {
      return res.json({ message: "Collection already exists and Admin is created!" });
    }

    // 2. Create the first document. This ACTUALLY triggers Atlas to show the collection.
    const admin = new User({
      username: "admin",
      email: "admin@grox.com",
      password: "0000",
      role: "Admin",
      status: "Active"
    });

    await admin.save();

    res.json({
      success: true,
      message: "Success! User collection created in Atlas. You can now log in.",
      data: { username: admin.username, email: admin.email }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/force-create', async (req, res) => {
  try {
    // Use a minimal schema/model (creates collection "testdocs")
    const TestSchema = new mongoose.Schema({
      message: String,
      createdAt: { type: Date, default: Date.now }
    });

    const Test = mongoose.model('TestDoc', TestSchema);

    const newDoc = new Test({
      message: `First successful write from Render – ${new Date().toISOString()}`
    });

    await newDoc.save();

    res.json({
      success: true,
      message: "Document saved! → Refresh MongoDB Atlas → look for 'testdocs' collection",
      savedDocument: newDoc
    });
  } catch (err) {
    console.error("Test insert failed:", err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});
// ────────────────────────────────────────────────

// Your existing test route
router.get("/test", (req, res) => {
  res.json({ message: "API working successfully!" });
});

// Mount existing routes
router.use("/suppliers", supplierRoutes);
router.use("/purchases", purchaseRoutes);
router.use("/ledger", ledgerRoutes);
router.use("/approvals", approvalRoutes);
router.use("/stock", stockRoutes);
router.use("/api", productRoutes);
router.use("/api/users", accountsRoutes);
router.use("/api/sales", salesRoutes);
router.use("/api/reports", reportRoutes);
router.use("/api/product-ledger", productLedgerRoutes);
router.use("/api/revenue", revenueRoutes);
router.use("/api/returns", returnsRoutes);
router.use("/api/customers", customerRoutes);
router.use('/api/stocks', stockMovementRoutes);

export default router;