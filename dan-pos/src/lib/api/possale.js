// lib/api/possale.js
import { api } from "@/services/api";

// POS Sale CRUD operations
export const getStores = async () => {
  try {
    const response = await api.get('/api/inventory/stores/');
    return response.data.results || response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch stores');
  }
};

export const getSalesTypes = async () => {
  try {
    const response = await api.get('/api/inventory/sales-types/');
    return response.data.results || response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch sales types');
  }
};

export const searchItem = async (searchData) => {
  try {
    const response = await api.post('/api/inventory/inventory-integration/pos_search_item/', {
      search_term: searchData.search_term,
      store_id: searchData.store_id,
      sales_type_id: searchData.sales_type_id
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Item not found');
  }
};

export const getItemsBySalesType = async (salesTypeId, includeStockInfo, storeId) => {
  try {
    const response = await api.post('/api/inventory/item-price-lookup/get_items_by_sales_type/', {
      sales_type_id: salesTypeId,
      include_stock_info: includeStockInfo,
      store_id: storeId
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch items');
  }
};

// export const createSale = async (saleData) => {
//   try {
//     const response = await api.post('/api/sales/pos/create_sale/', saleData);
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to create sale');
//   }
// };
export const searchSales = async (filters) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.search_term) params.append('search_term', filters.search_term);
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    const response = await api.get(`/api/sales/pos/search_receipts/?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to search sales');
  }
};

export const createSale = async (saleData) => {
  try {
    console.log("Sending sale data:", JSON.stringify(saleData, null, 2));
    const response = await api.post('/api/sales/pos/create_sale/', saleData);
    return response.data;
  } catch (error) {
    console.error("Sale creation error:", error.response?.data);
    throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to create sale');
  }
};

export const getUserDailySales = async (date = null) => {
  try {
    const queryDate = date || new Date().toISOString().split('T')[0];
    const response = await api.get(`/api/sales/sales-reports/today_sales/?date=${queryDate}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch daily sales');
  }
};

// Cart storage utilities
export const cartStorage = {
  save: (cartData) => {
    localStorage.setItem('pos_cart', JSON.stringify(cartData));
  },
  
  load: () => {
    const saved = localStorage.getItem('pos_cart');
    return saved ? JSON.parse(saved) : null;
  },
  
  clear: () => {
    localStorage.removeItem('pos_cart');
  }
};

// Helper function to get paused carts
export const getPausedCarts = () => {
  return JSON.parse(localStorage.getItem('pos_paused_carts') || '[]');
};

// Helper function to save paused cart
export const savePausedCart = (pausedCart) => {
  const pausedCarts = getPausedCarts();
  pausedCarts.push(pausedCart);
  localStorage.setItem('pos_paused_carts', JSON.stringify(pausedCarts));
};

// Helper function to remove paused cart
export const removePausedCart = (cartId) => {
  const pausedCarts = getPausedCarts();
  const updated = pausedCarts.filter(cart => cart.id !== cartId);
  localStorage.setItem('pos_paused_carts', JSON.stringify(updated));
};



// lib/api/possale.js - Add these functions
export const searchItemsAdvanced = async (searchData) => {
  try {
    const response = await api.post('/api/inventory/inventory-integration/pos_search_advanced/', {
      search_term: searchData.search_term,
      store_id: searchData.store_id,
      sales_type_id: searchData.sales_type_id,
      search_by: searchData.search_by || 'all' // barcode, sku, name, all
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Item not found');
  }
};

export const searchItemsByName = async (searchData) => {
  try {
    const response = await api.post('/api/inventory/inventory-integration/pos_search_by_name/', {
      search_term: searchData.search_term,
      store_id: searchData.store_id,
      sales_type_id: searchData.sales_type_id,
      limit: searchData.limit || 50
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'No items found');
  }
};

// Daily Report Functions
export const getDailyReportPreview = async (date = null) => {
  try {
    const queryDate = date || new Date().toISOString().split('T')[0];
    const response = await api.get(`/api/sales/reports/daily/preview/?date=${queryDate}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch daily report preview');
  }
};

export const sendDailyReport = async (date = null, email = null) => {
  try {
    const payload = {};
    if (date) payload.date = date;
    if (email) payload.email = email;
    
    const response = await api.post('/api/sales/reports/daily/send/', payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to send daily report');
  }
};

