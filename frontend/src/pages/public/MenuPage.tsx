import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import publicMenuService from '../../services/publicMenuService';
import type { PublicMenuCategory, PublicMenuItem, VegFilterOption } from '../../types/publicMenu';
import { RESTAURANT_CONFIG } from '../../config/restaurantConfig';

const categoryMeta: Record<string, { image: string; description: string }> = {
  Thali: {
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    description: 'Our crown jewel feasts — served with unlimited authentic Tambda & Pandhra rassa, fresh jowar bhakri, and rice.',
  },
  Chicken: {
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
    description: 'Tender poultry slow-cooked in hand-roasted dry coconut, caramelized onions, and traditional Kolhapuri spices.',
  },
  Mutton: {
    image: 'https://images.unsplash.com/photo-1545247181-516773cae7be?auto=format&fit=crop&w=800&q=80',
    description: 'Fresh mutton simmered to perfection in authentic village-style masala with bold aroma and deep flavor.',
  },
  'Veg Main Course': {
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    description: 'Pure vegetarian specialties prepared with fresh dairy paneer, cashews, and comforting home-style dal.',
  },
  'Roti & Rice': {
    image: 'https://images.unsplash.com/photo-1505253758473-96b3f5d121ff?auto=format&fit=crop&w=800&q=80',
    description: 'Freshly patted cast-iron jowar bhakris, hot chapatis, tandoori rotis, and fragrant Indrayani rice.',
  },
  'Beverages & Extras': {
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    description: 'Handcrafted Solkadhi made with pure kokum and fresh coconut milk, spiced buttermilk, and crisp papad.',
  },
};

const dishImages: Record<string, string> = {
  // Thalis
  'Special Mahalaxmi Thali': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=700&q=80',
  'Special Veg Thali': 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=700&q=80',
  'Special Mutton Thali': 'https://images.unsplash.com/photo-1545247181-516773cae7be?auto=format&fit=crop&w=700&q=80',
  'Special Chicken Thali': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=700&q=80',
  'Egg Thali': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=700&q=80',

  // Chicken Specialties
  'Chicken Fry': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=700&q=80',
  'Chicken Masala': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=700&q=80',
  'Butter Chicken': 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=700&q=80',
  'Chicken Sukka': 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=700&q=80',
  'Chicken Handi (Half)': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=700&q=80',
  'Chicken Handi (Full)': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=700&q=80',

  // Mutton Delicacies
  'Mutton Masala': 'https://images.unsplash.com/photo-1545247181-516773cae7be?auto=format&fit=crop&w=700&q=80',
  'Mutton Fry': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=700&q=80',
  'Mutton Sukka': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80',
  'Mutton Handi (Half)': 'https://images.unsplash.com/photo-1545247181-516773cae7be?auto=format&fit=crop&w=700&q=80',
  'Mutton Handi (Full)': 'https://images.unsplash.com/photo-1545247181-516773cae7be?auto=format&fit=crop&w=700&q=80',

  // Pure Veg Delicacies
  'Paneer Masala': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=700&q=80',
  'Paneer Butter Masala': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=700&q=80',
  'Kaju Curry': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=700&q=80',
  'Mix Veg': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80',
  'Dal Tadka': 'https://images.unsplash.com/photo-1546833998-877b37c2e5c4?auto=format&fit=crop&w=700&q=80',
  'Shev Bhaji': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=700&q=80',

  // Fresh Breads & Rice
  'Chapati': 'https://images.unsplash.com/photo-1505253758473-96b3f5d121ff?auto=format&fit=crop&w=700&q=80',
  'Jowar Bhakri': 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=700&q=80',
  'Tandoori Roti': 'https://images.unsplash.com/photo-1533450718592-29d45635f0a9?auto=format&fit=crop&w=700&q=80',
  'Butter Naan': 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=700&q=80',
  'Jeera Rice': 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?auto=format&fit=crop&w=700&q=80',
  'Masala Bhat': 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=700&q=80',
  'Indrayani Rice (Plate)': 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=700&q=80',

  // Beverages & Extras
  'Solkadhi': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=700&q=80',
  'Masala Taak (Buttermilk)': 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=700&q=80',
  'Mineral Water (1L)': 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=700&q=80',
  'Roasted Papad': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=700&q=80',
};

