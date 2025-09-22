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


// Stock Movement operations
// export const getStockMovements = async (params = {}) => {
//   try {
//     const response = await api.get('/api/inventory/stock-movements/', { params });
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.message || 'Failed to fetch stock movements');
//   }
// };

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

// export const getMovementSummary = async (days = 30) => {
//   try {
//     const response = await api.get('/api/inventory/inventory-reports/movement-summary/', {
//       params: { days }
//     });
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.message || 'Failed to fetch movement summary');
//   }
// };

export const getValuationReport = async () => {
  try {
    const response = await api.get('/api/inventory/inventory-reports/valuation/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch valuation report');
  }
};

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
    throw new Error(error.response?.data?.message || 'Failed to record transfer');
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


// export const getStores = async (params = {}) => {
//   try {
//     const response = await api.get('/api/inventory/stores/', { params });
//     // Your API returns stores directly, not in results
//     return {
//       data: response.data.results || response.data,  // Handle both formats
//       count: response.data.count || (response.data.results ? response.data.results.length : response.data.length)
//     };
//   } catch (error) {
//     throw new Error(error.response?.data?.message || 'Failed to fetch stores');
//   }
// };

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