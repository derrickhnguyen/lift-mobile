import axios from 'axios';
import { API_BASE_URL } from '../config/constants';
import { secureStorage } from '../lib/storage';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await secureStorage.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired — signal auth store to sign out
      // Lazy import to avoid circular deps
      import('../../features/auth/model/authStore').then(({ useAuthStore }) => {
        useAuthStore.getState().signOut();
      });
    }
    return Promise.reject(error);
  },
);
