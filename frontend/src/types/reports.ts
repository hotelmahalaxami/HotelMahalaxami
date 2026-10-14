export interface TopItemDto {
  menuItemId: number;
  itemName: string;
  categoryName: string;
  quantitySold: number;
  totalRevenue: number;
}

export interface DailySalesDto {
  date: string;
  totalRevenue: number;
  ordersCount: number;
  cashTotal: number;
  upiTotal: number;
  cardTotal: number;
}

export interface ItemSalesDto {
  menuItemId: number;
  itemName: string;
  categoryName: string;
  quantitySold: number;
  totalRevenue: number;
}

export interface MonthlySalesDto {
  year: number;
  month: number;
  monthName: string;
  totalRevenue: number;
  ordersCount: number;
}

export interface DashboardSummaryResponse {
  reportDate: string;
  totalRevenue: number;
  totalOrdersCount: number;
  cashTotal: number;
  upiTotal: number;
  cardTotal: number;
  cancelledOrdersCount: number;
  openOrdersCount: number;
  topItem: TopItemDto | null;
  topSellingItems: TopItemDto[];
  recentDailySales: DailySalesDto[];
}
