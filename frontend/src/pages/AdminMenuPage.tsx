import React, { useEffect, useState } from 'react';
import { adminMenuService } from '../services/adminMenuService';
import type { MenuCategory, MenuItem } from '../types/pos';
import type { CreateMenuItemRequest, UpdateMenuItemRequest } from '../types/admin';

const AdminMenuPage: React.FC = () => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals state
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemForm, setItemForm] = useState({
    categoryId: 0,
    name: '',
    price: '',
    isVeg: true,
    available: true,
    displayOrder: 0,
  });

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryOrder, setNewCategoryOrder] = useState(0);

  // Quick price edit inline modal
  const [quickPriceItem, setQuickPriceItem] = useState<MenuItem | null>(null);
  const [quickPriceValue, setQuickPriceValue] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [cats, menuItems] = await Promise.all([
        adminMenuService.getCategories(),
        adminMenuService.getAdminMenuItems(selectedCategory ?? undefined, search),
      ]);
      setCategories(cats);
      setItems(menuItems);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load menu data';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Availability Toggle
  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const updated = await adminMenuService.toggleAvailability(item.id, !item.available);
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      showNotification(`${item.name} is now ${updated.available ? 'IN STOCK' : 'SOLD OUT'}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to toggle availability';
      setError(msg);
    }
  };

  // Quick Price Update
  const handleQuickPriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPriceItem) return;
    const priceNum = parseFloat(quickPriceValue);
    if (isNaN(priceNum) || priceNum < 0) {
      setError('Please enter a valid price');
      return;
    }

    try {
      const req: UpdateMenuItemRequest = {
        categoryId: quickPriceItem.categoryId,
        name: quickPriceItem.name,
        price: priceNum,
        vegetarian: quickPriceItem.isVeg,
        available: quickPriceItem.available,
        displayOrder: quickPriceItem.displayOrder,
      };
      const updated = await adminMenuService.updateMenuItem(quickPriceItem.id, req);
      setItems((prev) => prev.map((i) => (i.id === quickPriceItem.id ? updated : i)));
      showNotification(`Price updated for ${quickPriceItem.name}: ₹${priceNum.toFixed(2)}`);
      setQuickPriceItem(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update price';
      setError(msg);
    }
  };

  // Open Item Modal (Add / Edit)
  const openItemModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        categoryId: item.categoryId,
        name: item.name,
        price: item.price.toString(),
        isVeg: item.isVeg,
        available: item.available,
        displayOrder: item.displayOrder,
      });
    } else {
      setEditingItem(null);
      setItemForm({
        categoryId: categories.length > 0 ? categories[0].id : 0,
        name: '',
        price: '',
        isVeg: true,
        available: true,
        displayOrder: items.length + 1,
      });
    }
    setItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(itemForm.price);
    if (!itemForm.name.trim() || isNaN(priceNum) || priceNum < 0 || !itemForm.categoryId) {
      setError('Please provide a valid name, price, and category');
      return;
    }

    try {
      if (editingItem) {
        const req: UpdateMenuItemRequest = {
          categoryId: itemForm.categoryId,
          name: itemForm.name.trim(),
          price: priceNum,
          vegetarian: itemForm.isVeg,
          available: itemForm.available,
          displayOrder: itemForm.displayOrder,
        };
        const updated = await adminMenuService.updateMenuItem(editingItem.id, req);
        setItems((prev) => prev.map((i) => (i.id === editingItem.id ? updated : i)));
        showNotification(`Updated item: ${updated.name}`);
      } else {
        const req: CreateMenuItemRequest = {
          categoryId: itemForm.categoryId,
          name: itemForm.name.trim(),
          price: priceNum,
          vegetarian: itemForm.isVeg,
          available: itemForm.available,
          displayOrder: itemForm.displayOrder,
        };
        const created = await adminMenuService.createMenuItem(req);
        setItems((prev) => [...prev, created]);
        showNotification(`Created item: ${created.name}`);
      }
      setItemModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save menu item';
      setError(msg);
    }
  };

  // Delete Item
  const handleDeleteItem = async (item: MenuItem) => {
    if (!window.confirm(`Are you sure you want to deactivate or delete "${item.name}"?`)) return;
    try {
      await adminMenuService.deleteMenuItem(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      showNotification(`Item "${item.name}" removed`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete item';
      setError(msg);
    }
  };

  // Add Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const created = await adminMenuService.createCategory({
        name: newCategoryName.trim(),
        displayOrder: newCategoryOrder || categories.length + 1,
        active: true,
      });
      setCategories((prev) => [...prev, created]);
      setCategoryModalOpen(false);
      setNewCategoryName('');
      showNotification(`Category "${created.name}" created`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create category';
      setError(msg);
    }
  };

  const totalInStock = items.filter((i) => i.available).length;
  const totalSoldOut = items.filter((i) => !i.available).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Menu Management</h2>
          <p className="text-sm text-gray-400 mt-1">
            Manage items, change prices, toggle availability, and organize categories
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCategoryModalOpen(true)}
            className="rounded-lg border border-white/10 bg-surface-card px-4 py-2.5 text-sm font-semibold text-gray-200 hover:bg-white/5 transition-colors"
          >
            + New Category
          </button>
          <button
            onClick={() => openItemModal()}
            className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-colors"
          >
            + Add Menu Item
          </button>
        </div>
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
          <p className="text-xs uppercase tracking-wide text-gray-500">Total Items</p>
          <p className="mt-1 text-2xl font-bold text-white">{items.length}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-surface-light p-4">
          <p className="text-xs uppercase tracking-wide text-green-400">In Stock</p>
          <p className="mt-1 text-2xl font-bold text-green-400">{totalInStock}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-surface-light p-4">
          <p className="text-xs uppercase tracking-wide text-red-400">Sold Out</p>
          <p className="mt-1 text-2xl font-bold text-red-400">{totalSoldOut}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-surface-light p-4">
          <p className="text-xs uppercase tracking-wide text-brand-400">Categories</p>
          <p className="mt-1 text-2xl font-bold text-brand-400">{categories.length}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-white/5 bg-surface-light p-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              selectedCategory === null
                ? 'bg-brand-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-brand-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className="w-full md:w-60 rounded-lg border border-white/10 bg-surface px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-surface-card px-3 py-1.5 text-xs font-semibold text-gray-300 hover:bg-white/10"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Items Table */}
      <div className="overflow-hidden rounded-xl border border-white/5 bg-surface-light">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Loading menu items...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No menu items found. Click "+ Add Menu Item" to create one.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="border-b border-white/5 bg-white/[0.02] text-xs uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="px-5 py-3">Item</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Availability</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block h-2.5 w-2.5 rounded-full ${
                            item.isVeg ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                        />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded bg-white/5 px-2 py-1 text-xs text-gray-400">
                        {item.categoryName}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">₹{Number(item.price).toFixed(2)}</span>
                        <button
                          onClick={() => {
                            setQuickPriceItem(item);
                            setQuickPriceValue(item.price.toString());
                          }}
                          className="rounded p-1 text-gray-400 hover:bg-white/10 hover:text-brand-400 transition-colors"
                          title="Quick edit price"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          item.isVeg
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {item.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          item.available ? 'bg-green-500' : 'bg-gray-700'
                        }`}
                        title={item.available ? 'Mark as Sold Out' : 'Mark as In Stock'}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            item.available ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className={`ml-2 text-xs font-medium ${item.available ? 'text-green-400' : 'text-gray-500'}`}>
                        {item.available ? 'In Stock' : 'Sold Out'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openItemModal(item)}
                          className="rounded p-1.5 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                          title="Edit Item"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="rounded p-1.5 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          title="Delete / Deactivate"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Price Modal */}
      {quickPriceItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-surface-light p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Change Price</h3>
            <p className="text-xs text-gray-400 mt-1">
              Update price for <span className="text-white font-medium">{quickPriceItem.name}</span>
            </p>
            <form onSubmit={handleQuickPriceSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">New Price (₹)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  autoFocus
                  value={quickPriceValue}
                  onChange={(e) => setQuickPriceValue(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickPriceItem(null)}
                  className="rounded-lg px-3 py-1.5 text-xs text-gray-400 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
                >
                  Update Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Menu Item Modal */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-surface-light p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h3>
            <form onSubmit={handleSaveItem} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Category</label>
                <select
                  value={itemForm.categoryId}
                  onChange={(e) => setItemForm({ ...itemForm, categoryId: parseInt(e.target.value) })}
                  className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-surface">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Veg Thali"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    placeholder="170"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={itemForm.displayOrder}
                    onChange={(e) => setItemForm({ ...itemForm, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={itemForm.isVeg}
                    onChange={(e) => setItemForm({ ...itemForm, isVeg: e.target.checked })}
                    className="rounded border-gray-600 bg-surface text-brand-500 focus:ring-brand-500"
                  />
                  <span>Vegetarian</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={itemForm.available}
                    onChange={(e) => setItemForm({ ...itemForm, available: e.target.checked })}
                    className="rounded border-gray-600 bg-surface text-brand-500 focus:ring-brand-500"
                  />
                  <span>In Stock</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setItemModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-xs font-medium text-gray-400 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-brand-600"
                >
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-surface-light p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Add Category</h3>
            <form onSubmit={handleCreateCategory} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thali, Chicken, Mutton"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Display Order</label>
                <input
                  type="number"
                  value={newCategoryOrder}
                  onChange={(e) => setNewCategoryOrder(parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-gray-400 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenuPage;
