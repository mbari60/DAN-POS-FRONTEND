// // lib/api/saleinvoice.js
// import { api } from "@/services/api";

// // ==================== VALIDATION ENDPOINTS ====================

// /**
//  * Validate customer for invoice creation
//  * @param {number} customerId - Customer ID
//  * @param {string} paymentMethod - Payment method ('cash', 'credit', etc.)
//  * @param {number} totalAmount - Total invoice amount
//  * @returns {Promise<Object>} Validation result
//  */
// export const validateCustomerForInvoice = async (customerId, paymentMethod, totalAmount = 0) => {
//   try {
//     const response = await api.post('/api/sales/sale-invoices/validate_customer_for_invoice/', {
//       customer_id: customerId,
//       payment_method: paymentMethod,
//       total_amount: totalAmount.toString()
//     });
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || 'Failed to validate customer for invoice');
//   }
// };

// /**
//  * Comprehensive invoice validation
//  * @param {Object} invoiceData - Complete invoice data
//  * @returns {Promise<Object>} Validation result
//  */
// export const validateInvoiceCreation = async (invoiceData) => {
//   try {
//     const response = await api.post('/api/sales/sale-invoices/validate_invoice_creation/', {
//       customer_id: invoiceData.customerId,
//       store_id: invoiceData.storeId,
//       sales_type_id: invoiceData.salesTypeId,
//       payment_method: invoiceData.paymentMethod,
//       items: invoiceData.items.map(item => ({
//         item_id: item.itemId || item.item_id,
//         quantity: item.quantity
//       }))
//     });
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || 'Failed to validate invoice creation');
//   }
// };

// // ==================== INVOICE OPERATIONS ====================

// /**
//  * Create a new POS sale invoice
//  * @param {Object} invoiceData - Invoice data
//  * @returns {Promise<Object>} Created invoice
//  */
// export const createPOSInvoice = async (invoiceData) => {
//   try {
//     const response = await api.post('/api/sales/pos/create_sale/', {
//       customer: invoiceData.customerId,
//       store: invoiceData.storeId,
//       payment_method: invoiceData.paymentMethod,
//       pricing_tier: invoiceData.salesTypeId,
//       notes: invoiceData.notes || '',
//       lines: invoiceData.items.map(item => ({
//         item: item.itemId || item.item_id,
//         quantity: item.quantity
//       }))
//     });
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || 'Failed to create POS invoice');
//   }
// };

// /**
//  * Create a credit sale invoice
//  * @param {Object} invoiceData - Invoice data
//  * @returns {Promise<Object>} Created invoice
//  */
// export const createCreditSale = async (invoiceData) => {
//   try {
//     const response = await api.post('/api/sales/credit-sales/create_credit_sale/', {
//       customer: invoiceData.customerId,
//       store: invoiceData.storeId,
//       payment_method: 'credit',
//       pricing_tier: invoiceData.salesTypeId,
//       notes: invoiceData.notes || '',
//       lines: invoiceData.items.map(item => ({
//         item: item.itemId || item.item_id,
//         quantity: item.quantity
//       }))
//     });
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || 'Failed to create credit sale');
//   }
// };

// // ==================== INVOICE MANAGEMENT ====================

// /**
//  * Get all invoices with optional filters
//  * @param {Object} params - Query parameters
//  * @returns {Promise<Object>} Invoices list
//  */
// export const getInvoices = async (params = {}) => {
//   try {
//     const response = await api.get('/api/sales/sale-invoices/', { params });
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || 'Failed to fetch invoices');
//   }
// };

// /**
//  * Get specific invoice by ID
//  * @param {number} invoiceId - Invoice ID
//  * @returns {Promise<Object>} Invoice details
//  */
// export const getInvoiceById = async (invoiceId) => {
//   try {
//     const response = await api.get(`/api/sales/sale-invoices/${invoiceId}/`);
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || 'Failed to fetch invoice');
//   }
// };

// /**
//  * Complete a draft invoice
//  * @param {number} invoiceId - Invoice ID
//  * @returns {Promise<Object>} Completed invoice
//  */
// export const completeInvoice = async (invoiceId) => {
//   try {
//     const response = await api.post(`/api/sales/sale-invoices/${invoiceId}/complete/`);
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || 'Failed to complete invoice');
//   }
// };

