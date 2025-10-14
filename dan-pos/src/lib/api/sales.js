// lib/api/sales.js
import { api } from "@/services/api";

// Customer operations
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

export const getCustomer = async (id) => {
  try {
    const response = await api.get(`/api/sales/customers/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch customer');
  }
};

export const createCustomer = async (customerData) => {
  try {
    const response = await api.post('/api/sales/customers/', customerData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create customer');
  }
};

export const updateCustomer = async (id, customerData) => {
  try {
    const response = await api.patch(`/api/sales/customers/${id}/`, customerData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update customer');
  }
};

export const deleteCustomer = async (id) => {
  try {
    const response = await api.delete(`/api/sales/customers/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete customer');
  }
};

// Customer specific operations
export const getCustomerSalesHistory = async (customerId) => {
  try {
    const response = await api.get(`/api/sales/customers/${customerId}/sales_history/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch customer sales history');
  }
};

export const getCustomerPaymentHistory = async (customerId) => {
  try {
    const response = await api.get(`/api/sales/customers/${customerId}/payment_history/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch customer payment history');
  }
};

export const getCustomerStatement = async (customerId, startDate, endDate) => {
  try {
    const response = await api.get(`/api/sales/customers/${customerId}/statement/`, {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch customer statement');
  }
};

export const getCustomerBalanceSummary = async () => {
  try {
    const response = await api.get('/api/sales/customers/balance_summary/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch customer balance summary');
  }
};

export const getCustomerAgingReport = async () => {
  try {
    const response = await api.get('/api/sales/customers/aging_report/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch customer aging report');
  }
};

// Sale Invoice operations
export const getSaleInvoices = async (params = {}) => {
  try {
    const response = await api.get('/api/sales/sale-invoices/', { params });
    return {
      data: response.data.results || [],
      results: response.data.results || [],
      count: response.data.count || 0
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch sale invoices');
  }
};

export const getSaleInvoice = async (id) => {
  try {
    const response = await api.get(`/api/sales/sale-invoices/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch sale invoice');
  }
};

export const createSaleInvoice = async (invoiceData) => {
  try {
    const response = await api.post('/api/sales/sale-invoices/', invoiceData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create sale invoice');
  }
};

export const updateSaleInvoice = async (id, invoiceData) => {
  try {
    const response = await api.patch(`/api/sales/sale-invoices/${id}/`, invoiceData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update sale invoice');
  }
};

export const completeSaleInvoice = async (id) => {
  try {
    const response = await api.post(`/api/sales/sale-invoices/${id}/complete/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to complete sale invoice');
  }
};

// export const voidSaleInvoice = async (id, voidData) => {
//   try {
//     const response = await api.post(`/api/sales/sale-invoices/${id}/void/`, voidData);
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.message || 'Failed to void sale invoice');
//   }
// };

export const getInvoicePaymentHistory = async (invoiceId) => {
  try {
    const response = await api.get(`/api/sales/sale-invoices/${invoiceId}/payment_history/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch invoice payment history');
  }
};

// Sale Invoice Line operations
export const getSaleInvoiceLines = async (params = {}) => {
  try {
    const response = await api.get('/api/sales/sale-invoice-lines/', { params });
    return {
      data: response.data.results || [],
      results: response.data.results || [],
      count: response.data.count || 0
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch sale invoice lines');
  }
};

export const getSaleInvoiceLine = async (id) => {
  try {
    const response = await api.get(`/api/sales/sale-invoice-lines/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch sale invoice line');
  }
};

export const createSaleInvoiceLine = async (lineData) => {
  try {
    const response = await api.post('/api/sales/sale-invoice-lines/', lineData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create sale invoice line');
  }
};

export const updateSaleInvoiceLine = async (id, lineData) => {
  try {
    const response = await api.patch(`/api/sales/sale-invoice-lines/${id}/`, lineData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update sale invoice line');
  }
};

export const deleteSaleInvoiceLine = async (id) => {
  try {
    const response = await api.delete(`/api/sales/sale-invoice-lines/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete sale invoice line');
  }
};

// Customer Payment operations
export const getCustomerPayments = async (params = {}) => {
  try {
    const response = await api.get('/api/sales/customer-payments/', { params });
    return {
      data: response.data.results || [],
      results: response.data.results || [],
      count: response.data.count || 0
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch customer payments');
  }
};

export const getCustomerPayment = async (id) => {
  try {
    const response = await api.get(`/api/sales/customer-payments/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch customer payment');
  }
};

export const createCustomerPayment = async (paymentData) => {
  try {
    const response = await api.post('/api/sales/customer-payments/', paymentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create customer payment');
  }
};

export const updateCustomerPayment = async (id, paymentData) => {
  try {
    const response = await api.patch(`/api/sales/customer-payments/${id}/`, paymentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update customer payment');
  }
};

export const deleteCustomerPayment = async (id) => {
  try {
    const response = await api.delete(`/api/sales/customer-payments/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete customer payment');
  }
};

// Payment specific operations
export const autoAllocatePayment = async (paymentId) => {
  try {
    const response = await api.post(`/api/sales/customer-payments/${paymentId}/auto_allocate/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to auto allocate payment');
  }
};

export const manualAllocatePayment = async (paymentId, allocationData) => {
  try {
    const response = await api.post(`/api/sales/customer-payments/${paymentId}/allocate_manual/`, allocationData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to manually allocate payment');
  }
};

export const getPaymentAllocations = async (paymentId) => {
  try {
    const response = await api.get(`/api/sales/customer-payments/${paymentId}/allocations/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch payment allocations');
  }
};

// Payment Allocation operations
export const getPaymentAllocationsList = async (params = {}) => {
  try {
    const response = await api.get('/api/sales/payment-allocations/', { params });
    return {
      data: response.data.results || [],
      results: response.data.results || [],
      count: response.data.count || 0
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch payment allocations');
  }
};

export const getPaymentAllocation = async (id) => {
  try {
    const response = await api.get(`/api/sales/payment-allocations/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch payment allocation');
  }
};

export const createPaymentAllocation = async (allocationData) => {
  try {
    const response = await api.post('/api/sales/payment-allocations/', allocationData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create payment allocation');
  }
};

export const updatePaymentAllocation = async (id, allocationData) => {
  try {
    const response = await api.patch(`/api/sales/payment-allocations/${id}/`, allocationData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update payment allocation');
  }
};

export const deletePaymentAllocation = async (id) => {
  try {
    const response = await api.delete(`/api/sales/payment-allocations/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete payment allocation');
  }
};

// POS operations
export const createPOSSale = async (saleData) => {
  try {
    const response = await api.post('/api/sales/pos/create_sale/', saleData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create POS sale');
  }
};

export const createCreditSale = async (saleData) => {
  try {
    const response = await api.post('/api/sales/credit-sales/create_credit_sale/', saleData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create credit sale');
  }
};

// Daily Sales Summary operations
export const getDailySalesSummaries = async (params = {}) => {
  try {
    const response = await api.get('/api/sales/daily-sales-summaries/', { params });
    return {
      data: response.data.results || [],
      results: response.data.results || [],
      count: response.data.count || 0
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch daily sales summaries');
  }
};

export const getDailySalesSummary = async (id) => {
  try {
    const response = await api.get(`/api/sales/daily-sales-summaries/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch daily sales summary');
  }
};

// Sales Report operations
export const generateSalesReport = async (reportData) => {
  try {
    const response = await api.post('/api/sales/sales-reports/generate_report/', reportData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to generate sales report');
  }
};

export const getTodaySales = async () => {
  try {
    const response = await api.get('/api/sales/sales-reports/today_sales/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch today\'s sales');
  }
};

// Return Management operations
export const getSaleReturns = async (params = {}) => {
  try {
    const response = await api.get('/api/sales/sale-returns/', { params });
    return {
      data: response.data.results || [],
      results: response.data.results || [],
      count: response.data.count || 0
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch sale returns');
  }
};

export const getSaleReturn = async (id) => {
  try {
    const response = await api.get(`/api/sales/sale-returns/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch sale return');
  }
};


export const updateSaleReturn = async (id, returnData) => {
  try {
    console.log('Updating sale return:', id, returnData);
    
    // Format data same as create
    const formattedData = {
      ...returnData,
      original_invoice: parseInt(returnData.original_invoice),
      customer: parseInt(returnData.customer),
      store: parseInt(returnData.store),
      restocking_fee: returnData.restocking_fee ? parseFloat(returnData.restocking_fee) : 0.00,
      lines: returnData.lines.map(line => ({
        original_line: parseInt(line.original_line),
        item: parseInt(line.item),
        original_quantity: parseInt(line.original_quantity),
        quantity_returned: parseInt(line.quantity_returned),
        return_unit_price: parseFloat(line.return_unit_price),
        condition: line.condition || 'good'
      }))
    };

    const response = await api.patch(`/api/sales/sale-returns/${id}/`, formattedData);
    return response.data;
  } catch (error) {
    console.error('Update return error:', error);
    const errorDetails = error.response?.data;
    let message = 'Failed to update sale return';
    
    if (errorDetails) {
      if (errorDetails.error) message = errorDetails.error;
      else if (errorDetails.message) message = errorDetails.message;
      else if (typeof errorDetails === 'object') {
        const fieldErrors = Object.entries(errorDetails)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('; ');
        message = fieldErrors || message;
      }
    }
    
    throw new Error(message);
  }
};

export const approveSaleReturn = async (returnId, data) => {
  try {
    const response = await api.post(  
      `/api/sales/sale-returns/${returnId}/approve/`,
      data
    );
    console.log('Approval response:', response.data); 
    return response.data;
  } catch (error) {
    console.error('Approval error details:', error.response?.data);
    throw new Error(
      error.response?.data?.error || 
      error.response?.data?.message || 
      'Failed to approve sale return'
    );
  }
};

export const rejectSaleReturn = async (id, rejectionData) => {
  try {
    const response = await api.post(
      `/api/sales/sale-returns/${id}/reject/`, 
      rejectionData
    );
    return response.data;
  } catch (error) {
    console.error('Rejection error details:', error.response?.data);
    throw new Error(
      error.response?.data?.error || 
      error.response?.data?.message || 
      'Failed to reject sale return'
    );
  }
};

export const completeSaleReturn = async (id, completionData) => {
  try {
    const response = await api.post(
      `/api/sales/sale-returns/${id}/complete/`, 
      completionData
    );
    return response.data;
  } catch (error) {
    console.error('Completion error details:', error.response?.data);
    throw new Error(
      error.response?.data?.error || 
      error.response?.data?.message || 
      'Failed to complete sale return'
    );
  }
};

export const getReturnableItems = async (invoiceId) => {
  try {
    const response = await api.post('/api/sales/sale-returns/returnable_items/', {
      invoice_id: invoiceId
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch returnable items');
  }
};

export const getReturnSummary = async (params = {}) => {
  try {
    const response = await api.get('/api/sales/sale-returns/summary/', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch return summary');
  }
};

export const getCustomerReturnHistory = async (customerId) => {
  try {
    const response = await api.get('/api/sales/sale-returns/customer_history/', {
      params: { customer_id: customerId }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch customer return history');
  }
};

// Sale Return Line operations
export const getSaleReturnLines = async (params = {}) => {
  try {
    const response = await api.get('/api/sales/sale-return-lines/', { params });
    return {
      data: response.data.results || [],
      results: response.data.results || [],
      count: response.data.count || 0
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch sale return lines');
  }
};

export const getSaleReturnLine = async (id) => {
  try {
    const response = await api.get(`/api/sales/sale-return-lines/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch sale return line');
  }
};

export const createSaleReturnLine = async (lineData) => {
  try {
    const response = await api.post('/api/sales/sale-return-lines/', lineData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create sale return line');
  }
};

export const updateSaleReturnLine = async (id, lineData) => {
  try {
    const response = await api.patch(`/api/sales/sale-return-lines/${id}/`, lineData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update sale return line');
  }
};

export const deleteSaleReturnLine = async (id) => {
  try {
    const response = await api.delete(`/api/sales/sale-return-lines/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete sale return line');
  }
};

// Expense operations
export const getExpenses = async (params = {}) => {
  try {
    const response = await api.get('/api/sales/expenses/', { params });
    return {
      data: response.data.results || [],
      results: response.data.results || [],
      count: response.data.count || 0
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch expenses');
  }
};

export const getExpense = async (id) => {
  try {
    const response = await api.get(`/api/sales/expenses/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch expense');
  }
};

// export const createExpense = async (expenseData) => {
//   try {
//     const response = await api.post('/api/sales/expenses/', expenseData);
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.message || 'Failed to create expense');
//   }
// };

export const createExpense = async (expenseData) => {
  try {
    // Ensure all data is properly formatted
    const formattedData = {
      ...expenseData,
      amount: parseFloat(expenseData.amount).toFixed(2),
      store: parseInt(expenseData.store),
      // Remove any undefined or null values that might cause serializer issues
    };
    
    // Clean the data object
    Object.keys(formattedData).forEach(key => {
      if (formattedData[key] === undefined || formattedData[key] === null) {
        delete formattedData[key];
      }
    });

    const response = await api.post('/api/sales/expenses/', formattedData);
    return response.data;
  } catch (error) {
    // Provide more specific error messages
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        'Failed to create expense';
    throw new Error(errorMessage);
  }
};

export const updateExpense = async (id, expenseData) => {
  try {
    const response = await api.patch(`/api/sales/expenses/${id}/`, expenseData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update expense');
  }
};

export const deleteExpense = async (id) => {
  try {
    const response = await api.delete(`/api/sales/expenses/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete expense');
  }
};

export const approveExpense = async (id) => {
  try {
    const response = await api.post(`/api/sales/expenses/${id}/approve/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to approve expense');
  }
};

export const getExpenseSummary = async (params = {}) => {
  try {
    const response = await api.get('/api/sales/expenses/summary/', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch expense summary');
  }
};

export const getProfitLoss = async (params = {}) => {
  try {
    const response = await api.get('/api/sales/expenses/profit_loss/', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch profit loss statement');
  }
};

// PDF Report operations
export const generateProfitLossPDF = async (params = {}) => {
  try {
    const response = await api.get('/api/sales/pdf-reports/profit_loss_pdf/', {
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to generate profit loss PDF');
  }
};

export const generateSalesReportPDF = async (params = {}) => {
  try {
    const response = await api.get('/api/sales/pdf-reports/sales_report_pdf/', {
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to generate sales report PDF');
  }
};

export const generateCustomerStatementPDF = async (params = {}) => {
  try {
    const response = await api.get('/api/sales/pdf-reports/customer_statement_pdf/', {
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to generate customer statement PDF');
  }
};


export const getItems = async (params = {}) => {
  try {
    const response = await api.get('/api/inventory/items/', { params });
    return { data: response.data.results || [], results: response.data.results || [], count: response.data.count || 0 };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch items');
  }
};

// Enhanced createSaleReturn function to replace the existing one in lib/api/sales.js

export const createSaleReturn = async (returnData) => {
  try {
    console.log('Creating sale return with data:', returnData);
    
    // Validate required fields before sending
    if (!returnData.original_invoice) {
      throw new Error('Original invoice is required');
    }
    if (!returnData.customer) {
      throw new Error('Customer is required');
    }
    if (!returnData.store) {
      throw new Error('Store is required');
    }
    if (!returnData.lines || returnData.lines.length === 0) {
      throw new Error('At least one return line is required');
    }

    // Ensure all numeric fields are properly formatted
    const formattedData = {
      ...returnData,
      original_invoice: parseInt(returnData.original_invoice),
      customer: parseInt(returnData.customer),
      store: parseInt(returnData.store),
      restocking_fee: returnData.restocking_fee ? parseFloat(returnData.restocking_fee) : 0.00,
      lines: returnData.lines.map(line => ({
        original_line: parseInt(line.original_line),
        item: parseInt(line.item),
        original_quantity: parseInt(line.original_quantity),
        quantity_returned: parseInt(line.quantity_returned),
        return_unit_price: parseFloat(line.return_unit_price),
        condition: line.condition || 'good'
      }))
    };

    console.log('Formatted data being sent:', formattedData);

    const response = await api.post('/api/sales/sale-returns/', formattedData);
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Create return error:', error);
    console.error('Error response:', error.response?.data);
    
    // Enhanced error handling to show backend validation messages
    const errorDetails = error.response?.data;
    let message = 'Failed to create sale return';
    
    if (errorDetails) {
      // Handle Django validation errors
      if (errorDetails.error) {
        message = errorDetails.error;
      } else if (errorDetails.message) {
        message = errorDetails.message;
      } else if (typeof errorDetails === 'object') {
        // Extract field-specific errors
        const fieldErrors = Object.entries(errorDetails)
          .map(([field, errors]) => {
            const errorMsg = Array.isArray(errors) ? errors.join(', ') : errors;
            return `${field}: ${errorMsg}`;
          })
          .join('; ');
        message = fieldErrors || message;
      }
    } else if (error.message && !error.response) {
      // Client-side validation error
      message = error.message;
    }
    
    throw new Error(message);
  }
};


// Utility functions for common operations
export const downloadPDF = (blobData, filename) => {
  const url = window.URL.createObjectURL(blobData);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Report types constants
export const REPORT_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  CUSTOMER: 'customer',
  PRODUCT: 'product',
  PAYMENT: 'payment'
};

// Payment method constants
export const PAYMENT_METHODS = {
  CASH: 'cash',
  MPESA: 'mpesa',
  BANK: 'bank',
  CREDIT: 'credit',
  CARD: 'card'
};

// Invoice status constants
export const INVOICE_STATUS = {
  DRAFT: 'draft',
  RESERVED: 'reserved',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  VOIDED: 'voided'
};

// Return status constants
export const RETURN_STATUS = {
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};


// Expense category constants
export const EXPENSE_CATEGORIES = {
  RENT: 'rent',
  UTILITIES: 'utilities',
  SALARIES: 'salaries',
  SUPPLIES: 'supplies',
  MARKETING: 'marketing',
  TRANSPORT: 'transport',
  MAINTENANCE: 'maintenance',
  INSURANCE: 'insurance',
  TAXES: 'taxes',
  OTHER: 'other'
};


// Voiding operations
export const voidSaleInvoice = async (invoiceId, voidData) => {
  try {
    const response = await api.post(`/api/sales/sale-invoices/${invoiceId}/void/`, voidData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || 'Failed to void invoice';
    throw new Error(message);
  }
};

export const voidCustomerPayment = async (paymentId, voidData) => {
  try {
    const response = await api.post(`/api/sales/customer-payments/${paymentId}/void/`, voidData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || 'Failed to void payment';
    throw new Error(message);
  }
};

export const voidSaleReturn = async (returnId, voidData) => {
  try {
    const response = await api.post(`/api/sales/sale-returns/${returnId}/void/`, voidData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || 'Failed to void return';
    throw new Error(message);
  }
};

// Check if transaction can be voided
export const canVoidInvoice = async (invoiceId) => {
  try {
    const invoice = await getSaleInvoice(invoiceId);
    return {
      canVoid: invoice.status === 'completed' && !invoice.is_voided,
      reason: invoice.is_voided ? 'Already voided' : 
              invoice.status !== 'completed' ? 'Only completed invoices can be voided' : 'Can be voided'
    };
  } catch (error) {
    return { canVoid: false, reason: 'Error checking invoice status' };
  }
};



// for sales report  
// Sales Report operations
export const getDetailedSalesReport = async (params = {}) => {
  try {
    const response = await api.get('/api/sales/detailed-sales-reports/detailed_sales_report/', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch detailed sales report');
  }
};

export const getSummarySalesReport = async (params = {}) => {
  try {
    const response = await api.get('/api/sales/detailed-sales-reports/summary_sales_report/', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch summary sales report');
  }
};

export const getDateRangeSummary = async (params = {}) => {
  try {
    const response = await api.get('/api/sales/detailed-sales-reports/date_range_summary/', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch date range summary');
  }
};


// Daily Payments Report
export const getDailyPaymentsReport = async (params = {}) => {
  try {
    const response = await api.get('/api/sales/detailed-sales-reports/daily_payments_report/', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch daily payments report');
  }
};

// Enhanced Summary Report
export const getEnhancedSummaryReport = async (params = {}) => {
  try {
    const response = await api.get('/api/sales/detailed-sales-reports/enhanced_summary_sales_report/', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch enhanced summary report');
  }
};

