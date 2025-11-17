"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ShoppingCart,
  Search,
  Scan,
  Plus,
  Minus,
  Trash2,
  User,
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle,
  Loader2,
  BarChart3,
  Package,
  FileText,
  Split,
  X,
  Filter,
  Barcode,
  Hash,
  Tag,
} from "lucide-react";
import {
  cartStorage,
  createSale,
  getItemsBySalesType,
  getSalesTypes,
  getUserDailySales,
  searchItemsAdvanced,
} from "@/lib/api/possale";
import { toast } from "react-toastify";
import { getCurrentUserStores } from "@/lib/api/inventory";
import ReprintReceipts from "@/components/receipts/ReprintReceipts";
import ReceiptPrint from "@/components/receipts/ReceiptPrint";

const POSSystem = () => {
  // Core POS state
  const [currentUser] = useState({ id: 1, name: "Kevin Mbari" });
  const [selectedStore, setSelectedStore] = useState("");
  const [selectedSalesType, setSelectedSalesType] = useState("");
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [searchBy, setSearchBy] = useState("all");

  // Multiple Payments State
  const [payments, setPayments] = useState([
    { method: 'cash', amount: 0, reference: '' },
    { method: 'mpesa', amount: 0, reference: '' },
    { method: 'card', amount: 0, reference: '' },
    { method: 'bank', amount: 0, reference: '' }
  ]);
  const [useMultiplePayments, setUseMultiplePayments] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Data states
  const [stores, setStores] = useState([]);
  const [salesTypes, setSalesTypes] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [dailySales, setDailySales] = useState(null);

  // UI states
  const [loading, setLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showDailySales, setShowDailySales] = useState(false);
  const [showItemBrowser, setShowItemBrowser] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Error and success states
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Receipt/Reprint states
  const [showReceipt, setShowReceipt] = useState(false);
  const [showReprint, setShowReprint] = useState(false);

  // Refs
  const searchInputRef = useRef(null);

  // Initialize POS system
  useEffect(() => {
    initializePOS();
    loadSavedCart();
    loadTodaysSales();
    detectSidebarState();
  }, []);

  // Detect sidebar state from localStorage or DOM
  // MY CODE 
  // const detectSidebarState = () => {
  //   const sidebarState = localStorage.getItem('pos_sidebar_collapsed');
  //   if (sidebarState) {
  //     setSidebarCollapsed(JSON.parse(sidebarState));
  //   }
  // };

  const detectSidebarState = () => {
  // Add typeof window check
  if (typeof window !== 'undefined') {
    const sidebarState = localStorage.getItem('pos_sidebar_collapsed');
    if (sidebarState) {
      setSidebarCollapsed(JSON.parse(sidebarState));
    }
  }
};

  // Update sidebar state when it changes
  // MY CODE 
  // useEffect(() => {
  //   const handleSidebarChange = () => {
  //     detectSidebarState();
  //   };

  //   window.addEventListener('storage', handleSidebarChange);
  //   window.addEventListener('sidebarStateChange', handleSidebarChange);

  //   return () => {
  //     window.removeEventListener('storage', handleSidebarChange);
  //     window.removeEventListener('sidebarStateChange', handleSidebarChange);
  //   };
  // }, []);

useEffect(() => {
  const handleSidebarChange = () => {
    detectSidebarState();
  };

  // Only add event listeners on client side
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleSidebarChange);
    window.addEventListener('sidebarStateChange', handleSidebarChange);
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleSidebarChange);
      window.removeEventListener('sidebarStateChange', handleSidebarChange);
    }
  };
}, []);


  const initializePOS = async () => {
    setLoading(true);
    try {
      const [storesData, salesTypesData] = await Promise.all([
        getCurrentUserStores(),
        getSalesTypes(),
      ]);

      setStores(storesData.assigned_stores || []);
      setSalesTypes(salesTypesData.results || salesTypesData);

      // Set initial selections if data is available
      if (storesData.assigned_stores && storesData.assigned_stores.length > 0) {
        setSelectedStore(storesData.assigned_stores[0].id.toString());
      }
      if (salesTypesData.length > 0) {
        setSelectedSalesType(salesTypesData[0].id.toString());
      }
    } catch (err) {
      setError("Failed to initialize POS system: " + err.message);
      toast.error("Failed to initialize POS system: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedCart = () => {
    const savedCart = cartStorage.load();
    if (savedCart) {
      setCart(savedCart.items || []);
      setSelectedStore(savedCart.store || "");
      setSelectedSalesType(savedCart.salesType || "");
      setUseMultiplePayments(savedCart.useMultiplePayments || false);
      setPayments(savedCart.payments || [
        { method: 'cash', amount: 0, reference: '' },
        { method: 'mpesa', amount: 0, reference: '' },
        { method: 'card', amount: 0, reference: '' },
        { method: 'bank', amount: 0, reference: '' }
      ]);
      verifyCartStock();
    }
  };

  const verifyCartStock = async () => {
    if (cart.length === 0 || !selectedStore || !selectedSalesType) return;

    try {
      const updatedCart = [];
      for (const item of cart) {
        try {
          const itemData = await searchItemsAdvanced({
            search_term: item.sku,
            store_id: parseInt(selectedStore),
            sales_type_id: parseInt(selectedSalesType),
            search_by: 'sku'
          });
          if (itemData.stock_info?.quantity >= item.quantity) {
            updatedCart.push({
              ...item,
              available_stock: itemData.stock_info?.quantity,
              current_price: itemData.price_info?.price,
            });
          } else {
            if (itemData.stock_info?.quantity > 0) {
              updatedCart.push({
                ...item,
                quantity: itemData.stock_info?.quantity,
                available_stock: itemData.stock_info?.quantity,
              });
            }
          }
        } catch (err) {
          // Skip unavailable items
        }
      }

      if (updatedCart.length !== cart.length) {
        setCart(updatedCart);
        setSuccess("Cart updated - some items were adjusted due to stock changes");
        toast.success("Cart updated - some items were adjusted due to stock changes");
      }
    } catch (err) {
      setError("Failed to verify cart items stock");
      toast.error("Failed to verify cart items stock");
    }
  };

  const loadTodaysSales = async () => {
    try {
      const salesData = await getUserDailySales();
      setDailySales(salesData);
    } catch (err) {
      console.error("Failed to load daily sales:", err);
      toast.error("Failed to load daily sales");
    }
  };

  // Load available items when store/sales type changes
  const loadAvailableItems = useCallback(async () => {
    if (!selectedStore || !selectedSalesType) {
      setAvailableItems([]);
      setFilteredItems([]);
      return;
    }

    setItemsLoading(true);
    try {
      const response = await getItemsBySalesType(
        parseInt(selectedSalesType),
        true,
        parseInt(selectedStore)
      );

      if (response.success && response.data.items) {
        const items = response.data.items;
        setAvailableItems(items);
        setFilteredItems(items);
      } else {
        setAvailableItems([]);
        setFilteredItems([]);
        setError("No items found for selected store and sales type");
        toast.error("No items found for selected store and sales type");
      }
    } catch (err) {
      setError("Failed to load items: " + err.message);
      toast.error("Failed to load items: " + err.message);
    } finally {
      setItemsLoading(false);
    }
  }, [selectedStore, selectedSalesType]);

  useEffect(() => {
    loadAvailableItems();
  }, [loadAvailableItems]);

  // Filter items in browser based on search
  const filterItems = (searchText) => {
    if (!searchText.trim()) {
      setFilteredItems(availableItems);
      return;
    }

    const filtered = availableItems.filter(item =>
      item.item_name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.item_sku.toLowerCase().includes(searchText.toLowerCase()) ||
      (item.item_barcode && item.item_barcode.toLowerCase().includes(searchText.toLowerCase()))
    );
    setFilteredItems(filtered);
  };

  // Enhanced search for items by barcode, name, or SKU
  const handleItemSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim() || !selectedStore || !selectedSalesType) return;

    setSearching(true);
    setError("");

    try {
      const itemData = await searchItemsAdvanced({
        search_term: searchTerm,
        store_id: parseInt(selectedStore),
        sales_type_id: parseInt(selectedSalesType),
        search_by: searchBy
      });

      if (itemData && itemData.item_id) {
        addToCart(itemData);
        setSearchTerm("");
        // Auto-focus back to search input for rapid scanning
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      } else {
        setError("Item not found. Try a different search term or method.");
        toast.error("Item not found. Try a different search term or method.");
      }
    } catch (err) {
      setError("Item not found: " + err.message);
      toast.error("Item not found: " + err.message);
    } finally {
      setSearching(false);
    }
  };

  // Add item to cart
  const addToCart = (itemData) => {
    const existingIndex = cart.findIndex((item) => item.id === itemData.item_id);

    if (existingIndex >= 0) {
      const updatedCart = [...cart];
      const newQuantity = updatedCart[existingIndex].quantity + 1;

      if (newQuantity <= itemData.stock_info?.quantity) {
        updatedCart[existingIndex].quantity = newQuantity;
        setCart(updatedCart);
        setSuccess(`Increased quantity for ${itemData.item_name}`);
        toast.success(`Increased quantity for ${itemData.item_name}`);
      } else {
        setError(`Cannot add more. Only ${itemData.stock_info?.quantity} units available.`);
        toast.error(`Cannot add more. Only ${itemData.stock_info?.quantity} units available.`);
      }
    } else {
      if (itemData.stock_info?.quantity > 0) {
        setCart([
          ...cart,
          {
            id: itemData.item_id,
            name: itemData.item_name,
            sku: itemData.item_sku,
            barcode: itemData.item_barcode || "",
            price: itemData.price_info?.price || 0,
            quantity: 1,
            available_stock: itemData.stock_info?.quantity || 0,
          },
        ]);
        toast.success(`${itemData.item_name} added to cart`);
      } else {
        toast.error("Item is out of stock");
      }
    }
  };

  // Update item quantity in cart
  const updateQuantity = (itemId, newQuantity) => {
    const updatedCart = cart
      .map((item) => {
        if (item.id === itemId) {
          const quantity = Math.max(0, Math.min(newQuantity, item.available_stock));
          return { ...item, quantity };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    setCart(updatedCart);
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    const item = cart.find((item) => item.id === itemId);
    setCart(cart.filter((item) => item.id !== itemId));
    if (item) {
      toast.success(`Removed ${item.name} from cart`);
    }
  };

  // Calculate cart totals
  const cartTotals = cart.reduce(
    (totals, item) => ({
      items: totals.items + item.quantity,
      amount: totals.amount + item.price * item.quantity,
    }),
    { items: 0, amount: 0 }
  );

  // Multiple Payments Functions
  const updatePayment = (method, amount, reference = '') => {
    setPayments(prev => prev.map(p => 
      p.method === method ? { ...p, amount: parseFloat(amount) || 0, reference } : p
    ));
  };

  const autoFillRemaining = (method) => {
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = cartTotals.amount - totalPaid;
    
    if (remaining > 0) {
      updatePayment(method, payments.find(p => p.method === method).amount + remaining);
    }
  };

  const clearPayments = () => {
    setPayments([
      { method: 'cash', amount: 0, reference: '' },
      { method: 'mpesa', amount: 0, reference: '' },
      { method: 'card', amount: 0, reference: '' },
      { method: 'bank', amount: 0, reference: '' }
    ]);
  };

  const remainingAmount = cartTotals.amount - payments.reduce((sum, p) => sum + p.amount, 0);
  const isPaymentValid = Math.abs(remainingAmount) < 0.01;

  // Process Sale - First step
  const processSale = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (!selectedStore || !selectedSalesType) {
      toast.error("Please select store and sales type");
      return;
    }

    // Show payment modal for completion
    setShowPaymentModal(true);
  };

  // Complete Sale - Final step with payment details
  const completeSale = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    // Validate payments
    const activePayments = payments.filter(p => p.amount > 0);
    
    if (useMultiplePayments) {
      const totalPaid = activePayments.reduce((sum, p) => sum + p.amount, 0);
      const paymentDifference = Math.abs(totalPaid - cartTotals.amount);
      
      if (paymentDifference > 0.01) {
        toast.error(`Total payments (KES ${totalPaid.toLocaleString()}) must equal cart total (KES ${cartTotals.amount.toLocaleString()})`);
        return;
      }
      
      if (activePayments.length === 0) {
        toast.error("Please add at least one payment method");
        return;
      }
    } else {
      if (activePayments.length === 0) {
        toast.error("Please select a payment method");
        return;
      }
      
      if (activePayments.length > 1) {
        toast.error("Single payment mode: Please select only one payment method");
        return;
      }
    }

    setProcessing(true);

    try {
      const saleData = {
        customer: 1,
        store: parseInt(selectedStore),
        pricing_tier: parseInt(selectedSalesType),
        notes: customerName ? `Walk-in customer: ${customerName}` : "Walk-in customer",
        lines: cart.map((item) => ({
          item: item.id,
          quantity: item.quantity,
        })),
      };

      // Payment data handling
      if (useMultiplePayments) {
        saleData.payments = activePayments.map(payment => ({
          payment_method: payment.method,
          amount: payment.amount.toFixed(2),
          reference: payment.reference
        }));
      } else {
        const selectedPayment = activePayments[0];
        saleData.payment_method = selectedPayment.method;
        saleData.payments = [{
          payment_method: selectedPayment.method,
          amount: cartTotals.amount.toFixed(2),
          reference: selectedPayment.reference
        }];
      }
      
      console.log("Processing sale with data:", saleData);
      const result = await createSale(saleData);
      console.log("Sale created:", result);

      setLastSale(result);
      setCart([]);
      setCustomerName("");
      clearPayments();
      setShowPaymentModal(false);
      cartStorage.clear();
      
      toast.success(`Sale completed! Invoice #${result.reference_no}`);

      // Show receipt after successful sale
      setShowReceipt(true);

      await loadTodaysSales();
    } catch (err) {
      console.error("Sale processing error:", err);
      toast.error("Failed to process sale: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Pause cart
  // MY CODE 
  // const pauseCart = () => {
  //   if (cart.length === 0) return;

  //   const pausedCarts = JSON.parse(localStorage.getItem("pos_paused_carts") || "[]");
  //   pausedCarts.push({
  //     id: Date.now(),
  //     timestamp: new Date().toISOString(),
  //     items: cart,
  //     store: selectedStore,
  //     salesType: selectedSalesType,
  //     useMultiplePayments,
  //     payments,
  //     customerName,
  //   });

  //   localStorage.setItem("pos_paused_carts", JSON.stringify(pausedCarts));
  //   setCart([]);
  //   setCustomerName("");
  //   toast.success("Cart paused and saved");
  // };

  const pauseCart = () => {
  if (cart.length === 0) return;

  // Add typeof window check
  if (typeof window !== 'undefined') {
    const pausedCarts = JSON.parse(localStorage.getItem("pos_paused_carts") || "[]");
    pausedCarts.push({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      items: cart,
      store: selectedStore,
      salesType: selectedSalesType,
      useMultiplePayments,
      payments,
      customerName,
    });

    localStorage.setItem("pos_paused_carts", JSON.stringify(pausedCarts));
    setCart([]);
    setCustomerName("");
    toast.success("Cart paused and saved");
  }
};


  // Resume paused cart
  // MY CODE 
  // const resumeCart = (pausedCart) => {
  //   setCart(pausedCart.items);
  //   setSelectedStore(pausedCart.store);
  //   setSelectedSalesType(pausedCart.salesType);
  //   setUseMultiplePayments(pausedCart.useMultiplePayments || false);
  //   setPayments(pausedCart.payments || [
  //     { method: 'cash', amount: 0, reference: '' },
  //     { method: 'mpesa', amount: 0, reference: '' },
  //     { method: 'card', amount: 0, reference: '' },
  //     { method: 'bank', amount: 0, reference: '' }
  //   ]);
  //   setCustomerName(pausedCart.customerName || "");

  //   const pausedCarts = JSON.parse(localStorage.getItem("pos_paused_carts") || "[]");
  //   const updated = pausedCarts.filter((cart) => cart.id !== pausedCart.id);
  //   localStorage.setItem("pos_paused_carts", JSON.stringify(updated));

  //   toast.success("Cart resumed");
  //   setTimeout(verifyCartStock, 100);
  // };

const resumeCart = (pausedCart) => {
  setCart(pausedCart.items);
  setSelectedStore(pausedCart.store);
  setSelectedSalesType(pausedCart.salesType);
  setUseMultiplePayments(pausedCart.useMultiplePayments || false);
  setPayments(pausedCart.payments || [
    { method: 'cash', amount: 0, reference: '' },
    { method: 'mpesa', amount: 0, reference: '' },
    { method: 'card', amount: 0, reference: '' },
    { method: 'bank', amount: 0, reference: '' }
  ]);
  setCustomerName(pausedCart.customerName || "");

  // Add typeof window check
  if (typeof window !== 'undefined') {
    const pausedCarts = JSON.parse(localStorage.getItem("pos_paused_carts") || "[]");
    const updated = pausedCarts.filter((cart) => cart.id !== pausedCart.id);
    localStorage.setItem("pos_paused_carts", JSON.stringify(updated));
  }

  toast.success("Cart resumed");
  setTimeout(verifyCartStock, 100);
};

  // Get paused carts
  // MY CODE 
  // const getPausedCarts = () => {
  //   return JSON.parse(localStorage.getItem("pos_paused_carts") || "[]");
  // };

const getPausedCarts = () => {
  // Add typeof window check
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem("pos_paused_carts") || "[]");
  }
  return []; // Return empty array during SSR
};

  // Clear all messages
  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Initializing POS System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 p-4 lg:p-6 transition-all duration-300 overflow-hidden ${
      sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-0'
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            POS System
          </h1>
          <p className="text-sm text-muted-foreground">
            Walk-in Sales Terminal
          </p>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <button
            onClick={() => setShowReprint(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
          >
            <FileText className="w-4 h-4" />
            Reprint Receipts
          </button>
          <button
            onClick={() => setShowDailySales(!showDailySales)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <BarChart3 className="w-4 h-4" />
            Daily Sales
          </button>
          {dailySales && (
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Today's Sales</div>
              <div className="font-bold text-green-600">
                KES {dailySales.summary?.overall_total?.toLocaleString() || "0"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 mb-4">
          <X className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
          <button onClick={clearMessages} className="ml-auto text-red-600 hover:text-red-800">×</button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-700">{success}</span>
          <button onClick={clearMessages} className="ml-auto text-green-600 hover:text-green-800">×</button>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-180px)]">
        {/* Left Column - Settings & Info */}
        <div className="lg:col-span-1 space-y-4 overflow-y-auto">
          {/* Settings Card */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-lg font-semibold mb-4">POS Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Store *</label>
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  required
                >
                  <option value="">Select Store</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>{store.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sales Type *</label>
                <select
                  value={selectedSalesType}
                  onChange={(e) => setSelectedSalesType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  required
                >
                  <option value="">Select Sales Type</option>
                  {salesTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUseMultiplePayments(false)}
                    className={`flex-1 p-2 rounded-lg border transition-all duration-200 text-sm ${
                      !useMultiplePayments 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Single
                  </button>
                  <button
                    onClick={() => setUseMultiplePayments(true)}
                    className={`flex-1 p-2 rounded-lg border transition-all duration-200 text-sm ${
                      useMultiplePayments 
                        ? 'bg-green-600 text-white border-green-600 shadow-sm' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Split className="w-3 h-3 inline mr-1" />
                    Split
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info Card */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Info
            </h3>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name (optional)"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
            />
          </div>

          {/* Paused Carts */}
          {getPausedCarts().length > 0 && (
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Paused Carts ({getPausedCarts().length})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {getPausedCarts().map((pausedCart) => (
                  <div key={pausedCart.id} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{pausedCart.items.length} items</p>
                        <p className="text-xs text-gray-600">
                          {new Date(pausedCart.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <button
                        onClick={() => resumeCart(pausedCart)}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1 transition-colors"
                      >
                        <Clock className="w-3 h-3" />
                        Resume
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last Sale Info */}
          {lastSale && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Last Sale
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Invoice #:</span>
                  <span className="font-semibold">{lastSale.reference_no}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-semibold text-green-600">
                    KES {lastSale.total_amount?.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => setLastSale(null)}
                  className="w-full mt-2 px-3 py-1 bg-white border border-green-300 text-green-700 rounded hover:bg-green-50 text-sm transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Middle Column - Search & Cart */}
        <div className="lg:col-span-2 space-y-4 overflow-hidden flex flex-col">
          {/* Enhanced Item Search */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Item Search
            </h3>
            
            {/* Search Method Selection */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <button
                onClick={() => setSearchBy('all')}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg border transition-all duration-200 text-sm ${
                  searchBy === 'all' 
                    ? 'bg-blue-100 text-blue-700 border-blue-300' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                <Filter className="w-3 h-3" />
                All
              </button>
              <button
                onClick={() => setSearchBy('barcode')}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg border transition-all duration-200 text-sm ${
                  searchBy === 'barcode' 
                    ? 'bg-green-100 text-green-700 border-green-300' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                <Barcode className="w-3 h-3" />
                Barcode
              </button>
              <button
                onClick={() => setSearchBy('sku')}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg border transition-all duration-200 text-sm ${
                  searchBy === 'sku' 
                    ? 'bg-purple-100 text-purple-700 border-purple-300' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                <Hash className="w-3 h-3" />
                SKU
              </button>
              <button
                onClick={() => setSearchBy('name')}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg border transition-all duration-200 text-sm ${
                  searchBy === 'name' 
                    ? 'bg-orange-100 text-orange-700 border-orange-300' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                <Tag className="w-3 h-3" />
                Name
              </button>
              <button
                type="button"
                onClick={() => setShowItemBrowser(!showItemBrowser)}
                disabled={!selectedStore || !selectedSalesType}
                className="ml-auto px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors text-sm flex items-center gap-2"
              >
                <Package className="w-3 h-3" />
                Browse
              </button>
            </div>

            <form onSubmit={handleItemSearch} className="flex gap-2">
              <div className="flex-1">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    searchBy === 'barcode' ? "Scan barcode..." :
                    searchBy === 'sku' ? "Enter SKU..." :
                    searchBy === 'name' ? "Search by name..." :
                    "Scan barcode or enter SKU/name..."
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  disabled={!selectedStore || !selectedSalesType}
                />
              </div>
              <button
                type="submit"
                disabled={searching || !selectedStore || !selectedSalesType}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2 transition-colors text-sm"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
                Search
              </button>
            </form>
          </div>

          {/* Enhanced Item Browser */}
          {showItemBrowser && (
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Browse Items
                  {itemsLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                </h3>
                <button
                  onClick={() => setShowItemBrowser(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search within browser */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Start typing to filter items..."
                  onChange={(e) => filterItems(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {filteredItems.map((item) => (
                  <div
                    key={item.item_id}
                    onClick={() => addToCart({
                      item_id: item.item_id,
                      item_name: item.item_name,
                      item_sku: item.item_sku,
                      item_barcode: item.item_barcode || "",
                      price_info: { price: item.price_info?.price || 0 },
                      stock_info: { quantity: item.stock_info?.quantity || 0 },
                    })}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors group"
                  >
                    <h4 className="font-medium group-hover:text-blue-700 text-sm truncate">{item.item_name}</h4>
                    <p className="text-xs text-gray-600">SKU: {item.item_sku}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-semibold text-green-600 text-sm">
                        KES {item.price_info?.price?.toLocaleString() || "0"}
                      </span>
                      <span className={`text-xs ${
                        item.stock_info?.quantity > 0 ? 'text-gray-600' : 'text-red-600'
                      }`}>
                        Stock: {item.stock_info?.quantity || 0}
                      </span>
                    </div>
                  </div>
                ))}
                {filteredItems.length === 0 && (
                  <div className="col-span-2 text-center py-4 text-gray-500">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No items found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Shopping Cart */}
          <div className="bg-white rounded-lg border flex-1 flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Shopping Cart ({cartTotals.items} items)
                </h3>
                {cart.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={pauseCart}
                      className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm flex items-center gap-1 transition-colors"
                    >
                      <Clock className="w-3 h-3" />
                      Pause Cart
                    </button>
                  </div>
                )}
              </div>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Cart is empty</p>
                  <p className="text-sm">Search for items to add to cart</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-600 truncate">SKU: {item.sku}</p>
                        <p className="text-sm text-green-600">KES {item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.available_stock}
                          className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300 disabled:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-right min-w-16">
                        <p className="font-semibold text-sm">KES {(item.price * item.quantity).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Stock: {item.available_stock}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-800 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Summary & Actions */}
        <div className="lg:col-span-1 space-y-4">
          {/* Cart Summary */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Order Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Items:</span>
                <span className="font-semibold">{cartTotals.items}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-green-600">
                <span>Total Amount:</span>
                <span>KES {cartTotals.amount.toLocaleString()}</span>
              </div>
              {useMultiplePayments && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Payment Mode:</span>
                  <span className="capitalize">Split Payment</span>
                </div>
              )}
            </div>

            <button
              onClick={processSale}
              disabled={
                cart.length === 0 ||
                !selectedStore ||
                !selectedSalesType
              }
              className="w-full mt-4 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Process Sale
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Complete Sale</h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <p className="text-lg text-gray-600">Total Amount: <span className="font-bold text-green-600">KES {cartTotals.amount.toLocaleString()}</span></p>
                <div className="text-sm text-gray-500">{cartTotals.items} items</div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex">
              {/* Payment Methods Section */}
              <div className="flex-1 p-6 overflow-y-auto border-r border-gray-200">
                <div className="space-y-6">
                  {/* Payment Mode Toggle */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => setUseMultiplePayments(false)}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
                        !useMultiplePayments 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-lg' 
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-center">
                        <CreditCard className="w-8 h-8 mx-auto mb-2" />
                        <div className="font-semibold">Single Payment</div>
                        <div className="text-sm opacity-90">One payment method</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setUseMultiplePayments(true)}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
                        useMultiplePayments 
                          ? 'bg-green-600 text-white border-green-600 shadow-lg' 
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-center">
                        <Split className="w-8 h-8 mx-auto mb-2" />
                        <div className="font-semibold">Split Payment</div>
                        <div className="text-sm opacity-90">Multiple methods</div>
                      </div>
                    </button>
                  </div>

                  {/* Payment Methods */}
                  {useMultiplePayments ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Split Payment Methods</h3>
                      {payments.map((payment) => (
                        <div key={payment.method} className="space-y-3 p-4 border border-gray-200 rounded-lg">
                          <label className="block text-sm font-medium text-gray-700 capitalize">
                            {payment.method} Payment
                          </label>
                          <div className="flex gap-3">
                            <input
                              type="number"
                              value={payment.amount || ''}
                              onChange={(e) => updatePayment(payment.method, e.target.value)}
                              placeholder="0.00"
                              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                              min="0"
                              step="0.01"
                            />
                            <button
                              onClick={() => autoFillRemaining(payment.method)}
                              disabled={remainingAmount <= 0}
                              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors whitespace-nowrap font-medium"
                            >
                              Fill
                            </button>
                          </div>
                          {(payment.method === 'mpesa' || payment.method === 'bank') && (
                            <input
                              type="text"
                              value={payment.reference}
                              onChange={(e) => updatePayment(payment.method, payment.amount, e.target.value)}
                              placeholder={`${payment.method === 'mpesa' ? 'M-Pesa' : 'Bank'} Reference`}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Select Payment Method</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {payments.map((payment) => (
                          <button
                            key={payment.method}
                            onClick={() => {
                              clearPayments();
                              updatePayment(payment.method, cartTotals.amount);
                            }}
                            className={`p-6 border-2 rounded-xl text-center capitalize transition-all duration-200 ${
                              payment.amount > 0 
                                ? 'bg-green-100 border-green-400 text-green-800 shadow-md' 
                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-semibold text-lg">{payment.method}</div>
                            <div className="text-sm mt-1">KES {cartTotals.amount.toLocaleString()}</div>
                          </button>
                        ))}
                      </div>
                      
                      {/* Reference for selected payment */}
                      {payments.find(p => p.amount > 0) && (
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Reference (Optional):
                          </label>
                          <input
                            type="text"
                            value={payments.find(p => p.amount > 0)?.reference || ''}
                            onChange={(e) => {
                              const activeMethod = payments.find(p => p.amount > 0)?.method;
                              if (activeMethod) {
                                updatePayment(activeMethod, cartTotals.amount, e.target.value);
                              }
                            }}
                            placeholder="Enter reference number"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Summary Section */}
              <div className="w-80 bg-gray-50 p-6 flex-shrink-0">
                <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
                
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-700">Cart Total:</span>
                      <span className="font-bold text-green-600 text-lg">
                        KES {cartTotals.amount.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="space-y-2 border-t pt-3">
                      {payments.filter(p => p.amount > 0).map((payment) => (
                        <div key={payment.method} className="flex justify-between text-sm">
                          <span className="capitalize text-gray-600">{payment.method}:</span>
                          <span className="font-medium">KES {payment.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center border-t pt-3 mt-3">
                      <span className="font-semibold text-lg">Remaining:</span>
                      <span className={`font-bold text-lg ${
                        remainingAmount === 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        KES {remainingAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {!isPaymentValid && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700 text-sm flex items-center gap-2">
                        <X className="w-4 h-4" />
                        Please allocate the full amount across payment methods
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <button
                      onClick={completeSale}
                      disabled={
                        processing ||
                        (useMultiplePayments && !isPaymentValid) ||
                        (!useMultiplePayments && payments.filter(p => p.amount > 0).length === 0)
                      }
                      className="w-full px-6 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-3 transition-colors text-lg"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing Sale...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Complete Sale
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Sales Modal */}
      {showDailySales && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Daily Sales Report</h2>
                <button
                  onClick={() => setShowDailySales(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              {dailySales ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                      <h3 className="font-medium text-blue-800 mb-2">Total Sales</h3>
                      <p className="text-3xl font-bold text-blue-900">
                        KES {dailySales.summary?.overall_total?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                      <h3 className="font-medium text-green-800 mb-2">Total Transactions</h3>
                      <p className="text-3xl font-bold text-green-900">
                        {dailySales.summary?.total_count || 0}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                      <h3 className="font-medium text-purple-800 mb-2">Average Sale</h3>
                      <p className="text-3xl font-bold text-purple-900">
                        KES {dailySales.summary?.average_sale_value?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                      <h3 className="font-medium text-orange-800 mb-2">Today's Date</h3>
                      <p className="text-xl font-bold text-orange-900">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {dailySales.payment_methods && dailySales.payment_methods.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Payment Methods</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dailySales.payment_methods.map((method, index) => (
                          <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <span className="capitalize font-medium text-lg">{method.payment_method}</span>
                            <div className="text-right">
                              <span className="font-semibold text-lg">KES {method.total_amount?.toLocaleString()}</span>
                              <span className="text-sm text-gray-600 ml-2">({method.count} transactions)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                  <p>Loading daily sales data...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Receipt Print Modal */}
      {showReceipt && lastSale && (
        <ReceiptPrint
          sale={lastSale}
          onClose={() => setShowReceipt(false)}
          isReprint={false}
        />
      )}

      {/* Reprint Receipts Modal */}
      <ReprintReceipts
        isOpen={showReprint}
        onClose={() => setShowReprint(false)}
      />
    </div>
  );
};

export default POSSystem;


