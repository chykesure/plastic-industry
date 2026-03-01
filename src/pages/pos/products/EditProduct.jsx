import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EditProduct() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expiryEnabled, setExpiryEnabled] = useState(false);

  const [productData, setProductData] = useState({
    name: "",
    sku: "",
    category: "",
    costPrice: "",
    markup: 1,
    sellingPrice: "",
    minQty: "",
    maxQty: "",
    wholesalePrice: "",
    wholesalePack: "",
    expiryDate: "",
    description: "",
  });

  // load products & categories
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [productRes, categoryRes] = await Promise.all([
          axios.get("http://localhost:8080/api/products"),
          axios.get("http://localhost:8080/api/categories"),
        ]);
        setProducts(productRes.data || []);
        setCategories(categoryRes.data || []);
      } catch (err) {
        console.error("Error loading data:", err);
        toast.error("❌ Failed to fetch products or categories", { position: "top-right" });
      }
    };
    fetchInitialData();
  }, []);

  const generateSKU = (name) => {
    if (!name) return "";
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${name.substring(0, 3).toUpperCase()}-${randomNum}`;
  };

  // select product to edit
  const handleSelect = async (e) => {
    const productId = e.target.value;
    setSelectedProduct(productId);
    if (!productId) return;

    try {
      const res = await axios.get(`http://localhost:8080/api/products/${productId}`);
      const data = res.data;

      const cost = data.costPrice ?? 0;
      const selling = data.sellingPrice ?? 0;
      const markup = computeMarkup(cost, selling) || 0;

      setProductData({
        name: data.name || "",
        sku: data.sku || "",
        category: data.category?._id || data.category || "",
        costPrice: cost,
        markup, // ✅ set computed markup
        sellingPrice: selling,
        minQty: data.minQty ?? "",
        maxQty: data.maxQty ?? "",
        wholesalePrice: data.wholesalePrice ?? "",
        wholesalePack: data.wholesalePack ?? "",
        expiryDate: data.expiryDate ? data.expiryDate.slice(0, 10) : "",
        description: data.description || "",
      });

      setExpiryEnabled(!!data.expiryDate);
    } catch (err) {
      console.error("Error fetching product details:", err);
      toast.error("❌ Failed to load product details", { position: "top-right" });
    }
  };

  const computeMarkup = (costValue, sellingValue) => {
    const cost = parseFloat(costValue);
    const selling = parseFloat(sellingValue);
    if (!isFinite(cost) || cost <= 0 || !isFinite(selling)) return "";
    const markup = ((selling - cost) / cost) * 100;
    return Number.isFinite(markup) ? markup.toFixed(2) : "";
  };

  // handle all input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setProductData((prev) => {
      let updated = { ...prev, [name]: value };

      if (name === "costPrice") {
        updated.markup = computeMarkup(value, prev.sellingPrice) || prev.markup;
      }

      if (name === "sellingPrice") {
        updated.markup = computeMarkup(prev.costPrice, value);
      }

      if (name === "name" && !prev.sku) {
        updated.sku = generateSKU(value);
      }

      return updated;
    });
  };

  const handleExpiryToggle = (e) => {
    const checked = e.target.checked;
    setExpiryEnabled(checked);
    setProductData((prev) => ({ ...prev, expiryDate: checked ? prev.expiryDate : "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      toast.warn("⚠️ Please select a product to update", { position: "top-right" });
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSend = { ...productData };
      if (!expiryEnabled) delete dataToSend.expiryDate;
      if (dataToSend.markup === "") delete dataToSend.markup;

      await axios.put(`http://localhost:8080/api/products/${selectedProduct}`, dataToSend);

      toast.success("✅ Product updated successfully!", { position: "top-right" });

      const productRes = await axios.get("http://localhost:8080/api/products");
      setProducts(productRes.data || []);

      setSelectedProduct("");
      setExpiryEnabled(false);
      setProductData({
        name: "",
        sku: "",
        category: "",
        costPrice: "",
        markup: 1,
        sellingPrice: "",
        minQty: "",
        maxQty: "",
        wholesalePrice: "",
        wholesalePack: "",
        expiryDate: "",
        description: "",
      });
    } catch (err) {
      console.error("Error updating product:", err);
      toast.error(err.response?.data?.message || "❌ Failed to update product", { position: "top-right" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-9xl mx-auto bg-gray-900 p-6 rounded-lg shadow-md relative">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <h2 className="text-2xl font-bold mb-4 text-white">Edit Product</h2>
      <p className="text-gray-400 mb-6">Select a product and update its details below.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Dropdown */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Select Product</label>
          <select
            value={selectedProduct}
            onChange={handleSelect}
            required
            className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200"
          >
            <option value="">Choose product to edit</option>
            {products.map((prod) => (
              <option key={prod._id} value={prod._id}>
                {prod.name}
              </option>
            ))}
          </select>
        </div>

        {/* Name + SKU */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Product Name</label>
            <input
              type="text"
              name="name"
              value={productData.name}
              onChange={handleChange}
              required
              placeholder="Enter product name"
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">SKU / Barcode</label>
            <input
              type="text"
              name="sku"
              value={productData.sku}
              onChange={handleChange}
              required
              placeholder="Auto or manual SKU"
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200"
            />
          </div>
        </div>

        {/* Cost + Markup + Selling */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Cost Price</label>
            <input
              type="number"
              name="costPrice"
              value={productData.costPrice}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Markup (%)</label>
            <input
              type="text"
              name="markup"
              value={productData.markup}
              readOnly
              placeholder="Auto-calculated"
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Selling Price</label>
            <input
              type="number"
              name="sellingPrice"
              value={productData.sellingPrice}
              onChange={handleChange}
              placeholder="Auto or manual"
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Wholesale Price</label>
            <input
              type="number"
              name="wholesalePrice"
              value={productData.wholesalePrice}
              onChange={handleChange}
              placeholder="Enter wholesale price"
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Wholesale Pack (Qty)</label>
            <input
              type="number"
              name="wholesalePack"
              value={productData.wholesalePack}
              onChange={handleChange}
              placeholder="Units per pack"
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200"
            />
          </div>
        </div>
        {/* Wholesale Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        </div>

        {/* Min + Max + Category */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Min Quantity</label>
            <input
              type="number"
              name="minQty"
              value={productData.minQty}
              onChange={handleChange}
              required
              placeholder="Enter min qty"
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Max Quantity</label>
            <input
              type="number"
              name="maxQty"
              value={productData.maxQty}
              onChange={handleChange}
              required
              placeholder="Enter max qty"
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Category</label>
            <select
              name="category"
              value={productData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="inline-flex items-center gap-2 text-gray-300 mb-2">
              <input
                type="checkbox"
                checked={expiryEnabled}
                onChange={handleExpiryToggle}
                className="form-checkbox text-green-500 bg-gray-800 border-gray-600"
              />
              <span>Enable Expiry Date</span>
            </label>

            {expiryEnabled && (
              <input
                type="date"
                name="expiryDate"
                value={productData.expiryDate}
                onChange={handleChange}
                className="block w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200 mt-2"
              />
            )}
          </div>
        </div>



        {/* Expiry Toggle */}


        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Description</label>
          <textarea
            name="description"
            value={productData.description}
            onChange={handleChange}
            placeholder="Optional details"
            className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200"
          />
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full md:w-auto px-6 py-2 rounded-md text-white transition flex items-center justify-center gap-2 ${isSubmitting
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-500"
              }`}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Updating...
              </>
            ) : (
              "Update Product"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProduct;
