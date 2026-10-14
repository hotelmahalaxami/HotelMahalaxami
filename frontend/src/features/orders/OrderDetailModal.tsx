import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Order } from '../../types/pos';
import type { BillResponse } from '../../types/billing';
import { orderService } from '../../services/orderService';
import { billingService } from '../../services/billingService';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { SettleBillModal } from '../billing/SettleBillModal';
import { ThermalReceipt } from '../billing/ThermalReceipt';

interface OrderDetailModalProps {
  orderId: number | null;
  orderNumber?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated?: () => void;
}

const formatInr = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  orderId,
  orderNumber,
  isOpen,
  onClose,
  onOrderUpdated,
}) => {
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [bill, setBill] = useState<BillResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sub-modals
  const [showSettleModal, setShowSettleModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || (!orderId && !orderNumber)) {
      setOrder(null);
      setBill(null);
      return;
    }

    const loadDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        let fetchedOrder: Order;
        if (orderId) {
          fetchedOrder = await orderService.getOrderById(orderId);
        } else if (orderNumber) {
          fetchedOrder = await orderService.getOrderByNumber(orderNumber);
        } else {
          return;
        }

        setOrder(fetchedOrder);

        // Attempt to fetch bill for this order
        try {
          const fetchedBill = await billingService.getBillByOrderId(fetchedOrder.id);
          setBill(fetchedBill);
        } catch {
          // Order has not been billed yet
          setBill(null);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load order details';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [isOpen, orderId, orderNumber]);

  const handleEditInPos = () => {
    if (!order) return;
    onClose();
    navigate(`/orders/create?editOrderId=${order.id}`);
  };

  const handleBillSettled = (settledBill: BillResponse) => {
    setBill(settledBill);
    setShowSettleModal(false);
    if (onOrderUpdated) onOrderUpdated();
    // Reload updated order status
    if (order) {
      orderService.getOrderById(order.id).then(setOrder).catch(() => {});
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !showSettleModal && !showPrintModal}
        onClose={onClose}
        title={order ? `Order ${order.orderNumber}` : 'Order Details'}
        description={order ? `Created on ${new Date(order.createdAt).toLocaleString('en-IN')}` : ''}
        maxWidth="2xl"
      >
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : error || !order ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
            {error || 'Order not found'}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Status & Metadata Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-pos-border bg-ivory/50 p-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-pos-muted">Table / Type:</span>
                  <span className="font-bold text-pos-text text-sm">
                    {order.orderType === 'DINE_IN'
                      ? order.tableNumber ? `Table ${order.tableNumber}` : 'Dine-In'
                      : 'Parcel / Takeaway'}
                  </span>
                </div>
                {order.createdByUsername && (
                  <p className="text-xs text-pos-muted">
                    Taken by: <span className="font-medium text-pos-text">{order.createdByUsername}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-[10px] uppercase font-semibold text-pos-muted">Order Status</p>
                  <Badge
                    variant={
                      order.status === 'COMPLETED'
                        ? 'success'
                        : order.status === 'READY_FOR_BILL'
                        ? 'warning'
                        : order.status === 'CANCELLED'
                        ? 'danger'
                        : 'forest'
                    }
                    size="sm"
                  >
                    {order.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-semibold text-pos-muted">Billing Status</p>
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
                </div>
              </div>
            </div>

            {/* Order Items Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-pos-muted mb-2">
                Ordered Items ({order.items.length})
              </h4>
              <div className="rounded-xl border border-pos-border bg-white overflow-hidden shadow-subtle">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-pos-border bg-ivory text-pos-muted uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">Item</th>
                      <th className="px-4 py-2.5 text-center">Qty</th>
                      <th className="px-4 py-2.5 text-right">Unit Price</th>
                      <th className="px-4 py-2.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pos-border">
                    {order.items.map((item) => (
                      <tr key={item.id} className="hover:bg-ivory/30">
                        <td className="px-4 py-2.5 font-medium text-pos-text">
                          {item.itemName}
                          {item.status === 'CANCELLED' && (
                            <span className="ml-2 text-[10px] text-red-600 font-bold">(Cancelled)</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-center font-semibold text-pos-text">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-2.5 text-right text-pos-muted">
                          {formatInr(item.unitPrice)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-pos-text">
                          {formatInr(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes & Summary Calculation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-pos-border bg-ivory/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-pos-muted">Customer Notes</p>
                <p className="mt-1 text-xs text-pos-text italic">
                  {order.notes || 'No special kitchen instructions.'}
                </p>
              </div>

              <div className="rounded-xl border border-pos-border bg-ivory/50 p-4 space-y-2">
                <div className="flex justify-between text-xs text-pos-muted">
                  <span>Order Items Total:</span>
                  <span>{formatInr(order.totalAmount)}</span>
                </div>
                {bill && bill.discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-700 font-semibold">
                    <span>Discount Applied:</span>
                    <span>- {formatInr(bill.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-pos-text border-t border-pos-border pt-2">
                  <span>Final Bill Amount:</span>
                  <span className="text-forest-900">
                    {formatInr(bill ? bill.finalAmount : order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Audit (if Paid) */}
            {bill && bill.status === 'PAID' && bill.payments && bill.payments.length > 0 && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Payment Settled
                  </span>
                  <span className="text-xs font-medium text-emerald-700">
                    {bill.paidAt ? new Date(bill.paidAt).toLocaleString('en-IN') : 'Completed'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-pos-muted text-[10px] block">Method:</span>
                    <span className="font-bold text-emerald-900">{bill.payments[0].paymentMethod}</span>
                  </div>
                  <div>
                    <span className="text-pos-muted text-[10px] block">Amount Paid:</span>
                    <span className="font-bold text-emerald-900">{formatInr(bill.payments[0].amount)}</span>
                  </div>
                  <div>
                    <span className="text-pos-muted text-[10px] block">Reference:</span>
                    <span className="font-mono text-emerald-900 text-[11px]">
                      {bill.payments[0].transactionRef || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Context-Sensitive Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-pos-border pt-4">
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>

              <div className="flex items-center gap-2">
                {/* 1. Open order: can edit in POS */}
                {order.status === 'OPEN' && (
                  <Button variant="outline" size="sm" onClick={handleEditInPos}>
                    Edit in POS
                  </Button>
                )}

                {/* 2. Unsettled order (OPEN or READY_FOR_BILL): can settle */}
                {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowSettleModal(true)}
                  >
                    Proceed to Settle Bill
                  </Button>
                )}

                {/* 3. Paid order: can reprint thermal receipt */}
                {bill && bill.status === 'PAID' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowPrintModal(true)}
                    leftIcon={
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                    }
                  >
                    Reprint Receipt
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Settle Bill Modal */}
      {showSettleModal && order && (
        <SettleBillModal
          orderId={order.id}
          orderNumber={order.orderNumber}
          tableNumber={order.tableNumber}
          initialBill={bill}
          onClose={() => setShowSettleModal(false)}
          onSettled={handleBillSettled}
        />
      )}

      {/* Reprint Thermal Receipt Modal */}
      {showPrintModal && bill && (
        <Modal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          title="Reprint Thermal Receipt"
          description="80mm thermal receipt format"
          maxWidth="md"
        >
          <ThermalReceipt
            bill={bill}
            onClose={() => setShowPrintModal(false)}
            onPrint={() => window.print()}
          />
        </Modal>
      )}
    </>
  );
};
