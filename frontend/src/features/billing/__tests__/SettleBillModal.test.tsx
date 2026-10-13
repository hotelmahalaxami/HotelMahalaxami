import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SettleBillModal } from '../SettleBillModal';
import { billingService } from '../../../services/billingService';
import type { BillResponse } from '../../../types/billing';

vi.mock('../../../services/billingService', () => ({
  billingService: {
    generateBill: vi.fn(),
    settleBill: vi.fn(),
  },
}));

const mockBill: BillResponse = {
  id: 101,
  billNumber: 'BILL-20261013-101',
  orderId: 1,
  orderNumber: 'ORD-20261013-001',
  tableNumber: 'Table 4',
  orderType: 'DINE_IN',
  subtotal: 540,
  discountAmount: 0,
  taxAmount: 0,
  finalAmount: 540,
  status: 'UNPAID',
  notes: null,
  createdByUsername: 'staff1',
  items: [
    {
      id: 1,
      menuItemId: 1,
      itemName: 'Special Veg Thali',
      unitPrice: 170,
      quantity: 2,
      subtotal: 340,
      status: 'ACTIVE',
    },
    {
      id: 2,
      menuItemId: 2,
      itemName: 'Chicken Fry',
      unitPrice: 200,
      quantity: 1,
      subtotal: 200,
      status: 'ACTIVE',
    },
  ],
  payments: [],
  paidAt: null,
  createdAt: new Date().toISOString(),
};

describe('SettleBillModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders bill calculation correctly with items and subtotal', () => {
    render(
      <SettleBillModal
        orderId={1}
        orderNumber="ORD-20261013-001"
        tableNumber="4"
        initialBill={mockBill}
        onClose={vi.fn()}
        onSettled={vi.fn()}
      />
    );

    expect(screen.getByText(/Bill & Settle Payment/i)).toBeInTheDocument();
    expect(screen.getByText('Special Veg Thali')).toBeInTheDocument();
    expect(screen.getByText('Chicken Fry')).toBeInTheDocument();
    expect(screen.getAllByText('₹540.00')).toHaveLength(2);
  });

  it('allows selecting payment method and settling bill with cash', async () => {
    const onSettled = vi.fn();
    const settledBill: BillResponse = {
      ...mockBill,
      status: 'PAID',
      paidAt: new Date().toISOString(),
      payments: [
        {
          id: 1,
          paymentNumber: 'PAY-1',
          amount: 540,
          paymentMethod: 'CASH',
          transactionRef: null,
          status: 'SUCCESS',
          recordedByUsername: 'staff1',
          createdAt: new Date().toISOString(),
        },
      ],
    };

    vi.mocked(billingService.settleBill).mockResolvedValueOnce(settledBill);

    render(
      <SettleBillModal
        orderId={1}
        orderNumber="ORD-20261013-001"
        tableNumber="4"
        initialBill={mockBill}
        onClose={vi.fn()}
        onSettled={onSettled}
      />
    );

    // Click Cash (default is cash)
    const settleBtn = screen.getByRole('button', { name: /Complete Payment & Print Bill/i });
    fireEvent.click(settleBtn);

    await waitFor(() => {
      expect(billingService.settleBill).toHaveBeenCalledWith(101, {
        paymentMethod: 'CASH',
        amount: 540,
        transactionRef: undefined,
        notes: undefined,
      });
      expect(onSettled).toHaveBeenCalledWith(settledBill);
    });

    // Thermal receipt should now be displayed
    expect(screen.getByText('Receipt Preview')).toBeInTheDocument();
    expect(screen.getByText('Mahalaxmi Hotel')).toBeInTheDocument();
  });

  it('shows UPI transaction ref field when UPI mode is selected', () => {
    render(
      <SettleBillModal
        orderId={1}
        orderNumber="ORD-20261013-001"
        tableNumber="4"
        initialBill={mockBill}
        onClose={vi.fn()}
        onSettled={vi.fn()}
      />
    );

    const upiButton = screen.getByRole('button', { name: /UPI \/ QR/i });
    fireEvent.click(upiButton);

    expect(screen.getByPlaceholderText(/e\.g\. 429381749182/i)).toBeInTheDocument();
  });
});
