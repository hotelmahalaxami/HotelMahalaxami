import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiError, ApiException } from '../types/api';

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').trim();
const BASE_URL = rawBaseUrl.replace(/\/+$/, '');

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Request interceptor: attach Authorization header if token exists in memory
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStore.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: normalize errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const apiError = error.response?.data;
    const status = error.response?.status ?? 0;

    if (status === 401) {
      // Clear token and redirect to login
      tokenStore.clearToken();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    const isTimeout = error.code === 'ECONNABORTED' || (error.message && error.message.toLowerCase().includes('timeout'));
    const defaultMessage = isTimeout
      ? 'The server is taking longer than expected to respond (waking up). Please wait a moment and try again.'
      : (error.message || 'An error occurred');

    const exception: ApiException = Object.assign(new Error(apiError?.message ?? defaultMessage), {
      status,
      apiError: apiError ?? {
        timestamp: new Date().toISOString(),
        status: isTimeout ? 504 : status,
        error: isTimeout ? 'Gateway Timeout' : 'Network Error',
        message: defaultMessage,
        path: '',
      },
    });

    return Promise.reject(exception);
  }
);

const TOKEN_KEY = 'mahalaxmi_pos_token';

export const tokenStore = {
  _token: null as string | null,
  getToken(): string | null {
    if (this._token) return this._token;
    try {
      this._token = sessionStorage.getItem(TOKEN_KEY);
      return this._token;
    } catch {
      return null;
    }
  },
  setToken(token: string): void {
    this._token = token;
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
    } catch {
      // ignore in environments where storage is disabled
    }
  },
  clearToken(): void {
    this._token = null;
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  },
};

export default apiClient;
