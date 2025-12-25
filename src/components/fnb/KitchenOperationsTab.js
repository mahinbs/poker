import React, { useState, useEffect } from 'react';
import { fnbAPI, staffAPI } from '../../lib/api';

export default function KitchenOperationsTab({ clubId }) {
  const [stations, setStations] = useState([]);
  const [dealers, setDealers] = useState([]); // Chefs are stored in staff table
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [stationStats, setStationStats] = useState(null);

  useEffect(() => {
    loadStations();
    loadChefs();
  }, [clubId]);

  const loadStations = async () => {
    try {
      setLoading(true);
      const data = await fnbAPI.getKitchenStations(clubId, false);
      setStations(data);
    } catch (error) {
      console.error('Error loading stations:', error);
      alert('Failed to load kitchen stations');
    } finally {
      setLoading(false);
    }
  };

  const loadChefs = async () => {
    try {
      // Load staff members - only FNB role and custom Staff roles
      // The API returns { success: true, staff: [...] }
      const response = await staffAPI.getAllStaffMembers(clubId);
      const staffList = response?.staff || response || [];
      // Filter to show only active staff with FNB role OR custom Staff roles
      const activeStaff = Array.isArray(staffList) 
        ? staffList.filter(s => {
            const isActive = s.status === 'Active' || !s.status;
            const isFNB = s.role === 'FNB';
            const isCustomStaff = s.role === 'Staff' && s.customRoleName;
            return isActive && (isFNB || isCustomStaff);
          })
        : [];
      setDealers(activeStaff);
    } catch (error) {
      console.error('Error loading chefs:', error);
      // Don't show error to user, just log it - chefs are optional
      setDealers([]);
    }
  };

  const loadStationStats = async (stationId) => {
    try {
      const stats = await fnbAPI.getStationStatistics(clubId, stationId);
      setStationStats(stats);
      setShowStatsModal(true);
    } catch (error) {
      alert('Failed to load station statistics');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Kitchen Operations</h2>
          <p className="text-gray-400">Manage kitchen stations and track progress</p>
        </div>
        <button
          onClick={() => {
            setSelectedStation(null);
            setShowAddModal(true);
          }}
          className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Create Station</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-600/20 border border-blue-500 rounded-xl p-4">
        <h3 className="text-white font-bold mb-2">🏠 Kitchen Station Management</h3>
        <p className="text-blue-200 text-sm">
          Create multiple stations for different food categories. Each station tracks pending and completed orders in real-time.
        </p>
      </div>

      {/* Stations Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading stations...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stations.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              onEdit={() => {
                setSelectedStation(station);
                setShowAddModal(true);
              }}
              onViewStats={() => loadStationStats(station.id)}
              onDelete={async () => {
                if (window.confirm(`Delete station "${station.stationName}"?`)) {
                  try {
                    await fnbAPI.deleteKitchenStation(clubId, station.id);
                    loadStations();
                  } catch (error) {
                    alert(error.message || 'Failed to delete station');
                  }
                }
              }}
              onToggleStatus={async () => {
                try {
                  await fnbAPI.updateKitchenStation(clubId, station.id, {
                    isActive: !station.isActive,
                  });
                  loadStations();
                } catch (error) {
                  alert('Failed to update station status');
                }
              }}
            />
          ))}
        </div>
      )}

      {stations.length === 0 && !loading && (
        <div className="text-center py-12 bg-slate-800 rounded-xl">
          <p className="text-gray-400 text-lg mb-2">No kitchen stations yet</p>
          <p className="text-gray-500 text-sm mb-4">
            Create stations like "Station 1 - Quick Snacks", "Station 2 - Main Meals", etc.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-orange-500 hover:text-orange-400 font-semibold"
          >
            Create your first station
          </button>
        </div>
      )}

      {/* Add/Edit Station Modal */}
      {showAddModal && (
        <AddStationModal
          clubId={clubId}
          station={selectedStation}
          chefs={dealers}
          onClose={() => {
            setShowAddModal(false);
            setSelectedStation(null);
          }}
          onSave={() => {
            setShowAddModal(false);
            setSelectedStation(null);
            loadStations();
          }}
        />
      )}

      {/* Station Statistics Modal */}
      {showStatsModal && stationStats && (
        <StationStatsModal
          stats={stationStats}
          onClose={() => {
            setShowStatsModal(false);
            setStationStats(null);
          }}
        />
      )}
    </div>
  );
}

// Station Card Component
function StationCard({ station, onEdit, onViewStats, onDelete, onToggleStatus }) {
  return (
    <div
      className={`bg-slate-800 rounded-xl p-6 border-2 ${
        station.isActive ? 'border-green-500' : 'border-gray-600'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-3xl">👨‍🍳</span>
            <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              #{station.stationNumber}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white">{station.stationName}</h3>
        </div>
        <button
          onClick={onToggleStatus}
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            station.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
          }`}
        >
          {station.isActive ? 'Active' : 'Inactive'}
        </button>
      </div>

      {/* Chef Info */}
      <div className="mb-4 pb-4 border-b border-slate-700">
        <p className="text-gray-400 text-sm">Chef:</p>
        <p className="text-white font-semibold">{station.chefName || 'Unassigned'}</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-yellow-600/20 rounded-lg p-3">
          <p className="text-yellow-400 text-2xl font-bold">{station.ordersPending}</p>
          <p className="text-yellow-300 text-xs">Pending Orders</p>
        </div>
        <div className="bg-green-600/20 rounded-lg p-3">
          <p className="text-green-400 text-2xl font-bold">{station.ordersCompleted}</p>
          <p className="text-green-300 text-xs">Completed</p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={onViewStats}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold"
        >
          📊 View Statistics
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onEdit}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Add/Edit Station Modal
function AddStationModal({ clubId, station, chefs, onClose, onSave }) {
  const [formData, setFormData] = useState({
    stationName: station?.stationName || '',
    stationNumber: station?.stationNumber || '',
    chefName: station?.chefName || '',
    chefId: station?.chefId || '',
    isActive: station?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (station) {
        await fnbAPI.updateKitchenStation(clubId, station.id, formData);
      } else {
        await fnbAPI.createKitchenStation(clubId, formData);
      }
      onSave();
    } catch (error) {
      alert(error.message || 'Failed to save station');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-white mb-6">
          {station ? 'Edit Kitchen Station' : 'Create Kitchen Station'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Station Name */}
          <div>
            <label className="block text-white mb-2">Station Name *</label>
            <input
              type="text"
              required
              value={formData.stationName}
              onChange={(e) => setFormData({ ...formData, stationName: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
              placeholder="e.g., Station 1 - Quick Snacks"
            />
          </div>

          {/* Station Number */}
          <div>
            <label className="block text-white mb-2">Station Number *</label>
            <input
              type="number"
              required
              min="1"
              value={formData.stationNumber}
              onChange={(e) => setFormData({ ...formData, stationNumber: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
              placeholder="1, 2, 3..."
            />
            <p className="text-xs text-gray-400 mt-1">Unique number for this station</p>
          </div>

          {/* Chef Name */}
          <div>
            <label className="block text-white mb-2">Chef Name</label>
            <input
              type="text"
              value={formData.chefName}
              onChange={(e) => setFormData({ ...formData, chefName: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
              placeholder="e.g., Chef Raj"
            />
          </div>

          {/* Chef Selection (Optional - if you have staff management) */}
          {chefs.length > 0 && (
            <div>
              <label className="block text-white mb-2">Or Select from Staff</label>
              <select
                value={formData.chefId || ''}
                onChange={(e) => {
                  const selectedChef = chefs.find((c) => c.id === e.target.value);
                  setFormData({
                    ...formData,
                    chefId: e.target.value,
                    chefName: selectedChef?.name || formData.chefName,
                  });
                }}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
              >
                <option value="">-- Optional --</option>
                {chefs.map((chef) => {
                  // Show role in the dropdown, especially for custom Staff roles
                  const roleDisplay = chef.role === 'Staff' && chef.customRoleName 
                    ? `${chef.customRoleName} (Custom)` 
                    : chef.role;
                  return (
                    <option key={chef.id} value={chef.id}>
                      {chef.name} {roleDisplay ? `- ${roleDisplay}` : ''}
                    </option>
                  );
                })}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Showing all active staff members including custom roles
              </p>
            </div>
          )}

          {/* Active Status */}
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

          {/* Info Box */}
          <div className="bg-blue-600/20 border border-blue-500 rounded-lg p-3">
            <p className="text-blue-300 text-sm">
              💡 Orders will be assigned to this station by the FNB manager
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving...' : station ? 'Update Station' : 'Create Station'}
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

// Station Statistics Modal
function StationStatsModal({ stats, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full">
        <h2 className="text-2xl font-bold text-white mb-6">Station Statistics</h2>

        {/* Station Info */}
        <div className="bg-slate-900 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">👨‍🍳</span>
            <div>
              <h3 className="text-xl font-bold text-white">{stats.station.name}</h3>
              <p className="text-gray-400">Station #{stats.station.number}</p>
              <p className="text-gray-400">Chef: {stats.station.chefName || 'Unassigned'}</p>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-yellow-600/20 rounded-lg p-6">
            <p className="text-yellow-400 text-4xl font-bold mb-2">
              {stats.statistics.todayCompleted}
            </p>
            <p className="text-yellow-300 text-sm">Completed Today</p>
          </div>
          <div className="bg-blue-600/20 rounded-lg p-6">
            <p className="text-blue-400 text-4xl font-bold mb-2">
              {stats.statistics.todayPending}
            </p>
            <p className="text-blue-300 text-sm">Pending Today</p>
          </div>
          <div className="bg-green-600/20 rounded-lg p-6">
            <p className="text-green-400 text-4xl font-bold mb-2">
              {stats.statistics.allTimeCompleted}
            </p>
            <p className="text-green-300 text-sm">All-Time Completed</p>
          </div>
          <div className="bg-purple-600/20 rounded-lg p-6">
            <p className="text-purple-400 text-4xl font-bold mb-2">
              {stats.statistics.storedPending}
            </p>
            <p className="text-purple-300 text-sm">Currently Pending</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="bg-slate-900 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Station Status:</span>
            <span
              className={`px-4 py-2 rounded-full font-semibold ${
                stats.station.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
              }`}
            >
              {stats.station.isActive ? '✅ Active' : '⭕ Inactive'}
            </span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  );
}

