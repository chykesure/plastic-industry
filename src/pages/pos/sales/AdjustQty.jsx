// src/pages/pos/sales/AdjustQty.jsx
import React, { useState } from "react";

function AdjustQty() {
  // Sample cart items (replace with your real state/context)
  const [cartItems, setCartItems] = useState([
    { id: 1, name: "Milk 1L", quantity: 2, price: 200 },
    { id: 2, name: "Bread", quantity: 1, price: 150 },
    { id: 3, name: "Eggs (12pcs)", quantity: 3, price: 500 },
  ]);

  const handleQuantityChange = (id, newQty) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(0, newQty) } : item
      )
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="flex flex-col  bg-gray-900 text-gray-200 p-6">
      <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
        Adjust Cart Quantities
      </h1>

      {cartItems.length === 0 ? (
        <p className="text-center text-gray-400 mt-10">No items in the cart.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-700">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="px-2 py-1 text-left">Item</th>
                <th className="px-2 py-1 text-center">Quantity</th>
                <th className="px-2 py-1 text-right">Price</th>
                <th className="px-2 py-1 text-right">Total</th>
                <th className="px-2 py-1 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-600">
                  <td className="px-2 py-1">{item.name}</td>
                  <td className="px-2 py-1 text-center">
                    <input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                      className="w-16 text-black px-1 py-0.5 rounded"
                    />
                  </td>
                  <td className="px-2 py-1 text-right">₦{item.price}</td>
                  <td className="px-2 py-1 text-right">₦{item.price * item.quantity}</td>
                  <td className="px-2 py-1 text-center">
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-400 font-semibold"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex justify-end space-x-4">
            <div className="text-lg font-semibold">
              Subtotal: ₦{subtotal.toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdjustQty;
