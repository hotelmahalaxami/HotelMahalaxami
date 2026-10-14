import React, { useEffect, useMemo, useState } from 'react';
import type { BillResponse, BillStatus } from '../types/billing';
import { billingService } from '../services/billingService';
import { ThermalReceipt } from '../features/billing/ThermalReceipt';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';

const formatInr = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

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
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-pos-border rounded-xl p-5 shadow-subtle">
        <div>
          <h2 className="text-xl font-bold text-pos-text tracking-tight">Billing & Invoices</h2>
          <p className="text-xs text-pos-muted mt-0.5">
            Audit settled registers, manage receipts, and print 80mm thermal bills
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadBills}
            leftIcon={
              <svg className="h-3.5 w-3.5 text-forest-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
          >
            Refresh Register
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-pos-border bg-white p-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-pos-muted">Total Settled</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest-50 text-forest-700">
              ₹
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-pos-text">{formatInr(summary.totalRevenue)}</p>
          <p className="mt-0.5 text-xs text-pos-muted">{summary.paidCount} bills settled</p>
        </div>

        <div className="rounded-xl border border-pos-border bg-white p-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Cash Register</span>
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-800">{formatInr(summary.cashTotal)}</p>
          <p className="mt-0.5 text-xs text-pos-muted">Drawer cash payments</p>
        </div>

        <div className="rounded-xl border border-pos-border bg-white p-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-terracotta-800">UPI / QR Received</span>
            <span className="h-2 w-2 rounded-full bg-terracotta" />
          </div>
          <p className="mt-2 text-2xl font-bold text-terracotta-800">{formatInr(summary.upiTotal)}</p>
          <p className="mt-0.5 text-xs text-pos-muted">QR code & online transfers</p>
        </div>

        <div className="rounded-xl border border-pos-border bg-white p-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-forest-800">Card Swiped</span>
            <span className="h-2 w-2 rounded-full bg-forest-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-forest-900">{formatInr(summary.cardTotal)}</p>
          <p className="mt-0.5 text-xs text-pos-muted">POS card terminal</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-pos-border bg-white p-4 shadow-subtle">
        {/* Search Input */}
        <div className="w-full sm:w-72 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-pos-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search bill number, table, order..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-pos-border bg-ivory/50 pl-9 pr-3 py-1.5 text-xs text-pos-text placeholder-pos-muted/60 focus:outline-none focus:border-forest-700 focus:bg-white"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5">
          {(['ALL', 'PAID', 'UNPAID'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-forest text-white shadow-xs'
                  : 'bg-ivory text-pos-muted hover:bg-forest-50 hover:text-pos-text'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800">
          {error}
        </div>
      )}

      {/* Bills Table */}
      <div className="rounded-xl border border-pos-border bg-white shadow-subtle overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No bills found"
              description="Settled invoices and payment records will appear here as orders are billed."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-pos-border bg-ivory text-xs uppercase tracking-wider text-pos-muted font-semibold">
                <tr>
                  <th className="px-4 py-3.5">Bill Number</th>
                  <th className="px-4 py-3.5">Table / Type</th>
                  <th className="px-4 py-3.5">Time</th>
                  <th className="px-4 py-3.5">Subtotal</th>
                  <th className="px-4 py-3.5">Discount</th>
                  <th className="px-4 py-3.5">Total Amount</th>
                  <th className="px-4 py-3.5">Payment</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pos-border">
                {filteredBills.map((b) => {
                  const payment = b.payments?.[0];
                  return (
                    <tr key={b.id} className="hover:bg-ivory/40 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-semibold text-pos-text">
                        {b.billNumber}
                      </td>
                      <td className="px-4 py-3.5 font-medium">
                        {b.orderType === 'PARCEL' ? (
                          <span className="rounded bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-[10px] font-bold">
                            PARCEL
                          </span>
                        ) : (
                          <span className="rounded bg-forest-50 text-forest-800 border border-forest-200 px-2 py-0.5 text-[10px] font-bold">
                            {b.tableNumber ? `Table ${b.tableNumber}` : 'Dine-In'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-pos-muted">
                        {new Date(b.paidAt ?? b.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3.5 text-pos-muted">₹{b.subtotal.toFixed(2)}</td>
                      <td className="px-4 py-3.5">
                        {b.discountAmount > 0 ? (
                          <span className="text-emerald-700 font-semibold">-₹{b.discountAmount.toFixed(2)}</span>
                        ) : (
                          <span className="text-pos-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-pos-text text-sm">
                        ₹{b.finalAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5">
                        {payment ? (
                          <span className="rounded-md border border-pos-border bg-ivory px-2 py-0.5 text-[10px] font-bold uppercase text-forest-800">
                            {payment.paymentMethod}
                          </span>
                        ) : (
                          <span className="text-pos-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          variant={b.status === 'PAID' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {b.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedBillForPrint(b)}
                          leftIcon={
                            <svg className="h-3.5 w-3.5 text-pos-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                          }
                        >
                          Print
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

      {/* Modal for Viewing/Printing Thermal Receipt */}
      {selectedBillForPrint && (
        <Modal
          isOpen={Boolean(selectedBillForPrint)}
          onClose={() => setSelectedBillForPrint(null)}
          title="Print Receipt"
          description="Standard 80mm thermal receipt formatted for restaurant printer"
          maxWidth="md"
        >
          <ThermalReceipt
            bill={selectedBillForPrint}
            onClose={() => setSelectedBillForPrint(null)}
            onPrint={() => window.print()}
          />
        </Modal>
      )}
    </div>
  );
};

export default BillingHistoryPage;
