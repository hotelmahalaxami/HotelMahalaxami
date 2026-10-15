import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { PublicMenuItem, CartItem } from '../../../types/publicMenu';

export interface CartContextValue {
  items: CartItem[];
  addItem: (item: PublicMenuItem, quantity?: number, notes?: string) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  updateNotes: (itemId: number, notes: string) => void;
  removeItem: (itemId: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = 'mahalaxmi_public_cart_v1';

function loadInitialCart(): CartItem[] {
  try {
    const raw = sessionStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Ensure all items conform to CartItem structure
    return parsed.filter(
      (item): item is CartItem =>
        Boolean(item && item.menuItem && typeof item.menuItem.id === 'number' && typeof item.quantity === 'number')
    );
  } catch {
    return [];
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(loadInitialCart);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync to sessionStorage on changes
  useEffect(() => {
    try {
      sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore sessionStorage quota or security errors gracefully
    }
  }, [items]);

  const addItem = useCallback((item: PublicMenuItem, quantity = 1, notes = '') => {
    if (!item.available) return;
    if (quantity <= 0) return;

    setItems((prev) => {
      const existingIdx = prev.findIndex((ci) => ci.menuItem.id === item.id);
      if (existingIdx >= 0) {
        const next = [...prev];
        const existing = next[existingIdx];
        next[existingIdx] = {
          ...existing,
          quantity: existing.quantity + quantity,
          notes: notes ? notes : existing.notes,
        };
        return next;
      }
      return [...prev, { menuItem: item, quantity, notes }];
    });
  }, []);

  const updateQuantity = useCallback((itemId: number, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((ci) => ci.menuItem.id !== itemId);
      }
      return prev.map((ci) => (ci.menuItem.id === itemId ? { ...ci, quantity } : ci));
    });
  }, []);

  const updateNotes = useCallback((itemId: number, notes: string) => {
    setItems((prev) =>
      prev.map((ci) => (ci.menuItem.id === itemId ? { ...ci, notes } : ci))
    );
  }, []);

  const removeItem = useCallback((itemId: number) => {
    setItems((prev) => prev.filter((ci) => ci.menuItem.id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      updateQuantity,
      updateNotes,
      removeItem,
      clearCart,
      totalItems,
      subtotal,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
    }),
    [items, addItem, updateQuantity, updateNotes, removeItem, clearCart, totalItems, subtotal, isCartOpen, openCart, closeCart, toggleCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
