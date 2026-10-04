import React from 'react';
import { useAuth } from '../features/auth/AuthContext';

const comingSoonModules = [
  { label: 'Orders', description: 'Take and manage customer orders', icon: '📋', stage: 'Stage 2' },
  { label: 'Menu', description: 'Manage menu items and categories', icon: '🍽️', stage: 'Stage 2' },
  { label: 'Billing', description: 'Process payments and print bills', icon: '💳', stage: 'Stage 3' },
  { label: 'Reports', description: 'Sales reports and analytics', icon: '📊', stage: 'Stage 4' },
];

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Welcome back, {user?.username}!
          </h2>
          <p className="mt-1 text-gray-400">
            Mahalaxmi Hotel POS — Stage 1: Foundation & Authentication
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
            user?.role === 'ADMIN'
              ? 'bg-brand-500/20 text-brand-400 ring-1 ring-brand-500/30'
              : 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30'
          }`}
        >
          {user?.role}
        </span>
      </div>

      {/* Stage 1 completion card */}
      <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-green-500/20">
            <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-green-400">Stage 1 Complete — Foundation & Authentication</h3>
            <p className="mt-0.5 text-sm text-gray-400">
              Authentication system, JWT security, role-based access, and application shell are fully operational.
            </p>
          </div>
        </div>
      </div>

      {/* System status */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Authentication', status: 'Active', color: 'green' },
          { label: 'Database', status: 'Connected', color: 'green' },
          { label: 'Role', status: user?.role ?? 'Unknown', color: 'brand' },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-white/5 bg-surface-light p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</p>
            <div className="mt-2 flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${
                item.color === 'green' ? 'bg-green-500' : 'bg-brand-500'
              }`} />
              <p className="text-sm font-semibold text-white">{item.status}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Coming soon modules */}
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Upcoming Modules
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {comingSoonModules.map((mod) => (
            <div
              key={mod.label}
              className="relative overflow-hidden rounded-xl border border-white/5 bg-surface-light p-5 opacity-60 cursor-not-allowed"
            >
              <div className="absolute right-3 top-3">
                <span className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-gray-600">{mod.stage}</span>
              </div>
              <div className="text-3xl mb-3">{mod.icon}</div>
              <h4 className="font-semibold text-white">{mod.label}</h4>
              <p className="mt-1 text-xs text-gray-500">{mod.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* User session info */}
      <div className="rounded-xl border border-white/5 bg-surface-light p-6">
        <h3 className="mb-4 font-semibold text-white">Current Session</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">User ID</span>
            <span className="font-mono text-gray-300">{user?.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Username</span>
            <span className="text-gray-300">{user?.username}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Email</span>
            <span className="text-gray-300">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Role</span>
            <span className="text-gray-300">{user?.role}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Account Status</span>
            <span className="text-green-400">{user?.enabled ? 'Active' : 'Disabled'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
