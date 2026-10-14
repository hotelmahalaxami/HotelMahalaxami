import apiClient from './apiClient';
import type { ApiResponse } from '../types/api';
import type { MenuCategory, MenuItem } from '../types/pos';
import type {
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
} from '../types/admin';

export const adminMenuService = {
  // Categories
  async getCategories(): Promise<MenuCategory[]> {
    const response = await apiClient.get<ApiResponse<MenuCategory[]>>('/api/v1/menu/categories');
    return response.data.data;
  },

  async createCategory(request: CreateCategoryRequest): Promise<MenuCategory> {
    const response = await apiClient.post<ApiResponse<MenuCategory>>('/api/v1/menu/categories', request);
    return response.data.data;
  },

  async updateCategory(id: number, request: UpdateCategoryRequest): Promise<MenuCategory> {
    const response = await apiClient.put<ApiResponse<MenuCategory>>(`/api/v1/menu/categories/${id}`, request);
    return response.data.data;
  },

  async deleteCategory(id: number): Promise<void> {
    await apiClient.delete(`/api/v1/menu/categories/${id}`);
  },

  // Menu Items
  async getAdminMenuItems(categoryId?: number, search?: string): Promise<MenuItem[]> {
    const params: Record<string, string | number> = {};
    if (categoryId) params.categoryId = categoryId;
    if (search && search.trim()) params.search = search.trim();
    const response = await apiClient.get<ApiResponse<MenuItem[]>>('/api/v1/menu/items/admin', { params });
    return response.data.data;
  },

  async createMenuItem(request: CreateMenuItemRequest): Promise<MenuItem> {
    const response = await apiClient.post<ApiResponse<MenuItem>>('/api/v1/menu/items', request);
    return response.data.data;
  },

  async updateMenuItem(id: number, request: UpdateMenuItemRequest): Promise<MenuItem> {
    const response = await apiClient.put<ApiResponse<MenuItem>>(`/api/v1/menu/items/${id}`, request);
    return response.data.data;
  },

  async toggleAvailability(id: number, available?: boolean): Promise<MenuItem> {
    const params: Record<string, boolean> = {};
    if (typeof available === 'boolean') {
      params.available = available;
    }
    const response = await apiClient.patch<ApiResponse<MenuItem>>(
      `/api/v1/menu/items/${id}/toggle-availability`,
      null,
      { params }
    );
    return response.data.data;
  },

  async deleteMenuItem(id: number): Promise<void> {
    await apiClient.delete(`/api/v1/menu/items/${id}`);
  },
};
