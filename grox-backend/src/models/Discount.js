// Discount.js
import mongoose from "mongoose";

const discountSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  discount: Number,
  startDate: Date,
  endDate: Date,
});

const Discount = mongoose.model("Discount", discountSchema);
export default Discount;
