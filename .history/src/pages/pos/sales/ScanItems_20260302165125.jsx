// src/pages/pos/sales/ScanItems.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import {
  FaPauseCircle, FaShoppingBasket, FaPlayCircle, FaUser, FaPlusCircle,
  FaSearch, FaTrash, FaBarcode, FaMoneyBillWave, FaRegTimesCircle
} from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

function ScanItems() {
  const [products, setProducts] = useState([]);
  const productsRef = useRef([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [manualBarcode, setManualBarcode] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [cashTendered, setCashTendered] = useState(0);
  const [lastInvoice, setLastInvoice] = useState(null);
  const [cashierName, setCashierName] = useState(() => localStorage.getItem("username") || "Walk-in");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const [pendingCarts, setPendingCarts] = useState(() => {
    const saved = localStorage.getItem("pendingCarts");
    return saved ? JSON.parse(saved) : [];
  });
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);

  const navigate = useNavigate();
  const productMap = useRef(new Map());
  const barcodeInputRef = useRef(null);

  useEffect(() => {
    const map = new Map();
    products.forEach(p => map.set(String(p.sku).trim(), p));
    productMap.current = map;
  }, [products]);

  // Simplified subtotal – always quantity (bottles) × price per bottle
  const subtotal = cart.reduce((sum, item) => {
    return sum + (item.quantity * item.sellingPrice);
  }, 0);

  const change = cashTendered - subtotal;
  const totalItemsInCart = cart.reduce((s, it) => s + (it.quantity || 0), 0);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/products-with-stock`);
      setProducts(res.data || []);
    } catch (err) {
      console.error("Failed to fetch products", err);
      toast.error("❌ Failed to load products");
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/customers`);
      setCustomers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch customers", err);
      toast.error("❌ Failed to load customers");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  const isFirstLoad = useRef(true);
  useEffect(() => {
    const saved = localStorage.getItem("posCart");
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch {
        setCart([]);
      }
    }
  }, []);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    localStorage.setItem("posCart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const handleStorageChange = () => {
      setCashierName(localStorage.getItem("username") || "Walk-in");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    barcodeInputRef.current?.focus();
    const iv = setInterval(() => {
      const active = document.activeElement;
      if (active !== barcodeInputRef.current &&
          !active.classList.contains('swal2-input') &&
          active.tagName !== 'INPUT' &&
          active.tagName !== 'TEXTAREA') {
        barcodeInputRef.current?.focus();
      }
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2
    }).format(amount || 0);

  const darkSwal = Swal.mixin({
    background: '#1f2937',
    color: '#f3f4f6',
    confirmButtonColor: '#059669',
    cancelButtonColor: '#dc2626',
  });

  const addProductToCart = (product, { quantity = 1, packCount = 0, type = "retail", sellingPriceOverride } = {}) => {
    if (!product) return;
    if (product.stock <= 0) {
      toast.warn(`⚠️ ${product.name} is out of stock`);
      return;
    }

    const finalQuantity = Math.min(quantity, product.stock);

    const entry = {
      ...product,
      quantity: finalQuantity,
      packCount,
      type,
      sellingPrice: typeof sellingPriceOverride !== "undefined"
        ? sellingPriceOverride
        : (type === "wholesale" ? product.wholesalePrice : product.sellingPrice),
    };

    setCart(prev => [entry, ...prev]);
  };

  const addToCartWithSweetAlert = async (product) => {
    if (!product || product.stock <= 0) {
      toast.warn(`⚠️ ${product?.name || "Product"} is out of stock`);
      return;
    }

    let chooseWholesale = false;

    if (product.wholesalePack && product.wholesalePack > 0) {
      const result = await darkSwal.fire({
        title: `<span class="text-emerald-400 text-2xl">${product.name}</span>`,
        html: `
          <div class="grid grid-cols-2 gap-4 text-left mt-4">
            <div class="bg-gray-700 p-3 rounded border border-gray-600 cursor-pointer hover:border-emerald-500 transition" onclick="Swal.clickConfirm()">
              <div class="text-gray-400 text-sm">Retail</div>
              <div class="font-bold text-lg">${formatMoney(product.sellingPrice)} per bottle</div>
            </div>
            <div class="bg-gray-700 p-3 rounded border border-gray-600 cursor-pointer hover:border-emerald-500 transition" onclick="Swal.clickCancel()">
              <div class="text-gray-400 text-sm">Wholesale</div>
              <div class="font-bold text-lg text-emerald-400">${formatMoney(product.wholesalePrice)} per bottle</div>
              <div class="text-xs text-slate-400 mt-1">pack contains ${product.wholesalePack} bottles</div>
            </div>
          </div>
          <style>.swal2-popup { border-radius: 1rem; }</style>
        `,
        showCancelButton: true,
        confirmButtonText: 'Retail',
        cancelButtonText: 'Wholesale',
        reverseButtons: true,
      });
      chooseWholesale = result.isDismissed;
    }

    if (chooseWholesale) {
      const { value: packInput } = await darkSwal.fire({
        title: "How many packs?",
        input: "number",
        inputLabel: `1 pack = ${product.wholesalePack} bottles × ${formatMoney(product.wholesalePrice)} each`,
        inputValue: 1,
        showCancelButton: true,
        inputAttributes: {
          min: 1,
          max: Math.floor(product.stock / product.wholesalePack),
          step: 1
        },
      });

      if (!packInput) return;

      const packCount = parseInt(packInput, 10) || 1;
      const totalBottles = packCount * product.wholesalePack;

      addProductToCart(product, {
        quantity: totalBottles,
        packCount,
        type: "wholesale",
        sellingPriceOverride: product.wholesalePrice,
      });
    } else {
      const { value: pcs } = await darkSwal.fire({
        title: "Enter Quantity",
        input: "number",
        inputLabel: `Available: ${product.stock} bottles`,
        inputValue: 1,
        showCancelButton: true,
        inputAttributes: { min: 1, max: product.stock },
      });

      if (!pcs) return;

      const qty = parseInt(pcs, 10) || 1;
      addProductToCart(product, { quantity: qty, packCount: 0, type: "retail" });
    }
  };

  const removeFromCart = (productId) => setCart(prev => prev.filter(i => i._id !== productId));

  const updateQuantity = (productId, quantity, packCount = 0, type = "retail") => {
    setCart(prev =>
      prev.map(item => {
        if (item._id !== productId) return item;
        const product = productsRef.current.find(p => p._id === productId) || item;
        let q = quantity;
        if (q < 1) q = 1;
        if (q > product.stock) {
          toast.warn(`⚠️ Only ${product.stock} in stock`);
          q = product.stock;
        }

        return {
          ...item,
          quantity: q,
          packCount,
          type,
          sellingPrice: type === "wholesale" ? product.wholesalePrice : product.sellingPrice,
        };
      })
    );
  };

  const handleManualAdd = (codeArg) => {
    const code = (typeof codeArg !== "undefined" ? codeArg : manualBarcode || "").trim();
    if (!code) {
      setManualBarcode("");
      barcodeInputRef.current?.focus();
      return toast.warn("Enter barcode");
    }

    const found = productMap.current.get(code);
    if (found) {
      addToCartWithSweetAlert(found);
    } else {
      toast.error("❌ Product not found");
    }

    setManualBarcode("");
    if (barcodeInputRef.current) barcodeInputRef.current.value = "";
  };

  const suspendCart = () => {
    if (cart.length === 0) return toast.warn("Cart is empty");

    const id = "PEND-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    const newPending = {
      id,
      items: cart,
      subtotal,
      customer: selectedCustomer,
      createdAt: Date.now()
    };

    const updated = [newPending, ...pendingCarts];
    localStorage.setItem("pendingCarts", JSON.stringify(updated));
    setPendingCarts(updated);

    setCart([]);
    setSelectedCustomer(null);
    toast.success("🕒 Cart Suspended");
  };

  const resumeCart = (id) => {
    const pending = pendingCarts.find(c => c.id === id);
    if (pending) {
      setCart(pending.items);
      if (pending.customer) setSelectedCustomer(pending.customer);

      const updated = pendingCarts.filter(c => c.id !== id);
      localStorage.setItem("pendingCarts", JSON.stringify(updated));
      setPendingCarts(updated);

      setIsPendingModalOpen(false);
      toast.success("🛒 Cart Resumed");
    }
  };

  const deletePendingCart = (id) => {
    Swal.fire({
      title: 'Delete this cart?',
      icon: 'warning',
      background: '#1f2937',
      color: '#fff',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Yes, delete'
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = pendingCarts.filter(c => c.id !== id);
        localStorage.setItem("pendingCarts", JSON.stringify(updated));
        setPendingCarts(updated);
        toast.success("Pending cart deleted");
      }
    });
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.warn("⚠️ Cart is empty");
    if (isCheckingOut) return;
    if (paymentMode === "Cash" && cashTendered < subtotal) return toast.warn("⚠️ Cash tendered is less than total");

    setIsCheckingOut(true);
    const cashier = localStorage.getItem("username") || "Walk-in";
    const transactionId = uuidv4();

    const payload = {
      transactionId,
      cashier,
      paymentMode,
      customerId: selectedCustomer?._id || null,
      items: cart.map(item => ({
        productId: item._id,
        quantity: item.quantity,
        price: item.sellingPrice,
        subtotal: item.quantity * item.sellingPrice,
        type: item.type,
        packCount: item.packCount || 0,           // kept for possible reporting
      })),
      total: subtotal,
    };

    try {
      const res = await axios.post(`${API_BASE}/api/sales`, payload);

      setLastInvoice(res.data.invoiceNumber);
      toast.success(`✅ Sale recorded! Invoice: ${res.data.invoiceNumber}`);

      setCart([]);
      setSelectedCustomer(null);
      setPaymentMode("Cash");
      setCashTendered(0);
      localStorage.removeItem("posCart");
      barcodeInputRef.current?.focus();
      fetchProducts();

      setTimeout(() => {
        navigate(`/sales/receipt`, { state: { invoiceNumber: res.data.invoiceNumber } });
      }, 400);
    } catch (err) {
      if (err.response?.status === 409) {
        toast.warn(`⚠️ Sale already recorded! Invoice: ${err.response.data.invoiceNumber}`);
      } else {
        const msg = err.response?.data?.message || "Failed to record sale";
        toast.error(`❌ ${msg}`);
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch)
  );

  useEffect(() => {
    if (paymentMode === "Cash") {
      setCashTendered(subtotal);
    } else {
      setCashTendered(0);
    }
  }, [subtotal, paymentMode]);

  return (
    <div className="flex flex-col bg-slate-900 text-slate-200 h-screen font-sans overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      <div className="flex justify-between items-center px-6 py-3 border-b border-slate-700 bg-slate-800 shadow-md z-20">
        <div className="text-slate-400 text-sm flex items-center gap-2">
          <span className="font-semibold text-emerald-400">{new Date().toLocaleDateString()}</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-full border border-slate-600">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-medium text-slate-300">{cashierName}</span>
          </div>

          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400">Subtotal ({totalItemsInCart} items) </span>
            <span className="text-2xl font-bold text-emerald-400"> {formatMoney(subtotal)}</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
              className="flex items-center gap-3 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg border border-slate-600 transition-all shadow-sm"
            >
              <div className="bg-blue-500/20 p-2 rounded-full text-blue-400">
                <FaUser />
              </div>
              <div className="text-left">
                <div className="text-xs text-slate-400">Customer</div>
                <div className="font-semibold leading-tight w-32 truncate">
                  {selectedCustomer ? selectedCustomer.name : "Walk-in Customer"}
                </div>
              </div>
            </button>

            {showCustomerDropdown && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in-down">
                <div className="p-3 border-b border-slate-700 bg-slate-800/50 backdrop-blur">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="Search name or phone..."
                      className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto custom-scrollbar">
                  <div
                    className="px-4 py-3 hover:bg-slate-700 cursor-pointer transition flex items-center gap-3 border-b border-slate-700/50"
                    onClick={() => {
                      setSelectedCustomer(null);
                      setShowCustomerDropdown(false);
                      setCustomerSearch("");
                    }}
                  >
                    <FaUser className="text-slate-500" />
                    <span className="text-slate-300">Walk-in / Cash Customer</span>
                  </div>

                  {filteredCustomers.map((c) => (
                    <div
                      key={c._id}
                      className="px-4 py-3 hover:bg-slate-700 cursor-pointer transition flex items-center justify-between group"
                      onClick={() => {
                        setSelectedCustomer(c);
                        setShowCustomerDropdown(false);
                        setCustomerSearch("");
                        toast.success(`Selected: ${c.name}`);
                      }}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-200">{c.name}</span>
                        <span className="text-xs text-slate-400">{c.phone}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">
                          {c.balance > 0 ? (
                            <span className="text-emerald-400">CR: {formatMoney(c.balance)}</span>
                          ) : c.balance < 0 ? (
                            <span className="text-rose-400">DR: {formatMoney(Math.abs(c.balance))}</span>
                          ) : (
                            <span className="text-slate-500">--</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredCustomers.length === 0 && customerSearch && (
                    <div className="p-6 text-center text-slate-500 text-sm">No customers found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 flex-shrink-0 bg-slate-800/50 border-r border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2">
              <FaBarcode /> Products
            </h2>

            <div className="relative mb-4">
              <input
                ref={barcodeInputRef}
                type="text"
                placeholder="Scan barcode..."
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleManualAdd();
                  }
                }}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
              />
              <FaBarcode className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => addToCartWithSweetAlert(product)}
                className="bg-slate-700 hover:bg-slate-600 border border-slate-700 hover:border-emerald-500/50 p-3 rounded-lg cursor-pointer transition-all group shadow-sm"
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-slate-200 text-sm line-clamp-1 group-hover:text-emerald-400 transition-colors">{product.name}</h4>
                  <span className="font-bold text-emerald-400 text-sm">{formatMoney(product.sellingPrice)}</span>
                </div>
                <div className="flex justify-between items-end text-xs text-slate-400">
                  <div className="flex flex-col gap-1">
                    {product.stock > 0 ? (
                      <span className="text-slate-300">Stock: <span className="text-white">{product.stock}</span></span>
                    ) : (
                      <span className="text-rose-400 font-bold">Out of Stock</span>
                    )}
                    {product.wholesalePack > 0 && (
                      <span className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded inline-block w-max text-xs">
                        Wholesale ₦{product.wholesalePrice}/bottle (pack of {product.wholesalePack})
                      </span>
                    )}
                  </div>
                  <div className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <FaPlusCircle />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-slate-900">
          <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <FaShoppingBasket className="text-emerald-500" /> Current Cart
            </h2>
            {cart.length > 0 && (
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold">
                {cart.length} Items
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600">
                <FaShoppingBasket size={64} className="mb-4 opacity-20" />
                <p>Cart is empty</p>
                <p className="text-sm">Scan a barcode or search to add items</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item, idx) => (
                  <div
                    key={`${item._id}-${idx}`}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-3 flex flex-col gap-2 hover:border-slate-600 transition-colors shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-2">
                        <h4 className="font-semibold text-slate-200">{item.name}</h4>
                        <div className="flex items-center gap-2 text-xs mt-1">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${item.type === 'wholesale' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>
                            {item.type}
                          </span>
                          {item.type === 'wholesale' && item.packCount > 0 && (
                            <span className="text-slate-400">
                              ({item.packCount} pack{item.packCount > 1 ? 's' : ''} = {item.quantity} bottles)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-400">
                          {formatMoney(item.quantity * item.sellingPrice)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatMoney(item.sellingPrice)} × {item.quantity} bottles
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-2 border-t border-slate-700/50 pt-2">
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-rose-500 hover:text-rose-400 text-sm flex items-center gap-1 px-2 py-1 hover:bg-rose-500/10 rounded transition"
                      >
                        <FaTrash /> Remove
                      </button>

                      <button
                        onClick={async () => {
                          const { value: quantityType } = await Swal.fire({
                            title: 'Change quantity type',
                            input: 'radio',
                            inputOptions: {
                              retail: 'Retail (individual bottles)',
                              wholesale: `Wholesale (packs of ${item.wholesalePack} bottles)`,
                            },
                            background: '#1f2937',
                            color: '#121111',
                            confirmButtonText: 'Next',
                          });

                          if (!quantityType) return;

                          let newQty = 1;
                          let newPackCount = 0;

                          if (quantityType === 'wholesale') {
                            const { value: packs } = await Swal.fire({
                              title: 'How many packs?',
                              input: 'number',
                              inputValue: item.packCount || 1,
                              inputAttributes: { min: 1, max: Math.floor(item.stock / item.wholesalePack) },
                              background: '#1f2937',
                              color: '#fff'
                            });

                            newPackCount = parseInt(packs, 10) || 1;
                            newQty = newPackCount * item.wholesalePack;
                          } else {
                            const { value: bottles } = await Swal.fire({
                              title: 'How many bottles?',
                              input: 'number',
                              inputValue: item.quantity,
                              inputAttributes: { min: 1, max: item.stock },
                              background: '#1f2937',
                              color: '#fff'
                            });

                            newQty = parseInt(bottles, 10) || 1;
                            newPackCount = 0;
                          }

                          if (newQty > item.stock) {
                            toast.warn(`Only ${item.stock} bottles in stock`);
                            return;
                          }

                          updateQuantity(item._id, newQty, newPackCount, quantityType);
                        }}
                        className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-2 border border-slate-600"
                      >
                        <span>Qty: {item.quantity}</span>
                        <span className="text-xs text-slate-400">Edit</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-800 border-t border-slate-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400">Subtotal ({totalItemsInCart} items)</span>
              <span className="text-2xl font-bold text-emerald-400">{formatMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-slate-400">
              <span>VAT (Incl.)</span>
              <span>--</span>
            </div>
          </div>
        </div>

        <div className="w-80 flex-shrink-0 bg-slate-800 border-l border-slate-700 flex flex-col shadow-xl">
          <div className="p-2 flex-1 flex flex-col gap-2 overflow-y-auto">
            {lastInvoice && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded text-center">
                <div className="text-[10px] text-emerald-400 mb-0.5 uppercase font-bold tracking-wider">Last Invoice</div>
                <div className="font-bold text-emerald-300 text-sm">{lastInvoice}</div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMode("Cash")}
                  className={`py-2 rounded-lg border text-center transition ${paymentMode === "Cash" ? "bg-emerald-600 border-emerald-500 text-white" : "bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600"}`}
                >
                  Cash
                </button>
                <button
                  onClick={() => setPaymentMode("Bank Transfer")}
                  className={`py-2 rounded-lg border text-center transition ${paymentMode === "Bank Transfer" ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600"}`}
                >
                  Transfer
                </button>
              </div>
            </div>

            {paymentMode === "Cash" && (
              <div className="space-y-2 animate-fade-in">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Cash Tendered</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₦</span>
                    <input
                      type="text"
                      value={cashTendered.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value.replace(/[^0-9.]/g, "")) || 0;
                        setCashTendered(val);
                      }}
                      className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-emerald-400 font-bold text-right focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Change Due</label>
                  <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-right h-[38px] flex items-center justify-end">
                    <span className="text-lg font-bold text-white">{formatMoney(change > 0 ? change : 0)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || cart.length === 0}
                className={`w-full py-3 rounded-xl font-bold text-base shadow-lg shadow-emerald-900/50 transition-all flex items-center justify-center gap-2 ${isCheckingOut || cart.length === 0 ? "bg-slate-700 text-slate-500 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-400 text-white hover:scale-[1.02] active:scale-[0.98]"}`}
              >
                {isCheckingOut ? (
                  <>Processing...</>
                ) : (
                  <>
                    <FaMoneyBillWave /> Complete Sale
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={suspendCart}
                  className="py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium transition flex flex-col items-center justify-center gap-1 text-xs"
                >
                  <FaPauseCircle className="text-yellow-500" />
                  <span>Suspend</span>
                </button>

                <button
                  onClick={() => setIsPendingModalOpen(true)}
                  className="py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium transition flex flex-col items-center justify-center gap-1 text-xs relative"
                >
                  <FaShoppingBasket className="text-emerald-500" />
                  <span>Pending</span>
                  {pendingCarts.length > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full">
                      {pendingCarts.length}
                    </span>
                  )}
                </button>
              </div>

              <button
                onClick={async () => {
                  if (await Swal.fire({
                    title: 'Clear Cart?',
                    text: "Are you sure you want to remove all items?",
                    icon: 'warning',
                    background: '#1f2937',
                    color: '#fff',
                    showCancelButton: true,
                    confirmButtonColor: '#dc2626',
                  }).then(r => r.isConfirmed)) {
                    setCart([]);
                    setSelectedCustomer(null);
                    localStorage.removeItem("posCart");
                    toast.info("Cart cleared");
                  }
                }}
                className="w-full py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-medium transition flex items-center justify-center gap-2"
              >
                <FaRegTimesCircle /> Cancel Transaction
              </button>
            </div>
          </div>
        </div>
      </div>

      {isPendingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FaShoppingBasket className="text-emerald-500" /> Suspended Carts
              </h3>
              <button onClick={() => setIsPendingModalOpen(false)} className="text-slate-400 hover:text-white transition">
                <FaRegTimesCircle size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
              {pendingCarts.length === 0 ? (
                <div className="p-10 text-center text-slate-500 flex flex-col items-center">
                  <FaShoppingBasket size={48} className="mb-4 opacity-20" />
                  <p>No suspended carts found.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-700/50 text-slate-300 text-xs uppercase tracking-wider sticky top-0">
                    <tr>
                      <th className="px-6 py-3 font-semibold">ID</th>
                      <th className="px-6 py-3 font-semibold">Customer</th>
                      <th className="px-6 py-3 font-semibold">Items</th>
                      <th className="px-6 py-3 font-semibold text-right">Total</th>
                      <th className="px-6 py-3 font-semibold text-center">Time</th>
                      <th className="px-6 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700 text-sm">
                    {pendingCarts.map((cart) => (
                      <tr key={cart.id} className="hover:bg-slate-700/50 transition-colors group">
                        <td className="px-6 py-4 font-mono text-slate-400">{cart.id}</td>
                        <td className="px-6 py-4 text-slate-200">{cart.customer ? cart.customer.name : 'Walk-in'}</td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-700 px-2 py-1 rounded text-xs">{cart.items.length}</span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-400">
                          {formatMoney(cart.subtotal)}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs text-right">
                          {new Date(cart.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => resumeCart(cart.id)}
                              className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-lg transition"
                              title="Resume"
                            >
                              <FaPlayCircle />
                            </button>
                            <button
                              onClick={() => deletePendingCart(cart.id)}
                              className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScanItems;