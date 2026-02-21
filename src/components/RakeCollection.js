import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clubsAPI } from "../lib/api";
import toast from "react-hot-toast";

export default function RakeCollection({ clubId, gameType }) {
  const queryClient = useQueryClient();
  const [selectedTable, setSelectedTable] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    sessionDate: new Date().toISOString().split('T')[0],
    chipDenomination: "",
    totalRakeAmount: "",
    notes: "",
  });
  const [historyFilters, setHistoryFilters] = useState({
    startDate: "",
    endDate: "",
    tableId: "",
    page: 1,
    limit: 10, // Always 10 per page
  });

  // Fetch active tables
  const { data: allActiveTables = [], isLoading: tablesLoading } = useQuery({
    queryKey: ['activeTablesForRake', clubId],
    queryFn: () => clubsAPI.getActiveTablesForRakeCollection(clubId),
    enabled: !!clubId,
  });

  // Filter active tables by game type
  const activeTables = gameType
    ? allActiveTables.filter(t => {
        if (gameType === 'rummy') return t.tableType === 'RUMMY';
        return t.tableType !== 'RUMMY'; // poker = everything except RUMMY
      })
    : allActiveTables;

  // Fetch rake collections history
  const { data: rawHistoryData, isLoading: historyLoading } = useQuery({
    queryKey: ['rakeCollections', clubId, historyFilters],
    queryFn: () => clubsAPI.getRakeCollections(clubId, historyFilters),
    enabled: !!clubId,
  });

  // Filter history by game type
  const historyData = rawHistoryData ? {
    ...rawHistoryData,
    collections: gameType
      ? (rawHistoryData.collections || []).filter(c => {
          const tableType = c.table?.tableType || c.tableType || '';
          if (gameType === 'rummy') return tableType === 'RUMMY';
          return tableType !== 'RUMMY';
        })
      : (rawHistoryData.collections || []),
  } : rawHistoryData;

  // Compute stats from filtered collections
  const filteredCollections = historyData?.collections || [];
  const stats = {
    totalEntries: filteredCollections.length,
    totalCollected: Number(filteredCollections.reduce((sum, c) => sum + Number(c.totalRakeAmount || 0), 0).toFixed(2)),
    avgPerTable: (() => {
      const uniqueTables = new Set(filteredCollections.map(c => c.tableNumber));
      const total = filteredCollections.reduce((sum, c) => sum + Number(c.totalRakeAmount || 0), 0);
      return uniqueTables.size > 0 ? Number((total / uniqueTables.size).toFixed(2)) : 0;
    })(),
  };
  const statsLoading = historyLoading;

  // Create rake collection mutation
  const createMutation = useMutation({
    mutationFn: (data) => clubsAPI.createRakeCollection(clubId, data),
    onSuccess: () => {
      toast.success("Rake collection saved successfully!");
      setShowForm(false);
      setFormData({
        sessionDate: new Date().toISOString().split('T')[0],
        chipDenomination: "",
        totalRakeAmount: "",
        notes: "",
      });
      setSelectedTable(null);
      queryClient.invalidateQueries(['rakeCollections', clubId]);
      queryClient.invalidateQueries(['rakeCollectionStats', clubId]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save rake collection");
    },
  });

  const handleTableClick = (table) => {
    setSelectedTable(table);
    setFormData({
      ...formData,
      chipDenomination: "₹25, ₹50, ₹100, ₹500",
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTable) return;

    createMutation.mutate({
      tableId: selectedTable.id,
      sessionDate: formData.sessionDate,
      chipDenomination: formData.chipDenomination,
      totalRakeAmount: parseFloat(formData.totalRakeAmount),
      notes: formData.notes,
    });
  };

  const handleClearForm = () => {
    setFormData({
      sessionDate: new Date().toISOString().split('T')[0],
      chipDenomination: "",
      totalRakeAmount: "",
      notes: "",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Kolkata' });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
    });
  };

  return (
    <div className="space-y-6">
      {/* Collect Rake Section */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            Collect Rake from {gameType === 'rummy' ? 'Rummy' : gameType === 'poker' ? 'Poker' : ''} Table
          </h2>
          {gameType === 'rummy' && (
            <span className="text-xs bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
              Multiple collections per session
            </span>
          )}
        </div>
        
        {tablesLoading ? (
          <div className="text-gray-400">Loading tables...</div>
        ) : activeTables.length === 0 ? (
          <div className="text-gray-400">No active tables available</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {activeTables.map((table) => (
              <div
                key={table.id}
                onClick={() => handleTableClick(table)}
                className="bg-slate-700 hover:bg-slate-600 rounded-lg p-4 cursor-pointer transition-colors border border-slate-600"
              >
                <div className="text-lg font-semibold text-white">Table {table.tableNumber}</div>
                <div className="text-sm text-gray-300 mt-1">{table.tableType}</div>
                <div className="text-sm text-gray-400 mt-1">
                  {table.currentSeats}/{table.maxSeats} seats
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Form Modal */}
        {showForm && selectedTable && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4 text-white">
                Collect Rake - Table {selectedTable.tableNumber}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Table ID <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={`Table ${selectedTable.tableNumber}`}
                    disabled
                    className="w-full bg-slate-700 text-gray-300 rounded-lg px-4 py-2 border border-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Session Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.sessionDate}
                    onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                    required
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Chip Denomination
                  </label>
                  <input
                    type="text"
                    value={formData.chipDenomination}
                    onChange={(e) => setFormData({ ...formData, chipDenomination: e.target.value })}
                    placeholder="₹25, ₹50, ₹100, ₹500"
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Total Rake Amount (₹) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.totalRakeAmount}
                    onChange={(e) => setFormData({ ...formData, totalRakeAmount: e.target.value })}
                    required
                    placeholder="₹0.00"
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes about the rake collection..."
                    rows="4"
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {createMutation.isPending ? "Saving..." : "Collect Rake"}
                  </button>
                  <button
                    type="button"
                    onClick={handleClearForm}
                    className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors border border-slate-500"
                  >
                    Clear Form
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setSelectedTable(null);
                      handleClearForm();
                    }}
                    className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors border border-slate-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Rake Collection History */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {gameType === 'rummy' ? 'Rummy' : gameType === 'poker' ? 'Poker' : ''} Rake Collection History
          </h2>
          
          <div className="flex gap-3 flex-wrap">
            <input
              type="date"
              value={historyFilters.startDate}
              onChange={(e) => setHistoryFilters({ ...historyFilters, startDate: e.target.value, page: 1 })}
              placeholder="Start Date"
              className="bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 text-sm"
            />
            <input
              type="date"
              value={historyFilters.endDate}
              onChange={(e) => setHistoryFilters({ ...historyFilters, endDate: e.target.value, page: 1 })}
              placeholder="End Date"
              className="bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 text-sm"
            />
            <select
              value={historyFilters.tableId}
              onChange={(e) => setHistoryFilters({ ...historyFilters, tableId: e.target.value, page: 1 })}
              className="bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 text-sm"
            >
              <option value="">All Tables</option>
              {activeTables.map((table) => (
                <option key={table.id} value={table.id}>
                  Table {table.tableNumber}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                const csvData = historyData?.collections?.map(c => ({
                  'Table ID': c.tableNumber,
                  'Session Date': formatDate(c.sessionDate),
                  'Rake Amount': c.totalRakeAmount,
                  'Chip Denomination': c.chipDenomination || '',
                  'Notes': c.notes || '',
                  'Collected By': c.collectedByName || '',
                  'Collected At': formatDateTime(c.collectedAt),
                }));
                // Simple CSV export
                const csv = [
                  Object.keys(csvData[0] || {}).join(','),
                  ...csvData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
                ].join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `rake-collections-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {statsLoading ? (
          <div className="text-gray-400 mb-6">Loading stats...</div>
        ) : stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <div className="text-sm text-gray-400">Total Entries</div>
              <div className="text-2xl font-bold text-white mt-1">{stats.totalEntries}</div>
            </div>
            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <div className="text-sm text-gray-400">Total Collected</div>
              <div className="text-2xl font-bold text-green-400 mt-1">₹{stats.totalCollected.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <div className="text-sm text-gray-400">Avg Collection Per Table</div>
              <div className="text-2xl font-bold text-white mt-1">₹{stats.avgPerTable.toLocaleString('en-IN')}</div>
            </div>
          </div>
        )}

        {/* History List */}
        {historyLoading ? (
          <div className="text-gray-400">Loading history...</div>
        ) : historyData?.collections?.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No rake collections found</div>
        ) : (
          <>
            <div className="text-sm text-gray-400 mb-4">
              Showing {((historyFilters.page - 1) * historyFilters.limit) + 1} to {Math.min(historyFilters.page * historyFilters.limit, historyData?.total || 0)} of {historyData?.total || 0} entries
            </div>
            
            <div className="space-y-4">
              {historyData?.collections?.map((collection) => (
                <div key={collection.id} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="text-lg font-semibold text-white">Table {collection.tableNumber}</div>
                        <div className="text-sm text-gray-400">Session Date: {formatDate(collection.sessionDate)}</div>
                      </div>
                      <div className="text-xl font-bold text-green-400 mb-2">₹{Number(collection.totalRakeAmount).toLocaleString('en-IN')}</div>
                      {collection.notes && (
                        <div className="text-sm text-gray-300 mb-2">Notes: {collection.notes}</div>
                      )}
                      <div className="text-sm text-gray-400">
                        Chip Denomination: {collection.chipDenomination || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        Collected by: {collection.collectedByName || 'N/A'} • {formatDateTime(collection.collectedAt)}
                      </div>
                    </div>
                    <div className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Collected
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {historyData && historyData.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setHistoryFilters({ ...historyFilters, page: historyFilters.page - 1 })}
                  disabled={historyFilters.page === 1}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="bg-slate-700 text-white px-4 py-2 rounded-lg">
                  Page {historyFilters.page} of {historyData.totalPages}
                </div>
                <button
                  onClick={() => setHistoryFilters({ ...historyFilters, page: historyFilters.page + 1 })}
                  disabled={historyFilters.page >= historyData.totalPages}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

