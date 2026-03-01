// src/controllers/productController.js
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Discount from "../models/Discount.js";
import ProductLedger from "../models/ProductLedger.js";   // ← ADD THIS LINE
import Ledger from "../models/Ledger.js";
// ------------------ Products ------------------

export const addProduct = async (req, res) => {
    try {
        console.log("Incoming Data:", req.body);

        const {
            name,
            sku,
            category,
            price,
            minQty,
            maxQty,
            expiryDate,
            description,
            costPrice,
            sellingPrice,
            markup,
            wholesalePrice,
            wholesalePack,
        } = req.body;

        if (!name || !sku)
            return res.status(400).json({ message: "Missing required fields" });

        const existing = await Product.findOne({ sku });
        if (existing)
            return res.status(400).json({ message: "SKU already exists" });

        const sellingPriceCalculated =
            costPrice + (costPrice * (markup || 1)) / 100;

        const product = new Product({
            name,
            sku,
            category,
            price,
            minQty,
            maxQty,
            expiryDate,
            description,
            costPrice,
            markup,
            sellingPrice: sellingPrice || sellingPriceCalculated,

            // ⭐ NEW FIELDS
            wholesalePrice: wholesalePrice || 0,
            wholesalePack: wholesalePack || 0,
        });

        if (req.file) {
            product.image = req.file.filename;
        }

        await product.save();
        res.status(201).json(product);
    } catch (err) {
        console.error("Error in addProduct:", err);
        res.status(500).json({ message: err.message });
    }
};

/*
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ name: 1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};*/

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ name: 1 }).lean();

        const productsWithStock = await Promise.all(
            products.map(async (product) => {
                const latest = await Ledger.findOne({ productId: product._id })
                    .sort({ createdAt: -1 })
                    .lean();

                return {
                    ...product,
                    currentStock: latest ? latest.balanceAfterStock : 0,
                };
            })
        );

        res.json(productsWithStock);
    } catch (err) {
        console.error("Error in getProducts:", err);
        res.status(500).json({ message: err.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id).populate(
            "category",
            "name"
        );
        if (!product)
            return res.status(404).json({ message: "Product not found" });

        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const sellingPriceCalculated =
            req.body.costPrice +
            (req.body.costPrice * (req.body.markup || 1)) / 100;

        const updateData = {
            name: req.body.name,
            sku: req.body.sku,
            category: req.body.category,
            costPrice: req.body.costPrice,
            markup: req.body.markup,
            sellingPrice: req.body.sellingPrice || sellingPriceCalculated,
            minQty: req.body.minQty,
            maxQty: req.body.maxQty,
            expiryDate: req.body.expiryDate,
            description: req.body.description,

            // ⭐ NEW FIELDS
            wholesalePrice: req.body.wholesalePrice || 0,
            wholesalePack: req.body.wholesalePack || 0,
        };

        if (req.file) {
            updateData.image = req.file.filename;
        }

        const product = await Product.findByIdAndUpdate(id, updateData, {
            new: true,
        });

        if (!product)
            return res.status(404).json({ message: "Product not found" });

        res.json({ message: "Product updated successfully", product });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndDelete(id);
        if (!product)
            return res.status(404).json({ message: "Product not found" });

        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ------------------ Categories ------------------

export const addCategory = async (req, res) => {
    try {
        const { name } = req.body;

        const existing = await Category.findOne({ name });
        if (existing)
            return res
                .status(400)
                .json({ message: "Category already exists" });

        const category = new Category({ name });
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const category = await Category.findByIdAndUpdate(
            id,
            { name },
            { new: true }
        );
        if (!category)
            return res.status(404).json({ message: "Category not found" });

        res.json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findByIdAndDelete(id);
        if (!category)
            return res.status(404).json({ message: "Category not found" });

        res.json({ message: "Category deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ------------------ Discounts ------------------

export const addDiscount = async (req, res) => {
    try {
        const { productId, discount, startDate, endDate } = req.body;

        const product = await Product.findById(productId);
        if (!product)
            return res.status(404).json({ message: "Product not found" });

        const newDiscount = new Discount({
            productId,
            discount,
            startDate,
            endDate,
        });
        await newDiscount.save();
        res.status(201).json(newDiscount);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getDiscounts = async (req, res) => {
    try {
        const discounts = await Discount.find().populate(
            "productId",
            "name sku price"
        );
        res.json(discounts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const discount = await Discount.findByIdAndUpdate(id, updateData, {
            new: true,
        });
        if (!discount)
            return res.status(404).json({ message: "Discount not found" });

        res.json(discount);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteDiscount = async (req, res) => {
    try {
        const { id } = req.params;

        const discount = await Discount.findByIdAndDelete(id);
        if (!discount)
            return res.status(404).json({ message: "Discount not found" });

        res.json({ message: "Discount deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
