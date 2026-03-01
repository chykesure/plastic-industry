import Ledger from "../models/Ledger.js";
import Supplier from "../models/Supplier.js";

// Fetch ledger for a supplier
export const getSupplierLedger = async (req, res) => {
  const { supplierId } = req.params;

  try {
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    const ledgerEntries = await Ledger.find({ supplier: supplierId }).sort({ date: 1 });

    res.json(ledgerEntries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch ledger" });
  }
};

// Create ledger entry (for purchase or payment)
export const createLedgerEntry = async (req, res) => {
  const { supplier, reference, amountIn, amountOut, date, note } = req.body;

  try {
    const newEntry = await Ledger.create({
      supplier,
      reference,
      amountIn: amountIn || 0,
      amountOut: amountOut || 0,
      date: date || Date.now(),
      note,
    });

    res.status(201).json(newEntry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create ledger entry" });
  }
};
