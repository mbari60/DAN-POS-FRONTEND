// lib/api/permissions.js
import { api } from "@/services/api";

// Permission CRUD operations
export const getPermissions = async (params = {}) => {
  try {
    const response = await api.get('/permissions/', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch permissions');
  }
};

export const createPermission = async (permissionData) => {
  try {
    const response = await api.post('/permissions/', permissionData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create permission');
  }
};

export const updatePermission = async (permissionId, permissionData) => {
  try {
    const response = await api.put(`/permissions/${permissionId}/`, permissionData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update permission');
  }
};

export const deletePermission = async (permissionId) => {
  try {
    const response = await api.delete(`/permissions/${permissionId}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete permission');
  }
};

// Permission categories
export const getPermissionCategories = async () => {
  try {
    const response = await api.get('/permissions/categories/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch permission categories');
  }
};

// Helper function for getting permissions with codenames mapping
export const getPermissionsWithCodenames = async () => {
  try {
    const response = await getPermissions();
    const permissions = Array.isArray(response) 
      ? response 
      : response.results || response.data || [];
    
    // Create a mapping of permission IDs to codenames
    const permissionMap = {};
    permissions.forEach(permission => {
      permissionMap[permission.id] = permission.codename;
    });
    
    return {
      permissions,
      permissionMap
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch permissions with codenames');
  }
};

// Get single permission
export const getPermission = async (permissionId) => {
  try {
    const response = await api.get(`/permissions/${permissionId}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch permission');
  }
};

export const getUserPermissions = async () => {
  try {
    const response = await api.get('/user/permissions/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user permissions');
  }
};