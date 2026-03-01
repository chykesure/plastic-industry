// controllers/supplierController.js
import Supplier from "../models/Supplier.js";
import Ledger from "../models/Ledger.js"; // ✅ Add this

// Get all suppliers
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create new supplier
export const createSupplier = async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    const saved = await supplier.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update supplier
export const updateSupplier = async (req, res) => {
  try {
    const updated = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete supplier
export const deleteSupplier = async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: "Supplier deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// Get supplier ledger by supplierId
export const getSupplierLedger = async (req, res) => {
  try {
    const { supplierId } = req.params;
    if (!supplierId) return res.status(400).json({ message: "Supplier ID is required" });

    const entries = await Ledger.find({ supplierId }).sort({ date: 1 });

    // Group entries by date + referenceNumber
    const grouped = {};

    entries.forEach((entry) => {
      const key = `${entry.date.toISOString().split("T")[0]}|${entry.referenceNumber}`;
      if (!grouped[key]) {
        grouped[key] = {
          date: entry.date,
          referenceNumber: entry.referenceNumber || "-",
          amountIn: 0,
          amountOut: 0,
        };
      }

      const value = (entry.quantityAdded || 0) * (entry.costPrice || 0);
      if (entry.type === "stock-in") {
        grouped[key].amountIn += value;
      } else {
        grouped[key].amountOut += value;
      }
    });

    // Convert grouped object to array and calculate running balance
    let balance = 0;
    const formatted = Object.values(grouped).map((entry) => {
      balance += entry.amountIn - entry.amountOut;
      return {
        ...entry,
        balance,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching supplier ledger:", err);
    res.status(500).json({ message: err.message });
  }
};
