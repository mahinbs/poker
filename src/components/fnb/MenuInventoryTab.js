import React, { useState, useEffect } from 'react';
import { fnbAPI } from '../../lib/api';
import { storageService } from '../../lib/storage';

export default function MenuInventoryTab({ clubId }) {
  const [activeSubTab, setActiveSubTab] = useState('menu');
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Load data
  useEffect(() => {
    if (activeSubTab === 'menu') {
      loadMenuItems();
      loadCategories();
    } else {
      loadInventory();
    }
  }, [clubId, activeSubTab]);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const data = await fnbAPI.getMenu(clubId);
      setMenuItems(data);
    } catch (error) {
      console.error('Error loading menu items:', error);
      alert('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await fnbAPI.getAllMenuCategories(clubId);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await fnbAPI.getInventory(clubId);
      setInventory(data);
    } catch (error) {
      console.error('Error loading inventory:', error);
      alert('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex space-x-4">
        <button
          onClick={() => setActiveSubTab('menu')}
          className={`px-6 py-3 rounded-lg font-semibold ${
            activeSubTab === 'menu'
              ? 'bg-orange-600 text-white'
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
          }`}
        >
          Menu Management
        </button>
        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`px-6 py-3 rounded-lg font-semibold ${
            activeSubTab === 'inventory'
              ? 'bg-orange-600 text-white'
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
          }`}
        >
          Inventory Management
        </button>
      </div>

      {/* Menu Management */}
      {activeSubTab === 'menu' && (
        <div className="space-y-6">
          {/* Actions */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <button
                onClick={() => setShowAddItemModal(true)}
                className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2"
              >
                <span>➕</span>
                <span>Add Menu Item</span>
              </button>
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2"
              >
                <span>📁</span>
                <span>Add Category</span>
              </button>
            </div>
          </div>

          {/* Menu Items Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading menu items...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onEdit={() => {
                    setSelectedItem(item);
                    setShowAddItemModal(true);
                  }}
                  onDelete={async () => {
                    if (window.confirm('Delete this menu item?')) {
                      try {
                        await fnbAPI.deleteMenuItem(clubId, item.id);
                        loadMenuItems();
                      } catch (error) {
                        alert('Failed to delete item');
                      }
                    }
                  }}
                />
              ))}
            </div>
          )}

          {menuItems.length === 0 && !loading && (
            <div className="text-center py-12 bg-slate-800 rounded-xl">
              <p className="text-gray-400 text-lg">No menu items yet</p>
              <button
                onClick={() => setShowAddItemModal(true)}
                className="mt-4 text-orange-500 hover:text-orange-400"
              >
                Add your first menu item
              </button>
            </div>
          )}
        </div>
      )}

      {/* Inventory Management */}
      {activeSubTab === 'inventory' && (
        <InventoryManagement
          clubId={clubId}
          inventory={inventory}
          loading={loading}
          onUpdate={loadInventory}
        />
      )}

      {/* Add/Edit Menu Item Modal */}
      {showAddItemModal && (
        <AddMenuItemModal
          clubId={clubId}
          categories={categories}
          item={selectedItem}
          onClose={() => {
            setShowAddItemModal(false);
            setSelectedItem(null);
          }}
          onSave={() => {
            setShowAddItemModal(false);
            setSelectedItem(null);
            loadMenuItems();
          }}
        />
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <AddCategoryModal
          clubId={clubId}
          onClose={() => setShowAddCategoryModal(false)}
          onSave={() => {
            setShowAddCategoryModal(false);
            loadCategories();
          }}
        />
      )}
    </div>
  );
}

// Menu Item Card Component
function MenuItemCard({ item, onEdit, onDelete }) {
  const getAvailabilityBadge = (availability) => {
    const badges = {
      available: { bg: 'bg-green-500', text: 'Available' },
      limited: { bg: 'bg-yellow-500', text: 'Limited' },
      out_of_stock: { bg: 'bg-red-500', text: 'Out of Stock' },
    };
    const badge = badges[availability] || badges.available;
    return (
      <span className={`${badge.bg} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-orange-500 transition-all">
      {/* Images */}
      <div className="h-48 bg-slate-900 flex overflow-x-auto">
        {item.imageUrl1 && (
          <img src={item.imageUrl1} alt={item.name} className="h-full w-full object-cover flex-shrink-0" />
        )}
        {item.imageUrl2 && (
          <img src={item.imageUrl2} alt={item.name} className="h-full w-full object-cover flex-shrink-0" />
        )}
        {item.imageUrl3 && (
          <img src={item.imageUrl3} alt={item.name} className="h-full w-full object-cover flex-shrink-0" />
        )}
        {!item.imageUrl1 && !item.imageUrl2 && !item.imageUrl3 && (
          <div className="h-full w-full flex items-center justify-center text-gray-500">
            <span className="text-6xl">🍽️</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-white">{item.name}</h3>
          {getAvailabilityBadge(item.availability)}
        </div>

        <p className="text-gray-400 text-sm line-clamp-2">{item.description || 'No description'}</p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-orange-500">₹{item.price}</p>
            <p className="text-xs text-gray-500">{item.category}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Stock: {item.stock}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          <button
            onClick={onEdit}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Add/Edit Menu Item Modal
function AddMenuItemModal({ clubId, categories, item, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    category: item?.category || '',
    isCustomCategory: item?.isCustomCategory || false,
    price: item?.price || 0,
    stock: item?.stock || 0,
    description: item?.description || '',
    availability: item?.availability || 'available',
    imageUrl1: item?.imageUrl1 || '',
    imageUrl2: item?.imageUrl2 || '',
    imageUrl3: item?.imageUrl3 || '',
  });
  const [uploading, setUploading] = useState({ img1: false, img2: false, img3: false });
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (file, imageNumber) => {
    try {
      setUploading({ ...uploading, [`img${imageNumber}`]: true });
      const url = await storageService.uploadDocument(file, clubId, 'menu-items');
      setFormData({ ...formData, [`imageUrl${imageNumber}`]: url });
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading({ ...uploading, [`img${imageNumber}`]: false });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      // Convert string values to proper types for backend validation
      const dataToSend = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0,
      };
      
      if (item) {
        await fnbAPI.updateMenuItem(clubId, item.id, dataToSend);
      } else {
        await fnbAPI.createMenuItem(clubId, dataToSend);
      }
      onSave();
    } catch (error) {
      alert('Failed to save menu item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">
          {item ? 'Edit Menu Item' : 'Add Menu Item'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-white mb-2">Item Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
              placeholder="e.g., Chicken Biryani"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-white mb-2">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => {
                const isCustom = e.target.value === 'Custom';
                setFormData({
                  ...formData,
                  category: isCustom ? '' : e.target.value,
                  isCustomCategory: isCustom,
                });
              }}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.categoryName}>
                  {cat.categoryName}
                </option>
              ))}
              <option value="Custom">Custom...</option>
            </select>
            {formData.isCustomCategory && (
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg mt-2"
                placeholder="Enter custom category name"
              />
            )}
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2">Price (₹) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
              />
            </div>
            <div>
              <label className="block text-white mb-2">Stock</label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
              />
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-white mb-2">Availability *</label>
            <select
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
            >
              <option value="available">Available</option>
              <option value="limited">Limited</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-white mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
              rows="3"
              placeholder="Describe the item..."
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-white mb-2">Images (up to 3)</label>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((num) => (
                <div key={num} className="space-y-2">
                  <div className="h-32 bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden">
                    {formData[`imageUrl${num}`] ? (
                      <img
                        src={formData[`imageUrl${num}`]}
                        alt={`Preview ${num}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500 text-4xl">📷</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0], num)}
                    disabled={uploading[`img${num}`]}
                    className="w-full text-sm text-gray-400"
                  />
                  {uploading[`img${num}`] && <p className="text-xs text-orange-500">Uploading...</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving...' : item ? 'Update Item' : 'Add Item'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add Category Modal
function AddCategoryModal({ clubId, onClose, onSave }) {
  const [categoryName, setCategoryName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await fnbAPI.createMenuCategory(clubId, categoryName);
      onSave();
    } catch (error) {
      alert('Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-6">Add Custom Category</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white mb-2">Category Name *</label>
            <input
              type="text"
              required
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
              placeholder="e.g., Special Items"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Category'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Inventory Management Component
function InventoryManagement({ clubId, inventory, loading, onUpdate }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const getStockStatus = (currentStock, minStock) => {
    if (currentStock === 0) return { color: 'text-red-500', label: 'Out of Stock', bg: 'bg-red-500/20' };
    if (currentStock <= minStock) return { color: 'text-yellow-500', label: 'Critical', bg: 'bg-yellow-500/20' };
    if (currentStock <= minStock * 2) return { color: 'text-orange-500', label: 'Low', bg: 'bg-orange-500/20' };
    return { color: 'text-green-500', label: 'Good', bg: 'bg-green-500/20' };
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 rounded-lg flex justify-between items-center">
        <div>
          <h3 className="text-white font-semibold">End of Day Stock Update</h3>
          <p className="text-white/80 text-sm">Update inventory levels after service</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-semibold"
        >
          + Add Inventory Item
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map((item) => {
            const status = getStockStatus(item.currentStock, item.minStock);
            return (
              <div
                key={item.id}
                className={`bg-slate-800 rounded-xl p-4 border border-slate-700 ${status.bg}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-white font-bold">{item.name}</h4>
                  <span className={`text-xs font-semibold ${status.color}`}>{status.label}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Stock:</span>
                    <span className={`font-bold ${status.color}`}>{item.currentStock} {item.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Min Stock:</span>
                    <span className="text-white">{item.minStock} {item.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cost:</span>
                    <span className="text-white">₹{item.cost || 0}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedItem(item)}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Update Stock
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedItem && (
        <UpdateStockModal
          clubId={clubId}
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSave={() => {
            setSelectedItem(null);
            onUpdate();
          }}
        />
      )}

      {showAddModal && (
        <AddInventoryItemModal
          clubId={clubId}
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setShowAddModal(false);
            onUpdate();
          }}
        />
      )}
    </div>
  );
}

// Update Stock Modal
function UpdateStockModal({ clubId, item, onClose, onSave }) {
  const [currentStock, setCurrentStock] = useState(item.currentStock);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await fnbAPI.updateInventory(clubId, item.id, { currentStock });
      onSave();
    } catch (error) {
      alert('Failed to update stock');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-6">Update Stock</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-gray-400 mb-4">Item: <span className="text-white font-bold">{item.name}</span></p>
            <label className="block text-white mb-2">Current Stock ({item.unit})</label>
            <input
              type="number"
              required
              min="0"
              value={currentStock}
              onChange={(e) => setCurrentStock(parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
            />
            <p className="text-xs text-gray-400 mt-1">Minimum: {item.minStock} {item.unit}</p>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Update'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add Inventory Item Modal
function AddInventoryItemModal({ clubId, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    currentStock: 0,
    minStock: 0,
    supplier: '',
    cost: 0,
    unit: 'units'
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await fnbAPI.createInventoryItem(clubId, formData);
      onSave();
    } catch (error) {
      console.error('Error creating inventory item:', error);
      alert('Failed to create inventory item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Add Inventory Item</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2 font-semibold">Item Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
                placeholder="e.g., Tomatoes, Flour, etc."
              />
            </div>

            <div>
              <label className="block text-white mb-2 font-semibold">Category *</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
                placeholder="e.g., Vegetables, Dry Goods, etc."
              />
            </div>

            <div>
              <label className="block text-white mb-2 font-semibold">Current Stock *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
              />
            </div>

            <div>
              <label className="block text-white mb-2 font-semibold">Minimum Stock *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
              />
            </div>

            <div>
              <label className="block text-white mb-2 font-semibold">Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
              >
                <option value="units">Units</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="L">Liters (L)</option>
                <option value="ml">Milliliters (ml)</option>
                <option value="pieces">Pieces</option>
                <option value="boxes">Boxes</option>
                <option value="packets">Packets</option>
              </select>
            </div>

            <div>
              <label className="block text-white mb-2 font-semibold">Cost (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
                placeholder="0.00"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-white mb-2 font-semibold">Supplier (Optional)</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
                placeholder="Supplier name"
              />
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Item'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

