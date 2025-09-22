// lib/api/system.js
import { api } from "@/services/api";

export const getSystemStats = async () => {
  try {
    const response = await api.get('/system/stats/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch system stats');
  }
};

export const getAuditLogs = async (params = {}) => {
  try {
    const response = await api.get('/audit-logs/', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch audit logs');
  }
};
