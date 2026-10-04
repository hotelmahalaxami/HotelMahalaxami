export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>;
}

export interface ApiException extends Error {
  status: number;
  apiError: ApiError;
}
