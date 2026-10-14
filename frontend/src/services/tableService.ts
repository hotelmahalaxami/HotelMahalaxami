import apiClient from './apiClient';
import type { ApiResponse } from '../types/api';
import type { CreateTableRequest, RestaurantTable, UpdateTableRequest } from '../types/table';

export const tableService = {
  async getTables(all = false): Promise<RestaurantTable[]> {
    const response = await apiClient.get<ApiResponse<RestaurantTable[]>>('/api/v1/tables', {
      params: all ? { all: true } : undefined,
    });
    return response.data.data;
  },

  async getTableById(id: number): Promise<RestaurantTable> {
    const response = await apiClient.get<ApiResponse<RestaurantTable>>(`/api/v1/tables/${id}`);
    return response.data.data;
  },

  async createTable(request: CreateTableRequest): Promise<RestaurantTable> {
    const response = await apiClient.post<ApiResponse<RestaurantTable>>('/api/v1/tables', request);
    return response.data.data;
  },

  async updateTable(id: number, request: UpdateTableRequest): Promise<RestaurantTable> {
    const response = await apiClient.put<ApiResponse<RestaurantTable>>(`/api/v1/tables/${id}`, request);
    return response.data.data;
  },

  async deleteTable(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/api/v1/tables/${id}`);
  },
};
