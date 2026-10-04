import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

interface NavItem {
  label: string;
  to?: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Orders',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    comingSoon: true,
  },
  {
    label: 'Menu',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
    comingSoon: true,
  },
  {
    label: 'Billing',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    comingSoon: true,
  },
  {
    label: 'Reports',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    comingSoon: true,
  },
  {
    label: 'Staff',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    comingSoon: true,
  },
  {
    label: 'Settings',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    comingSoon: true,
  },
];

const roleBadgeClass: Record<string, string> = {
  ADMIN: 'bg-brand-500/20 text-brand-400',
  STAFF: 'bg-blue-500/20 text-blue-400',
};

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarContent = (
    <div className="flex h-full flex-col bg-surface-light">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-white/5 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18M3 3v14a2 2 0 002 2h14a2 2 0 002-2V3M3 3l9 5 9-5" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-none">Mahalaxmi</p>
          <p className="text-xs text-gray-500 leading-none mt-0.5">POS System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          if (item.comingSoon) {
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-600 cursor-not-allowed select-none"
                title="Coming soon"
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
                <span className="ml-auto text-xs text-gray-700 bg-white/5 rounded px-1.5 py-0.5">Soon</span>
              </div>
            );
          }
          return (
            <NavLink
              key={item.label}
              to={item.to!}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-400'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/5 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-brand-400 font-semibold text-sm">
            {user?.username?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{user?.username}</p>
            <span
              className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${
                roleBadgeClass[user?.role ?? 'STAFF'] ?? 'bg-gray-500/20 text-gray-400'
              }`}
            >
              {user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Desktop sidebar */}
      <div className="hidden w-60 flex-shrink-0 lg:block">{sidebarContent}</div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}

      {/* Mobile sidebar drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-60 transform transition-transform duration-300 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-white/5 bg-surface-light px-6">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              className="lg:hidden rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-base font-semibold text-white">Mahalaxmi Hotel POS</h1>
              <p className="text-xs text-gray-500">Ispurli, Maharashtra</p>
            </div>
          </div>

          {/* Header right */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs text-gray-400">System Online</span>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/20 text-brand-400 font-semibold text-sm">
              {user?.username?.[0]?.toUpperCase() ?? 'U'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
