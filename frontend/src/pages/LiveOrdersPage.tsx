import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Order, OrderStatus } from '../types/pos';
import type { BillResponse } from '../types/billing';
import { orderService } from '../services/orderService';
import { billingService } from '../services/billingService';
import { OrderDetailModal } from '../features/orders/OrderDetailModal';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

type TabKey = 'ACTIVE' | 'AWAITING_PAYMENT' | 'COMPLETED' | 'CANCELLED';

const formatInr = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

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

const LiveOrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('ACTIVE');
  const [orders, setOrders] = useState<Order[]>([]);
  const [billsMap, setBillsMap] = useState<Record<number, BillResponse>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');

  // Tab cache to prevent screen tear and flashing spinners
  const tabCacheRef = useRef<Record<string, Order[]>>({});
  const requestSeqRef = useRef<number>(0);

  // Selected order for modal inspection
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    const seq = ++requestSeqRef.current;
    setError(null);

    const hasCachedTab = Boolean(tabCacheRef.current[activeTab]);
    if (!hasCachedTab) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      let statusParam: OrderStatus | undefined;
      if (activeTab === 'ACTIVE') {
        statusParam = 'OPEN';
      } else if (activeTab === 'COMPLETED') {
        statusParam = 'COMPLETED';
      } else if (activeTab === 'CANCELLED') {
        statusParam = 'CANCELLED';
      }

      // Avoid unnecessary billing requests for tabs that do not need bill data
      const ordersPromise = orderService.getOrders(statusParam);
      const billsPromise =
        activeTab === 'AWAITING_PAYMENT'
          ? billingService.getBills().catch(() => [] as BillResponse[])
          : Promise.resolve([] as BillResponse[]);

      const [fetchedOrders, fetchedBills] = await Promise.all([ordersPromise, billsPromise]);

      // Guard against stale responses if tab was switched while request was inflight
      if (seq !== requestSeqRef.current) {
        return;
      }

      tabCacheRef.current[activeTab] = fetchedOrders;
      setOrders(fetchedOrders);

      // Build orderId -> Bill map only when needed
      if (activeTab === 'AWAITING_PAYMENT') {
        const map: Record<number, BillResponse> = {};
        fetchedBills.forEach((b) => {
          if (b.orderId) {
            map[b.orderId] = b;
          }
        });
        setBillsMap(map);
      }
    } catch (err: unknown) {
      if (seq === requestSeqRef.current) {
        const msg = err instanceof Error ? err.message : 'Failed to load live orders';
        setError(msg);
      }
    } finally {
      if (seq === requestSeqRef.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [activeTab]);

  const handleTabChange = (newTab: TabKey) => {
    setActiveTab(newTab);
    if (tabCacheRef.current[newTab]) {
      setOrders(tabCacheRef.current[newTab]);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Tab filtering
  const tabFilteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      if (activeTab === 'ACTIVE') {
        return ord.status === 'OPEN';
      }
      if (activeTab === 'AWAITING_PAYMENT') {
        // Unsettled: either READY_FOR_BILL or OPEN with an unpaid bill
        const bill = billsMap[ord.id];
        const isUnpaidBill = bill && bill.status === 'UNPAID';
        return ord.status === 'READY_FOR_BILL' || (ord.status === 'OPEN' && isUnpaidBill);
      }
      if (activeTab === 'COMPLETED') {
        return ord.status === 'COMPLETED';
      }
      if (activeTab === 'CANCELLED') {
        return ord.status === 'CANCELLED';
      }
      return true;
    });
  }, [orders, activeTab, billsMap]);

  // Search filtering
  const displayedOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tabFilteredOrders;
    return tabFilteredOrders.filter((ord) => {
      const matchOrderNum = ord.orderNumber.toLowerCase().includes(q);
      const matchTable = ord.tableNumber && ord.tableNumber.toLowerCase().includes(q);
      const matchStaff = ord.createdByUsername && ord.createdByUsername.toLowerCase().includes(q);
      const matchNotes = ord.notes && ord.notes.toLowerCase().includes(q);
      return matchOrderNum || matchTable || matchStaff || matchNotes;
    });
  }, [tabFilteredOrders, search]);

  const counts = useMemo(() => {
    let active = 0;
    let awaiting = 0;
    let completed = 0;
    let cancelled = 0;

    orders.forEach((o) => {
      if (o.status === 'OPEN') active++;
      if (o.status === 'READY_FOR_BILL') awaiting++;
      if (o.status === 'COMPLETED') completed++;
      if (o.status === 'CANCELLED') cancelled++;
    });

    return { active, awaiting, completed, cancelled };
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-pos-border rounded-xl p-5 shadow-subtle">
        <div>
          <h2 className="text-xl font-bold text-pos-text tracking-tight">Live Orders Management</h2>
          <p className="text-xs text-pos-muted mt-0.5">
            Monitor floor tickets, audit tables, settle bills, and track dining workflows
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isRefreshing}
            leftIcon={
              <svg className={`h-3.5 w-3.5 text-forest-700 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Link to="/orders/create">
            <Button
              variant="primary"
              size="sm"
              leftIcon={
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              New Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pos-border pb-1">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { key: 'ACTIVE', label: 'Active Orders', count: counts.active, color: 'forest' },
            { key: 'AWAITING_PAYMENT', label: 'Awaiting Payment', count: counts.awaiting, color: 'warning' },
            { key: 'COMPLETED', label: 'Paid / Completed', count: counts.completed, color: 'success' },
            { key: 'CANCELLED', label: 'Cancelled', count: counts.cancelled, color: 'neutral' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key as TabKey)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === tab.key
                  ? 'bg-forest-800 text-white shadow-xs'
                  : 'bg-white text-pos-muted hover:bg-forest-50 hover:text-pos-text border border-pos-border'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  activeTab === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-ivory text-pos-muted'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="w-full sm:w-72 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-pos-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search order #, table, staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-pos-border bg-white pl-9 pr-3 py-1.5 text-xs text-pos-text placeholder-pos-muted/60 focus:outline-none focus:border-forest-700"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="rounded-xl border border-pos-border bg-white shadow-subtle overflow-hidden">
        {loading && displayedOrders.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={`No ${activeTab.toLowerCase().replace('_', ' ')} orders found`}
              description={
                search
                  ? 'No tickets match your search criteria. Try a different query.'
                  : 'New orders will appear here as staff takes them from the POS screen.'
              }
              action={
                <Link to="/orders/create">
                  <Button variant="primary" size="sm">
                    Create New Order
                  </Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-pos-border bg-ivory text-pos-muted uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3.5">Order Number</th>
                  <th className="px-4 py-3.5">Table / Type</th>
                  <th className="px-4 py-3.5">Time</th>
                  <th className="px-4 py-3.5">Items</th>
                  <th className="px-4 py-3.5">Staff</th>
                  <th className="px-4 py-3.5">Order Total</th>
                  <th className="px-4 py-3.5">Order Status</th>
                  <th className="px-4 py-3.5">Billing Status</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pos-border">
                {displayedOrders.map((ord) => {
                  const bill = billsMap[ord.id];
                  const itemCount = ord.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

                  return (
                    <tr
                      key={ord.id}
                      onClick={() => setSelectedOrderId(ord.id)}
                      className="hover:bg-ivory/50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3.5 font-semibold text-pos-text font-mono">
                        {ord.orderNumber}
                      </td>
                      <td className="px-4 py-3.5 font-medium">
                        {ord.orderType === 'DINE_IN' ? (
                          <span className="rounded bg-forest-50 text-forest-800 border border-forest-200 px-2 py-0.5 text-[10px] font-bold">
                            {ord.tableNumber ? `Table ${ord.tableNumber}` : 'Dine-In'}
                          </span>
                        ) : (
                          <span className="rounded bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-[10px] font-bold">
                            PARCEL
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-pos-muted" title={new Date(ord.createdAt).toLocaleString('en-IN')}>
                        {getRelativeTime(ord.createdAt)}
                      </td>
                      <td className="px-4 py-3.5 text-pos-muted">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </td>
                      <td className="px-4 py-3.5 text-pos-muted">
                        {ord.createdByUsername || '—'}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-pos-text text-sm">
                        {formatInr(ord.totalAmount)}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          variant={
                            ord.status === 'COMPLETED'
                              ? 'success'
                              : ord.status === 'READY_FOR_BILL'
                              ? 'warning'
                              : ord.status === 'CANCELLED'
                              ? 'danger'
                              : 'forest'
                          }
                          size="sm"
                        >
                          {ord.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          variant={
                            bill?.status === 'PAID'
                              ? 'success'
                              : bill?.status === 'UNPAID'
                              ? 'warning'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {bill ? bill.status : 'NOT BILLED'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrderId(ord.id);
                          }}
                        >
                          View / Manage
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reusable Order Detail Modal */}
      <OrderDetailModal
        orderId={selectedOrderId}
        isOpen={Boolean(selectedOrderId)}
        onClose={() => setSelectedOrderId(null)}
        onOrderUpdated={loadData}
      />
    </div>
  );
};

export default LiveOrdersPage;
