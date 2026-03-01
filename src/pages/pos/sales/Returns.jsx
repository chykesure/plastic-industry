// src/pages/pos/sales/Returns.jsx
import React, { useState } from "react";
import axios from "axios";

function Returns() {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [sale, setSale] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [refundMethod, setRefundMethod] = useState("Cash");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" | "error"
  const [totalRefund, setTotalRefund] = useState(0);
  const [loading, setLoading] = useState(false);

  const BASE_URL = "http://localhost:8080/api";

  const fetchSale = async () => {
    if (!invoiceNumber.trim()) {
      setMessage("Please enter an invoice number");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const res = await axios.get(
        `${BASE_URL}/returns/sale/invoice/${invoiceNumber.trim()}`
      );

      setSale(res.data);

      const normalizedItems = res.data.items.map((item) => ({
        ...item,
        productName: item.productName || "Unknown Item",
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        returnQty: 0,
        remainingReturnable: item.remainingReturnable || item.quantity,
      }));

      setReturnItems(normalizedItems);
      setTotalRefund(0);
      setReason("");
    } catch (err) {
      console.error("Error fetching sale:", err);
      setMessage(err.response?.data?.message || "Sale not found or invalid invoice");
      setMessageType("error");
      setSale(null);
      setReturnItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQtyChange = (index, qty) => {
    const updated = [...returnItems];
    const maxQty = updated[index].remainingReturnable;
    const newQty = Math.min(Math.max(Number(qty) || 0, 0), maxQty);

    updated[index].returnQty = newQty;
    setReturnItems(updated);

    const refund = updated.reduce((sum, item) => sum + item.returnQty * item.price, 0);
    setTotalRefund(refund);
  };

  const submitReturn = async () => {
    const hasReturns = returnItems.some((item) => item.returnQty > 0);

    if (!sale || !hasReturns) {
      setMessage("Please enter at least one return quantity");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      const itemsToReturn = returnItems
        .filter((i) => i.returnQty > 0)
        .map((i) => ({
          productId: i.productId.toString(),
          productName: i.productName,
          returnQty: i.returnQty,
          price: i.price,
        }));

      const res = await axios.post(`${BASE_URL}/returns`, {
        saleId: sale._id,
        items: itemsToReturn,
        refundMethod,
        reason: reason.trim(),
        processedBy: "Cashier1",
      });

      setMessage(
        `Return processed successfully! Refund: ₦${res.data.totalRefund.toFixed(2)}`
      );
      setMessageType("success");

      setSale(null);
      setReturnItems([]);
      setInvoiceNumber("");
      setTotalRefund(0);
      setRefundMethod("Cash");
      setReason("");
    } catch (err) {
      console.error("Error processing return:", err);

      let errorMessage = "Failed to process return";

      // Extract ONLY the clean user-friendly message
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (typeof err.response?.data === "string") {
        const html = err.response.data;

        // Look for text inside <pre>...</pre>
        const preMatch = html.match(/<pre>([\s\S]*?)<\/pre>/);
        if (preMatch && preMatch[1]) {
          const fullText = preMatch[1].trim();
          // Take only the first line (the actual error message)
          errorMessage = fullText.split('\n')[0].replace(/^Error:\s*/, '').trim();
        } else {
          // Fallback: extract text after "Error:"
          const errorMatch = html.match(/Error:\s*([^<]+)/);
          if (errorMatch) {
            errorMessage = errorMatch[1].trim();
          }
        }
      }

      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-gray-200 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-blue-400">Process Return</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Enter invoice number (e.g., 97)"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && !loading && fetchSale()}
          disabled={loading}
          className="p-3 rounded bg-gray-800 border border-gray-600 flex-1 text-lg focus:outline-none focus:border-blue-500 disabled:opacity-50"
        />
        <button
          onClick={fetchSale}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded font-semibold transition"
        >
          {loading ? "Loading..." : "Fetch Sale"}
        </button>
      </div>

      {sale && returnItems.length > 0 && (
        <>
          <div className="mb-8 p-5 bg-gray-800 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold mb-3 text-blue-300">Original Sale Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <p><strong>Invoice:</strong> {sale.invoiceNumber}</p>
              <p><strong>Date:</strong> {new Date(sale.date).toLocaleString()}</p>
              <p><strong>Original Total:</strong> ₦{sale.totalAmount?.toFixed(2) || "N/A"}</p>
            </div>
          </div>

          <div className="overflow-x-auto mb-6 bg-gray-800 rounded-lg border border-gray-700">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-700 text-left">
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3 text-center">Sold Qty</th>
                  <th className="px-4 py-3 text-center">Remaining Returnable</th>
                  <th className="px-4 py-3 text-center">Return Qty</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {returnItems.map((item, idx) => (
                  <tr key={`${item.productId}-${idx}`} className="border-t border-gray-700 hover:bg-gray-700">
                    <td className="px-4 py-3 font-medium">{item.productName}</td>
                    <td className="px-4 py-3 text-center">{item.quantity}</td>
                    <td className="px-4 py-3 text-center font-medium">
                      <span className={item.remainingReturnable === 0 ? "text-red-400" : "text-yellow-300"}>
                        {item.remainingReturnable}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max={item.remainingReturnable}
                        value={item.returnQty}
                        onChange={(e) => handleQtyChange(idx, e.target.value)}
                        className="w-20 p-2 rounded bg-gray-900 border border-gray-600 text-center focus:outline-none focus:border-blue-500"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">₦{Number(item.price).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      ₦{(item.returnQty * item.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-right text-2xl font-bold mb-6 text-green-400">
            Total Refund: ₦{totalRefund.toFixed(2)}
          </div>

          <div className="mb-6">
            <label className="font-semibold text-lg block mb-2">
              Reason for Return <span className="text-gray-500 text-sm">(Optional)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows="3"
              placeholder="e.g., Damaged item, wrong size, customer changed mind..."
              className="w-full p-3 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <label className="font-semibold text-lg">Refund Method:</label>
            <select
              value={refundMethod}
              onChange={(e) => setRefundMethod(e.target.value)}
              className="p-3 rounded bg-gray-800 border border-gray-600 text-lg focus:outline-none focus:border-blue-500"
            >
              <option value="Cash">Cash</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="POS">POS / Card</option>
              <option value="Store Credit">Store Credit</option>
            </select>
          </div>

          <button
            onClick={submitReturn}
            disabled={loading}
            className="px-8 py-4 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 rounded font-bold text-xl transition transform hover:scale-105 disabled:transform-none"
          >
            {loading ? "Processing..." : "Process Return"}
          </button>
        </>
      )}

      {/* Clean message display — no extra "Error:" prefix */}
      {message && (
        <div
          className={`mt-8 p-6 rounded-lg text-lg font-medium shadow-lg border-l-8 ${messageType === "success"
            ? "bg-green-900 text-green-100 border-green-500"
            : "bg-red-900 text-red-100 border-red-500"
            }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default Returns;