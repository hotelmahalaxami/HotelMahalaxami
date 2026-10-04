import apiClient, { tokenStore } from './apiClient';
import type { ApiResponse } from '../types/api';
import type { LoginRequest, LoginResponse, User } from '../types/auth';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/api/v1/auth/login',
      credentials
    );
    const loginData = response.data.data;
    tokenStore.setToken(loginData.accessToken);
    return loginData;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/api/v1/auth/me');
    return response.data.data;
  },

  logout(): void {
    tokenStore.clearToken();
  },

  isAuthenticated(): boolean {
    return tokenStore.getToken() !== null;
  },
};
