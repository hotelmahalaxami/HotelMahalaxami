import React, { useEffect, useState } from 'react';
import type { RestaurantTable, CreateTableRequest, UpdateTableRequest } from '../types/table';
import { tableService } from '../services/tableService';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

const TableManagementPage: React.FC = () => {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    tableName: '',
    capacity: 4,
    displayOrder: 0,
    active: true,
  });

  const loadTables = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all tables including inactive ones for admin view
      const data = await tableService.getTables(true);
      setTables(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load restaurant tables';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const openCreateModal = () => {
    setFormData({ tableName: '', capacity: 4, displayOrder: tables.length + 1, active: true });
    setIsCreateOpen(true);
  };

  const openEditModal = (table: RestaurantTable) => {
    setEditingTable(table);
    setFormData({
      tableName: table.tableName,
      capacity: table.capacity,
      displayOrder: table.displayOrder,
      active: table.active,
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tableName.trim()) return;
    setError(null);
    setSuccess(null);
    try {
      const payload: CreateTableRequest = {
        tableName: formData.tableName.trim(),
        capacity: Number(formData.capacity) || 4,
        displayOrder: Number(formData.displayOrder) || 0,
      };
      await tableService.createTable(payload);
      setSuccess(`Table '${formData.tableName}' added successfully!`);
      setIsCreateOpen(false);
      loadTables();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create table';
      setError(msg);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable || !formData.tableName.trim()) return;
    setError(null);
    setSuccess(null);
    try {
      const payload: UpdateTableRequest = {
        tableName: formData.tableName.trim(),
        capacity: Number(formData.capacity) || 4,
        active: formData.active,
        displayOrder: Number(formData.displayOrder) || 0,
      };
      await tableService.updateTable(editingTable.id, payload);
      setSuccess(`Table '${formData.tableName}' updated successfully!`);
      setEditingTable(null);
      loadTables();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update table';
      setError(msg);
    }
  };

  const handleDeactivate = async (table: RestaurantTable) => {
    if (table.isOccupied) {
      alert(`Cannot deactivate ${table.tableName} because it is currently occupied by active order ${table.currentOrderNumber}.`);
      return;
    }
    if (!window.confirm(`Are you sure you want to deactivate ${table.tableName}?`)) {
      return;
    }
    try {
      await tableService.deleteTable(table.id);
      setSuccess(`Table '${table.tableName}' deactivated.`);
      loadTables();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to deactivate table';
      setError(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-pos-border rounded-xl p-5 shadow-subtle">
        <div>
          <h2 className="text-xl font-bold text-pos-text tracking-tight">Restaurant Table Management</h2>
          <p className="text-xs text-pos-muted mt-0.5">
            Configure dining floor layout, seating capacities, and monitor live table occupancy
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={openCreateModal}
          leftIcon={
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Add New Table
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
          {success}
        </div>
      )}

      {/* Table Cards Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : tables.length === 0 ? (
        <EmptyState
          title="No tables configured"
          description="Add dining tables to allow waiters to seat guests and manage floor orders."
          action={
            <Button variant="primary" size="sm" onClick={openCreateModal}>
              Add First Table
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((t) => (
            <div
              key={t.id}
              className={`rounded-xl border p-4 shadow-subtle transition-all flex flex-col justify-between ${
                !t.active
                  ? 'border-dashed border-gray-300 bg-gray-50/70 opacity-60'
                  : t.isOccupied
                  ? 'border-amber-300 bg-amber-50/40'
                  : 'border-pos-border bg-white hover:border-forest-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-pos-text">{t.tableName}</h3>
                  <Badge
                    variant={
                      !t.active
                        ? 'neutral'
                        : t.isOccupied
                        ? 'warning'
                        : 'success'
                    }
                    size="sm"
                  >
                    {!t.active ? 'INACTIVE' : t.isOccupied ? 'OCCUPIED' : 'AVAILABLE'}
                  </Badge>
                </div>

                <div className="mt-2 text-xs space-y-1 text-pos-muted">
                  <p>
                    Seating Capacity: <span className="font-semibold text-pos-text">{t.capacity} guests</span>
                  </p>
                  <p>
                    Floor Sequence: <span className="font-mono text-pos-text">#{t.displayOrder}</span>
                  </p>
                  {t.isOccupied && (
                    <div className="mt-2 pt-2 border-t border-amber-200/60 text-[11px] text-amber-900">
                      <p className="font-bold">Active Ticket:</p>
                      <p className="font-mono">{t.currentOrderNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-pos-border/50 flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => openEditModal(t)}>
                  Edit
                </Button>
                {t.active && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeactivate(t)}
                    disabled={t.isOccupied}
                    className="text-red-700 hover:bg-red-50"
                  >
                    Deactivate
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Table Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Dining Table"
        description="Configure table identifier and guest seating capacity"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-pos-muted mb-1">
              Table Name or Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Table 9, Garden 1, VIP Cabin"
              value={formData.tableName}
              onChange={(e) => setFormData({ ...formData, tableName: e.target.value })}
              className="w-full rounded-lg border border-pos-border p-2 text-sm text-pos-text focus:outline-none focus:border-forest-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-pos-muted mb-1">
                Seating Capacity
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full rounded-lg border border-pos-border p-2 text-sm text-pos-text focus:outline-none focus:border-forest-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-pos-muted mb-1">
                Display Order
              </label>
              <input
                type="number"
                min="0"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                className="w-full rounded-lg border border-pos-border p-2 text-sm text-pos-text focus:outline-none focus:border-forest-700"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-pos-border">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Table
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Table Modal */}
      <Modal
        isOpen={Boolean(editingTable)}
        onClose={() => setEditingTable(null)}
        title={`Edit ${editingTable?.tableName}`}
        description="Update table name, capacity, or activation status"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-pos-muted mb-1">
              Table Name or Number *
            </label>
            <input
              type="text"
              required
              value={formData.tableName}
              onChange={(e) => setFormData({ ...formData, tableName: e.target.value })}
              className="w-full rounded-lg border border-pos-border p-2 text-sm text-pos-text focus:outline-none focus:border-forest-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-pos-muted mb-1">
                Seating Capacity
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full rounded-lg border border-pos-border p-2 text-sm text-pos-text focus:outline-none focus:border-forest-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-pos-muted mb-1">
                Display Order
              </label>
              <input
                type="number"
                min="0"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                className="w-full rounded-lg border border-pos-border p-2 text-sm text-pos-text focus:outline-none focus:border-forest-700"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="activeCheckbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="h-4 w-4 rounded border-pos-border text-forest-700 focus:ring-forest-600"
            />
            <label htmlFor="activeCheckbox" className="text-xs font-medium text-pos-text">
              Active Table (available for customer seating)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-pos-border">
            <Button variant="outline" size="sm" type="button" onClick={() => setEditingTable(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Update Table
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TableManagementPage;
