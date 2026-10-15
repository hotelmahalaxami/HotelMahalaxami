import React, { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { RESTAURANT_CONFIG } from '../config/restaurantConfig';
import { CartProvider, useCart } from '../features/public/cart/CartContext';
import CartDrawer from '../features/public/cart/CartDrawer';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Menu', to: '/menu' },
  { label: 'Our Story', to: '/about' },
  { label: 'Contact & Location', to: '/contact' },
];

const PublicLayoutContent: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, toggleCart } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-ivory-50 text-pos-text font-sans antialiased selection:bg-forest-100 selection:text-forest-900">
      {/* Top Utility Bar with Hours & Discreet Staff Login */}
      <div className="bg-forest-950 text-forest-200 text-xs border-b border-forest-900 px-4 sm:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{RESTAURANT_CONFIG.timing.daysOpen}</span>
            </span>
            <span className="hidden md:inline text-forest-500">|</span>
            <span className="hidden md:inline text-forest-300">
              Lunch: {RESTAURANT_CONFIG.timing.lunchHours} &bull; Dinner: {RESTAURANT_CONFIG.timing.dinnerHours}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <a
              href={RESTAURANT_CONFIG.location.googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest-300 hover:text-white transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{RESTAURANT_CONFIG.location.village}, Kolhapur</span>
            </a>
            <span className="text-forest-600">|</span>
            {/* Discreet Admin / Staff Link */}
            <Link
              to="/login"
              className="text-forest-400 hover:text-forest-100 transition-colors flex items-center gap-1 font-medium"
              title="Staff & Management Terminal"
            >
              <svg className="w-3 h-3 text-forest-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Admin / Staff</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Public Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-pos-border/70 shadow-subtle transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Restaurant Brand Logo & Subtitle */}
            <Link to="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-forest-600 rounded-lg p-1">
              <div className="w-11 h-11 rounded-lg bg-forest-900 border border-forest-700/60 flex items-center justify-center text-white shadow-sm group-hover:bg-forest-800 transition-colors">
                <span className="font-serif font-bold text-xl text-terracotta-300">M</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-forest-950 group-hover:text-forest-800 transition-colors">
                  {RESTAURANT_CONFIG.name}
                </span>
                <span className="text-[11px] font-medium tracking-widest text-terracotta-600 uppercase font-sans -mt-0.5">
                  Ispurli &bull; Kolhapur
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-forest-900 bg-forest-50 font-semibold border-b-2 border-forest-800'
                        : 'text-pos-muted hover:text-forest-900 hover:bg-forest-50/50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Right Action: Cart Trigger & Order Online CTA Button */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                type="button"
                onClick={toggleCart}
                className="relative inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-pos-border bg-white text-forest-950 font-medium text-sm shadow-2xs hover:bg-forest-50 transition-all focus:outline-none focus:ring-2 focus:ring-forest-600 active:scale-98"
                aria-label={`Cart with ${totalItems} items`}
              >
                <svg className="w-5 h-5 text-forest-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Cart</span>
                {totalItems > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-terracotta rounded-full">
                    {totalItems}
                  </span>
                )}
              </button>

              <Link
                to="/menu"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-forest-900 text-white font-medium text-sm shadow-sm hover:bg-forest-800 transition-all focus:outline-none focus:ring-2 focus:ring-forest-600 active:scale-98"
              >
                <svg className="w-4 h-4 text-terracotta-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Order Online</span>
              </Link>
            </div>

            {/* Mobile Header Buttons */}
            <div className="flex md:hidden items-center gap-2">
              <button
                type="button"
                onClick={toggleCart}
                className="relative p-2 rounded-lg text-forest-900 hover:bg-forest-50 focus:outline-none focus:ring-2 focus:ring-forest-600"
                aria-label={`Cart with ${totalItems} items`}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold leading-none text-white bg-terracotta rounded-full">
                    {totalItems}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-forest-900 hover:bg-forest-50 focus:outline-none focus:ring-2 focus:ring-forest-600"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-pos-border bg-white px-4 pt-2 pb-6 space-y-1 shadow-lg animate-fadeIn">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-md text-base font-medium ${
                    isActive
                      ? 'bg-forest-50 text-forest-900 font-semibold border-l-4 border-forest-800'
                      : 'text-pos-muted hover:bg-forest-50/60 hover:text-forest-900'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="pt-3 border-t border-pos-border/60">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-pos-muted hover:text-forest-900"
              >
                <svg className="w-4 h-4 text-forest-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Staff & Management Portal</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Body */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Professional Hospitality Footer */}
      <footer className="bg-forest-950 text-forest-100 border-t border-forest-900 pt-16 pb-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Column 1: Brand & Heritage */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-terracotta flex items-center justify-center text-white font-serif font-bold text-lg">
                  M
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                    {RESTAURANT_CONFIG.name}
                  </h3>
                  <p className="text-xs text-forest-300 font-sans">Ispurli, Kolhapur</p>
                </div>
              </div>
              <p className="text-xs text-forest-300/90 leading-relaxed">
                Dedicated to serving authentic Kolhapuri flavors, signature mutton and chicken thalis, aromatic Tambda-Pandhra rassa, and warm Maharashtrian hospitality.
              </p>
              <div className="pt-2">
                <span className="inline-block px-2.5 py-1 rounded bg-forest-900 border border-forest-800 text-[11px] font-medium text-terracotta-300">
                  {RESTAURANT_CONFIG.timing.daysOpen}
                </span>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="font-serif text-sm font-semibold text-white tracking-wider uppercase mb-4 border-b border-forest-800/80 pb-2">
                Explore
              </h4>
              <ul className="space-y-2.5 text-xs text-forest-300">
                <li>
                  <Link to="/" className="hover:text-terracotta-300 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/menu" className="hover:text-terracotta-300 transition-colors">
                    Our Menu & Specialties
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-terracotta-300 transition-colors">
                    Our Kolhapuri Story
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-terracotta-300 transition-colors">
                    Directions & Timing
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-terracotta-300 transition-colors flex items-center gap-1.5 pt-1 text-forest-400">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Staff / POS Login</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Hours & Timing */}
            <div>
              <h4 className="font-serif text-sm font-semibold text-white tracking-wider uppercase mb-4 border-b border-forest-800/80 pb-2">
                Operating Hours
              </h4>
              <div className="space-y-3 text-xs text-forest-300">
                <div>
                  <p className="font-medium text-white">Afternoon Lunch</p>
                  <p className="mt-0.5">{RESTAURANT_CONFIG.timing.lunchHours}</p>
                </div>
                <div>
                  <p className="font-medium text-white">Evening Dinner</p>
                  <p className="mt-0.5">{RESTAURANT_CONFIG.timing.dinnerHours}</p>
                </div>
                <div className="pt-2">
                  <p className="text-[11px] text-forest-400 italic">
                    Fresh thalis prepared daily. Parcel takeaway service available throughout lunch and dinner hours.
                  </p>
                </div>
              </div>
            </div>

            {/* Column 4: Location & Contact */}
            <div>
              <h4 className="font-serif text-sm font-semibold text-white tracking-wider uppercase mb-4 border-b border-forest-800/80 pb-2">
                Visit & Contact
              </h4>
              <div className="space-y-3 text-xs text-forest-300">
                <p className="leading-relaxed">
                  <strong className="text-white block font-medium">Hotel Mahalaxmi</strong>
                  {RESTAURANT_CONFIG.location.fullAddress}
                </p>
                <div>
                  <p className="font-medium text-white">Contact Desk</p>
                  <p className="text-terracotta-300 font-medium mt-0.5">
                    {RESTAURANT_CONFIG.contact.phoneDisplay}
                  </p>
                </div>
                <div className="pt-2">
                  <a
                    href={RESTAURANT_CONFIG.location.googleMapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-forest-900 border border-forest-700/60 text-xs font-medium text-white hover:bg-forest-800 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 text-terracotta-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>Open in Google Maps</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-6 border-t border-forest-900 flex flex-col sm:flex-row items-center justify-between text-xs text-forest-400 gap-3">
            <p>
              &copy; {new Date().getFullYear()} {RESTAURANT_CONFIG.name}, Ispurli. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-[11px]">
              <span>Pure Kolhapuri Flavors</span>
              <span>&bull;</span>
              <span>Dine-in &amp; Takeaway</span>
              <span>&bull;</span>
              <Link to="/login" className="hover:text-forest-200 underline decoration-forest-700 underline-offset-4">
                Staff Login
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Slide-over takeaway cart drawer */}
      <CartDrawer />
    </div>
  );
};

const PublicLayout: React.FC = () => {
  return (
    <CartProvider>
      <PublicLayoutContent />
    </CartProvider>
  );
};

export default PublicLayout;

