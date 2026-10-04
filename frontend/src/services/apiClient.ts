import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiError, ApiException } from '../types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
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

    const exception: ApiException = Object.assign(new Error(apiError?.message ?? 'An error occurred'), {
      status,
      apiError: apiError ?? {
        timestamp: new Date().toISOString(),
        status,
        error: 'Unknown Error',
        message: error.message,
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
