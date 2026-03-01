import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AddProduct() {
  const [product, setProduct] = useState({
    name: "",
    sku: "",
    costPrice: "",
    sellingPrice: "",
    markup: "",
    category: "",
    minQty: "",
    maxQty: "",
    expiryDate: "",
    description: "",
    // --- New wholesale fields ---
    wholesalePrice: "",
    wholesalePack: "",
  });

  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExpiry, setHasExpiry] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/categories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  const generateSKU = (name) => {
    if (!name) return "";
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${name.substring(0, 3).toUpperCase()}-${randomNum}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProduct((prev) => {
      const updated = { ...prev, [name]: value };

      const cost = parseFloat(name === "costPrice" ? value : prev.costPrice);
      const selling = parseFloat(name === "sellingPrice" ? value : prev.sellingPrice);

      if (cost > 0 && selling > 0) {
        const markup = ((selling - cost) / cost) * 100;
        updated.markup = markup.toFixed(2);
      } else {
        updated.markup = "";
      }

      if (name === "name" && !prev.sku) {
        updated.sku = generateSKU(value);
      }

      return updated;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !product.name ||
      !product.sku ||
      !product.costPrice ||
      !product.sellingPrice ||
      !product.category
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();

      Object.keys(product).forEach((key) => {
        let value = product[key];

        // Convert numeric fields to numbers
        if (
          [
            "costPrice",
            "sellingPrice",
            "markup",
            "minQty",
            "maxQty",
            "wholesalePrice",
            "wholesalePack",
          ].includes(key)
        ) {
          value = value ? Number(value) : 0;
        }

        formData.append(key, value);
      });

      if (image) {
        formData.append("image", image);
      }

      const res = await axios.post(
        "http://localhost:8080/api/products",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success(`✅ Product "${res.data.name}" added successfully!`);

      // Reset form
      setProduct({
        name: "",
        sku: "",
        costPrice: "",
        sellingPrice: "",
        markup: "",
        category: "",
        minQty: "",
        maxQty: "",
        expiryDate: "",
        description: "",
        wholesalePrice: "",
        wholesalePack: "",
      });
      setHasExpiry(false);
      setImage(null);
      setPreview(null);
    } catch (err) {
      console.error("Error adding product:", err);
      toast.error(err.response?.data?.message || "Error adding product");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="max-w-9xl mx-auto bg-gray-900 p-6 rounded-lg shadow-md text-gray-200">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
      <p className="text-gray-400 mb-6">
        Fill in the details below to add a new product to your inventory.
      </p>

      <form onSubmit={handleSubmit} className="grid gap-8">
        {/* Row 1: Name + SKU */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 text-gray-300">Product Name</label>
            <input
              type="text"
              name="name"
              value={product.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-300">SKU / Barcode</label>
            <input
              type="text"
              name="sku"
              value={product.sku}
              onChange={handleChange}
              placeholder="Auto-generated or enter manually"
              required
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-300">Cost Price</label>
            <input
              type="number"
              name="costPrice"
              value={product.costPrice}
              onChange={handleChange}
              placeholder="Enter cost price"
              required
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700"
            />
          </div>


        </div>

        {/* Row 2: Cost + Selling + Markup */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block mb-1 text-gray-300">Selling Price</label>
            <input
              type="number"
              name="sellingPrice"
              value={product.sellingPrice}
              onChange={handleChange}
              placeholder="Enter selling price"
              required
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-300">Markup (%)</label>
            <input
              type="text"
              name="markup"
              value={product.markup}
              readOnly
              placeholder="Auto-calculated"
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 cursor-not-allowed text-gray-400"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-300">Wholesale Pack (Units)</label>
            <input
              type="number"
              name="wholesalePack"
              value={product.wholesalePack}
              onChange={handleChange}
              placeholder="Enter units per pack"
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-300">Wholesale Price</label>
            <input
              type="number"
              name="wholesalePrice"
              value={product.wholesalePrice}
              onChange={handleChange}
              placeholder="Price per pack"
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700"
            />
          </div>
        </div>

        {/* Row 3: Category + Expiry */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div>
            <label className="block mb-1 text-gray-300">Category</label>
            <select
              name="category"
              value={product.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-gray-300 flex items-center gap-2">
              <input
                type="checkbox"
                checked={hasExpiry}
                onChange={(e) => {
                  setHasExpiry(e.target.checked);
                  if (!e.target.checked) {
                    setProduct((prev) => ({ ...prev, expiryDate: "" }));
                  }
                }}
              />
              Has Expiry Date?
            </label>
            <input
              type="date"
              name="expiryDate"
              value={product.expiryDate}
              onChange={handleChange}
              disabled={!hasExpiry}
              className={`w-full px-3 py-2 rounded-md border border-gray-700 ${hasExpiry
                ? "bg-gray-800 text-gray-200"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
                }`}
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-300">Min Quantity</label>
            <input
              type="number"
              name="minQty"
              value={product.minQty}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-300">Max Quantity</label>
            <input
              type="number"
              name="maxQty"
              value={product.maxQty}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700"
            />
          </div>
        </div>

        {/* Row 4: Min/Max Qty + Wholesale */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">


        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 text-gray-300">Description</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700"
            placeholder="Enter product description"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block mb-1 text-gray-300">Product Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-2 w-32 h-32 object-cover rounded-md border border-gray-700"
            />
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full md:w-auto px-6 py-2 rounded-md text-white transition ${isSubmitting
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500"
              }`}
          >
            {isSubmitting ? "Adding Product..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProduct;
