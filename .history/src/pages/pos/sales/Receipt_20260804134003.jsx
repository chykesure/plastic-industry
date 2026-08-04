import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Logo path — place EO_LOGO.PNG in your public/ folder
const LOGO_PATH = "/EO_LOGO.PNG";

function Receipt() {
  const receiptRef = useRef();
  const printedRef = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [sale, setSale] = useState(null);
  const [error, setError] = useState("");
  const [printedBy, setPrintedBy] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  // ──────────────────── PRINT STYLES ────────────────────
  const printStyles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600;700&display=swap');

@media print {
  @page {
    size: A4 portrait;
    margin: 10mm 12mm;
  }

  * { box-sizing: border-box; }

  body {
    background: #ffffff !important;
    margin: 0 !important;
    padding: 0 !important;
    font-family: 'Inter', 'Segoe UI', Arial, sans-serif !important;
    color: #1a1a1a !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    -webkit-font-smoothing: antialiased;
  }

  .receipt-container, [class*="bg-"] {
    background: #ffffff !important;
    color: #1a1a1a !important;
  }

  .text-slate-100, .text-white, .text-gray-200,
  .text-slate-300, .text-slate-400, .text-slate-500, .text-indigo-400 {
    color: #1a1a1a !important;
  }

  .company-logo {
    display: block !important;
    margin: 0 auto 8px auto !important;
    width: 200px !important;
    height: 200px !important;
    object-fit: contain !important;
  }

  .company-name {
    font-family: 'Playfair Display', Georgia, 'Times New Roman', serif !important;
    font-size: 22px !important;
    font-weight: 900 !important;
    letter-spacing: 2.5px !important;
    text-transform: uppercase !important;
    text-align: center !important;
    margin: 0 0 2px 0 !important;
    line-height: 1.15 !important;
    color: #0d1b2a !important;
  }

  .company-tagline {
    text-align: center !important;
    font-family: 'Inter', Arial, sans-serif !important;
    font-size: 9px !important;
    font-weight: 500 !important;
    letter-spacing: 3px !important;
    text-transform: uppercase !important;
    color: #555 !important;
    margin-bottom: 4px !important;
  }

  .company-info {
    text-align: center !important;
    font-family: 'Inter', Arial, sans-serif !important;
    font-size: 11px !important;
    font-weight: 400 !important;
    color: #333 !important;
    line-height: 1.6 !important;
    margin-bottom: 6px !important;
  }

  .header-divider {
    border: none !important;
    border-top: 2.5px solid #0d1b2a !important;
    margin: 12px auto 0 auto !important;
    width: 80% !important;
  }

  .invoice-title {
    font-family: 'Inter', Arial, sans-serif !important;
    font-size: 10px !important;
    font-weight: 700 !important;
    letter-spacing: 4px !important;
    text-transform: uppercase !important;
    text-align: center !important;
    color: #666 !important;
    margin: 14px 0 0 0 !important;
  }

  .meta-section {
    display: flex !important;
    justify-content: space-between !important;
    font-family: 'Inter', Arial, sans-serif !important;
    font-size: 12px !important;
    margin: 20px 0 20px 0 !important;
    padding: 14px 16px !important;
    background: #f8f9fa !important;
    border-radius: 6px !important;
    border: 1px solid #e9ecef !important;
  }

  .meta-label {
    font-weight: 600 !important;
    color: #0d1b2a !important;
    display: inline-block !important;
    min-width: 90px !important;
    font-size: 11px !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
  }

  .meta-value {
    color: #333 !important;
    font-weight: 500 !important;
  }

  table {
    width: 100% !important;
    border-collapse: collapse !important;
    margin: 0 0 20px 0 !important;
    font-family: 'Inter', Arial, sans-serif !important;
    font-size: 12px !important;
  }

  thead th {
    font-family: 'Inter', Arial, sans-serif !important;
    text-align: left !important;
    font-size: 9.5px !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 1px !important;
    color: #ffffff !important;
    background: #0d1b2a !important;
    padding: 10px 10px !important;
    border-bottom: none !important;
  }

  thead th:first-child { border-radius: 5px 0 0 0 !important; }
  thead th:last-child { border-radius: 0 5px 0 0 !important; }

  tbody td {
    padding: 11px 10px !important;
    border-bottom: 1px solid #e9ecef !important;
    vertical-align: top !important;
    font-weight: 400 !important;
    color: #333 !important;
  }

  tbody tr:nth-child(even) {
    background: #fafbfc !important;
  }

  .qty-col { width: 55px !important; text-align: center !important; }
  .price-col, .total-col { width: 110px !important; text-align: right !important; font-variant-numeric: tabular-nums !important; font-weight: 500 !important; }

  .totals {
    width: 50% !important;
    margin-left: auto !important;
    font-family: 'Inter', Arial, sans-serif !important;
    font-size: 12.5px !important;
    margin-top: 8px !important;
  }

  .totals div {
    display: flex !important;
    justify-content: space-between !important;
    padding: 8px 0 !important;
    border-top: 1px solid #e9ecef !important;
    color: #444 !important;
  }

  .grand-total {
    font-size: 16px !important;
    font-weight: 800 !important;
    padding-top: 14px !important;
    border-top: 2.5px solid #0d1b2a !important;
    color: #0d1b2a !important;
  }

  /* ── FOOTER ── */
  .receipt-footer {
    margin-top: 36px !important;
    padding-top: 0 !important;
  }

  .footer-divider {
    border: none !important;
    border-top: 2.5px solid #0d1b2a !important;
    margin: 0 auto 20px auto !important;
    width: 100% !important;
  }

  .footer-thanks {
    text-align: center !important;
    font-family: 'Playfair Display', Georgia, serif !important;
    font-size: 16px !important;
    font-weight: 700 !important;
    color: #0d1b2a !important;
    letter-spacing: 0.5px !important;
    margin: 0 0 6px 0 !important;
  }

  .footer-message {
    text-align: center !important;
    font-family: 'Inter', Arial, sans-serif !important;
    font-size: 11px !important;
    font-weight: 400 !important;
    color: #555 !important;
    line-height: 1.6 !important;
    margin: 0 0 16px 0 !important;
  }

  .footer-legal-box {
    margin: 0 auto !important;
    max-width: 85% !important;
    padding: 12px 16px !important;
    background: #f8f9fa !important;
    border: 1px solid #e9ecef !important;
    border-radius: 6px !important;
  }

  .footer-legal {
    text-align: center !important;
    font-family: 'Inter', Arial, sans-serif !important;
    font-size: 9px !important;
    font-weight: 400 !important;
    color: #999 !important;
    line-height: 1.8 !important;
    letter-spacing: 0.2px !important;
    margin: 0 !important;
  }

  .footer-powered {
    text-align: center !important;
    font-family: 'Inter', Arial, sans-serif !important;
    font-size: 8px !important;
    font-weight: 600 !important;
    color: #bbb !important;
    letter-spacing: 2px !important;
    text-transform: uppercase !important;
    margin: 16px 0 0 0 !important;
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
      const res = await axios.get(`${API_BASE}/api/sales/invoice/${number}`);
      setSale(res.data);
      setError("");
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

  const openPrintWindow = (htmlContent) => {
    const win = window.open("", "_blank");
    win.document.write(htmlContent);
    win.document.close();
    setTimeout(() => win.print(), 600);
  };

  const getLogoHtml = (size = 200) => {
    const fullUrl = window.location.origin + LOGO_PATH;
    return `<img src="${fullUrl}" alt="Company Logo" style="display:block; margin:0 auto 8px auto; width:${size}px; height:${size}px; object-fit:contain;" />`;
  };

  const handlePrintReceipt = () => {
    if (!receiptRef.current) return;
    const content = receiptRef.current.innerHTML;
    const html = `
      <html>
        <head>
          <title>Receipt #${invoiceNumber || "—"}</title>
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>${printStyles}</style>
        </head>
        <body>
          <div class="receipt-container">
            ${content}
          </div>
        </body>
      </html>
    `;
    openPrintWindow(html);
  };

  const handlePrintWaybill = () => {
    if (!sale) return;

    const waybillHeader = `
<div style="text-align:center; margin-bottom:20px;">
  ${getLogoHtml(200)}
  <div style="font-family:'Playfair Display',Georgia,serif; font-size:26px; font-weight:900; letter-spacing:2.5px; text-transform:uppercase; margin:6px 0 2px 0; color:#0d1b2a;">
    AO KOMOLAFE NIGERIA LIMITED
  </div>
  <div style="font-size:9px; font-weight:600; letter-spacing:3px; text-transform:uppercase; color:#555; margin-bottom:4px;">
    Wholesaler & Manufacturer of Quality Plastic Products
  </div>
  <div style="font-size:11px; color:#333; line-height:1.6; margin-bottom:6px;">
    Off Oshogbo Road, Behind Testing Ground, Ilesa, Osun State<br>
    Phone: 0806 722 9605  •  0805 477 6518
  </div>
  <hr style="border:none; border-top:2.5px solid #0d1b2a; width:80%; margin:8px auto 0 auto;" />
  <div style="font-family:'Inter',Arial,sans-serif; font-size:10px; font-weight:700; letter-spacing:4px; text-transform:uppercase; color:#666; margin:14px 0 0 0;">
    WAYBILL / DELIVERY NOTE
  </div>
</div>

<div style="display:flex; justify-content:space-between; font-family:'Inter',Arial,sans-serif; font-size:12px; margin:20px 0; padding:14px 16px; background:#f8f9fa; border-radius:6px; border:1px solid #e9ecef;">
  <div>
    <div style="font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#0d1b2a; margin-bottom:6px;">Waybill Details</div>
    <div><strong>Waybill No:</strong> ${sale.invoiceNumber}</div>
    <div><strong>Date:</strong> ${printDate}</div>
    <div><strong>Customer:</strong> ${getCustomerName()}</div>
    <div><strong>Delivery Address:</strong> ${getCustomerAddress() || "—"}</div>
  </div>
  <div style="text-align:right;">
    <div style="font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#0d1b2a; margin-bottom:6px;">Driver Info</div>
    <div><strong>Driver Name:</strong> ________________________</div>
    <div><strong>Vehicle No:</strong> ________________________</div>
    <div><strong>Driver Phone:</strong> ________________________</div>
  </div>
</div>
    `;

    const waybillItems = sale.items.map((item, i) => `
<tr>
  <td style="text-align:center; padding:11px 10px; border-bottom:1px solid #e9ecef;">${i + 1}</td>
  <td style="padding:11px 10px; border-bottom:1px solid #e9ecef; font-weight:500;">${item.productName || item.description || "—"}</td>
  <td style="text-align:center; padding:11px 10px; border-bottom:1px solid #e9ecef;">${item.quantity}</td>
</tr>
    `).join('');

    const waybillTable = `
<table style="width:100%; border-collapse:collapse; margin:20px 0; font-family:'Inter',Arial,sans-serif; font-size:12px;">
  <thead>
    <tr>
      <th style="font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#fff; background:#0d1b2a; padding:10px; width:50px; text-align:center; border-radius:5px 0 0 0;">S/N</th>
      <th style="font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#fff; background:#0d1b2a; padding:10px; text-align:left;">ITEM DESCRIPTION</th>
      <th style="font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#fff; background:#0d1b2a; padding:10px; width:100px; text-align:center; border-radius:0 5px 0 0;">QUANTITY</th>
    </tr>
  </thead>
  <tbody>${waybillItems}</tbody>
</table>
    `;

    const waybillFooter = `
<div style="margin-top:36px; font-family:'Inter',Arial,sans-serif;">
  <hr style="border:none; border-top:2.5px solid #0d1b2a; margin:0 auto 20px auto; width:100%;" />
  <div style="text-align:center; font-family:'Playfair Display',Georgia,serif; font-size:16px; font-weight:700; color:#0d1b2a; margin:0 0 6px 0;">
    Thank you for your business!
  </div>
  <div style="text-align:center; font-size:11px; color:#555; margin:0 0 16px 0;">
    Goods received in good condition. No liability after delivery.
  </div>
  <div style="display:flex; justify-content:space-between; font-size:12px; margin-top:60px;">
    <div style="width:45%; text-align:center;">
      <div style="border-top:1px solid #000; padding-top:35px;">Received By (Name & Signature)</div>
      <div style="margin-top:8px;">Date: ________________</div>
    </div>
    <div style="width:45%; text-align:center;">
      <div style="border-top:1px solid #000; padding-top:35px;">Dispatched By (Name & Signature)</div>
      <div style="margin-top:8px;">Company Stamp</div>
    </div>
  </div>
  <div style="text-align:center; margin:20px auto 0 auto; max-width:85%; padding:12px 16px; background:#f8f9fa; border:1px solid #e9ecef; border-radius:6px;">
    <div style="font-size:9px; color:#999; line-height:1.8;">
      This is a computer-generated waybill — No signature required • E&OE
    </div>
  </div>
</div>
    `;

    const html = `
<html>
<head>
  <title>Waybill #${invoiceNumber || "—"}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
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
      setTimeout(handlePrintReceipt, 700);
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
      <header className="bg-slate-800 border-b border-slate-700 shadow-lg sticky top-0 z-10 no-print">
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
          <div className="bg-white text-gray-900 rounded-xl shadow-2xl overflow-hidden ring-1 ring-gray-200 border border-gray-200">
            <div className="p-8 md:p-10" ref={receiptRef}>

              {/* ── Company Header ── */}
              <div className="text-center mb-2">
                <img
                  src={LOGO_PATH}
                  alt="Company Logo"
                  className="company-logo"
                  style={{ width: 200, height: 200, objectFit: "contain", display: "block", margin: "0 auto 8px auto" }}
                />
                <h1 className="company-name">AO KOMOLAFE NIGERIA LIMITED</h1>
                <div className="company-tagline">Wholesaler & Manufacturer of Quality Plastic Products</div>
                <div className="company-info">
                  Off Oshogbo Road, Behind Testing Ground, Ilesa, Osun State<br />
                  0806 722 9605  •  0805 477 6518
                </div>
                <hr className="header-divider" />
                <div className="invoice-title">INVOICE / RECEIPT</div>
              </div>

              {/* ── Meta ── */}
              <div className="meta-section">
                <div>
                  <div><span className="meta-label">Billed To</span></div>
                  <div className="meta-value" style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{getCustomerName()}</div>
                  {getCustomerAddress() && (
                    <div className="meta-value" style={{ fontSize: 12, marginTop: 2, color: "#666" }}>{getCustomerAddress()}</div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div><span className="meta-label">Invoice No</span></div>
                  <div className="meta-value" style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{sale.invoiceNumber}</div>
                  <div style={{ marginTop: 4 }}><span className="meta-label">Date</span> <span className="meta-value">{printDate}</span></div>
                  <div style={{ marginTop: 4 }}><span className="meta-label">Payment</span> <span className="meta-value">{paymentMethod}</span></div>
                </div>
              </div>

              {/* ── Items Table ── */}
              <table>
                <thead>
                  <tr>
                    <th style={{ borderRadius: "5px 0 0 0", textAlign: "center", width: 40 }}>#</th>
                    <th>DESCRIPTION</th>
                    <th className="qty-col" style={{ textAlign: "center" }}>QTY</th>
                    <th className="price-col" style={{ textAlign: "right" }}>UNIT PRICE</th>
                    <th className="total-col" style={{ textAlign: "right", borderRadius: "0 5px 0 0" }}>AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items.map((item, i) => (
                    <tr key={i}>
                      <td style={{ textAlign: "center", color: "#888", fontSize: 11 }}>{i + 1}</td>
                      <td style={{ fontWeight: 500 }}>
                        {item.productName || "—"}
                        {item.type === "wholesale" && (
                          <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 600, color: "#6366f1", background: "#eef2ff", padding: "2px 6px", borderRadius: 4 }}>
                            Wholesale ({item.packCount || "?"} pk)
                          </span>
                        )}
                      </td>
                      <td className="qty-col" style={{ textAlign: "center" }}>{item.quantity}</td>
                      <td className="price-col">{formatNaira(item.price)}</td>
                      <td className="total-col" style={{ fontWeight: 600 }}>{formatNaira(item.subtotal || item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* ── Totals ── */}
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
                  <span style={{ fontWeight: 500 }}>{printedBy || "—"}</span>
                </div>
              </div>

              {/* ── Redesigned Footer ── */}
              <div className="receipt-footer">
                <hr className="footer-divider" />
                <div className="footer-thanks">Thank you for your patronage!</div>
                <div className="footer-message">
                  We appreciate your trust in our products. For enquiries or complaints, please contact us.
                </div>
                <div className="footer-legal-box">
                  <div className="footer-legal">
                    Goods once sold are not returnable or exchangeable • E&OE<br />
                    This is a computer-generated receipt — No signature required
                  </div>
                </div>
                <div className="footer-powered">Powered by ChykeTech I</div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Receipt;