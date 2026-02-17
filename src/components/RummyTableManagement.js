import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tablesAPI, waitlistAPI, staffAPI, shiftsAPI, superAdminAPI } from '../lib/api';
import toast from 'react-hot-toast';
import TableBuyOutManagement from './TableBuyOutManagement';
import RakeCollection from './RakeCollection';

/**
 * Comprehensive Rummy Table Management Component
 * Features:
 * 1. Live Tables - Hologram view with seat status
 * 2. Table Management - CRUD operations (Rummy-specific)
 * 3. Table Buy-In - Waitlist, seat allocation, reorder
 * 4. Table Buy-Out - Player requests, admin approval
 */
export default function RummyTableManagement({ selectedClubId }) {
  const [activeTab, setActiveTab] = useState("live-tables");
  const queryClient = useQueryClient();

  // Fetch tables (filter for rummy tables)
  const { data: tablesData, isLoading: tablesLoading } = useQuery({
    queryKey: ['rummy-tables', selectedClubId],
    queryFn: () => tablesAPI.getTables(selectedClubId),
    enabled: !!selectedClubId,
    select: (data) => {
      // Filter for rummy tables
      return Array.isArray(data) ? data.filter(t => t.tableType === 'RUMMY') : [];
    }
  });

  // Fetch waitlist
  const { data: waitlistData, isLoading: waitlistLoading } = useQuery({
    queryKey: ['waitlist', selectedClubId],
    queryFn: () => waitlistAPI.getWaitlist(selectedClubId),
    enabled: !!selectedClubId,
  });

  const tables = tablesData || [];
  const waitlist = waitlistData || [];

  const tabs = [
    { id: "live-tables", label: "Live Rummy Tables" },
    { id: "table-management", label: "Table Management" },
    { id: "table-buy-in", label: "Table Buy-In" },
    { id: "table-buy-out", label: "Table Buy-Out" },
    { id: "rake-collection", label: "Rake Collection" },
    { id: "history", label: "History" },
  ];

  return (
    <div className="text-white space-y-6">
      <h1 className="text-3xl font-bold">Rummy Tables & Waitlist</h1>

      {!selectedClubId && (
        <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 text-yellow-100 flex items-center gap-3">
          <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.3 2.647-1.3 3.412 0l7 12a1.5 1.5 0 01-1.302 2.25H2.847a1.5 1.5 0 01-1.302-2.25l7-12zM9 13a1 1 0 112 0v2a1 1 0 11-2 0v-2zm0-6a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <p className="font-medium">Please select a club from the sidebar dropdown to manage rummy tables.</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-b-2 border-emerald-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Tab 1: Live Tables */}
        {activeTab === "live-tables" && (
          <LiveTablesView 
            selectedClubId={selectedClubId}
            tables={tables}
            tablesLoading={tablesLoading}
          />
        )}

        {/* Tab 2: Table Management */}
        {activeTab === "table-management" && (
          <RummyTableManagementView
            selectedClubId={selectedClubId}
            tables={tables}
            tablesLoading={tablesLoading}
          />
        )}

        {/* Tab 3: Table Buy-In */}
        {activeTab === "table-buy-in" && (
          <TableBuyInView
            selectedClubId={selectedClubId}
            tables={tables}
            waitlist={waitlist}
            waitlistLoading={waitlistLoading}
          />
        )}

        {/* Tab 4: Table Buy-Out */}
        {activeTab === "table-buy-out" && (
          <TableBuyOutView
            selectedClubId={selectedClubId}
            tables={tables}
          />
        )}

        {/* Tab 5: Rake Collection */}
        {activeTab === "rake-collection" && (
          <RakeCollection clubId={selectedClubId} gameType="rummy" />
        )}

        {/* Tab 6: History */}
        {activeTab === "history" && (
          <RummyHistoryView
            selectedClubId={selectedClubId}
            tables={tables}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Live Tables View Component
// ============================================================================
function LiveTablesView({ selectedClubId, tables, tablesLoading }) {
  const [selectedTable, setSelectedTable] = useState(null);
  const [showSessionControl, setShowSessionControl] = useState(false);
  const [selectedTableForControl, setSelectedTableForControl] = useState(null);
  const [sessionParams, setSessionParams] = useState({
    minPlayTime: 30,
    callTime: 5,
    cashOutWindow: 10,
    sessionTimeout: 120,
  });
  const [sessionStatus, setSessionStatus] = useState('Active');

  const activeTables = tables.filter(t => t.status === 'AVAILABLE' || t.status === 'OCCUPIED');

  // Helper function to extract dealer name from notes
  const getDealerName = (table) => {
    if (!table.notes) return null;
    const dealerMatch = table.notes.match(/Dealer:.*?\(([^)]+)\)/i);
    return dealerMatch ? dealerMatch[1] : null;
  };

  const handleEditSession = (table) => {
    setSelectedTableForControl(table);
    setShowSessionControl(true);
    
    // Parse session parameters from notes if available
    const noteParts = table.notes ? table.notes.split('|').map(p => p.trim()) : [];
    const minPlayTime = noteParts[3]?.match(/\d+/)?.[0] || '30';
    const callTime = noteParts[4]?.match(/\d+/)?.[0] || '5';
    const cashOutWindow = noteParts[5]?.match(/\d+/)?.[0] || '10';
    const sessionTimeout = noteParts[6]?.match(/\d+/)?.[0] || '120';
    
    setSessionParams({
      minPlayTime: parseInt(minPlayTime),
      callTime: parseInt(callTime),
      cashOutWindow: parseInt(cashOutWindow),
      sessionTimeout: parseInt(sessionTimeout),
    });
    
    setSessionStatus(table.status === 'OCCUPIED' ? 'Active' : 'Paused');
  };

  return (
    <div className="space-y-6">
      {/* Table Session Control Panel */}
      {showSessionControl && selectedTableForControl && (
        <TableSessionControl
          table={selectedTableForControl}
          tables={activeTables}
          sessionParams={sessionParams}
          setSessionParams={setSessionParams}
          sessionStatus={sessionStatus}
          setSessionStatus={setSessionStatus}
          clubId={selectedClubId}
          onClose={() => {
            setShowSessionControl(false);
            setSelectedTableForControl(null);
          }}
          onSelectTable={(table) => {
            setSelectedTableForControl(table);
            handleEditSession(table);
          }}
        />
      )}

      {!showSessionControl && (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Live Rummy Tables - Hologram View</h2>
            <p className="text-gray-400 text-sm mt-1">Manage live rummy tables, seat players, and handle buy-ins using table hologram.</p>
          </div>
          <div className="bg-slate-700 px-4 py-2 rounded-lg">
            <div className="text-sm text-gray-300">Active Tables: {activeTables.length}</div>
            <div className="text-sm text-gray-300">Total Players: {activeTables.reduce((sum, t) => sum + (t.currentSeats || 0), 0)}</div>
          </div>
        </div>

        {tablesLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p>Loading rummy tables...</p>
          </div>
        ) : activeTables.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🃏</div>
            <p className="text-xl text-gray-300">No active rummy tables</p>
            <p className="text-gray-400 text-sm mt-2">Create and activate tables in Table Management</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTables.map((table) => (
              <div
                key={table.id}
                className="bg-slate-700 rounded-xl p-5 border border-slate-600 hover:border-emerald-500 transition-all cursor-pointer"
                onClick={() => setSelectedTable(table)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">Table {table.tableNumber}</h3>
                    <p className="text-sm text-gray-400">{table.rummyVariant || 'RUMMY'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    table.status === 'OCCUPIED' ? 'bg-green-600/20 text-green-400' : 'bg-emerald-600/20 text-emerald-400'
                  }`}>
                    {table.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Stakes:</span>
                    <span className="text-white font-medium">₹{table.minBuyIn || 0}/₹{table.maxBuyIn || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Occupied Seats:</span>
                    <span className="text-white font-medium">{table.currentSeats || 0} / {table.maxSeats}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Available Seats:</span>
                    <span className="text-emerald-400 font-medium">{table.maxSeats - (table.currentSeats || 0)}</span>
                  </div>
                  {getDealerName(table) && (
                    <div className="flex justify-between text-sm pt-1 border-t border-slate-600">
                      <span className="text-gray-400">👤 Dealer:</span>
                      <span className="text-purple-400 font-semibold">{getDealerName(table)}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTable(table);
                  }}
                  className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <span>🎯</span>
                  <span>View Table Hologram</span>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditSession(table);
                  }}
                  className="w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-500 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <span>⚙️</span>
                  <span>Edit Session Control</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Table Hologram Modal */}
      {selectedTable && (
        <TableHologramModal
          table={selectedTable}
          onClose={() => setSelectedTable(null)}
          clubId={selectedClubId}
        />
      )}
    </div>
  );
}

// ============================================================================
// Table Session Control Component  
// ============================================================================
function TableSessionControl({ 
  table, 
  tables, 
  sessionParams, 
  setSessionParams, 
  sessionStatus, 
  setSessionStatus,
  clubId,
  onClose,
  onSelectTable 
}) {
  const queryClient = useQueryClient();
  const [selectedClubId, setSelectedClubId] = useState(clubId);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [seatedPlayers, setSeatedPlayers] = useState([]);
  const [settlements, setSettlements] = useState({});
  const [rakeAmount, setRakeAmount] = useState('');

  // Update selectedClubId when clubId prop changes
  useEffect(() => {
    if (clubId) {
      setSelectedClubId(clubId);
    }
  }, [clubId]);

  // Pause session mutation
  const pauseSessionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClubId) throw new Error('Club ID not found');
      return await tablesAPI.pauseSession(selectedClubId, table.id);
    },
    onSuccess: () => {
      setSessionStatus('Paused');
      toast.success('Session paused successfully');
      queryClient.invalidateQueries(['rummy-tables', selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to pause session');
    },
  });

  // Resume session mutation
  const resumeSessionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClubId) throw new Error('Club ID not found');
      return await tablesAPI.resumeSession(selectedClubId, table.id);
    },
    onSuccess: () => {
      setSessionStatus('Active');
      toast.success('Session resumed successfully');
      queryClient.invalidateQueries(['rummy-tables', selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to resume session');
    },
  });

  // Settle and end session mutation (same as Poker)
  const settleAndEndMutation = useMutation({
    mutationFn: async (settlementsData) => {
      if (!selectedClubId) throw new Error('Club ID not found');
      return await tablesAPI.settleAndEndSession(selectedClubId, table.id, settlementsData);
    },
    onSuccess: () => {
      toast.success('All players settled and session ended successfully!');
      queryClient.invalidateQueries(['rummy-tables', selectedClubId]);
      setShowSettlementModal(false);
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to settle players');
    },
  });

  // End session mutation (only used when no players are seated)
  const endSessionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClubId) throw new Error('Club ID not found');
      return await tablesAPI.endSession(selectedClubId, table.id);
    },
    onSuccess: () => {
      toast.success('Session ended successfully');
      queryClient.invalidateQueries(['rummy-tables', selectedClubId]);
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to end session');
    },
  });

  // Update session params mutation
  const updateParamsMutation = useMutation({
    mutationFn: async (params) => {
      if (!selectedClubId) throw new Error('Club ID not found');
      return await tablesAPI.updateSessionParams(selectedClubId, table.id, params);
    },
    onSuccess: (data) => {
      toast.success('Session parameters updated successfully');
      queryClient.invalidateQueries(['rummy-tables', selectedClubId]);
      if (data.sessionParams) {
        setSessionParams(data.sessionParams);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update session parameters');
    },
  });

  const handlePauseSession = () => {
    if (sessionStatus === 'Active') {
      pauseSessionMutation.mutate();
    } else {
      resumeSessionMutation.mutate();
    }
  };

  const handleEndSession = async () => {
    if (!selectedClubId) {
      toast.error('Club ID not found');
      return;
    }

    try {
      const response = await tablesAPI.getSeatedPlayersForTable(selectedClubId, table.id);
      
      if (response.seatedPlayers && response.seatedPlayers.length > 0) {
        setSeatedPlayers(response.seatedPlayers);
        
        const initialSettlements = {};
        response.seatedPlayers.forEach(player => {
          initialSettlements[player.playerId] = 0;
        });
        setSettlements(initialSettlements);
        setRakeAmount('');
        setShowSettlementModal(true);
      } else {
        if (window.confirm('No players are seated. End this session?')) {
          endSessionMutation.mutate();
        }
      }
    } catch (error) {
      console.error('Error fetching seated players:', error);
      toast.error('Failed to fetch seated players');
    }
  };

  const handleSettlementChange = (playerId, amount) => {
    setSettlements(prev => ({
      ...prev,
      [playerId]: parseFloat(amount) || 0
    }));
  };

  const handleConfirmSettlement = () => {
    const settlementsArray = Object.entries(settlements).map(([playerId, amount]) => ({
      playerId,
      amount: parseFloat(amount) || 0
    }));

    const rakeNum = parseFloat(rakeAmount) || 0;

    const totalAmount = settlementsArray.reduce((sum, s) => sum + s.amount, 0);
    const confirmMsg = rakeNum > 0
      ? `Settle ${settlementsArray.length} players for a total of \u20B9${totalAmount} with \u20B9${rakeNum} rake? This will end the session.`
      : `Settle ${settlementsArray.length} players for a total of \u20B9${totalAmount}? This will end the session.`;

    if (window.confirm(confirmMsg)) {
      settleAndEndMutation.mutate({ settlements: settlementsArray, rakeAmount: rakeNum || undefined });
    }
  };

  const handleSetParameter = (param, value) => {
    const params = { [param]: parseInt(value) };
    updateParamsMutation.mutate(params);
  };

  const getTableGameType = (t) => {
    return t.rummyVariant || t.notes?.split('|')[1]?.trim() || 'RUMMY';
  };

  const getTableStakes = (t) => {
    const noteParts = t.notes ? t.notes.split('|').map(p => p.trim()) : [];
    return noteParts[2]?.replace('Stakes:', '').trim() || `₹${t.minBuyIn || 0}/₹${t.maxBuyIn || 0}`;
  };

  return (
    <div className="bg-gradient-to-br from-emerald-900/50 via-teal-900/50 to-green-900/50 rounded-2xl p-8 border-2 border-emerald-500/30 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Rummy Table Session Control</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Table Sessions */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4">Table Sessions</h3>
          <div className="space-y-3">
            {tables.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectTable(t)}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  t.id === table.id
                    ? 'bg-emerald-600/30 border-2 border-emerald-500'
                    : 'bg-slate-700/50 border border-slate-600 hover:bg-slate-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-white">Table {t.tableNumber} - {getTableGameType(t)}</div>
                    <div className="text-sm text-gray-400">{t.rummyVariant || 'Rummy'}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    t.status === 'OCCUPIED' ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'
                  }`}>
                    {t.status === 'OCCUPIED' ? 'Active' : 'Paused'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Table Details */}
          <div className="mt-6 p-4 bg-emerald-600/20 border border-emerald-500/30 rounded-lg">
            <div className="text-sm text-emerald-300 mb-2">Selected: Table {table.tableNumber} - {getTableGameType(table)}</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-400">Variant:</span>
                <span className="text-white ml-2">{table.rummyVariant || 'Rummy'}</span>
              </div>
              <div>
                <span className="text-gray-400">Stakes:</span>
                <span className="text-white ml-2">{getTableStakes(table)}</span>
              </div>
            </div>
            <div className="text-sm mt-2">
              <span className="text-gray-400">Players:</span>
              <span className="text-white ml-2">{table.currentSeats || 0}/{table.maxSeats}</span>
            </div>
          </div>
        </div>

        {/* Center: Session Actions */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4">Session Actions</h3>
          
          <div className="mb-6">
            <div className="text-gray-400 text-sm mb-2">Current Status</div>
            <div className={`text-4xl font-bold ${sessionStatus === 'Active' ? 'text-green-400' : 'text-yellow-400'}`}>
              {sessionStatus}
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handlePauseSession}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white px-6 py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2"
            >
              <span>{sessionStatus === 'Active' ? '⏸' : '▶'}</span>
              <span>{sessionStatus === 'Active' ? 'Pause Session' : 'Resume Session'}</span>
            </button>

            <button
              onClick={handleEndSession}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-6 py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2"
            >
              <span>⬛</span>
              <span>End Session</span>
            </button>
          </div>

          <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
            <p className="text-sm text-gray-400 text-center">
              Session parameters can be modified on the right panel.
            </p>
          </div>
        </div>

        {/* Right: Timing & Parameters */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4">Timing & Parameters</h3>
          
          <div className="space-y-6">
            {/* Min Play Time */}
            <div>
              <div className="text-gray-400 text-sm font-medium mb-2">MIN PLAY TIME</div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={sessionParams.minPlayTime}
                  onChange={(e) => setSessionParams({ ...sessionParams, minPlayTime: e.target.value })}
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-lg font-semibold"
                  min="30"
                />
                <button
                  onClick={() => handleSetParameter('minPlayTime', sessionParams.minPlayTime)}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-semibold transition-colors"
                >
                  Set
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">Current: {sessionParams.minPlayTime} mins</div>
            </div>

            {/* Call Time */}
            <div>
              <div className="text-gray-400 text-sm font-medium mb-2">CALL TIME</div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={sessionParams.callTime}
                  onChange={(e) => setSessionParams({ ...sessionParams, callTime: e.target.value })}
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-lg font-semibold"
                  min="1"
                />
                <button
                  onClick={() => handleSetParameter('callTime', sessionParams.callTime)}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-semibold transition-colors"
                >
                  Set
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">Current: {sessionParams.callTime} mins</div>
            </div>

            {/* Cash-out Window */}
            <div>
              <div className="text-gray-400 text-sm font-medium mb-2">CASH-OUT WINDOW</div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={sessionParams.cashOutWindow}
                  onChange={(e) => setSessionParams({ ...sessionParams, cashOutWindow: e.target.value })}
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-lg font-semibold"
                  min="1"
                />
                <button
                  onClick={() => handleSetParameter('cashOutWindow', sessionParams.cashOutWindow)}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-semibold transition-colors"
                >
                  Set
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">Current: {sessionParams.cashOutWindow} mins</div>
            </div>

            {/* Session Timeout */}
            <div>
              <div className="text-gray-400 text-sm font-medium mb-2">SESSION TIMEOUT</div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={sessionParams.sessionTimeout}
                  onChange={(e) => setSessionParams({ ...sessionParams, sessionTimeout: e.target.value })}
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-lg font-semibold"
                  min="30"
                />
                <button
                  onClick={() => handleSetParameter('sessionTimeout', sessionParams.sessionTimeout)}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-semibold transition-colors"
                >
                  Set
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">Current: {sessionParams.sessionTimeout} mins</div>
            </div>
          </div>
        </div>
      </div>

      {/* Settlement Modal - same as Poker */}
      {showSettlementModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-emerald-500/50 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">🃏 Settle All Rummy Players</h3>
              <button
                onClick={() => setShowSettlementModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6 p-4 bg-red-600/20 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-300">
                Enter the cash-out amount for each seated player. This will create transactions,
                update balances, unseat all players, and end the session.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {seatedPlayers.map(player => (
                <div key={player.playerId} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-semibold text-white">{player.playerName}</div>
                      <div className="text-sm text-gray-400">Seat #{player.seatNumber}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">
                        Seated {new Date(player.seatedAt).toLocaleTimeString()}
                      </div>
                      {player.buyInAmount > 0 && (
                        <div className="text-xs text-emerald-400">
                          Table Balance: ₹{Number(player.buyInAmount).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">Cash-out Amount:</span>
                    <input
                      type="number"
                      value={settlements[player.playerId] || 0}
                      onChange={(e) => handleSettlementChange(player.playerId, e.target.value)}
                      className="flex-1 px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-lg font-semibold"
                      placeholder="Enter amount"
                      min="0"
                      step="100"
                    />
                    <span className="text-white font-semibold">₹</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between p-4 bg-emerald-600/20 border border-emerald-500/30 rounded-lg mb-4">
              <span className="text-emerald-300 font-semibold">Total Settlement:</span>
              <span className="text-white text-2xl font-bold">
                ₹{Object.values(settlements).reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0).toLocaleString()}
              </span>
            </div>

            {/* Rake Collection Input */}
            <div className="p-4 bg-amber-600/20 border border-amber-500/30 rounded-lg mb-6">
              <div className="flex items-center gap-3">
                <span className="text-amber-300 font-semibold whitespace-nowrap">🎰 Session Rake:</span>
                <input
                  type="number"
                  value={rakeAmount}
                  onChange={(e) => setRakeAmount(e.target.value)}
                  className="flex-1 px-4 py-2 bg-slate-600 border border-amber-500/50 rounded-lg text-white text-lg font-semibold"
                  placeholder="Enter rake amount (optional)"
                  min="0"
                  step="100"
                />
                <span className="text-white font-semibold">₹</span>
              </div>
              <p className="text-amber-300/70 text-xs mt-2">Rake will be recorded for this rummy session automatically</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowSettlementModal(false)}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSettlement}
                disabled={settleAndEndMutation.isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                {settleAndEndMutation.isLoading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>✅</span>
                    <span>Settle & End Session</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Table Hologram Modal Component
// ============================================================================
function TableHologramModal({ table, onClose, clubId }) {
  const queryClient = useQueryClient();
  const [clubData, setClubData] = useState(null);
  const [sessionTime, setSessionTime] = useState('00:00:00');
  const [seatedPlayersData, setSeatedPlayersData] = useState([]);
  const [activeTab, setActiveTab] = useState('view');
  const [tableHistory, setTableHistory] = useState([]);

  // Fetch table history (buy-ins and buy-outs for this table)
  useEffect(() => {
    const fetchTableHistory = async () => {
      if (activeTab !== 'history') return;
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const tenantId = localStorage.getItem('tenantId');
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3333/api'}/clubs/${clubId}/transactions?tableNumber=${table.tableNumber}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-user-id': userId || '',
            'x-tenant-id': tenantId || '',
            'x-club-id': clubId,
          },
        });
        if (response.ok) {
          const data = await response.json();
          const filtered = data.filter(t => 
            (t.type === 'Buy In' || (t.type === 'Deposit' && t.notes?.includes(`Table ${table.tableNumber}`))) &&
            (t.notes?.includes(`Table ${table.tableNumber}`) || t.description?.includes(`Table ${table.tableNumber}`))
          ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setTableHistory(filtered);
        }
      } catch (error) {
        console.error('Error fetching table history:', error);
      }
    };
    if (clubId && table?.tableNumber && activeTab === 'history') {
      fetchTableHistory();
    }
  }, [clubId, table?.tableNumber, activeTab]);

  // Fetch seated players for this table (same as poker)
  useEffect(() => {
    const fetchSeatedPlayers = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const tenantId = localStorage.getItem('tenantId');
        
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3333/api'}/clubs/${clubId}/tables/${table.id}/seated-players`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-user-id': userId || '',
            'x-tenant-id': tenantId || '',
            'x-club-id': clubId,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setSeatedPlayersData(data.seatedPlayers || []);
        }
      } catch (error) {
        console.error('Error fetching seated players:', error);
      }
    };
    
    if (clubId && table?.id) {
      fetchSeatedPlayers();
      const interval = setInterval(fetchSeatedPlayers, 5000);
      return () => clearInterval(interval);
    }
  }, [clubId, table?.id]);

  // Extract dealer info from table notes
  const getDealerInfo = () => {
    if (!table.notes) return null;
    const dealerMatch = table.notes.match(/Dealer:\s*([a-f0-9-]{36})\s*\(([^)]+)\)/i);
    if (dealerMatch) {
      return { id: dealerMatch[1], name: dealerMatch[2] };
    }
    return null;
  };

  const dealerInfo = getDealerInfo();

  // Unassign dealer mutation
  const unassignDealerMutation = useMutation({
    mutationFn: async () => {
      if (!table || !dealerInfo) return;
      
      // Remove dealer info from notes
      const existingNotes = table.notes || '';
      const updatedNotes = existingNotes.replace(/\s*\|\s*Dealer:.*$/i, '').trim();
      
      return tablesAPI.updateTable(clubId, table.id, {
        notes: updatedNotes
      });
    },
    onSuccess: () => {
      toast.success('Dealer unassigned successfully');
      queryClient.invalidateQueries(['rummy-tables', clubId]);
      queryClient.invalidateQueries(['all-tables', clubId]);
      onClose(); // Close modal to refresh
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to unassign dealer');
    },
  });

  const handleUnassignDealer = () => {
    if (window.confirm(`Are you sure you want to unassign dealer "${dealerInfo.name}" from this table?`)) {
      unassignDealerMutation.mutate();
    }
  };
  
  // Fetch club data to get logo
  useEffect(() => {
    const fetchClubData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const tenantId = localStorage.getItem('tenantId');
        
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3333/api'}/clubs/${clubId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-user-id': userId || '',
            'x-tenant-id': tenantId || '',
            'x-club-id': clubId,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setClubData(data);
        }
      } catch (error) {
        console.error('Error fetching club data:', error);
      }
    };
    if (clubId) {
      fetchClubData();
    }
  }, [clubId]);

  // Session timer
  useEffect(() => {
    if (!table) {
      setSessionTime('00:00:00');
      return;
    }

    if (table.status === 'AVAILABLE' || table.status === 'PAUSED') {
      const pausedElapsedMatch = table.notes?.match(/Paused Elapsed: (\d+)/);
      if (pausedElapsedMatch) {
        const pausedElapsedSeconds = parseInt(pausedElapsedMatch[1], 10);
        if (!isNaN(pausedElapsedSeconds) && pausedElapsedSeconds >= 0) {
          const hours = Math.floor(pausedElapsedSeconds / 3600);
          const minutes = Math.floor((pausedElapsedSeconds % 3600) / 60);
          const seconds = pausedElapsedSeconds % 60;
          setSessionTime(
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
          );
        } else {
          setSessionTime('00:00:00');
        }
      } else {
        setSessionTime('00:00:00');
      }
      return;
    }

    if (table.status !== 'OCCUPIED') {
      setSessionTime('00:00:00');
      return;
    }

    const sessionStartMatch = table.notes?.match(/Session Started: ([^|]+)/);
    const pausedElapsedMatch = table.notes?.match(/Paused Elapsed: (\d+)/);
    
    if (!sessionStartMatch || !sessionStartMatch[1]) {
      setSessionTime('00:00:00');
      return;
    }

    const sessionStartTimeStr = sessionStartMatch[1].trim();
    const sessionStartTime = new Date(sessionStartTimeStr);
    
    if (isNaN(sessionStartTime.getTime())) {
      setSessionTime('00:00:00');
      return;
    }

    const pausedElapsedSeconds = pausedElapsedMatch ? parseInt(pausedElapsedMatch[1], 10) : 0;
    
    const updateTimer = () => {
      const now = new Date();
      const elapsedMs = now.getTime() - sessionStartTime.getTime();
      
      if (isNaN(elapsedMs)) {
        setSessionTime('00:00:00');
        return;
      }
      
      const currentElapsedSeconds = Math.floor(elapsedMs / 1000);
      const totalElapsedSeconds = currentElapsedSeconds + pausedElapsedSeconds;
      
      if (isNaN(totalElapsedSeconds) || totalElapsedSeconds < 0) {
        setSessionTime('00:00:00');
        return;
      }
      
      const hours = Math.floor(totalElapsedSeconds / 3600);
      const minutes = Math.floor((totalElapsedSeconds % 3600) / 60);
      const seconds = totalElapsedSeconds % 60;
      
      setSessionTime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [table]);

  const seats = Array.from({ length: table.maxSeats }, (_, i) => i + 1);

  // Get occupied seats from actual seated players data
  const occupiedSeats = seatedPlayersData.map(p => p.seatNumber).filter(Boolean);

  // Calculate table value from actual seated players' buy-ins
  const tableValue = seatedPlayersData.reduce((total, player) => {
    return total + (Number(player.buyInAmount) || 0);
  }, 0);

  const clubLogoUrl = clubData?.logoUrl || null;
  const gameType = table.rummyVariant || table.notes?.split('|')[1]?.trim() || 'RUMMY';
  const stakes = `₹${table.minBuyIn || 0}/₹${table.maxBuyIn || 0}`;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl p-8 max-w-4xl w-full border-2 border-emerald-500 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white">Table {table.tableNumber} - {gameType}</h2>
            <p className="text-gray-400">Stakes: {stakes}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-700 mb-6">
          <button
            onClick={() => setActiveTab('view')}
            className={`px-4 py-2 font-semibold transition-all ${
              activeTab === 'view'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Live View
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-semibold transition-all ${
              activeTab === 'history'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            History
          </button>
        </div>

        {activeTab === 'view' ? (
          <>
        {/* Table Value Display */}
        <div className="mb-6 flex justify-center">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 rounded-2xl shadow-xl border-2 border-emerald-400">
            <div className="text-xs text-emerald-100 text-center mb-1">TABLE VALUE</div>
            <div className="text-3xl font-bold text-white text-center">₹{tableValue.toLocaleString()}</div>
          </div>
        </div>

        {/* Table Visualization - Round shape for Rummy */}
        <div className="relative w-full aspect-square max-w-[500px] mx-auto bg-gradient-to-br from-green-800 to-green-900 rounded-full border-8 border-emerald-600 shadow-2xl flex items-center justify-center">
          {/* Center Logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-full p-2 shadow-lg flex items-center justify-center w-24 h-24">
              {clubLogoUrl ? (
                <>
                  <img 
                    src={clubLogoUrl} 
                    alt="Club Logo" 
                    className="w-20 h-20 object-contain"
                    onError={(e) => {
                      console.error('Failed to load club logo:', clubLogoUrl);
                      e.target.style.display = 'none';
                      const fallback = e.target.parentElement.querySelector('.logo-fallback');
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="logo-fallback text-3xl font-bold text-gray-800 hidden items-center justify-center w-full h-full">🃏</div>
                </>
              ) : (
                <div className="text-3xl font-bold text-gray-800">🃏</div>
              )}
            </div>
          </div>

          {/* Dealer Position */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            {dealerInfo && (
              <div className="mb-2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                <span>👤 {dealerInfo.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnassignDealer();
                  }}
                  disabled={unassignDealerMutation.isLoading}
                  className="hover:bg-purple-700 rounded-full p-0.5 transition-colors disabled:opacity-50"
                  title="Unassign Dealer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <div className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              D
            </div>
          </div>

          {/* Seats arranged in ellipse */}
          {seats.map((seatNum) => {
            const angle = (360 / table.maxSeats) * (seatNum - 1);
            const radians = (angle - 90) * (Math.PI / 180);
            const radius = 40;
            const x = 50 + radius * Math.cos(radians);
            const y = 50 + radius * Math.sin(radians);
            const isOccupied = occupiedSeats.includes(seatNum);
            const seatedPlayer = seatedPlayersData.find(p => p.seatNumber === seatNum);

            return (
              <div
                key={seatNum}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg transition-all cursor-pointer ${
                    isOccupied
                      ? 'bg-emerald-600 text-white border-2 border-emerald-400 shadow-lg shadow-emerald-500/30'
                      : 'bg-slate-700 text-gray-400 border-2 border-slate-600 hover:border-emerald-500'
                  }`}
                  title={seatedPlayer ? seatedPlayer.playerName : `Seat ${seatNum}`}
                >
                  {isOccupied && seatedPlayer ? (
                    seatedPlayer.playerName?.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase()
                  ) : (
                    seatNum
                  )}
                </div>
                <div className="text-center text-xs text-white mt-1 whitespace-nowrap max-w-[80px] overflow-hidden text-ellipsis">
                  {isOccupied && seatedPlayer ? seatedPlayer.playerName : `Seat ${seatNum}`}
                </div>
                {isOccupied && seatedPlayer && seatedPlayer.buyInAmount > 0 && (
                  <div className="text-center text-[10px] text-yellow-300 bg-slate-800/80 px-1 rounded mt-0.5">
                    ₹{Number(seatedPlayer.buyInAmount).toLocaleString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Table Info */}
        <div className="mt-6 grid grid-cols-4 gap-4 bg-slate-800 p-4 rounded-lg">
          <div className="text-center">
            <div className="text-gray-400 text-sm">Players</div>
            <div className="text-white font-bold text-xl">{table.currentSeats || 0}/{table.maxSeats}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-sm">Table Value</div>
            <div className="text-emerald-400 font-bold text-xl">₹{tableValue.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-sm">Buy-In Range</div>
            <div className="text-white font-bold text-lg">₹{(table.minBuyIn || 0).toLocaleString()} - ₹{(table.maxBuyIn || 0).toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-sm">Status</div>
            <div className={`font-bold text-xl ${
              table.status === 'OCCUPIED' ? 'text-green-400' :
              table.status === 'AVAILABLE' ? 'text-yellow-400' :
              'text-gray-400'
            }`}>
              {table.status === 'OCCUPIED' ? 'Active' : 
               table.status === 'AVAILABLE' ? 'Waiting' : 
               table.status}
            </div>
          </div>
        </div>

        {/* Session Timer */}
        {(table.status === 'OCCUPIED' || (table.status === 'AVAILABLE' && table.notes?.includes('Paused Elapsed'))) && (
          <div className="mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 p-4 rounded-lg text-center">
            <div className="text-emerald-100 text-sm mb-1">SESSION RUNNING TIME</div>
            <div className="text-white font-bold text-3xl font-mono">{sessionTime}</div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-lg font-bold text-white transition-colors"
          >
            Close
          </button>
        </div>
          </>
        ) : (
          /* History Tab */
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Buy-In & Buy-Out History</h3>
            {tableHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No transaction history for this table yet.
              </div>
            ) : (
              <div className="space-y-3">
                {tableHistory.map((transaction, idx) => {
                  const isBuyIn = transaction.type === 'Buy In';
                  return (
                    <div 
                      key={transaction.id || idx} 
                      className={`p-4 rounded-lg border-2 ${
                        isBuyIn 
                          ? 'bg-green-900/20 border-green-600/50' 
                          : 'bg-orange-900/20 border-orange-600/50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {isBuyIn ? '💰' : '💵'}
                            </span>
                            <div>
                              <div className="font-bold text-white">
                                {transaction.playerName || transaction.player_name || 'Unknown Player'}
                              </div>
                              <div className="text-sm text-gray-400">
                                {isBuyIn ? 'Buy-In' : 'Buy-Out'}
                                {transaction.notes && ` • ${transaction.notes}`}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(transaction.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={`text-right ${isBuyIn ? 'text-green-400' : 'text-orange-400'}`}>
                          <div className="font-bold text-2xl">
                            {isBuyIn ? '+' : ''}₹{Number(transaction.amount).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {transaction.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-lg font-bold text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Rummy Table Management View Component (CRUD with Rummy-specific fields)
// ============================================================================
function RummyTableManagementView({ selectedClubId, tables, tablesLoading }) {
  const [subTab, setSubTab] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [selectedTableForDealer, setSelectedTableForDealer] = useState("");
  const [selectedDealer, setSelectedDealer] = useState("");
  const queryClient = useQueryClient();

  // Fetch dealers (staff with 'Dealer' role - case sensitive!)
  const { data: staffData, isLoading: dealersLoading } = useQuery({
    queryKey: ['staff', selectedClubId],
    queryFn: () => staffAPI.getStaff(selectedClubId),
    enabled: !!selectedClubId,
  });

  // Filter to get all active dealers (role is 'Dealer' not 'DEALER')
  const allDealers = staffData?.filter(staff => staff.role === 'Dealer' && staff.status === 'Active') || [];

  // Get dealers on leave for today
  const today = new Date().toISOString().split('T')[0];
  const { data: dealersOnLeaveData } = useQuery({
    queryKey: ['dealersOnLeave', selectedClubId, today],
    queryFn: () => shiftsAPI.getDealers(selectedClubId, today),
    enabled: !!selectedClubId,
  });

  // Get dealers with shifts today (for assign dealer functionality)
  const { data: availableDealersForToday } = useQuery({
    queryKey: ['availableDealersForToday', selectedClubId, today],
    queryFn: () => shiftsAPI.getAvailableDealersForDate(selectedClubId, today),
    enabled: !!selectedClubId,
  });

  // Dealers on leave today (those NOT in the filtered list from API)
  // The API returns dealers NOT on leave, so dealers missing from that list are on leave
  const dealersNotOnLeave = dealersOnLeaveData?.dealers || [];
  const dealersOnLeaveIds = new Set(
    allDealers
      .filter(dealer => !dealersNotOnLeave.find(d => d.id === dealer.id))
      .map(d => d.id)
  );

  // Get dealers that are already assigned to active tables (check ALL tables in system)
  const { data: allTablesData } = useQuery({
    queryKey: ['all-tables', selectedClubId],
    queryFn: () => tablesAPI.getTables(selectedClubId),
    enabled: !!selectedClubId,
  });

  const assignedDealerIds = new Set(
    (allTablesData || [])
      .filter(table => (table.status === 'OCCUPIED' || table.status === 'RESERVED') && table.notes)
      .map(table => {
        const dealerMatch = table.notes?.match(/Dealer:\s*([a-f0-9-]{36})/i);
        return dealerMatch ? dealerMatch[1] : null;
      })
      .filter(Boolean)
  );

  // For assign dealer: Only show dealers who have shifts today AND are not on leave
  // Also filter to only rummy dealers (gameType is 'rummy' or not set)
  const dealersForAssignment = (availableDealersForToday?.dealers || []).filter(
    dealer => !assignedDealerIds.has(dealer.id) && dealer.gameType !== 'poker'
  );

  // For general display: Filter out dealers on leave, only show rummy dealers
  const availableDealers = allDealers.filter(
    dealer => !assignedDealerIds.has(dealer.id) && !dealersOnLeaveIds.has(dealer.id) && dealer.gameType !== 'poker'
  );

  // Assign dealer mutation
  const assignDealerMutation = useMutation({
    mutationFn: async ({ tableId, dealerId }) => {
      const table = tables.find(t => t.id === tableId);
      const dealer = allDealers.find(d => d.id === dealerId);
      
      if (!table || !dealer) {
        throw new Error('Table or dealer not found');
      }

      const existingNotes = table.notes || '';
      const notesWithoutDealer = existingNotes.replace(/\s*\|\s*Dealer:.*$/i, '');
      const updatedNotes = `${notesWithoutDealer} | Dealer: ${dealer.id} (${dealer.name})`.trim();

      return tablesAPI.updateTable(selectedClubId, tableId, {
        notes: updatedNotes
      });
    },
    onSuccess: () => {
      toast.success('Dealer assigned successfully');
      setSelectedTableForDealer("");
      setSelectedDealer("");
      queryClient.invalidateQueries(['rummy-tables', selectedClubId]);
      queryClient.invalidateQueries(['all-tables', selectedClubId]);
      queryClient.invalidateQueries(['staff', selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to assign dealer');
    },
  });

  const handleAssignDealer = () => {
    if (!selectedTableForDealer || !selectedDealer) {
      toast.error('Please select both table and dealer');
      return;
    }
    assignDealerMutation.mutate({
      tableId: selectedTableForDealer,
      dealerId: selectedDealer,
    });
  };

  // Rummy-specific variants
  const rummyVariants = [
    "Points Rummy",
    "Pool Rummy (101 Points)",
    "Pool Rummy (201 Points)",
    "Deals Rummy",
    "Custom",
  ];

  const [tableForm, setTableForm] = useState({
    tableNumber: "",
    tableName: "",
    rummy_variant: "Points Rummy",
    custom_variant: "",
    points_value: 1,
    number_of_deals: 1,
    drop_points: 20,
    max_points: 80,
    min_players: 2,
    max_players: 6,
    entry_fee: "",
    min_buy_in: "",
    max_buy_in: "",
    deal_duration: 5,
    notes: "",
  });

  // Create table mutation
  const createTableMutation = useMutation({
    mutationFn: (data) => tablesAPI.createTable(selectedClubId, {
      ...data,
      tableType: 'RUMMY',
    }),
    onSuccess: () => {
      toast.success('Rummy table created successfully');
      queryClient.invalidateQueries(['rummy-tables', selectedClubId]);
      setShowCreateModal(false);
      setSubTab("all");
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create rummy table');
    },
  });

  // Update table mutation
  const updateTableMutation = useMutation({
    mutationFn: ({ tableId, data }) => tablesAPI.updateTable(selectedClubId, tableId, {
      ...data,
      tableType: 'RUMMY',
    }),
    onSuccess: () => {
      toast.success('Rummy table updated successfully');
      queryClient.invalidateQueries(['rummy-tables', selectedClubId]);
      setShowCreateModal(false);
      setEditingTable(null);
      setSubTab("all");
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update rummy table');
    },
  });

  // Delete table mutation
  const deleteTableMutation = useMutation({
    mutationFn: (tableId) => tablesAPI.deleteTable(selectedClubId, tableId),
    onSuccess: () => {
      toast.success('Rummy table deleted successfully');
      queryClient.invalidateQueries(['rummy-tables', selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete rummy table');
    },
  });

  // Start session mutation
  const startSessionMutation = useMutation({
    mutationFn: (tableId) => tablesAPI.resumeSession(selectedClubId, tableId),
    onSuccess: () => {
      toast.success('Session started successfully');
      queryClient.invalidateQueries(['rummy-tables', selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to start session');
    },
  });

  const resetForm = () => {
    setTableForm({
      tableNumber: "",
      tableName: "",
      rummy_variant: "Points Rummy",
      custom_variant: "",
      points_value: 1,
      number_of_deals: 1,
      drop_points: 20,
      max_points: 80,
      min_players: 2,
      max_players: 6,
      entry_fee: "",
      min_buy_in: "",
      max_buy_in: "",
      deal_duration: 5,
      notes: "",
    });
    setEditingTable(null);
  };

  const handleCreateTable = (e) => {
    e.preventDefault();
    if (!selectedClubId) {
      toast.error('Please select a club first');
      return;
    }

    if (!tableForm.tableNumber) {
      toast.error('Table number is required');
      return;
    }

    if (editingTable) {
      updateTableMutation.mutate({
        tableId: editingTable.id,
        data: {
          tableType: 'RUMMY',
          maxSeats: parseInt(tableForm.max_players),
          minBuyIn: tableForm.min_buy_in ? parseFloat(tableForm.min_buy_in) : null,
          maxBuyIn: tableForm.max_buy_in ? parseFloat(tableForm.max_buy_in) : null,
          notes: tableForm.notes || `${tableForm.tableName || 'Rummy Table ' + tableForm.tableNumber} | ${tableForm.rummy_variant === 'Custom' ? tableForm.custom_variant : tableForm.rummy_variant} | Points: ${tableForm.points_value} | Deals: ${tableForm.number_of_deals} | Drop: ${tableForm.drop_points} | Max: ${tableForm.max_points}`,
          // Rummy-specific fields
          rummyVariant: tableForm.rummy_variant === 'Custom' ? tableForm.custom_variant : tableForm.rummy_variant,
          pointsValue: parseFloat(tableForm.points_value) || 1.0,
          numberOfDeals: parseInt(tableForm.number_of_deals) || null,
          dropPoints: parseInt(tableForm.drop_points) || null,
          maxPoints: parseInt(tableForm.max_points) || null,
          dealDuration: parseInt(tableForm.deal_duration) || null,
          entryFee: tableForm.entry_fee ? parseFloat(tableForm.entry_fee) : null,
          minPlayers: parseInt(tableForm.min_players) || 2,
        }
      });
    } else {
      createTableMutation.mutate({
        tableNumber: parseInt(tableForm.tableNumber),
        tableType: 'RUMMY',
        maxSeats: parseInt(tableForm.max_players),
        minBuyIn: tableForm.min_buy_in ? parseFloat(tableForm.min_buy_in) : null,
        maxBuyIn: tableForm.max_buy_in ? parseFloat(tableForm.max_buy_in) : null,
        notes: tableForm.notes || `${tableForm.tableName || 'Rummy Table ' + tableForm.tableNumber} | ${tableForm.rummy_variant === 'Custom' ? tableForm.custom_variant : tableForm.rummy_variant} | Points: ${tableForm.points_value} | Deals: ${tableForm.number_of_deals} | Drop: ${tableForm.drop_points} | Max: ${tableForm.max_points}`,
        // Rummy-specific fields
        rummyVariant: tableForm.rummy_variant === 'Custom' ? tableForm.custom_variant : tableForm.rummy_variant,
        pointsValue: parseFloat(tableForm.points_value) || 1.0,
        numberOfDeals: parseInt(tableForm.number_of_deals) || null,
        dropPoints: parseInt(tableForm.drop_points) || null,
        maxPoints: parseInt(tableForm.max_points) || null,
        dealDuration: parseInt(tableForm.deal_duration) || null,
        entryFee: tableForm.entry_fee ? parseFloat(tableForm.entry_fee) : null,
        minPlayers: parseInt(tableForm.min_players) || 2,
      });
    }
  };

  const handleEditTable = (table) => {
    setEditingTable(table);
    setTableForm({
      tableNumber: table.tableNumber?.toString() || "",
      tableName: table.notes?.split('|')[0]?.trim() || "",
      rummy_variant: table.rummyVariant || "Points Rummy",
      custom_variant: "",
      points_value: table.pointsValue || 1,
      number_of_deals: table.numberOfDeals || 1,
      drop_points: table.dropPoints || 20,
      max_points: table.maxPoints || 80,
      min_players: table.minPlayers || 2,
      max_players: table.maxSeats || 6,
      entry_fee: table.entryFee?.toString() || "",
      min_buy_in: table.minBuyIn?.toString() || "",
      max_buy_in: table.maxBuyIn?.toString() || "",
      deal_duration: table.dealDuration || 5,
      notes: table.notes || "",
    });
    setSubTab("add");
  };

  const handleDeleteTable = (table) => {
    if (window.confirm(`Are you sure you want to delete Table ${table.tableNumber}?`)) {
      deleteTableMutation.mutate(table.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-2xl font-bold mb-6">Rummy Table Management</h2>

        {/* Sub Tabs */}
        <div className="flex gap-2 border-b border-slate-700 pb-4 mb-6">
          <button
            onClick={() => setSubTab("all")}
            className={`px-5 py-2 rounded-t-lg font-semibold transition-all ${
              subTab === "all"
                ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg"
                : "bg-slate-700 text-gray-400 hover:bg-slate-600"
            }`}
          >
            All Tables
          </button>
          <button
            onClick={() => {
              setSubTab("add");
              setEditingTable(null);
              resetForm();
            }}
            className={`px-5 py-2 rounded-t-lg font-semibold transition-all ${
              subTab === "add"
                ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg"
                : "bg-slate-700 text-gray-400 hover:bg-slate-600"
            }`}
          >
            Add New Table
          </button>
        </div>

        {/* All Tables List */}
        {subTab === "all" && (
          <div className="space-y-4">
            {tablesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p>Loading rummy tables...</p>
              </div>
            ) : tables.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🃏</div>
                <p className="text-xl text-gray-300">No rummy tables created yet</p>
                <p className="text-gray-400 text-sm mt-2">Click "Add New Table" to create your first rummy table</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tables.map((table) => (
                  <div
                    key={table.id}
                    className="bg-slate-700 rounded-xl p-5 border border-slate-600"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">Table {table.tableNumber}</h3>
                        <p className="text-sm text-gray-400">{table.rummyVariant || 'RUMMY'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        table.status === 'AVAILABLE' ? 'bg-green-600/20 text-green-400' :
                        table.status === 'OCCUPIED' ? 'bg-emerald-600/20 text-emerald-400' :
                        table.status === 'RESERVED' ? 'bg-yellow-600/20 text-yellow-400' :
                        'bg-gray-600/20 text-gray-400'
                      }`}>
                        {table.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Max Seats:</span>
                        <span className="text-white font-medium">{table.maxSeats}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Stakes:</span>
                        <span className="text-white font-medium">₹{table.minBuyIn || 0}/₹{table.maxBuyIn || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Current Seats:</span>
                        <span className="text-white font-medium">{table.currentSeats || 0} / {table.maxSeats}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {table.status === 'AVAILABLE' || table.status === 'CLOSED' ? (
                        <button
                          onClick={() => startSessionMutation.mutate(table.id)}
                          disabled={startSessionMutation.isLoading}
                          className="flex-1 bg-green-600 hover:bg-green-500 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          <span>▶</span>
                          <span>Start Session</span>
                        </button>
                      ) : null}
                      <button
                        onClick={() => handleEditTable(table)}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTable(table)}
                        disabled={deleteTableMutation.isLoading}
                        className="flex-1 bg-red-600 hover:bg-red-500 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Table Form */}
        {subTab === "add" && (
          <div className="bg-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-6">{editingTable ? 'Edit Rummy Table' : 'Create New Rummy Table'}</h3>
            <form onSubmit={handleCreateTable} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Table Number *</label>
                  <input
                    type="number"
                    value={tableForm.tableNumber}
                    onChange={(e) => setTableForm({...tableForm, tableNumber: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="1"
                    required
                    disabled={!!editingTable}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Table Name</label>
                  <input
                    type="text"
                    value={tableForm.tableName}
                    onChange={(e) => setTableForm({...tableForm, tableName: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="e.g., Premium Rummy Table"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rummy Variant *</label>
                <select
                  value={tableForm.rummy_variant}
                  onChange={(e) => setTableForm({...tableForm, rummy_variant: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  required
                >
                  {rummyVariants.map(variant => (
                    <option key={variant} value={variant}>{variant}</option>
                  ))}
                </select>
              </div>

              {tableForm.rummy_variant === 'Custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Custom Variant Name</label>
                  <input
                    type="text"
                    value={tableForm.custom_variant}
                    onChange={(e) => setTableForm({...tableForm, custom_variant: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="Enter custom variant name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Points Value (per ₹)</label>
                <input
                  type="number"
                  value={tableForm.points_value}
                  onChange={(e) => setTableForm({...tableForm, points_value: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  min="0.1"
                  step="0.1"
                />
              </div>

              {(tableForm.rummy_variant.includes('Points') || tableForm.rummy_variant === 'Custom') && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Drop Points</label>
                      <input
                        type="number"
                        value={tableForm.drop_points}
                        onChange={(e) => setTableForm({...tableForm, drop_points: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Max Points</label>
                      <input
                        type="number"
                        value={tableForm.max_points}
                        onChange={(e) => setTableForm({...tableForm, max_points: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                        min="0"
                      />
                    </div>
                  </div>
                </>
              )}

              {tableForm.rummy_variant === 'Deals Rummy' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Number of Deals</label>
                  <input
                    type="number"
                    value={tableForm.number_of_deals}
                    onChange={(e) => setTableForm({...tableForm, number_of_deals: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    min="1"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Min Players</label>
                  <input
                    type="number"
                    value={tableForm.min_players}
                    onChange={(e) => setTableForm({...tableForm, min_players: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    min="2"
                    max="6"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Players *</label>
                  <input
                    type="number"
                    value={tableForm.max_players}
                    onChange={(e) => setTableForm({...tableForm, max_players: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    min="2"
                    max="6"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Entry Fee (₹)</label>
                  <input
                    type="number"
                    value={tableForm.entry_fee}
                    onChange={(e) => setTableForm({...tableForm, entry_fee: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Min Buy-in (₹)</label>
                  <input
                    type="number"
                    value={tableForm.min_buy_in}
                    onChange={(e) => setTableForm({...tableForm, min_buy_in: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Buy-in (₹)</label>
                  <input
                    type="number"
                    value={tableForm.max_buy_in}
                    onChange={(e) => setTableForm({...tableForm, max_buy_in: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Deal Duration (minutes)</label>
                <input
                  type="number"
                  value={tableForm.deal_duration}
                  onChange={(e) => setTableForm({...tableForm, deal_duration: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea
                  value={tableForm.notes}
                  onChange={(e) => setTableForm({...tableForm, notes: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  rows="3"
                  placeholder="Additional notes about this table..."
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  disabled={createTableMutation.isLoading || updateTableMutation.isLoading || !selectedClubId}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {createTableMutation.isLoading || updateTableMutation.isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {editingTable ? 'Updating...' : 'Creating...'}
                    </span>
                  ) : (
                    editingTable ? 'Update Table' : 'Create Table'
                  )}
                </button>
                {editingTable && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTable(null);
                      resetForm();
                      setSubTab("all");
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg font-semibold transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Dealer Assignment Section */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold mb-4">Dealer Assignment</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Select Table</label>
            <select 
              value={selectedTableForDealer}
              onChange={(e) => setSelectedTableForDealer(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              disabled={!selectedClubId}
            >
              <option value="">-- Select Table --</option>
              {tables.map((table) => (
                <option key={table.id} value={table.id}>
                  Table {table.tableNumber} - {table.rummyVariant || 'Rummy'} ({table.status})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Assign Dealer</label>
            <select 
              value={selectedDealer}
              onChange={(e) => setSelectedDealer(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              disabled={!selectedClubId || dealersLoading}
            >
              <option value="">-- Select Dealer --</option>
              {dealersLoading ? (
                <option disabled>Loading dealers...</option>
              ) : dealersForAssignment.length === 0 ? (
                <option disabled>
                  {allDealers.length > 0 
                    ? 'No dealers available (all assigned, on leave, or no shift today)' 
                    : 'No active dealers found'}
                </option>
              ) : (
                dealersForAssignment.map((dealer) => (
                  <option key={dealer.id} value={dealer.id}>
                    {dealer.name} ({dealer.employeeId || 'No ID'})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
        <button 
          onClick={handleAssignDealer}
          disabled={!selectedTableForDealer || !selectedDealer || assignDealerMutation.isLoading || !selectedClubId}
          className="mt-4 bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {assignDealerMutation.isLoading ? 'Assigning...' : 'Assign Dealer'}
        </button>
        {allDealers.length === 0 && !dealersLoading && selectedClubId && (
          <p className="mt-2 text-sm text-yellow-400">
            ⚠️ No active dealers found. Please create dealer staff members first.
          </p>
        )}
        {dealersForAssignment.length === 0 && allDealers.length > 0 && !dealersLoading && (
          <p className="mt-2 text-sm text-amber-400">
            ℹ️ No dealers available. They may be assigned, on leave, or don't have a shift today.
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Table Buy-In View Component (Waitlist Management)
// ============================================================================
function TableBuyInView({ selectedClubId, tables, waitlist, waitlistLoading }) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-2xl font-bold mb-6">Waitlist Management</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Waitlist */}
          <div className="bg-slate-700 rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-4">Current Waitlist</h3>
            {waitlistLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
                <p className="text-sm">Loading...</p>
              </div>
            ) : waitlist.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No players in waitlist
              </div>
            ) : (
              <div className="space-y-3">
                {waitlist.map((entry) => (
                  <div key={entry.id} className="bg-slate-600 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-white">{entry.playerName}</div>
                        <div className="text-sm text-gray-400">Position: {entry.priority || 'N/A'}</div>
                        <div className="text-sm text-gray-400">Table Type: {entry.tableType || 'Any'}</div>
                      </div>
                      <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded text-xs font-semibold">
                        {entry.status}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded text-sm font-medium transition-colors">
                        🎯 View Table
                      </button>
                      <button className="flex-1 bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded text-sm font-medium transition-colors">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seat Allocation */}
          <div className="bg-slate-700 rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-4">Seat Allocation</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Select Player</label>
                <select className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white">
                  <option value="">-- Select Player --</option>
                  {waitlist.map((entry) => (
                    <option key={entry.id} value={entry.id}>{entry.playerName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Select Table</label>
                <select className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white">
                  <option value="">-- Select Table --</option>
                  {tables.map((table) => (
                    <option key={table.id} value={table.id}>Table {table.tableNumber}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Seat Number</label>
                <select className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white">
                  <option value="">-- Select Seat --</option>
                  {[1, 2, 3, 4, 5, 6].map((seat) => (
                    <option key={seat} value={seat}>Seat {seat}</option>
                  ))}
                </select>
              </div>
              <button className="w-full bg-purple-600 hover:bg-purple-500 px-4 py-3 rounded-lg font-semibold transition-colors">
                Assign Seat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Player Call & Reorder */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-2xl font-bold mb-6">Player Call & Reorder</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Call Players */}
          <div className="bg-slate-700 rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-4">Call Players</h3>
            <div className="space-y-3">
              <button className="w-full bg-green-600 hover:bg-green-500 px-4 py-3 rounded-lg font-semibold transition-colors">
                Call Next Player
              </button>
              <button className="w-full bg-emerald-600 hover:bg-emerald-500 px-4 py-3 rounded-lg font-semibold transition-colors">
                Call All Players
              </button>
              <button className="w-full bg-yellow-600 hover:bg-yellow-500 px-4 py-3 rounded-lg font-semibold transition-colors">
                Send SMS Notification
              </button>
            </div>
          </div>

          {/* Reorder Waitlist */}
          <div className="bg-slate-700 rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-4">Reorder Waitlist</h3>
            <div className="space-y-2">
              {waitlist.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No players to reorder
                </div>
              ) : (
                waitlist.map((entry, index) => (
                  <div key={entry.id} className="bg-slate-600 p-3 rounded flex justify-between items-center">
                    <span className="text-white">{index + 1}. {entry.playerName}</span>
                    <div className="flex gap-1">
                      <button
                        disabled={index === 0}
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-2 py-1 rounded text-xs transition-colors"
                      >
                        ↑
                      </button>
                      <button
                        disabled={index === waitlist.length - 1}
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-2 py-1 rounded text-xs transition-colors"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Table Buy-Out View Component
// ============================================================================
function TableBuyOutView({ selectedClubId, tables }) {
  const [activeSubTab, setActiveSubTab] = useState("process-buyout");

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-600/30 via-red-500/20 to-rose-700/30 rounded-xl p-6 border border-orange-800/40">
        <h2 className="text-2xl font-bold mb-4">Rummy Table Buy-Out</h2>
        <p className="text-gray-300 text-sm mb-6">
          Manage player buy-out requests and process manual buy-outs for rummy tables.
        </p>

        {/* Sub Tabs */}
        <div className="flex gap-2 border-b border-orange-800/40 pb-4 mb-6">
          <button
            onClick={() => setActiveSubTab("process-buyout")}
            className={`px-5 py-2 rounded-t-lg font-semibold transition-all ${
              activeSubTab === "process-buyout"
                ? "bg-gradient-to-r from-orange-600 to-red-700 text-white shadow-lg"
                : "bg-slate-700 text-gray-400 hover:bg-slate-600"
            }`}
          >
            Process Buy-Out
          </button>
          <button
            onClick={() => setActiveSubTab("player-requests")}
            className={`px-5 py-2 rounded-t-lg font-semibold transition-all ${
              activeSubTab === "player-requests"
                ? "bg-gradient-to-r from-orange-600 to-red-700 text-white shadow-lg"
                : "bg-slate-700 text-gray-400 hover:bg-slate-600"
            }`}
          >
            Player Requests
          </button>
        </div>

        {/* Sub Tab Content */}
        {activeSubTab === "process-buyout" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Process Buy-Out */}
            <div className="bg-white/10 p-5 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Process Buy-Out</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Select Seated Player</label>
                  <select className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                    <option value="">-- Select Player --</option>
                  </select>
                </div>
                <div className="p-4 bg-emerald-500/20 rounded-lg border border-emerald-400/30">
                  <div className="text-sm text-white space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Player:</span>
                      <span className="font-semibold">-</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Table:</span>
                      <span className="font-semibold">-</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Current Table Balance:</span>
                      <span className="font-semibold text-emerald-300">0 chips</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Reason (Optional)</label>
                  <textarea
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    rows="3"
                    placeholder="Enter reason for buy-out (optional)..."
                  />
                </div>
                <button className="w-full bg-orange-600 hover:bg-orange-500 px-4 py-3 rounded-lg font-semibold transition-colors">
                  Approve Buy-Out
                </button>
              </div>
            </div>

            {/* Buy-Out Information */}
            <div className="bg-white/10 p-5 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Buy-Out Information</h3>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="text-white font-semibold mb-2">How Buy-Out Works:</h4>
                  <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
                    <li>Select a player who is currently seated at a rummy table</li>
                    <li>Their table chip balance will be moved to their available balance</li>
                    <li>Player will be removed from the table (seat becomes available)</li>
                    <li>Player can then convert chips to real money at the cashier counter</li>
                  </ul>
                </div>

                <div className="p-4 bg-yellow-500/20 rounded-lg border border-yellow-400/30">
                  <h4 className="text-yellow-300 font-semibold mb-2">⚠️ Important Notes:</h4>
                  <ul className="text-sm text-yellow-200 space-y-1 list-disc list-inside">
                    <li>Buy-out approval is permanent and cannot be undone</li>
                    <li>Table balance will be immediately transferred to player's available balance</li>
                    <li>Player must go to cashier to convert chips to real money</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-500/20 rounded-lg border border-green-400/30">
                  <div className="text-sm text-green-300">
                    <div className="font-semibold mb-1">Currently Seated Players:</div>
                    <div className="text-green-200">0 player(s) at rummy tables</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "player-requests" && (
          <TableBuyOutManagement clubId={selectedClubId} />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Rummy History View Component (History Tab)
// ============================================================================
function RummyHistoryView({ selectedClubId, tables }) {
  const [historyFilters, setHistoryFilters] = useState({
    type: 'all',
    search: '',
    tableNumber: 'all',
    page: 1,
    perPage: 10,
  });

  const { data: allTransactions = [], isLoading: historyLoading } = useQuery({
    queryKey: ['rummy-transactions', selectedClubId],
    queryFn: async () => {
      if (!selectedClubId) return [];
      try {
        const response = await superAdminAPI.getTransactions(selectedClubId, {});
        let transactions = Array.isArray(response) ? response : (response?.data || response?.transactions || []);
        // Filter to only rummy game_type transactions
        return transactions.filter(t => t.game_type === 'rummy');
      } catch (error) {
        console.error('[RUMMY HISTORY] Error fetching transactions:', error);
        return [];
      }
    },
    enabled: !!selectedClubId,
  });

  const filteredHistory = allTransactions.filter(t => {
    const isBuyIn = t.type === 'Buy In';
    const isBuyOut = (t.type === 'Deposit' || t.type === 'Cashout') && 
                     (t.notes?.toLowerCase().includes('buy-out') || 
                      t.notes?.toLowerCase().includes('buyout') ||
                      t.description?.toLowerCase().includes('buy-out') ||
                      t.description?.toLowerCase().includes('buyout'));
    
    if (historyFilters.type === 'buy-in' && !isBuyIn) return false;
    if (historyFilters.type === 'buy-out' && !isBuyOut) return false;
    if (historyFilters.type === 'all' && !(isBuyIn || isBuyOut)) return false;
    
    if (historyFilters.tableNumber !== 'all') {
      const tableMatch = t.notes?.includes(`Table ${historyFilters.tableNumber}`) || 
                        t.description?.includes(`Table ${historyFilters.tableNumber}`) ||
                        t.notes?.includes(`table ${historyFilters.tableNumber}`) ||
                        t.description?.includes(`table ${historyFilters.tableNumber}`);
      if (!tableMatch) return false;
    }
    
    if (historyFilters.search) {
      const search = historyFilters.search.toLowerCase();
      const playerName = t.playerName || t.player_name || '';
      const email = t.email || '';
      return (
        playerName.toLowerCase().includes(search) ||
        email.toLowerCase().includes(search)
      );
    }
    
    return true;
  });

  const paginatedHistory = filteredHistory.slice(
    (historyFilters.page - 1) * historyFilters.perPage,
    historyFilters.page * historyFilters.perPage
  );
  
  const totalPages = Math.ceil(filteredHistory.length / historyFilters.perPage);
  
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600/30 via-teal-500/20 to-cyan-700/30 rounded-xl p-6 border border-emerald-800/40">
        <h2 className="text-2xl font-bold mb-4">Rummy Buy-In & Buy-Out History</h2>
        <p className="text-gray-300 text-sm mb-6">
          View all rummy buy-in and buy-out transactions with advanced filters.
        </p>
        <div className="bg-white/10 p-5 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Transaction Type</label>
              <select 
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                value={historyFilters.type}
                onChange={(e) => setHistoryFilters({...historyFilters, type: e.target.value, page: 1})}
              >
                <option value="all">All Transactions</option>
                <option value="buy-in">Buy-In Only</option>
                <option value="buy-out">Buy-Out Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Table</label>
              <select 
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                value={historyFilters.tableNumber}
                onChange={(e) => setHistoryFilters({...historyFilters, tableNumber: e.target.value, page: 1})}
              >
                <option value="all">All Tables</option>
                {tables.map((table) => (
                  <option key={table.id} value={table.tableNumber}>
                    Table {table.tableNumber}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Search Player</label>
              <input 
                type="text"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                placeholder="Player name or email..."
                value={historyFilters.search}
                onChange={(e) => setHistoryFilters({...historyFilters, search: e.target.value, page: 1})}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 p-5 rounded-lg mt-4">
          <h3 className="text-lg font-semibold mb-4">
            Transaction History ({filteredHistory.length} records)
          </h3>
          
          {historyLoading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : paginatedHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No rummy transactions found</div>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {paginatedHistory.map((transaction, idx) => {
                  const isBuyIn = transaction.type === 'Buy In';
                  return (
                    <div 
                      key={transaction.id || idx} 
                      className={`p-4 rounded-lg border-2 ${
                        isBuyIn 
                          ? 'bg-green-900/20 border-green-600/50' 
                          : 'bg-orange-900/20 border-orange-600/50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {isBuyIn ? '💰' : '💵'}
                            </span>
                            <div>
                              <div className="font-bold text-white">
                                {transaction.playerName || transaction.player_name || 'Unknown Player'}
                              </div>
                              <div className="text-sm text-gray-400">
                                {isBuyIn ? 'Buy-In' : 'Buy-Out'}
                                {transaction.notes && ` • ${transaction.notes}`}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(transaction.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={`text-right ${isBuyIn ? 'text-green-400' : 'text-orange-400'}`}>
                          <div className="font-bold text-2xl">
                            {isBuyIn ? '+' : ''}₹{Number(transaction.amount).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {transaction.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => setHistoryFilters({...historyFilters, page: Math.max(1, historyFilters.page - 1)})}
                    disabled={historyFilters.page === 1}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg text-white"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 bg-slate-700 rounded-lg text-white">
                    Page {historyFilters.page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setHistoryFilters({...historyFilters, page: Math.min(totalPages, historyFilters.page + 1)})}
                    disabled={historyFilters.page >= totalPages}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg text-white"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
