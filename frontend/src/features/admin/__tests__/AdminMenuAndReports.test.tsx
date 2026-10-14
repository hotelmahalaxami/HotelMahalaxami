import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminMenuPage from '../../../pages/AdminMenuPage';
import ReportsPage from '../../../pages/ReportsPage';
import StaffManagementPage from '../../../pages/StaffManagementPage';
import { adminMenuService } from '../../../services/adminMenuService';
import { reportService } from '../../../services/reportService';
import { staffService } from '../../../services/staffService';
import type { User } from '../../../types/auth';

vi.mock('../../../services/adminMenuService', () => ({
  adminMenuService: {
    getCategories: vi.fn(),
    getAdminMenuItems: vi.fn(),
    createCategory: vi.fn(),
    updateMenuItem: vi.fn(),
    toggleAvailability: vi.fn(),
    deleteMenuItem: vi.fn(),
  },
}));

vi.mock('../../../services/reportService', () => ({
  reportService: {
    getDashboardSummary: vi.fn(),
    getItemWiseSales: vi.fn(),
    getDailySales: vi.fn(),
    getMonthlySales: vi.fn(),
  },
}));

vi.mock('../../../services/staffService', () => ({
  staffService: {
    getAllStaff: vi.fn(),
    createStaff: vi.fn(),
    toggleStatus: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

describe('Stage 4 — Admin & Reports Frontend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders AdminMenuPage with categories, items, and supports price changes', async () => {
    vi.mocked(adminMenuService.getCategories).mockResolvedValue([
      { id: 1, name: 'Thali', displayOrder: 1, active: true },
    ]);
    vi.mocked(adminMenuService.getAdminMenuItems).mockResolvedValue([
      {
        id: 10,
        categoryId: 1,
        categoryName: 'Thali',
        name: 'Special Veg Thali',
        price: 170,
        isVeg: true,
        available: true,
        displayOrder: 1,
      },
    ]);

    render(<AdminMenuPage />);

    expect(await screen.findByText('Special Veg Thali')).toBeInTheDocument();
    expect(screen.getByText('₹170.00')).toBeInTheDocument();
    expect(screen.getAllByText('In Stock').length).toBeGreaterThanOrEqual(1);

    // Click quick price edit icon
    const priceEditBtn = screen.getByTitle('Quick edit price');
    fireEvent.click(priceEditBtn);

    expect(screen.getByText('Change Price')).toBeInTheDocument();
  });

  it('renders ReportsPage with Executive KPI cards and Top Item hero', async () => {
    vi.mocked(reportService.getDashboardSummary).mockResolvedValue({
      reportDate: '2026-10-14',
      totalRevenue: 24650,
      totalOrdersCount: 84,
      cashTotal: 8200,
      upiTotal: 13450,
      cardTotal: 3000,
      cancelledOrdersCount: 2,
      openOrdersCount: 1,
      topItem: {
        menuItemId: 10,
        itemName: 'Special Veg Thali',
        categoryName: 'Thali',
        quantitySold: 31,
        totalRevenue: 5270,
      },
      topSellingItems: [
        {
          menuItemId: 10,
          itemName: 'Special Veg Thali',
          categoryName: 'Thali',
          quantitySold: 31,
          totalRevenue: 5270,
        },
      ],
      recentDailySales: [
        {
          date: '2026-10-14',
          totalRevenue: 24650,
          ordersCount: 84,
          cashTotal: 8200,
          upiTotal: 13450,
          cardTotal: 3000,
        },
      ],
    });
    vi.mocked(reportService.getItemWiseSales).mockResolvedValue([]);
    vi.mocked(reportService.getDailySales).mockResolvedValue([]);
    vi.mocked(reportService.getMonthlySales).mockResolvedValue([]);

    render(<ReportsPage />);

    // KPI values
    await waitFor(() => {
      expect(screen.getAllByText('84').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getAllByText(/24,650/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/8,200/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/13,450/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/3,000/).length).toBeGreaterThanOrEqual(1);

    // Top Item Banner & Leaderboard
    expect(screen.getAllByText('Special Veg Thali').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('31 units')).toBeInTheDocument();
  });

  it('renders StaffManagementPage with staff list and roles', async () => {
    const mockStaff: User[] = [
      {
        id: 1,
        username: 'admin',
        email: 'hotelmahalaxami@gmail.com',
        role: 'ADMIN',
        enabled: true,
        createdAt: '2026-10-14T00:00:00Z',
      },
      {
        id: 2,
        username: 'waiter1',
        email: 'waiter1@mahalaxmi.com',
        role: 'STAFF',
        enabled: true,
        createdAt: '2026-10-14T00:00:00Z',
      },
    ];

    vi.mocked(staffService.getAllStaff).mockResolvedValue(mockStaff);

    render(<StaffManagementPage />);

    expect(await screen.findByText('hotelmahalaxami@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('waiter1')).toBeInTheDocument();
    expect(screen.getByText('+ Add Staff Member')).toBeInTheDocument();
  });
});
