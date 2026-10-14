import apiClient, { tokenStore, userStore } from './apiClient';
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
    userStore.setUser(loginData.user);
    return loginData;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/api/v1/auth/me');
    const user = response.data.data;
    userStore.setUser(user);
    return user;
  },

  getStoredUser(): User | null {
    return userStore.getUser();
  },

  logout(): void {
    tokenStore.clearToken();
    userStore.clearUser();
  },

  isAuthenticated(): boolean {
    return tokenStore.getToken() !== null;
  },

  async warmup(): Promise<void> {
    try {
      await apiClient.get('/api/v1/auth/health', { timeout: 10000 });
    } catch {
      // Ignore background warmup failures
    }
  },
};
