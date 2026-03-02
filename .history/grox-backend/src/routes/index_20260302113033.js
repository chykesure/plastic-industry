//routes/index.js
import express from "express";
import User from "../models/User.js";
const router = express.Router();

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
import revenueRoutes from "./revenueRoutes.js"; // <-- ADD THIS
import returnsRoutes from "./returnsRoutes.js";
import customerRoutes from "./customerRoutes.js";
import stockMovementRoutes from './stockMovementRoutes.js';


// Example test route
router.get("/test", (req, res) => {
  res.json({ message: "API working successfully!" });
});



router.get("/seed-user", async (req, res) => {
  try {
    const userExists = await User.findOne({ username: "pascal" });
    if (userExists) return res.send("User already exists! Try logging in normally.");

    const newUser = new User({
      username: "pascal",
      email: "pascal@test.com",
      password: "0000", 
      role: "Admin",
      status: "Active"
    });

    await newUser.save();
    res.send("<h1>Success!</h1><p>User 'pascal' created. Refresh Atlas and then try logging in on your app.</p>");
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
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
router.use("/api/revenue", revenueRoutes); // <-- ADD THIS
router.use("/api/returns", returnsRoutes);
router.use("/api/customers", customerRoutes);
router.use('/api/stocks', stockMovementRoutes);


export default router;