// /**
//  * Void an invoice
//  * @param {number} invoiceId - Invoice ID
//  * @param {string} reason - Void reason
//  * @param {number} voidedBy - User ID who voided
//  * @returns {Promise<Object>} Voided invoice
//  */
// export const voidInvoice = async (invoiceId, reason, voidedBy) => {
//   try {
//     const response = await api.post(`/api/sales/sale-invoices/${invoiceId}/void/`, {
//       reason,
//       voided_by: voidedBy
//     });
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || 'Failed to void invoice');
//   }
// };

// /**
//  * Get invoice payment history
//  * @param {number} invoiceId - Invoice ID
//  * @returns {Promise<Object>} Payment history
//  */
// export const getInvoicePaymentHistory = async (invoiceId) => {
//   try {
//     const response = await api.get(`/api/sales/sale-invoices/${invoiceId}/payment_history/`);
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || 'Failed to fetch payment history');
//   }
// };

// // ==================== CUSTOMER OPERATIONS ====================

// /**
//  * Get all customers
//  * @param {Object} params - Query parameters
//  * @returns {Promise<Object>} Customers list
//  */
// export const getCustomers = async (params = {}) => {
//   try {
//     const response = await api.get('/api/sales/customers/', { params });
//     return {
//       data: response.data.results || [],
//       results: response.data.results || [],
//       count: response.data.count || 0
//     };
//   } catch (error) {
//     throw new Error(error.response?.data?.message || 'Failed to fetch customers');
//   }
// };

// /**
//  * Get customer by ID
//  * @param {number} customerId - Customer ID
//  * @returns {Promise<Object>} Customer details
//  */
// export const getCustomerById = async (customerId) => {
//   try {
//     const response = await api.get(`/api/sales/customers/${customerId}/`);
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || 'Failed to fetch customer');
//   }
// };

// /**
//  * Get customer's sales history
//  * @param {number} customerId - Customer ID
//  * @returns {Promise<Object>} Sales history
//  */
// export const getCustomerSalesHistory = async (customerId) => {
//   try {
//     const response = await api.get(`/api/sales/customers/${customerId}/sales_history/`);
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || 'Failed to fetch customer sales history');
//   }
// };

// /**
//  * Get customer's unpaid invoices
//  * @param {number} customerId - Customer ID
//  * @returns {Promise<Object>} Unpaid invoices
//  */
// export const getCustomerUnpaidInvoices = async (customerId) => {
//   try {
//     const response = await api.get(`/api/sales/customers/${customerId}/unpaid_invoices/`);
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || 'Failed to fetch unpaid invoices');
//   }
// };

// // ==================== INVENTORY INTEGRATION ====================

// /**
//  * Get all stores
//  * @returns {Promise<Object>} Stores list
//  */
// export const getStores = async () => {
//   try {
//     const response = await api.get('/api/inventory/stores/');
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || 'Failed to fetch stores');
//   }
// };

// /**
//  * Get all sales types
//  * @returns {Promise<Object>} Sales types list
//  */
// export const getSalesTypes = async () => {
//   try {
//     const response = await api.get('/api/inventory/sales-types/');
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || 'Failed to fetch sales types');
//   }
// };

// /**
//  * Get all items
//  * @param {Object} params - Query parameters
//  * @returns {Promise<Object>} Items list
//  */
// export const getItems = async (params = {}) => {
//   try {
//     const response = await api.get('/api/inventory/items/', { params });
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || 'Failed to fetch items');
//   }
// };

// /**
//  * Search items for POS with price and stock info
//  * @param {Object} searchData - Search parameters
//  * @returns {Promise<Object>} Item with price and stock
//  */
// export const searchPOSItem = async (searchData) => {
//   try {
//     const response = await api.post('/api/inventory/inventory-integration/pos_search_item/', searchData);
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || 'Failed to search POS item');
//   }
// };

// /**
//  * Check stock for POS item
//  * @param {Object} stockData - Stock check parameters
//  * @returns {Promise<Object>} Stock information
//  */
// export const checkPOSStock = async (stockData) => {
//   try {
//     const response = await api.post('/api/inventory/inventory-integration/pos_check_stock/', stockData);
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || 'Failed to check stock');
//   }
// };

