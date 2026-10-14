import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { menuService } from '../services/menuService';
import { orderService } from '../services/orderService';
import { tableService } from '../services/tableService';
import type { ApiException } from '../types/api';
import type { RestaurantTable } from '../types/table';
import type {
  CartItem,
  MenuCategory,
  MenuItem,
  Order,
  OrderType,
} from '../types/pos';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { SettleBillModal } from '../features/billing/SettleBillModal';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

const FALLBACK_TABLES = [
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

const getRelativeTime = (isoString?: string): string => {
  if (!isoString) return '';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Date(isoString).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

const PosOrderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [openOrders, setOpenOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
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
      const [cats, items, orders, fetchedTables] = await Promise.all([
        menuService.getCategories(),
        menuService.getItems(),
        orderService.getOrders('OPEN'),
        tableService.getTables().catch(() => [] as RestaurantTable[]),
      ]);
      setCategories(cats);
      setMenuItems(items);
      setOpenOrders(orders);
      setTables(fetchedTables);
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

  // Derived table options including occupancy status
  const tableOptions = useMemo(() => {
    if (tables && tables.length > 0) {
      return tables.map((t) => {
        const activeOrder = openOrders.find(
          (o) =>
            o.orderType === 'DINE_IN' &&
            o.tableNumber &&
            o.tableNumber.trim().toLowerCase() === t.tableName.trim().toLowerCase()
        );
        const isOccupied = t.isOccupied || Boolean(activeOrder);
        const currentOrderNumber = activeOrder?.orderNumber ?? t.currentOrderNumber ?? null;
        const currentOrderId = activeOrder?.id ?? t.currentOrderId ?? null;
        return {
          id: t.id,
          name: t.tableName,
          capacity: t.capacity,
          isOccupied,
          currentOrderNumber,
          currentOrderId,
        };
      });
    }
    return FALLBACK_TABLES.map((name, idx) => {
      const activeOrder = openOrders.find(
        (o) =>
          o.orderType === 'DINE_IN' &&
          o.tableNumber &&
          o.tableNumber.trim().toLowerCase() === name.trim().toLowerCase()
      );
      return {
        id: idx + 1,
        name,
        capacity: 4,
        isOccupied: Boolean(activeOrder),
        currentOrderNumber: activeOrder?.orderNumber ?? null,
        currentOrderId: activeOrder?.id ?? null,
      };
    });
  }, [tables, openOrders]);

  // Check if the currently chosen table has an active conflict
  const selectedTableOccupancy = useMemo(() => {
    if (orderType !== 'DINE_IN') return null;
    const match = tableOptions.find(
      (t) => t.name.trim().toLowerCase() === tableNumber.trim().toLowerCase()
    );
    if (!match || !match.isOccupied) return null;
    // If editing an existing order and this table belongs to this exact order, no conflict
    if (
      editingOrder &&
      editingOrder.tableNumber &&
      editingOrder.tableNumber.trim().toLowerCase() === tableNumber.trim().toLowerCase()
    ) {
      return null;
    }
    return match;
  }, [orderType, tableOptions, tableNumber, editingOrder]);

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
    if (!item.available) return;
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

  const selectOpenOrderForEdit = useCallback(
    (order: Order) => {
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
    },
    [menuItems]
  );

  // If editOrderId is in searchParams, select that order for editing once orders & items are loaded
  useEffect(() => {
    const editOrderIdStr = searchParams.get('editOrderId');
    if (!editOrderIdStr || menuItems.length === 0) return;
    const orderId = Number(editOrderIdStr);
    if (!orderId || isNaN(orderId)) return;
    if (editingOrder?.id === orderId) return;

    const existing = openOrders.find((o) => o.id === orderId);
    if (existing) {
      selectOpenOrderForEdit(existing);
    } else {
      orderService
        .getOrderById(orderId)
        .then((fetched) => {
          if (fetched && fetched.status === 'OPEN') {
            selectOpenOrderForEdit(fetched);
          }
        })
        .catch(() => {});
    }
  }, [searchParams, menuItems, openOrders, selectOpenOrderForEdit, editingOrder]);

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

    if (orderType === 'DINE_IN' && selectedTableOccupancy) {
      setErrorMsg(
        `${selectedTableOccupancy.name} is currently occupied by Order ${selectedTableOccupancy.currentOrderNumber}. Please select another table or edit the existing ticket.`
      );
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

      // Refresh open orders and tables
      const [updatedOpenOrders, updatedTables] = await Promise.all([
        orderService.getOrders('OPEN'),
        tableService.getTables().catch(() => [] as RestaurantTable[]),
      ]);
      setOpenOrders(updatedOpenOrders);
      setTables(updatedTables);

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
    if (!window.confirm(`Are you sure you want to cancel order ${editingOrder.orderNumber}?`)) {
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await orderService.cancelOrder(editingOrder.id);
      const [updatedOpenOrders, updatedTables] = await Promise.all([
        orderService.getOrders('OPEN'),
        tableService.getTables().catch(() => [] as RestaurantTable[]),
      ]);
      setOpenOrders(updatedOpenOrders);
      setTables(updatedTables);
      setSuccessMsg(`Order ${editingOrder.orderNumber} cancelled.`);
      clearCurrentOrder();
    } catch (err) {
      const apiErr = err as ApiException;
      setErrorMsg(apiErr.apiError?.message ?? 'Failed to cancel order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Top Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-pos-border bg-white p-3 shadow-subtle">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <svg
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-pos-muted"
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
            className="w-full rounded-lg border border-pos-border bg-ivory/50 pl-10 pr-8 py-2 text-sm text-pos-text placeholder-pos-muted/60 focus:border-forest-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-700"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-pos-muted hover:text-pos-text text-xs"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Veg / Non-Veg Quick Filter */}
        <div className="flex items-center gap-1 rounded-lg bg-ivory p-1 border border-pos-border">
          {(['ALL', 'VEG', 'NON_VEG'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setVegFilter(filter)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                vegFilter === filter
                  ? 'bg-forest-800 text-white shadow-xs'
                  : 'text-pos-muted hover:text-pos-text'
              }`}
            >
              {filter === 'ALL' ? 'All Items' : filter === 'VEG' ? '🟢 Veg' : '🔴 Non-Veg'}
            </button>
          ))}
        </div>
      </div>

      {/* Active Open Orders Section */}
      {openOrders.length > 0 && (
        <div className="rounded-xl border border-pos-border bg-white p-3.5 shadow-subtle">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-forest-900">
                Active Orders ({openOrders.length})
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-pos-muted hidden sm:inline">
                Click any order card to load & edit ticket
              </span>
              {editingOrder && (
                <button
                  type="button"
                  onClick={clearCurrentOrder}
                  className="rounded-lg border border-pos-border bg-ivory px-2.5 py-1 text-xs font-semibold text-pos-text hover:bg-forest-50 transition-colors"
                >
                  + New Ticket
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
            {openOrders.map((ord) => {
              const isSelected = editingOrder?.id === ord.id;
              const isParcel = ord.orderType === 'PARCEL';
              return (
                <button
                  key={ord.id}
                  type="button"
                  onClick={() => selectOpenOrderForEdit(ord)}
                  className={`flex flex-col gap-1 rounded-xl border p-2.5 text-left transition-all flex-shrink-0 min-w-[170px] ${
                    isSelected
                      ? 'border-terracotta bg-terracotta-50/90 shadow-xs ring-1 ring-terracotta'
                      : 'border-pos-border bg-ivory/40 hover:border-forest-400 hover:bg-white hover:shadow-subtle'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                        isParcel
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-forest-100 text-forest-800'
                      }`}
                    >
                      {isParcel ? 'PARCEL' : (ord.tableNumber || 'Table')}
                    </span>
                    <span className="text-[10px] text-pos-muted">
                      {getRelativeTime(ord.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className="font-mono text-xs font-medium text-pos-muted">
                      {ord.orderNumber.replace('ORD-', '')}
                    </span>
                    <span className="text-xs font-bold text-forest-950">
                      ₹{ord.totalAmount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-pos-muted mt-0.5">
                    <span>{ord.items.length} {ord.items.length === 1 ? 'item' : 'items'}</span>
                    <span className="font-semibold text-emerald-700 uppercase text-[10px]">
                      {ord.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Status Alerts */}
      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-red-600 font-bold">⚠</span>
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg(null)} className="text-xs font-semibold text-red-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}
      {successMsg && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-bold">✓</span>
            <span>{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg(null)} className="text-xs font-semibold text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Main 3-Pane POS Layout: Categories | Items Grid | Current Cart */}
      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-12 overflow-hidden min-h-[550px]">
        {/* LEFT COLUMN: Categories (2 cols on desktop) */}
        <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-y-auto lg:col-span-2 rounded-xl border border-pos-border bg-white p-2.5 shadow-subtle">
          <p className="hidden lg:block px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-pos-muted">
            Categories
          </p>
          <button
            type="button"
            onClick={() => setSelectedCategoryId(null)}
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs sm:text-sm font-medium transition-colors flex-shrink-0 ${
              selectedCategoryId === null
                ? 'bg-forest text-white shadow-xs'
                : 'text-pos-text hover:bg-forest-50'
            }`}
          >
            <span>All Items</span>
            <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              selectedCategoryId === null ? 'bg-forest-900/40 text-forest-100' : 'bg-ivory text-pos-muted'
            }`}>
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
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs sm:text-sm font-medium transition-colors flex-shrink-0 ${
                  active
                    ? 'bg-forest text-white shadow-xs'
                    : 'text-pos-text hover:bg-forest-50'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  active ? 'bg-forest-900/40 text-forest-100' : 'bg-ivory text-pos-muted'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* CENTER COLUMN: Menu Items Grid (6 cols on desktop) */}
        <div className="lg:col-span-6 flex flex-col overflow-y-auto rounded-xl border border-pos-border bg-white p-3.5 shadow-subtle">
          {filteredItems.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-12">
              <EmptyState
                title="No menu items match your filter"
                description="Try clearing search query or selecting a different category."
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {filteredItems.map((item) => {
                const inCart = cart.find((ci) => ci.menuItem.id === item.id);
                const isAvailable = item.available !== false;

                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => addToCart(item)}
                    className={`group relative flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all active:scale-[0.98] ${
                      !isAvailable
                        ? 'border-pos-border bg-stone-50 opacity-60 cursor-not-allowed'
                        : inCart
                        ? 'border-terracotta bg-terracotta-50/40 shadow-xs'
                        : 'border-pos-border bg-white hover:border-forest-400 hover:shadow-subtle'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        {/* Veg / Non-Veg Indicator */}
                        <span
                          className={`inline-flex h-4 w-4 items-center justify-center rounded-sm border ${
                            item.isVeg ? 'border-emerald-600' : 'border-red-600'
                          }`}
                          title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              item.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                            }`}
                          />
                        </span>
                        <span className="text-[10px] text-pos-muted truncate">
                          {item.categoryName}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-pos-text leading-snug line-clamp-2">
                        {item.name}
                      </h4>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-pos-border">
                      <span className="text-base font-bold text-forest-900">
                        ₹{item.price}
                      </span>
                      {!isAvailable ? (
                        <span className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded px-1.5 py-0.5">
                          Sold Out
                        </span>
                      ) : inCart ? (
                        <span className="inline-flex items-center justify-center rounded-full bg-terracotta px-2 py-0.5 text-xs font-bold text-white shadow-xs">
                          ×{inCart.quantity}
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-pos-muted group-hover:text-forest-800">
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
        <div className="lg:col-span-4 flex flex-col rounded-xl border border-pos-border bg-white shadow-subtle overflow-hidden">
          {/* Cart Header */}
          <div className="border-b border-pos-border bg-ivory/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-pos-text">
                  {editingOrder ? `Editing ${editingOrder.orderNumber}` : 'Current Order'}
                </h3>
                <p className="text-xs text-pos-muted mt-0.5">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} in ticket
                </p>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCurrentOrder}
                  className="text-xs font-semibold text-red-700 hover:text-red-900 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Order Type & Table Selector */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex rounded-lg bg-white p-0.5 border border-pos-border">
                  <button
                    type="button"
                    onClick={() => setOrderType('DINE_IN')}
                    className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors ${
                      orderType === 'DINE_IN'
                        ? 'bg-forest text-white shadow-xs'
                        : 'text-pos-muted hover:text-pos-text'
                    }`}
                  >
                    Dine-In
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('PARCEL')}
                    className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors ${
                      orderType === 'PARCEL'
                        ? 'bg-forest text-white shadow-xs'
                        : 'text-pos-muted hover:text-pos-text'
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
                    className="rounded-lg border border-pos-border bg-white px-2.5 py-1.5 text-xs font-medium text-pos-text focus:border-forest-700 focus:outline-none"
                  >
                    {tableOptions.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} {t.isOccupied ? `(Occupied - #${t.currentOrderNumber ? t.currentOrderNumber.replace('ORD-', '') : 'In use'})` : '(Available)'}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center justify-center rounded-lg border border-pos-border bg-white px-2.5 py-1.5 text-xs text-forest-800 font-semibold">
                    Takeaway Parcel
                  </div>
                )}
              </div>

              {/* Inline Occupancy Warning */}
              {selectedTableOccupancy && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-semibold">⚠️ {selectedTableOccupancy.name} is occupied</span>
                    <span className="text-amber-800"> by Order #{selectedTableOccupancy.currentOrderNumber}</span>
                  </div>
                  {selectedTableOccupancy.currentOrderId && (
                    <button
                      type="button"
                      onClick={() => {
                        const ord = openOrders.find((o) => o.id === selectedTableOccupancy.currentOrderId);
                        if (ord) {
                          selectOpenOrderForEdit(ord);
                        }
                      }}
                      className="rounded bg-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-900 hover:bg-amber-300 transition-colors whitespace-nowrap"
                    >
                      Switch to Ticket
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-2">
            {cart.length === 0 ? (
              <div className="flex h-52 flex-col items-center justify-center text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ivory text-pos-muted mb-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-pos-text">Ticket is empty</p>
                <p className="mt-1 text-xs text-pos-muted max-w-xs">
                  Click any menu item from the list to add it to the ticket.
                </p>
              </div>
            ) : (
              cart.map((ci) => {
                const lineSubtotal = ci.menuItem.price * ci.quantity;
                return (
                  <div
                    key={ci.menuItem.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-pos-border bg-ivory/40 p-2.5 hover:bg-white transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-pos-text">
                        {ci.menuItem.name}
                      </p>
                      <p className="text-[11px] text-pos-muted">
                        ₹{ci.menuItem.price} × {ci.quantity}
                      </p>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(ci.menuItem.id, -1)}
                        aria-label={`Decrease ${ci.menuItem.name}`}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-pos-border bg-white text-xs font-bold text-pos-text hover:bg-forest-50"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-xs font-semibold text-pos-text">
                        {ci.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(ci.menuItem.id, 1)}
                        aria-label={`Increase ${ci.menuItem.name}`}
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-forest-100 text-xs font-bold text-forest-800 hover:bg-forest-200"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal & Delete */}
                    <div className="flex items-center gap-2 pl-1">
                      <span className="w-14 text-right text-xs font-bold text-pos-text">
                        ₹{lineSubtotal}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(ci.menuItem.id)}
                        aria-label={`Remove ${ci.menuItem.name}`}
                        className="text-pos-muted hover:text-red-600 text-xs p-1"
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

          {/* Notes & Checkout Footer */}
          <div className="border-t border-pos-border bg-white p-4 space-y-3">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Kitchen note (e.g. Less spicy, extra onion)..."
              className="w-full rounded-lg border border-pos-border bg-ivory/50 px-3 py-1.5 text-xs text-pos-text placeholder-pos-muted/60 focus:border-forest-700 focus:bg-white focus:outline-none"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-pos-muted">
                Order Total
              </span>
              <span
                data-testid="order-total"
                className="text-2xl font-black text-terracotta tracking-tight"
              >
                ₹{totalAmount}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Button
                type="button"
                variant="primary"
                size="md"
                disabled={isSubmitting || cart.length === 0}
                onClick={() => handleSaveOrder(false)}
              >
                {isSubmitting
                  ? 'Saving...'
                  : editingOrder
                  ? 'Update Order'
                  : 'Place Order'}
              </Button>

              <Button
                type="button"
                variant="forest"
                size="md"
                disabled={isSubmitting || cart.length === 0}
                onClick={() => handleSaveOrder(true)}
              >
                BILL
              </Button>
            </div>

            {editingOrder && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCancelOrder}
                className="w-full rounded-lg border border-red-200 bg-red-50 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
              >
                Cancel Entire Order
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Settle Bill Modal */}
      {settlingOrder && (
        <SettleBillModal
          orderId={settlingOrder.id}
          orderNumber={settlingOrder.orderNumber}
          tableNumber={settlingOrder.tableNumber}
          onClose={() => setSettlingOrder(null)}
          onSettled={async (settledBill) => {
            const [updated, updatedTables] = await Promise.all([
              orderService.getOrders('OPEN'),
              tableService.getTables().catch(() => [] as RestaurantTable[]),
            ]);
            setOpenOrders(updated);
            setTables(updatedTables);
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
