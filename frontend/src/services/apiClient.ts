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

// In-memory token store (more secure than localStorage for access tokens)
// Token is lost on page refresh — this is a deliberate security trade-off.
// See README for token storage security rationale.
export const tokenStore = {
  _token: null as string | null,
  getToken(): string | null {
    return this._token;
  },
  setToken(token: string): void {
    this._token = token;
  },
  clearToken(): void {
    this._token = null;
  },
};

export default apiClient;
