import React, { useState } from "react";

// ✅ Modern Toast Component with Icons
function Toast({ message, type }) {
  return (
    <div
      className={`fixed top-5 right-5 z-[9999] flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-white ${
        type === "success" ? "bg-green-600" : "bg-red-600"
      } animate-fadeInOut`}
    >
      {type === "success" ? "✅" : "⚠️"} {message}
    </div>
  );
}

export default function StockOutPage() {
  // Dummy products
  const [products, setProducts] = useState([
    { id: 1, name: "Milk", stock: 10 },
    { id: 2, name: "Bread", stock: 20 },
    { id: 3, name: "Butter", stock: 15 },
  ]);

  // Stock-out states
  const [selectedProduct, setSelectedProduct] = useState("");
  const [qty, setQty] = useState(1);
  const [stockOutItems, setStockOutItems] = useState([]);
  const [stockHistory, setStockHistory] = useState([]);

  // Toast states
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 2500);
  };

  // ✅ Add product to Stock-Out list
  const addStockItem = () => {
    if (!selectedProduct || qty <= 0) {
      showToast("error", "Please select a product and valid quantity.");
      return;
    }

    const product = products.find((p) => p.id === Number(selectedProduct));
    if (qty > product.stock) {
      showToast("error", "Not enough stock available.");
      return;
    }

    const existing = stockOutItems.find(
      (item) => item.id === Number(selectedProduct)
    );
    if (existing) {
      const updated = stockOutItems.map((item) =>
        item.id === Number(selectedProduct)
          ? { ...item, qty: item.qty + qty }
          : item
      );
      setStockOutItems(updated);
    } else {
      setStockOutItems([...stockOutItems, { ...product, qty }]);
    }

    setSelectedProduct("");
    setQty(1);
    showToast("success", "Product added to Stock-Out list.");
  };

  // ✅ Remove product row
  const removeStockItem = (id) => {
    setStockOutItems(stockOutItems.filter((item) => item.id !== id));
  };

  // ✅ Confirm Stock-Out
  const confirmStockOut = () => {
    if (stockOutItems.length === 0) {
      showToast("error", "Please add at least one product.");
      return;
    }

    // Deduct from stock
    const updatedProducts = products.map((p) => {
      const stockItem = stockOutItems.find((item) => item.id === p.id);
      if (stockItem) return { ...p, stock: p.stock - stockItem.qty };
      return p;
    });
    setProducts(updatedProducts);

    // Add to history
    setStockHistory([
      ...stockHistory,
      {
        date: new Date().toLocaleString(),
        items: stockOutItems,
      },
    ]);

    // Reset form
    setStockOutItems([]);
    showToast("success", "Stock-Out recorded successfully!");
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-gray-100">
      {/* Toast */}
      {toast.show && <Toast message={toast.message} type={toast.type} />}

      <h1 className="text-3xl font-bold mb-6 text-green-400">📤 Stock-Out</h1>

      {/* Add Product */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="p-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-100 shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none flex-1"
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (Stock: {p.stock})
            </option>
          ))}
        </select>

        <input
          type="number"
          min="1"
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="p-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-100 shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none w-32"
        />

        <button
          onClick={addStockItem}
          className="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition"
        >
          ➕ Add Item
        </button>
      </div>

      {/* Stock-Out Table */}
      {stockOutItems.length > 0 && (
        <div className="overflow-auto rounded-lg shadow border border-gray-700 mb-6">
          <table className="w-full">
            <thead className="bg-gray-800 text-gray-200">
              <tr>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Quantity</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {stockOutItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-700 transition-colors">
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{item.qty}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => removeStockItem(item.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                    >
                      ❌ Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm Button */}
      <button
        onClick={confirmStockOut}
        className="bg-green-600 text-white px-8 py-3 rounded-lg shadow hover:bg-green-700 transition"
      >
        ✅ Confirm Stock-Out
      </button>

      {/* Stock History */}
      <h2 className="text-2xl font-semibold mt-10 mb-4 text-green-400">
        📜 Stock-Out History
      </h2>
      {stockHistory.length === 0 ? (
        <p className="text-gray-400">No stock-out records yet.</p>
      ) : (
        <div className="space-y-4">
          {stockHistory.map((h, i) => (
            <div
              key={i}
              className="border border-gray-700 p-4 rounded-lg bg-gray-800 shadow-sm"
            >
              <p className="text-gray-300">
                <strong>Date:</strong> {h.date}
              </p>
              <ul className="list-disc ml-6 mt-2 text-gray-400">
                {h.items.map((it, idx) => (
                  <li key={idx}>
                    {it.name} -{" "}
                    <span className="font-semibold text-green-400">
                      {it.qty}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ✅ Toast Animation
const style = document.createElement("style");
style.innerHTML = `
@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-10px); }
  10%, 90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-10px); }
}
.animate-fadeInOut {
  animation: fadeInOut 2.5s ease-in-out forwards;
}
`;
document.head.appendChild(style);
