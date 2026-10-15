import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WebsiteOrdersPage from '../WebsiteOrdersPage';
import { orderService } from '../../services/orderService';
import type { Order } from '../../types/pos';

const mockPendingOrders: Order[] = [
  {
    id: 10,
    orderNumber: 'WEB-20261015-1001-123',
    tableNumber: null,
    orderType: 'PARCEL',
    status: 'OPEN',
    totalAmount: 510,
    notes: null,
    createdByUsername: null,
    orderSource: 'WEBSITE',
    acceptanceStatus: 'PENDING',
    customerName: 'Ajay Shinde',
    customerPhone: '9822334455',
    pickupNotes: 'Less spice in handi',
    trackingToken: 'token-ajay-123',
    items: [
      {
        id: 1,
        menuItemId: 101,
        itemName: 'Special Chicken Thali',
        unitPrice: 260,
        quantity: 1,
        subtotal: 260,
        status: 'ACTIVE',
      },
      {
        id: 2,
        menuItemId: 102,
        itemName: 'Chicken Fry',
        unitPrice: 250,
        quantity: 1,
        subtotal: 250,
        status: 'ACTIVE',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('WebsiteOrdersPage (Phase 5)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders pending website orders and customer details', async () => {
    vi.spyOn(orderService, 'getWebsiteOrders').mockResolvedValue(mockPendingOrders);
    vi.spyOn(orderService, 'getPendingWebsiteOrdersCount').mockResolvedValue(1);

    render(<WebsiteOrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('WEB-20261015-1001-123')).toBeInTheDocument();
    });

    expect(screen.getByText('Ajay Shinde')).toBeInTheDocument();
    expect(screen.getByText(/9822334455/i)).toBeInTheDocument();
    expect(screen.getByText(/Less spice in handi/i)).toBeInTheDocument();
    expect(screen.getByText('Special Chicken Thali × 1')).toBeInTheDocument();
    expect(screen.getByText('Chicken Fry × 1')).toBeInTheDocument();
    expect(screen.getByText('₹510.00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Accept$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Reject$/i })).toBeInTheDocument();
  });

  it('accepts website order on button click', async () => {
    vi.spyOn(orderService, 'getWebsiteOrders').mockResolvedValue(mockPendingOrders);
    vi.spyOn(orderService, 'getPendingWebsiteOrdersCount').mockResolvedValue(1);
    const acceptSpy = vi.spyOn(orderService, 'acceptWebsiteOrder').mockResolvedValue({
      ...mockPendingOrders[0],
      acceptanceStatus: 'ACCEPTED',
    });

    render(<WebsiteOrdersPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Accept$/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /^Accept$/i }));

    await waitFor(() => {
      expect(acceptSpy).toHaveBeenCalledWith(10);
    });
  });

  it('opens reject modal and confirms rejection with reason', async () => {
    vi.spyOn(orderService, 'getWebsiteOrders').mockResolvedValue(mockPendingOrders);
    vi.spyOn(orderService, 'getPendingWebsiteOrdersCount').mockResolvedValue(1);
    const rejectSpy = vi.spyOn(orderService, 'rejectWebsiteOrder').mockResolvedValue({
      ...mockPendingOrders[0],
      acceptanceStatus: 'REJECTED',
      status: 'CANCELLED',
    });

    render(<WebsiteOrdersPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Reject$/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /^Reject$/i }));

    // Modal should be visible
    expect(screen.getByText(/Reject Website Order #WEB-20261015-1001-123/i)).toBeInTheDocument();

    const reasonInput = screen.getByPlaceholderText(/Reason for rejection/i);
    fireEvent.change(reasonInput, { target: { value: 'Item sold out in kitchen' } });

    fireEvent.click(screen.getByRole('button', { name: /Confirm Rejection/i }));

    await waitFor(() => {
      expect(rejectSpy).toHaveBeenCalledWith(10, 'Item sold out in kitchen');
    });
  });

  it('switches tabs and displays empty state when no orders exist', async () => {
    const getOrdersSpy = vi.spyOn(orderService, 'getWebsiteOrders')
      .mockResolvedValueOnce(mockPendingOrders)
      .mockResolvedValue([]);
    vi.spyOn(orderService, 'getPendingWebsiteOrdersCount').mockResolvedValue(1);

    render(<WebsiteOrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('WEB-20261015-1001-123')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Accepted Orders/i }));

    await waitFor(() => {
      expect(screen.getByText(/No accepted website orders/i)).toBeInTheDocument();
    });

    expect(getOrdersSpy).toHaveBeenCalledWith('ACCEPTED');
  });
});
