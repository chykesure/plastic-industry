import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    category: { type: String, required: true },

    minQty: { type: Number },
    maxQty: { type: Number },

    expiryDate: { type: Date },
    description: { type: String },

    costPrice: { type: Number, required: true },
    markup: { type: Number, default: 1 }, 

    sellingPrice: { type: Number, required: true },

    image: { type: String },

    // ✅ NEW FIELDS
    wholesalePrice: { type: Number, default: 0 },
    wholesalePack: { type: Number, default: 0 }, // units per pack
});

const Product = mongoose.model("Product", productSchema);
export default Product;
