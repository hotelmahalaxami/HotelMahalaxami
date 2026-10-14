import apiClient from './apiClient';
import type { ApiResponse } from '../types/api';
import type {
  DailySalesDto,
  DashboardSummaryResponse,
  ItemSalesDto,
  MonthlySalesDto,
} from '../types/reports';

export const reportService = {
  async getDashboardSummary(date?: string): Promise<DashboardSummaryResponse> {
    const params: Record<string, string> = {};
    if (date) params.date = date;
    const response = await apiClient.get<ApiResponse<DashboardSummaryResponse>>(
      '/api/v1/reports/dashboard-summary',
      { params }
    );
    return response.data.data;
  },

  async getDailySales(startDate?: string, endDate?: string): Promise<DailySalesDto[]> {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await apiClient.get<ApiResponse<DailySalesDto[]>>(
      '/api/v1/reports/daily-sales',
      { params }
    );
    return response.data.data;
  },

  async getItemWiseSales(startDate?: string, endDate?: string): Promise<ItemSalesDto[]> {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await apiClient.get<ApiResponse<ItemSalesDto[]>>(
      '/api/v1/reports/item-wise-sales',
      { params }
    );
    return response.data.data;
  },

  async getMonthlySales(year?: number): Promise<MonthlySalesDto[]> {
    const params: Record<string, number> = {};
    if (year) params.year = year;
    const response = await apiClient.get<ApiResponse<MonthlySalesDto[]>>(
      '/api/v1/reports/monthly-sales',
      { params }
    );
    return response.data.data;
  },
};
