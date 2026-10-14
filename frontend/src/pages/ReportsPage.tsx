import React, { useEffect, useState } from 'react';
import { reportService } from '../services/reportService';
import type {
  DailySalesDto,
  DashboardSummaryResponse,
  ItemSalesDto,
  MonthlySalesDto,
} from '../types/reports';

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
            color: black !important;
          }
          aside, nav, header, button, input, select, .no-print {
            display: none !important;
          }
          .printable-report {
            display: block !important;
            padding: 20px;
          }
          .card-print {
            border: 1px solid #ddd !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th, td {
            border: 1px solid #ccc !important;
            padding: 8px !important;
            color: black !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="no-print flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sales & Operations Reports</h2>
          <p className="text-sm text-gray-400 mt-1">
            Real-time sales analytics, payment breakdowns, and item velocity
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker */}
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-surface-light px-3 py-1.5 text-xs">
            <span className="text-gray-400">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none"
            />
          </div>

          {/* Refresh */}
          <button
            onClick={loadReportData}
            disabled={isLoading}
            className="rounded-lg border border-white/10 bg-surface-card px-3 py-2 text-xs font-semibold text-gray-200 hover:bg-white/5 transition-colors disabled:opacity-50"
            title="Reload report data"
          >
            {isLoading ? '↻ Loading...' : '↻ Refresh'}
          </button>

          {/* Print Report */}
          <button
            onClick={handlePrint}
            className="rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-colors flex items-center gap-1.5"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Report
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center justify-between">
          <span>⚠ {error}</span>
          <button onClick={() => setError(null)} className="text-red-300 hover:text-white">✕</button>
        </div>
      )}

      {/* TODAY Executive Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Orders */}
        <div className="card-print rounded-xl border border-white/5 bg-surface-light p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Orders</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {summary ? summary.totalOrdersCount : '0'}
          </p>
          <span className="text-[11px] text-gray-400">Total settled</span>
        </div>

        {/* Total Sales */}
        <div className="card-print rounded-xl border border-white/5 bg-surface-light p-4">
          <p className="text-xs uppercase tracking-wide text-brand-400">Total Sales</p>
          <p className="mt-1 text-2xl font-bold text-brand-400">
            ₹{summary ? Number(summary.totalRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
          </p>
          <span className="text-[11px] text-gray-400">Gross revenue</span>
        </div>

        {/* Cash Sales */}
        <div className="card-print rounded-xl border border-white/5 bg-surface-light p-4">
          <p className="text-xs uppercase tracking-wide text-emerald-400">Cash</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">
            ₹{summary ? Number(summary.cashTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
          </p>
          <span className="text-[11px] text-gray-400">Physical cash</span>
        </div>

        {/* UPI Sales */}
        <div className="card-print rounded-xl border border-white/5 bg-surface-light p-4">
          <p className="text-xs uppercase tracking-wide text-cyan-400">UPI</p>
          <p className="mt-1 text-2xl font-bold text-cyan-400">
            ₹{summary ? Number(summary.upiTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
          </p>
          <span className="text-[11px] text-gray-400">QR / GPay / PhonePe</span>
        </div>

        {/* Card Sales */}
        <div className="card-print rounded-xl border border-white/5 bg-surface-light p-4">
          <p className="text-xs uppercase tracking-wide text-purple-400">Card</p>
          <p className="mt-1 text-2xl font-bold text-purple-400">
            ₹{summary ? Number(summary.cardTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
          </p>
          <span className="text-[11px] text-gray-400">POS Machine</span>
        </div>

        {/* Cancelled / Open */}
        <div className="card-print rounded-xl border border-white/5 bg-surface-light p-4">
          <p className="text-xs uppercase tracking-wide text-red-400">Cancelled</p>
          <p className="mt-1 text-2xl font-bold text-red-400">
            {summary ? summary.cancelledOrdersCount : '0'}
          </p>
          <span className="text-[11px] text-gray-400">
            {summary ? `${summary.openOrdersCount} open orders` : ''}
          </span>
        </div>
      </div>

      {/* Top Item Highlight Banner */}
      {summary?.topItem ? (
        <div className="card-print rounded-xl border border-brand-500/30 bg-gradient-to-r from-brand-500/10 via-surface-card to-surface-light p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400 text-2xl">
              🏆
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">Top Selling Item</span>
              <h3 className="text-xl font-bold text-white mt-0.5">
                {summary.topItem.itemName}
              </h3>
              <p className="text-xs text-gray-400">Category: {summary.topItem.categoryName}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-left sm:text-right">
              <p className="text-xs text-gray-400">Quantity Sold</p>
              <p className="text-xl font-bold text-white">{summary.topItem.quantitySold} units</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-gray-400">Total Revenue</p>
              <p className="text-xl font-bold text-brand-400">
                ₹{Number(summary.topItem.totalRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-print rounded-xl border border-white/5 bg-surface-light p-5 text-center text-sm text-gray-400">
          No orders settled yet for {selectedDate}.
        </div>
      )}

      {/* Tabs */}
      <div className="no-print border-b border-white/10 flex items-center gap-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'overview'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Leaderboard & Trend
        </button>
        <button
          onClick={() => setActiveTab('items')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'items'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Item-Wise Sales ({itemSales.length})
        </button>
        <button
          onClick={() => setActiveTab('daily')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'daily'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Daily Sales ({dailySales.length} Days)
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'monthly'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Monthly Sales ({selectedYear})
        </button>
      </div>

      {/* TAB 1: Overview & Top Items */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 5 Items Leaderboard */}
          <div className="card-print rounded-xl border border-white/5 bg-surface-light p-6">
            <h3 className="text-base font-bold text-white mb-4">Top 5 Items by Volume</h3>
            {summary?.topSellingItems && summary.topSellingItems.length > 0 ? (
              <div className="space-y-4">
                {summary.topSellingItems.map((item, idx) => {
                  const maxQty = summary.topSellingItems[0].quantitySold || 1;
                  const percent = Math.min(100, Math.round((item.quantitySold / maxQty) * 100));
                  return (
                    <div key={item.menuItemId} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-brand-400">#{idx + 1}</span>
                          <span className="font-medium text-white">{item.itemName}</span>
                          <span className="text-xs text-gray-500">({item.categoryName})</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-white">{item.quantitySold} sold</span>
                          <span className="ml-2 text-xs text-gray-400">
                            (₹{Number(item.totalRevenue).toFixed(2)})
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-brand-500 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No item sales recorded today.</p>
            )}
          </div>

          {/* Recent 7-Day Trend Preview */}
          <div className="card-print rounded-xl border border-white/5 bg-surface-light p-6">
            <h3 className="text-base font-bold text-white mb-4">Last 7 Days Sales Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="border-b border-white/5 bg-white/[0.02] text-gray-400">
                  <tr>
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5 text-right">Orders</th>
                    <th className="py-2.5 text-right">Revenue (₹)</th>
                    <th className="py-2.5 text-right">Cash</th>
                    <th className="py-2.5 text-right">UPI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {summary?.recentDailySales?.map((day) => (
                    <tr key={day.date} className="hover:bg-white/[0.02]">
                      <td className="py-2 font-medium text-white">{day.date}</td>
                      <td className="py-2 text-right">{day.ordersCount}</td>
                      <td className="py-2 text-right font-semibold text-brand-400">
                        ₹{Number(day.totalRevenue).toFixed(2)}
                      </td>
                      <td className="py-2 text-right text-emerald-400">₹{Number(day.cashTotal).toFixed(0)}</td>
                      <td className="py-2 text-right text-cyan-400">₹{Number(day.upiTotal).toFixed(0)}</td>
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
        <div className="card-print space-y-4 rounded-xl border border-white/5 bg-surface-light p-6">
          <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-base font-bold text-white">Item-Wise Sales Breakdown (All Time / Period)</h3>
            <input
              type="text"
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              placeholder="Filter by item or category..."
              className="w-full sm:w-64 rounded-lg border border-white/10 bg-surface px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="border-b border-white/5 bg-white/[0.02] text-xs uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="px-4 py-3">Menu Item</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Quantity Sold</th>
                  <th className="px-4 py-3 text-right">Total Revenue (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      No matching sales items found.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.menuItemId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{item.itemName}</td>
                      <td className="px-4 py-3 text-gray-400">
                        <span className="rounded bg-white/5 px-2 py-0.5 text-xs">
                          {item.categoryName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-white">
                        {item.quantitySold}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-brand-400">
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
        <div className="card-print space-y-4 rounded-xl border border-white/5 bg-surface-light p-6">
          <h3 className="text-base font-bold text-white">Daily Sales History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="border-b border-white/5 bg-white/[0.02] text-xs uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Total Orders</th>
                  <th className="px-4 py-3 text-right">Revenue (₹)</th>
                  <th className="px-4 py-3 text-right text-emerald-400">Cash (₹)</th>
                  <th className="px-4 py-3 text-right text-cyan-400">UPI (₹)</th>
                  <th className="px-4 py-3 text-right text-purple-400">Card (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {dailySales.map((day) => (
                  <tr key={day.date} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{day.date}</td>
                    <td className="px-4 py-3 text-right text-gray-300">{day.ordersCount}</td>
                    <td className="px-4 py-3 text-right font-bold text-brand-400">
                      ₹{Number(day.totalRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-400">
                      ₹{Number(day.cashTotal).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-cyan-400">
                      ₹{Number(day.upiTotal).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-purple-400">
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
        <div className="card-print space-y-4 rounded-xl border border-white/5 bg-surface-light p-6">
          <div className="no-print flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Monthly Sales Breakdown</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="rounded-lg border border-white/10 bg-surface px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y} className="bg-surface">
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="border-b border-white/5 bg-white/[0.02] text-xs uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3 text-right">Orders Count</th>
                  <th className="px-4 py-3 text-right">Total Revenue (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {monthlySales.map((m) => (
                  <tr key={m.month} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{m.monthName}</td>
                    <td className="px-4 py-3 text-right text-gray-300">{m.ordersCount}</td>
                    <td className="px-4 py-3 text-right font-bold text-brand-400">
                      ₹{Number(m.totalRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
