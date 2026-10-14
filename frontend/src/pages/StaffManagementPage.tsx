import React, { useEffect, useState } from 'react';
import { staffService } from '../services/staffService';
import type { User, Role } from '../types/auth';
import type { CreateStaffRequest } from '../types/admin';

const StaffManagementPage: React.FC = () => {
  const [staffList, setStaffList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Add staff modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState<CreateStaffRequest>({
    username: '',
    email: '',
    password: '',
    role: 'STAFF',
  });

  // Reset password modal state
  const [resetModalUser, setResetModalUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const loadStaff = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await staffService.getAllStaff();
      setStaffList(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load staff list';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Toggle Status
  const handleToggleStatus = async (user: User) => {
    try {
      const updated = await staffService.toggleStatus(user.id, !user.enabled);
      setStaffList((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      showNotification(`Account ${user.username} is now ${updated.enabled ? 'ACTIVE' : 'DISABLED'}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to toggle account status';
      setError(msg);
    }
  };

  // Create Staff
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.username.trim() || !addForm.email.trim() || !addForm.password) {
      setError('All fields are required');
      return;
    }

    try {
      const created = await staffService.createStaff(addForm);
      setStaffList((prev) => [created, ...prev]);
      setAddModalOpen(false);
      setAddForm({ username: '', email: '', password: '', role: 'STAFF' });
      showNotification(`Staff user "${created.username}" created successfully`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create staff';
      setError(msg);
    }
  };

  // Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser || !newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await staffService.resetPassword(resetModalUser.id, { newPassword });
      showNotification(`Password for ${resetModalUser.username} updated successfully`);
      setResetModalUser(null);
      setNewPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reset password';
      setError(msg);
    }
  };

  const activeCount = staffList.filter((s) => s.enabled).length;
  const disabledCount = staffList.filter((s) => !s.enabled).length;
  const adminCount = staffList.filter((s) => s.role === 'ADMIN').length;
  const staffCount = staffList.filter((s) => s.role === 'STAFF').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Staff Management</h2>
          <p className="text-sm text-gray-400 mt-1">
            Manage staff accounts, assign roles, toggle login access, and reset passwords
          </p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-colors"
        >
          + Add Staff Member
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400 flex items-center justify-between">
          <span>✓ {successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-green-300 hover:text-white">✕</button>
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center justify-between">
          <span>⚠ {error}</span>
          <button onClick={() => setError(null)} className="text-red-300 hover:text-white">✕</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/5 bg-surface-light p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Total Users</p>
          <p className="mt-1 text-2xl font-bold text-white">{staffList.length}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-surface-light p-4">
          <p className="text-xs uppercase tracking-wide text-green-400">Active</p>
          <p className="mt-1 text-2xl font-bold text-green-400">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-surface-light p-4">
          <p className="text-xs uppercase tracking-wide text-red-400">Disabled</p>
          <p className="mt-1 text-2xl font-bold text-red-400">{disabledCount}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-surface-light p-4">
          <p className="text-xs uppercase tracking-wide text-brand-400">Admins / Staff</p>
          <p className="mt-1 text-2xl font-bold text-white">
            <span className="text-brand-400">{adminCount}</span> / <span className="text-blue-400">{staffCount}</span>
          </p>
        </div>
      </div>

      {/* Staff Table */}
      <div className="overflow-hidden rounded-xl border border-white/5 bg-surface-light">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Loading staff accounts...</div>
        ) : staffList.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No staff members found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="border-b border-white/5 bg-white/[0.02] text-xs uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {staffList.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500/20 text-brand-400 font-semibold text-sm">
                          {user.username?.[0]?.toUpperCase() ?? 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.username}</p>
                          <p className="text-xs text-gray-500">ID: #{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-300">{user.email}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded px-2.5 py-1 text-xs font-semibold ${
                          user.role === 'ADMIN'
                            ? 'bg-brand-500/20 text-brand-400 ring-1 ring-brand-500/30'
                            : 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          user.enabled ? 'bg-green-500' : 'bg-gray-700'
                        }`}
                        title={user.enabled ? 'Click to Disable Account' : 'Click to Enable Account'}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            user.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className={`ml-2 text-xs font-medium ${user.enabled ? 'text-green-400' : 'text-gray-500'}`}>
                        {user.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => {
                          setResetModalUser(user);
                          setNewPassword('');
                        }}
                        className="rounded px-2.5 py-1 text-xs font-semibold text-brand-400 hover:bg-brand-500/10 transition-colors"
                      >
                        Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-surface-light p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Add Staff Member</h3>
            <form onSubmit={handleCreateStaff} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. waiter_rahul"
                  value={addForm.username}
                  onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="rahul@mahalaxmi.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Role</label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value as Role })}
                  className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="STAFF" className="bg-surface">STAFF (POS & Orders)</option>
                  <option value="ADMIN" className="bg-surface">ADMIN (Full Access & Reports)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-xs font-medium text-gray-400 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-brand-600"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-surface-light p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Reset Password</h3>
            <p className="text-xs text-gray-400 mt-1">
              Set new password for <span className="text-white font-medium">{resetModalUser.username}</span>
            </p>
            <form onSubmit={handleResetPassword} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  autoFocus
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="rounded-lg px-3 py-1.5 text-xs text-gray-400 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
                >
                  Confirm Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagementPage;
