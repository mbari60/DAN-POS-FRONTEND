"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  User, Store, ShoppingCart, Plus, Trash2, 
  Search, AlertCircle, CheckCircle, Loader2, Save, 
  Calculator, CreditCard, FileText, Printer, X,
  Package, Receipt, Download, ArrowLeft
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import your actual API service
import { api } from "@/services/api";
import { getCurrentUserStores } from '@/lib/api/inventory';
import EnhancedSuccessModal from '@/components/docsmodal/EnhancedSuccessModal';
import { generatePDFFromElement, printElementAsPDF } from '@/lib/api/saleinvoicesapi';

// API functions for sale invoice operations
const saleInvoiceAPI = {
  getCustomers: async (params = {}) => {
    const response = await api.get('/api/sales/customers/', { params });
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
    if (!formData.items || formData.items.length === 0) errors.items = 'At least one item is required';
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

// Validation Results Display Component
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
    </div>
  );
};

// Quick Preview Component
const QuickPreview = ({ formData, customers, stores, onClose }) => {
  const previewRef = useRef();
  const currentCustomer = customers.find(c => c.id === parseInt(formData.customer));
  const currentStore = stores.find(s => s.id === parseInt(formData.store));

  const handlePrint = async () => {
    if (previewRef.current) {
      await printElementAsPDF(previewRef.current);
    }
  };

  const handleDownload = async () => {
    if (previewRef.current) {
      await generatePDFFromElement(previewRef.current, `invoice_draft_${Date.now()}.pdf`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Invoice Preview</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          <div ref={previewRef} className="bg-white p-6 border border-gray-200 rounded-lg">
            <div className="text-center mb-6 border-b pb-4">
              <h1 className="text-2xl font-bold text-gray-900">INVOICE DRAFT</h1>
              <p className="text-gray-600">Prepared on {new Date().toLocaleDateString()}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
                <p className="text-gray-800 font-medium">{currentCustomer?.name || 'Customer'}</p>
                <p className="text-gray-600 text-sm">{currentCustomer?.customer_code || ''}</p>
                <p className="text-gray-600 text-sm">{currentCustomer?.phone || ''}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Store:</h3>
                <p className="text-gray-800 font-medium">{currentStore?.name || 'Store'}</p>
                <p className="text-gray-600 text-sm">{currentStore?.location || ''}</p>
              </div>
            </div>

            <table className="w-full border-collapse border border-gray-300 mb-6">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Item</th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Qty</th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Price</th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2">{item.itemName}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">{saleInvoiceAPI.formatCurrency(item.price)}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                      {saleInvoiceAPI.formatCurrency(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mb-6">
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  Total: {saleInvoiceAPI.formatCurrency(formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Payment Method: {formData.paymentMethod}
                </div>
              </div>
            </div>

            {formData.notes && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Notes:</h4>
                <p className="text-gray-700 text-sm">{formData.notes}</p>
              </div>
            )}

            <div className="border-t pt-4 text-center text-xs text-gray-500">
              <p>This is a draft document for review purposes only</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 p-4 border-t border-gray-200">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Printer className="w-4 h-4" />
            Print Draft
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
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
    paymentMethod: 'credit',
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
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

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
        getCurrentUserStores(),
        saleInvoiceAPI.getSalesTypes()
      ]);

      setCustomers(customersResponse.results || customersResponse);
      setStores(storesResponse.assigned_stores || []);
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
        true,
        formData.store
      );

      if (response.success && response.data.items) {
        setAvailableItems(response.data.items);
        
        // Update prices and stock for existing items
        if (formData.items.length > 0) {
          updateExistingItemsPricesAndStock(response.data.items);
        }
      }
    } catch (error) {
      console.error('Error loading items:', error);
      toast.error('Failed to load items for selected sales type and store');
    } finally {
      setItemsLoading(false);
    }
  }, [formData.salesType, formData.store]);

  // Update existing items with new prices and stock
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
      const updatedItems = [...formData.items];
      updatedItems[existingIndex].quantity += 1;
      setFormData(prev => ({ ...prev, items: updatedItems }));
      toast.success(`Increased quantity for ${item.item_name}`);
    } else {
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

  // Validate form
  const validateForm = async () => {
    const validation = saleInvoiceAPI.validateInvoiceForm(formData);
    setErrors(validation.errors);
    
    if (validation.isValid && formData.items.length > 0) {
      try {
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
        
        const apiValidation = await saleInvoiceAPI.validateInvoiceCreation(validationData);
        setValidationResult(apiValidation);
        
        if (!apiValidation.can_proceed) {
          const errorMessages = [];
          
          if (apiValidation.validations?.customer && !apiValidation.validations.customer.approved) {
            errorMessages.push(`Customer Issue: ${apiValidation.validations.customer.message}`);
          }
          
          if (apiValidation.validations?.stock && !apiValidation.validations.stock.approved) {
            const stockIssues = apiValidation.validations.stock.results
              ?.filter(r => !r.available)
              ?.map(r => `${r.item_name}: ${r.message}`) || [];
            if (stockIssues.length > 0) {
              errorMessages.push(`Stock Issues: ${stockIssues.join(', ')}`);
            }
          }
          
          if (errorMessages.length > 0) {
            toast.error(errorMessages.join(' | '));
          } else {
            toast.error("Validation failed. Please check the details below.");
          }
          
          return false;
        } else {
          toast.success("Validation successful! Ready to create invoice.");
          return true;
        }
        
      } catch (error) {
        console.error("Validation error:", error);
        toast.error(`Validation failed: ${error.message}`);
        setErrors({ general: error.message });
        return false;
      }
    }
    
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
      
      let response;
      if (formData.paymentMethod === 'credit') {
        response = await saleInvoiceAPI.createCreditSale(invoiceData);
      } else {
        response = await saleInvoiceAPI.createPOSInvoice(invoiceData);
      }

      // Set created invoice for success modal
      setCreatedInvoice(response);
      toast.success('Invoice created successfully!');
      
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
      paymentMethod: 'credit',
      notes: '',
      items: []
    });
    setErrors({});
    setValidationResult(null);
    setSelectedCustomer(null);
    setAvailableItems([]);
    setCreatedInvoice(null);
    toast.info('Form cleared');
  };

  // Close success modal
  const handleCloseSuccessModal = () => {
    setCreatedInvoice(null);
    handleClearForm();
  };

  // Filter items based on search
  const filteredItems = availableItems.filter(item =>
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.item_sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !customers.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Sale Invoice</h1>
              <p className="text-gray-600">Create new sales invoices with delivery notes</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-gray-500">Current User</div>
              <div className="font-medium text-gray-900">Sales Agent</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{errors.general}</span>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
          {/* Left Sidebar - Form */}
          <div className="xl:col-span-3 space-y-6 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer & Store Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Customer & Store
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          {store.name} - {store.location}
                        </option>
                      ))}
                    </select>
                    {errors.store && <p className="mt-1 text-sm text-red-600">{errors.store}</p>}
                  </div>
                </div>
              </div>

              {/* Sales Type & Payment */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Sales & Payment
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          {salesType.name}
                        </option>
                      ))}
                    </select>
                    {errors.salesType && <p className="mt-1 text-sm text-red-600">{errors.salesType}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method *
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => handleFieldChange('paymentMethod', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="credit">Credit</option>
                      <option value="cash">Cash</option>
                      <option value="mpesa">M-Pesa</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  Invoice Items
                  {itemsLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowItemSearch(true)}
                  disabled={!formData.salesType || !formData.store || itemsLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
              {formData.items.length > 0 ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Item</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Price</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Quantity</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Total</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Stock</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {formData.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                              <div className="text-sm text-gray-500">{item.sku}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {saleInvoiceAPI.formatCurrency(item.price)}
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              min="1"
                              max={item.availableStock}
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(index, e.target.value)}
                              className="w-20 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {saleInvoiceAPI.formatCurrency(item.price * item.quantity)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <span className={item.availableStock < item.quantity ? 'text-red-600' : 'text-green-600'}>
                              {item.availableStock}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No items added yet</p>
                  <p className="text-sm text-gray-400 mt-2">Click "Add Item" to start building your invoice</p>
                </div>
              )}

              {errors.items && <p className="text-sm text-red-600 mt-2">{errors.items}</p>}
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter any additional notes for this invoice..."
              />
            </div>

            {/* Validation Results */}
            <ValidationResultsDisplay validationResult={validationResult} />

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={submitLoading || formData.items.length === 0}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex-1"
              >
                {submitLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {submitLoading ? 'Creating Invoice...' : 'Create Invoice'}
              </button>
              
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                disabled={formData.items.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Printer className="w-4 h-4" />
                Preview
              </button>
              
              <button
                type="button"
                onClick={handleClearForm}
                disabled={submitLoading}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Right Sidebar - Summary & Info */}
          <div className="xl:col-span-1 space-y-6">
            {/* Customer Information */}
            {selectedCustomer && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Customer Credit
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Credit Limit:</span>
                    <span className="font-medium">{saleInvoiceAPI.formatCurrency(selectedCustomer.credit_limit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Balance:</span>
                    <span className="font-medium">{saleInvoiceAPI.formatCurrency(selectedCustomer.current_balance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available Credit:</span>
                    <span className="font-medium text-green-600">
                      {saleInvoiceAPI.formatCurrency(selectedCustomer.credit_limit - selectedCustomer.current_balance)}
                    </span>
                  </div>
                  {formData.paymentMethod === 'credit' && totals.totalAmount > (selectedCustomer.credit_limit - selectedCustomer.current_balance) && (
                    <div className="p-2 bg-red-100 border border-red-300 rounded text-red-700 text-xs">
                      ⚠️ Exceeds available credit by {saleInvoiceAPI.formatCurrency(totals.totalAmount - (selectedCustomer.credit_limit - selectedCustomer.current_balance))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Invoice Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-600" />
                Invoice Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-medium">{totals.totalItems}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span className="text-gray-900">Total Amount:</span>
                  <span className="text-green-600">{saleInvoiceAPI.formatCurrency(totals.totalAmount)}</span>
                </div>
                {formData.paymentMethod === 'credit' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm">
                    <strong>Credit Sale:</strong> Customer will be invoiced for {saleInvoiceAPI.formatCurrency(totals.totalAmount)}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowItemSearch(true)}
                  disabled={!formData.salesType || !formData.store}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Items
                </button>
                <button
                  onClick={() => setShowPreview(true)}
                  disabled={formData.items.length === 0}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Preview Draft
                </button>
                <button
                  onClick={handleClearForm}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Form
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Item Search Modal */}
      {showItemSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Add Items to Invoice</h3>
                <button
                  onClick={() => {
                    setShowItemSearch(false);
                    setSearchTerm('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search items by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                  autoFocus
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {itemsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-gray-600">Loading items...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map(item => (
                    <div
                      key={item.item_id}
                      onClick={() => addItem(item)}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{item.item_name}</h4>
                        <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium ml-2 flex-shrink-0">
                          Add
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">SKU: {item.item_sku}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-green-600 font-semibold">
                          {saleInvoiceAPI.formatCurrency(item.price_info?.price || 0)}
                        </span>
                        <span className={`text-xs ${
                          item.stock_info?.quantity > 0 ? 'text-gray-600' : 'text-red-600'
                        }`}>
                          Stock: {item.stock_info?.quantity || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {filteredItems.length === 0 && !itemsLoading && (
                    <div className="col-span-3 text-center py-12 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg">No items found matching your search</p>
                      <p className="text-sm mt-2">Try a different search term or check your filters</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowItemSearch(false);
                  setSearchTerm('');
                }}
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Preview Modal */}
      {showPreview && (
        <QuickPreview
          formData={formData}
          customers={customers}
          stores={stores}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Enhanced Success Modal */}
      {createdInvoice && (
        <EnhancedSuccessModal 
          invoice={createdInvoice} 
          onClose={handleCloseSuccessModal}
          autoPrint={true}
        />
      )}
    </div>
  );
};

export default CreateSaleInvoice;