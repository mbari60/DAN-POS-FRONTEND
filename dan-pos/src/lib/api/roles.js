// lib/api/roles.js
import { api } from "@/services/api";

// Role CRUD operations
export const getRoles = async (params = {}) => {
  try {
    const response = await api.get('/roles/', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch roles');
  }
};

export const createRole = async (roleData) => {
  try {
    const response = await api.post('/roles/', roleData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create role');
  }
};

export const updateRole = async (id, roleData) => {
  try {
    const response = await api.patch(`/roles/${id}/`, roleData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update role');
  }
};

export const deleteRole = async (id) => {
  try {
    const response = await api.delete(`/roles/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete role');
  }
};

export const cloneRole = async (id, cloneData) => {
  try {
    const response = await api.post(`/roles/${id}/clone/`, cloneData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to clone role');
  }
};

// Role permissions operations
export const getRolePermissions = async (roleId) => {
  try {
    const response = await api.get(`/roles/${roleId}/`);
    return response.data.permissions || [];
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch role permissions');
  }
};

export const updateRolePermissions = async (roleId, permissionIds) => {
  try {
    // Get permissions with codenames from the permissions API
    const { getPermissionsWithCodenames } = await import('./permissions');
    const permissionsData = await getPermissionsWithCodenames();
    const allPermissions = permissionsData.permissions || [];
    
    // Create the format backend expects: {codename: true, codename2: true}
    const permissionsDict = {};
    
    // Set all to false first
    allPermissions.forEach(permission => {
      permissionsDict[permission.codename] = false;
    });
    
    // Set the selected permissions to true
    permissionIds.forEach(permissionId => {
      const permission = allPermissions.find(p => p.id === permissionId);
      if (permission) {
        permissionsDict[permission.codename] = true;
      }
    });

    const response = await api.post(`/roles/${roleId}/update-permissions/`, {
      permissions: permissionsDict
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update role permissions');
  }
};

export const bulkUpdateRolePermissions = async (roleId, permissionIds, categoryIds = [], action = 'add') => {
  try {
    const response = await api.post(`/roles/${roleId}/bulk-permissions/`, {
      permission_ids: permissionIds,
      category_ids: categoryIds,
      action: action
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to bulk update role permissions');
  }
};

// Role assignment
export const assignRoleToUser = async (userId, roleId) => {
  try {
    const response = await api.post('/roles/assign/', {
      user_id: userId,
      role_id: roleId
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to assign role');
  }
};

