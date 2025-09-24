import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, Store, DollarSign, ShoppingCart, Plus, Trash2, 
  Search, AlertCircle, CheckCircle, Loader2, Save, 
  Calculator, CreditCard, Banknote, Receipt, FileText 
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import your actual API service
import { api } from "@/services/api";

// API functions for sale invoice operations
const saleInvoiceAPI = {
  getCustomers: async (params = {}) => {
    const response = await api.get('/api/sales/customers/', { params });
    return response.data;
  },
  
  getStores: async () => {
    const response = await api.get('/api/inventory/stores/');
    return response.data;
  },
  
  getSalesTypes: async () => {
    const response = await api.get('/api/inventory/sales-types/');
    return response.data;
  },
  
  getItemsBySalesType: async (salesTypeId, includeStockInfo, storeId) => {
    const response = await api.post('/api/inventory/item-price-lookup/get_items_by_sales_type/', {
      sales_type_id: salesTypeId,
      include_stock_info: includeStockInfo,
      store_id: storeId
    });
    return response.data;
  },
  
  validateInvoiceCreation: async (invoiceData) => {
    const response = await api.post('/api/sales/sale-invoices/validate_invoice_creation/', {
      customer_id: invoiceData.customerId,
      store_id: invoiceData.storeId,
      sales_type_id: invoiceData.salesTypeId,
      payment_method: invoiceData.paymentMethod,
      items: invoiceData.items.map(item => ({
        item_id: item.itemId,
        quantity: item.quantity
      }))
    });
    return response.data;
  },
  
  createPOSInvoice: async (invoiceData) => {
    const response = await api.post('/api/sales/pos/create_sale/', {
      customer: invoiceData.customerId,
      store: invoiceData.storeId,
      payment_method: invoiceData.paymentMethod,
      pricing_tier: invoiceData.salesTypeId,
      notes: invoiceData.notes || '',
      lines: invoiceData.items.map(item => ({
        item: item.itemId,
        quantity: item.quantity
      }))
    });
    return response.data;
  },
  
  createCreditSale: async (invoiceData) => {
    const response = await api.post('/api/sales/credit-sales/create_credit_sale/', {
      customer: invoiceData.customerId,
      store: invoiceData.storeId,
      payment_method: 'credit',
      pricing_tier: invoiceData.salesTypeId,
      notes: invoiceData.notes || '',
      lines: invoiceData.items.map(item => ({
        item: item.itemId,
        quantity: item.quantity
      }))
    });
    return response.data;
  },
  
  formatInvoiceData: (formData) => ({
    customerId: formData.customer,
    storeId: formData.store,
    salesTypeId: formData.salesType,
    paymentMethod: formData.paymentMethod,
    notes: formData.notes || '',
    items: formData.items.map(item => ({
      itemId: item.itemId,
      quantity: item.quantity
    }))
  }),
  
  calculateInvoiceTotals: (items) => {
    const totalAmount = items.reduce((sum, item) => {
      return sum + (parseFloat(item.price || 0) * parseInt(item.quantity || 0));
    }, 0);
    
    return {
      totalAmount: totalAmount,
      totalItems: items.length,
      balanceDue: totalAmount
    };
  },
  
  formatCurrency: (value) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(value || 0);
  },
  
  validateInvoiceForm: (formData) => {
    const errors = {};
    
    if (!formData.customer) errors.customer = 'Customer is required';
    if (!formData.store) errors.store = 'Store is required';
    if (!formData.salesType) errors.salesType = 'Sales type is required';
    if (!formData.paymentMethod) errors.paymentMethod = 'Payment method is required';
    if (!formData.items || formData.items.length === 0) errors.items = 'At least one item is required';
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

// Enhanced Validation Results Display Component
const ValidationResultsDisplay = ({ validationResult }) => {
  if (!validationResult || validationResult.can_proceed) {
    return null;
  }

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <h4 className="font-medium text-red-900">Validation Issues Found</h4>
      </div>
      
      {/* Customer Issues */}
      {validationResult.validations?.customer && !validationResult.validations.customer.approved && (
        <div className="mb-3 p-3 bg-red-100 rounded">
          <h5 className="font-medium text-red-800 mb-1">Customer Credit Issue:</h5>
          <p className="text-sm text-red-700 mb-2">{validationResult.validations.customer.message}</p>
          <div className="grid grid-cols-2 gap-4 text-xs text-red-600">
            <div>Credit Limit: {saleInvoiceAPI.formatCurrency(validationResult.validations.customer.credit_limit)}</div>
            <div>Current Balance: {saleInvoiceAPI.formatCurrency(validationResult.validations.customer.current_balance)}</div>
            <div>After This Sale: {saleInvoiceAPI.formatCurrency(validationResult.validations.customer.potential_balance)}</div>
            <div>Invoice Amount: {saleInvoiceAPI.formatCurrency(validationResult.total_amount)}</div>
          </div>
        </div>
      )}

      {/* Stock Issues */}
      {validationResult.validations?.stock && !validationResult.validations.stock.approved && (
        <div className="mb-3 p-3 bg-orange-100 rounded">
          <h5 className="font-medium text-orange-800 mb-2">Stock Issues:</h5>
          <ul className="text-sm text-orange-700 space-y-1">
            {validationResult.validations.stock.results
              ?.filter(r => !r.available)
              .map((result, index) => (
              <li key={index}>
                • {result.item_name}: {result.message} (Available: {result.available_stock}, Requested: {result.quantity})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Price Issues */}
      {validationResult.validations?.prices && !validationResult.validations.prices.approved && (
        <div className="mb-3 p-3 bg-yellow-100 rounded">
          <h5 className="font-medium text-yellow-800 mb-2">Price Issues:</h5>
          <ul className="text-sm text-yellow-700 space-y-1">
            {validationResult.validations.prices.results
              ?.filter(r => r.issue)
              .map((result, index) => (
              <li key={index}>
                • {result.item_name}: {result.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 text-sm text-red-600">
        <strong>Summary:</strong> {validationResult.summary?.total_items} item(s) for {validationResult.summary?.customer_name} 
        via {validationResult.summary?.payment_method} - Total: {saleInvoiceAPI.formatCurrency(validationResult.total_amount)}
      </div>
    </div>
  );
};

const CreateSaleInvoice = () => {
  // Form state
  const [formData, setFormData] = useState({
    customer: '',
    store: '',
    salesType: '',
    paymentMethod: 'cash',
    notes: '',
    items: []
  });

  // Data states
  const [customers, setCustomers] = useState([]);
  const [stores, setStores] = useState([]);
  const [salesTypes, setSalesTypes] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // UI states
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({});
  const [validationResult, setValidationResult] = useState(null);
  const [showItemSearch, setShowItemSearch] = useState(false);

  // Invoice totals
  const [totals, setTotals] = useState({
    totalAmount: 0,
    totalItems: 0
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load customers, stores, and sales types
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [customersResponse, storesResponse, salesTypesResponse] = await Promise.all([
        saleInvoiceAPI.getCustomers(),
        saleInvoiceAPI.getStores(),
        saleInvoiceAPI.getSalesTypes()
      ]);

      setCustomers(customersResponse.results || customersResponse);
      setStores(storesResponse.results || storesResponse);
      setSalesTypes(salesTypesResponse.results || salesTypesResponse);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load initial data');
      setErrors({ general: 'Failed to load initial data' });
    } finally {
      setLoading(false);
    }
  };

  // Load items when sales type and store are selected
  const loadItemsForSalesType = useCallback(async () => {
    if (!formData.salesType || !formData.store) {
      setAvailableItems([]);
      return;
    }

    try {
      setItemsLoading(true);
      const response = await saleInvoiceAPI.getItemsBySalesType(
        formData.salesType,
        true, // include stock info
        formData.store
      );

      if (response.success && response.data.items) {
        setAvailableItems(response.data.items);
        
        // Update prices and stock for existing items in the invoice
        if (formData.items.length > 0) {
          updateExistingItemsPricesAndStock(response.data.items);
        }
      }
    } catch (error) {
      console.error('Error loading items:', error);
      toast.error('Failed to load items for selected sales type and store');
      setErrors({ items: 'Failed to load items for selected sales type' });
    } finally {
      setItemsLoading(false);
    }
  }, [formData.salesType, formData.store]);

  // Update existing items with new prices and stock when sales type or store changes
  const updateExistingItemsPricesAndStock = (newItems) => {
    setFormData(prev => {
      const updatedItems = prev.items.map(existingItem => {
        const updatedItem = newItems.find(item => item.item_id === existingItem.itemId);
        if (updatedItem) {
          return {
            ...existingItem,
            price: updatedItem.price_info?.price || existingItem.price,
            availableStock: updatedItem.stock_info?.quantity || 0
          };
        }
        return existingItem;
      });

      return {
        ...prev,
        items: updatedItems
      };
    });

    toast.success('Item prices and stock updated based on new selection');
  };

  useEffect(() => {
    loadItemsForSalesType();
  }, [loadItemsForSalesType]);

  // Update customer details when customer changes
  useEffect(() => {
    if (formData.customer) {
      const customer = customers.find(c => c.id === parseInt(formData.customer));
      setSelectedCustomer(customer);
    } else {
      setSelectedCustomer(null);
    }
  }, [formData.customer, customers]);

  // Calculate totals when items change
  useEffect(() => {
    const newTotals = saleInvoiceAPI.calculateInvoiceTotals(formData.items);
    setTotals(newTotals);
  }, [formData.items]);

  // Handle form field changes
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation results when critical fields change
    if (['customer', 'store', 'salesType', 'paymentMethod'].includes(field)) {
      setValidationResult(null);
    }
    
    // Clear related errors
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Add item to invoice
  const addItem = (item) => {
    const existingIndex = formData.items.findIndex(i => i.itemId === item.item_id);
    
    if (existingIndex >= 0) {
      // Increase quantity if item already exists
      const updatedItems = [...formData.items];
      updatedItems[existingIndex].quantity += 1;
      setFormData(prev => ({ ...prev, items: updatedItems }));
      toast.success(`Increased quantity for ${item.item_name}`);
    } else {
      // Add new item
      const newItem = {
        itemId: item.item_id,
        itemName: item.item_name,
        sku: item.item_sku,
        price: item.price_info?.price || 0,
        quantity: 1,
        availableStock: item.stock_info?.quantity || 0
      };
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
      toast.success(`Added ${item.item_name} to invoice`);
    }
    setShowItemSearch(false);
    setSearchTerm('');
  };

  // Update item quantity
  const updateItemQuantity = (index, quantity) => {
    const updatedItems = [...formData.items];
    const newQuantity = Math.max(0, parseInt(quantity) || 0);
    updatedItems[index].quantity = newQuantity;
    
    // Check if quantity exceeds available stock
    if (newQuantity > updatedItems[index].availableStock) {
      toast.warning(`Quantity exceeds available stock (${updatedItems[index].availableStock})`);
    }
    
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  // Remove item from invoice
  const removeItem = (index) => {
    const removedItem = formData.items[index];
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: updatedItems }));
    toast.success(`Removed ${removedItem.itemName} from invoice`);
  };

  // Corrected validateForm function
  const validateForm = async () => {
    const validation = saleInvoiceAPI.validateInvoiceForm(formData);
    console.log("Form validation:", validation);
    console.log("Items to validate:", formData.items);
    
    setErrors(validation.errors);
    
    if (validation.isValid && formData.items.length > 0) {
      try {
        // Prepare validation data
        const validationData = {
          customerId: parseInt(formData.customer),
          storeId: parseInt(formData.store),
          salesTypeId: parseInt(formData.salesType),
          paymentMethod: formData.paymentMethod,
          items: formData.items.map(item => ({
            itemId: item.itemId,
            quantity: parseInt(item.quantity)
          }))
        };
        
        console.log("Sending validation data:", validationData);
        
        const apiValidation = await saleInvoiceAPI.validateInvoiceCreation(validationData);
        console.log("API validation response:", apiValidation);
        
        setValidationResult(apiValidation);
        
        // Handle different validation scenarios
        if (!apiValidation.can_proceed) {
          // Build error messages based on validation results
          const errorMessages = [];
          
          // Check customer validation
          if (apiValidation.validations?.customer && !apiValidation.validations.customer.approved) {
            errorMessages.push(`Customer Issue: ${apiValidation.validations.customer.message}`);
          }
          
          // Check stock validation
          if (apiValidation.validations?.stock && !apiValidation.validations.stock.approved) {
            const stockIssues = apiValidation.validations.stock.results
              ?.filter(r => !r.available)
              ?.map(r => `${r.item_name}: ${r.message}`) || [];
            if (stockIssues.length > 0) {
              errorMessages.push(`Stock Issues: ${stockIssues.join(', ')}`);
            }
          }
          
          // Check price validation
          if (apiValidation.validations?.prices && !apiValidation.validations.prices.approved) {
            errorMessages.push("Price validation failed");
          }
          
          // Show appropriate error message
          if (errorMessages.length > 0) {
            toast.error(errorMessages.join(' | '));
          } else {
            toast.error("Validation failed. Please check the details below.");
          }
          
          return false;
        } else {
          // Validation passed
          toast.success("Validation successful! You can proceed with creating the invoice.");
          return true;
        }
        
      } catch (error) {
        console.error("Validation error:", error);
        toast.error(`Validation failed: ${error.message}`);
        setErrors({ general: error.message });
        return false;
      }
    }
    
    // Form validation failed
    if (!validation.isValid) {
      toast.error("Please fill in all required fields");
    }
    
    return validation.isValid;
  };

  // Submit invoice
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isValid = await validateForm();
    if (!isValid) return;

    setSubmitLoading(true);
    try {
      const invoiceData = saleInvoiceAPI.formatInvoiceData(formData);
      console.log("Submitting invoice data:", invoiceData);
      
      let response;
      if (formData.paymentMethod === 'credit') {
        response = await saleInvoiceAPI.createCreditSale(invoiceData);
      } else {
        response = await saleInvoiceAPI.createPOSInvoice(invoiceData);
      }

      console.log("Invoice creation response:", response);

      // Success notification
      toast.success('Invoice created successfully!');
      
      // Reset form
      setFormData({
        customer: '',
        store: '',
        salesType: '',
        paymentMethod: 'cash',
        notes: '',
        items: []
      });
      setValidationResult(null);
      setErrors({});
      
    } catch (error) {
      console.error("Invoice creation error:", error);
      toast.error(`Failed to create invoice: ${error.message}`);
      setErrors({ general: error.message });
    } finally {
      setSubmitLoading(false);
    }
  };

  // Clear form handler
  const handleClearForm = () => {
    setFormData({
      customer: '',
      store: '',
      salesType: '',
      paymentMethod: 'cash',
      notes: '',
      items: []
    });
    setErrors({});
    setValidationResult(null);
    setSelectedCustomer(null);
    setAvailableItems([]);
    toast.info('Form cleared');
  };

  // Filter items based on search
  const filteredItems = availableItems.filter(item =>
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.item_sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !customers.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Receipt className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Create Sale Invoice</h1>
        </div>
        <p className="text-gray-600">Create a new sales invoice for your customer</p>
      </div>

      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{errors.general}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 col-span-full mb-4">Invoice Details</h2>
          
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Customer *
            </label>
            <select
              value={formData.customer}
              onChange={(e) => handleFieldChange('customer', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.customer ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select Customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.customer_code})
                </option>
              ))}
            </select>
            {errors.customer && <p className="mt-1 text-sm text-red-600">{errors.customer}</p>}
          </div>

          {/* Store Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Store className="w-4 h-4 inline mr-2" />
              Store *
            </label>
            <select
              value={formData.store}
              onChange={(e) => handleFieldChange('store', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.store ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select Store</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>
                  {store.name} ({store.location})
                </option>
              ))}
            </select>
            {errors.store && <p className="mt-1 text-sm text-red-600">{errors.store}</p>}
          </div>

          {/* Sales Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Sales Type *
            </label>
            <select
              value={formData.salesType}
              onChange={(e) => handleFieldChange('salesType', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.salesType ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select Sales Type</option>
              {salesTypes.map(salesType => (
                <option key={salesType.id} value={salesType.id}>
                  {salesType.name} - {salesType.description}
                </option>
              ))}
            </select>
            {errors.salesType && <p className="mt-1 text-sm text-red-600">{errors.salesType}</p>}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Payment Method *
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => handleFieldChange('paymentMethod', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="cash">Cash</option>
              <option value="credit">Credit</option>
              <option value="mpesa">M-Pesa</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
        </div>

        {/* Customer Information Display */}
        {selectedCustomer && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Credit Limit:</span>
                <span className="ml-2 font-medium">{saleInvoiceAPI.formatCurrency(selectedCustomer.credit_limit)}</span>
              </div>
              <div>
                <span className="text-blue-700">Current Balance:</span>
                <span className="ml-2 font-medium">{saleInvoiceAPI.formatCurrency(selectedCustomer.current_balance)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Items Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Invoice Items
              {itemsLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
            </h2>
            <button
              type="button"
              onClick={() => setShowItemSearch(true)}
              disabled={!formData.salesType || !formData.store || itemsLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          {!formData.salesType || !formData.store ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">Please select a store and sales type to add items</p>
            </div>
          ) : null}

          {/* Items List */}
          {formData.items.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Item</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">SKU</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Total</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Stock</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {formData.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {item.itemName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.sku}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {saleInvoiceAPI.formatCurrency(item.price)}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="1"
                          max={item.availableStock}
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(index, e.target.value)}
                          className="w-20 p-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {saleInvoiceAPI.formatCurrency(item.price * item.quantity)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <span className={item.availableStock < item.quantity ? 'text-red-600' : 'text-green-600'}>
                          {item.availableStock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {errors.items && <p className="text-sm text-red-600">{errors.items}</p>}
        </div>

        {/* Item Search Modal */}
        {showItemSearch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-96 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Add Item</h3>
                <div className="mt-2 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {itemsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading items...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredItems.map(item => (
                      <div
                        key={item.item_id}
                        onClick={() => addItem(item)}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">{item.item_name}</h4>
                          <p className="text-sm text-gray-600">SKU: {item.item_sku}</p>
                          <p className="text-sm text-green-600">Stock: {item.stock_info?.quantity || 0}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {saleInvoiceAPI.formatCurrency(item.price_info?.price || 0)}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {filteredItems.length === 0 && !itemsLoading && (
                      <div className="text-center py-8 text-gray-500">
                        No items found matching your search
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowItemSearch(false);
                    setSearchTerm('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Summary */}
        {formData.items.length > 0 && (
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Invoice Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-sm">
                <span className="text-gray-600">Total Items:</span>
                <span className="ml-2 font-medium">{totals.totalItems}</span>
              </div>
              <div className="text-lg font-bold text-right">
                <span className="text-gray-600">Total Amount:</span>
                <span className="ml-2 text-green-600">{saleInvoiceAPI.formatCurrency(totals.totalAmount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Validation Results */}
        <ValidationResultsDisplay validationResult={validationResult} />

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter any additional notes for this invoice..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitLoading || formData.items.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {submitLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {submitLoading ? 'Creating Invoice...' : 'Create Invoice'}
          </button>
          
          <button
            type="button"
            onClick={handleClearForm}
            disabled={submitLoading}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSaleInvoice;