import Purchase from "../models/Purchase.js";
import Supplier from "../models/Supplier.js";

// @desc    Get all purchases
// @route   GET /api/purchases
// @access  Public
export const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find().populate("supplier", "name email phone");
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create a new purchase
// @route   POST /api/purchases
// @access  Public
export const createPurchase = async (req, res) => {
  try {
    const { reference, supplier, date, status } = req.body;

    const newPurchase = await Purchase.create({ reference, supplier, date, status });
    const populatedPurchase = await newPurchase.populate("supplier", "name email phone");
    
    res.status(201).json(populatedPurchase);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update a purchase
// @route   PUT /api/purchases/:id
// @access  Public
export const updatePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) return res.status(404).json({ message: "Purchase not found" });

    const { reference, supplier, date, status } = req.body;

    purchase.reference = reference || purchase.reference;
    purchase.supplier = supplier || purchase.supplier;
    purchase.date = date || purchase.date;
    purchase.status = status || purchase.status;

    const updatedPurchase = await purchase.save();
    const populatedPurchase = await updatedPurchase.populate("supplier", "name email phone");

    res.json(populatedPurchase);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete a purchase
// @route   DELETE /api/purchases/:id
// @access  Public
export const deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) return res.status(404).json({ message: "Purchase not found" });

    await purchase.remove();
    res.json({ message: "Purchase deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
