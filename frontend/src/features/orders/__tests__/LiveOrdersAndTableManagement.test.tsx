import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LiveOrdersPage from '../../../pages/LiveOrdersPage';
import TableManagementPage from '../../../pages/TableManagementPage';
import { OrderDetailModal } from '../OrderDetailModal';
import { orderService } from '../../../services/orderService';
import { tableService } from '../../../services/tableService';
import { billingService } from '../../../services/billingService';

vi.mock('../../../services/orderService', () => ({
  orderService: {
    getOrders: vi.fn(),
    getOrderById: vi.fn(),
    getOrderByNumber: vi.fn(),
    cancelOrder: vi.fn(),
    getOrderStatusCounts: vi.fn(),
  },
}));

vi.mock('../../../services/tableService', () => ({
  tableService: {
    getTables: vi.fn(),
    getTableById: vi.fn(),
    createTable: vi.fn(),
    updateTable: vi.fn(),
    deleteTable: vi.fn(),
  },
}));

vi.mock('../../../services/billingService', () => ({
  billingService: {
    getBills: vi.fn(),
    getBillByOrderId: vi.fn(),
  },
}));

const mockOrders = [
  {
    id: 1,
    orderNumber: 'ORD-20261014-0001',
    tableNumber: 'Table 1',
    orderType: 'DINE_IN' as const,
    status: 'OPEN' as const,
    totalAmount: 340,
    notes: 'Less spicy',
    createdByUsername: 'staff1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: 10,
        menuItemId: 102,
        itemName: 'Special Veg Thali',
        unitPrice: 170,
        quantity: 2,
        subtotal: 340,
        status: 'ACTIVE' as const,
      },
    ],
  },
  {
    id: 2,
    orderNumber: 'ORD-20261014-0002',
    tableNumber: 'Table 2',
    orderType: 'DINE_IN' as const,
    status: 'READY_FOR_BILL' as const,
    totalAmount: 500,
    notes: null,
    createdByUsername: 'staff2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: 20,
        menuItemId: 201,
        itemName: 'Chicken Fry',
        unitPrice: 200,
        quantity: 1,
        subtotal: 200,
        status: 'ACTIVE' as const,
      },
    ],
  },
];

const mockTables = [
  {
    id: 1,
    tableName: 'Table 1',
    capacity: 4,
    active: true,
    displayOrder: 1,
    isOccupied: true,
    currentOrderId: 1,
    currentOrderNumber: 'ORD-20261014-0001',
    occupiedSince: new Date().toISOString(),
  },
  {
    id: 2,
    tableName: 'Table 2',
    capacity: 4,
    active: true,
    displayOrder: 2,
    isOccupied: false,
    currentOrderId: null,
    currentOrderNumber: null,
    occupiedSince: null,
  },
];

describe('LiveOrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(orderService.getOrders).mockResolvedValue(mockOrders);
    vi.mocked(orderService.getOrderStatusCounts).mockResolvedValue({
      OPEN: 1,
      READY_FOR_BILL: 1,
      COMPLETED: 0,
      CANCELLED: 0,
    });
    vi.mocked(billingService.getBills).mockResolvedValue([]);
  });

  it('renders Live Orders page with active tabs and displays orders count', async () => {
    render(
      <BrowserRouter>
        <LiveOrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Live Orders Management')).toBeInTheDocument();
      expect(screen.getByText(/ORD-20261014-0001/i)).toBeInTheDocument();
    });

    // Test filter search
    const searchInput = screen.getByPlaceholderText(/Search order #, table, staff/i);
    fireEvent.change(searchInput, { target: { value: '0001' } });

    expect(screen.getByText(/ORD-20261014-0001/i)).toBeInTheDocument();
  });
});

describe('TableManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(tableService.getTables).mockResolvedValue(mockTables);
  });

  it('renders table list with occupancy and capacity badges', async () => {
    render(
      <BrowserRouter>
        <TableManagementPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Restaurant Table Management')).toBeInTheDocument();
      expect(screen.getByText('Table 1')).toBeInTheDocument();
      expect(screen.getByText('Table 2')).toBeInTheDocument();
      expect(screen.getByText(/OCCUPIED/i)).toBeInTheDocument();
      expect(screen.getByText(/AVAILABLE/i)).toBeInTheDocument();
    });
  });

  it('opens add table modal and creates a new table', async () => {
    vi.mocked(tableService.createTable).mockResolvedValueOnce({
      id: 3,
      tableName: 'Table 3',
      capacity: 4,
      active: true,
      displayOrder: 3,
      isOccupied: false,
    });

    render(
      <BrowserRouter>
        <TableManagementPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add New Table/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Add New Table/i }));
    expect(screen.getByText('Add New Dining Table')).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText(/e\.g\. Table 9/i);
    fireEvent.change(nameInput, { target: { value: 'Table 3' } });

    fireEvent.click(screen.getByRole('button', { name: /Save Table/i }));

    await waitFor(() => {
      expect(tableService.createTable).toHaveBeenCalledWith({
        tableName: 'Table 3',
        capacity: 4,
        displayOrder: 3,
      });
    });
  });
});

describe('OrderDetailModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(orderService.getOrderById).mockResolvedValue(mockOrders[0]);
    vi.mocked(billingService.getBillByOrderId).mockRejectedValue(new Error('No bill found'));
  });

  it('loads and renders full order details with item list and totals', async () => {
    render(
      <BrowserRouter>
        <OrderDetailModal
          orderId={1}
          isOpen={true}
          onClose={vi.fn()}
        />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/ORD-20261014-0001/i)).toBeInTheDocument();
      expect(screen.getByText('Special Veg Thali')).toBeInTheDocument();
      expect(screen.getAllByText('₹340').length).toBeGreaterThan(0);
    });
  });
});
