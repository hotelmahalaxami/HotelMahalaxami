import apiClient from './apiClient';
import type { ApiResponse } from '../types/api';
import type {
  BillResponse,
  BillStatus,
  GenerateBillRequest,
  SettleBillRequest,
} from '../types/billing';

export const billingService = {
  async generateBill(orderId: number, request?: GenerateBillRequest): Promise<BillResponse> {
    const response = await apiClient.post<ApiResponse<BillResponse>>(
      `/api/v1/bills/generate/${orderId}`,
      request ?? {}
    );
    return response.data.data;
  },

  async settleBill(billId: number, request: SettleBillRequest): Promise<BillResponse> {
    const response = await apiClient.post<ApiResponse<BillResponse>>(
      `/api/v1/bills/${billId}/settle`,
      request
    );
    return response.data.data;
  },

  async getBillById(id: number): Promise<BillResponse> {
    const response = await apiClient.get<ApiResponse<BillResponse>>(`/api/v1/bills/${id}`);
    return response.data.data;
  },

  async getBillByOrderId(orderId: number): Promise<BillResponse> {
    const response = await apiClient.get<ApiResponse<BillResponse>>(`/api/v1/bills/by-order/${orderId}`);
    return response.data.data;
  },

  async getBills(status?: BillStatus): Promise<BillResponse[]> {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    const response = await apiClient.get<ApiResponse<BillResponse[]>>('/api/v1/bills', { params });
    return response.data.data;
  },
};
