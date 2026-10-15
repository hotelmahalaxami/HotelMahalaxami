import React from 'react';
import { Link } from 'react-router-dom';
import { RESTAURANT_CONFIG } from '../../config/restaurantConfig';

interface FeaturedDish {
  name: string;
  category: string;
  price: string;
  description: string;
  isVeg: boolean;
  tag: string;
}

const featuredDishes: FeaturedDish[] = [
  {
    name: 'Special Mahalaxmi Thali',
    category: 'Signature Non-Veg Thali',
    price: '₹350',
    description: 'Our crown jewel. A generous spread featuring authentic mutton preparation, flavorful chicken sukka, fragrant tambda & pandhra rassa, jowar bhakri, and indrayani rice.',
    isVeg: false,
    tag: "Chef's Recommendation",
  },
  {
    name: 'Special Mutton Thali',
    category: 'Kolhapuri Specialty',
    price: '₹380',
    description: 'Tender mutton cooked to perfection in aromatic traditional ground masala, paired with fresh bhakri, unlimited authentic rassa, and spiced rice.',
    isVeg: false,
    tag: 'Authentic Favorite',
  },
  {
    name: 'Special Veg Thali',
    category: 'Pure Home-Style Veg',
    price: '₹170',
    description: 'Freshly prepared seasonal vegetable curry, comforting dal tadka, hot jowar bhakri or chapati, fragrant rice, roasted papad, and crushed thecha.',
    isVeg: true,
    tag: 'Vegetarian Delight',
  },
  {
    name: 'Chicken Sukka & Handi',
    category: 'Kolhapuri Gravy & Fry',
    price: 'From ₹210',
    description: 'Succulent chicken tossed in caramelized onions, dry coconut, and authentic home-roasted spices. Available in single portions or half/full handi.',
    isVeg: false,
    tag: 'Crowd Favorite',
  },
  {
    name: 'Special Chicken Thali',
    category: 'Traditional Thali',
    price: '₹260',
    description: 'Flavorsome chicken curry, aromatic sukka, unlimited authentic rassa, choice of fresh bhakri or chapati, and steaming rice.',
    isVeg: false,
    tag: 'Best Seller',
  },
  {
    name: 'Solkadhi & Masala Taak',
    category: 'Digestive & Refreshment',
    price: 'From ₹25',
    description: 'Handcrafted Solkadhi made with pure kokum and fresh coconut milk, and spiced buttermilk seasoned with fresh coriander, ginger, and cumin.',
    isVeg: true,
    tag: 'Essential Accompaniment',
  },
];

