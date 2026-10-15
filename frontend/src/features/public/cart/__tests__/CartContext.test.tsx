import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { CartProvider, useCart } from '../CartContext';
import type { PublicMenuItem } from '../../../../types/publicMenu';

const mockDish: PublicMenuItem = {
  id: 101,
  name: 'Special Chicken Thali',
  price: 260,
  categoryId: 1,
  categoryName: 'Thali Feasts',
  isVeg: false,
  available: true,
  displayOrder: 1,
};

const mockUnavailableDish: PublicMenuItem = {
  id: 102,
  name: 'Seasonal Special',
  price: 300,
  categoryId: 1,
  categoryName: 'Thali Feasts',
  isVeg: true,
  available: false,
  displayOrder: 2,
};

const TestCartConsumer: React.FC = () => {
  const {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    subtotal,
    isCartOpen,
    openCart,
    closeCart,
  } = useCart();

  return (
    <div>
      <div data-testid="total-items">{totalItems}</div>
      <div data-testid="subtotal">{subtotal}</div>
      <div data-testid="cart-open">{isCartOpen ? 'open' : 'closed'}</div>
      <div data-testid="item-count">{items.length}</div>
      {items.map((i) => (
        <div key={i.menuItem.id} data-testid={`item-${i.menuItem.id}`}>
          {i.menuItem.name} - Qty: {i.quantity} - Total: ₹{i.menuItem.price * i.quantity}
        </div>
      ))}
      <button onClick={() => addItem(mockDish, 1)}>Add Dish</button>
      <button onClick={() => addItem(mockDish, 2)}>Add 2 More</button>
      <button onClick={() => addItem(mockUnavailableDish, 1)}>Add Unavailable</button>
      <button onClick={() => updateQuantity(mockDish.id, 5)}>Set Qty 5</button>
      <button onClick={() => updateQuantity(mockDish.id, 0)}>Set Qty 0</button>
      <button onClick={() => removeItem(mockDish.id)}>Remove Dish</button>
      <button onClick={clearCart}>Clear All</button>
      <button onClick={openCart}>Open Drawer</button>
      <button onClick={closeCart}>Close Drawer</button>
    </div>
  );
};

describe('CartContext & Takeaway Cart Management', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('initializes with empty cart and closed drawer', () => {
    render(
      <CartProvider>
        <TestCartConsumer />
      </CartProvider>
    );

    expect(screen.getByTestId('total-items').textContent).toBe('0');
    expect(screen.getByTestId('subtotal').textContent).toBe('0');
    expect(screen.getByTestId('cart-open').textContent).toBe('closed');
    expect(screen.getByTestId('item-count').textContent).toBe('0');
  });

  it('adds available items and calculates correct subtotal and quantity', () => {
    render(
      <CartProvider>
        <TestCartConsumer />
      </CartProvider>
    );

    act(() => {
      screen.getByText('Add Dish').click();
    });

    expect(screen.getByTestId('total-items').textContent).toBe('1');
    expect(screen.getByTestId('subtotal').textContent).toBe('260');
    expect(screen.getByTestId('item-101')).toHaveTextContent('Special Chicken Thali - Qty: 1 - Total: ₹260');

    // Add 2 more of the same dish
    act(() => {
      screen.getByText('Add 2 More').click();
    });

    expect(screen.getByTestId('total-items').textContent).toBe('3');
    expect(screen.getByTestId('subtotal').textContent).toBe('780');
    expect(screen.getByTestId('item-101')).toHaveTextContent('Qty: 3 - Total: ₹780');
  });

  it('rejects adding unavailable items', () => {
    render(
      <CartProvider>
        <TestCartConsumer />
      </CartProvider>
    );

    act(() => {
      screen.getByText('Add Unavailable').click();
    });

    expect(screen.getByTestId('total-items').textContent).toBe('0');
    expect(screen.getByTestId('item-count').textContent).toBe('0');
  });

  it('updates item quantity and removes item when quantity reaches zero', () => {
    render(
      <CartProvider>
        <TestCartConsumer />
      </CartProvider>
    );

    act(() => {
      screen.getByText('Add Dish').click();
    });

    act(() => {
      screen.getByText('Set Qty 5').click();
    });

    expect(screen.getByTestId('total-items').textContent).toBe('5');
    expect(screen.getByTestId('subtotal').textContent).toBe('1300');

    act(() => {
      screen.getByText('Set Qty 0').click();
    });

    expect(screen.getByTestId('total-items').textContent).toBe('0');
    expect(screen.getByTestId('subtotal').textContent).toBe('0');
    expect(screen.getByTestId('item-count').textContent).toBe('0');
  });

  it('removes item via removeItem and clears all via clearCart', () => {
    render(
      <CartProvider>
        <TestCartConsumer />
      </CartProvider>
    );

    act(() => {
      screen.getByText('Add Dish').click();
    });

    expect(screen.getByTestId('item-count').textContent).toBe('1');

    act(() => {
      screen.getByText('Remove Dish').click();
    });

    expect(screen.getByTestId('item-count').textContent).toBe('0');

    act(() => {
      screen.getByText('Add Dish').click();
    });

    act(() => {
      screen.getByText('Clear All').click();
    });

    expect(screen.getByTestId('item-count').textContent).toBe('0');
  });

  it('toggles cart drawer open and closed state', () => {
    render(
      <CartProvider>
        <TestCartConsumer />
      </CartProvider>
    );

    expect(screen.getByTestId('cart-open').textContent).toBe('closed');

    act(() => {
      screen.getByText('Open Drawer').click();
    });
    expect(screen.getByTestId('cart-open').textContent).toBe('open');

    act(() => {
      screen.getByText('Close Drawer').click();
    });
    expect(screen.getByTestId('cart-open').textContent).toBe('closed');
  });

  it('persists cart state to sessionStorage across re-mounts', () => {
    const { unmount } = render(
      <CartProvider>
        <TestCartConsumer />
      </CartProvider>
    );

    act(() => {
      screen.getByText('Add Dish').click();
    });

    unmount();

    // Re-mount with new provider
    render(
      <CartProvider>
        <TestCartConsumer />
      </CartProvider>
    );

    expect(screen.getByTestId('total-items').textContent).toBe('1');
    expect(screen.getByTestId('subtotal').textContent).toBe('260');
  });
});
