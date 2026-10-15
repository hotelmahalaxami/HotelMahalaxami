import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { reportService } from '../services/reportService';
import { orderService } from '../services/orderService';
import { OrderDetailModal } from '../features/orders/OrderDetailModal';
import type { DashboardSummaryResponse } from '../types/reports';
import type { Order } from '../types/pos';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

const formatInr = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

const getStatusBadgeVariant = (status: string): 'warning' | 'forest' | 'terracotta' | 'success' | 'danger' | 'neutral' => {
  switch (status) {
    case 'OPEN':
      return 'forest';
    case 'READY_FOR_BILL':
      return 'warning';
    case 'CANCELLED':
      return 'danger';
    default:
      return 'neutral';
  }
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch recent 8 orders via dedicated paginated endpoint
      const recentOrdersPromise = orderService.getRecentOrders(8).catch(() => [] as Order[]);

      // Fetch dashboard summary if admin
      let summaryData: DashboardSummaryResponse | null = null;
      if (isAdmin) {
        try {
          summaryData = await reportService.getDashboardSummary();
        } catch {
          // If reports endpoint is inaccessible or empty, keep summaryData null
          summaryData = null;
        }
      }

      const fetchedRecentOrders = await recentOrdersPromise;
      setRecentOrders(fetchedRecentOrders);

      if (summaryData) {
        setSummary(summaryData);
      } else {
        // For staff or fallback: fetch active open orders to show accurate active count
        const activeOrders = await orderService.getOrders('OPEN').catch(() => [] as Order[]);
        const todayStr = new Date().toISOString().split('T')[0];
        const todayRecentOrders = fetchedRecentOrders.filter((o) => (o.createdAt || '').startsWith(todayStr));
        const nonCancelledOrders = todayRecentOrders.filter((o) => o.status !== 'CANCELLED');
        const totalRev = nonCancelledOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        setSummary({
          reportDate: todayStr,
          totalRevenue: totalRev,
          totalOrdersCount: todayRecentOrders.length,
          cashTotal: 0,
          upiTotal: 0,
          cardTotal: 0,
          cancelledOrdersCount: todayRecentOrders.filter((o) => o.status === 'CANCELLED').length,
          openOrdersCount: activeOrders.length,
          topItem: null,
          topSellingItems: [],
          recentDailySales: [],
        });
      }
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Derived metrics
  const totalRevenue = summary?.totalRevenue ?? 0;
  const orderCount = summary?.totalOrdersCount ?? 0;
  const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;
  const openOrdersCount = summary?.openOrdersCount ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl border border-pos-border bg-white p-5 animate-pulse">
              <div className="h-3 w-20 rounded bg-stone-200 mb-4" />
              <div className="h-7 w-28 rounded bg-stone-200" />
            </div>
          ))}
        </div>
        {/* Skeleton content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-80 rounded-xl border border-pos-border bg-white p-6 animate-pulse lg:col-span-2" />
          <div className="h-80 rounded-xl border border-pos-border bg-white p-6 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-3">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-red-900">Dashboard Unavailable</h3>
        <p className="mt-1 text-xs text-red-700">{error}</p>
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={fetchDashboardData}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Banner / Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-pos-border rounded-xl p-5 shadow-subtle">
        <div>
          <h2 className="text-lg font-bold text-pos-text leading-tight">
            Welcome back, {user?.username}
          </h2>
          <p className="text-xs text-pos-muted mt-0.5">
            Shift active &bull; Hotel Mahalaxmi POS Terminal
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/orders/create">
            <Button
              variant="primary"
              size="md"
              leftIcon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              New POS Order
            </Button>
          </Link>
          <Link to="/billing">
            <Button variant="outline" size="md">
              View Billing
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Sales */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-pos-muted">
                Today&apos;s Sales
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-50 text-forest-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-pos-text tracking-tight">
                {formatInr(totalRevenue)}
              </p>
              <p className="text-[11px] text-pos-muted mt-1">
                Settled revenue for today
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Today's Orders */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-pos-muted">
                Today&apos;s Orders
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-50 text-forest-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-pos-text tracking-tight">{orderCount}</p>
              <p className="text-[11px] text-pos-muted mt-1">
                {summary?.cancelledOrdersCount ? `${summary.cancelledOrdersCount} cancelled` : 'Total placed orders'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-pos-muted">
                Avg. Order Value
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-terracotta-50 text-terracotta-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-pos-text tracking-tight">
                {formatInr(avgOrderValue)}
              </p>
              <p className="text-[11px] text-pos-muted mt-1">
                Revenue per order placed
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pending / Attention Required */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-pos-muted">
                Open Orders
              </span>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  openOrdersCount > 0
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-pos-text tracking-tight">{openOrdersCount}</p>
              <p className="text-[11px] text-pos-muted mt-1">
                {openOrdersCount > 0 ? 'Kitchen & billing in-progress' : 'All tickets cleared'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Recent Orders + Top Selling Items */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Recent Orders Table */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Click any order to view details and reprint receipts</CardDescription>
              </div>
              <Link to="/live-orders" className="text-xs font-medium text-forest-700 hover:text-forest-900 underline">
                View all
              </Link>
            </CardHeader>
            <div className="flex-1 overflow-x-auto">
              {recentOrders.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    title="No orders recorded yet"
                    description="Create a new POS ticket from the orders screen to begin tracking live service."
                    action={
                      <Link to="/orders/create">
                        <Button variant="primary" size="sm">
                          Create first order
                        </Button>
                      </Link>
                    }
                  />
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-ivory border-b border-pos-border text-pos-muted uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3">Order #</th>
                      <th className="px-5 py-3">Table / Customer</th>
                      <th className="px-5 py-3">Items</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pos-border">
                    {recentOrders.map((order) => {
                      const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                      return (
                        <tr
                          key={order.id}
                          onClick={() => setSelectedOrderId(order.id)}
                          className="hover:bg-forest-50/60 cursor-pointer transition-colors"
                          title="Click to view order details, settle bill, or reprint receipt"
                        >
                          <td className="px-5 py-3.5 font-semibold text-pos-text">
                            {order.orderNumber || `#${order.id}`}
                          </td>
                          <td className="px-5 py-3.5 text-pos-text">
                            <div className="font-medium">
                              {order.orderType === 'DINE_IN'
                                ? `Table ${order.tableNumber || '-'}`
                                : 'Parcel / Takeaway'}
                            </div>
                            {order.createdByUsername && (
                              <div className="text-[11px] text-pos-muted">Staff: {order.createdByUsername}</div>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-pos-muted">
                            {itemCount} {itemCount === 1 ? 'item' : 'items'}
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge variant={getStatusBadgeVariant(order.status)} size="sm">
                              {order.status}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5 text-right font-semibold text-pos-text">
                            {formatInr(order.totalAmount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Top Items / Sales Breakdown */}
        <div className="space-y-6">
          {/* Top Selling Items (Real API) */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Menu Items</CardTitle>
              <CardDescription>Top dishes by sales volume</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {summary?.topSellingItems && summary.topSellingItems.length > 0 ? (
                <div className="divide-y divide-pos-border">
                  {summary.topSellingItems.slice(0, 5).map((item, idx) => (
                    <div key={item.menuItemId || idx} className="flex items-center justify-between p-4 hover:bg-ivory/40 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-forest-50 text-[11px] font-bold text-forest-700">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-pos-text">{item.itemName}</p>
                          <p className="text-[10px] text-pos-muted">{item.categoryName || 'Menu'}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-semibold text-pos-text">{formatInr(item.totalRevenue)}</p>
                        <p className="text-[10px] text-pos-muted">{item.quantitySold} sold</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6">
                  <EmptyState
                    title="No top item data"
                    description="Popular items will populate as orders are placed and settled."
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Split</CardTitle>
              <CardDescription>Today&apos;s settlement methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-pos-muted">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                  Cash
                </span>
                <span className="font-semibold text-pos-text">{formatInr(summary?.cashTotal ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-pos-muted">
                  <span className="h-2.5 w-2.5 rounded-full bg-terracotta" />
                  UPI
                </span>
                <span className="font-semibold text-pos-text">{formatInr(summary?.upiTotal ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-pos-muted">
                  <span className="h-2.5 w-2.5 rounded-full bg-forest-600" />
                  Card
                </span>
                <span className="font-semibold text-pos-text">{formatInr(summary?.cardTotal ?? 0)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Historical Sales Overview (If Available in Backend) */}
      {summary?.recentDailySales && summary.recentDailySales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales Activity</CardTitle>
            <CardDescription>Historical daily revenue trend from backend</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {summary.recentDailySales.slice(-7).map((day) => (
                <div key={day.date} className="rounded-lg border border-pos-border bg-ivory/50 p-3 text-center">
                  <p className="text-[11px] font-medium text-pos-muted">
                    {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-sm font-bold text-pos-text mt-1">{formatInr(day.totalRevenue)}</p>
                  <p className="text-[10px] text-pos-muted mt-0.5">{day.ordersCount} orders</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Detail Modal */}
      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          isOpen={Boolean(selectedOrderId)}
          onClose={() => setSelectedOrderId(null)}
          onOrderUpdated={fetchDashboardData}
        />
      )}
    </div>
  );
};

export default DashboardPage;
