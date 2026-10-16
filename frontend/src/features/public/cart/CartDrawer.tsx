import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    totalItems,
    subtotal,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const navigate = useNavigate();

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="cart-heading">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
        data-testid="cart-backdrop"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-stone-50 shadow-2xl flex flex-col border-l border-amber-900/10">
          {/* Header */}
          <div className="p-5 bg-forest-950 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-forest-800 flex items-center justify-center text-terracotta-300 shadow-xs">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h2 id="cart-heading" className="text-lg font-serif font-bold text-white tracking-wide">
                  Takeaway Cart
                </h2>
                <p className="text-xs text-forest-200">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} selected
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeCart}
              className="p-2 text-forest-200 hover:text-white rounded-lg hover:bg-forest-800 transition-colors"
              aria-label="Close cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-20 h-20 rounded-full bg-forest-50 text-forest-800 flex items-center justify-center border border-forest-200">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-stone-800">Your cart is empty</h3>
                  <p className="text-sm text-stone-500 mt-1 max-w-xs">
                    Explore our Kolhapuri specialties and tandoor delicacies to begin your order.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    closeCart();
                    navigate('/menu');
                  }}
                  className="mt-2 px-6 py-2.5 bg-forest-900 text-white rounded-lg hover:bg-forest-800 text-sm font-medium transition-colors shadow-sm"
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map(({ menuItem, quantity }) => (
                  <div
                    key={menuItem.id}
                    className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2">
                        {/* Veg / Non-Veg Indicator */}
                        <span
                          className={`inline-flex items-center justify-center w-4 h-4 border rounded-sm mt-0.5 flex-shrink-0 ${
                            menuItem.isVeg
                              ? 'border-emerald-600 bg-white'
                              : 'border-amber-800 bg-white'
                          }`}
                          title={menuItem.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              menuItem.isVeg ? 'bg-emerald-600' : 'bg-amber-800'
                            }`}
                          />
                        </span>
                        <div>
                          <h4 className="text-sm font-semibold text-stone-800">{menuItem.name}</h4>
                          <span className="text-xs text-stone-500">{menuItem.categoryName}</span>
                          <div className="text-xs font-medium text-stone-700 mt-1">
                            ₹{menuItem.price.toFixed(2)} each
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(menuItem.id)}
                        className="text-stone-400 hover:text-red-600 p-1 rounded transition-colors"
                        title="Remove item"
                        aria-label={`Remove ${menuItem.name}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Stepper and item total */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                      <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(menuItem.id, quantity - 1)}
                          className="px-2.5 py-1 text-stone-600 hover:bg-stone-200 transition-colors font-bold text-sm"
                          aria-label={`Decrease quantity of ${menuItem.name}`}
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-xs font-semibold text-stone-800 bg-white">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(menuItem.id, quantity + 1)}
                          className="px-2.5 py-1 text-stone-600 hover:bg-stone-200 transition-colors font-bold text-sm"
                          aria-label={`Increase quantity of ${menuItem.name}`}
                        >
                          +
                        </button>
                      </div>

                      <span className="font-semibold text-sm text-stone-900">
                        ₹{(menuItem.price * quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-5 bg-white border-t border-stone-200 shadow-md space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-stone-800">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>Taxes & Packaging</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                  <span className="font-serif font-semibold text-base text-stone-900">Est. Total</span>
                  <span className="font-bold text-xl text-forest-900">₹{subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-amber-50/80 border border-amber-200/60 rounded-lg p-2.5 text-xs text-amber-900 flex items-start space-x-2">
                <svg className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Takeaway pickup order. Live prices and items are re-verified by server upon submission.</span>
              </div>

              <div className="flex space-x-3 pt-1">
                <button
                  type="button"
                  onClick={clearCart}
                  className="px-4 py-3 text-xs font-semibold text-stone-600 hover:text-stone-900 border border-stone-300 rounded-xl hover:bg-stone-100 transition-colors"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleCheckoutClick}
                  className="flex-1 px-5 py-3 bg-forest-900 text-white rounded-xl hover:bg-forest-800 font-semibold text-sm transition-all shadow-md flex items-center justify-center space-x-2 active:scale-98 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
