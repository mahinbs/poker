import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';
import { FaSearch, FaFilter, FaChartBar } from 'react-icons/fa';

export default function AuditLogsBackups({ clubId }) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    staffRole: '',
    startDate: '',
    endDate: '',
  });
  const [activeFilters, setActiveFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // Fetch audit logs
  const { data: logsData, isLoading, refetch } = useQuery({
    queryKey: ['auditLogs', clubId, page, activeFilters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...activeFilters,
      });
      return await apiRequest(`/clubs/${clubId}/audit-logs?${params}`);
    },
    enabled: !!clubId
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['auditLogStats', clubId],
    queryFn: async () => {
      return await apiRequest(`/clubs/${clubId}/audit-logs/statistics?days=30`);
    },
    enabled: !!clubId
  });

  const handleApplyFilters = () => {
    const applied = {};
    if (filters.search) applied.search = filters.search;
    if (filters.category) applied.category = filters.category;
    if (filters.staffRole) applied.staffRole = filters.staffRole;
    if (filters.startDate) applied.startDate = filters.startDate;
    if (filters.endDate) applied.endDate = filters.endDate;
    
    setActiveFilters(applied);
    setPage(1);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      staffRole: '',
      startDate: '',
      endDate: '',
    });
    setActiveFilters({});
    setPage(1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    }).format(date);
  };

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'player_management', label: 'Player Management' },
    { value: 'financial', label: 'Financial' },
    { value: 'table_management', label: 'Table Management' },
    { value: 'staff_management', label: 'Staff Management' },
    { value: 'tournament', label: 'Tournament' },
    { value: 'bonus', label: 'Bonus' },
    { value: 'credit', label: 'Credit' },
    { value: 'fnb', label: 'FNB' },
    { value: 'shift', label: 'Shift' },
    { value: 'payroll', label: 'Payroll' },
    { value: 'override', label: 'Override' },
    { value: 'system', label: 'System' },
  ];

  const roles = [
    { value: '', label: 'All Roles' },
    { value: 'SUPER_ADMIN', label: 'Super Admin' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'MANAGER', label: 'Manager' },
    { value: 'HR', label: 'HR' },
    { value: 'GRE', label: 'GRE' },
    { value: 'CASHIER', label: 'Cashier' },
    { value: 'DEALER', label: 'Dealer' },
    { value: 'KITCHEN_STAFF', label: 'Kitchen Staff' },
    { value: 'AFFILIATE', label: 'Affiliate' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Audit Logs & Backups</h1>
        <p className="text-gray-400">Track all staff activities and system events</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <FaChartBar className="text-3xl opacity-75" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalActions}</div>
            <div className="text-sm opacity-90">Total Actions (30 days)</div>
          </div>

          {Object.entries(stats.byCategory || {})
            .slice(0, 3)
            .map(([category, count], idx) => (
              <div
                key={category}
                className={`bg-gradient-to-br ${
                  idx === 0 ? 'from-green-500 to-green-600' :
                  idx === 1 ? 'from-orange-500 to-orange-600' :
                  'from-purple-500 to-purple-600'
                } rounded-xl p-6 text-white`}
              >
                <div className="text-2xl font-bold mb-1">{count}</div>
                <div className="text-sm opacity-90 capitalize">
                  {category.replace(/_/g, ' ')}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 mb-6 border border-slate-700">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by name or description..."
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="flex gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* More Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaFilter />
            More Filters
          </button>

          {/* Apply Button */}
          <button
            onClick={handleApplyFilters}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-colors"
          >
            Apply Filters
          </button>

          {/* Clear Button */}
          {Object.keys(activeFilters).length > 0 && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Staff Role
              </label>
              <select
                value={filters.staffRole}
                onChange={(e) => setFilters({ ...filters, staffRole: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Audit Log */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6">Audit Log</h2>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : logsData?.logs?.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">No audit logs found</p>
            <p className="text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* Log Entries */}
            <div className="space-y-3 mb-6">
              {logsData?.logs?.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:bg-slate-700 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-white font-medium mb-1">{log.description}</p>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <span className="font-medium text-purple-400">{log.staffName}</span>
                          <span>({log.staffRole.replace(/_/g, ' ')})</span>
                        </span>
                        {log.targetName && (
                          <span>
                            → <span className="font-medium text-blue-400">{log.targetName}</span>
                          </span>
                        )}
                        <span className="text-gray-500">•</span>
                        <span className="capitalize text-green-400">
                          {log.actionCategory.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-400 ml-4">
                      {formatDate(log.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {logsData && logsData.totalPages > 1 && (
              <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                <div className="text-gray-400 text-sm">
                  Showing page {page} of {logsData.totalPages} ({logsData.total} total logs)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(logsData.totalPages, p + 1))}
                    disabled={page === logsData.totalPages}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