const getDishImage = (itemName: string, categoryName: string): string => {
  if (dishImages[itemName]) {
    return dishImages[itemName];
  }
  // Case-insensitive or partial match
  const lowerName = itemName.toLowerCase();
  for (const [key, url] of Object.entries(dishImages)) {
    if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
      return url;
    }
  }
  return categoryMeta[categoryName]?.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80';
};

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
          Authentic Kolhapur Heritage &bull; Fresh Daily
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-forest-950">
          Restaurant Food Menu
        </h1>
        <p className="text-sm sm:text-base text-pos-muted max-w-2xl mx-auto leading-relaxed">
          Explore our complete selection of authentic Kolhapuri thalis, chicken &amp; mutton specialties, pure vegetarian curries, and freshly roasted bhakris. Available for family dine-in and takeaway at our Ispurli counter.
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
                  <div key={i} className="h-28 bg-stone-100 rounded-xl" />
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
      ) : categories.length === 0 ? (
        /* Empty Database / Updating State */
        <div className="bg-white rounded-2xl border border-pos-border p-12 text-center space-y-4 max-w-md mx-auto shadow-subtle">
          <div className="w-16 h-16 rounded-full bg-ivory-200 text-forest-800 mx-auto flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-800">Menu Currently Updating</h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Our kitchen is preparing today&apos;s fresh menu. You can call our desk directly at{' '}
              <a href={`tel:${RESTAURANT_CONFIG.contact.phonePrimary}`} className="font-semibold text-forest-900 underline">
                {RESTAURANT_CONFIG.contact.phoneDisplay}
              </a>{' '}
              for inquiries.
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadMenu(true)}
            className="px-4 py-2 rounded-lg bg-forest-900 text-white text-xs font-medium hover:bg-forest-800 transition-colors shadow-2xs"
          >
            Refresh Menu
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
        <div className="space-y-12">
          <div className="text-xs text-stone-500 font-medium">
            Showing {totalFilteredDishes} {totalFilteredDishes === 1 ? 'dish' : 'dishes'}
          </div>

          {filteredCategories.map((category) => {
            const meta = categoryMeta[category.name];

            return (
              <section
                key={category.id}
                className="bg-white rounded-2xl border border-pos-border shadow-subtle overflow-hidden"
              >
                {/* Category Header with Authentic Culinary Photo */}
                <div className="relative h-44 sm:h-52 bg-forest-900 overflow-hidden">
                  {meta?.image && (
                    <img
                      src={meta.image}
                      alt={category.name}
                      className="w-full h-full object-cover opacity-45 mix-blend-overlay scale-105"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 flex flex-col justify-end">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-semibold tracking-widest text-terracotta-300 uppercase font-sans">
                          Kolhapuri Specialty
                        </span>
                        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                          {category.name}
                        </h2>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-forest-800/80 border border-forest-700/60 text-xs font-semibold text-terracotta-200 backdrop-blur-sm">
                        {category.items.length} {category.items.length === 1 ? 'dish' : 'dishes'}
                      </span>
                    </div>
                    {meta?.description && (
                      <p className="text-xs sm:text-sm text-forest-200 mt-1 max-w-2xl font-sans line-clamp-2">
                        {meta.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Dishes Grid */}
                <div className="p-5 sm:p-7">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {category.items.map((item: PublicMenuItem) => (
                      <div
                        key={item.id}
                        className={`group bg-white rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-elevated ${
                          item.available
                            ? 'border-pos-border hover:border-forest-400'
                            : 'border-stone-200 bg-stone-50/70 opacity-60'
                        }`}
                      >
                        <div>
                          {/* Dish Photo with Zoom & Badges */}
                          <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-forest-950/10">
                            <img
                              src={getDishImage(item.name, category.name)}
                              alt={item.name}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-black/25" />

                            {/* Top Floating Badges: Veg/Non-Veg Indicator & Price Tag */}
                            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md shadow-xs ${
                                  item.isVeg
                                    ? 'bg-emerald-950/85 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-stone-950/85 text-amber-300 border border-amber-500/40'
                                }`}
                                title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    item.isVeg ? 'bg-emerald-400' : 'bg-red-500'
                                  }`}
                                />
                                <span>{item.isVeg ? 'Pure Veg' : 'Non-Veg'}</span>
                              </span>

                              <span className="font-serif font-bold text-white text-base bg-forest-950/85 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-xs">
                                ₹{item.price.toFixed(2)}
                              </span>
                            </div>

                            {/* Bottom category badge inside image */}
                            <div className="absolute bottom-2.5 left-3">
                              <span className="text-[11px] font-semibold text-terracotta-200 uppercase tracking-wider drop-shadow-md">
                                {item.categoryName}
                              </span>
                            </div>
                          </div>

                          {/* Dish Information */}
                          <div className="p-4 sm:p-5 space-y-2">
                            <h3 className="font-serif font-bold text-stone-900 text-lg group-hover:text-forest-900 transition-colors leading-snug">
                              {item.name}
                            </h3>

                            {item.description ? (
                              <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                                {item.description}
                              </p>
                            ) : (
                              <p className="text-xs text-stone-500 leading-relaxed italic">
                                Prepared fresh with authentic home-ground Kolhapuri spices.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Bottom Footer: Fresh status & Service */}
                        <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-3 border-t border-pos-border/60 flex items-center justify-between text-xs">
                          <div>
                            {!item.available ? (
                              <span className="text-stone-400 font-medium italic">
                                Currently Unavailable
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Fresh Today</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-stone-500 font-medium bg-ivory-100 px-2 py-0.5 rounded">
                            Dine-in &amp; Counter Parcel
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Restaurant Visiting & Dining Notice */}
      <div className="bg-white rounded-2xl border border-pos-border p-6 sm:p-8 text-center space-y-3 max-w-2xl mx-auto shadow-subtle">
        <h3 className="font-serif text-lg font-bold text-forest-950">
          {RESTAURANT_CONFIG.name} &bull; Authentic Dining &amp; Counter Parcel
        </h3>
        <p className="text-xs sm:text-sm text-pos-muted leading-relaxed">
          Every dish is prepared fresh daily using heritage recipes and authentic spices in Ispurli. For table reservations, bulk parcel takeaway, or special preparations, please call our counter directly or visit us.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-4 text-xs font-semibold">
          <a
            href={`tel:${RESTAURANT_CONFIG.contact.phonePrimary}`}
            className="text-forest-900 hover:text-terracotta underline decoration-forest-400 underline-offset-4"
          >
            📞 Counter: {RESTAURANT_CONFIG.contact.phoneDisplay}
          </a>
          <span className="text-stone-300">|</span>
          <a
            href={RESTAURANT_CONFIG.location.googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-forest-900 hover:text-terracotta underline decoration-forest-400 underline-offset-4"
          >
            📍 Get Directions (Ispurli, Kolhapur)
          </a>
        </div>
      </div>
    </div>
  );
};

export default MenuPage;