// /**
//  * Get item price for specific sales type
//  * @param {number} itemId - Item ID
//  * @param {number} salesTypeId - Sales Type ID
//  * @returns {Promise<Object>} Price information
//  */
// export const getItemPrice = async (itemId, salesTypeId) => {
//   try {
//     const response = await api.post('/api/inventory/item-price-lookup/get_item_price/', {
//       item_id: itemId,
//       sales_type_id: salesTypeId
//     });
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || 'Failed to get item price');
//   }
// };

// /**
//  * Get all items available for a specific sales type with their prices
//  * @param {number} salesTypeId - Sales Type ID
//  * @param {boolean} includeStockInfo - Whether to include stock information
//  * @param {number} storeId - Store ID (required if includeStockInfo is true)
//  * @returns {Promise<Object>} Items with prices
//  */
// export const getItemsBySalesType = async (salesTypeId, includeStockInfo = false, storeId = null) => {
//   try {
//     const response = await api.post('/api/inventory/item-price-lookup/get_items_by_sales_type/', {
//       sales_type_id: salesTypeId,
//       include_stock_info: includeStockInfo,
//       store_id: storeId
//     });
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || 'Failed to get items by sales type');
//   }
// };

// /**
//  * Bulk get prices for multiple items
//  * @param {Array} items - Array of {item_id, sales_type_id}
//  * @returns {Promise<Object>} Bulk price results
//  */
// export const getBulkItemPrices = async (items) => {
//   try {
//     const response = await api.post('/api/inventory/item-price-lookup/bulk_get_prices/', {
//       items: items
//     });
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || 'Failed to get bulk item prices');
//   }
// };

// /**
//  * Validate stock for multiple items
//  * @param {number} storeId - Store ID
//  * @param {Array} items - Array of items with quantities
//  * @returns {Promise<Object>} Stock validation results
//  */
// export const validateStockForInvoice = async (storeId, items) => {
//   try {
//     const response = await api.post('/api/inventory/inventory-integration/validate_stock_for_invoice/', {
//       store_id: storeId,
//       items: items
//     });
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || 'Failed to validate stock');
//   }
// };

// // ==================== PAYMENT OPERATIONS ====================

// /**
//  * Create customer payment
//  * @param {Object} paymentData - Payment data
//  * @returns {Promise<Object>} Created payment
//  */
// export const createCustomerPayment = async (paymentData) => {
//   try {
//     const response = await api.post('/api/sales/customer-payments/', paymentData);
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || 'Failed to create payment');
//   }
// };

// /**
//  * Get customer payments
//  * @param {Object} params - Query parameters
//  * @returns {Promise<Object>} Payments list
//  */
// export const getCustomerPayments = async (params = {}) => {
//   try {
//     const response = await api.get('/api/sales/customer-payments/', { params });
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || 'Failed to fetch payments');
//   }
// };

// // ==================== REPORTING ENDPOINTS ====================

// /**
//  * Get today's sales summary
//  * @returns {Promise<Object>} Today's sales data
//  */
// export const getTodaySales = async () => {
//   try {
//     const response = await api.get('/api/sales/sales-reports/today_sales/');
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || 'Failed to fetch today\'s sales');
//   }
// };

// /**
//  * Generate sales report
//  * @param {Object} reportData - Report parameters
//  * @returns {Promise<Object>} Sales report
//  */
// export const generateSalesReport = async (reportData) => {
//   try {
//     const response = await api.post('/api/sales/sales-reports/generate_report/', reportData);
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || 'Failed to generate sales report');
//   }
// };

// /**
//  * Export sales report to PDF
//  * @param {Object} filters - Export filters
//  * @returns {Promise<Blob>} PDF file
//  */
// export const exportSalesReportPDF = async (filters = {}) => {
//   try {
//     const response = await api.get('/api/sales/pdf-reports/sales_report_pdf/', {
//       params: filters,
//       responseType: 'blob'
//     });
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || 'Failed to export sales report to PDF');
//   }
// };

// /**
//  * Get customer statement PDF
//  * @param {number} customerId - Customer ID
//  * @param {string} startDate - Start date
//  * @param {string} endDate - End date
//  * @returns {Promise<Blob>} PDF file
//  */
// export const getCustomerStatementPDF = async (customerId, startDate, endDate) => {
//   try {
//     const response = await api.get('/api/sales/pdf-reports/customer_statement_pdf/', {
//       params: { 
//         customer_id: customerId, 
//         start_date: startDate, 
//         end_date: endDate 
//       },
//       responseType: 'blob'
//     });
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || 'Failed to generate customer statement PDF');
//   }
// };

