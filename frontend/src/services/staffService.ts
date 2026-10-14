import apiClient from './apiClient';
import type { ApiResponse } from '../types/api';
import type { User } from '../types/auth';
import type {
  CreateStaffRequest,
  UpdateStaffRequest,
  ResetPasswordRequest,
} from '../types/admin';

export const staffService = {
  async getAllStaff(): Promise<User[]> {
    const response = await apiClient.get<ApiResponse<User[]>>('/api/v1/admin/staff');
    return response.data.data;
  },

  async createStaff(request: CreateStaffRequest): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/api/v1/admin/staff', request);
    return response.data.data;
  },

  async updateStaff(id: number, request: UpdateStaffRequest): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(`/api/v1/admin/staff/${id}`, request);
    return response.data.data;
  },

  async toggleStatus(id: number, enabled?: boolean): Promise<User> {
    const params: Record<string, boolean> = {};
    if (typeof enabled === 'boolean') {
      params.enabled = enabled;
    }
    const response = await apiClient.patch<ApiResponse<User>>(
      `/api/v1/admin/staff/${id}/toggle-status`,
      null,
      { params }
    );
    return response.data.data;
  },

  async resetPassword(id: number, request: ResetPasswordRequest): Promise<void> {
    await apiClient.put(`/api/v1/admin/staff/${id}/reset-password`, request);
  },
};
