import React, { useState, useEffect } from 'react';
import { fnbAPI } from '../../lib/api';

const DEFAULT_SPECIALIZATIONS = [
  { value: 'meat_poultry', label: 'Meat & Poultry' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'spices', label: 'Spices' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'beverages', label: 'Beverages' },
];

export default function SupplierManagementTab({ clubId }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  useEffect(() => {
    loadSuppliers();
  }, [clubId]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await fnbAPI.getSuppliers(clubId, false);
      setSuppliers(data);
    } catch (error) {
      console.error('Error loading suppliers:', error);
      alert('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Supplier Management</h2>
          <p className="text-gray-400">Manage your food & beverage suppliers</p>
        </div>
        <button
          onClick={() => {
            setSelectedSupplier(null);
            setShowAddModal(true);
          }}
          className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Add Supplier</span>
        </button>
      </div>

      {/* Suppliers Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading suppliers...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              onEdit={() => {
                setSelectedSupplier(supplier);
                setShowAddModal(true);
              }}
              onDelete={async () => {
                if (window.confirm(`Delete supplier "${supplier.name}"?`)) {
                  try {
                    await fnbAPI.deleteSupplier(clubId, supplier.id);
                    loadSuppliers();
                  } catch (error) {
                    alert('Failed to delete supplier');
                  }
                }
              }}
            />
          ))}
        </div>
      )}

      {suppliers.length === 0 && !loading && (
        <div className="text-center py-12 bg-slate-800 rounded-xl">
          <p className="text-gray-400 text-lg">No suppliers yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 text-orange-500 hover:text-orange-400"
          >
            Add your first supplier
          </button>
        </div>
      )}

      {/* Add/Edit Supplier Modal */}
      {showAddModal && (
        <AddSupplierModal
          clubId={clubId}
          supplier={selectedSupplier}
          onClose={() => {
            setShowAddModal(false);
            setSelectedSupplier(null);
          }}
          onSave={() => {
            setShowAddModal(false);
            setSelectedSupplier(null);
            loadSuppliers();
          }}
        />
      )}
    </div>
  );
}

// Supplier Card Component
function SupplierCard({ supplier, onEdit, onDelete }) {
  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push('⭐');
      } else if (i === fullStars && hasHalfStar) {
        stars.push('⭐');
      } else {
        stars.push('☆');
      }
    }
    return stars.join('');
  };

  return (
    <div className={`bg-slate-800 rounded-xl p-6 border ${supplier.isActive ? 'border-green-500' : 'border-slate-700'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1">{supplier.name}</h3>
          <p className="text-sm text-gray-400">{supplier.contact || 'No contact person'}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            supplier.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
          }`}
        >
          {supplier.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        {supplier.phone && (
          <p className="text-gray-300 text-sm flex items-center space-x-2">
            <span>📞</span>
            <span>{supplier.phone}</span>
          </p>
        )}
        {supplier.email && (
          <p className="text-gray-300 text-sm flex items-center space-x-2">
            <span>📧</span>
            <span>{supplier.email}</span>
          </p>
        )}
        {supplier.address && (
          <p className="text-gray-400 text-xs flex items-center space-x-2">
            <span>📍</span>
            <span className="line-clamp-2">{supplier.address}</span>
          </p>
        )}
      </div>

      {/* Rating */}
      {supplier.rating && (
        <div className="mb-4">
          <p className="text-yellow-400 text-lg">{getRatingStars(supplier.rating)}</p>
          <p className="text-xs text-gray-400">{supplier.rating}/5.0</p>
        </div>
      )}

      {/* Specializations */}
      {supplier.specializations && supplier.specializations.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">Specializations:</p>
          <div className="flex flex-wrap gap-2">
            {supplier.specializations.map((spec, idx) => (
              <span
                key={idx}
                className="bg-blue-600/30 text-blue-300 px-2 py-1 rounded text-xs"
              >
                {spec.replace('_', ' & ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-2 pt-4 border-t border-slate-700">
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
  );
}

// Add/Edit Supplier Modal
function AddSupplierModal({ clubId, supplier, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    contact: supplier?.contact || '',
    phone: supplier?.phone || '',
    email: supplier?.email || '',
    address: supplier?.address || '',
    rating: supplier?.rating || 0,
    isActive: supplier?.isActive ?? true,
    specializations: supplier?.specializations || [],
  });
  const [customSpecialization, setCustomSpecialization] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleSpecialization = (value) => {
    if (formData.specializations.includes(value)) {
      setFormData({
        ...formData,
        specializations: formData.specializations.filter((s) => s !== value),
      });
    } else {
      setFormData({
        ...formData,
        specializations: [...formData.specializations, value],
      });
    }
  };

  const addCustomSpecialization = () => {
    if (customSpecialization.trim() && !formData.specializations.includes(customSpecialization.trim())) {
      setFormData({
        ...formData,
        specializations: [...formData.specializations, customSpecialization.trim()],
      });
      setCustomSpecialization('');
    }
  };

  const removeSpecialization = (spec) => {
    setFormData({
      ...formData,
      specializations: formData.specializations.filter((s) => s !== spec),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (supplier) {
        await fnbAPI.updateSupplier(clubId, supplier.id, formData);
      } else {
        await fnbAPI.createSupplier(clubId, formData);
      }
      onSave();
    } catch (error) {
      alert('Failed to save supplier');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">
          {supplier ? 'Edit Supplier' : 'Add Supplier'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-white mb-2">Supplier Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
              placeholder="e.g., Fresh Foods Ltd."
            />
          </div>

          {/* Contact Person */}
          <div>
            <label className="block text-white mb-2">Contact Person</label>
            <input
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
              placeholder="e.g., John Smith"
            />
          </div>

          {/* Phone and Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="block text-white mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
                placeholder="supplier@example.com"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-white mb-2">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
              rows="2"
              placeholder="Full address..."
            />
          </div>

          {/* Specializations */}
          <div>
            <label className="block text-white mb-2">Specializations</label>
            <div className="space-y-3">
              {/* Default Specializations */}
              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_SPECIALIZATIONS.map((spec) => (
                  <label
                    key={spec.value}
                    className="flex items-center space-x-2 bg-slate-700 p-3 rounded-lg cursor-pointer hover:bg-slate-600"
                  >
                    <input
                      type="checkbox"
                      checked={formData.specializations.includes(spec.value)}
                      onChange={() => toggleSpecialization(spec.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-white">{spec.label}</span>
                  </label>
                ))}
              </div>

              {/* Custom Specialization */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customSpecialization}
                  onChange={(e) => setCustomSpecialization(e.target.value)}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg"
                  placeholder="Add custom specialization..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSpecialization())}
                />
                <button
                  type="button"
                  onClick={addCustomSpecialization}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Add
                </button>
              </div>

              {/* Selected Custom Specializations */}
              {formData.specializations.filter(
                (s) => !DEFAULT_SPECIALIZATIONS.some((ds) => ds.value === s)
              ).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.specializations
                    .filter((s) => !DEFAULT_SPECIALIZATIONS.some((ds) => ds.value === s))
                    .map((spec) => (
                      <span
                        key={spec}
                        className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                      >
                        <span>{spec}</span>
                        <button
                          type="button"
                          onClick={() => removeSpecialization(spec)}
                          className="text-white hover:text-red-300"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Rating and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2">Rating (0-5)</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
              />
            </div>
            <div>
              <label className="block text-white mb-2">Status</label>
              <select
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving...' : supplier ? 'Update Supplier' : 'Add Supplier'}
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