// // ==================== UTILITY FUNCTIONS ====================

// /**
//  * Format invoice data for API submission
//  * @param {Object} formData - Form data from UI
//  * @returns {Object} Formatted invoice data
//  */
// export const formatInvoiceData = (formData) => {
//   return {
//     customerId: formData.customer,
//     storeId: formData.store,
//     salesTypeId: formData.salesType,
//     paymentMethod: formData.paymentMethod,
//     notes: formData.notes || '',
//     items: formData.items.map(item => ({
//       itemId: item.itemId || item.item_id,
//       quantity: item.quantity
//     }))
//   };
// };

// /**
//  * Calculate invoice totals
//  * @param {Array} items - Invoice items with prices
//  * @returns {Object} Totals object
//  */
// export const calculateInvoiceTotals = (items) => {
//   const totalAmount = items.reduce((sum, item) => {
//     return sum + (parseFloat(item.price || 0) * parseInt(item.quantity || 0));
//   }, 0);
  
//   return {
//     totalAmount: totalAmount,
//     totalItems: items.length,
//     balanceDue: totalAmount
//   };
// };

// /**
//  * Format currency value
//  * @param {number} value - Numeric value
//  * @returns {string} Formatted currency string
//  */
// export const formatCurrency = (value) => {
//   return new Intl.NumberFormat('en-KE', {
//     style: 'currency',
//     currency: 'KES'
//   }).format(value || 0);
// };

// /**
//  * Validate invoice form data
//  * @param {Object} formData - Form data to validate
//  * @returns {Object} Validation result
//  */
// export const validateInvoiceForm = (formData) => {
//   const errors = {};
  
//   if (!formData.customer) {
//     errors.customer = 'Customer is required';
//   }
  
//   if (!formData.store) {
//     errors.store = 'Store is required';
//   }
  
//   if (!formData.salesType) {
//     errors.salesType = 'Sales type is required';
//   }
  
//   if (!formData.paymentMethod) {
//     errors.paymentMethod = 'Payment method is required';
//   }
  
//   if (!formData.items || formData.items.length === 0) {
//     errors.items = 'At least one item is required';
//   }
  
//   // Validate each item
//   if (formData.items) {
//     formData.items.forEach((item, index) => {
//       if (!item.itemId) {
//         errors[`item_${index}_id`] = `Item ${index + 1} is required`;
//       }
//       if (!item.quantity || item.quantity <= 0) {
//         errors[`item_${index}_quantity`] = `Item ${index + 1} quantity must be greater than 0`;
//       }
//     });
//   }
  
//   return {
//     isValid: Object.keys(errors).length === 0,
//     errors
//   };
// };

// // // Export all functions as default object
// // export default {
// //   // Validation
// //   validateCustomerForInvoice,
// //   validateInvoiceCreation,
  
// //   // Invoice Operations
// //   createPOSInvoice,
// //   createCreditSale,
// //   getInvoices,
// //   getInvoiceById,
// //   completeInvoice,
// //   voidInvoice,
// //   getInvoicePaymentHistory,
  
// //   // Customer Operations
// //   getCustomers,
// //   getCustomerById,
// //   getCustomerSalesHistory,
// //   getCustomerUnpaidInvoices,
  
// //   // Inventory Integration
// //   getStores,
// //   getSalesTypes,
// //   getItems,
// //   searchPOSItem,
// //   checkPOSStock,
// //   getItemPrice,
// //   getItemsBySalesType,
// //   getBulkItemPrices,
// //   validateStockForInvoice,
  
// //   // Payment Operations
// //   createCustomerPayment,
// //   getCustomerPayments,
  
// //   // Reporting
// //   getTodaySales,
// //   generateSalesReport,
// //   exportSalesReportPDF,
// //   getCustomerStatementPDF,
  
// //   // Utilities
// //   formatInvoiceData,
// //   calculateInvoiceTotals,
// //   formatCurrency,
// //   validateInvoiceForm
// // };




// // for the documents download and print modal