const HomePage: React.FC = () => {
  return (
    <div className="space-y-20 sm:space-y-28">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-forest-900 text-white pt-16 pb-20 sm:pt-24 sm:pb-32">
        {/* Subtle decorative background patterns */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C96F43_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-forest-700/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-terracotta/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-800/80 border border-forest-700/60 text-xs font-medium text-terracotta-200 mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
              <span>Authentic Kolhapuri Heritage &bull; Ispurli, Maharashtra</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight sm:leading-none">
              Taste the True Essence of{' '}
              <span className="text-terracotta-300 italic font-normal">Kolhapuri Hospitality</span>
            </h1>

            {/* Introduction paragraph */}
            <p className="mt-6 text-base sm:text-lg text-forest-200 leading-relaxed max-w-2xl font-sans">
              Welcome to <strong>{RESTAURANT_CONFIG.name}</strong>. Renowned for our signature mutton and chicken thalis, aromatic Tambda and Pandhra rassa, freshly baked jowar bhakri, and wholesome vegetarian feasts in Ispurli.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                to="/menu"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-terracotta text-white font-medium text-sm shadow-md hover:bg-terracotta-600 transition-all focus:outline-none focus:ring-2 focus:ring-terracotta-400 active:scale-98"
              >
                <span>Explore Full Menu &amp; Order</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              <a
                href={RESTAURANT_CONFIG.location.googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-forest-800/80 border border-forest-700/80 text-white font-medium text-sm hover:bg-forest-800 hover:border-forest-600 transition-all focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <svg className="w-4 h-4 text-terracotta-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Get Directions (Ispurli)</span>
              </a>
            </div>

            {/* Quick Badges below Hero */}
            <div className="mt-12 pt-8 border-t border-forest-800/80 grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <p className="font-serif text-xl sm:text-2xl font-bold text-white">100%</p>
                <p className="text-xs text-forest-300 mt-0.5">Authentic Kolhapur Recipes</p>
              </div>
              <div>
                <p className="font-serif text-xl sm:text-2xl font-bold text-white">Daily Fresh</p>
                <p className="text-xs text-forest-300 mt-0.5">Tambda &amp; Pandhra Rassa</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="font-serif text-xl sm:text-2xl font-bold text-white">Family Dining</p>
                <p className="text-xs text-forest-300 mt-0.5">&amp; Hot Parcel Takeaway</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Authentic Signature Dishes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-semibold tracking-widest text-terracotta uppercase font-sans">
            Culinary Highlights
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-forest-950 mt-2">
            Our Authentic Specialties
          </h2>
          <p className="text-sm sm:text-base text-pos-muted mt-3">
            Handcrafted daily with real Kolhapuri masalas, cold-pressed oils, and farm-fresh ingredients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredDishes.map((dish) => (
            <div
              key={dish.name}
              className="bg-white rounded-xl border border-pos-border p-6 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-terracotta bg-terracotta-50 px-2 py-0.5 rounded">
                    {dish.tag}
                  </span>
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      dish.isVeg ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {dish.isVeg ? '● Veg' : '▲ Non-Veg'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <h3 className="font-serif text-lg font-bold text-forest-950 group-hover:text-forest-800 transition-colors">
                    {dish.name}
                  </h3>
                  <span className="font-sans font-bold text-forest-900 text-base">
                    {dish.price}
                  </span>
                </div>

                <p className="text-xs text-terracotta-600 font-medium mb-3">
                  {dish.category}
                </p>

                <p className="text-xs text-pos-muted leading-relaxed">
                  {dish.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-pos-border/60 flex items-center justify-between">
                <span className="text-[11px] text-pos-muted">Freshly Prepared</span>
                <Link
                  to="/menu"
                  className="text-xs font-semibold text-forest-800 hover:text-terracotta transition-colors flex items-center gap-1"
                >
                  <span>Order item</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-forest-900 text-white text-sm font-medium hover:bg-forest-800 transition-colors shadow-sm"
          >
            <span>View Full Restaurant Menu (30+ Authentic Dishes)</span>
            <svg className="w-4 h-4 text-terracotta-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* 3. Heritage & Story Section */}
      <section className="bg-forest-50/70 border-y border-pos-border/80 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-semibold tracking-widest text-terracotta uppercase font-sans">
                Our Heritage &bull; Ispurli
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-forest-950 leading-tight">
                Tradition, Honesty &amp; Uncompromised Kolhapuri Taste
              </h2>
              <p className="text-sm sm:text-base text-pos-text/90 leading-relaxed font-sans">
                At <strong>Hotel Mahalaxmi</strong>, we believe authentic taste cannot be rushed. Located in Ispurli on the Radhanagari corridor, our restaurant was founded to serve genuine Kolhapuri hospitality to locals, travelers, and food lovers.
              </p>
              <p className="text-sm sm:text-base text-pos-text/90 leading-relaxed font-sans">
                Every batch of our famed <em>Tambda Rassa</em> (red curry) and <em>Pandhra Rassa</em> (white coconut-mutton broth) is prepared fresh with traditional whole spices and slow-simmered stocks. No artificial colorings, no shortcuts — just authentic Maharashtrian culinary mastery.
              </p>

              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-terracotta-600 hover:text-terracotta-700 transition-colors"
                >
                  <span>Read our full story and philosophy</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Visual Highlights Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-xl border border-pos-border shadow-subtle space-y-2">
                <div className="w-10 h-10 rounded-lg bg-forest-100 text-forest-900 flex items-center justify-center font-bold text-base">
                  01
                </div>
                <h4 className="font-serif font-bold text-forest-950 text-base">
                  Fresh Ground Masalas
                </h4>
                <p className="text-xs text-pos-muted leading-relaxed">
                  Stone-roasted spices blended using authentic local Karveer family formulations.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-pos-border shadow-subtle space-y-2">
                <div className="w-10 h-10 rounded-lg bg-terracotta-100 text-terracotta-800 flex items-center justify-center font-bold text-base">
                  02
                </div>
                <h4 className="font-serif font-bold text-forest-950 text-base">
                  Jowar Bhakri Fresh off Pan
                </h4>
                <p className="text-xs text-pos-muted leading-relaxed">
                  Hand-patted jowar bhakris baked hot to order on traditional cast-iron tawas.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-pos-border shadow-subtle space-y-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base">
                  03
                </div>
                <h4 className="font-serif font-bold text-forest-950 text-base">
                  Pure Veg Delicacies
                </h4>
                <p className="text-xs text-pos-muted leading-relaxed">
                  Separate culinary care for vegetarian guests with Shev Bhaji, Paneer &amp; Pithla.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-pos-border shadow-subtle space-y-2">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-base">
                  04
                </div>
                <h4 className="font-serif font-bold text-forest-950 text-base">
                  Hygienic Takeaway Packing
                </h4>
                <p className="text-xs text-pos-muted leading-relaxed">
                  Leak-proof packaging designed to keep curries and rotis warm and intact during transit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Verified Restaurant Amenities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold tracking-widest text-terracotta uppercase font-sans">
            Comfort &amp; Service
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest-950 mt-2">
            Designed for Great Meals with Family &amp; Friends
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {RESTAURANT_CONFIG.verifiedFacilities.map((fac) => (
            <div
              key={fac.title}
              className="bg-white rounded-xl border border-pos-border p-6 shadow-subtle hover:border-forest-300 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-forest-50 text-forest-800 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-forest-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-serif font-bold text-forest-950 text-base mb-1.5">
                {fac.title}
              </h3>
              <p className="text-xs text-pos-muted leading-relaxed">
                {fac.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Location, Hours & Getting Here Card */}
      <section id="location" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-forest-900 rounded-2xl text-white overflow-hidden shadow-card border border-forest-800">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Info side */}
            <div className="lg:col-span-7 p-8 sm:p-12 space-y-6">
              <span className="text-xs font-semibold tracking-widest text-terracotta-300 uppercase font-sans">
                Plan Your Visit
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white leading-tight">
                Visit Us at Ispurli, Kolhapur
              </h2>

              <p className="text-sm text-forest-200 leading-relaxed max-w-xl">
                Conveniently located on Radhanagari Road, Ispurli. Whether you are driving down with family, meeting friends, or picking up dinner parcels, we look forward to welcoming you.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-terracotta-200">
                    Dining &amp; Takeaway Hours
                  </h4>
                  <p className="text-sm font-medium text-white mt-1">
                    Lunch: {RESTAURANT_CONFIG.timing.lunchHours}
                  </p>
                  <p className="text-sm font-medium text-white mt-0.5">
                    Dinner: {RESTAURANT_CONFIG.timing.dinnerHours}
                  </p>
                  <p className="text-xs text-forest-400 mt-1">
                    {RESTAURANT_CONFIG.timing.daysOpen}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-terracotta-200">
                    Telephone Assistance
                  </h4>
                  <p className="text-sm font-medium text-white mt-1">
                    {RESTAURANT_CONFIG.contact.phoneDisplay}
                  </p>
                  <p className="text-xs text-forest-400 mt-1">
                    Advance parcel booking &amp; table inquiry
                  </p>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href={RESTAURANT_CONFIG.location.googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-terracotta text-white font-medium text-sm shadow-md hover:bg-terracotta-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Open Directions in Google Maps</span>
                </a>

                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-forest-800 text-forest-100 font-medium text-sm hover:bg-forest-700 transition-colors"
                >
                  <span>Contact Details</span>
                </Link>
              </div>
            </div>

            {/* Address Banner side */}
            <div className="lg:col-span-5 bg-forest-950 p-8 sm:p-12 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-forest-800">
              <div className="space-y-4">
                <h3 className="font-serif text-xl font-bold text-white">
                  Address Details
                </h3>
                <div className="p-4 rounded-lg bg-forest-900/60 border border-forest-800 text-xs text-forest-200 space-y-1.5 leading-relaxed">
                  <p className="font-semibold text-white">{RESTAURANT_CONFIG.name}</p>
                  <p>{RESTAURANT_CONFIG.location.landmark}</p>
                  <p>{RESTAURANT_CONFIG.location.village}, Taluka {RESTAURANT_CONFIG.location.taluka}</p>
                  <p>District {RESTAURANT_CONFIG.location.district}, {RESTAURANT_CONFIG.location.state} — {RESTAURANT_CONFIG.location.pincode}</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-forest-800 text-xs text-forest-400">
                <p>
                  Looking to place an online order for instant counter pickup?
                </p>
                <Link
                  to="/menu"
                  className="inline-block mt-2 font-semibold text-terracotta-300 hover:text-terracotta-200 transition-colors"
                >
                  Browse Menu &amp; Start Order &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
