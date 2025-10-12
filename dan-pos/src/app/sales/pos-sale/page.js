// i am okay but am missing some things

import React, { useState, useEffect, useCallback } from "react";
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
  Save,
  Receipt,
  Pause,
  Play,
  AlertCircle,
  CheckCircle,
  Loader2,
  BarChart3,
  Package,
} from "lucide-react";
import {
  cartStorage,
  createSale,
  getItemsBySalesType,
  getSalesTypes,
  // getStores,
  getUserDailySales,
  searchItem,
} from "@/lib/api/possale";
import { toast } from "react-toastify";
import { getCurrentUserStores } from "@/lib/api/inventory";

const POSSystem = () => {
  // Core POS state
  const [currentUser] = useState({ id: 1, name: "Kevin Mbari" });
  const [selectedStore, setSelectedStore] = useState("");
  const [selectedSalesType, setSelectedSalesType] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerName, setCustomerName] = useState("");

  // Data states
  const [stores, setStores] = useState([]);
  const [salesTypes, setSalesTypes] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [dailySales, setDailySales] = useState(null);

  // UI states
  const [loading, setLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showDailySales, setShowDailySales] = useState(false);
  const [showItemBrowser, setShowItemBrowser] = useState(false);
  const [lastSale, setLastSale] = useState(null);

  // Error and success states
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Initialize POS system
  useEffect(() => {
    initializePOS();
    loadSavedCart();
    loadTodaysSales();
  }, []);