// /**
//  * Get all documents with filters
//  * @param {Object} filters - Filter parameters
//  * @returns {Promise<Object>} Documents list
//  */
// export const getDocuments = async (filters = {}) => {
//   try {
//     const response = await api.get('/api/sales/documents/', { params: filters });
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || 'Failed to fetch documents');
//   }
// };

// /**
//  * Print delivery note
//  * @param {number} documentId - Document ID
//  * @returns {Promise<void>}
//  */
// export const printDeliveryNote = async (documentId) => {
//   try {
//     const url = `/api/sales/documents/delivery_note_pdf/${documentId}/`;
//     window.open(url, '_blank');
//   } catch (error) {
//     throw new Error('Failed to print delivery note');
//   }
// };

// /**
//  * Print sale invoice
//  * @param {number} documentId - Document ID
//  * @returns {Promise<void>}
//  */
// export const printSaleInvoice = async (documentId) => {
//   try {
//     const url = `/api/sales/documents/sale_invoice_pdf/${documentId}/`;
//     window.open(url, '_blank');
//   } catch (error) {
//     throw new Error('Failed to print sale invoice');
//   }
// };

// /**
//  * Print payment receipt
//  * @param {number} documentId - Document ID
//  * @returns {Promise<void>}
//  */
// export const printPaymentReceipt = async (documentId) => {
//   try {
//     const url = `/api/sales/documents/payment_receipt_pdf/${documentId}/`;
//     window.open(url, '_blank');
//   } catch (error) {
//     throw new Error('Failed to print payment receipt');
//   }
// };

// /**
//  * Download document
//  * @param {number} documentId - Document ID
//  * @param {string} documentType - Type of document
//  * @returns {Promise<void>}
//  */
// export const downloadDocument = async (documentId, documentType) => {
//   try {
//     let url = '';
//     switch (documentType) {
//       case 'sale_invoice':
//         url = `/api/sales/documents/sale_invoice_pdf/${documentId}/?download=true`;
//         break;
//       case 'delivery_note':
//         url = `/api/sales/documents/delivery_note_pdf/${documentId}/?download=true`;
//         break;
//       case 'payment_receipt':
//         url = `/api/sales/documents/payment_receipt_pdf/${documentId}/?download=true`;
//         break;
//       default:
//         throw new Error('Invalid document type');
//     }

//     const response = await fetch(url);
//     const blob = await response.blob();
//     const downloadUrl = window.URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = downloadUrl;
//     link.download = `${documentType}_${documentId}.pdf`;
//     document.body.appendChild(link);
//     link.click();
//     link.remove();
//     window.URL.revokeObjectURL(downloadUrl);
//   } catch (error) {
//     throw new Error(error.message || 'Failed to download document');
//   }
// };

// // export default {
// //   getDocuments,
// //   printDeliveryNote,
// //   printSaleInvoice,
// //   printPaymentReceipt,
// //   downloadDocument
// // };

// // Export all functions as default object
// export default {
//   // Validation
//   validateCustomerForInvoice,
//   validateInvoiceCreation,
  
//   // Invoice Operations
//   createPOSInvoice,
//   createCreditSale,
//   getInvoices,
//   getInvoiceById,
//   completeInvoice,
//   voidInvoice,
//   getInvoicePaymentHistory,
  
//   // Customer Operations
//   getCustomers,
//   getCustomerById,
//   getCustomerSalesHistory,
//   getCustomerUnpaidInvoices,
  
//   // Inventory Integration
//   getStores,
//   getSalesTypes,
//   getItems,
//   searchPOSItem,
//   checkPOSStock,
//   getItemPrice,
//   getItemsBySalesType,
//   getBulkItemPrices,
//   validateStockForInvoice,
  
//   // Payment Operations
//   createCustomerPayment,
//   getCustomerPayments,
  
//   // Reporting
//   getTodaySales,
//   generateSalesReport,
//   exportSalesReportPDF,
//   getCustomerStatementPDF,
  
//   // Utilities
//   formatInvoiceData,
//   calculateInvoiceTotals,
//   formatCurrency,
//   validateInvoiceForm,

