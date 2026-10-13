import apiClient from './apiClient';
import type { ApiResponse } from '../types/api';
import type { MenuCategory, MenuItem } from '../types/pos';

export const menuService = {
  async getCategories(): Promise<MenuCategory[]> {
    const response = await apiClient.get<ApiResponse<MenuCategory[]>>('/api/v1/menu/categories');
    return response.data.data;
  },

  async getItems(params?: { categoryId?: number; search?: string }): Promise<MenuItem[]> {
    const response = await apiClient.get<ApiResponse<MenuItem[]>>('/api/v1/menu/items', {
      params,
    });
    return response.data.data;
  },
};
