import React, { useEffect, useState } from 'react';
import { adminMenuService } from '../services/adminMenuService';
import type { MenuCategory, MenuItem } from '../types/pos';
import type { CreateMenuItemRequest, UpdateMenuItemRequest } from '../types/admin';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

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
    setTimeout(() => setSuccessMsg(null), 3500);
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
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-pos-border rounded-xl p-5 shadow-subtle">
        <div>
          <h2 className="text-xl font-bold text-pos-text tracking-tight">Menu Management</h2>
          <p className="text-xs text-pos-muted mt-0.5">
            Manage recipes, update prices, toggle live stock, and organize dining categories
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => setCategoryModalOpen(true)}
          >
            + New Category
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => openItemModal()}
          >
            + Add Menu Item
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-600">✓</span>
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-xs font-semibold text-emerald-700 hover:underline">
            ✕
          </button>
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-red-600">⚠</span>
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-xs font-semibold text-red-700 hover:underline">
            ✕
          </button>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-pos-border bg-white p-4 shadow-subtle">
          <p className="text-xs font-semibold uppercase tracking-wider text-pos-muted">Total Items</p>
          <p className="mt-1 text-2xl font-bold text-pos-text">{items.length}</p>
        </div>
        <div className="rounded-xl border border-pos-border bg-white p-4 shadow-subtle">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">In Stock</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{totalInStock}</p>
        </div>
        <div className="rounded-xl border border-pos-border bg-white p-4 shadow-subtle">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-700">Sold Out</p>
          <p className="mt-1 text-2xl font-bold text-red-700">{totalSoldOut}</p>
        </div>
        <div className="rounded-xl border border-pos-border bg-white p-4 shadow-subtle">
          <p className="text-xs font-semibold uppercase tracking-wider text-forest-800">Categories</p>
          <p className="mt-1 text-2xl font-bold text-forest-900">{categories.length}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-pos-border bg-white p-4 shadow-subtle">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              selectedCategory === null
                ? 'bg-forest text-white shadow-xs'
                : 'bg-ivory text-pos-muted hover:bg-forest-50 hover:text-pos-text'
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
                  ? 'bg-forest text-white shadow-xs'
                  : 'bg-ivory text-pos-muted hover:bg-forest-50 hover:text-pos-text'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items..."
              className="w-full md:w-60 rounded-lg border border-pos-border bg-ivory/50 px-3 py-1.5 text-xs text-pos-text placeholder-pos-muted/60 focus:outline-none focus:border-forest-700 focus:bg-white"
            />
          </div>
          <Button type="submit" variant="forest" size="sm">
            Filter
          </Button>
        </form>
      </div>

      {/* Items Table */}
      <div className="overflow-hidden rounded-xl border border-pos-border bg-white shadow-subtle">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-pos-muted">Loading menu items...</div>
        ) : items.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No menu items found"
              description="Click '+ Add Menu Item' to create your first dish or recipe."
              action={
                <Button variant="primary" size="sm" onClick={() => openItemModal()}>
                  + Add Menu Item
                </Button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-pos-border bg-ivory text-xs uppercase tracking-wider text-pos-muted font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Item</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Price</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Availability</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pos-border">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-ivory/40 transition-colors">
                    <td className="px-5 py-4 font-semibold text-pos-text">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block h-2.5 w-2.5 rounded-full ${
                            item.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                          }`}
                          title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                        />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-md border border-pos-border bg-ivory px-2 py-0.5 text-[11px] font-medium text-pos-text">
                        {item.categoryName}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-pos-text">₹{Number(item.price).toFixed(2)}</span>
                        <button
                          onClick={() => {
                            setQuickPriceItem(item);
                            setQuickPriceValue(item.price.toString());
                          }}
                          className="rounded p-1 text-pos-muted hover:bg-forest-50 hover:text-terracotta transition-colors"
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
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          item.isVeg
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                      >
                        {item.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-all ${
                          item.available
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                        }`}
                        title="Click to toggle stock availability"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            item.available ? 'bg-emerald-600' : 'bg-red-600'
                          }`}
                        />
                        {item.available ? 'In Stock' : 'Sold Out'}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openItemModal(item)}
                          className="rounded-md border border-pos-border bg-white px-2.5 py-1 text-xs font-medium text-pos-text hover:bg-forest-50 hover:text-forest-900 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
                          title="Delete item"
                        >
                          Delete
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

      {/* Quick Price Edit Modal */}
      <Modal
        isOpen={Boolean(quickPriceItem)}
        onClose={() => setQuickPriceItem(null)}
        title="Change Price"
        description={`Update standard menu price for ${quickPriceItem?.name}`}
        maxWidth="sm"
      >
        <form onSubmit={handleQuickPriceSubmit} className="space-y-4">
          <Input
            label="New Price (₹)"
            type="number"
            step="0.01"
            min="0"
            value={quickPriceValue}
            onChange={(e) => setQuickPriceValue(e.target.value)}
            placeholder="0.00"
            autoFocus
          />
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuickPriceItem(null)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Price
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Menu Item Modal */}
      <Modal
        isOpen={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        title={editingItem ? 'Edit Menu Item' : 'New Menu Item'}
        description="Configure dish details, category, and pricing"
        maxWidth="md"
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          <Input
            label="Item Name"
            type="text"
            required
            value={itemForm.name}
            onChange={(e) => setItemForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Special Veg Thali, Chicken Biryani"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-pos-text uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={itemForm.categoryId}
                onChange={(e) => setItemForm((p) => ({ ...p, categoryId: Number(e.target.value) }))}
                className="w-full rounded-lg border border-pos-border bg-white px-3 py-2 text-xs font-medium text-pos-text focus:border-forest-700 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Price (₹)"
              type="number"
              step="0.01"
              min="0"
              required
              value={itemForm.price}
              onChange={(e) => setItemForm((p) => ({ ...p, price: e.target.value }))}
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-pos-text uppercase tracking-wider mb-1.5">
                Dietary Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setItemForm((p) => ({ ...p, isVeg: true }))}
                  className={`flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-colors ${
                    itemForm.isVeg
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-pos-border bg-white text-pos-muted'
                  }`}
                >
                  🟢 Veg
                </button>
                <button
                  type="button"
                  onClick={() => setItemForm((p) => ({ ...p, isVeg: false }))}
                  className={`flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-colors ${
                    !itemForm.isVeg
                      ? 'border-red-600 bg-red-50 text-red-800'
                      : 'border-pos-border bg-white text-pos-muted'
                  }`}
                >
                  🔴 Non-Veg
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-pos-text uppercase tracking-wider mb-1.5">
                Stock Status
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setItemForm((p) => ({ ...p, available: true }))}
                  className={`flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-colors ${
                    itemForm.available
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-pos-border bg-white text-pos-muted'
                  }`}
                >
                  In Stock
                </button>
                <button
                  type="button"
                  onClick={() => setItemForm((p) => ({ ...p, available: false }))}
                  className={`flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-colors ${
                    !itemForm.available
                      ? 'border-red-600 bg-red-50 text-red-800'
                      : 'border-pos-border bg-white text-pos-muted'
                  }`}
                >
                  Sold Out
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-pos-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setItemModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingItem ? 'Save Changes' : 'Create Item'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title="Add Menu Category"
        description="Create a new classification for items (e.g. Starters, Thalis, Beverages)"
        maxWidth="sm"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <Input
            label="Category Name"
            type="text"
            required
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="e.g. Desserts, Beverages"
            autoFocus
          />
          <Input
            label="Display Order"
            type="number"
            value={newCategoryOrder || ''}
            onChange={(e) => setNewCategoryOrder(Number(e.target.value))}
            placeholder="e.g. 1, 2, 3"
          />
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCategoryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminMenuPage;