//   // docs
//   getDocuments,
//   printDeliveryNote,
//   printSaleInvoice,
//   printPaymentReceipt,
//   downloadDocument
// };




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
    return {
      data: response.data.results || [],
      results: response.data.results || [],
      count: response.data.count || 0
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch customers');
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

// ==================== PDF UTILITIES ====================

/**
 * Fetch PDF as blob from backend URL
 * @param {string} url - Full API URL for the PDF
 * @returns {Promise<Blob>} PDF blob
 */
export const fetchPDFBlob = async (url) => {
  try {
    const response = await api.get(url, { 
      responseType: 'blob',
      headers: { 'Accept': 'application/pdf' }  // Ensure PDF response
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch PDF');
  }
};

/**
 * Print PDF blob programmatically
 * @param {Blob} blob - PDF blob
 * @param {string} title - Window title
 * @param {boolean} autoClose - Close window after print (default: false)
 * @returns {Promise<void>}
 */
export const printPDFBlob = async (blob, title = 'Document', autoClose = false) => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(
      url, 
      '_blank', 
      'width=800,height=600,scrollbars=yes,resizable=yes'  // Minimal window
    );

    if (!printWindow) {
      reject(new Error('Blocked by popup blocker. Please allow popups.'));
      return;
    }

    printWindow.document.title = title;
    printWindow.onload = () => {
      try {
        printWindow.focus();
        printWindow.print();
        if (autoClose) {
          printWindow.close();
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    };

    printWindow.onerror = () => {
      reject(new Error('Failed to load PDF for printing'));
    };

    // Cleanup after delay
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  });
};

/**
 * Updated print functions (no more window.open redirects)
 */
export const printDeliveryNote = async (documentId) => {
  const url = `/api/sales/documents/delivery_note_pdf/${documentId}/`;
  const blob = await fetchPDFBlob(url);
  await printPDFBlob(blob, 'Delivery Note', false);  // Set autoClose=true if you want to close after print
};

export const printSaleInvoice = async (documentId) => {
  const url = `/api/sales/documents/sale_invoice_pdf/${documentId}/`;
  const blob = await fetchPDFBlob(url);
  await printPDFBlob(blob, 'Sale Invoice', false);
};

export const printPaymentReceipt = async (documentId) => {
  const url = `/api/sales/documents/payment_receipt_pdf/${documentId}/`;
  const blob = await fetchPDFBlob(url);
  await printPDFBlob(blob, 'Payment Receipt', false);
};

/**
 * Updated download (already blob-based, but enhanced)
 */
// export const downloadDocument = async (documentId, documentType) => {
//   try {
//     let url = '';
//     switch (documentType) {
//       case 'sale_invoice':
//         url = `/api/sales/documents/sale_invoice_pdf/${documentId}/`;
//         break;
//       case 'delivery_note':
//         url = `/api/sales/documents/delivery_note_pdf/${documentId}/`;
//         break;
//       case 'payment_receipt':
//         url = `/api/sales/documents/payment_receipt_pdf/${documentId}/`;
//         break;
//       default:
//         throw new Error('Invalid document type');
//     }

//     const blob = await fetchPDFBlob(url);
//     const downloadUrl = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = downloadUrl;
//     link.download = `${documentType}_${documentId}.pdf`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(downloadUrl);
//   } catch (error) {
//     throw new Error(error.message || 'Failed to download document');
//   }
// };

/**
 * Get all documents with filters
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Object>} Documents list
 */
export const getDocuments = async (filters = {}) => {
  try {
    const response = await api.get('/api/sales/documents/', { params: filters });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch documents');
  }
};


// ==================== DOCUMENT DATA ENDPOINTS ====================

/**
 * Get delivery note data for frontend PDF generation
 * @param {number} documentId - Document ID
 * @returns {Promise<Object>} Delivery note data
 */
export const getDeliveryNoteData = async (documentId) => {
  try {
    const response = await api.get(`/api/sales/documents/delivery_note_data/${documentId}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch delivery note data');
  }
};

/**
 * Get sale invoice data for frontend PDF generation
 * @param {number} documentId - Document ID
 * @returns {Promise<Object>} Sale invoice data
 */
export const getSaleInvoiceData = async (documentId) => {
  try {
    const response = await api.get(`/api/sales/documents/sale_invoice_data/${documentId}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch sale invoice data');
  }
};

/**
 * Get payment receipt data for frontend PDF generation
 * @param {number} documentId - Document ID
 * @returns {Promise<Object>} Payment receipt data
 */
export const getPaymentReceiptData = async (documentId) => {
  try {
    const response = await api.get(`/api/sales/documents/payment_receipt_data/${documentId}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch payment receipt data');
  }
};

// ==================== FRONTEND PDF GENERATION ====================

/**
 * Generate PDF from HTML element
 * @param {HTMLElement} element - HTML element to convert to PDF
 * @param {string} filename - Output filename
 * @param {string} orientation - 'portrait' or 'landscape'
 * @returns {Promise<void>}
 */
// export const generatePDFFromElement = async (element, filename = 'document.pdf', orientation = 'portrait') => {
//   const html2canvas = (await import('html2canvas')).default;
//   const jsPDF = (await import('jspdf')).default;
  
//   const canvas = await html2canvas(element, {
//     scale: 2,
//     useCORS: true,
//     logging: false,
//     backgroundColor: '#ffffff'
//   });
  
//   const imgData = canvas.toDataURL('image/png');
//   const pdf = new jsPDF({
//     orientation: orientation,
//     unit: 'mm',
//     format: 'a4'
//   });
  
//   const imgWidth = 210; // A4 width in mm
//   const pageHeight = 295; // A4 height in mm
//   const imgHeight = (canvas.height * imgWidth) / canvas.width;
//   let heightLeft = imgHeight;
//   let position = 0;
  
//   pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
//   heightLeft -= pageHeight;
  
//   while (heightLeft >= 0) {
//     position = heightLeft - imgHeight;
//     pdf.addPage();
//     pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
//     heightLeft -= pageHeight;
//   }
  
//   pdf.save(filename);
// };

/**
 * Print HTML element as PDF
 * @param {HTMLElement} element - HTML element to print
 */
// export const printElementAsPDF = async (element) => {
//   const html2canvas = (await import('html2canvas')).default;
  
//   const canvas = await html2canvas(element, {
//     scale: 2,
//     useCORS: true,
//     logging: false,
//     backgroundColor: '#ffffff'
//   });
  
//   const printWindow = window.open('', '_blank');
//   printWindow.document.write(`
//     <html>
//       <head>
//         <title>Print Document</title>
//         <style>
//           body { margin: 0; padding: 0; }
//           img { width: 100%; height: auto; }
//           @media print {
//             body { margin: 0; }
//             img { width: 100%; height: auto; }
//           }
//         </style>
//       </head>
//       <body>
//         <img src="${canvas.toDataURL('image/png')}" />
//       </body>
//     </html>
//   `);
//   printWindow.document.close();
//   printWindow.focus();
  
//   printWindow.onload = () => {
//     printWindow.print();
//     // printWindow.close(); // Uncomment to auto-close after print
//   };
// };

// Update the default export to include new functions
// export default {
//   // ... all your existing exports ...
  
//   // New document data functions
//   getDeliveryNoteData,
//   getSaleInvoiceData,
//   getPaymentReceiptData,
  
//   // New PDF generation functions
//   generatePDFFromElement,
//   printElementAsPDF,
  
//   // ... rest of your existing exports ...
// };


// ==================== PRINTING FUNCTIONS ====================

/**
 * Generate PDF from HTML element for printing
 */
export const generatePDFFromElement = async (element, filename = 'document.pdf', orientation = 'portrait') => {
  const html2canvas = (await import('html2canvas')).default;
  const jsPDF = (await import('jspdf')).default;
  
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff'
  });
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: 'a4'
  });
  
  const imgWidth = 210; // A4 width in mm
  const pageHeight = 295; // A4 height in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  pdf.save(filename);
};

/**
 * Print HTML element directly
 */
export const printElementAsPDF = async (element) => {
  const html2canvas = (await import('html2canvas')).default;
  
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff'
  });
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Document</title>
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          img { 
            width: 100%; 
            height: auto;
            display: block;
          }
          @page {
            size: A4;
            margin: 0;
          }
          @media print {
            body { margin: 0; }
            img { width: 100%; height: auto; }
          }
        </style>
      </head>
      <body onload="window.print();">
        <img src="${canvas.toDataURL('image/png')}" />
      </body>
    </html>
  `);
  printWindow.document.close();
};

/**
 * Print invoice summary for quick receipt
 */
export const printInvoiceSummary = async (invoiceData, items, customer, store) => {
  const printWindow = window.open('', '_blank');
  
  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice Summary - ${invoiceData.reference_no}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.4;
          }
          .header { 
            text-align: center; 
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          .company-name { 
            font-size: 24px; 
            font-weight: bold; 
            color: #2c5aa0; 
          }
          .invoice-title { 
            font-size: 20px; 
            font-weight: bold; 
            margin: 10px 0; 
          }
          .details { 
            margin: 20px 0; 
          }
          .details-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 10px; 
            margin-bottom: 15px;
          }
          .items-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
          }
          .items-table th, .items-table td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
          }
          .items-table th { 
            background-color: #f5f5f5; 
            font-weight: bold; 
          }
          .total { 
            font-size: 18px; 
            font-weight: bold; 
            text-align: right; 
            margin-top: 15px;
            border-top: 2px solid #333;
            padding-top: 10px;
          }
          .footer { 
            margin-top: 30px; 
            text-align: center; 
            font-size: 12px; 
            color: #666; 
          }
          @media print {
            body { margin: 15px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">YOUR COMPANY NAME LTD</div>
          <div class="invoice-title">INVOICE SUMMARY</div>
        </div>
        
        <div class="details">
          <div class="details-grid">
            <div><strong>Invoice No:</strong> ${invoiceData.reference_no}</div>
            <div><strong>Date:</strong> ${new Date(invoiceData.created_at).toLocaleDateString()}</div>
            <div><strong>Customer:</strong> ${customer?.name || 'Walk-in Customer'}</div>
            <div><strong>Store:</strong> ${store?.name || 'N/A'}</div>
            <div><strong>Payment Method:</strong> ${invoiceData.payment_method}</div>
            <div><strong>Sales Person:</strong> ${invoiceData.created_by_name || 'System'}</div>
          </div>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>${item.itemName}</td>
                <td>${item.quantity}</td>
                <td>${saleInvoiceAPI.formatCurrency(item.price)}</td>
                <td>${saleInvoiceAPI.formatCurrency(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total">
          Total Amount: ${saleInvoiceAPI.formatCurrency(invoiceData.total_amount)}
        </div>
        
        ${invoiceData.notes ? `
          <div class="notes">
            <strong>Notes:</strong> ${invoiceData.notes}
          </div>
        ` : ''}
        
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="no-print" style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Print Receipt
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Close
          </button>
        </div>
      </body>
    </html>
  `;
  
  printWindow.document.write(printContent);
  printWindow.document.close();
};


