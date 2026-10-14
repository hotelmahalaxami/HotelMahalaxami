import React, { useEffect, useState } from 'react';
import { staffService } from '../services/staffService';
import type { User, Role } from '../types/auth';
import type { CreateStaffRequest } from '../types/admin';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import EmptyState from '../components/ui/EmptyState';

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
    setTimeout(() => setSuccessMsg(null), 3500);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-pos-border rounded-xl p-5 shadow-subtle">
        <div>
          <h2 className="text-xl font-bold text-pos-text tracking-tight">Staff Management</h2>
          <p className="text-xs text-pos-muted mt-0.5">
            Manage staff accounts, assign roles, toggle login access, and reset passwords
          </p>
        </div>
        <div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setAddModalOpen(true)}
          >
            + Add Staff Member
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800 flex items-center justify-between">
          <span>✓ {successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:underline">✕</button>
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-800 flex items-center justify-between">
          <span>⚠ {error}</span>
          <button onClick={() => setError(null)} className="text-red-700 hover:underline">✕</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-pos-border bg-white p-4 shadow-subtle">
          <p className="text-xs font-semibold uppercase tracking-wider text-pos-muted">Total Users</p>
          <p className="mt-1 text-2xl font-bold text-pos-text">{staffList.length}</p>
        </div>
        <div className="rounded-xl border border-pos-border bg-white p-4 shadow-subtle">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Active</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-pos-border bg-white p-4 shadow-subtle">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-700">Disabled</p>
          <p className="mt-1 text-2xl font-bold text-red-700">{disabledCount}</p>
        </div>
        <div className="rounded-xl border border-pos-border bg-white p-4 shadow-subtle">
          <p className="text-xs font-semibold uppercase tracking-wider text-forest-800">Admins / Staff</p>
          <p className="mt-1 text-2xl font-bold text-pos-text">
            <span className="text-terracotta">{adminCount}</span> / <span className="text-forest-800">{staffCount}</span>
          </p>
        </div>
      </div>

      {/* Staff Table */}
      <div className="overflow-hidden rounded-xl border border-pos-border bg-white shadow-subtle">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-pos-muted">Loading staff accounts...</div>
        ) : staffList.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No staff members found"
              description="Click '+ Add Staff Member' to create a new POS terminal account."
              action={
                <Button variant="primary" size="sm" onClick={() => setAddModalOpen(true)}>
                  + Add Staff Member
                </Button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-pos-border bg-ivory text-xs uppercase tracking-wider text-pos-muted font-semibold">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Created</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pos-border">
                {staffList.map((user) => (
                  <tr key={user.id} className="hover:bg-ivory/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-100 text-forest-800 font-bold text-xs ring-1 ring-forest-200">
                          {user.username?.[0]?.toUpperCase() ?? 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-pos-text">{user.username}</p>
                          <p className="text-[11px] text-pos-muted">ID: #{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-pos-text">{user.email}</td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={user.role === 'ADMIN' ? 'terracotta' : 'forest'}
                        size="sm"
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            user.enabled ? 'bg-emerald-600' : 'bg-stone-300'
                          }`}
                          title={user.enabled ? 'Click to Disable Account' : 'Click to Enable Account'}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              user.enabled ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className={`text-xs font-semibold ${user.enabled ? 'text-emerald-700' : 'text-pos-muted'}`}>
                          {user.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-pos-muted">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setResetModalUser(user);
                          setNewPassword('');
                        }}
                      >
                        Reset Password
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Staff Member"
        description="Create credentials for a server, cashier, or admin"
        maxWidth="md"
      >
        <form onSubmit={handleCreateStaff} className="space-y-4">
          <Input
            label="Username"
            type="text"
            required
            placeholder="e.g. waiter_rahul"
            value={addForm.username}
            onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
          />

          <Input
            label="Email"
            type="email"
            required
            placeholder="rahul@mahalaxmi.com"
            value={addForm.email}
            onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
          />

          <Input
            label="Temporary Password"
            type="password"
            required
            placeholder="Minimum 6 characters"
            value={addForm.password}
            onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold text-pos-text uppercase tracking-wider mb-1.5">
              Role Permission
            </label>
            <select
              value={addForm.role}
              onChange={(e) => setAddForm({ ...addForm, role: e.target.value as Role })}
              className="w-full rounded-lg border border-pos-border bg-white px-3 py-2 text-xs font-medium text-pos-text focus:outline-none focus:border-forest-700"
            >
              <option value="STAFF">STAFF (Orders, POS & Billing)</option>
              <option value="ADMIN">ADMIN (Full Control, Menu & Reports)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-pos-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={Boolean(resetModalUser)}
        onClose={() => setResetModalUser(null)}
        title="Reset Password"
        description={resetModalUser ? `Set a new secure password for ${resetModalUser.username}` : ''}
        maxWidth="sm"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            required
            placeholder="Enter new password (min. 6 characters)"
            autoFocus
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setResetModalUser(null)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Confirm Reset
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffManagementPage;
