// src/pages/pos/sales/Payments.jsx
import React, { useState } from "react";

function Return() {
  // Example cart items
  const [cartItems] = useState([
    { id: 1, name: "Milk 1L", quantity: 2, price: 200 },
    { id: 2, name: "Bread", quantity: 1, price: 150 },
    { id: 3, name: "Eggs (12pcs)", quantity: 3, price: 500 },
  ]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.075;
  const total = subtotal + tax;

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [changeDue, setChangeDue] = useState(0);
  const [message, setMessage] = useState("");

  const handlePayment = () => {
    const paid = parseFloat(amountPaid);
    if (isNaN(paid) || paid < total) {
      setMessage("Insufficient payment. Please enter full amount.");
      setChangeDue(0);
    } else {
      setChangeDue(paid - total);
      setMessage("Payment successful!");
    }
  };

  return (
    <div className="flex flex-col  bg-gray-900 text-gray-200 p-6">
      <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
        Payment
      </h1>

      <div className="flex flex-col md:flex-row gap-6 h-full">
        {/* Cart Summary */}
        <div className="flex-1 overflow-y-auto bg-gray-800 rounded-lg p-4 shadow-lg">
          <table className="w-full table-auto border border-gray-700">
            <thead>
              <tr className="bg-gray-700">
                <th className="px-2 py-1 border-b border-gray-600">Item</th>
                <th className="px-2 py-1 border-b border-gray-600">Qty</th>
                <th className="px-2 py-1 border-b border-gray-600">Price</th>
                <th className="px-2 py-1 border-b border-gray-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-700">
                  <td className="px-2 py-1">{item.name}</td>
                  <td className="px-2 py-1">{item.quantity}</td>
                  <td className="px-2 py-1">₦{item.price}</td>
                  <td className="px-2 py-1">₦{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 p-4 bg-gray-700 rounded space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₦{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (7.5%):</span>
              <span>₦{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>₦{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Panel */}
        <div className="w-full md:w-1/4 flex flex-col gap-4">
          <label className="font-semibold">Select Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="p-2 rounded bg-gray-900 border border-gray-600 text-gray-200"
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="mobile">Mobile Payment</option>
          </select>

          <label className="font-semibold">Amount Paid</label>
          <input
            type="number"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            placeholder="Enter amount paid"
            className="p-2 rounded bg-gray-900 border border-gray-600 text-gray-200"
          />

          <button
            onClick={handlePayment}
            className="w-full py-2 bg-green-600 hover:bg-green-500 rounded font-semibold"
          >
            Confirm Payment
          </button>

          {message && (
            <div
              className={`p-2 rounded ${
                message.includes("successful") ? "bg-green-700" : "bg-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {changeDue > 0 && (
            <div className="p-2 mt-2 rounded bg-blue-700">
              Change Due: ₦{changeDue.toFixed(2)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Return;
