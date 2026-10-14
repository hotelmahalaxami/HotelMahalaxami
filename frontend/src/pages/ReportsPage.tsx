import React, { useEffect, useState } from 'react';
import { reportService } from '../services/reportService';
import type {
  DailySalesDto,
  DashboardSummaryResponse,
  ItemSalesDto,
  MonthlySalesDto,
} from '../types/reports';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

type ReportTab = 'overview' | 'items' | 'daily' | 'monthly';

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [itemSales, setItemSales] = useState<ItemSalesDto[]>([]);
  const [dailySales, setDailySales] = useState<DailySalesDto[]>([]);
  const [monthlySales, setMonthlySales] = useState<MonthlySalesDto[]>([]);
  const [itemSearch, setItemSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReportData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sum, items, daily, monthly] = await Promise.all([
        reportService.getDashboardSummary(selectedDate),
        reportService.getItemWiseSales(),
        reportService.getDailySales(),
        reportService.getMonthlySales(selectedYear),
      ]);
      setSummary(sum);
      setItemSales(items);
      setDailySales(daily);
      setMonthlySales(monthly);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load reports';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [selectedDate, selectedYear]);

  const handlePrint = () => {
    window.print();
  };

  const filteredItems = itemSales.filter(
    (i) =>
      i.itemName.toLowerCase().includes(itemSearch.toLowerCase()) ||
      i.categoryName.toLowerCase().includes(itemSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Printable CSS */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: #20332F !important;
          }
          aside, nav, header, button, input, select, .no-print {
            display: none !important;
          }
          .printable-report {
            display: block !important;
            padding: 20px;
          }
          .card-print {
            border: 1px solid #E3E5DE !important;
            background: white !important;
            color: #20332F !important;
            box-shadow: none !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th, td {
            border: 1px solid #E3E5DE !important;
            padding: 8px !important;
            color: #20332F !important;
          }
        }
      `}</style>

      {/* Header and Controls */}
      <div className="no-print flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border border-pos-border rounded-xl p-5 shadow-subtle">
        <div>
          <h2 className="text-xl font-bold text-pos-text tracking-tight">Sales & Operations Reports</h2>
          <p className="text-xs text-pos-muted mt-0.5">
            Operational sales analytics, payment breakdowns, and item velocity
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Picker */}
          <div className="flex items-center gap-2 rounded-lg border border-pos-border bg-ivory/50 px-3 py-1.5 text-xs">
            <span className="text-pos-muted font-medium">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-pos-text font-semibold focus:outline-none"
            />
          </div>

          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={loadReportData}
            disabled={isLoading}
            title="Reload report data"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>

          {/* Print Report */}
          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            leftIcon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            }
          >
            Print Report
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-800 flex items-center justify-between">
          <span>⚠ {error}</span>
          <button onClick={() => setError(null)} className="text-xs font-semibold text-red-700 hover:underline">✕</button>
        </div>
      )}

      {/* TODAY Executive Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Orders */}
        <div className="card-print rounded-xl border border-pos-border bg-white p-4 shadow-subtle">
          <p className="text-xs font-semibold uppercase tracking-wider text-pos-muted">Orders</p>
          <p className="mt-1 text-2xl font-bold text-pos-text">
            {summary ? summary.totalOrdersCount : '0'}
          </p>
          <span className="text-[11px] text-pos-muted">Total settled</span>
        </div>

        {/* Total Sales */}
        <div className="card-print rounded-xl border border-pos-border bg-white p-4 shadow-subtle">
          <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">Total Sales</p>
          <p className="mt-1 text-2xl font-bold text-terracotta">
            ₹{summary ? Number(summary.totalRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
          </p>
          <span className="text-[11px] text-pos-muted">Gross revenue</span>
        </div>

        {/* Cash Sales */}
        <div className="card-print rounded-xl border border-pos-border bg-white p-4 shadow-subtle">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Cash</p>
          <p className="mt-1 text-2xl font-bold text-emerald-800">
            ₹{summary ? Number(summary.cashTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
          </p>
          <span className="text-[11px] text-pos-muted">Physical cash</span>
        </div>

        {/* UPI Sales */}
        <div className="card-print rounded-xl border border-pos-border bg-white p-4 shadow-subtle">
          <p className="text-xs font-semibold uppercase tracking-wider text-forest-700">UPI</p>
          <p className="mt-1 text-2xl font-bold text-forest-800">
            ₹{summary ? Number(summary.upiTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
          </p>
          <span className="text-[11px] text-pos-muted">QR / GPay / PhonePe</span>
        </div>

        {/* Card Sales */}
        <div className="card-print rounded-xl border border-pos-border bg-white p-4 shadow-subtle">
          <p className="text-xs font-semibold uppercase tracking-wider text-forest-900">Card</p>
          <p className="mt-1 text-2xl font-bold text-forest-900">
            ₹{summary ? Number(summary.cardTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
          </p>
          <span className="text-[11px] text-pos-muted">POS Machine</span>
        </div>

        {/* Cancelled / Open */}
        <div className="card-print rounded-xl border border-pos-border bg-white p-4 shadow-subtle">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-700">Cancelled</p>
          <p className="mt-1 text-2xl font-bold text-red-700">
            {summary ? summary.cancelledOrdersCount : '0'}
          </p>
          <span className="text-[11px] text-pos-muted">
            {summary ? `${summary.openOrdersCount} open orders` : ''}
          </span>
        </div>
      </div>

      {/* Top Item Highlight Banner */}
      {summary?.topItem ? (
        <div className="card-print rounded-xl border border-pos-border bg-white p-5 shadow-subtle flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-700 text-xl font-bold">
              ★
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-terracotta">Top Selling Item</span>
              <h3 className="text-lg font-bold text-pos-text mt-0.5">
                {summary.topItem.itemName}
              </h3>
              <p className="text-xs text-pos-muted">Category: {summary.topItem.categoryName}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-left sm:text-right">
              <p className="text-xs text-pos-muted">Quantity Sold</p>
              <p className="text-lg font-bold text-pos-text">{summary.topItem.quantitySold} units</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-pos-muted">Total Revenue</p>
              <p className="text-lg font-bold text-forest-900">
                ₹{Number(summary.topItem.totalRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-print rounded-xl border border-pos-border bg-white p-5 text-center text-xs text-pos-muted">
          No orders settled yet for {selectedDate}.
        </div>
      )}

      {/* Tabs */}
      <div className="no-print border-b border-pos-border flex items-center gap-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'overview'
              ? 'border-terracotta text-terracotta'
              : 'border-transparent text-pos-muted hover:text-pos-text'
          }`}
        >
          Leaderboard & Trend
        </button>
        <button
          onClick={() => setActiveTab('items')}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'items'
              ? 'border-terracotta text-terracotta'
              : 'border-transparent text-pos-muted hover:text-pos-text'
          }`}
        >
          Item-Wise Sales ({itemSales.length})
        </button>
        <button
          onClick={() => setActiveTab('daily')}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'daily'
              ? 'border-terracotta text-terracotta'
              : 'border-transparent text-pos-muted hover:text-pos-text'
          }`}
        >
          Daily Sales ({dailySales.length} Days)
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'monthly'
              ? 'border-terracotta text-terracotta'
              : 'border-transparent text-pos-muted hover:text-pos-text'
          }`}
        >
          Monthly Sales ({selectedYear})
        </button>
      </div>

      {/* TAB 1: Overview & Top Items */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 5 Items Leaderboard */}
          <div className="card-print rounded-xl border border-pos-border bg-white p-5 shadow-subtle">
            <h3 className="text-sm font-bold text-pos-text mb-4">Top 5 Items by Volume</h3>
            {summary?.topSellingItems && summary.topSellingItems.length > 0 ? (
              <div className="space-y-3.5">
                {summary.topSellingItems.map((item, idx) => {
                  const maxQty = summary.topSellingItems[0].quantitySold || 1;
                  const percent = Math.min(100, Math.round((item.quantitySold / maxQty) * 100));
                  return (
                    <div key={item.menuItemId} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-terracotta">#{idx + 1}</span>
                          <span className="font-semibold text-pos-text">{item.itemName}</span>
                          <span className="text-[11px] text-pos-muted">({item.categoryName})</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-pos-text">{item.quantitySold} sold</span>
                          <span className="ml-2 text-pos-muted">
                            (₹{Number(item.totalRevenue).toFixed(2)})
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-ivory overflow-hidden">
                        <div
                          className="h-full rounded-full bg-terracotta transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-pos-muted">No item sales recorded today.</p>
            )}
          </div>

          {/* Recent 7-Day Trend Preview */}
          <div className="card-print rounded-xl border border-pos-border bg-white p-5 shadow-subtle">
            <h3 className="text-sm font-bold text-pos-text mb-4">Last 7 Days Sales Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-pos-border bg-ivory text-pos-muted uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Orders</th>
                    <th className="py-2.5 px-3 text-right">Revenue (₹)</th>
                    <th className="py-2.5 px-3 text-right">Cash</th>
                    <th className="py-2.5 px-3 text-right">UPI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pos-border">
                  {summary?.recentDailySales?.map((day) => (
                    <tr key={day.date} className="hover:bg-ivory/40 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-pos-text">{day.date}</td>
                      <td className="py-2.5 px-3 text-right text-pos-muted">{day.ordersCount}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-pos-text">
                        ₹{Number(day.totalRevenue).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-800">₹{Number(day.cashTotal).toFixed(0)}</td>
                      <td className="py-2.5 px-3 text-right text-forest-800">₹{Number(day.upiTotal).toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Item-Wise Sales */}
      {activeTab === 'items' && (
        <div className="card-print space-y-4 rounded-xl border border-pos-border bg-white p-5 shadow-subtle">
          <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-sm font-bold text-pos-text">Item-Wise Sales Breakdown (All Time / Period)</h3>
            <input
              type="text"
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              placeholder="Filter by item or category..."
              className="w-full sm:w-64 rounded-lg border border-pos-border bg-ivory/50 px-3 py-1.5 text-xs text-pos-text placeholder-pos-muted/60 focus:outline-none focus:border-forest-700 focus:bg-white"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-pos-border bg-ivory text-xs uppercase tracking-wider text-pos-muted font-semibold">
                <tr>
                  <th className="px-4 py-3">Menu Item</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Quantity Sold</th>
                  <th className="px-4 py-3 text-right">Total Revenue (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pos-border">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-pos-muted">
                      No matching sales items found.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.menuItemId} className="hover:bg-ivory/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-pos-text">{item.itemName}</td>
                      <td className="px-4 py-3 text-pos-muted">
                        <span className="rounded border border-pos-border bg-ivory px-2 py-0.5 text-[10px] font-medium text-pos-text">
                          {item.categoryName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-pos-text">
                        {item.quantitySold}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-pos-text">
                        ₹{Number(item.totalRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Daily Sales */}
      {activeTab === 'daily' && (
        <div className="card-print space-y-4 rounded-xl border border-pos-border bg-white p-5 shadow-subtle">
          <h3 className="text-sm font-bold text-pos-text">Daily Sales History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-pos-border bg-ivory text-xs uppercase tracking-wider text-pos-muted font-semibold">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Total Orders</th>
                  <th className="px-4 py-3 text-right">Revenue (₹)</th>
                  <th className="px-4 py-3 text-right text-emerald-800">Cash (₹)</th>
                  <th className="px-4 py-3 text-right text-forest-800">UPI (₹)</th>
                  <th className="px-4 py-3 text-right text-forest-900">Card (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pos-border">
                {dailySales.map((day) => (
                  <tr key={day.date} className="hover:bg-ivory/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-pos-text">{day.date}</td>
                    <td className="px-4 py-3 text-right text-pos-muted">{day.ordersCount}</td>
                    <td className="px-4 py-3 text-right font-bold text-pos-text">
                      ₹{Number(day.totalRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-800 font-semibold">
                      ₹{Number(day.cashTotal).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-forest-800 font-semibold">
                      ₹{Number(day.upiTotal).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-forest-900 font-semibold">
                      ₹{Number(day.cardTotal).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Monthly Sales */}
      {activeTab === 'monthly' && (
        <div className="card-print space-y-4 rounded-xl border border-pos-border bg-white p-5 shadow-subtle">
          <div className="no-print flex items-center justify-between">
            <h3 className="text-sm font-bold text-pos-text">Monthly Sales Breakdown</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-pos-muted font-medium">Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="rounded-lg border border-pos-border bg-white px-3 py-1.5 text-xs text-pos-text focus:outline-none focus:border-forest-700"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-pos-border bg-ivory text-xs uppercase tracking-wider text-pos-muted font-semibold">
                <tr>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3 text-right">Orders Count</th>
                  <th className="px-4 py-3 text-right">Total Revenue (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pos-border">
                {monthlySales.map((m) => (
                  <tr key={m.month} className="hover:bg-ivory/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-pos-text">{m.monthName}</td>
                    <td className="px-4 py-3 text-right text-pos-muted">{m.ordersCount}</td>
                    <td className="px-4 py-3 text-right font-bold text-pos-text">
                      ₹{Number(m.totalRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Loading state indicator */}
      {isLoading && (
        <div className="flex justify-center p-8">
          <LoadingSpinner size="md" />
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
