import React, { useState } from "react";

function StockIn() {
  // Example suppliers
  const suppliers = [
    { id: 1, name: "Dairy Co." },
    { id: 2, name: "Bakery Supplies" },
  ];

  // Example products
  const initialProducts = [
    { id: 1, name: "Milk 1L", category: "Dairy", stock: 10, price: 200 },
    { id: 2, name: "Bread", category: "Bakery", stock: 20, price: 150 },
    { id: 3, name: "Eggs (12pcs)", category: "Dairy", stock: 15, price: 500 },
  ];

  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [products, setProducts] = useState(initialProducts);
  const [stockInItems, setStockInItems] = useState([]);
  const [stockHistory, setStockHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState({ type: "", message: "", visible: false });

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    visible: false,
    index: null,
    reference: "",
  });

  // Filtered products based on search
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show toast
  const showToast = (type, message) => {
    setToast({ type, message, visible: true });
    setTimeout(() => setToast({ type, message, visible: false }), 3000);
  };

  // Add product to stock-in list
  const addProductToStockIn = (product) => {
    if (!stockInItems.find((item) => item.id === product.id)) {
      setStockInItems([
        ...stockInItems,
        { ...product, qty: 1, discount: 0, vat: 0, highlighted: true },
      ]);
      // Remove highlight after 4 seconds
      setTimeout(() => {
        setStockInItems((prev) =>
          prev.map((i) =>
            i.id === product.id ? { ...i, highlighted: false } : i
          )
        );
      }, 4000);
    }
  };

  // Update quantity, discount, VAT
  const updateStockInItem = (id, key, value) => {
    setStockInItems(
      stockInItems.map((item) =>
        item.id === id ? { ...item, [key]: Number(value) } : item
      )
    );
  };

  // Remove item from stock-in list
  const removeStockInItem = (id) => {
    setStockInItems(stockInItems.filter((item) => item.id !== id));
  };

  // Calculate total for a single item
  const calculateTotal = (item) => {
    const base = item.price * item.qty;
    const discountAmount = (base * item.discount) / 100;
    const vatAmount = ((base - discountAmount) * item.vat) / 100;
    return base - discountAmount + vatAmount;
  };

  // Grand totals
  const subtotal = stockInItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const totalDiscount = stockInItems.reduce(
    (acc, item) => acc + (item.price * item.qty * item.discount) / 100,
    0
  );
  const totalVAT = stockInItems.reduce(
    (acc, item) =>
      acc +
      ((item.price * item.qty - (item.price * item.qty * item.discount) / 100) *
        item.vat) /
      100,
    0
  );
  const grandTotal = subtotal - totalDiscount + totalVAT;

  // Confirm Stock-In
  const confirmStockIn = () => {
    if (!selectedSupplier || !invoiceNumber || stockInItems.length === 0) {
      showToast(
        "error",
        "Please select supplier, invoice number, and add at least one product."
      );
      return;
    }

    // Update stock for each product
    const updatedProducts = products.map((p) => {
      const stockItem = stockInItems.find((item) => item.id === p.id);
      if (stockItem) return { ...p, stock: p.stock + stockItem.qty };
      return p;
    });
    setProducts(updatedProducts);

    // Add entry to stock history
    const newEntry = {
      supplier: suppliers.find((s) => s.id === Number(selectedSupplier))?.name || "",
      invoiceNumber,
      invoiceDate,
      items: stockInItems,
      grandTotal,
    };
    setStockHistory([...stockHistory, newEntry]);

    // Reset form
    setStockInItems([]);
    setInvoiceNumber("");
    setSelectedSupplier("");

    // Show frontend toast
    showToast("success", `Stock-In recorded successfully!`);
  };

  // Handle delete confirmation
  const handleDeleteConfirmed = () => {
    if (!deleteModal.reference.trim()) {
      showToast("error", "Please provide a reference to remove this entry.");
      return;
    }
    const newHistory = stockHistory.filter((_, idx) => idx !== deleteModal.index);
    setStockHistory(newHistory);
    setDeleteModal({ visible: false, index: null, reference: "" });
    showToast("success", "Stock-In entry removed successfully!");
  };

  return (
    <div className="p-6 space-y-6 relative">
      {/* Toast Message */}
      {toast.visible && (
        <div
          className={`fixed top-6 right-6 px-4 py-2 rounded shadow-lg z-[9999] ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
        >
          {toast.message}
        </div>
      )}


      {/* Supplier & Invoice */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col md:flex-row gap-4">
        <div>
          <label className="block text-gray-300">Supplier</label>
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="mt-1 p-2 rounded w-full bg-gray-700 text-white"
          >
            <option value="">Select Supplier</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-300">Invoice Number</label>
          <input
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            className="mt-1 p-2 rounded w-full bg-gray-700 text-white"
            placeholder="Enter Invoice #"
          />
        </div>
        <div>
          <label className="block text-gray-300">Invoice Date</label>
          <input
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            className="mt-1 p-2 rounded w-full bg-gray-700 text-white"
          />
        </div>
      </div>

      {/* Product Search */}
      <div className="flex justify-end">
        <input
          type="text"
          placeholder="Search product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white w-1/3"
        />
      </div>

      {/* Products Table */}
      <div className="overflow-auto bg-gray-800 rounded-lg p-4 shadow-md">
        <h2 className="text-green-400 font-semibold mb-4">Products</h2>
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-4 py-2 text-left">Product</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-center">Current Stock</th>
              <th className="px-4 py-2 text-center">Qty</th>
              <th className="px-4 py-2 text-center">Price</th>
              <th className="px-4 py-2 text-center">Discount %</th>
              <th className="px-4 py-2 text-center">VAT %</th>
              <th className="px-4 py-2 text-center">Total</th>
              <th className="px-4 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredProducts.map((p) => {
              const stockItem = stockInItems.find((item) => item.id === p.id);
              const isAdded = !!stockItem;
              return (
                <tr
                  key={p.id}
                  className={`hover:bg-gray-700 ${stockItem?.highlighted ? "bg-yellow-500/30" : ""
                    }`}
                >
                  <td className="px-2 py-1">{p.name}</td>
                  <td className="px-2 py-1">{p.category}</td>
                  <td className="px-2 py-1 text-center font-bold">{p.stock}</td>
                  <td className="px-2 py-1 text-center">
                    <input
                      type="number"
                      min="0"
                      value={stockItem?.qty || 0}
                      onChange={(e) => {
                        if (e.target.value < 0) return;
                        addProductToStockIn(p);
                        updateStockInItem(p.id, "qty", e.target.value);
                      }}
                      className="w-16 p-1 rounded bg-gray-700 text-white text-center"
                    />
                  </td>
                  <td className="px-2 py-1 text-center">{p.price}</td>
                  <td className="px-2 py-1 text-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={stockItem?.discount || 0}
                      onChange={(e) =>
                        updateStockInItem(p.id, "discount", e.target.value)
                      }
                      className="w-16 p-1 rounded bg-gray-700 text-white text-center"
                    />
                  </td>
                  <td className="px-2 py-1 text-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={stockItem?.vat || 0}
                      onChange={(e) => updateStockInItem(p.id, "vat", e.target.value)}
                      className="w-16 p-1 rounded bg-gray-700 text-white text-center"
                    />
                  </td>
                  <td className="px-2 py-1 text-center">
                    {calculateTotal(
                      stockItem || { price: p.price, qty: 0, discount: 0, vat: 0 }
                    )}
                  </td>
                  <td className="px-2 py-1 text-center flex justify-center gap-1">
                    <button
                      onClick={() =>
                        isAdded ? removeStockInItem(p.id) : addProductToStockIn(p)
                      }
                      className={`p-1 rounded ${isAdded
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                    >
                      {isAdded ? "Added" : "Add"}
                    </button>
                    {isAdded && (
                      <button
                        onClick={() => removeStockInItem(p.id)}
                        className="p-1 rounded bg-red-500 hover:bg-red-600 text-white"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary & Confirm */}
      <div className="flex justify-end items-center gap-6">
        <div className="space-y-1 text-right">
          <div>Subtotal: ₦{subtotal}</div>
          <div>Discount: ₦{totalDiscount}</div>
          <div>VAT: ₦{totalVAT}</div>
          <div className="font-bold text-green-400">Grand Total: ₦{grandTotal}</div>
        </div>
        <button
          onClick={confirmStockIn}
          className="bg-green-500 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
        >
          Confirm Stock-In
        </button>
      </div>

      {/* Stock-In Summary */}
      {stockHistory.length > 0 && (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md mt-6 overflow-x-auto">
          <h2 className="text-green-400 font-semibold mb-4">Stock-In Summary</h2>
          <table className="min-w-[900px] w-full table-fixed border-collapse">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-2 text-left w-1/5">Supplier</th>
                <th className="px-4 py-2 text-left w-1/5">Invoice #</th>
                <th className="px-4 py-2 text-left w-1/5">Date</th>
                <th className="px-4 py-2 text-left w-2/5">Products</th>
                <th className="px-4 py-2 text-right w-1/5">Grand Total</th>
                <th className="px-4 py-2 text-center w-1/6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {stockHistory.map((h, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-700 cursor-pointer"
                  onClick={() => {
                    // Restore info for editing
                    setSelectedSupplier(
                      suppliers.find((s) => s.name === h.supplier)?.id || ""
                    );
                    setInvoiceNumber(h.invoiceNumber);
                    setInvoiceDate(h.invoiceDate);
                    setStockInItems(h.items.map((i) => ({ ...i, highlighted: true })));
                    setTimeout(() => {
                      setStockInItems((prev) =>
                        prev.map((item) => ({ ...item, highlighted: false }))
                      );
                    }, 4000);
                  }}
                >
                  <td className="px-4 py-2 text-left">{h.supplier}</td>
                  <td className="px-4 py-2 text-left">{h.invoiceNumber}</td>
                  <td className="px-4 py-2 text-left">{h.invoiceDate}</td>
                  <td className="px-4 py-2 text-left">
                    {h.items.map((i) => `${i.name} x${i.qty}`).join(", ")}
                  </td>
                  <td className="px-4 py-2 text-right">₦{h.grandTotal}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click edit
                        setDeleteModal({ visible: true, index: idx, reference: "" });
                      }}
                      className="p-1 rounded bg-red-500 hover:bg-red-600 text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      {/* Delete Confirmation Modal */}
      {deleteModal.visible && (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-50 z-50">
          <div className="bg-gray-800 p-6 rounded shadow-lg w-96 space-y-4">
            <h3 className="text-white font-semibold text-lg">Confirm Deletion</h3>
            <p className="text-gray-300">
              Please provide a reference for removing this Stock-In entry:
            </p>
            <input
              type="text"
              value={deleteModal.reference}
              onChange={(e) =>
                setDeleteModal({ ...deleteModal, reference: e.target.value })
              }
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteModal({ visible: false, index: null, reference: "" })}
                className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StockIn;
