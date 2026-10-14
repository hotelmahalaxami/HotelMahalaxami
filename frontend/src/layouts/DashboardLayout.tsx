import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

interface NavItem {
  label: string;
  to: string;
  icon: (active: boolean) => React.ReactNode;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: () => (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Orders',
    to: '/orders',
    icon: () => (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    label: 'Menu',
    to: '/admin/menu',
    icon: () => (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    adminOnly: true,
  },
  {
    label: 'Billing',
    to: '/billing',
    icon: () => (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    label: 'Reports',
    to: '/reports',
    icon: () => (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    adminOnly: true,
  },
  {
    label: 'Staff',
    to: '/admin/staff',
    icon: () => (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    adminOnly: true,
  },
];

const pageContextMap: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Operational Dashboard', subtitle: 'Live overview of sales, orders, and restaurant activity' },
  '/orders': { title: 'Orders & POS', subtitle: 'Table orders, ticket creation, and billing status' },
  '/admin/menu': { title: 'Menu Management', subtitle: 'Configure items, pricing, categories, and stock availability' },
  '/billing': { title: 'Billing & Invoices', subtitle: 'Settled receipts, payment records, and thermal printing' },
  '/reports': { title: 'Reports & Analytics', subtitle: 'Revenue summaries, sales trends, and top performers' },
  '/admin/staff': { title: 'Staff Accounts', subtitle: 'User roles, terminal access, and security management' },
};

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const currentRouteMeta = pageContextMap[location.pathname] || {
    title: 'Hotel Mahalaxmi POS',
    subtitle: 'Restaurant Management System',
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const sidebarContent = (
    <div className="flex h-full flex-col bg-forest-900 text-white select-none">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-forest-800 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-terracotta text-white shadow-sm font-bold text-base">
          M
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-wide text-white leading-tight truncate">Hotel Mahalaxmi</p>
          <p className="text-[11px] font-medium tracking-wider text-forest-300 uppercase leading-none mt-0.5">POS System</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems
          .filter((item) => !item.adminOnly || user?.role === 'ADMIN')
          .map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-forest-800 text-white shadow-xs border-l-3 border-terracotta'
                    : 'text-forest-200 hover:bg-forest-800/60 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? 'text-terracotta' : 'text-forest-300 group-hover:text-white'}>
                    {item.icon(isActive)}
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-forest-800 p-4 bg-forest-950/40">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-forest-700 text-xs font-bold text-forest-100">
            {user?.username?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">{user?.username}</p>
            <span
              className={`inline-block mt-0.5 rounded px-1.5 py-0.2 text-[10px] font-semibold uppercase tracking-wider ${
                user?.role === 'ADMIN'
                  ? 'bg-terracotta/20 text-terracotta-200'
                  : 'bg-forest-700 text-forest-200'
              }`}
            >
              {user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-forest-800 bg-forest-900/60 px-3 py-1.5 text-xs font-medium text-forest-200 transition-colors hover:bg-red-950/40 hover:text-red-300 hover:border-red-800/40"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-ivory font-sans">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 flex-shrink-0 lg:block shadow-md z-20">
        {sidebarContent}
      </aside>

      {/* Mobile drawer backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-forest-950/60 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:hidden shadow-2xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-pos-border bg-white px-4 sm:px-6 z-10">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Mobile menu trigger */}
            <button
              type="button"
              className="lg:hidden rounded-lg p-2 text-pos-muted hover:bg-forest-50 hover:text-forest-800 focus:outline-none focus:ring-2 focus:ring-forest-600"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Page Title & Subtitle */}
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold text-pos-text truncate leading-tight">
                {currentRouteMeta.title}
              </h1>
              <p className="hidden sm:block text-xs text-pos-muted truncate mt-0.5">
                {currentRouteMeta.subtitle}
              </p>
            </div>
          </div>

          {/* Right Header: Date & User Profile */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-medium text-pos-text">{currentDateFormatted}</span>
              <span className="text-[11px] text-pos-muted">Hotel Mahalaxmi, Ispurli</span>
            </div>

            <div className="h-8 w-px bg-pos-border hidden md:block" />

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-100 text-forest-800 font-bold text-xs ring-1 ring-forest-200">
                {user?.username?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-pos-text leading-tight">{user?.username}</p>
                <p className="text-[10px] font-medium text-pos-muted leading-tight">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
