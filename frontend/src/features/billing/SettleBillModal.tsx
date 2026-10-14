import React, { useState } from 'react';
import type { BillResponse, PaymentMethod } from '../../types/billing';
import { billingService } from '../../services/billingService';
import { ThermalReceipt } from './ThermalReceipt';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface SettleBillModalProps {
  orderId: number;
  tableNumber?: string | null;
  orderNumber: string;
  initialBill?: BillResponse | null;
  onClose: () => void;
  onSettled: (bill: BillResponse) => void;
}

export const SettleBillModal: React.FC<SettleBillModalProps> = ({
  orderId,
  tableNumber,
  orderNumber,
  initialBill,
  onClose,
  onSettled,
}) => {
  const [bill, setBill] = useState<BillResponse | null>(initialBill ?? null);
  const [loading, setLoading] = useState<boolean>(!initialBill);
  const [settling, setSettling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Bill customization options
  const [discount, setDiscount] = useState<number>(initialBill?.discountAmount ?? 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Receipt printed view state
  const [showReceipt, setShowReceipt] = useState<boolean>(initialBill?.status === 'PAID');

  // Load or generate bill on mount if not provided
  React.useEffect(() => {
    if (!initialBill) {
      loadOrGenerateBill();
    }
  }, [orderId]);

  const loadOrGenerateBill = async () => {
    setLoading(true);
    setError(null);
    try {
      const generated = await billingService.generateBill(orderId, {
        discountAmount: discount,
      });
      setBill(generated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate bill';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyDiscount = async () => {
    if (!bill) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await billingService.generateBill(orderId, {
        discountAmount: Number(discount) || 0,
      });
      setBill(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update discount';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSettle = async () => {
    if (!bill) return;
    setSettling(true);
    setError(null);
    try {
      const settled = await billingService.settleBill(bill.id, {
        paymentMethod,
        amount: bill.finalAmount,
        transactionRef: transactionRef.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setBill(settled);
      setShowReceipt(true);
      onSettled(settled);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Payment settlement failed';
      setError(msg);
    } finally {
      setSettling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-pos-border bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* If settled, display the Thermal Receipt directly with Print button */}
        {showReceipt && bill ? (
          <ThermalReceipt bill={bill} onClose={onClose} onPrint={() => window.print()} />
        ) : (
          <div>
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-pos-border pb-4">
              <div>
                <h3 className="text-lg font-bold text-pos-text">Bill & Settle Payment</h3>
                <p className="text-xs text-pos-muted mt-0.5">
                  {tableNumber ? `Table ${tableNumber}` : 'Parcel'} &bull; Order #{orderNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-pos-muted hover:bg-forest-50 hover:text-pos-text transition-colors"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 font-medium">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : bill ? (
              <div className="mt-5 space-y-5">
                {/* Item Summary */}
                <div className="rounded-xl border border-pos-border bg-ivory/40 p-4 space-y-2">
                  <div className="flex justify-between text-xs text-pos-muted pb-2 border-b border-pos-border font-semibold uppercase tracking-wider">
                    <span>Ordered Item</span>
                    <span>Subtotal</span>
                  </div>
                  <div className="max-h-36 overflow-y-auto divide-y divide-pos-border space-y-1">
                    {bill.items?.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs py-1.5">
                        <span className="text-pos-text font-medium">
                          {item.itemName} <span className="text-terracotta font-bold">×{item.quantity}</span>
                        </span>
                        <span className="font-semibold text-pos-text">₹{item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calculation & Optional Discount */}
                <div className="rounded-xl border border-pos-border bg-ivory/50 p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-pos-muted font-medium">Subtotal:</span>
                    <span className="font-semibold text-pos-text">₹{bill.subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-pos-muted font-medium">Discount (₹):</span>
                    <input
                      type="number"
                      min="0"
                      max={bill.subtotal}
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-24 rounded-md border border-pos-border bg-white px-2 py-1 text-xs text-pos-text focus:outline-none focus:border-forest-700"
                    />
                    <button
                      type="button"
                      onClick={handleApplyDiscount}
                      className="rounded-md border border-pos-border bg-white px-2.5 py-1 text-xs font-semibold text-pos-text hover:bg-forest-50 transition-colors"
                    >
                      Apply
                    </button>
                  </div>

                  <div className="flex justify-between text-base font-bold border-t border-pos-border pt-2 text-terracotta">
                    <span>Payable Total:</span>
                    <span>₹{bill.finalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-pos-muted mb-2">
                    Select Payment Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: 'CASH', label: 'Cash', icon: '💵' },
                        { id: 'UPI', label: 'UPI / QR', icon: '📱' },
                        { id: 'CARD', label: 'Card', icon: '💳' },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`flex flex-col items-center justify-center rounded-xl p-3 border text-xs font-semibold transition-all ${
                          paymentMethod === m.id
                            ? 'border-terracotta bg-terracotta-50 text-terracotta-800 shadow-xs ring-1 ring-terracotta'
                            : 'border-pos-border bg-white hover:bg-ivory text-pos-text'
                        }`}
                      >
                        <span className="text-xl mb-1">{m.icon}</span>
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Details (UPI Ref / Notes) */}
                {paymentMethod === 'UPI' && (
                  <div>
                    <label className="block text-xs font-semibold text-pos-text mb-1">
                      UPI Ref / UTR No. (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 429381749182"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      className="w-full rounded-lg border border-pos-border bg-white px-3 py-2 text-xs text-pos-text focus:outline-none focus:border-forest-700"
                    />
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    placeholder="Bill note (e.g. Customer split bill, discount approved)..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-lg border border-pos-border bg-white px-3 py-2 text-xs text-pos-text placeholder-pos-muted/60 focus:outline-none focus:border-forest-700"
                  />
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={settling}
                    onClick={handleSettle}
                    className="w-full rounded-xl bg-terracotta py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-terracotta-600 focus:outline-none focus:ring-2 focus:ring-terracotta disabled:opacity-60"
                  >
                    {settling ? (
                      <span className="flex items-center justify-center gap-2">
                        <LoadingSpinner size="sm" color="white" />
                        Settling Bill...
                      </span>
                    ) : (
                      `Complete Payment & Print Bill (₹${bill.finalAmount.toFixed(0)})`
                    )}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
