import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import publicMenuService from '../../services/publicMenuService';
import type { PublicMenuCategory, PublicMenuItem, VegFilterOption } from '../../types/publicMenu';
import { useCart } from '../../features/public/cart/CartContext';
import { RESTAURANT_CONFIG } from '../../config/restaurantConfig';

export const MenuPage: React.FC = () => {
  const [categories, setCategories] = useState<PublicMenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategoryId = searchParams.get('category')
    ? parseInt(searchParams.get('category') as string, 10)
    : null;

  const [vegFilter, setVegFilter] = useState<VegFilterOption>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { items: cartItems, addItem, updateQuantity, openCart, totalItems, subtotal } = useCart();

  const loadMenu = async (force = false) => {
    try {
      setLoading(true);
      setError(null);
      const data = await publicMenuService.getPublicMenu(force);
      setCategories(data.categories || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to load menu. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const handleCategorySelect = (categoryId: number | null) => {
    if (categoryId === null) {
      searchParams.delete('category');
    } else {
      searchParams.set('category', categoryId.toString());
    }
    setSearchParams(searchParams);
  };

  // Map cart items by itemId for quick O(1) quantity check
  const cartItemMap = useMemo(() => {
    const map = new Map<number, number>();
    for (const ci of cartItems) {
      map.set(ci.menuItem.id, ci.quantity);
    }
    return map;
  }, [cartItems]);

  // Filtered categories and their items
  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return categories
      .filter((cat) => (activeCategoryId ? cat.id === activeCategoryId : true))
      .map((cat) => {
        const filteredItems = cat.items.filter((item) => {
          // Veg filter
          if (vegFilter === 'VEG' && !item.isVeg) return false;
          if (vegFilter === 'NON_VEG' && item.isVeg) return false;

          // Search query
          if (query) {
            const matchName = item.name.toLowerCase().includes(query);
            const matchCat = cat.name.toLowerCase().includes(query);
            return matchName || matchCat;
          }

          return true;
        });

        return {
          ...cat,
          items: filteredItems,
        };
      })
      .filter((cat) => cat.items.length > 0);
  }, [categories, activeCategoryId, vegFilter, searchQuery]);

  const totalFilteredDishes = useMemo(() => {
    return filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0);
  }, [filteredCategories]);

  return (
    <div className="py-8 sm:py-12 space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold tracking-widest text-terracotta uppercase font-sans">
          Kolhapuri Flavors &bull; Fresh Daily
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-forest-950">
          Restaurant Menu &amp; Takeaway
        </h1>
        <p className="text-sm sm:text-base text-pos-muted max-w-2xl mx-auto leading-relaxed">
          Order authentic Kolhapuri thalis, chicken &amp; mutton specialties, and pure-veg delights for takeaway pickup.
        </p>
      </div>

      {/* Search & Filters Controls */}
      <div className="bg-white rounded-2xl border border-pos-border p-4 sm:p-6 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          {/* Search Bar */}
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes (e.g., Thali, Sukka, Rassa)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pos-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-ivory-50/50"
              aria-label="Search dishes"
            />
            <svg
              className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>

          {/* Veg / Non-Veg Filter Buttons */}
          <div className="inline-flex rounded-xl p-1 bg-ivory-200/70 border border-pos-border text-xs font-medium w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setVegFilter('ALL')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all ${
                vegFilter === 'ALL'
                  ? 'bg-white text-forest-950 font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Dishes
            </button>
            <button
              type="button"
              onClick={() => setVegFilter('VEG')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                vegFilter === 'VEG'
                  ? 'bg-white text-emerald-800 font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-emerald-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Pure Veg</span>
            </button>
            <button
              type="button"
              onClick={() => setVegFilter('NON_VEG')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                vegFilter === 'NON_VEG'
                  ? 'bg-white text-amber-900 font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-amber-900'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-800" />
              <span>Non-Veg</span>
            </button>
          </div>
        </div>

        {/* Category Pills Bar */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => handleCategorySelect(null)}
              className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all ${
                activeCategoryId === null
                  ? 'bg-forest-900 text-white font-medium shadow-xs'
                  : 'bg-ivory-100 text-stone-600 hover:bg-ivory-200 hover:text-stone-900'
              }`}
            >
              All Categories ({categories.reduce((acc, c) => acc + c.items.length, 0)})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.id)}
                className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all ${
                  activeCategoryId === cat.id
                    ? 'bg-forest-900 text-white font-medium shadow-xs'
                    : 'bg-ivory-100 text-stone-600 hover:bg-ivory-200 hover:text-stone-900'
                }`}
              >
                {cat.name} ({cat.items.length})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        /* Loading Skeletons */
        <div className="space-y-8" data-testid="menu-loading">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-pos-border p-6 sm:p-8 animate-pulse space-y-4">
              <div className="h-6 bg-stone-200 rounded w-1/4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-stone-100 rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center space-y-4 max-w-lg mx-auto shadow-subtle">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900">Failed to Load Menu</h3>
            <p className="text-sm text-stone-600 mt-1">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => loadMenu(true)}
            className="px-5 py-2.5 rounded-lg bg-forest-900 text-white text-sm font-medium hover:bg-forest-800 transition-colors shadow-sm"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredCategories.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-pos-border p-12 text-center space-y-4 max-w-md mx-auto shadow-subtle">
          <div className="w-16 h-16 rounded-full bg-ivory-200 text-stone-500 mx-auto flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-800">No dishes match your filter</h3>
            <p className="text-xs text-stone-500 mt-1">
              Try adjusting your search query, selecting another category, or resetting veg/non-veg filters.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setVegFilter('ALL');
              handleCategorySelect(null);
            }}
            className="px-4 py-2 rounded-lg bg-forest-900 text-white text-xs font-medium hover:bg-forest-800 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Categories and Items List */
        <div className="space-y-10">
          <div className="text-xs text-stone-500 font-medium">
            Showing {totalFilteredDishes} {totalFilteredDishes === 1 ? 'dish' : 'dishes'}
          </div>

          {filteredCategories.map((category) => (
            <section
              key={category.id}
              className="bg-white rounded-2xl border border-pos-border p-5 sm:p-7 shadow-subtle space-y-6"
            >
              <div className="flex items-center justify-between border-b border-pos-border/80 pb-3">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-forest-950">
                  {category.name}
                </h2>
                <span className="text-xs text-pos-muted font-medium">
                  {category.items.length} {category.items.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.items.map((item: PublicMenuItem) => {
                  const qty = cartItemMap.get(item.id) || 0;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        item.available
                          ? 'border-pos-border hover:border-forest-300 hover:shadow-xs bg-ivory-50/30'
                          : 'border-stone-200 bg-stone-50/60 opacity-60'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Top info row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            {/* Veg / Non-Veg Indicator */}
                            <span
                              className={`inline-flex items-center justify-center w-4 h-4 border rounded-sm mt-0.5 flex-shrink-0 ${
                                item.isVeg
                                  ? 'border-emerald-600 bg-white'
                                  : 'border-amber-800 bg-white'
                              }`}
                              title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  item.isVeg ? 'bg-emerald-600' : 'bg-amber-800'
                                }`}
                              />
                            </span>
                            <div>
                              <h3 className="font-semibold text-stone-900 text-sm sm:text-base leading-snug">
                                {item.name}
                              </h3>
                              <span className="text-xs text-pos-muted">
                                {item.categoryName}
                              </span>
                            </div>
                          </div>

                          <span className="font-semibold text-forest-950 text-sm sm:text-base whitespace-nowrap bg-white px-2.5 py-1 rounded-md border border-pos-border shadow-2xs">
                            ₹{item.price.toFixed(2)}
                          </span>
                        </div>

                        {item.description && (
                          <p className="text-xs text-stone-600 line-clamp-2 pl-6.5">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Bottom action row */}
                      <div className="pt-3 mt-3 border-t border-pos-border/40 flex items-center justify-between">
                        <div>
                          {!item.available ? (
                            <span className="text-xs text-stone-500 font-medium italic">
                              Currently Unavailable
                            </span>
                          ) : (
                            <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>Fresh &amp; Available</span>
                            </span>
                          )}
                        </div>

                        {item.available && (
                          <div>
                            {qty === 0 ? (
                              <button
                                type="button"
                                onClick={() => addItem(item, 1)}
                                className="px-3.5 py-1.5 rounded-lg bg-forest-900 text-white text-xs font-semibold hover:bg-forest-800 transition-colors shadow-2xs flex items-center gap-1.5 active:scale-95"
                                aria-label={`Add ${item.name} to cart`}
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Add to Cart</span>
                              </button>
                            ) : (
                              <div className="flex items-center border border-forest-700 rounded-lg bg-forest-50 overflow-hidden shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, qty - 1)}
                                  className="px-2.5 py-1 text-forest-900 hover:bg-forest-100 font-bold text-xs"
                                  aria-label={`Decrease quantity of ${item.name}`}
                                >
                                  -
                                </button>
                                <span className="px-2.5 py-1 text-xs font-bold text-forest-950 bg-white">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, qty + 1)}
                                  className="px-2.5 py-1 text-forest-900 hover:bg-forest-100 font-bold text-xs"
                                  aria-label={`Increase quantity of ${item.name}`}
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Floating Bottom Cart Bar for Quick Access */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-8 sm:w-96 z-30">
          <div className="bg-forest-950 text-white p-3.5 rounded-2xl shadow-elevated border border-forest-800 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest-800 flex items-center justify-center text-amber-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-forest-300 font-medium">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} in takeaway cart
                </p>
                <p className="text-sm font-bold text-white font-serif">
                  Subtotal: ₹{subtotal.toFixed(2)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openCart}
              className="px-4 py-2 rounded-xl bg-terracotta text-white text-xs font-semibold hover:bg-terracotta-600 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <span>View Cart</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Restaurant Takeaway Notice */}
      <div className="bg-ivory-200/60 rounded-2xl border border-pos-border p-6 text-center space-y-2 text-xs text-pos-muted max-w-2xl mx-auto">
        <p className="font-semibold text-stone-800 text-sm">
          {RESTAURANT_CONFIG.name} &bull; Pure Takeaway Ordering
        </p>
        <p>
          Online orders placed here are prepared fresh for parcel pickup at our counter in Ispurli.
          Payment is completed upon pickup. For large family gatherings or special preparations, please call us directly.
        </p>
      </div>
    </div>
  );
};

export default MenuPage;