export const printDocument = async (Component, props, title = 'Document') => {
  return new Promise((resolve, reject) => {
    try {
      // Create a temporary container
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      document.body.appendChild(tempContainer);

      // Render the component
      const { render, unmountComponentAtNode } = require('react-dom');
      render(Component, tempContainer);

      // Wait for render and print
      setTimeout(async () => {
        try {
          await printElementAsPDF(tempContainer);
          unmountComponentAtNode(tempContainer);
          document.body.removeChild(tempContainer);
          resolve();
        } catch (error) {
          unmountComponentAtNode(tempContainer);
          document.body.removeChild(tempContainer);
          reject(error);
        }
      }, 1000);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Download document using React component
 */
export const downloadDocument = async (Component, props, filename = 'document.pdf') => {
  return new Promise((resolve, reject) => {
    try {
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      document.body.appendChild(tempContainer);

      const { render, unmountComponentAtNode } = require('react-dom');
      render(Component, tempContainer);

      setTimeout(async () => {
        try {
          await generatePDFFromElement(tempContainer, filename);
          unmountComponentAtNode(tempContainer);
          document.body.removeChild(tempContainer);
          resolve();
        } catch (error) {
          unmountComponentAtNode(tempContainer);
          document.body.removeChild(tempContainer);
          reject(error);
        }
      }, 1000);
    } catch (error) {
      reject(error);
    }
  });
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
  validateInvoiceForm,

  // docs
  getDocuments,
  printDeliveryNote,
  printSaleInvoice,
  printPaymentReceipt,
  downloadDocument,
  printDocument,
    // New document data functions
  getDeliveryNoteData,
  getSaleInvoiceData,
  getPaymentReceiptData,
  
  // New PDF generation functions
  generatePDFFromElement,
  printElementAsPDF,

};

