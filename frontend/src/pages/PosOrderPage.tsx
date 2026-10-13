import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { menuService } from '../services/menuService';
import { orderService } from '../services/orderService';
import type { ApiException } from '../types/api';
import type {
  CartItem,
  MenuCategory,
  MenuItem,
  Order,
  OrderType,
} from '../types/pos';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { SettleBillModal } from '../features/billing/SettleBillModal';

const TABLE_OPTIONS = [
  'Table 1',
  'Table 2',
  'Table 3',
  'Table 4',
  'Table 5',
  'Table 6',
  'Table 7',
  'Table 8',
  'Family Hall 1',
  'Family Hall 2',
];

const PosOrderPage: React.FC = () => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [openOrders, setOpenOrders] = useState<Order[]>([]);
  const [settlingOrder, setSettlingOrder] = useState<Order | null>(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');

  // Cart & Order metadata
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
  const [tableNumber, setTableNumber] = useState<string>('Table 1');
  const [notes, setNotes] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);

  // UI states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [cats, items, orders] = await Promise.all([
        menuService.getCategories(),
        menuService.getItems(),
        orderService.getOrders('OPEN'),
      ]);
      setCategories(cats);
      setMenuItems(items);
      setOpenOrders(orders);
    } catch (err) {
      const apiErr = err as ApiException;
      setErrorMsg(apiErr.apiError?.message ?? 'Failed to load POS menu data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (selectedCategoryId !== null && item.categoryId !== selectedCategoryId) {
        return false;
      }
      if (vegFilter === 'VEG' && !item.isVeg) return false;
      if (vegFilter === 'NON_VEG' && item.isVeg) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.categoryName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [menuItems, selectedCategoryId, vegFilter, searchQuery]);

  // Cart actions
  const addToCart = (item: MenuItem) => {
    setSuccessMsg(null);
    setCart((prev) => {
      const existing = prev.find((ci) => ci.menuItem.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.menuItem.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const updateCartQuantity = (menuItemId: number, delta: number) => {
    setSuccessMsg(null);
    setCart((prev) =>
      prev
        .map((ci) =>
          ci.menuItem.id === menuItemId
            ? { ...ci, quantity: ci.quantity + delta }
            : ci
        )
        .filter((ci) => ci.quantity > 0)
    );
  };

  const removeFromCart = (menuItemId: number) => {
    setSuccessMsg(null);
    setCart((prev) => prev.filter((ci) => ci.menuItem.id !== menuItemId));
  };

  const clearCurrentOrder = () => {
    setEditingOrder(null);
    setCart([]);
    setNotes('');
    setOrderType('DINE_IN');
    setTableNumber('Table 1');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const selectOpenOrderForEdit = (order: Order) => {
    setEditingOrder(order);
    setOrderType(order.orderType);
    setTableNumber(order.tableNumber ?? 'Table 1');
    setNotes(order.notes ?? '');
    setErrorMsg(null);
    setSuccessMsg(null);

    const reconstructedCart: CartItem[] = [];
    for (const oi of order.items) {
      if (oi.status !== 'ACTIVE') continue;
      const foundMenu = menuItems.find((m) => m.id === oi.menuItemId) ?? {
        id: oi.menuItemId,
        categoryId: 0,
        categoryName: '',
        name: oi.itemName,
        price: oi.unitPrice,
        isVeg: true,
        available: true,
        displayOrder: 0,
      };
      reconstructedCart.push({
        menuItem: foundMenu,
        quantity: oi.quantity,
      });
    }
    setCart(reconstructedCart);
  };

  const totalAmount = useMemo(() => {
    return cart.reduce((sum, ci) => sum + ci.menuItem.price * ci.quantity, 0);
  }, [cart]);

  const totalItemsCount = useMemo(() => {
    return cart.reduce((sum, ci) => sum + ci.quantity, 0);
  }, [cart]);

  const handleSaveOrder = async (markReadyForBill = false) => {
    if (cart.length === 0) {
      setErrorMsg('Please add at least one item to the order.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const itemsPayload = cart.map((ci) => ({
        menuItemId: ci.menuItem.id,
        quantity: ci.quantity,
      }));

      let savedOrder: Order;
      if (editingOrder) {
        savedOrder = await orderService.updateOrder(editingOrder.id, {
          tableNumber: orderType === 'DINE_IN' ? tableNumber : 'Parcel',
          orderType,
          status: markReadyForBill ? 'READY_FOR_BILL' : 'OPEN',
          notes: notes.trim() || undefined,
          items: itemsPayload,
        });
        setSuccessMsg(
          markReadyForBill
            ? `Order ${savedOrder.orderNumber} marked Ready for Bill (₹${savedOrder.totalAmount})`
            : `Order ${savedOrder.orderNumber} updated (₹${savedOrder.totalAmount})`
        );
      } else {
        savedOrder = await orderService.createOrder({
          tableNumber: orderType === 'DINE_IN' ? tableNumber : 'Parcel',
          orderType,
          notes: notes.trim() || undefined,
          items: itemsPayload,
        });
        if (markReadyForBill) {
          savedOrder = await orderService.updateOrder(savedOrder.id, {
            tableNumber: savedOrder.tableNumber ?? undefined,
            orderType: savedOrder.orderType,
            status: 'READY_FOR_BILL',
            notes: savedOrder.notes ?? undefined,
            items: itemsPayload,
          });
        }
        setSuccessMsg(
          `Order ${savedOrder.orderNumber} placed successfully! Total: ₹${savedOrder.totalAmount}`
        );
      }

      // Refresh open orders list
      const updatedOpenOrders = await orderService.getOrders('OPEN');
      setOpenOrders(updatedOpenOrders);

      // Reset cart for next customer
      setEditingOrder(null);
      setCart([]);
      setNotes('');

      if (markReadyForBill) {
        setSettlingOrder(savedOrder);
      }
    } catch (err) {
      const apiErr = err as ApiException;
      setErrorMsg(apiErr.apiError?.message ?? 'Failed to save order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!editingOrder) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await orderService.cancelOrder(editingOrder.id);
      const updatedOpenOrders = await orderService.getOrders('OPEN');
      setOpenOrders(updatedOpenOrders);
      clearCurrentOrder();
      setSuccessMsg(`Order ${editingOrder.orderNumber} cancelled.`);
    } catch (err) {
      const apiErr = err as ApiException;
      setErrorMsg(apiErr.apiError?.message ?? 'Failed to cancel order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Top Bar: Search + Veg/Non-Veg + Active Open Orders */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-surface-light p-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <svg
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu (e.g. Veg Thali, Chicken Fry, Bhakri)..."
            aria-label="Search menu"
            className="w-full rounded-lg border border-white/10 bg-surface pl-10 pr-8 py-2 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Veg / Non-Veg Filter */}
        <div className="flex items-center gap-1 rounded-lg bg-surface p-1 border border-white/5">
          {(['ALL', 'VEG', 'NON_VEG'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setVegFilter(filter)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                vegFilter === filter
                  ? 'bg-brand-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {filter === 'ALL' ? 'All' : filter === 'VEG' ? '🟢 Veg' : '🔴 Non-Veg'}
            </button>
          ))}
        </div>
      </div>

      {/* Active Open Orders Bar (if any) */}
      {openOrders.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto rounded-xl border border-white/5 bg-surface-light px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-400 flex-shrink-0">
            Active Orders ({openOrders.length}):
          </span>
          {openOrders.map((ord) => {
            const isSelected = editingOrder?.id === ord.id;
            return (
              <button
                key={ord.id}
                type="button"
                onClick={() => selectOpenOrderForEdit(ord)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all flex-shrink-0 ${
                  isSelected
                    ? 'border-brand-500 bg-brand-500/20 text-white'
                    : 'border-white/10 bg-surface text-gray-300 hover:border-brand-500/40 hover:text-white'
                }`}
              >
                <span className="font-semibold text-brand-400">
                  {ord.tableNumber || ord.orderType}
                </span>
                <span>•</span>
                <span>₹{ord.totalAmount}</span>
                <span className="text-[10px] text-gray-400">({ord.items.length} items)</span>
              </button>
            );
          })}
          {editingOrder && (
            <button
              type="button"
              onClick={clearCurrentOrder}
              className="ml-auto rounded-lg bg-white/10 px-2.5 py-1 text-xs text-gray-300 hover:bg-white/20 flex-shrink-0"
            >
              + New Order
            </button>
          )}
        </div>
      )}

      {/* Alerts */}
      {errorMsg && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)} className="text-xs underline">
            Dismiss
          </button>
        </div>
      )}
      {successMsg && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2.5 text-sm text-green-400 flex items-center justify-between">
          <span>{successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg(null)} className="text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Main 3-Pane POS Layout: Categories | Menu Items | Current Order */}
      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-12 overflow-hidden">
        {/* LEFT COLUMN: Categories (2 cols on desktop) */}
        <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-y-auto lg:col-span-2 rounded-xl border border-white/5 bg-surface-light p-2.5">
          <p className="hidden lg:block px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            Categories
          </p>
          <button
            type="button"
            onClick={() => setSelectedCategoryId(null)}
            className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors flex-shrink-0 ${
              selectedCategoryId === null
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span>All Items</span>
            <span className="ml-2 rounded-full bg-black/20 px-2 py-0.5 text-xs">
              {menuItems.length}
            </span>
          </button>

          {categories.map((cat) => {
            const count = menuItems.filter((m) => m.categoryId === cat.id).length;
            const active = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors flex-shrink-0 ${
                  active
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                <span className="ml-2 rounded-full bg-black/20 px-2 py-0.5 text-xs">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* CENTER COLUMN: Menu Items Grid (6 cols on desktop) */}
        <div className="lg:col-span-6 flex flex-col overflow-y-auto rounded-xl border border-white/5 bg-surface-light p-3">
          {filteredItems.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-12 text-gray-500">
              <p className="text-sm">No menu items match your filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {filteredItems.map((item) => {
                const inCart = cart.find((ci) => ci.menuItem.id === item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => addToCart(item)}
                    className={`group relative flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all hover:border-brand-500/60 hover:bg-white/[0.04] active:scale-[0.98] ${
                      inCart
                        ? 'border-brand-500 bg-brand-500/10'
                        : 'border-white/10 bg-surface'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        {/* Veg / Non-Veg dot */}
                        <span
                          className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm border ${
                            item.isVeg ? 'border-green-500' : 'border-red-500'
                          }`}
                          title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              item.isVeg ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          />
                        </span>
                        <span className="text-[10px] text-gray-500 truncate">
                          {item.categoryName}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-white leading-snug line-clamp-2">
                        {item.name}
                      </h4>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-base font-bold text-brand-400">
                        ₹{item.price}
                      </span>
                      {inCart ? (
                        <span className="inline-flex items-center justify-center rounded-full bg-brand-500 px-2 py-0.5 text-xs font-bold text-white">
                          ×{inCart.quantity}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500 group-hover:text-brand-400">
                          + Add
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Current Order Cart (4 cols on desktop) */}
        <div className="lg:col-span-4 flex flex-col rounded-xl border border-white/5 bg-surface-light overflow-hidden">
          {/* Cart Header */}
          <div className="border-b border-white/5 bg-surface/50 p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  {editingOrder ? `Editing ${editingOrder.orderNumber}` : 'Current Order'}
                </h3>
                <p className="text-xs text-gray-400">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} selected
                </p>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCurrentOrder}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Order Type & Table Selector */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex rounded-lg bg-surface p-0.5 border border-white/10">
                <button
                  type="button"
                  onClick={() => setOrderType('DINE_IN')}
                  className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors ${
                    orderType === 'DINE_IN'
                      ? 'bg-brand-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Dine-In
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('PARCEL')}
                  className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors ${
                    orderType === 'PARCEL'
                      ? 'bg-brand-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Parcel
                </button>
              </div>

              {orderType === 'DINE_IN' ? (
                <select
                  aria-label="Select Table"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="rounded-lg border border-white/10 bg-surface px-2.5 py-1.5 text-xs font-medium text-white focus:border-brand-500 focus:outline-none"
                >
                  {TABLE_OPTIONS.map((t) => (
                    <option key={t} value={t} className="bg-surface text-white">
                      {t}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center justify-center rounded-lg border border-white/5 bg-surface/60 px-2.5 py-1.5 text-xs text-brand-400 font-medium">
                  Takeaway Parcel
                </div>
              )}
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center text-center text-gray-500">
                <p className="text-sm font-medium">Order is empty</p>
                <p className="mt-1 text-xs">Tap any menu item on the left to add it</p>
              </div>
            ) : (
              cart.map((ci) => {
                const lineSubtotal = ci.menuItem.price * ci.quantity;
                return (
                  <div
                    key={ci.menuItem.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-surface p-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {ci.menuItem.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        ₹{ci.menuItem.price} × {ci.quantity}
                      </p>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(ci.menuItem.id, -1)}
                        aria-label={`Decrease ${ci.menuItem.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-sm font-bold text-white hover:bg-white/20"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-semibold text-white">
                        {ci.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(ci.menuItem.id, 1)}
                        aria-label={`Increase ${ci.menuItem.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500/20 text-sm font-bold text-brand-400 hover:bg-brand-500/30"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal & Remove */}
                    <div className="flex items-center gap-2 pl-1">
                      <span className="w-14 text-right text-sm font-bold text-white">
                        ₹{lineSubtotal}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(ci.menuItem.id)}
                        aria-label={`Remove ${ci.menuItem.name}`}
                        className="text-gray-500 hover:text-red-400"
                        title="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Order Notes & Totals Footer */}
          <div className="border-t border-white/10 bg-surface/80 p-3.5 space-y-3">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Kitchen note (e.g. Less spicy, extra onion)..."
              className="w-full rounded-lg border border-white/10 bg-surface px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                Total
              </span>
              <span
                data-testid="order-total"
                className="text-2xl font-extrabold text-brand-400"
              >
                ₹{totalAmount}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isSubmitting || cart.length === 0}
                onClick={() => handleSaveOrder(false)}
                className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? 'Saving...'
                  : editingOrder
                  ? 'Update Order'
                  : 'Place Order'}
              </button>

              <button
                type="button"
                disabled={isSubmitting || cart.length === 0}
                onClick={() => handleSaveOrder(true)}
                className="rounded-lg border border-brand-500/50 bg-brand-500/10 px-4 py-2.5 text-sm font-semibold text-brand-400 transition-all hover:bg-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                BILL
              </button>
            </div>

            {editingOrder && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCancelOrder}
                className="w-full rounded-lg border border-red-500/30 bg-red-500/10 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20"
              >
                Cancel Entire Order
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stage 3 Billing & Payment Settlement Modal */}
      {settlingOrder && (
        <SettleBillModal
          orderId={settlingOrder.id}
          orderNumber={settlingOrder.orderNumber}
          tableNumber={settlingOrder.tableNumber}
          onClose={() => setSettlingOrder(null)}
          onSettled={async (settledBill) => {
            const updated = await orderService.getOrders('OPEN');
            setOpenOrders(updated);
            if (editingOrder?.id === settledBill.orderId) {
              clearCurrentOrder();
            }
            setSuccessMsg(`Bill ${settledBill.billNumber} settled successfully for ₹${settledBill.finalAmount}!`);
          }}
        />
      )}
    </div>
  );
};

export default PosOrderPage;
