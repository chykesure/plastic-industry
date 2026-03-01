// routes/customerRoutes.js
import express from "express";
const router = express.Router();

import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerLedger,
  recordCustomerPayment,     // NEW: handler for recording payments
} from "../controllers/customerController.js";

// List all customers (used in POS dropdown)
router.route("/")
  .get(getCustomers)          // GET /api/customers
  .post(createCustomer);      // POST /api/customers

// Single customer CRUD
router.route("/:id")
  .get(getCustomerById)       // GET /api/customers/:id
  .put(updateCustomer)        // PUT /api/customers/:id
  .delete(deleteCustomer);    // DELETE /api/customers/:id

// Get full ledger / statement for a customer
router.get("/:id/ledger", getCustomerLedger);   // GET /api/customers/:id/ledger

// NEW: Record a customer payment (reduce debt / credit balance)
router.post("/:id/payment", recordCustomerPayment);   // POST /api/customers/:id/payment

export default router;