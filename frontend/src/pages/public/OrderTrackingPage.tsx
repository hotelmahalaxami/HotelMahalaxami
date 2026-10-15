import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import publicOrderService from '../../services/publicOrderService';
import type { PublicOrderTrackingResponse } from '../../types/publicOrder';
import { RESTAURANT_CONFIG } from '../../config/restaurantConfig';

export const OrderTrackingPage: React.FC = () => {
  const { trackingToken } = useParams<{ trackingToken: string }>();

  const [order, setOrder] = useState<PublicOrderTrackingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadOrderStatus = useCallback(async (isSilent = false) => {
    if (!trackingToken) {
      setError('No tracking token provided in link.');
      setLoading(false);
      return;
    }

    try {
      if (!isSilent) setLoading(true);
      else setIsRefreshing(true);
      setError(null);

      const data = await publicOrderService.trackOrder(trackingToken);
      setOrder(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to find or track this order.';
      setError(msg);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [trackingToken]);

  useEffect(() => {
    loadOrderStatus();
    if (import.meta.env.MODE === 'test') return;

    // Auto-refresh every 20 seconds while order is pending or open
    const interval = setInterval(() => {
      loadOrderStatus(true);
    }, 20000);

    return () => clearInterval(interval);
  }, [loadOrderStatus]);

  if (loading) {
    return (
      <div className="py-20 max-w-xl mx-auto px-4 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-forest-800 border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="font-serif text-xl font-bold text-forest-950">Locating Your Order...</h2>
        <p className="text-xs text-stone-500">Checking restaurant order management desk.</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-16 max-w-lg mx-auto px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">Order Not Found</h2>
          <p className="text-sm text-stone-600 mt-1.5">{error || 'Invalid or expired tracking token.'}</p>
        </div>
        <div className="flex justify-center gap-3">
          <Link
            to="/menu"
            className="px-5 py-2.5 bg-forest-900 text-white rounded-xl text-sm font-medium hover:bg-forest-800 transition-colors"
          >
            Explore Menu
          </Link>
          <Link
            to="/contact"
            className="px-5 py-2.5 border border-stone-300 text-stone-700 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors"
          >
            Contact Help Desk
          </Link>
        </div>
      </div>
    );
  }

  const isRejected = order.acceptanceStatus === 'REJECTED' || order.status === 'CANCELLED';
  const isAccepted = order.acceptanceStatus === 'ACCEPTED';
  const isCompleted = order.status === 'COMPLETED';

  return (
    <div className="py-8 sm:py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-pos-border">
        <div>
          <span className="text-xs font-semibold tracking-widest text-terracotta uppercase">
            Live Takeaway Tracker
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest-950 mt-0.5">
            Order #{order.orderNumber}
          </h1>
          <p className="text-xs text-pos-muted mt-1">
            Submitted at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadOrderStatus(false)}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-pos-border bg-white text-forest-900 text-xs font-medium hover:bg-forest-50 transition-colors shadow-2xs self-start sm:self-auto disabled:opacity-60"
        >
          <svg className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Status'}</span>
        </button>
      </div>

      {/* Status Progress Stepper */}
      <div className="bg-white rounded-2xl border border-pos-border p-6 sm:p-8 shadow-subtle">
        {isRejected ? (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-base">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Order Not Accepted / Cancelled</span>
            </div>
            <p className="text-xs text-red-700 leading-relaxed">
              Unfortunately, the restaurant could not accept this order at this time (the kitchen may be closing or certain items ran out). Please contact our counter desk directly.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Step 1: Received */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-forest-50/70 border border-forest-200">
                <div className="w-8 h-8 rounded-full bg-forest-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  &#10003;
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-forest-950 uppercase tracking-wide">1. Order Placed</h3>
                  <p className="text-xs text-forest-800 mt-0.5">Received by Mahalaxmi system</p>
                </div>
              </div>

              {/* Step 2: Staff Confirmation */}
              <div className={`flex items-start gap-3 p-3.5 rounded-xl border ${
                isAccepted || isCompleted
                  ? 'bg-forest-50/70 border-forest-200'
                  : 'bg-amber-50/70 border-amber-200'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isAccepted || isCompleted
                    ? 'bg-forest-900 text-white'
                    : 'bg-amber-500 text-white animate-pulse'
                }`}>
                  {isAccepted || isCompleted ? '✓' : '2'}
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-forest-950 uppercase tracking-wide">
                    2. Kitchen Acceptance
                  </h3>
                  <p className="text-xs text-stone-600 mt-0.5">
                    {isAccepted || isCompleted ? 'Accepted by kitchen staff' : 'Awaiting staff confirmation'}
                  </p>
                </div>
              </div>

              {/* Step 3: Pickup Ready */}
              <div className={`flex items-start gap-3 p-3.5 rounded-xl border ${
                isCompleted
                  ? 'bg-emerald-50/80 border-emerald-300'
                  : isAccepted
                  ? 'bg-ivory-100 border-pos-border'
                  : 'bg-stone-50 border-stone-200 opacity-60'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isCompleted ? 'bg-emerald-700 text-white' : 'bg-stone-300 text-stone-700'
                }`}>
                  {isCompleted ? '✓' : '3'}
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-forest-950 uppercase tracking-wide">
                    3. Counter Pickup
                  </h3>
                  <p className="text-xs text-stone-600 mt-0.5">
                    {isCompleted ? 'Collected & Completed' : 'Estimated ~25 mins'}
                  </p>
                </div>
              </div>
            </div>

            {/* Banner status text */}
            <div className={`p-4 rounded-xl border text-sm flex items-center gap-3 ${
              isAccepted
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="w-2.5 h-2.5 rounded-full bg-current animate-ping" />
              <p className="font-medium text-xs sm:text-sm">
                {isAccepted
                  ? 'Order is confirmed and being prepared in the kitchen! Please proceed to the Ispurli pickup counter.'
                  : 'Your order is currently in queue. Our restaurant staff is reviewing it shortly.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Order Item Details & Pickup Location Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Itemized Bill */}
        <div className="bg-white rounded-2xl border border-pos-border p-6 shadow-subtle space-y-4">
          <h2 className="font-serif text-lg font-bold text-forest-950 border-b border-pos-border pb-2.5">
            Ordered Items
          </h2>

          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-stone-800 font-medium">
                  {item.itemName} <span className="text-xs text-stone-500 font-sans">&times; {item.quantity}</span>
                </span>
                <span className="font-semibold text-stone-900">
                  ₹{item.subtotal.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {order.pickupNotes && (
            <div className="pt-3 border-t border-pos-border text-xs text-stone-600">
              <span className="font-semibold">Notes:</span> {order.pickupNotes}
            </div>
          )}

          <div className="pt-4 border-t border-pos-border flex justify-between items-center">
            <span className="font-serif font-bold text-base text-stone-900">Total Due at Pickup</span>
            <span className="font-bold text-xl text-forest-900">₹{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Pickup Counter Location */}
        <div className="bg-white rounded-2xl border border-pos-border p-6 shadow-subtle space-y-4">
          <h2 className="font-serif text-lg font-bold text-forest-950 border-b border-pos-border pb-2.5">
            Pickup Desk &amp; Payment
          </h2>

          <div className="space-y-3 text-xs text-stone-700 leading-relaxed">
            <p className="font-semibold text-stone-900 text-sm">
              {RESTAURANT_CONFIG.name}
            </p>
            <p>
              {RESTAURANT_CONFIG.location.fullAddress}
            </p>
            <p className="text-stone-500">
              Landmark: {RESTAURANT_CONFIG.location.landmark}
            </p>
            <p className="font-medium text-forest-900">
              Counter Desk: {RESTAURANT_CONFIG.contact.phoneDisplay}
            </p>
          </div>

          <div className="pt-4 border-t border-pos-border flex gap-3">
            <a
              href={RESTAURANT_CONFIG.location.googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-4 rounded-xl bg-forest-900 text-white text-xs font-semibold hover:bg-forest-800 transition-colors text-center shadow-2xs"
            >
              Get Directions
            </a>
            <Link
              to="/menu"
              className="py-2.5 px-4 rounded-xl border border-pos-border text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors text-center"
            >
              Browse Menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
