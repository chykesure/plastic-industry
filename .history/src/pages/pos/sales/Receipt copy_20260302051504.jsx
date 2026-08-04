import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { FaShoppingBag } from "react-icons/fa";

function Receipt() {
  const receiptRef = useRef();
  const location = useLocation();
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [sale, setSale] = useState(null);
  const [error, setError] = useState("");
  const [printedBy, setPrintedBy] = useState("");

  useEffect(() => {
    // Get the logged-in username from localStorage
    const username = localStorage.getItem("username") || "";
    setPrintedBy(username);

    if (location.state?.invoiceNumber) {
      setInvoiceNumber(location.state.invoiceNumber);
      fetchSale(location.state.invoiceNumber);
    }
  }, [location.state]);

  const fetchSale = async (number) => {
    if (!number) return;
    try {
      const res = await axios.get(
        `http://localhost:8080/api/sales/invoice/${number}`
      );
      setSale(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setSale(null);
      setError("Sale not found");
    }
  };

  const handleSearch = () => fetchSale(invoiceNumber);

  const handlePrint = () => {
    if (receiptRef.current) {
      const printContents = receiptRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  const subtotal =
    sale?.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const amountPaid = sale?.total || 0;
  const paymentMethod = sale?.paymentMode || "-";
  const currentDate = sale?.date
    ? new Date(sale.date).toLocaleString()
    : "";

  return (
    <div className="flex flex-col items-center bg-gray-900 text-gray-200 p-6 min-h-screen">
      {/* Invoice search */}
      <div className="flex mb-6 space-x-2">
        <input
          type="text"
          placeholder="Enter invoice number"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          className="px-3 py-2 rounded text-gray-900"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-semibold"
        >
          Search
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {sale && (
        <>
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Receipt
          </h1>

          <div
            ref={receiptRef}
            className="w-full max-w-md bg-gray-800 p-6 rounded-xl shadow-xl text-gray-200"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex justify-center items-center mb-2 space-x-2">
                <FaShoppingBag className="text-blue-400 text-3xl" />
                <h2 className="text-2xl font-bold text-white">
                  Grox Shopping Store
                </h2>
              </div>
              <p className="text-gray-400 text-sm">
                B338 Imo-Akure Road, Ilesha, Osun State
              </p>
              <p className="text-gray-400 text-sm">{currentDate}</p>
            </div>

            {/* Invoice + Cashier */}
            <div className="flex justify-between mb-4">
              <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded font-semibold shadow-sm">
                🧾 Invoice #: {sale.invoiceNumber}
              </span>
              <span className="bg-gray-700 text-gray-200 px-3 py-1 rounded font-medium shadow-sm">
                👤 Cashier: {sale.cashier}
              </span>
            </div>

            {/* Items Table */}
            <table className="w-full mb-4 border-collapse border border-gray-600 text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="px-2 py-1 text-center">S/N</th>
                  <th className="px-2 py-1 text-left">Item</th>
                  <th className="px-2 py-1 text-center">Qty</th>
                  <th className="px-2 py-1 text-right">Price</th>
                  <th className="px-2 py-1 text-right">Total</th>
                </tr>
              </thead>

              <tbody>
                {sale.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-600">
                    <td className="px-2 py-1 text-center">{index + 1}</td>
                    <td className="px-2 py-1">{item.productName}</td>
                    <td className="px-2 py-1 text-center">{item.quantity}</td>
                    <td className="px-2 py-1 text-right">
                      ₦{item.price.toLocaleString()}
                    </td>
                    <td className="px-2 py-1 text-right">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="mb-4 space-y-1 text-right">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Paid:</span>
                <span>₦{amountPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Payment Method:</span>
                <span>{paymentMethod}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Printed By:</span>
                <span>{printedBy}</span>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center mt-6 font-medium text-gray-400">
              Thank you for shopping with us!
            </p>
          </div>

          {/* Print button */}
          <button
            onClick={handlePrint}
            className="mt-6 py-2 px-6 bg-blue-600 hover:bg-blue-500 rounded font-semibold"
          >
            Print Receipt
          </button>
        </>
      )}
    </div>
  );
}

export default Receipt;
