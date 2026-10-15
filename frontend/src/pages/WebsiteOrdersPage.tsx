import React, { useState, useEffect, useCallback } from 'react';
import type { Order } from '../types/pos';
import { orderService } from '../services/orderService';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

type AcceptanceTab = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export const WebsiteOrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AcceptanceTab>('PENDING');
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Reject order modal state
  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const [orderList, count] = await Promise.all([
        orderService.getWebsiteOrders(activeTab),
        orderService.getPendingWebsiteOrdersCount(),
      ]);
      setOrders(orderList);
      setPendingCount(count);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch website orders';
      setError(msg);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
    if (import.meta.env.MODE === 'test') return;
    const interval = setInterval(() => {
      loadData(true);
    }, 15000); // Auto-poll every 15 seconds in browser
    return () => clearInterval(interval);
  }, [loadData]);

  const handleAcceptOrder = async (orderId: number) => {
    try {
      setIsActionLoading(true);
      await orderService.acceptWebsiteOrder(orderId);
      await loadData(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to accept order';
      alert(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingOrder) return;
    try {
      setIsActionLoading(true);
      await orderService.rejectWebsiteOrder(rejectingOrder.id, rejectionReason);
      setRejectingOrder(null);
      setRejectionReason('');
      await loadData(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reject order';
      alert(msg);
    } finally {
      setIsActionLoading(false);
    }
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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-stone-900 font-serif">
              Website Takeaway Orders
            </h1>
            {pendingCount > 0 && (
              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white animate-pulse">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Incoming customer orders submitted via the public restaurant website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => loadData(false)}
            disabled={loading || isRefreshing}
            className="flex items-center gap-1.5 text-xs"
          >
            <svg
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isRefreshing ? 'Checking...' : 'Refresh Queue'}</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-stone-200">
        <nav className="flex space-x-6">
          <button
            type="button"
            onClick={() => setActiveTab('PENDING')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'PENDING'
                ? 'border-primary-800 text-primary-900'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            <span>Pending Review</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800 font-bold">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ACCEPTED')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'ACCEPTED'
                ? 'border-primary-800 text-primary-900'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            Accepted Orders
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('REJECTED')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'REJECTED'
                ? 'border-primary-800 text-primary-900'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            Rejected / Cancelled
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl text-center space-y-3">
          <p className="font-semibold">{error}</p>
          <Button variant="secondary" onClick={() => loadData(false)}>
            Retry
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          title={`No ${activeTab.toLowerCase()} website orders`}
          description={
            activeTab === 'PENDING'
              ? 'New online takeaway orders submitted by customers will appear here automatically.'
              : `There are currently no website orders marked as ${activeTab.toLowerCase()}.`
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between overflow-hidden hover:border-primary-600 transition-all"
            >
              <div className="p-5 space-y-4">
                {/* Header: Order Number & Time */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-primary-800 bg-primary-50 px-2 py-0.5 rounded">
                      {order.orderNumber}
                    </span>
                    <h3 className="font-semibold text-base text-stone-900 mt-1">
                      {order.customerName || 'Anonymous Customer'}
                    </h3>
                    <p className="text-xs font-mono text-stone-600">
                      📞 {order.customerPhone || 'No phone'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-stone-400">
                      {getRelativeTime(order.createdAt)}
                    </span>
                    <div className="mt-1">
                      <Badge
                        variant={
                          order.acceptanceStatus === 'ACCEPTED'
                            ? 'success'
                            : order.acceptanceStatus === 'REJECTED'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {order.acceptanceStatus || 'PENDING'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="bg-stone-50 rounded-lg p-3 space-y-1.5 text-xs border border-stone-100">
                  <div className="font-semibold text-stone-700 pb-1 border-b border-stone-200">
                    Ordered Dishes ({order.items.length})
                  </div>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-stone-800">
                      <span>{item.itemName} &times; {item.quantity}</span>
                      <span className="font-medium">₹{item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Pickup Notes */}
                {order.pickupNotes && (
                  <div className="bg-amber-50/70 border border-amber-200/60 rounded-lg p-2.5 text-xs text-amber-900">
                    <span className="font-bold">Customer Notes:</span> {order.pickupNotes}
                  </div>
                )}
              </div>

              {/* Card Footer: Total & Actions */}
              <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-500">Total Amount</span>
                  <p className="font-bold text-base text-stone-900">
                    ₹{order.totalAmount.toFixed(2)}
                  </p>
                </div>

                {order.acceptanceStatus === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setRejectingOrder(order)}
                      disabled={isActionLoading}
                      className="text-red-700 hover:text-red-800 hover:bg-red-50 text-xs"
                    >
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAcceptOrder(order.id)}
                      disabled={isActionLoading}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs"
                    >
                      Accept
                    </Button>
                  </div>
                )}

                {order.acceptanceStatus === 'ACCEPTED' && (
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>In Kitchen / Billing</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Order Modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Reject Website Order #{rejectingOrder.orderNumber}
            </h3>
            <p className="text-xs text-stone-600">
              Please enter an optional reason for rejecting this takeaway order (e.g., kitchen closing or dish unavailable).
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setRejectingOrder(null);
                  setRejectionReason('');
                }}
                disabled={isActionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmReject}
                disabled={isActionLoading}
              >
                {isActionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteOrdersPage;
