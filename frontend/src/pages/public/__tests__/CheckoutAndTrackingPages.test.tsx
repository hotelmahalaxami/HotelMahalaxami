import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CheckoutPage from '../CheckoutPage';
import OrderTrackingPage from '../OrderTrackingPage';
import { CartProvider, useCart } from '../../../features/public/cart/CartContext';
import publicOrderService from '../../../services/publicOrderService';
import type { PublicOrderSubmissionResponse, PublicOrderTrackingResponse } from '../../../types/publicOrder';

// Helper component to pre-seed cart with items for testing checkout
const CartSeeder: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addItem } = useCart();
  React.useEffect(() => {
    addItem({
      id: 1,
      name: 'Special Chicken Thali',
      price: 260,
      categoryId: 1,
      categoryName: 'Thali Feasts',
      isVeg: false,
      available: true,
      displayOrder: 1,
    }, 2);
  }, [addItem]);

  return <>{children}</>;
};

describe('CheckoutPage and OrderTrackingPage (Phase 4)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders empty cart state when no items are selected', () => {
    render(
      <MemoryRouter initialEntries={['/checkout']}>
        <CartProvider>
          <CheckoutPage />
        </CartProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/Your Cart is Empty/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explore Menu/i })).toBeInTheDocument();
  });

  it('renders order summary and validates customer form inputs', async () => {
    render(
      <MemoryRouter initialEntries={['/checkout']}>
        <CartProvider>
          <CartSeeder>
            <CheckoutPage />
          </CartSeeder>
        </CartProvider>
      </MemoryRouter>
    );

    // Order summary should show 2 thalis @ 260 = 520
    await waitFor(() => {
      expect(screen.getByText('Special Chicken Thali')).toBeInTheDocument();
    });
    expect(screen.getByText(/Total Payable/i)).toBeInTheDocument();
    expect(screen.getAllByText(/₹520.00/i).length).toBeGreaterThanOrEqual(1);

    // Attempt to submit empty form
    fireEvent.click(screen.getByRole('button', { name: /Place Takeaway Order/i }));

    expect(screen.getByText(/Please enter your full name/i)).toBeInTheDocument();
    expect(screen.getByText(/Please enter a valid 10-digit Indian mobile number/i)).toBeInTheDocument();
  });

  it('submits order successfully and calls publicOrderService', async () => {
    const mockResponse: PublicOrderSubmissionResponse = {
      orderNumber: 'WEB-20261015-123456-101',
      trackingToken: 'test-token-abcdef123',
      status: 'OPEN',
      acceptanceStatus: 'PENDING',
      totalAmount: 520,
      estimatedPickupMinutes: 25,
      message: 'Takeaway order submitted successfully.',
      createdAt: new Date().toISOString(),
    };

    const submitSpy = vi.spyOn(publicOrderService, 'submitOrder').mockResolvedValueOnce(mockResponse);

    render(
      <MemoryRouter initialEntries={['/checkout']}>
        <CartProvider>
          <CartSeeder>
            <CheckoutPage />
          </CartSeeder>
        </CartProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Special Chicken Thali')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Suresh Patil' } });
    fireEvent.change(screen.getByLabelText(/Mobile Number/i), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByLabelText(/Special Pickup Notes/i), { target: { value: 'Extra pandhra rassa' } });

    fireEvent.click(screen.getByRole('button', { name: /Place Takeaway Order/i }));

    await waitFor(() => {
      expect(submitSpy).toHaveBeenCalledTimes(1);
    });

    const callPayload = submitSpy.mock.calls[0][0];
    expect(callPayload.customerName).toBe('Suresh Patil');
    expect(callPayload.customerPhone).toBe('9876543210');
    expect(callPayload.pickupNotes).toBe('Extra pandhra rassa');
    expect(callPayload.items).toHaveLength(1);
    expect(callPayload.items[0].menuItemId).toBe(1);
    expect(callPayload.items[0].quantity).toBe(2);
  });

  it('tracks order status and displays live progress steps', async () => {
    const mockTrackingData: PublicOrderTrackingResponse = {
      orderNumber: 'WEB-20261015-123456-101',
      status: 'OPEN',
      acceptanceStatus: 'ACCEPTED',
      totalAmount: 520,
      pickupNotes: 'Less spicy',
      items: [
        {
          itemName: 'Special Chicken Thali',
          quantity: 2,
          unitPrice: 260,
          subtotal: 520,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vi.spyOn(publicOrderService, 'trackOrder').mockResolvedValueOnce(mockTrackingData);

    render(
      <MemoryRouter initialEntries={['/track/test-token-abcdef123']}>
        <Routes>
          <Route path="/track/:trackingToken" element={<OrderTrackingPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Order #WEB-20261015-123456-101')).toBeInTheDocument();
    });

    expect(screen.getByText('1. Order Placed')).toBeInTheDocument();
    expect(screen.getByText('2. Kitchen Acceptance')).toBeInTheDocument();
    expect(screen.getByText('3. Counter Pickup')).toBeInTheDocument();
    expect(screen.getByText(/Order is confirmed and being prepared in the kitchen/i)).toBeInTheDocument();
    expect(screen.getByText(/Notes:/i)).toBeInTheDocument();
    expect(screen.getByText(/Less spicy/i)).toBeInTheDocument();
  });

  it('displays friendly error when tracking token is not found', async () => {
    vi.spyOn(publicOrderService, 'trackOrder').mockRejectedValueOnce(
      new Error('Order not found with provided tracking token')
    );

    render(
      <MemoryRouter initialEntries={['/track/unknown-token']}>
        <Routes>
          <Route path="/track/:trackingToken" element={<OrderTrackingPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Order Not Found/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/Order not found with provided tracking token/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explore Menu/i })).toBeInTheDocument();
  });
});
