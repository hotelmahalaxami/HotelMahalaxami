import axios, { AxiosError } from 'axios';
import type { ApiError, ApiException } from '../types/api';

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').trim();
const BASE_URL = rawBaseUrl.replace(/\/+$/, '');

/**
 * Dedicated Public API Client for customer-facing website requests.
 * - Does NOT attach staff/admin JWT Bearer tokens.
 * - Does NOT redirect anonymous visitors to /login on 401/403.
 * - Formats ApiException consistently with the POS apiClient.
 */
export const publicApiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

publicApiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const apiError = error.response?.data;
    const status = error.response?.status ?? 0;

    const isTimeout =
      error.code === 'ECONNABORTED' ||
      (error.message && error.message.toLowerCase().includes('timeout'));

    const defaultMessage = isTimeout
      ? 'The server is taking longer than expected to respond. Please try again in a moment.'
      : error.message || 'An error occurred while fetching restaurant information.';

    const exception: ApiException = Object.assign(
      new Error(apiError?.message ?? defaultMessage),
      {
        status,
        apiError: apiError ?? {
          timestamp: new Date().toISOString(),
          status: isTimeout ? 504 : status,
          error: isTimeout ? 'Gateway Timeout' : 'Network Error',
          message: defaultMessage,
          path: '',
        },
      }
    );

    return Promise.reject(exception);
  }
);

export default publicApiClient;
