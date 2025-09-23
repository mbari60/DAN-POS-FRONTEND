// lib/api/procurement.js
import { api } from "@/services/api";

// SUPPLIERS
export const getSuppliers = async (params = {}) => {
  try {
    const response = await api.get('/api/procurement/suppliers/', { params });
    return {
      data: response.data.results || response.data || [],
      results: response.data.results || response.data || [],
      count: response.data.count || (Array.isArray(response.data) ? response.data.length : 0)
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch suppliers');
  }
};

export const getSupplier = async (id) => {
  try {
    const response = await api.get(`/api/procurement/suppliers/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch supplier');
  }
};

export const createSupplier = async (supplierData) => {
  try {
    const response = await api.post('/api/procurement/suppliers/', supplierData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create supplier');
  }
};

export const updateSupplier = async (id, supplierData) => {
  try {
    const response = await api.patch(`/api/procurement/suppliers/${id}/`, supplierData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update supplier');
  }
};

export const deleteSupplier = async (id) => {
  try {
    const response = await api.delete(`/api/procurement/suppliers/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete supplier');
  }
};

// Supplier specific operations
export const getSupplierDebtSummary = async (supplierId) => {
  try {
    const response = await api.get(`/api/procurement/suppliers/${supplierId}/debt_summary/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch supplier debt summary');
  }
};

export const getSupplierPurchaseHistory = async (supplierId) => {
  try {
    const response = await api.get(`/api/procurement/suppliers/${supplierId}/purchase_history/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch supplier purchase history');
  }
};

// PURCHASE ORDERS
export const getPurchaseOrders = async (params = {}) => {
  try {
    const response = await api.get('/api/procurement/purchase-orders/', { params });
    return {
      data: response.data.results || response.data || [],
      results: response.data.results || response.data || [],
      count: response.data.count || (Array.isArray(response.data) ? response.data.length : 0)
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch purchase orders');
  }
};

export const getPurchaseOrder = async (id) => {
  try {
    const response = await api.get(`/api/procurement/purchase-orders/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch purchase order');
  }
};

export const createPurchaseOrder = async (purchaseOrderData) => {
  try {
    const response = await api.post('/api/procurement/purchase-orders/', purchaseOrderData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create purchase order');
  }
};

export const updatePurchaseOrder = async (id, purchaseOrderData) => {
  try {
    const response = await api.patch(`/api/procurement/purchase-orders/${id}/`, purchaseOrderData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update purchase order');
  }
};

export const deletePurchaseOrder = async (id) => {
  try {
    const response = await api.delete(`/api/procurement/purchase-orders/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete purchase order');
  }
};

// Purchase Order specific operations
export const addPOItem = async (poId, itemData) => {
  try {
    const response = await api.post(`/api/procurement/purchase-orders/${poId}/add_item/`, itemData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add item to purchase order');
  }
};

export const changePOStatus = async (poId, statusData) => {
  try {
    const response = await api.post(`/api/procurement/purchase-orders/${poId}/change_status/`, statusData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to change purchase order status');
  }
};

// GOODS RECEIPTS
export const getGoodsReceipts = async (params = {}) => {
  try {
    const response = await api.get('/api/procurement/goods-receipts/', { params });
    return {
      data: response.data.results || response.data || [],
      results: response.data.results || response.data || [],
      count: response.data.count || (Array.isArray(response.data) ? response.data.length : 0)
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch goods receipts');
  }
};

export const getGoodsReceipt = async (id) => {
  try {
    const response = await api.get(`/api/procurement/goods-receipts/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch goods receipt');
  }
};

export const createGoodsReceipt = async (goodsReceiptData) => {
  try {
    const response = await api.post('/api/procurement/goods-receipts/', goodsReceiptData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create goods receipt');
  }
};

export const updateGoodsReceipt = async (id, goodsReceiptData) => {
  try {
    const response = await api.patch(`/api/procurement/goods-receipts/${id}/`, goodsReceiptData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update goods receipt');
  }
};

export const deleteGoodsReceipt = async (id) => {
  try {
    const response = await api.delete(`/api/procurement/goods-receipts/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete goods receipt');
  }
};

// Goods Receipt specific operations
export const markGoodsReceiptPaid = async (receiptId, paymentData = {}) => {
  try {
    const response = await api.post(`/api/procurement/goods-receipts/${receiptId}/mark_paid/`, paymentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to mark goods receipt as paid');
  }
};

// SUPPLIER PAYMENTS
export const getSupplierPayments = async (params = {}) => {
  try {
    const response = await api.get('/api/procurement/payments/', { params });
    return {
      data: response.data.results || response.data || [],
      results: response.data.results || response.data || [],
      count: response.data.count || (Array.isArray(response.data) ? response.data.length : 0)
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch supplier payments');
  }
};

export const getSupplierPayment = async (id) => {
  try {
    const response = await api.get(`/api/procurement/payments/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch supplier payment');
  }
};

export const createSupplierPayment = async (paymentData) => {
  try {
    const response = await api.post('/api/procurement/payments/', paymentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create supplier payment');
  }
};

export const updateSupplierPayment = async (id, paymentData) => {
  try {
    const response = await api.patch(`/api/procurement/payments/${id}/`, paymentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update supplier payment');
  }
};

export const deleteSupplierPayment = async (id) => {
  try {
    const response = await api.delete(`/api/procurement/payments/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete supplier payment');
  }
};

// REPORTS
export const getSupplierDebtsReport = async () => {
  try {
    const response = await api.get('/api/procurement/reports/supplier_debts/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch supplier debts report');
  }
};

export const getProcurementSummary = async (days = 30) => {
  try {
    const response = await api.get('/api/procurement/reports/procurement_summary/', {
      params: { days }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch procurement summary');
  }
};

export const getItemPurchaseHistory = async (itemId, days = 90) => {
  try {
    const response = await api.get('/api/procurement/reports/item_purchase_history/', {
      params: { item_id: itemId, days }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch item purchase history');
  }
};

export const getPaymentSummary = async (params = {}) => {
  try {
    const response = await api.get('/api/procurement/reports/payment_summary/', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch payment summary');
  }
};

// INTEGRATION ENDPOINTS
export const getItemCost = async (itemId) => {
  try {
    const response = await api.get('/api/procurement/integration/get_item_cost/', {
      params: { item_id: itemId }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch item cost');
  }
};

export const supplierLookup = async (searchTerm = '') => {
  try {
    const response = await api.get('/api/procurement/integration/supplier_lookup/', {
      params: { search: searchTerm }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to lookup suppliers');
  }
};

// UTILITY FUNCTIONS
export const getPOStatusOptions = () => {
  return [
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent to Supplier' },
    { value: 'confirmed', label: 'Confirmed by Supplier' },
    { value: 'partially_received', label: 'Partially Received' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];
};

export const getPaymentMethodOptions = () => {
  return [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'check', label: 'Check' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'mobile_money', label: 'Mobile Money' }
  ];
};

// Helper function to generate PO number (client-side fallback)
export const generatePONumber = async () => {
  try {
    // Try to get the last PO to generate next number
    const response = await getPurchaseOrders({ page_size: 1 });
    if (response.data.length > 0) {
      const lastPO = response.data[0];
      const lastNumber = parseInt(lastPO.po_number.split('-')[1]);
      return `PO-${(lastNumber + 1).toString().padStart(6, '0')}`;
    }
  } catch (error) {
    console.error('Failed to generate PO number:', error);
  }
  // Fallback to timestamp-based number
  return `PO-${Date.now().toString().slice(-6)}`;
};

// Helper function to calculate PO totals
export const calculatePOTotals = (items) => {
  const totalAmount = items.reduce((sum, item) => {
    return sum + (item.quantity * parseFloat(item.unit_cost || 0));
  }, 0);
  
  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  
  return {
    totalAmount: totalAmount.toFixed(2),
    totalQuantity,
    itemCount: items.length
  };
};

