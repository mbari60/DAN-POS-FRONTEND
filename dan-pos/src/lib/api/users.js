// lib/api/users.js
// import { api } from './api';

import { api } from "@/services/api";

export const getUsers = async (params = {}) => {
  try {
    const response = await api.get('/users/', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post('/users/', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create user');
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await api.patch(`/users/${id}/`, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update user');
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete user');
  }
};