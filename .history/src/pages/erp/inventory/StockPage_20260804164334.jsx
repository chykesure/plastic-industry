// StockPage (corrected)
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { UserPlus, Trash2, Edit3, Check, X } from "lucide-react";

// -----------------------------
// Config
// -----------------------------
const API_BASE = "http://localhost:8080";

// -----------------------------
// Helper to format money
// -----------------------------
const formatMoney = (amount) => {
  const num = Number(amount) || 0;
  return `₦${new Intl.NumberFormat("en-NG").format(num)}`;
};

// -----------------------------
// Reusable UI Components
// -----------------------------
const Button = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`px-4 py-2 rounded-lg text-white font-medium shadow-sm transition ${className}`}
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl shadow-md border border-gray-700 bg-gray-800 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

// -----------------------------
// StockPage Component
// -----------------------------
const StockPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(
    localStorage.getItem("selectedSupplier") || ""
  );
  const [supplierSearch, setSupplierSearch] = useState("");
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);

  const [cartItems, setCartItems] = useState(
    JSON.parse(localStorage.getItem("cartItems") || "[]")
  );

  const [currentItem, setCurrentItem] = useState({
    productId: "",
    name: "",
    sku: "",
    quantity: 1,
    costPrice: 0,
    sellingPrice: 0,
    wholesalePrice: 0,
    wholesalePackSize: 0,
    markup: 0,
    subtotal: 0,
    currentStock: 0,
    projectedBalance: 0,
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [editForm, setEditForm] = useState({
    quantity: 0,
    costPrice: 0,
    sellingPrice: 0,
    wholesalePrice: 0,
    wholesalePackSize: 1,
    markup: 0,
  });


  const wrapperRef = useRef(null);

  // -----------------------------
  // Fetch suppliers & products
  // -----------------------------
  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedSupplier && suppliers.length > 0) {
      const found = suppliers.find((s) => s._id === selectedSupplier);
      if (found) setSupplierSearch(found.name);
    }
  }, [selectedSupplier, suppliers]);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    setTotalAmount(cartItems.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0));
  }, [cartItems]);

  useEffect(() => {
    if (selectedSupplier) localStorage.setItem("selectedSupplier", selectedSupplier);
    else localStorage.removeItem("selectedSupplier");
  }, [selectedSupplier]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) {
        setShowSupplierDropdown(false);
        setShowProductDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/suppliers`);
      setSuppliers(res.data || []);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/products`);
      setProducts(res.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // -----------------------------
  // Helper: Calculate derived fields
  // -----------------------------
  // Recalculate total amount whenever cartItems change
  useEffect(() => {
    const fixedCart = cartItems.map(item => {
      const qty = Number(item.quantity) || 0;
      const cost = Number(item.costPrice) || 0;

      return {
        ...item,
        subtotal: Number((qty * cost).toFixed(2)),
      };
    });

    setCartItems(fixedCart);
  }, []); // <- IMPORTANT: empty array means run ONCE


  const calculateDerived = (item) => {
    const cost = Number(item.costPrice) || 0;
    const selling = Number(item.sellingPrice) || 0;
    const qty = Number(item.quantity) || 0;
    const markup = Number(item.markup) || 0;

    // Recalculate selling price if markup changed
    if (item._recalcSelling) {
      item.sellingPrice = Number((cost + (cost * markup) / 100).toFixed(2));
    }

    // Recalculate markup if cost/selling changed
    if (item._recalcMarkup) {
      item.markup = cost > 0 ? Number((((selling - cost) / cost) * 100).toFixed(2)) : 0;
    }

    // Clamp wholesalePrice
    if (Number(item.wholesalePrice) > item.sellingPrice) {
      item.wholesalePrice = item.sellingPrice;
    }

    item.subtotal = Number((qty * cost).toFixed(2));
    item.projectedBalance = (Number(item.currentStock) || 0) + qty;

    // cleanup temporary flags
    delete item._recalcMarkup;
    delete item._recalcSelling;

    return item;
  };

  // -----------------------------
  // Product selection
  // -----------------------------
  const handleProductSelect = (productId) => {
    const selected = products.find((p) => p._id === productId);
    if (selected) {
      setCurrentItem(
        calculateDerived({
          productId: selected._id,
          name: selected.name,
          sku: selected.sku,
          costPrice: Number(selected.costPrice) || 0,
          sellingPrice: Number(selected.sellingPrice) || 0,
          quantity: 1,
          currentStock: Number(selected.stockBalance) || 0,
          wholesalePrice: Number(selected.wholesalePrice) || 0,
          wholesalePackSize: Number(selected.wholesalePack ?? 1),
          markup:
            selected.costPrice && selected.sellingPrice
              ? Number((((selected.sellingPrice - selected.costPrice) / selected.costPrice) * 100).toFixed(2))
              : 0,
          subtotal: Number(selected.costPrice) || 0,
          projectedBalance: (Number(selected.stockBalance) || 0) + 1,
        })
      );
    }
  };

  // -----------------------------
  // Handle changes to current item
  // -----------------------------
  const handleCurrentItemChange = (field, value) => {
    const numericFields = ["quantity", "costPrice", "sellingPrice", "wholesalePrice", "wholesalePackSize", "markup"];
    const parsedValue = numericFields.includes(field) ? (value === "" ? "" : Number(value)) : value;
    const updated = { ...currentItem, [field]: parsedValue };

    // flags to recalc
    if (field === "costPrice" || field === "sellingPrice") updated._recalcMarkup = true;
    if (field === "markup") updated._recalcSelling = true;

    setCurrentItem(calculateDerived(updated));
  };

  // -----------------------------
  // Add to cart
  // -----------------------------
  const addToCart = () => {
    if (!currentItem.productId) return alert("Please select a product.");
    if (Number(currentItem.quantity) <= 0) return alert("Quantity must be at least 1.");
    if (Number(currentItem.costPrice) <= 0) return alert("Cost must be greater than 0.");
    if (Number(currentItem.sellingPrice) <= 0) return alert("Selling Price must be greater than 0.");

    setCartItems([...cartItems, { ...currentItem }]);
    setCurrentItem({
      productId: "",
      name: "",
      sku: "",
      quantity: 1,
      costPrice: 0,
      sellingPrice: 0,
      markup: 0,
      wholesalePrice: 0,
      wholesalePackSize: 1,
      subtotal: 0,
      currentStock: 0,
      projectedBalance: 0,
    });
    setFilteredProducts([]);
    setShowProductDropdown(false);
  };

  // -----------------------------
  // Remove from cart
  // -----------------------------
  const removeFromCart = (index) => {
    const newCart = cartItems.filter((_, i) => i !== index);
    setCartItems(newCart);
  };

  // -----------------------------
  // Confirm stock
  // -----------------------------
  const confirmToStock = async () => {
    if (!selectedSupplier) return alert("Select a supplier");
    if (!referenceNumber) return alert("Enter a reference number");
    if (!cartItems.length) return alert("Add items to cart first");

    setIsSaving(true);
    try {
      await axios.post(`${API_BASE}/stock/invoice/save`, {
        supplierId: selectedSupplier,
        items: cartItems,
        totalAmount,
        referenceNumber,
      });

      Swal.fire({
        title: "✅ Stock Added Successfully!",
        html: `
          <p style="font-size: 16px; margin: 10px 0;">
            <strong>Reference Number:</strong> <span style="color: #10b981;">${referenceNumber}</span>
          </p>
          <p style="font-size: 14px; color: #6b7280;">
            Total Amount: <strong style="color:#10b981;">${formatMoney(totalAmount)}</strong>
          </p>
        `,
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#059669",
        background: "#111827",
        color: "#d1fae5",
      });

      setCartItems([]);
      setSelectedSupplier("");
      setReferenceNumber("");
      setTotalAmount(0);
      localStorage.removeItem("cartItems");
      localStorage.removeItem("selectedSupplier");
      setShowAddModal(false);
    } catch (err) {
      console.error("Error saving stock invoice:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save stock. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // -----------------------------
  // Supplier filter & select
  // -----------------------------
  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes((supplierSearch || "").toLowerCase())
  );

  const handleSupplierSelect = (supplier) => {
    setSelectedSupplier(supplier._id);
    setSupplierSearch(supplier.name);
    setShowSupplierDropdown(false);
  };


  // -----------------------------
  // Edit cart item
  // -----------------------------
  const startEditing = (index) => {
    setEditingIndex(index);
    setEditErrors({});
  };

  const handleEditField = (index, field, value) => {
    const updated = [...cartItems];
    let item = { ...updated[index] };

    const numericFields = ["quantity", "costPrice", "sellingPrice", "wholesalePrice", "markup", "wholesalePackSize"];
    const parsedValue = numericFields.includes(field) ? Number(value) || 0 : value;
    item[field] = parsedValue;

    // flags for recalculation
    if (field === "costPrice" || field === "sellingPrice") item._recalcMarkup = true;
    if (field === "markup") item._recalcSelling = true;

    item = calculateDerived(item);

    // Validation + SweetAlert
    if (item.costPrice > item.sellingPrice) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Cost price cannot be greater than Selling Price!",
        background: "#111827",
        color: "#f87171",
        confirmButtonColor: "#f87171",
      });
      return; // Don't save invalid value
    }

    if (item.wholesalePrice > item.sellingPrice) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Wholesale price cannot exceed Selling Price!",
        background: "#111827",
        color: "#f87171",
        confirmButtonColor: "#f87171",
      });
      return;
    }

    updated[index] = item;
    setCartItems(updated);
  };


  const saveEdit = () => {
    if (Object.keys(editErrors).length > 0) return;
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    setEditingIndex(null);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditErrors({});
  };

  return (
    <div ref={wrapperRef}>
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-semibold text-emerald-400">Stock Entry</h2>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <UserPlus className="w-4 h-4" /> Add Stock
        </Button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-gray-900 border border-gray-700 w-full h-full rounded-none shadow-2xl overflow-y-auto p-6 space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <h3 className="text-2xl font-semibold bg-gradient-to-r from-emerald-400 to-teal-500 text-transparent bg-clip-text">
                Add Stock Items
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-red-500 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Supplier Search Input */}
            <div className="relative mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Supplier</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Search supplier..."
                  value={supplierSearch}
                  onChange={(e) => {
                    setSupplierSearch(e.target.value);
                    setShowSupplierDropdown(true);
                    setSelectedSupplier("");
                  }}
                  onFocus={() => setShowSupplierDropdown(true)}
                  className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
                {showSupplierDropdown && filteredSuppliers.length > 0 && (
                  <ul className="absolute left-0 right-0 z-20 mt-1 bg-gray-900 border border-gray-700 rounded-xl shadow-lg overflow-y-auto max-h-48">
                    {filteredSuppliers.map((supplier) => (
                      <li
                        key={supplier._id}
                        onClick={() => handleSupplierSelect(supplier)}
                        className="px-4 py-2 hover:bg-emerald-700/40 cursor-pointer text-gray-200 transition"
                      >
                        {supplier.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Product Entry Form */}
            <div className="grid grid-cols-6 gap-4 items-end">
              {/* Reference Number */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Reference No.</label>
                <input
                  type="text"
                  placeholder="e.g. INV-2025-001"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
              </div>

              {/* Product Search */}
              <div className="relative col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Product</label>
                <input
                  type="text"
                  placeholder="🔍 Search product..."
                  value={currentItem.name}
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase();
                    const filtered = products.filter((p) => p.name.toLowerCase().includes(value));
                    setCurrentItem({ ...currentItem, name: e.target.value });
                    setFilteredProducts(filtered);
                    setShowProductDropdown(true);
                  }}
                  onFocus={() => setShowProductDropdown(true)}
                  className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />

                {showProductDropdown && filteredProducts.length > 0 && (
                  <ul className="absolute left-0 right-0 z-20 mt-1 bg-gray-900 border border-gray-700 rounded-xl shadow-lg overflow-y-auto max-h-48">
                    {filteredProducts.map((p) => (
                      <li
                        key={p._id}
                        onClick={() => {
                          handleProductSelect(p._id);
                          setFilteredProducts([]);
                          setShowProductDropdown(false);
                        }}
                        className="px-4 py-2 hover:bg-emerald-700/40 cursor-pointer text-gray-200 transition"
                      >
                        {p.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* SKU */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">SKU</label>
                <input
                  type="text"
                  value={currentItem.sku}
                  disabled
                  className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-gray-400 placeholder-gray-500 cursor-not-allowed"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Qty</label>
                <input
                  type="number"
                  min="1"
                  value={currentItem.quantity}
                  onChange={(e) => handleCurrentItemChange("quantity", e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-800/80 border border-gray-700 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>

              {/* Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Cost (₦)</label>
                <input
                  type="number"
                  min="0"
                  value={currentItem.costPrice}
                  onChange={(e) => handleCurrentItemChange("costPrice", e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-800/80 border border-gray-700 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>

              {/* Selling Price */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Selling Price (₦)</label>
                <input
                  type="number"
                  min="0"
                  value={currentItem.sellingPrice}
                  onChange={(e) => handleCurrentItemChange("sellingPrice", e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-800/80 border border-gray-700 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>

              {/* Wholesale Price */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Wholesale Price (₦)</label>
                <input
                  type="number"
                  min="0"
                  value={currentItem.wholesalePrice}
                  onChange={(e) => handleCurrentItemChange("wholesalePrice", e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-800/80 border border-gray-700 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>

              {/* Wholesale Pack Size */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Wholesale Pack Size</label>
                <input
                  type="number"
                  min="1"
                  value={currentItem.wholesalePackSize}
                  onChange={(e) => handleCurrentItemChange("wholesalePackSize", e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-800/80 border border-gray-700 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>

              {/* Markup % */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Markup (%)</label>
                <input
                  type="number"
                  value={currentItem.markup}
                  onChange={(e) => handleCurrentItemChange("markup", e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-800/80 border border-gray-700 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>

              {/* Add Button */}
              <div className="col-span-6 flex justify-end">
                <button
                  onClick={addToCart}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold rounded-xl shadow-md hover:shadow-emerald-500/30 transition-all"
                >
                  + Add to Cart
                </button>
              </div>
            </div>

            {/* Cart Table */}
            {cartItems.length > 0 && (
              <div className="mt-8">
                <div className="rounded-xl border border-gray-700 overflow-hidden shadow-lg">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-800 text-gray-300 sticky top-0 z-10">
                      <tr className="text-sm uppercase tracking-wide">
                        <th className="px-4 py-3 text-left">S/N</th>
                        <th className="px-4 py-3 text-left">Product</th>
                        <th className="px-4 py-3 text-left">SKU</th>
                        <th className="px-4 py-3 text-center">Qty</th>
                        <th className="px-4 py-3 text-right">Cost</th>
                        <th className="px-4 py-3 text-right">Selling</th>
                        <th className="px-4 py-3 text-right">Wholesale</th>
                        <th className="px-4 py-3 text-center">Pack</th>
                        <th className="px-4 py-3 text-center">Markup %</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3 text-center">Projected</th>
                        <th className="px-4 py-3 text-center">Action</th>
                      </tr>
                    </thead>

                    <tbody className="text-gray-200">
                      {cartItems.map((item, index) => {
                        const isEditing = editingIndex === index;

                        return (
                          <tr
                            key={item.productId || index}
                            className="border-t border-gray-700 hover:bg-gray-800/70 transition-all"
                          >
                            <td className="px-4 py-3">{index + 1}</td>
                            <td className="px-4 py-3 font-medium text-emerald-300">{item.name}</td>
                            <td className="px-4 py-3">{item.sku}</td>

                            {/* QUANTITY */}
                            <td className="px-4 py-3 text-center">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editForm.quantity}
                                  min={1}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, quantity: Number(e.target.value) })
                                  }
                                  className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-center w-20"
                                />
                              ) : (
                                item.quantity
                              )}
                            </td>

                            {/* COST PRICE */}
                            <td className="px-4 py-3 text-right">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editForm.costPrice}
                                  min={0}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (val >= editForm.sellingPrice) {
                                      Swal.fire({
                                        icon: "error",
                                        title: "Oops!",
                                        text: "Cost Price must be strictly less than Selling Price!",
                                        background: "#111827",
                                        color: "#f87171",
                                        confirmButtonColor: "#f87171",
                                      });
                                      return;
                                    }
                                    setEditForm({ ...editForm, costPrice: val });
                                  }}
                                  className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-right w-24"
                                />
                              ) : (
                                formatMoney(item.costPrice)
                              )}
                            </td>

                            {/* SELLING PRICE */}
                            <td className="px-4 py-3 text-right">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editForm.sellingPrice}
                                  min={0}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (val <= editForm.costPrice) {
                                      Swal.fire({
                                        icon: "error",
                                        title: "Oops!",
                                        text: "Selling Price must be strictly greater than Cost Price!",
                                        background: "#111827",
                                        color: "#f87171",
                                        confirmButtonColor: "#f87171",
                                      });
                                      return;
                                    }
                                    if (val <= editForm.wholesalePrice) {
                                      Swal.fire({
                                        icon: "error",
                                        title: "Oops!",
                                        text: "Selling Price must be strictly greater than Wholesale Price!",
                                        background: "#111827",
                                        color: "#f87171",
                                        confirmButtonColor: "#f87171",
                                      });
                                      return;
                                    }
                                    setEditForm({ ...editForm, sellingPrice: val });
                                  }}
                                  className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-right w-24"
                                />
                              ) : (
                                formatMoney(item.sellingPrice)
                              )}
                            </td>

                            {/* WHOLESALE PRICE */}
                            <td className="px-4 py-3 text-right">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editForm.wholesalePrice}
                                  min={0}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (val >= editForm.sellingPrice) {
                                      Swal.fire({
                                        icon: "error",
                                        title: "Oops!",
                                        text: "Wholesale Price must be strictly less than Selling Price!",
                                        background: "#111827",
                                        color: "#f87171",
                                        confirmButtonColor: "#f87171",
                                      });
                                      return;
                                    }
                                    setEditForm({ ...editForm, wholesalePrice: val });
                                  }}
                                  className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-right w-24"
                                />
                              ) : (
                                formatMoney(item.wholesalePrice)
                              )}
                            </td>

                            {/* PACK SIZE */}
                            <td className="px-4 py-3 text-center">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editForm.wholesalePackSize}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, wholesalePackSize: Number(e.target.value) })
                                  }
                                  className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-center w-20"
                                />
                              ) : (
                                item.wholesalePackSize
                              )}
                            </td>

                            {/* MARKUP */}
                            <td className="px-4 py-3 text-center">
                              {isEditing
                                ? (
                                  <input
                                    type="number"
                                    value={editForm.markup}
                                    onChange={(e) =>
                                      setEditForm({ ...editForm, markup: Number(e.target.value) })
                                    }
                                    className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-center w-20"
                                  />
                                ) : (
                                  `${((item.sellingPrice - item.costPrice) / item.costPrice * 100).toFixed(2)}%`
                                )}
                            </td>

                            {/* SUBTOTAL */}
                            <td className="px-4 py-3 text-right font-semibold text-emerald-400">
                              {formatMoney(isEditing ? editForm.quantity * editForm.costPrice : item.subtotal)}
                            </td>

                            {/* PROJECTED BALANCE */}
                            <td className="px-4 py-3 text-center">{item.projectedBalance}</td>

                            {/* ACTIONS */}
                            <td className="px-4 py-3 text-center flex items-center gap-3 justify-center">
                              {!isEditing ? (
                                <Edit3
                                  className="w-5 h-5 text-blue-400 cursor-pointer hover:text-blue-300 transition"
                                  onClick={() => {
                                    setEditingIndex(index);
                                    setEditForm({ ...item });
                                  }}
                                />
                              ) : (
                                <>
                                  <Check
                                    className="w-5 h-5 text-emerald-400 cursor-pointer hover:text-emerald-300"
                                    onClick={() => {
                                      const updatedCart = [...cartItems];
                                      updatedCart[index] = {
                                        ...editForm,
                                        subtotal: editForm.quantity * editForm.costPrice,
                                      };
                                      setCartItems(updatedCart);
                                      localStorage.setItem("cartItems", JSON.stringify(updatedCart));
                                      setEditingIndex(null);
                                    }}
                                  />
                                  <X
                                    className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-400"
                                    onClick={() => setEditingIndex(null)}
                                  />
                                </>
                              )}

                              <Trash2
                                className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-400 transition"
                                onClick={() => {
                                  const newCart = cartItems.filter((_, i) => i !== index);
                                  setCartItems(newCart);
                                  localStorage.setItem("cartItems", JSON.stringify(newCart));
                                }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Footer Section */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-700">
              <div className="text-lg font-semibold">
                Total: <span className="text-emerald-400">{formatMoney(totalAmount)}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmToStock}
                  disabled={isSaving}
                  className={`px-5 py-2 ${isSaving ? "opacity-60 cursor-not-allowed" : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
                    } rounded-lg text-white font-semibold shadow-md hover:shadow-emerald-500/30 transition`}
                >
                  {isSaving ? "Saving..." : "Confirm to Stock"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockPage;
