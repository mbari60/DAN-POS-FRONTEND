// import { api } from "@/services/api";

// // POS Sale CRUD operations
// export const getStores = async () => {
//   try {
//     const response = await api.get('/api/inventory/stores/');
//     return response.data.results || response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.message || 'Failed to fetch stores');
//   }
// };

// export const getSalesTypes = async () => {
//   try {
//     const response = await api.get('/api/inventory/sales-types/');
//     return response.data.results || response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.message || 'Failed to fetch sales types');
//   }
// };

// export const searchItem = async (searchData) => {
//   try {
//     const response = await api.post('/api/inventory/inventory-integration/pos_search_item/', {
//       search_term: searchData.search_term,
//       store_id: searchData.store_id,
//       sales_type_id: searchData.sales_type_id
//     });
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.message || 'Item not found');
//   }
// };

// export const getItemsBySalesType = async (salesTypeId, includeStockInfo, storeId) => {
//   try {
//     const response = await api.post('/api/inventory/item-price-lookup/get_items_by_sales_type/', {
//       sales_type_id: salesTypeId,
//       include_stock_info: includeStockInfo,
//       store_id: storeId
//     });
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.message || 'Failed to fetch items');
//   }
// };

// export const createSale = async (saleData) => {
//   try {
//     const response = await api.post('/api/sales/pos/create_sale/', saleData);
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to create sale');
//   }
// };

// export const getUserDailySales = async (date = null) => {
//   try {
//     const queryDate = date || new Date().toISOString().split('T')[0];
//     const response = await api.get(`/api/sales/sales-reports/today_sales/?date=${queryDate}`);
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.message || 'Failed to fetch daily sales');
//   }
// };

// // Cart storage utilities
// export const cartStorage = {
//   save: (cartData) => {
//     localStorage.setItem('pos_cart', JSON.stringify(cartData));
//   },
  
//   load: () => {
//     const saved = localStorage.getItem('pos_cart');
//     return saved ? JSON.parse(saved) : null;
//   },
  
//   clear: () => {
//     localStorage.removeItem('pos_cart');
//   }
// };

// // Helper function to get paused carts
// export const getPausedCarts = () => {
//   return JSON.parse(localStorage.getItem('pos_paused_carts') || '[]');
// };

// // Helper function to save paused cart
// export const savePausedCart = (pausedCart) => {
//   const pausedCarts = getPausedCarts();
//   pausedCarts.push(pausedCart);
//   localStorage.setItem('pos_paused_carts', JSON.stringify(pausedCarts));
// };

// // Helper function to remove paused cart
// export const removePausedCart = (cartId) => {
//   const pausedCarts = getPausedCarts();
//   const updated = pausedCarts.filter(cart => cart.id !== cartId);
//   localStorage.setItem('pos_paused_carts', JSON.stringify(updated));
// };


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

export const createSale = async (saleData) => {
  try {
    const response = await api.post('/api/sales/pos/create_sale/', saleData);
    return response.data;
  } catch (error) {
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
