import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
import { useLocation, useNavigate } from "react-router-dom";

function Receipt() {
  const receiptRef = useRef();
  const printedRef = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [invoiceNumber, setInvoiceNumber] = useState(");
  const [sale, setSale] = useState(null);
  const [error, setError] = useState(");
  const [printedBy, setPrintedBy] = useState(");
  const [isLoading, setIsLoading] = useState(false);

  // Robust helpers for customer data
  const getCustomerName = () => {
    if (sale?.customer?.name) return sale.customer.name;
    if (sale?.customerName) return sale.customerName;
    if (sale?.buyerName) return sale.buyerName;
    if (typeof sale?.customer === "string" && sale.customer) return sale.customer;
    return "Walk-in Customer";
  };

  const getCustomerAddress = () => {
    if (sale?.customer?.address) return sale.customer.address;
    if (sale?.customerAddress) return sale.customerAddress;
    if (sale?.address) return sale.address;
    return "";
  };

  // Shared print styles (white print, dark screen)
  const printStyles = `
@media print {
  @page {
    size: A4 portrait;
    margin: 12mm 10mm;
  }

  body {
    background: #ffffff !important;
    margin: 0 !important;
    padding: 0 !important;
    font-family: 'Helvetica Neue', Arial, Helvetica, sans-serif !important;
    color: #000000 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Force white background regardless of screen theme */
  .receipt-container, [class*="bg-"] {
    background: #ffffff !important;
    color: #000000 !important;
  }

  .text-slate-100, .text-white, .text-gray-200 {
    color: #000000 !important;
  }

  .company-name {
    font-size: 28px !important;
    font-weight: 900 !important;
    letter-spacing: 1.8px !important;
    text-transform: uppercase !important;
    text-align: center !important;
    margin: 0 0 6px 0 !important;
    line-height: 1.05 !important;
  }

  .company-info {
    text-align: center !important;
    font-size: 12.5px !important;
    color: #222 !important;
    line-height: 1.45 !important;
    margin-bottom: 20px !important;
  }

  .meta-section {
    display: flex !important;
    justify-content: space-between !important;
    font-size: 13px !important;
    margin: 20px 0 24px 0 !important;
    padding-bottom: 18px !important;
    border-bottom: 1px solid #d0d0d0 !important;
  }

  .meta-label {
    font-weight: 600 !important;
    color: #444 !important;
    display: inline-block !important;
    min-width: 100px !important;
  }

  table {
    width: 100% !important;
    border-collapse: collapse !important;
    margin: 0 0 24px 0 !important;
    font-size: 13px !important;
  }

  thead th {
    text-align: left !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    color: #444 !important;
    padding: 8px 6px !important;
    border-bottom: 2px solid #333 !important;
    letter-spacing: 0.4px !important;
  }

  tbody td {
    padding: 10px 6px !important;
    border-bottom: 1px solid #eee !important;
    vertical-align: top !important;
  }

  .qty-col { width: 60px !important; text-align: center !important; }
  .price-col, .total-col { width: 110px !important; text-align: right !important; font-variant-numeric: tabular-nums !important; }

  .totals {
    width: 45% !important;
    margin-left: auto !important;
    font-size: 13.5px !important;
  }

  .totals div {
    display: flex !important;
    justify-content: space-between !important;
    padding: 6px 0 !important;
    border-top: 1px solid #e0e0e0 !important;
  }

  .grand-total {
    font-size: 15px !important;
    font-weight: 900 !important;
    padding-top: 12px !important;
    border-top: 2px solid #000 !important;
  }

  .thanks, .waybill-thanks {
    text-align: center !important;
    margin: 40px 0 20px !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    color: #222 !important;
    letter-spacing: 0.3px !important;
  }

  .legal, .waybill-legal {
    text-align: center !important;
    font-size: 11px !important;
    color: #555 !important;
    line-height: 1.5 !important;
  }

  .signature-block {
    margin-top: 50px !important;
    display: flex !important;
    justify-content: space-between !important;
    font-size: 12px !important;
  }

  .signature-line {
    width: 45% !important;
    border-top: 1px solid #000 !important;
    padding-top: 30px !important;
    text-align: center !important;
  }

  button, .no-print { display: none !important; }
}
  `;

  const fetchSale = async (number) => {
    if (!number) return;
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/sales/invoice/${number}");
      setSale(res.data);
      setError(");
    } catch (err) {
      setSale(null);
      setError("Invoice not found. Please check the number.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    printedRef.current = false;
    fetchSale(invoiceNumber);
  };

  const formatNaira = (amount) =>
    "₦" + Number(amount || 0).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Shared print window function
  const openPrintWindow = (htmlContent) => {
    const win = window.open("", "_blank");
    win.document.write(htmlContent);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  // Print Receipt (normal invoice with prices)
  const handlePrintReceipt = () => {
    if (!receiptRef.current) return;

    const content = receiptRef.current.innerHTML;

    const html = `
        < html >
        <head>
          <title>Receipt #${invoiceNumber || "—"}</title>
          <style>${printStyles}</style>
        </head>
        <body>
          <div class="receipt-container">
            ${content}
          </div>
        </body>
      </html >
    `;

    openPrintWindow(html);
  };

  // Print Waybill (delivery note – no prices, signature spaces, driver info)
  const handlePrintWaybill = () => {
    if (!sale) return;

    const waybillHeader = `
    < div style = "text-align:center; margin-bottom:25px;" >
  <h1 style="font-size:32px; font-weight:900; letter-spacing:2px; text-transform:uppercase; margin:0;">
    WAYBILL / DELIVERY NOTE
  </h1>
  <div style="font-size:14px; margin:8px 0;">
    AO KOMOLAFE NIGERIA LIMITED<br>
    Off Oshogbo Road, Behind Testing Ground, Ilesa, Osun State<br>
    Phone: 08067229605  •  08054776518
  </div>
</div>

<div style="display:flex; justify-content:space-between; font-size:13px; margin:20px 0; padding-bottom:18px; border-bottom:1px solid #000;">
  <div>
    <strong>Waybill No:</strong> ${sale.invoiceNumber}<br>
    <strong>Date:</strong> ${printDate}<br>
    <strong>Customer:</strong> ${getCustomerName()}<br>
    <strong>Delivery Address:</strong> ${getCustomerAddress() || "—"}
  </div>
  <div style="text-align:right;">
    <strong>Driver Name:</strong> ________________________<br>
    <strong>Vehicle No:</strong> ________________________<br>
    <strong>Driver Phone:</strong> ________________________
  </div>
</div>
    `;

    const waybillItems = sale.items.map((item, i) => `
<tr>
  <td style="text-align:center; padding:8px 6px; border-bottom:1px solid #ddd;">${i + 1}</td>
  <td style="padding:8px 6px; border-bottom:1px solid #ddd;">${item.productName || item.description || "—"}</td>
  <td style="text-align:center; padding:8px 6px; border-bottom:1px solid #ddd;">${item.quantity}</td>
</tr>
    `).join('');

    const waybillTable = `
<table style="width:100%; border-collapse:collapse; margin:20px 0; font-size:13px;">
  <thead>
    <tr style="background:#f8f8f8;">
      <th style="padding:10px; border-bottom:2px solid #333; width:50px; text-align:center;">S/N</th>
      <th style="padding:10px; border-bottom:2px solid #333; text-align:left;">ITEM DESCRIPTION</th>
      <th style="padding:10px; border-bottom:2px solid #333; width:100px; text-align:center;">QUANTITY</th>
    </tr>
  </thead>
  <tbody>${waybillItems}</tbody>
</table>
    `;

    const waybillFooter = `
<div style="margin-top:60px;">
  <div style="display:flex; justify-content:space-between; font-size:12px;">
    <div style="width:45%; text-align:center;">
      <div style="border-top:1px solid #000; padding-top:35px;">Received By (Name & Signature)</div>
      <div style="margin-top:8px;">Date: ________________</div>
    </div>
    <div style="width:45%; text-align:center;">
      <div style="border-top:1px solid #000; padding-top:35px;">Dispatched By (Name & Signature)</div>
      <div style="margin-top:8px;">Company Stamp</div>
    </div>
  </div>

  <div style="text-align:center; margin-top:50px; font-size:14px; font-weight:600;">
    Goods received in good condition. No liability after delivery.
  </div>

  <div style="text-align:center; margin-top:30px; font-size:14px; font-weight:600;">
    Thank you for your business
  </div>
</div>
    `;

    const html = `
<html>
<head>
  <title>Waybill #${invoiceNumber || "—"}</title>
  <style>${printStyles}</style>
</head>
<body>
  <div class="receipt-container">
    ${waybillHeader}
    ${waybillTable}
    ${waybillFooter}
  </div>
</body>
</html>
    `;

    openPrintWindow(html);
  };

  useEffect(() => {
    if (sale && receiptRef.current && !printedRef.current) {
      printedRef.current = true;
      setTimeout(handlePrintReceipt, 700); // Auto-print receipt by default
    }
  }, [sale]);

  useEffect(() => {
    setPrintedBy(localStorage.getItem("username") || "—");

    if (location.state?.invoiceNumber) {
      const inv = location.state.invoiceNumber;
      setInvoiceNumber(inv);
      fetchSale(inv);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  const subtotal = sale?.items?.reduce((sum, i) => sum + (i.price * i.quantity), 0) || 0;
  const amountPaid = sale?.total || subtotal;
  const paymentMethod = sale?.paymentMode || "Cash";
  const printDate = sale?.date
    ? new Date(sale.date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "—";

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header / Controls */}
      <header className="bg-slate-800 border-b border-slate-700 shadow-lg sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-xl font-bold text-indigo-400">AO Komolafe</div>
            <span className="text-slate-400 text-sm">• Receipt & Waybill</span>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="Enter Invoice Number"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value.trim())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  printedRef.current = false;
                  handleSearch();
                }
              }}
              className="w-full md:w-80 px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
              disabled={isLoading}
            />

            <button
              onClick={handleSearch}
              disabled={isLoading}
              className={`px-6 py-2.5 rounded-lg font-medium text-white flex items-center gap-2 transition-all ${isLoading
                ? "bg-indigo-500/50 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-md shadow-indigo-500/20"
                }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Loading...
                </>
              ) : (
                "Load"
              )}
            </button>

            {sale && (
              <div className="flex gap-3">
                <button
                  onClick={handlePrintReceipt}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg font-medium transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Receipt
                </button>

                <button
                  onClick={handlePrintWaybill}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded-lg font-medium transition-all shadow-md shadow-amber-500/20 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10h-10a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Print Waybill
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-200 px-6 py-4 rounded-lg mb-8 flex items-center gap-3">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <svg className="animate-spin h-12 w-12 mb-4 text-indigo-400" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p>Loading receipt...</p>
          </div>
        )}

        {!sale && !isLoading && !error && (
          <div className="text-center py-24 text-slate-500">
            <svg className="w-24 h-24 mx-auto mb-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-2xl font-semibold text-slate-300 mb-3">Ready to view documents</h2>
            <p className="text-slate-500">Enter an invoice number above to load receipt or waybill</p>
          </div>
        )}

        {sale && (
          <div className="bg-slate-900 text-slate-100 rounded-xl shadow-2xl overflow-hidden ring-1 ring-slate-700/70 border border-slate-700">
            <div className="p-10 md:p-12" ref={receiptRef}>
              {/* Company Header */}
              <div className="text-center mb-10">
                <h1 className="company-name">AO KOMOLAFE NIGERIA LIMITED</h1>
                <div className="company-info">
                  Off Oshogbo Road, Behind Testing Ground, Ilesa, Osun State<br />
                  0806 722 9605  •  0805 477 6518
                </div>
              </div>

              {/* Meta */}
              <div className="meta-section">
                <div>
                  <div><span className="meta-label">Billed To:</span> {getCustomerName()}</div>
                  {getCustomerAddress() && (
                    <div className="mt-1 text-sm text-slate-400">{getCustomerAddress()}</div>
                  )}
                </div>

                <div className="text-right">
                  <div><span className="meta-label">Invoice No:</span> {sale.invoiceNumber}</div>
                  <div className="mt-1"><span className="meta-label">Date:</span> {printDate}</div>
                  <div className="mt-1"><span className="meta-label">Payment:</span> {paymentMethod}</div>
                </div>
              </div>

              {/* Items Table */}
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>DESCRIPTION</th>
                    <th className="qty-col">QTY</th>
                    <th className="price-col">UNIT PRICE</th>
                    <th className="total-col">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items.map((item, i) => (
                    <tr key={i}>
                      <td className="text-center text-slate-500">{i + 1}</td>
                      <td className="font-medium text-slate-100">
                        {item.productName || "—"}
                        {item.type === "wholesale" && (
                          <span className="ml-2 text-xs font-medium text-indigo-400 bg-indigo-900/30 px-1.5 py-0.5 rounded">
                            Wholesale ({item.packCount || "?"} pk)
                          </span>
                        )}
                      </td>
                      <td className="qty-col text-center text-slate-300">{item.quantity}</td>
                      <td className="price-col">{formatNaira(item.price)}</td>
                      <td className="total-col font-medium">{formatNaira(item.subtotal || item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="totals">
                <div>
                  <span>Subtotal</span>
                  <span>{formatNaira(subtotal)}</span>
                </div>
                <div className="grand-total">
                  <span>Total Amount</span>
                  <span>{formatNaira(amountPaid)}</span>
                </div>
                <div>
                  <span>Printed By</span>
                  <span>{printedBy || "—"}</span>
                </div>
              </div>

              {/* Thank You */}
              <div className="thanks">
                Thank you for your patronage — Come again!
              </div>

              {/* Legal */}
              <div className="legal">
                Goods once sold are not returnable or exchangeable • E&OE<br />
                This is a computer-generated receipt — No signature required
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Receipt;