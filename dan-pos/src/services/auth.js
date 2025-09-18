import { api } from './api';

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};


export const validateToken = async (token) => {
  try {
    const response = await api.get('/tokens/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error('Token validation failed');
  }
};


export const getUserPermissions = async () => {
  try {
    const response = await api.get('/auth/permissions/');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch permissions');
  }
};


export const changePassword = async (passwordData) => {
  try {
    const response = await api.post('/auth/change-password/', passwordData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Password change failed');
  }
};

// profile
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.patch('/auth/me/', profileData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

