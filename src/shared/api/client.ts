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

// 401 errors propagate to the calling store/page which handles sign-out
apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);
