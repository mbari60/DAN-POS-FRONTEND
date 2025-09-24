// lib/api/saleinvoice.js
import { api } from "@/services/api";

// ==================== VALIDATION ENDPOINTS ====================

/**
 * Validate customer for invoice creation
 * @param {number} customerId - Customer ID
 * @param {string} paymentMethod - Payment method ('cash', 'credit', etc.)
 * @param {number} totalAmount - Total invoice amount
 * @returns {Promise<Object>} Validation result
 */
export const validateCustomerForInvoice = async (customerId, paymentMethod, totalAmount = 0) => {
  try {
    const response = await api.post('/api/sales/sale-invoices/validate_customer_for_invoice/', {
      customer_id: customerId,
      payment_method: paymentMethod,
      total_amount: totalAmount.toString()
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to validate customer for invoice');
  }
};

/**
 * Comprehensive invoice validation
 * @param {Object} invoiceData - Complete invoice data
 * @returns {Promise<Object>} Validation result
 */
export const validateInvoiceCreation = async (invoiceData) => {
  try {
    const response = await api.post('/api/sales/sale-invoices/validate_invoice_creation/', {
      customer_id: invoiceData.customerId,
      store_id: invoiceData.storeId,
      sales_type_id: invoiceData.salesTypeId,
      payment_method: invoiceData.paymentMethod,
      items: invoiceData.items.map(item => ({
        item_id: item.itemId || item.item_id,
        quantity: item.quantity
      }))
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to validate invoice creation');
  }
};

// ==================== INVOICE OPERATIONS ====================

/**
 * Create a new POS sale invoice
 * @param {Object} invoiceData - Invoice data
 * @returns {Promise<Object>} Created invoice
 */
export const createPOSInvoice = async (invoiceData) => {
  try {
    const response = await api.post('/api/sales/pos/create_sale/', {
      customer: invoiceData.customerId,
      store: invoiceData.storeId,
      payment_method: invoiceData.paymentMethod,
      pricing_tier: invoiceData.salesTypeId,
      notes: invoiceData.notes || '',
      lines: invoiceData.items.map(item => ({
        item: item.itemId || item.item_id,
        quantity: item.quantity
      }))
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to create POS invoice');
  }
};

/**
 * Create a credit sale invoice
 * @param {Object} invoiceData - Invoice data
 * @returns {Promise<Object>} Created invoice
 */
export const createCreditSale = async (invoiceData) => {
  try {
    const response = await api.post('/api/sales/credit-sales/create_credit_sale/', {
      customer: invoiceData.customerId,
      store: invoiceData.storeId,
      payment_method: 'credit',
      pricing_tier: invoiceData.salesTypeId,
      notes: invoiceData.notes || '',
      lines: invoiceData.items.map(item => ({
        item: item.itemId || item.item_id,
        quantity: item.quantity
      }))
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to create credit sale');
  }
};

// ==================== INVOICE MANAGEMENT ====================

/**
 * Get all invoices with optional filters
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Invoices list
 */
export const getInvoices = async (params = {}) => {
  try {
    const response = await api.get('/api/sales/sale-invoices/', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch invoices');
  }
};

/**
 * Get specific invoice by ID
 * @param {number} invoiceId - Invoice ID
 * @returns {Promise<Object>} Invoice details
 */
export const getInvoiceById = async (invoiceId) => {
  try {
    const response = await api.get(`/api/sales/sale-invoices/${invoiceId}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch invoice');
  }
};

/**
 * Complete a draft invoice
 * @param {number} invoiceId - Invoice ID
 * @returns {Promise<Object>} Completed invoice
 */
export const completeInvoice = async (invoiceId) => {
  try {
    const response = await api.post(`/api/sales/sale-invoices/${invoiceId}/complete/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to complete invoice');
  }
};

/**
 * Void an invoice
 * @param {number} invoiceId - Invoice ID
 * @param {string} reason - Void reason
 * @param {number} voidedBy - User ID who voided
 * @returns {Promise<Object>} Voided invoice
 */
export const voidInvoice = async (invoiceId, reason, voidedBy) => {
  try {
    const response = await api.post(`/api/sales/sale-invoices/${invoiceId}/void/`, {
      reason,
      voided_by: voidedBy
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to void invoice');
  }
};

/**
 * Get invoice payment history
 * @param {number} invoiceId - Invoice ID
 * @returns {Promise<Object>} Payment history
 */
export const getInvoicePaymentHistory = async (invoiceId) => {
  try {
    const response = await api.get(`/api/sales/sale-invoices/${invoiceId}/payment_history/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch payment history');
  }
};

// ==================== CUSTOMER OPERATIONS ====================

/**
 * Get all customers
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Customers list
 */
export const getCustomers = async (params = {}) => {
  try {
    const response = await api.get('/api/sales/customers/', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch customers');
  }
};

/**
 * Get customer by ID
 * @param {number} customerId - Customer ID
 * @returns {Promise<Object>} Customer details
 */
export const getCustomerById = async (customerId) => {
  try {
    const response = await api.get(`/api/sales/customers/${customerId}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch customer');
  }
};

/**
 * Get customer's sales history
 * @param {number} customerId - Customer ID
 * @returns {Promise<Object>} Sales history
 */
export const getCustomerSalesHistory = async (customerId) => {
  try {
    const response = await api.get(`/api/sales/customers/${customerId}/sales_history/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch customer sales history');
  }
};

/**
 * Get customer's unpaid invoices
 * @param {number} customerId - Customer ID
 * @returns {Promise<Object>} Unpaid invoices
 */
export const getCustomerUnpaidInvoices = async (customerId) => {
  try {
    const response = await api.get(`/api/sales/customers/${customerId}/unpaid_invoices/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch unpaid invoices');
  }
};

// ==================== INVENTORY INTEGRATION ====================

/**
 * Get all stores
 * @returns {Promise<Object>} Stores list
 */
export const getStores = async () => {
  try {
    const response = await api.get('/api/inventory/stores/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch stores');
  }
};

/**
 * Get all sales types
 * @returns {Promise<Object>} Sales types list
 */
export const getSalesTypes = async () => {
  try {
    const response = await api.get('/api/inventory/sales-types/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch sales types');
  }
};

/**
 * Get all items
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Items list
 */
export const getItems = async (params = {}) => {
  try {
    const response = await api.get('/api/inventory/items/', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch items');
  }
};

/**
 * Search items for POS with price and stock info
 * @param {Object} searchData - Search parameters
 * @returns {Promise<Object>} Item with price and stock
 */
export const searchPOSItem = async (searchData) => {
  try {
    const response = await api.post('/api/inventory/inventory-integration/pos_search_item/', searchData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to search POS item');
  }
};

/**
 * Check stock for POS item
 * @param {Object} stockData - Stock check parameters
 * @returns {Promise<Object>} Stock information
 */
export const checkPOSStock = async (stockData) => {
  try {
    const response = await api.post('/api/inventory/inventory-integration/pos_check_stock/', stockData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to check stock');
  }
};

/**
 * Get item price for specific sales type
 * @param {number} itemId - Item ID
 * @param {number} salesTypeId - Sales Type ID
 * @returns {Promise<Object>} Price information
 */
export const getItemPrice = async (itemId, salesTypeId) => {
  try {
    const response = await api.post('/api/inventory/item-price-lookup/get_item_price/', {
      item_id: itemId,
      sales_type_id: salesTypeId
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to get item price');
  }
};

/**
 * Get all items available for a specific sales type with their prices
 * @param {number} salesTypeId - Sales Type ID
 * @param {boolean} includeStockInfo - Whether to include stock information
 * @param {number} storeId - Store ID (required if includeStockInfo is true)
 * @returns {Promise<Object>} Items with prices
 */
export const getItemsBySalesType = async (salesTypeId, includeStockInfo = false, storeId = null) => {
  try {
    const response = await api.post('/api/inventory/item-price-lookup/get_items_by_sales_type/', {
      sales_type_id: salesTypeId,
      include_stock_info: includeStockInfo,
      store_id: storeId
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to get items by sales type');
  }
};

/**
 * Bulk get prices for multiple items
 * @param {Array} items - Array of {item_id, sales_type_id}
 * @returns {Promise<Object>} Bulk price results
 */
export const getBulkItemPrices = async (items) => {
  try {
    const response = await api.post('/api/inventory/item-price-lookup/bulk_get_prices/', {
      items: items
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to get bulk item prices');
  }
};

/**
 * Validate stock for multiple items
 * @param {number} storeId - Store ID
 * @param {Array} items - Array of items with quantities
 * @returns {Promise<Object>} Stock validation results
 */
export const validateStockForInvoice = async (storeId, items) => {
  try {
    const response = await api.post('/api/inventory/inventory-integration/validate_stock_for_invoice/', {
      store_id: storeId,
      items: items
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to validate stock');
  }
};

// ==================== PAYMENT OPERATIONS ====================

/**
 * Create customer payment
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} Created payment
 */
export const createCustomerPayment = async (paymentData) => {
  try {
    const response = await api.post('/api/sales/customer-payments/', paymentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to create payment');
  }
};

/**
 * Get customer payments
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Payments list
 */
export const getCustomerPayments = async (params = {}) => {
  try {
    const response = await api.get('/api/sales/customer-payments/', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch payments');
  }
};

// ==================== REPORTING ENDPOINTS ====================

/**
 * Get today's sales summary
 * @returns {Promise<Object>} Today's sales data
 */
export const getTodaySales = async () => {
  try {
    const response = await api.get('/api/sales/sales-reports/today_sales/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch today\'s sales');
  }
};

/**
 * Generate sales report
 * @param {Object} reportData - Report parameters
 * @returns {Promise<Object>} Sales report
 */
export const generateSalesReport = async (reportData) => {
  try {
    const response = await api.post('/api/sales/sales-reports/generate_report/', reportData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to generate sales report');
  }
};

/**
 * Export sales report to PDF
 * @param {Object} filters - Export filters
 * @returns {Promise<Blob>} PDF file
 */
export const exportSalesReportPDF = async (filters = {}) => {
  try {
    const response = await api.get('/api/sales/pdf-reports/sales_report_pdf/', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to export sales report to PDF');
  }
};

/**
 * Get customer statement PDF
 * @param {number} customerId - Customer ID
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Promise<Blob>} PDF file
 */
export const getCustomerStatementPDF = async (customerId, startDate, endDate) => {
  try {
    const response = await api.get('/api/sales/pdf-reports/customer_statement_pdf/', {
      params: { 
        customer_id: customerId, 
        start_date: startDate, 
        end_date: endDate 
      },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to generate customer statement PDF');
  }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format invoice data for API submission
 * @param {Object} formData - Form data from UI
 * @returns {Object} Formatted invoice data
 */
export const formatInvoiceData = (formData) => {
  return {
    customerId: formData.customer,
    storeId: formData.store,
    salesTypeId: formData.salesType,
    paymentMethod: formData.paymentMethod,
    notes: formData.notes || '',
    items: formData.items.map(item => ({
      itemId: item.itemId || item.item_id,
      quantity: item.quantity
    }))
  };
};

/**
 * Calculate invoice totals
 * @param {Array} items - Invoice items with prices
 * @returns {Object} Totals object
 */
export const calculateInvoiceTotals = (items) => {
  const totalAmount = items.reduce((sum, item) => {
    return sum + (parseFloat(item.price || 0) * parseInt(item.quantity || 0));
  }, 0);
  
  return {
    totalAmount: totalAmount,
    totalItems: items.length,
    balanceDue: totalAmount
  };
};

/**
 * Format currency value
 * @param {number} value - Numeric value
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES'
  }).format(value || 0);
};

/**
 * Validate invoice form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation result
 */
export const validateInvoiceForm = (formData) => {
  const errors = {};
  
  if (!formData.customer) {
    errors.customer = 'Customer is required';
  }
  
  if (!formData.store) {
    errors.store = 'Store is required';
  }
  
  if (!formData.salesType) {
    errors.salesType = 'Sales type is required';
  }
  
  if (!formData.paymentMethod) {
    errors.paymentMethod = 'Payment method is required';
  }
  
  if (!formData.items || formData.items.length === 0) {
    errors.items = 'At least one item is required';
  }
  
  // Validate each item
  if (formData.items) {
    formData.items.forEach((item, index) => {
      if (!item.itemId) {
        errors[`item_${index}_id`] = `Item ${index + 1} is required`;
      }
      if (!item.quantity || item.quantity <= 0) {
        errors[`item_${index}_quantity`] = `Item ${index + 1} quantity must be greater than 0`;
      }
    });
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Export all functions as default object
export default {
  // Validation
  validateCustomerForInvoice,
  validateInvoiceCreation,
  
  // Invoice Operations
  createPOSInvoice,
  createCreditSale,
  getInvoices,
  getInvoiceById,
  completeInvoice,
  voidInvoice,
  getInvoicePaymentHistory,
  
  // Customer Operations
  getCustomers,
  getCustomerById,
  getCustomerSalesHistory,
  getCustomerUnpaidInvoices,
  
  // Inventory Integration
  getStores,
  getSalesTypes,
  getItems,
  searchPOSItem,
  checkPOSStock,
  getItemPrice,
  getItemsBySalesType,
  getBulkItemPrices,
  validateStockForInvoice,
  
  // Payment Operations
  createCustomerPayment,
  getCustomerPayments,
  
  // Reporting
  getTodaySales,
  generateSalesReport,
  exportSalesReportPDF,
  getCustomerStatementPDF,
  
  // Utilities
  formatInvoiceData,
  calculateInvoiceTotals,
  formatCurrency,
  validateInvoiceForm
};

