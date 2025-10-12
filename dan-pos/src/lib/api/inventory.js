// lib/api/inventory.js
import { api } from "@/services/api";


export const getCategories = async (params = {}) => {
  try {
    const response = await api.get('/api/inventory/categories/', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch categories');
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await api.post('/api/inventory/categories/', categoryData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create category');
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const response = await api.patch(`/api/inventory/categories/${id}/`, categoryData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update category');
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/api/inventory/categories/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete category');
  }
};


export const getItem = async (id) => {
  try {
    const response = await api.get(`/api/inventory/items/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch item');
  }
};

export const createItem = async (itemData) => {
  try {
    const response = await api.post('/api/inventory/items/', itemData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create item');
  }
};

export const updateItem = async (id, itemData) => {
  try {
    const response = await api.patch(`/api/inventory/items/${id}/`, itemData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update item');
  }
};

export const deleteItem = async (id) => {
  try {
    const response = await api.delete(`/api/inventory/items/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete item');
  }
};

// Item specific operations
export const getItemPriceHistory = async (itemId) => {
  try {
    const response = await api.get(`/api/inventory/items/${itemId}/price_history/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch price history');
  }
};

export const getItemMovementHistory = async (itemId) => {
  try {
    const response = await api.get(`/api/inventory/items/${itemId}/movement_history/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch movement history');
  }
};

export const getLowStockItems = async () => {
  try {
    const response = await api.get('/api/inventory/items/low_stock/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch low stock items');
  }
};



// Stock Adjustment operations
export const getStockAdjustments = async (params = {}) => {
  try {
    const response = await api.get('/api/inventory/stock-adjustments/', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch stock adjustments');
  }
};

export const createStockAdjustment = async (adjustmentData) => {
  try {
    const response = await api.post('/api/inventory/stock-adjustments/', adjustmentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create stock adjustment');
  }
};

// Reports operations
export const getStockAlerts = async () => {
  try {
    const response = await api.get('/api/inventory/inventory-reports/stock-alerts/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch stock alerts');
  }
};

// export const getValuationReport = async () => {
//   try {
//     const response = await api.get('/api/inventory/inventory-reports/valuation/');
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.message || 'Failed to fetch valuation report');
//   }
// };

// POS Integration operations
export const posSearchItem = async (searchData) => {
  try {
    const response = await api.post('/api/inventory/inventory-integration/pos_search_item/', searchData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to search item');
  }
};

export const posAddToCart = async (cartData) => {
  try {
    const response = await api.post('/api/inventory/inventory-integration/pos_add_to_cart/', cartData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add item to cart');
  }
};

export const posCheckStock = async (stockCheckData) => {
  try {
    const response = await api.post('/api/inventory/inventory-integration/pos_check_stock/', stockCheckData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to check stock');
  }
};

export const getPosSalesTypes = async () => {
  try {
    const response = await api.get('/api/inventory/inventory-integration/pos_sales_types/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch POS sales types');
  }
};

// Integration operations
export const recordSale = async (saleData) => {
  try {
    const response = await api.post('/api/inventory/inventory-integration/record_sale/', saleData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to record sale');
  }
};

export const recordPurchase = async (purchaseData) => {
  try {
    const response = await api.post('/api/inventory/inventory-integration/record_purchase/', purchaseData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to record purchase');
  }
};

export const recordTransfer = async (transferData) => {
  try {
    const response = await api.post('/api/inventory/inventory-integration/record_transfer/', transferData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to record transfer kindly ensure quantities and other paramaters are checked before submitting');
  }
};


// Sales Type operations
export const getSalesTypes = async (params = {}) => {
  try {
    const response = await api.get('/api/inventory/sales-types/', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch sales types');
  }
};

export const createSalesType = async (salesTypeData) => {
  try {
    const response = await api.post('/api/inventory/sales-types/', salesTypeData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create sales type');
  }
};

export const updateSalesType = async (id, salesTypeData) => {
  try {
    const response = await api.patch(`/api/inventory/sales-types/${id}/`, salesTypeData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update sales type');
  }
};

export const deleteSalesType = async (id) => {
  try {
    const response = await api.delete(`/api/inventory/sales-types/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete sales type');
  }
};

// Item Price operations
export const getItemPrices = async (params = {}) => {
  try {
    const response = await api.get('/api/inventory/item-prices/', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch item prices');
  }
};

export const createItemPrice = async (priceData) => {
  try {
    const response = await api.post('/api/inventory/item-prices/', priceData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create item price');
  }
};

export const updateItemPrice = async (id, priceData) => {
  try {
    const response = await api.patch(`/api/inventory/item-prices/${id}/`, priceData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update item price');
  }
};

export const deleteItemPrice = async (id) => {
  try {
    const response = await api.delete(`/api/inventory/item-prices/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete item price');
  }
};


export const createStore = async (storeData) => {
  try {
    const response = await api.post('/api/inventory/stores/', storeData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create store');
  }
};

export const updateStore = async (id, storeData) => {
  try {
    const response = await api.patch(`/api/inventory/stores/${id}/`, storeData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update store');
  }
};

export const deleteStore = async (id) => {
  try {
    const response = await api.delete(`/api/inventory/stores/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete store');
  }
};

// Store specific operations
export const getStoreInventory = async (storeId) => {
  try {
    const response = await api.get(`/api/inventory/stores/${storeId}/inventory/`);
    return {
      data: response.data.results || [],
      count: response.data.count || 0
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch store inventory');
  }
};

export const getStoreMovements = async (storeId) => {
  try {
    const response = await api.get(`/api/inventory/stores/${storeId}/movements/`);
    return {
      data: response.data.results || [],
      count: response.data.count || 0
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch store movements');
  }
};

// Stock operations
export const getStock = async (params = {}) => {
  try {
    const response = await api.get('/api/inventory/stock/', { params });
    return {
      data: response.data.results || [],
      count: response.data.count || 0
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch stock');
  }
};

export const adjustStock = async (stockId, adjustmentData) => {
  try {
    const response = await api.post(`/api/inventory/stock/${stockId}/adjust/`, adjustmentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to adjust stock');
  }
};


export const getStores = async (params = {}) => {
  try {
    const response = await api.get('/api/inventory/stores/', { params });
    console.log("Stores API response:", response.data);
    
    // Your API returns data with 'results' array
    return {
      data: response.data.results || [],
      results: response.data.results || [], // Add results for consistency
      count: response.data.count || 0
    };
  } catch (error) {
    console.error("Stores API error:", error);
    throw new Error(error.response?.data?.message || 'Failed to fetch stores');
  }
};

// Fixed getItems function  
export const getItems = async (params = {}) => {
  try {
    const response = await api.get('/api/inventory/items/', { params });
    console.log("Items API response:", response.data);
    
    // Your API returns data with 'results' array
    return {
      data: response.data.results || [],
      results: response.data.results || [], // Add results for consistency
      count: response.data.count || 0
    };
  } catch (error) {
    console.error("Items API error:", error);
    throw new Error(error.response?.data?.message || 'Failed to fetch items');
  }
};

// Fixed getStockMovements function
export const getStockMovements = async (params = {}) => {
  try {
    const response = await api.get('/api/inventory/stock-movements/', { params });
    console.log("Stock movements API response:", response.data);
    
    // Your API returns data with 'results' array
    return {
      data: response.data.results || [],
      results: response.data.results || [], // Add results for consistency
      count: response.data.count || 0
    };
  } catch (error) {
    console.error("Stock movements API error:", error);
    throw new Error(error.response?.data?.message || 'Failed to fetch stock movements');
  }
};

// Fixed getMovementSummary function
export const getMovementSummary = async (days = 30) => {
  try {
    const response = await api.get('/api/inventory/inventory-reports/movement-summary/', {
      params: { days }
    });
    console.log("Movement summary API response:", response.data);
    
    // The summary endpoint returns an array directly, not in a results wrapper
    return {
      data: Array.isArray(response.data) ? response.data : [],
      results: Array.isArray(response.data) ? response.data : [],
      count: Array.isArray(response.data) ? response.data.length : 0
    };
  } catch (error) {
    console.error("Movement summary API error:", error);
    // Return empty data instead of throwing to prevent blocking the UI
    return {
      data: [],
      results: [],
      count: 0
    };
  }
};


// for store allocation 

export const assignStoresToUser = async (assignmentData) => {
  try {
    const response = await api.post('/api/inventory/store-assignments/assign_stores_to_user/', assignmentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to assign stores to user');
  }
};

export const removeStoresFromUser = async (assignmentData) => {
  try {
    const response = await api.post('/api/inventory/store-assignments/remove_stores_from_user/', assignmentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to remove stores from user');
  }
};

export const assignUsersToStore = async (storeId, assignmentData) => {
  try {
    const response = await api.post(`/api/inventory/stores/${storeId}/assign_users/`, assignmentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to assign users to store');
  }
};

export const removeUsersFromStore = async (storeId, assignmentData) => {
  try {
    const response = await api.post(`/api/inventory/stores/${storeId}/remove_users/`, assignmentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to remove users from store');
  }
};

export const getUserAssignedStores = async (userId) => {
  try {
    const response = await api.get(`/api/inventory/store-assignments/user_assigned_stores/?user_id=${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user assigned stores');
  }
};

export const getStoreAssignedUsers = async (storeId) => {
  try {
    const response = await api.get(`/api/inventory/stores/${storeId}/assigned_users/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch store assigned users');
  }
};

export const getCurrentUserStores = async () => {
  try {
    const response = await api.get('/api/inventory/stores/user_stores/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch current user stores');
  }
};

// export const getAllUsers = async () => {
//   try {
//     const response = await api.get('/api/core/users/');
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.message || 'Failed to fetch users');
//   }
// };


// Add this API function to your lib/api/inventory.js
export const bulkStockTake = async (data) => {
  try {
    const response = await api.post('/api/inventory/bulk-stock-adjustments/bulk_stock_take/', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update stock counts');
  }
};



// Report data endpoints
export const getStockLevelReport = async (params = {}) => {
  try {
    const response = await api.get('/api/inventory/inventory-reports/stock_level_report/', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch stock level report');
  }
};

export const getMovementReport = async (params = {}) => {
  try {
    const response = await api.get('/api/inventory/inventory-reports/movement_report/', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch movement report');
  }
};

export const getValuationReport = async (params = {}) => {
  try {
    const response = await api.get('/api/inventory/inventory-reports/valuation_report/', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch valuation report');
  }
};

export const getLowStockReport = async (params = {}) => {
  try {
    const response = await api.get('/api/inventory/inventory-reports/low_stock_report/', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch low stock report');
  }
};

// Excel export endpoints
export const exportStockLevelExcel = async (params = {}) => {
  try {
    const response = await api.get('/api/inventory/inventory-reports/export_stock_level_excel/', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to export stock level report');
  }
};

export const exportMovementExcel = async (params = {}) => {
  try {
    const response = await api.get('/api/inventory/inventory-reports/export_movement_excel/', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to export movement report');
  }
};

export const exportValuationExcel = async (params = {}) => {
  try {
    const response = await api.get('/api/inventory/inventory-reports/export_valuation_excel/', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to export valuation report');
  }
};

export const exportLowStockExcel = async (params = {}) => {
  try {
    const response = await api.get('/api/inventory/inventory-reports/export_low_stock_excel/', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to export low stock report');
  }
};

// PDF export endpoints
export const exportStockLevelPDF = async (params = {}) => {
  try {
    const response = await api.get('/api/inventory/inventory-reports/export_stock_level_pdf/', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to export stock level PDF');
  }
};

export const exportMovementPDF = async (params = {}) => {
  try {
    const response = await api.get('/api/inventory/inventory-reports/export_movement_pdf/', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to export movement PDF');
  }
};

// Helper function to download blob
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
