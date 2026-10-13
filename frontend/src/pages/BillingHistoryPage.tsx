import React, { useEffect, useMemo, useState } from 'react';
import type { BillResponse, BillStatus } from '../types/billing';
import { billingService } from '../services/billingService';
import { ThermalReceipt } from '../features/billing/ThermalReceipt';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const BillingHistoryPage: React.FC = () => {
  const [bills, setBills] = useState<BillResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<BillStatus | 'ALL'>('ALL');
  const [selectedBillForPrint, setSelectedBillForPrint] = useState<BillResponse | null>(null);

  useEffect(() => {
    loadBills();
  }, [statusFilter]);

  const loadBills = async () => {
    setLoading(true);
    setError(null);
    try {
      const filter = statusFilter === 'ALL' ? undefined : statusFilter;
      const data = await billingService.getBills(filter);
      setBills(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load bills';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Metrics summary
  const summary = useMemo(() => {
    let totalRevenue = 0;
    let cashTotal = 0;
    let upiTotal = 0;
    let cardTotal = 0;
    let paidCount = 0;

    bills.forEach((b) => {
      if (b.status === 'PAID') {
        paidCount += 1;
        totalRevenue += b.finalAmount;
        b.payments?.forEach((p) => {
          if (p.paymentMethod === 'CASH') cashTotal += p.amount;
          if (p.paymentMethod === 'UPI') upiTotal += p.amount;
          if (p.paymentMethod === 'CARD') cardTotal += p.amount;
        });
      }
    });

    return { totalRevenue, cashTotal, upiTotal, cardTotal, paidCount };
  }, [bills]);

  // Filtered bills
  const filteredBills = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return bills;
    return bills.filter(
      (b) =>
        b.billNumber.toLowerCase().includes(q) ||
        b.orderNumber.toLowerCase().includes(q) ||
        (b.tableNumber && b.tableNumber.toLowerCase().includes(q))
    );
  }, [bills, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Billing & Payments</h2>
          <p className="text-sm text-gray-400">
            View settled transactions, daily registers, and reprint thermal receipts
          </p>
        </div>
        <button
          onClick={loadBills}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-gray-300 hover:bg-white/10"
        >
          🔄 Refresh Register
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-white/5 bg-surface-light p-4">
          <p className="text-xs uppercase tracking-wider text-gray-400">Total Settled</p>
          <p className="mt-1 text-2xl font-extrabold text-white">₹{summary.totalRevenue.toFixed(0)}</p>
          <p className="mt-0.5 text-xs text-gray-500">{summary.paidCount} bills paid</p>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-xs uppercase tracking-wider text-emerald-400">Cash Collected</p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-300">₹{summary.cashTotal.toFixed(0)}</p>
          <p className="mt-0.5 text-xs text-emerald-500">Physical drawer cash</p>
        </div>

        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
          <p className="text-xs uppercase tracking-wider text-blue-400">UPI / QR Received</p>
          <p className="mt-1 text-2xl font-extrabold text-blue-300">₹{summary.upiTotal.toFixed(0)}</p>
          <p className="mt-0.5 text-xs text-blue-500">PhonePe / GPay scanner</p>
        </div>

        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
          <p className="text-xs uppercase tracking-wider text-purple-400">Card Swiped</p>
          <p className="mt-1 text-2xl font-extrabold text-purple-300">₹{summary.cardTotal.toFixed(0)}</p>
          <p className="mt-0.5 text-xs text-purple-500">POS machine card</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-white/5 bg-surface-light p-4">
        {/* Search */}
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search bill no, table, order..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2">
          {(['ALL', 'PAID', 'UNPAID'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-brand-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Bills Table */}
      <div className="rounded-xl border border-white/5 bg-surface-light overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-gray-500">
            <p className="text-3xl mb-2">🧾</p>
            <p className="text-sm">No bills found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="border-b border-white/5 bg-surface/50 text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                <tr>
                  <th className="px-4 py-3">Bill Number</th>
                  <th className="px-4 py-3">Table / Type</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Subtotal</th>
                  <th className="px-4 py-3">Discount</th>
                  <th className="px-4 py-3">Total (₹)</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBills.map((b) => {
                  const payment = b.payments?.[0];
                  return (
                    <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-white">
                        {b.billNumber}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {b.orderType === 'PARCEL' ? (
                          <span className="rounded bg-amber-500/10 text-amber-400 px-2 py-0.5 font-bold">
                            PARCEL
                          </span>
                        ) : (
                          <span className="rounded bg-blue-500/10 text-blue-400 px-2 py-0.5 font-bold">
                            {b.tableNumber ? `Table ${b.tableNumber}` : 'Dine-In'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {new Date(b.paidAt ?? b.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3">₹{b.subtotal.toFixed(0)}</td>
                      <td className="px-4 py-3 text-green-400">
                        {b.discountAmount > 0 ? `-₹${b.discountAmount.toFixed(0)}` : '—'}
                      </td>
                      <td className="px-4 py-3 font-bold text-white text-sm">
                        ₹{b.finalAmount.toFixed(0)}
                      </td>
                      <td className="px-4 py-3">
                        {payment ? (
                          <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-300">
                            {payment.paymentMethod}
                          </span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                            b.status === 'PAID'
                              ? 'bg-green-500/15 text-green-400'
                              : 'bg-yellow-500/15 text-yellow-400'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedBillForPrint(b)}
                          className="rounded-lg bg-white/5 px-2.5 py-1 text-xs font-semibold text-gray-200 hover:bg-brand-500 hover:text-white transition-colors"
                        >
                          🖨️ Print
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Viewing/Printing Thermal Receipt */}
      {selectedBillForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface-light p-6 shadow-2xl">
            <ThermalReceipt
              bill={selectedBillForPrint}
              onClose={() => setSelectedBillForPrint(null)}
              onPrint={() => window.print()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingHistoryPage;
