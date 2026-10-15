import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../features/public/cart/CartContext';
import publicOrderService from '../../services/publicOrderService';
import { RESTAURANT_CONFIG } from '../../config/restaurantConfig';

function generateClientUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'web-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now();
}

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, totalItems, clearCart } = useCart();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [pickupNotes, setPickupNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Generate idempotency key once per checkout session
  const idempotencyKeyRef = useRef<string>(generateClientUuid());

  if (items.length === 0) {
    return (
      <div className="py-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="w-20 h-20 bg-ivory-200 rounded-full flex items-center justify-center mx-auto text-forest-800">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h1 className="font-serif text-3xl font-bold text-forest-950">Your Cart is Empty</h1>
        <p className="text-sm text-pos-muted max-w-md mx-auto">
          Please select your favorite Kolhapuri thalis, chicken, or vegetarian specialties before proceeding to checkout.
        </p>
        <div>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-forest-900 text-white font-medium text-sm hover:bg-forest-800 transition-colors shadow-sm"
          >
            <span>Explore Menu</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!customerName.trim() || customerName.trim().length < 2) {
      errors.customerName = 'Please enter your full name (at least 2 characters).';
    }

    const cleanPhone = customerPhone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.customerPhone = 'Please enter a valid 10-digit Indian mobile number.';
    }

    if (pickupNotes.length > 255) {
      errors.pickupNotes = 'Pickup instructions cannot exceed 255 characters.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim().replace(/\D/g, ''),
        pickupNotes: pickupNotes.trim() || undefined,
        idempotencyKey: idempotencyKeyRef.current,
        items: items.map((i) => ({
          menuItemId: i.menuItem.id,
          quantity: i.quantity,
          notes: i.notes,
        })),
      };

      const result = await publicOrderService.submitOrder(payload);

      // Successfully submitted
      clearCart();
      navigate(`/track/${result.trackingToken}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit order. Please check connection and try again.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Link to="/menu" className="inline-flex items-center gap-1.5 text-xs text-forest-700 hover:text-forest-900 font-medium mb-2">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Menu</span>
        </Link>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest-950">
          Takeaway Order Details
        </h1>
        <p className="text-sm text-pos-muted mt-1">
          Review your items and provide your contact details for counter pickup in Ispurli.
        </p>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-semibold">Order Submission Failed</p>
            <p className="mt-0.5">{submitError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Contact & Pickup Details Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-pos-border p-6 sm:p-8 shadow-subtle space-y-6">
          <div className="border-b border-pos-border pb-4">
            <h2 className="font-serif text-xl font-bold text-forest-950">
              Customer Information
            </h2>
            <p className="text-xs text-pos-muted mt-0.5">
              We need your phone number so our counter staff can verify your parcel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="customerName" className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                id="customerName"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rahul Patil"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-ivory-50/50 ${
                  formErrors.customerName ? 'border-red-400 bg-red-50/20' : 'border-pos-border'
                }`}
                disabled={isSubmitting}
              />
              {formErrors.customerName && (
                <p className="text-xs text-red-600 mt-1">{formErrors.customerName}</p>
              )}
            </div>

            <div>
              <label htmlFor="customerPhone" className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1.5">
                Mobile Number (10 Digits) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-medium text-stone-500">
                  +91
                </span>
                <input
                  id="customerPhone"
                  type="tel"
                  maxLength={10}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className={`w-full pl-12 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-ivory-50/50 ${
                    formErrors.customerPhone ? 'border-red-400 bg-red-50/20' : 'border-pos-border'
                  }`}
                  disabled={isSubmitting}
                />
              </div>
              {formErrors.customerPhone && (
                <p className="text-xs text-red-600 mt-1">{formErrors.customerPhone}</p>
              )}
            </div>

            <div>
              <label htmlFor="pickupNotes" className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1.5">
                Special Pickup Notes (Optional)
              </label>
              <textarea
                id="pickupNotes"
                rows={3}
                value={pickupNotes}
                onChange={(e) => setPickupNotes(e.target.value)}
                placeholder="e.g. Less spicy, extra tambda rassa, please pack quickly"
                maxLength={255}
                className="w-full px-4 py-2.5 rounded-xl border border-pos-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-ivory-50/50"
                disabled={isSubmitting}
              />
              <p className="text-[11px] text-stone-400 text-right mt-0.5">
                {pickupNotes.length}/255
              </p>
            </div>

            {/* Pickup Notice */}
            <div className="bg-ivory-200/60 rounded-xl p-4 border border-pos-border space-y-2 text-xs text-stone-700">
              <div className="flex items-center gap-2 font-semibold text-forest-900">
                <svg className="w-4 h-4 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>Pickup Location: {RESTAURANT_CONFIG.name}, {RESTAURANT_CONFIG.location.village}</span>
              </div>
              <p className="text-stone-600 leading-relaxed">
                Orders are freshly prepared for parcel pickup. You will pay at the counter using Cash or UPI when collecting your food.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-forest-900 text-white font-medium text-base hover:bg-forest-800 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-600 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Order...</span>
                </>
              ) : (
                <>
                  <span>Place Takeaway Order (₹{subtotal.toFixed(2)})</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Itemized Summary */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-pos-border p-6 sm:p-7 shadow-subtle space-y-6">
          <div className="border-b border-pos-border pb-3 flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-forest-950">
              Order Summary
            </h2>
            <span className="text-xs text-stone-500 font-medium">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {items.map(({ menuItem, quantity, notes }) => (
              <div key={menuItem.id} className="p-3 bg-ivory-50/60 rounded-xl border border-pos-border/70 flex flex-col space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${
                        menuItem.isVeg ? 'bg-emerald-600' : 'bg-amber-800'
                      }`}
                    />
                    <h3 className="font-medium text-stone-900 text-sm">
                      {menuItem.name}
                    </h3>
                  </div>
                  <span className="font-semibold text-stone-900 text-sm whitespace-nowrap">
                    ₹{(menuItem.price * quantity).toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-stone-500 flex justify-between pl-4.5">
                  <span>₹{menuItem.price.toFixed(2)} &times; {quantity}</span>
                  {notes && <span className="italic text-stone-600 font-sans">({notes})</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-pos-border space-y-2">
            <div className="flex justify-between text-xs text-stone-600">
              <span>Items Subtotal</span>
              <span className="font-medium text-stone-800">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-stone-500">
              <span>Packaging &amp; Container Charges</span>
              <span className="text-emerald-700 font-medium">Complimentary</span>
            </div>
            <div className="pt-3 border-t border-pos-border/70 flex justify-between items-center">
              <span className="font-serif font-bold text-base text-stone-900">Total Payable</span>
              <span className="font-bold text-xl text-forest-900">₹{subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
