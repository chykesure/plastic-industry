import express from "express";
import multer from "multer"; // << add this
import Product from "../models/Product.js";
import Stock from "../models/Stock.js";
import {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  addDiscount,
  getDiscounts,
  updateDiscount,
  deleteDiscount,
  getProductById
} from "../controllers/productController.js";

const router = express.Router();

// -------------------
// Multer setup
// -------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"), // make sure uploads folder exists
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// -------------------
// Products
// -------------------
// Use upload.single("image") for handling image uploads
router.post("/products", upload.single("image"), addProduct);
router.get("/products", getProducts);
router.get("/products/:id", getProductById);
router.put("/products/:id", upload.single("image"), updateProduct); // handle image on update
router.delete("/products/:id", deleteProduct);

// -------------------
// Categories
// -------------------
router.post("/categories", addCategory);
router.get("/categories", getCategories);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

// -------------------
// Discounts
// -------------------
router.post("/discounts", addDiscount);
router.get("/discounts", getDiscounts);
router.put("/discounts/:id", updateDiscount);
router.delete("/discounts/:id", deleteDiscount);

// -------------------
// Products with stock
// -------------------
router.get("/products-with-stock", async (req, res) => {
  try {
    const products = await Product.find();
    const stock = await Stock.find();

    const stockMap = stock.reduce((acc, s) => {
      acc[s.productId] = s.stockBalance;
      return acc;
    }, {});

    const productsWithStock = products.map(p => ({
      ...p._doc,
      stock: stockMap[p._id] || 0
    }));

    res.json(productsWithStock);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch products with stock" });
  }
});

export default router;
