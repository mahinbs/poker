import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tablesAPI, waitlistAPI, clubsAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import TableBuyOutManagement from '../../components/TableBuyOutManagement';

/**
 * Comprehensive Table Management Component for Super Admin
 * Features:
 * 1. Live Tables - Hologram view with seat status
 * 2. Table Management - CRUD operations
 * 3. Table Buy-In - Waitlist, seat allocation, reorder
 * 4. Table Buy-Out - Player requests, admin approval
 */
export default function TableManagement({ selectedClubId }) {
  const [activeTab, setActiveTab] = useState("live-tables");
  const queryClient = useQueryClient();

  // Fetch tables
  const { data: tablesData, isLoading: tablesLoading } = useQuery({
    queryKey: ['tables', selectedClubId],
    queryFn: () => tablesAPI.getTables(selectedClubId),
    enabled: !!selectedClubId,
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
    { id: "live-tables", label: "Live Tables" },
    { id: "table-management", label: "Table Management" },
    { id: "table-buy-in", label: "Table Buy-In" },
    { id: "table-buy-out", label: "Table Buy-Out" },
  ];

  return (
    <div className="text-white space-y-6">
      <h1 className="text-3xl font-bold">Tables & Waitlist</h1>

      {!selectedClubId && (
        <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 text-yellow-100 flex items-center gap-3">
          <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.3 2.647-1.3 3.412 0l7 12a1.5 1.5 0 01-1.302 2.25H2.847a1.5 1.5 0 01-1.302-2.25l7-12zM9 13a1 1 0 112 0v2a1 1 0 11-2 0v-2zm0-6a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <p className="font-medium">Please select a club from the sidebar dropdown to manage tables.</p>
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
                ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-b-2 border-blue-400"
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
          <TableManagementView
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
            <h2 className="text-2xl font-bold">Live Tables - Hologram View</h2>
            <p className="text-gray-400 text-sm mt-1">Manage live tables, seat players, and handle buy-ins using table hologram.</p>
          </div>
          <div className="bg-slate-700 px-4 py-2 rounded-lg">
            <div className="text-sm text-gray-300">Active Tables: {activeTables.length}</div>
            <div className="text-sm text-gray-300">Total Players: {activeTables.reduce((sum, t) => sum + (t.currentSeats || 0), 0)}</div>
          </div>
        </div>

        {tablesLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading tables...</p>
          </div>
        ) : activeTables.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎲</div>
            <p className="text-xl text-gray-300">No active tables</p>
            <p className="text-gray-400 text-sm mt-2">Create and activate tables in Table Management</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTables.map((table) => (
              <div
                key={table.id}
                className="bg-slate-700 rounded-xl p-5 border border-slate-600 hover:border-blue-500 transition-all cursor-pointer"
                onClick={() => setSelectedTable(table)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">Table {table.tableNumber}</h3>
                    <p className="text-sm text-gray-400">{table.tableType}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    table.status === 'OCCUPIED' ? 'bg-green-600/20 text-green-400' : 'bg-blue-600/20 text-blue-400'
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
                    <span className="text-green-400 font-medium">{table.maxSeats - (table.currentSeats || 0)}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTable(table);
                  }}
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
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
      queryClient.invalidateQueries(['tables', selectedClubId]);
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
      queryClient.invalidateQueries(['tables', selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to resume session');
    },
  });

  // End session mutation
  const endSessionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClubId) throw new Error('Club ID not found');
      return await tablesAPI.endSession(selectedClubId, table.id);
    },
    onSuccess: () => {
      toast.success('Session ended successfully');
      queryClient.invalidateQueries(['tables', selectedClubId]);
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
      queryClient.invalidateQueries(['tables', selectedClubId]);
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

  const handleEndSession = () => {
    if (window.confirm('Are you sure you want to end this session? This action cannot be undone.')) {
      endSessionMutation.mutate();
    }
  };

  const handleSetParameter = (param, value) => {
    const params = { [param]: parseInt(value) };
    updateParamsMutation.mutate(params);
  };

  const getTableGameType = (t) => {
    const noteParts = t.notes ? t.notes.split('|').map(p => p.trim()) : [];
    return noteParts[1] || t.tableType;
  };

  const getTableStakes = (t) => {
    const noteParts = t.notes ? t.notes.split('|').map(p => p.trim()) : [];
    return noteParts[2]?.replace('Stakes:', '').trim() || `₹${t.minBuyIn || 0}/₹${t.maxBuyIn || 0}`;
  };

  return (
    <div className="bg-gradient-to-br from-blue-900/50 via-purple-900/50 to-indigo-900/50 rounded-2xl p-8 border-2 border-blue-500/30 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Table Session Control</h2>
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
                    ? 'bg-blue-600/30 border-2 border-blue-500'
                    : 'bg-slate-700/50 border border-slate-600 hover:bg-slate-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-white">Table {t.tableNumber} - {getTableGameType(t).split(' | ')[0]}</div>
                    <div className="text-sm text-gray-400">{getTableGameType(t)}</div>
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
          <div className="mt-6 p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg">
            <div className="text-sm text-blue-300 mb-2">Selected: Table {table.tableNumber} - {getTableGameType(table).split(' | ')[0]}</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-400">Game:</span>
                <span className="text-white ml-2">{getTableGameType(table)}</span>
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
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-semibold transition-colors"
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
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-semibold transition-colors"
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
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-semibold transition-colors"
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
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-semibold transition-colors"
                >
                  Set
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">Current: {sessionParams.sessionTimeout} mins</div>
            </div>
          </div>
        </div>
      </div>
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
  
  // Fetch club data to get logo
  useEffect(() => {
    const fetchClubData = async () => {
      try {
        const token = localStorage.getItem('token');
        const tenantId = localStorage.getItem('tenantId');
        
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3333/api'}/clubs/${clubId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-tenant-id': tenantId || '',
            'x-club-id': clubId,
          },
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Club data fetched:', data); // Debug log
          setClubData(data);
        } else {
          console.error('Failed to fetch club data:', response.status, await response.text());
        }
      } catch (error) {
        console.error('Error fetching club data:', error);
      }
    };
    if (clubId) {
      fetchClubData();
    }
  }, [clubId]);

  // Session timer - calculate elapsed time if session is active or paused
  useEffect(() => {
    if (!table) {
      setSessionTime('00:00:00');
      return;
    }

    // If paused, show the paused elapsed time
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

    // If active (OCCUPIED), calculate running time
    if (table.status !== 'OCCUPIED') {
      setSessionTime('00:00:00');
      return;
    }

    // Try to parse session start time from notes
    const sessionStartMatch = table.notes?.match(/Session Started: ([^|]+)/);
    const pausedElapsedMatch = table.notes?.match(/Paused Elapsed: (\d+)/);
    
    if (!sessionStartMatch || !sessionStartMatch[1]) {
      console.warn('No session start time found in notes:', table.notes);
      setSessionTime('00:00:00');
      return;
    }

    const sessionStartTimeStr = sessionStartMatch[1].trim();
    const sessionStartTime = new Date(sessionStartTimeStr);
    
    // Validate date
    if (isNaN(sessionStartTime.getTime())) {
      console.error('Invalid session start time:', sessionStartTimeStr, 'Full notes:', table.notes);
      setSessionTime('00:00:00');
      return;
    }

    const pausedElapsedSeconds = pausedElapsedMatch ? parseInt(pausedElapsedMatch[1], 10) : 0;
    
    // Validate paused elapsed
    if (isNaN(pausedElapsedSeconds) || pausedElapsedSeconds < 0) {
      console.warn('Invalid paused elapsed time, using 0:', pausedElapsedMatch?.[1]);
      // Continue with 0 instead of returning
    }
    
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

    updateTimer(); // Initial update
    const interval = setInterval(updateTimer, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, [table]);

  const seats = Array.from({ length: table.maxSeats }, (_, i) => i + 1);
  const occupiedSeats = []; // TODO: Get from backend

  // Parse table data from notes
  const noteParts = table.notes ? table.notes.split('|').map(p => p.trim()) : [];

  // Get club logo URL
  const clubLogoUrl = clubData?.logoUrl || null;
  console.log('Club logo URL:', clubLogoUrl, 'Club data:', clubData); // Debug log
  
  const gameType = table.notes?.match(/Game Type: ([^|]+)/)?.[1]?.trim() || noteParts[1] || table.tableType;
  const stakes = table.notes?.match(/Stakes: ([^|]+)/)?.[1]?.trim() || noteParts[2]?.replace('Stakes:', '').trim() || `₹${table.minBuyIn || 0}/₹${table.maxBuyIn || 0}`;
  
  // Parse table value from notes or use currentSeats * average buy-in as estimate
  const tableValueMatch = table.notes?.match(/Table Value: ₹?([\d,]+)/);
  const tableValue = tableValueMatch 
    ? parseInt(tableValueMatch[1].replace(/,/g, '')) 
    : (table.currentSeats || 0) * ((table.minBuyIn + table.maxBuyIn) / 2 || 25000);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl p-8 max-w-4xl w-full border-2 border-blue-500 shadow-2xl">
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

        {/* Table Value Display Above Hologram */}
        <div className="mb-6 flex justify-center">
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 px-6 py-3 rounded-2xl shadow-xl border-2 border-yellow-400">
            <div className="text-xs text-yellow-100 text-center mb-1">TABLE VALUE</div>
            <div className="text-3xl font-bold text-white text-center">₹{tableValue.toLocaleString()}</div>
          </div>
        </div>

        {/* Table Visualization */}
        <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-green-800 to-green-900 rounded-[50%] border-8 border-yellow-600 shadow-2xl flex items-center justify-center">
          {/* Center Logo - Show club logo or default */}
          <div className="absolute inset-0 flex items-center justify-center">
            {clubLogoUrl ? (
              <div className="bg-white rounded-full p-2 shadow-lg flex items-center justify-center w-24 h-24">
                <img 
                  src={clubLogoUrl} 
                  alt="Club Logo" 
                  className="w-20 h-20 rounded-full object-contain"
                  onError={(e) => {
                    console.error('Failed to load club logo:', clubLogoUrl);
                    e.target.style.display = 'none';
                    const fallback = e.target.nextSibling;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="text-2xl font-bold text-gray-800 hidden items-center justify-center">♠️♥️</div>
              </div>
            ) : (
              <div className="bg-white rounded-full p-4 shadow-lg">
                <div className="text-3xl font-bold text-gray-800">♠️♥️</div>
              </div>
            )}
          </div>

          {/* Dealer Position */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              D
            </div>
          </div>

          {/* Seats arranged in ellipse */}
          {seats.map((seatNum) => {
            const angle = (360 / table.maxSeats) * (seatNum - 1);
            const radians = (angle - 90) * (Math.PI / 180);
            const x = 50 + 40 * Math.cos(radians);
            const y = 50 + 35 * Math.sin(radians);
            const isOccupied = occupiedSeats.includes(seatNum);

            return (
              <div
                key={seatNum}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg transition-all cursor-pointer ${
                    isOccupied
                      ? 'bg-blue-600 text-white border-2 border-blue-400'
                      : 'bg-slate-700 text-gray-400 border-2 border-slate-600 hover:border-blue-500'
                  }`}
                >
                  {isOccupied ? 'P' + seatNum : seatNum}
                </div>
                <div className="text-center text-xs text-white mt-1">
                  Seat {seatNum}
                </div>
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
            <div className="text-yellow-400 font-bold text-xl">₹{tableValue.toLocaleString()}</div>
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

        {/* Session Timer - Show for active or paused sessions */}
        {(table.status === 'OCCUPIED' || (table.status === 'AVAILABLE' && table.notes?.includes('Paused Elapsed'))) && (
          <div className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-lg text-center">
            <div className="text-blue-100 text-sm mb-1">SESSION RUNNING TIME</div>
            <div className="text-white font-bold text-3xl font-mono">{sessionTime}</div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg font-bold text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Table Management View Component (CRUD)
// ============================================================================
function TableManagementView({ selectedClubId, tables, tablesLoading }) {
  const [subTab, setSubTab] = useState("all");
  const [tableForm, setTableForm] = useState({
    tableName: "",
    tableNumber: "",
    gameType: "Texas Hold'em",
    customGameType: "",
    maxSeats: 8,
    stakes: "",
    minPlayTime: "30",
    callTime: 5,
    cashOutWindow: 10,
    sessionTimeout: 120,
    tableType: "CASH",
    minBuyIn: "",
    maxBuyIn: "",
    notes: "",
  });
  const [editingTable, setEditingTable] = useState(null);
  const queryClient = useQueryClient();
  const [minPlayTimePreset, setMinPlayTimePreset] = useState("30");

  // Create table mutation
  const createTableMutation = useMutation({
    mutationFn: (data) => tablesAPI.createTable(selectedClubId, data),
    onSuccess: () => {
      toast.success('Table created successfully');
      setTableForm({
        tableName: "",
        tableNumber: "",
        gameType: "Texas Hold'em",
        customGameType: "",
        maxSeats: 8,
        stakes: "",
        minPlayTime: "30",
        callTime: 5,
        cashOutWindow: 10,
        sessionTimeout: 120,
        tableType: "CASH",
        minBuyIn: "",
        maxBuyIn: "",
        notes: "",
      });
      setMinPlayTimePreset("30");
      setSubTab("all");
      queryClient.invalidateQueries(['tables', selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create table');
    },
  });

  // Update table mutation
  const updateTableMutation = useMutation({
    mutationFn: ({ tableId, data }) => tablesAPI.updateTable(selectedClubId, tableId, data),
    onSuccess: () => {
      toast.success('Table updated successfully');
      setEditingTable(null);
      setTableForm({
        tableName: "",
        tableNumber: "",
        gameType: "Texas Hold'em",
        customGameType: "",
        maxSeats: 8,
        stakes: "",
        minPlayTime: "30",
        callTime: 5,
        cashOutWindow: 10,
        sessionTimeout: 120,
        tableType: "CASH",
        minBuyIn: "",
        maxBuyIn: "",
        notes: "",
      });
      setMinPlayTimePreset("30");
      setSubTab("all");
      queryClient.invalidateQueries(['tables', selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update table');
    },
  });

  // Delete table mutation
  const deleteTableMutation = useMutation({
    mutationFn: (tableId) => tablesAPI.deleteTable(selectedClubId, tableId),
    onSuccess: () => {
      toast.success('Table deleted successfully');
      queryClient.invalidateQueries(['tables', selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete table');
    },
  });

  // Start session mutation
  const startSessionMutation = useMutation({
    mutationFn: (tableId) => tablesAPI.resumeSession(selectedClubId, tableId),
    onSuccess: () => {
      toast.success('Session started successfully');
      queryClient.invalidateQueries(['tables', selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to start session');
    },
  });

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

    const normalizedMinPlayTime = minPlayTimePreset === "custom"
      ? Math.max(30, parseInt(tableForm.minPlayTime) || 30)
      : Math.max(30, parseInt(minPlayTimePreset) || 30);

    createTableMutation.mutate({
      tableNumber: parseInt(tableForm.tableNumber),
      tableType: tableForm.tableType,
      maxSeats: parseInt(tableForm.maxSeats),
      minBuyIn: tableForm.minBuyIn ? parseFloat(tableForm.minBuyIn) : null,
      maxBuyIn: tableForm.maxBuyIn ? parseFloat(tableForm.maxBuyIn) : null,
      notes: tableForm.notes || `${tableForm.tableName || 'Table ' + tableForm.tableNumber} | ${tableForm.gameType === 'Custom' ? tableForm.customGameType : tableForm.gameType} | Stakes: ${tableForm.stakes} | Min Play: ${normalizedMinPlayTime}m | Call: ${tableForm.callTime}m | Cash-out: ${tableForm.cashOutWindow}m | Timeout: ${tableForm.sessionTimeout}m`,
    });
  };

  const handleUpdateTable = (e) => {
    e.preventDefault();
    if (!editingTable) return;

    const normalizedMinPlayTime = minPlayTimePreset === "custom"
      ? Math.max(30, parseInt(tableForm.minPlayTime) || 30)
      : Math.max(30, parseInt(minPlayTimePreset) || 30);

    updateTableMutation.mutate({
      tableId: editingTable.id,
      data: {
        tableNumber: parseInt(tableForm.tableNumber),
        tableType: tableForm.tableType,
        maxSeats: parseInt(tableForm.maxSeats),
        minBuyIn: tableForm.minBuyIn ? parseFloat(tableForm.minBuyIn) : null,
        maxBuyIn: tableForm.maxBuyIn ? parseFloat(tableForm.maxBuyIn) : null,
        notes: tableForm.notes || `${tableForm.tableName || 'Table ' + tableForm.tableNumber} | ${tableForm.gameType === 'Custom' ? tableForm.customGameType : tableForm.gameType} | Stakes: ${tableForm.stakes} | Min Play: ${normalizedMinPlayTime}m | Call: ${tableForm.callTime}m | Cash-out: ${tableForm.cashOutWindow}m | Timeout: ${tableForm.sessionTimeout}m`,
      },
    });
  };

  const handleEditTable = (table) => {
    setEditingTable(table);
    
    // Parse notes to extract form values if available
    const noteParts = table.notes ? table.notes.split('|').map(p => p.trim()) : [];
    const tableName = noteParts[0] || `Table ${table.tableNumber}`;
    const gameType = noteParts[1] || 'Texas Hold\'em';
    const stakes = noteParts[2]?.replace('Stakes:', '').trim() || '';
    const minPlayTime = noteParts[3]?.match(/\d+/)?.[0] || '30';
    const callTime = noteParts[4]?.match(/\d+/)?.[0] || '5';
    const cashOutWindow = noteParts[5]?.match(/\d+/)?.[0] || '10';
    const sessionTimeout = noteParts[6]?.match(/\d+/)?.[0] || '120';
    
    setTableForm({
      tableName,
      tableNumber: table.tableNumber?.toString() || "",
      gameType,
      customGameType: "",
      maxSeats: table.maxSeats || 8,
      stakes,
      minPlayTime,
      callTime: parseInt(callTime),
      cashOutWindow: parseInt(cashOutWindow),
      sessionTimeout: parseInt(sessionTimeout),
      tableType: table.tableType || "CASH",
      minBuyIn: table.minBuyIn?.toString() || "",
      maxBuyIn: table.maxBuyIn?.toString() || "",
      notes: table.notes || "",
    });
    
    const presets = new Set(["30", "45", "60", "90", "120", "150", "180"]);
    setMinPlayTimePreset(presets.has(minPlayTime) ? minPlayTime : "custom");
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
        <h2 className="text-2xl font-bold mb-6">Table Management</h2>

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
              setTableForm({
                tableName: "",
                tableNumber: "",
                gameType: "Texas Hold'em",
                customGameType: "",
                maxSeats: 8,
                stakes: "",
                minPlayTime: "30",
                callTime: 5,
                cashOutWindow: 10,
                sessionTimeout: 120,
                tableType: "CASH",
                minBuyIn: "",
                maxBuyIn: "",
                notes: "",
              });
              setMinPlayTimePreset("30");
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
                <p>Loading tables...</p>
              </div>
            ) : tables.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎲</div>
                <p className="text-xl text-gray-300">No tables created yet</p>
                <p className="text-gray-400 text-sm mt-2">Click "Add New Table" to create your first table</p>
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
                        <p className="text-sm text-gray-400">{table.tableType}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        table.status === 'AVAILABLE' ? 'bg-green-600/20 text-green-400' :
                        table.status === 'OCCUPIED' ? 'bg-blue-600/20 text-blue-400' :
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
            <h3 className="text-xl font-bold mb-6">{editingTable ? 'Edit Table' : 'Create New Table'}</h3>
            <form onSubmit={editingTable ? handleUpdateTable : handleCreateTable} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Table Name</label>
                <input
                  type="text"
                  value={tableForm.tableName}
                  onChange={(e) => setTableForm({ ...tableForm, tableName: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                  placeholder="Table 1"
                  disabled={!selectedClubId}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Game Type</label>
                <select
                  value={tableForm.gameType}
                  onChange={(e) => setTableForm({ ...tableForm, gameType: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                  disabled={!selectedClubId}
                >
                  <option value="Texas Hold'em">Texas Hold'em</option>
                  <option value="Omaha">Omaha</option>
                  <option value="Seven Card Stud">Seven Card Stud</option>
                  <option value="Razz">Razz</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              {tableForm.gameType === 'Custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Custom Game Type</label>
                  <input
                    type="text"
                    value={tableForm.customGameType}
                    onChange={(e) => setTableForm({ ...tableForm, customGameType: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                    placeholder="Enter custom game type"
                    disabled={!selectedClubId}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Table Number *</label>
                <input
                  type="number"
                  value={tableForm.tableNumber}
                  onChange={(e) => setTableForm({ ...tableForm, tableNumber: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                  required
                  disabled={!selectedClubId}
                  min="1"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Max Players</label>
                <input
                  type="number"
                  value={tableForm.maxSeats}
                  onChange={(e) => setTableForm({ ...tableForm, maxSeats: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                  disabled={!selectedClubId}
                  min="2"
                  max="10"
                  placeholder="8"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Blind Levels / Stakes</label>
                <input
                  type="text"
                  value={tableForm.stakes}
                  onChange={(e) => setTableForm({ ...tableForm, stakes: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                  placeholder="₹25/₹50"
                  disabled={!selectedClubId}
                />
              </div>

              {/* Session Parameters */}
              <div className="border-t border-slate-600 pt-4 mt-4">
                <h4 className="text-white text-sm font-semibold mb-3">Session Parameters</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-white text-xs mb-1">Min Play Time (minutes)</label>
                    <div className="space-y-2">
                      <select
                        value={minPlayTimePreset}
                        onChange={(e) => {
                          const value = e.target.value;
                          setMinPlayTimePreset(value);
                          if (value !== "custom") {
                            setTableForm({ ...tableForm, minPlayTime: value });
                          } else if (!tableForm.minPlayTime || parseInt(tableForm.minPlayTime) < 30) {
                            setTableForm({ ...tableForm, minPlayTime: "30" });
                          }
                        }}
                        className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                        disabled={!selectedClubId}
                      >
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">60 minutes</option>
                        <option value="90">90 minutes</option>
                        <option value="120">120 minutes</option>
                        <option value="150">150 minutes</option>
                        <option value="180">180 minutes</option>
                        <option value="custom">Custom...</option>
                      </select>
                      {minPlayTimePreset === "custom" && (
                        <input
                          type="number"
                          min={30}
                          value={tableForm.minPlayTime}
                          onChange={(e) => setTableForm({ ...tableForm, minPlayTime: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm"
                          placeholder="Enter minutes (min 30)"
                          disabled={!selectedClubId}
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-xs mb-1">Call Time (minutes)</label>
                    <input
                      type="number"
                      value={tableForm.callTime}
                      onChange={(e) => setTableForm({ ...tableForm, callTime: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm"
                      placeholder="5"
                      disabled={!selectedClubId}
                    />
                  </div>

                  <div>
                    <label className="block text-white text-xs mb-1">Cash-out Window (minutes)</label>
                    <input
                      type="number"
                      value={tableForm.cashOutWindow}
                      onChange={(e) => setTableForm({ ...tableForm, cashOutWindow: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm"
                      placeholder="10"
                      disabled={!selectedClubId}
                    />
                  </div>

                  <div>
                    <label className="block text-white text-xs mb-1">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={tableForm.sessionTimeout}
                      onChange={(e) => setTableForm({ ...tableForm, sessionTimeout: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm"
                      placeholder="120"
                      disabled={!selectedClubId}
                    />
                  </div>
                </div>
              </div>

              {/* Buy-in Range for backend API */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-600 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Min Buy-In (₹)</label>
                  <input
                    type="number"
                    value={tableForm.minBuyIn}
                    onChange={(e) => setTableForm({ ...tableForm, minBuyIn: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                    disabled={!selectedClubId}
                    min="0"
                    step="0.01"
                    placeholder="1000.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Max Buy-In (₹)</label>
                  <input
                    type="number"
                    value={tableForm.maxBuyIn}
                    onChange={(e) => setTableForm({ ...tableForm, maxBuyIn: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                    disabled={!selectedClubId}
                    min="0"
                    step="0.01"
                    placeholder="10000.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Table Type (Backend)</label>
                <select
                  value={tableForm.tableType}
                  onChange={(e) => setTableForm({ ...tableForm, tableType: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                  disabled={!selectedClubId}
                >
                  <option value="CASH">Cash Game</option>
                  <option value="TOURNAMENT">Tournament</option>
                  <option value="HIGH_STAKES">High Stakes</option>
                  <option value="PRIVATE">Private</option>
                </select>
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
                      setTableForm({
                        tableName: "",
                        tableNumber: "",
                        gameType: "Texas Hold'em",
                        customGameType: "",
                        maxSeats: 8,
                        stakes: "",
                        minPlayTime: "30",
                        callTime: 5,
                        cashOutWindow: 10,
                        sessionTimeout: 120,
                        tableType: "CASH",
                        minBuyIn: "",
                        maxBuyIn: "",
                        notes: "",
                      });
                      setMinPlayTimePreset("30");
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
            <select className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
              <option value="">-- Select Table --</option>
              {tables.map((table) => (
                <option key={table.id} value={table.id}>Table {table.tableNumber}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Assign Dealer</label>
            <select className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
              <option value="">-- Select Dealer --</option>
              {/* TODO: Fetch dealers from backend */}
            </select>
          </div>
        </div>
        <button className="mt-4 bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded-lg font-semibold transition-colors">
          Assign Dealer
        </button>
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
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
                      <button className="flex-1 bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded text-sm font-medium transition-colors">
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
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((seat) => (
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
              <button className="w-full bg-blue-600 hover:bg-blue-500 px-4 py-3 rounded-lg font-semibold transition-colors">
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
                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-2 py-1 rounded text-xs transition-colors"
                      >
                        ↑
                      </button>
                      <button
                        disabled={index === waitlist.length - 1}
                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-2 py-1 rounded text-xs transition-colors"
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
        <h2 className="text-2xl font-bold mb-4">Table Buy-Out</h2>
        <p className="text-gray-300 text-sm mb-6">
          Manage player buy-out requests and process manual buy-outs.
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
                    {/* TODO: Fetch seated players from backend */}
                  </select>
                </div>
                <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
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
                    <li>Select a player who is currently seated at a table</li>
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
                    <div className="text-green-200">0 player(s) at tables</div>
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