const initializePOS = async () => {
  setLoading(true);
  try {
    const [storesData, salesTypesData] = await Promise.all([
      getCurrentUserStores(),
      getSalesTypes(),
    ]);

    // CORRECTION: Access the 'assigned_stores' array from the response object
    setStores(storesData.assigned_stores || []); // This is the key fix
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
      setPaymentMethod(savedCart.paymentMethod || "cash");
      verifyCartStock();
    }
  };

  const verifyCartStock = async () => {
    if (cart.length === 0 || !selectedStore || !selectedSalesType) return;

    try {
      const updatedCart = [];
      for (const item of cart) {
        try {
          const itemData = await searchItem({
            search_term: item.sku,
            store_id: parseInt(selectedStore),
            sales_type_id: parseInt(selectedSalesType),
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
        setSuccess(
          "Cart updated - some items were adjusted due to stock changes"
        );
        toast.success(
          "Cart updated - some items were adjusted due to stock changes"
        );
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
      return;
    }

    setItemsLoading(true);
    try {
      const response = await getItemsBySalesType(
        parseInt(selectedSalesType),
        true, // include stock info
        parseInt(selectedStore)
      );

      if (response.success && response.data.items) {
        setAvailableItems(response.data.items);
      } else {
        setAvailableItems([]);
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

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0 || selectedStore || selectedSalesType) {
      cartStorage.save({
        items: cart,
        store: selectedStore,
        salesType: selectedSalesType,
        paymentMethod,
        timestamp: new Date().toISOString(),
      });
    }
  }, [cart, selectedStore, selectedSalesType, paymentMethod]);

  // Search for item by barcode or SKU
  const handleItemSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim() || !selectedStore || !selectedSalesType) return;

    setSearching(true);
    setError("");

    try {
      const itemData = await searchItem({
        search_term: searchTerm,
        store_id: parseInt(selectedStore),
        sales_type_id: parseInt(selectedSalesType),
      });
      addToCart(itemData);
      setSearchTerm("");
    } catch (err) {
      setError("Item not found: " + err.message);
      toast.error("Item not found: " + err.message);
    } finally {
      setSearching(false);
    }
  };

  // Add item to cart
  const addToCart = (itemData) => {
    const existingIndex = cart.findIndex(
      (item) => item.id === itemData.item_id
    );

    if (existingIndex >= 0) {
      const updatedCart = [...cart];
      const newQuantity = updatedCart[existingIndex].quantity + 1;

      if (newQuantity <= itemData.stock_info?.quantity) {
        updatedCart[existingIndex].quantity = newQuantity;
        setCart(updatedCart);
        setSuccess(`Increased quantity for ${itemData.item_name}`);
        toast.success(`Increased quantity for ${itemData.item_name}`);
      } else {
        setError(
          `Cannot add more. Only ${itemData.stock_info?.quantity} units available.`
        );
        toast.error(
          `Cannot add more. Only ${itemData.stock_info?.quantity} units available.`
        );
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
        // setSuccess(`Added ${itemData.item_name} to cart`);
        // toast.success(`Added ${itemData.item_name} to cart`);
      } else {
        // setError("Item is out of stock");
        toast.error("Item is out of stock");
      }
    }
  };

  // Update item quantity in cart
  const updateQuantity = (itemId, newQuantity) => {
    const updatedCart = cart
      .map((item) => {
        if (item.id === itemId) {
          const quantity = Math.max(
            0,
            Math.min(newQuantity, item.available_stock)
          );
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
      // setSuccess(`Removed ${item.name} from cart`);
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

  // Process sale
  const processSale = async () => {
    if (cart.length === 0) {
      // setError("Cart is empty");
      toast.error("Cart is empty");
      return;
    }

    if (!selectedStore || !selectedSalesType) {
      // setError("Please select store and sales type");
      toast.error("Please select store and sales type");
      return;
    }

    setProcessing(true);
    // setError("");

    try {
      const saleData = {
        customer: 1, 
        store: parseInt(selectedStore),
        payment_method: paymentMethod,
        pricing_tier: parseInt(selectedSalesType),
        notes: customerName
          ? `Walk-in customer: ${customerName}`
          : "Walk-in customer",
        lines: cart.map((item) => ({
          item: item.id,
          quantity: item.quantity,
        })),
      };
      console.log("Processing sale with data:", saleData);
      const result = await createSale(saleData);
      console.log("Sale created:", result);

      setLastSale(result);
      setCart([]);
      setCustomerName("");
      cartStorage.clear();
      // setSuccess(`Sale completed! Invoice #${result.reference_no}`);
      toast.success(`Sale completed! Invoice #${result.reference_no}`);

      await loadTodaysSales();
    } catch (err) {
      // setError("Failed to process sale: " + err.message);
      toast.error("Failed to process sale: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Pause cart
  const pauseCart = () => {
    if (cart.length === 0) return;

    const pausedCarts = JSON.parse(
      localStorage.getItem("pos_paused_carts") || "[]"
    );
    pausedCarts.push({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      items: cart,
      store: selectedStore,
      salesType: selectedSalesType,
      paymentMethod,
      customerName,
    });

    localStorage.setItem("pos_paused_carts", JSON.stringify(pausedCarts));
    setCart([]);
    setCustomerName("");
    // setSuccess("Cart paused and saved");
    toast.success("Cart paused and saved");
  };

  // Resume paused cart
  const resumeCart = (pausedCart) => {
    setCart(pausedCart.items);
    setSelectedStore(pausedCart.store);
    setSelectedSalesType(pausedCart.salesType);
    setPaymentMethod(pausedCart.paymentMethod);
    setCustomerName(pausedCart.customerName || "");

    const pausedCarts = JSON.parse(
      localStorage.getItem("pos_paused_carts") || "[]"
    );
    const updated = pausedCarts.filter((cart) => cart.id !== pausedCart.id);
    localStorage.setItem("pos_paused_carts", JSON.stringify(updated));

    // setSuccess("Cart resumed");
    toast.success("Cart resumed");
    setTimeout(verifyCartStock, 100);
  };

  // Get paused carts
  const getPausedCarts = () => {
    return JSON.parse(localStorage.getItem("pos_paused_carts") || "[]");
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
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Receipt className="w-8 h-8 text-blue-600" />
                POS System
              </h1>
              <p className="text-gray-600">Walk-in Sales Terminal</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowDailySales(!showDailySales)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <BarChart3 className="w-4 h-4" />
                Daily Sales
              </button>
              {dailySales && (
                <div className="text-right">
                  <div className="text-sm text-gray-600">Today's Sales</div>
                  <div className="font-bold text-green-600">
                    KES{" "}
                    {dailySales.summary?.overall_total?.toLocaleString() || "0"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={clearMessages}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-700">{success}</span>
            <button
              onClick={clearMessages}
              className="ml-auto text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Item Search & Cart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Store & Sales Type Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store
                  </label>
                  <select
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Store</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sales Type
                  </label>
                  <select
                    value={selectedSalesType}
                    onChange={(e) => setSelectedSalesType(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Sales Type</option>
                    {salesTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="mpesa">M-Pesa</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Item Search */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Search className="w-5 h-5" />
                Item Search
              </h3>
              <form onSubmit={handleItemSearch} className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Scan barcode or enter SKU..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={!selectedStore || !selectedSalesType}
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching || !selectedStore || !selectedSalesType}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
                >
                  {searching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Scan className="w-4 h-4" />
                  )}
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setShowItemBrowser(!showItemBrowser)}
                  disabled={!selectedStore || !selectedSalesType}
                  className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400"
                >
                  <Package className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Item Browser */}
            {showItemBrowser && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Available Items
                  {itemsLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {availableItems.map((item) => (
                    <div
                      key={item.item_id}
                      onClick={() =>
                        addToCart({
                          item_id: item.item_id,
                          item_name: item.item_name,
                          item_sku: item.item_sku,
                          item_barcode: item.item_barcode || "",
                          price_info: { price: item.price_info?.price || 0 },
                          stock_info: {
                            quantity: item.stock_info?.quantity || 0,
                          },
                        })
                      }
                      className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer"
                    >
                      <h4 className="font-medium">{item.item_name}</h4>
                      <p className="text-sm text-gray-600">
                        SKU: {item.item_sku}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-semibold text-green-600">
                          KES {item.price_info?.price?.toLocaleString() || "0"}
                        </span>
                        <span className="text-sm text-gray-600">
                          Stock: {item.stock_info?.quantity || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shopping Cart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Shopping Cart ({cartTotals.items} items)
                </h3>
                {cart.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={pauseCart}
                      className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm flex items-center gap-1"
                    >
                      <Pause className="w-3 h-3" />
                      Pause
                    </button>
                  </div>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Cart is empty</p>
                  <p className="text-sm">Search for items to add to cart</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                        <p className="text-sm text-green-600">
                          KES {item.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.available_stock}
                          className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300 disabled:bg-gray-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          KES {(item.price * item.quantity).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Stock: {item.available_stock}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Summary & Actions */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Info
              </h3>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer name (optional)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Cart Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Summary
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
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Payment Method:</span>
                  <span className="capitalize">{paymentMethod}</span>
                </div>
              </div>

              <button
                onClick={processSale}
                disabled={
                  cart.length === 0 ||
                  processing ||
                  !selectedStore ||
                  !selectedSalesType
                }
                className="w-full mt-6 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Complete Sale
                  </>
                )}
              </button>
            </div>

            {/* Paused Carts */}
            {getPausedCarts().length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Paused Carts ({getPausedCarts().length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {getPausedCarts().map((pausedCart) => (
                    <div
                      key={pausedCart.id}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">
                            {pausedCart.items.length} items
                          </p>
                          <p className="text-xs text-gray-600">
                            {new Date(pausedCart.timestamp).toLocaleString()}
                          </p>
                          {pausedCart.customerName && (
                            <p className="text-xs text-blue-600">
                              {pausedCart.customerName}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => resumeCart(pausedCart)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" />
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
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Last Sale Completed
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Invoice #:</span>
                    <span className="font-semibold">
                      {lastSale.reference_no}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-semibold text-green-600">
                      KES {lastSale.total_amount?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span>
                      {new Date(lastSale.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setLastSale(null)}
                  className="w-full mt-4 px-4 py-2 bg-white border border-green-300 text-green-700 rounded hover:bg-green-50 text-sm"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Daily Sales Modal */}
        {showDailySales && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Daily Sales Report</h2>
                  <button
                    onClick={() => setShowDailySales(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto">
                {dailySales ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-medium text-blue-800">
                          Total Sales
                        </h3>
                        <p className="text-2xl font-bold text-blue-900">
                          KES{" "}
                          {dailySales.summary?.overall_total?.toLocaleString() ||
                            "0"}
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-medium text-green-800">
                          Total Transactions
                        </h3>
                        <p className="text-2xl font-bold text-green-900">
                          {dailySales.summary?.total_count || 0}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h3 className="font-medium text-purple-800">
                          Average Sale
                        </h3>
                        <p className="text-2xl font-bold text-purple-900">
                          KES{" "}
                          {dailySales.summary?.average_sale_value?.toLocaleString() ||
                            "0"}
                        </p>
                      </div>
                    </div>

                    {dailySales.payment_methods &&
                      dailySales.payment_methods.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">
                            Payment Methods
                          </h3>
                          <div className="space-y-2">
                            {dailySales.payment_methods.map((method, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center p-3 bg-gray-50 rounded"
                              >
                                <span className="capitalize font-medium">
                                  {method.payment_method}
                                </span>
                                <div className="text-right">
                                  <span className="font-semibold">
                                    KES {method.total_amount?.toLocaleString()}
                                  </span>
                                  <span className="text-sm text-gray-600 ml-2">
                                    ({method.count} transactions)
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {dailySales.recent_sales &&
                      dailySales.recent_sales.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">
                            Recent Sales
                          </h3>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {dailySales.recent_sales
                              .slice(0, 10)
                              .map((sale) => (
                                <div
                                  key={sale.id}
                                  className="flex justify-between items-center p-3 border border-gray-200 rounded"
                                >
                                  <div>
                                    <span className="font-medium">
                                      #{sale.reference_no}
                                    </span>
                                    <span className="text-sm text-gray-600 ml-2">
                                      {new Date(
                                        sale.created_at
                                      ).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-semibold text-green-600">
                                      KES {sale.total_amount?.toLocaleString()}
                                    </span>
                                    <div className="text-xs text-gray-500 capitalize">
                                      {sale.payment_method}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                    {dailySales.by_user && dailySales.by_user.length > 1 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          Sales by User
                        </h3>
                        <div className="space-y-2">
                          {dailySales.by_user.map((user, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-3 bg-gray-50 rounded"
                            >
                              <span className="font-medium">
                                {user.full_name || user.username}
                              </span>
                              <div className="text-right">
                                <span className="font-semibold">
                                  KES {user.total_amount?.toLocaleString()}
                                </span>
                                <span className="text-sm text-gray-600 ml-2">
                                  ({user.count} sales)
                                </span>
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
      </div>
    </div>
  );
};

export default POSSystem;


