import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PosOrderPage from '../../../pages/PosOrderPage';
import { menuService } from '../../../services/menuService';
import { orderService } from '../../../services/orderService';

vi.mock('../../../services/menuService', () => ({
  menuService: {
    getCategories: vi.fn(),
    getItems: vi.fn(),
  },
}));

vi.mock('../../../services/orderService', () => ({
  orderService: {
    getOrders: vi.fn(),
    createOrder: vi.fn(),
    updateOrder: vi.fn(),
    cancelOrder: vi.fn(),
    removeOrderItem: vi.fn(),
  },
}));

const mockCategories = [
  { id: 1, name: 'Thali', displayOrder: 1, active: true },
  { id: 2, name: 'Chicken', displayOrder: 2, active: true },
];

const mockItems = [
  {
    id: 101,
    categoryId: 1,
    categoryName: 'Thali',
    name: 'Special Mahalaxmi Thali',
    price: 350,
    isVeg: false,
    available: true,
    displayOrder: 1,
  },
  {
    id: 102,
    categoryId: 1,
    categoryName: 'Thali',
    name: 'Special Veg Thali',
    price: 170,
    isVeg: true,
    available: true,
    displayOrder: 2,
  },
  {
    id: 201,
    categoryId: 2,
    categoryName: 'Chicken',
    name: 'Chicken Fry',
    price: 200,
    isVeg: false,
    available: true,
    displayOrder: 1,
  },
];

describe('PosOrderPage — Stage 2 Simulation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(menuService.getCategories).mockResolvedValue(mockCategories);
    vi.mocked(menuService.getItems).mockResolvedValue(mockItems);
    vi.mocked(orderService.getOrders).mockResolvedValue([]);
  });

  it('simulates customer ordering 2 Special Veg Thalis + 1 Chicken Fry = ₹540 and places order', async () => {
    vi.mocked(orderService.createOrder).mockResolvedValueOnce({
      id: 1,
      orderNumber: 'ORD-20261013-001',
      tableNumber: 'Table 1',
      orderType: 'DINE_IN',
      status: 'OPEN',
      totalAmount: 540,
      notes: null,
      createdByUsername: 'admin',
      items: [
        {
          id: 1,
          menuItemId: 102,
          itemName: 'Special Veg Thali',
          unitPrice: 170,
          quantity: 2,
          subtotal: 340,
          status: 'ACTIVE',
        },
        {
          id: 2,
          menuItemId: 201,
          itemName: 'Chicken Fry',
          unitPrice: 200,
          quantity: 1,
          subtotal: 200,
          status: 'ACTIVE',
        },
      ],
      createdAt: '2026-10-13T11:35:00',
      updatedAt: '2026-10-13T11:35:00',
    });

    render(
      <BrowserRouter>
        <PosOrderPage />
      </BrowserRouter>
    );

    // Wait for menu items to render
    await waitFor(() => {
      expect(screen.getByText('Special Veg Thali')).toBeInTheDocument();
      expect(screen.getByText('Chicken Fry')).toBeInTheDocument();
    });

    // Customer orders 2 Special Veg Thalis (₹170 x 2 = ₹340) + 1 Chicken Fry (₹200)
    fireEvent.click(screen.getByRole('heading', { name: 'Special Veg Thali' }));
    fireEvent.click(screen.getByRole('heading', { name: 'Special Veg Thali' }));
    fireEvent.click(screen.getByRole('heading', { name: 'Chicken Fry' }));

    // Verify total is ₹540
    expect(screen.getByTestId('order-total')).toHaveTextContent('₹540');

    // Submit the order
    fireEvent.click(screen.getByRole('button', { name: /Place Order/i }));

    await waitFor(() => {
      expect(orderService.createOrder).toHaveBeenCalledWith({
        tableNumber: 'Table 1',
        orderType: 'DINE_IN',
        notes: undefined,
        items: [
          { menuItemId: 102, quantity: 2 },
          { menuItemId: 201, quantity: 1 },
        ],
      });
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Order ORD-20261013-001 placed successfully! Total: ₹540/i)
      ).toBeInTheDocument();
    });
  });
});
