import React from 'react';
import type { BillResponse } from '../../types/billing';

interface ThermalReceiptProps {
  bill: BillResponse;
  onClose?: () => void;
  onPrint?: () => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ bill, onClose, onPrint }) => {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const formattedDate = bill.paidAt
    ? new Date(bill.paidAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : new Date(bill.createdAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

  const latestPayment = bill.payments && bill.payments.length > 0 ? bill.payments[0] : null;

  return (
    <div>
      {/* Screen action bar (hidden during print) */}
      <div className="print:hidden mb-4 flex items-center justify-between gap-3 border-b border-pos-border pb-4">
        <div>
          <h3 className="text-base font-semibold text-pos-text">Receipt Preview</h3>
          <p className="text-xs text-pos-muted">Ready for 80mm thermal print or A4</p>
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg border border-pos-border px-3 py-1.5 text-xs font-medium text-pos-text hover:bg-forest-50 transition-colors"
            >
              Close
            </button>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg bg-terracotta px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-terracotta-600 focus:outline-none transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print Receipt
          </button>
        </div>
      </div>

      {/* The Printable Thermal Receipt Container */}
      <div
        id="thermal-receipt-content"
        className="mx-auto w-full max-w-[340px] rounded-lg bg-white p-5 text-black font-mono text-xs shadow-2xl print:m-0 print:w-full print:max-w-none print:p-2 print:shadow-none"
      >
        {/* Header */}
        <div className="text-center border-b border-dashed border-gray-400 pb-3 mb-3">
          <h2 className="text-base font-bold uppercase tracking-wider text-black">
            Mahalaxmi Hotel
          </h2>
          <p className="text-[11px] text-gray-600 font-sans">Kolhapur Special Taste</p>
          <p className="text-[10px] text-gray-500 font-sans mt-0.5">
            Ispurli, Maharashtra • Ph: 9876543210
          </p>
        </div>

        {/* Bill & Table Meta */}
        <div className="space-y-1 border-b border-dashed border-gray-400 pb-2 mb-2 text-[11px]">
          <div className="flex justify-between">
            <span className="font-semibold">Bill: {bill.billNumber}</span>
            <span>{bill.orderType === 'PARCEL' ? 'PARCEL' : `Table: ${bill.tableNumber ?? '-'}`}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Order: {bill.orderNumber}</span>
            <span>{formattedDate}</span>
          </div>
          {bill.createdByUsername && (
            <div className="flex justify-between text-gray-500 text-[10px]">
              <span>Staff: {bill.createdByUsername}</span>
              <span className="font-bold text-black uppercase">{bill.status}</span>
            </div>
          )}
        </div>

        {/* Items Table */}
        <table className="w-full text-left my-2 border-b border-dashed border-gray-400 pb-2">
          <thead>
            <tr className="border-b border-gray-300 text-[10px] uppercase font-bold text-gray-600">
              <th className="py-1">Item</th>
              <th className="py-1 text-center">Qty</th>
              <th className="py-1 text-right">Rate</th>
              <th className="py-1 text-right">Amt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bill.items?.map((item) => (
              <tr key={item.id} className="text-[11px]">
                <td className="py-1 pr-1 font-sans">{item.itemName}</td>
                <td className="py-1 text-center font-bold">×{item.quantity}</td>
                <td className="py-1 text-right font-sans">₹{item.unitPrice.toFixed(0)}</td>
                <td className="py-1 text-right font-bold font-sans">₹{item.subtotal.toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Calculation summary */}
        <div className="space-y-1 border-b border-dashed border-gray-400 pb-2 mb-2 text-[11px]">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span>₹{bill.subtotal.toFixed(2)}</span>
          </div>
          {bill.discountAmount > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Discount:</span>
              <span>-₹{bill.discountAmount.toFixed(2)}</span>
            </div>
          )}
          {bill.taxAmount > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Tax (GST):</span>
              <span>+₹{bill.taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between pt-1 border-t border-gray-300 text-sm font-extrabold text-black">
            <span>TOTAL:</span>
            <span>₹{bill.finalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment info */}
        {latestPayment && (
          <div className="rounded border border-gray-200 bg-gray-50 p-2 text-[10px] text-gray-700 mb-3">
            <div className="flex justify-between font-bold">
              <span>Payment Mode:</span>
              <span className="uppercase text-black">{latestPayment.paymentMethod}</span>
            </div>
            {latestPayment.transactionRef && (
              <div className="flex justify-between mt-0.5 text-gray-500 font-sans">
                <span>Ref / UTR:</span>
                <span className="font-mono">{latestPayment.transactionRef}</span>
              </div>
            )}
            <div className="flex justify-between mt-0.5">
              <span>Status:</span>
              <span className="text-green-700 font-bold uppercase">{latestPayment.status}</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-[10px] text-gray-500 font-sans space-y-0.5 pt-1">
          <p className="font-semibold text-gray-700">Thank you for dining with us!</p>
          <p>Please visit again • Mahalaxmi Hotel</p>
        </div>
      </div>
    </div>
  );
};
