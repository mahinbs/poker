import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CashierSidebar from "../../components/sidebars/CashierSidebar";
import { clubsAPI, playersAPI, tablesAPI, tournamentsAPI } from "../../lib/api";
import toast from "react-hot-toast";
import PayrollManagementCashier from "../../components/PayrollManagementCashier";
import BonusManagement from "../../components/BonusManagement";
import ClubBuyInCashOut from "./ClubBuyInCashOut";
import PushNotifications from "./PushNotifications";
import ChatManagement from "../../components/ChatManagement";
import FinancialOverrides from "../../components/FinancialOverrides";
import TableView from "../../components/hologram/TableView";
import BuyInRequestManagement from "../../components/BuyInRequestManagement";
import NotificationsInbox from "../../components/NotificationsInbox";
import LeaveManagement from "../../components/LeaveManagement";
import MyShiftsDashboard from "../../components/MyShiftsDashboard";

// View-only Tables component for Cashier
function TableManagementViewOnly({ selectedClubId }) {
  const [selectedTable, setSelectedTable] = useState(null);
  const [showTableView, setShowTableView] = useState(false);
  const [activeTab, setActiveTab] = useState('tables'); // 'tables' or 'buyin-requests'
  
  const { data: tablesData, isLoading: tablesLoading } = useQuery({
    queryKey: ['tables', selectedClubId],
    queryFn: () => tablesAPI.getTables(selectedClubId),
    enabled: !!selectedClubId,
  });

  const tables = tablesData || [];
  const activeTables = tables.filter(t => t.status === 'AVAILABLE' || t.status === 'OCCUPIED');

          return (
    <div className="text-white space-y-6">
      <h1 className="text-3xl font-bold">Tables & Waitlist</h1>
      <p className="text-gray-400">View-only mode: You can only view live tables</p>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
            <button
          onClick={() => setActiveTab('tables')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'tables'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Live Tables
            </button>
        <button
          onClick={() => setActiveTab('buyin-requests')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'buyin-requests'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Buy-In Requests
        </button>
              </div>

      {activeTab === 'buyin-requests' ? (
        <BuyInRequestManagement clubId={selectedClubId} />
      ) : (
        <>

      {!selectedClubId && (
        <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 text-yellow-100">
          <p className="font-medium">Please select a club to view tables.</p>
                    </div>
      )}

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex justify-between items-center mb-6">
                      <div>
            <h2 className="text-2xl font-bold">Live Tables - View Only</h2>
            <p className="text-gray-400 text-sm mt-1">View live tables and their status.</p>
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
                    </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTables.map((table) => (
              <div
                key={table.id}
                className="bg-slate-700 rounded-xl p-5 border border-slate-600 hover:border-blue-500 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                      <div>
                    <h3 className="text-lg font-bold text-white">Table {table.tableNumber || table.number}</h3>
                    <p className="text-sm text-gray-400">{table.tableType || 'Cash Game'}</p>
                      </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    table.status === 'OCCUPIED' ? 'bg-green-600/20 text-green-400' : 'bg-blue-600/20 text-blue-400'
                  }`}>
                    {table.status}
                  </span>
                  </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Stakes:</span>
                    <span className="text-white font-medium">₹{table.minBuyIn || 0}/₹{table.maxBuyIn || 0}</span>
                    </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Occupied Seats:</span>
                    <span className="text-white font-medium">{table.currentSeats || 0} / {table.maxSeats || 8}</span>
                    </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Available Seats:</span>
                    <span className="text-green-400 font-medium">{table.maxSeats - (table.currentSeats || 0)}</span>
                    </div>
                  </div>

                <button
                                onClick={() => {
                    setSelectedTable(table);
                    setShowTableView(true);
                                }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                              >
                  <span>🎯</span>
                  <span>View Table Hologram</span>
                </button>
                              </div>
                            ))}
                          </div>
                        )}
                  </div>

      {/* Table Hologram Modal */}
      {showTableView && selectedTable && (
        <div className="fixed inset-0 z-50 bg-black/90 overflow-y-auto">
          <TableView
            tableId={selectedTable.id}
            onClose={() => {
              setShowTableView(false);
              setSelectedTable(null);
            }}
            isManagerMode={true}
            isViewOnly={true}
            tables={tables}
          />
                          </div>
                        )}
        </>
                        )}
                      </div>
  );
}

// View-only Tournaments component for Cashier
function TournamentManagementViewOnly({ selectedClubId }) {
  const [selectedTournament, setSelectedTournament] = useState(null);
  
  const { data: tournamentsData, isLoading: tournamentsLoading } = useQuery({
    queryKey: ['tournaments', selectedClubId],
    queryFn: () => tournamentsAPI.getTournaments(selectedClubId),
    enabled: !!selectedClubId,
  });

  // Handle both array and object responses
  const tournaments = Array.isArray(tournamentsData) 
    ? tournamentsData 
    : (tournamentsData?.tournaments || tournamentsData?.data || []);
  
  // Ensure tournaments is always an array
  const tournamentsArray = Array.isArray(tournaments) ? tournaments : [];

  return (
    <div className="text-white space-y-6">
      <h1 className="text-3xl font-bold">Tournaments</h1>
      <p className="text-gray-400">View-only mode: You can only view tournament information</p>

      {!selectedClubId && (
        <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 text-yellow-100">
          <p className="font-medium">Please select a club to view tournaments.</p>
                    </div>
      )}

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-2xl font-bold mb-6">Tournament List - View Only</h2>

        {tournamentsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading tournaments...</p>
                      </div>
        ) : tournamentsArray.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-xl text-gray-300">No tournaments found</p>
                              </div>
        ) : (
          <div className="space-y-4">
            {tournamentsArray.map((tournament) => (
              <div key={tournament.id} className="bg-slate-700 rounded-xl p-5 border border-slate-600">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{tournament.name || 'Tournament'}</h3>
                    <p className="text-sm text-gray-400">Status: {tournament.status || 'Unknown'}</p>
                    {tournament.buyIn && (
                      <p className="text-sm text-gray-400">Buy-In: ₹{tournament.buyIn}</p>
                    )}
                    {tournament.startTime && (
                      <p className="text-sm text-gray-400">Start: {new Date(tournament.startTime).toLocaleString()}</p>
                    )}
                    {tournament.prizePool && (
                      <p className="text-sm text-gray-400">Prize Pool: ₹{tournament.prizePool}</p>
                        )}
                      </div>
                      <button 
                    onClick={() => setSelectedTournament(tournament)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                  >
                    <span>👁️</span>
                    <span>View Details</span>
                      </button>
                    </div>
                              </div>
                            ))}
                          </div>
                        )}
      </div>

      {/* Tournament Details Modal */}
      {selectedTournament && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-8 max-w-2xl w-full border border-slate-700 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">{selectedTournament.name || 'Tournament'}</h2>
                            <button 
                onClick={() => setSelectedTournament(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                            </button>
                          </div>
            <div className="space-y-4">
                          <div>
                <p className="text-gray-400 text-sm">Status</p>
                <p className="text-white font-semibold">{selectedTournament.status || 'Unknown'}</p>
                          </div>
              {selectedTournament.buyIn && (
                          <div>
                  <p className="text-gray-400 text-sm">Buy-In</p>
                  <p className="text-white font-semibold">₹{selectedTournament.buyIn}</p>
                        </div>
                      )}
              {selectedTournament.prizePool && (
                      <div>
                  <p className="text-gray-400 text-sm">Prize Pool</p>
                  <p className="text-white font-semibold">₹{selectedTournament.prizePool}</p>
                      </div>
              )}
              {selectedTournament.startTime && (
                      <div>
                  <p className="text-gray-400 text-sm">Start Time</p>
                  <p className="text-white font-semibold">{new Date(selectedTournament.startTime).toLocaleString()}</p>
                          </div>
                        )}
              {selectedTournament.description && (
                              <div>
                  <p className="text-gray-400 text-sm">Description</p>
                  <p className="text-white">{selectedTournament.description}</p>
                                </div>
                                  )}
                                </div>
                                  </div>
                                </div>
                              )}
                                </div>
  );
}

// View-only Rummy Tournaments component for Cashier
function RummyTournamentManagementViewOnly({ selectedClubId }) {
  const [selectedTournament, setSelectedTournament] = useState(null);
  
  const { data: tournamentsData, isLoading: tournamentsLoading } = useQuery({
    queryKey: ['rummy-tournaments', selectedClubId],
    queryFn: () => tournamentsAPI.getTournaments(selectedClubId),
    enabled: !!selectedClubId,
    select: (data) => {
      // Filter for Rummy tournaments only
      return Array.isArray(data) ? data.filter(t => t.tableType === 'RUMMY') : [];
    }
  });

  const tournamentsArray = tournamentsData || [];

  return (
    <div className="text-white space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rummy Tournaments</h1>
          <p className="text-gray-400">View-only mode: You can only view rummy tournament details</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-2xl font-bold mb-6">All Rummy Tournaments</h2>

        {tournamentsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p>Loading rummy tournaments...</p>
          </div>
        ) : tournamentsArray.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🃏</div>
            <p className="text-xl text-gray-300">No rummy tournaments found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tournamentsArray.map((tournament) => (
              <div key={tournament.id} className="bg-slate-700 rounded-xl p-5 border border-slate-600">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{tournament.name || 'Rummy Tournament'}</h3>
                    <p className="text-sm text-gray-400">Status: {tournament.status || 'Unknown'}</p>
                    <p className="text-sm text-emerald-400">Variant: {tournament.rummyVariant || 'Points Rummy'}</p>
                    {tournament.buyIn && (
                      <p className="text-sm text-gray-400">Buy-In: ₹{tournament.buyIn}</p>
                    )}
                    {tournament.startTime && (
                      <p className="text-sm text-gray-400">Start: {new Date(tournament.startTime).toLocaleString()}</p>
                    )}
                    {tournament.prizePool && (
                      <p className="text-sm text-gray-400">Prize Pool: ₹{tournament.prizePool}</p>
                    )}
                  </div>
                  <button 
                    onClick={() => setSelectedTournament(tournament)}
                    className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                  >
                    <span>👁️</span>
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tournament Details Modal */}
      {selectedTournament && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-8 max-w-2xl w-full border border-slate-700 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">{selectedTournament.name || 'Rummy Tournament'}</h2>
              <button 
                onClick={() => setSelectedTournament(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <p className="text-white font-semibold">{selectedTournament.status || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Rummy Variant</p>
                <p className="text-emerald-400 font-semibold">{selectedTournament.rummyVariant || 'Points Rummy'}</p>
              </div>
              {selectedTournament.buyIn && (
                <div>
                  <p className="text-gray-400 text-sm">Buy-In</p>
                  <p className="text-white font-semibold">₹{selectedTournament.buyIn}</p>
                </div>
              )}
              {selectedTournament.prizePool && (
                <div>
                  <p className="text-gray-400 text-sm">Prize Pool</p>
                  <p className="text-white font-semibold">₹{selectedTournament.prizePool}</p>
                </div>
              )}
              {selectedTournament.startTime && (
                <div>
                  <p className="text-gray-400 text-sm">Start Time</p>
                  <p className="text-white font-semibold">{new Date(selectedTournament.startTime).toLocaleString()}</p>
                </div>
              )}
              {selectedTournament.description && (
                <div>
                  <p className="text-gray-400 text-sm">Description</p>
                  <p className="text-white">{selectedTournament.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CashierDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [clubId, setClubId] = useState(null);
  const [clubInfo, setClubInfo] = useState(null);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Get clubId from localStorage (cashier has only 1 club)
  useEffect(() => {
    const storedClubId = localStorage.getItem('clubId');
    if (storedClubId) {
      setClubId(storedClubId);
      } else {
      navigate('/login');
    }
  }, [navigate]);

  // Load club info
  const { data: club, isLoading: clubLoading } = useQuery({
    queryKey: ['club', clubId],
    queryFn: () => clubsAPI.getClub(clubId),
    enabled: !!clubId,
  });

  useEffect(() => {
    if (club) {
      setClubInfo(club);
    }
  }, [club]);

  // Check authentication and password reset requirement
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const cashierUser = JSON.parse(localStorage.getItem('cashieruser') || '{}');
    
    // Check if user is logged in
    if (!user.id && !cashierUser.userId) {
      navigate('/login');
                            return;
                          }

    // Check if user needs to reset password
    if (user.mustResetPassword || cashierUser.mustResetPassword) {
      setShowPasswordResetModal(true);
    }
  }, [navigate]);

  // Load revenue data for club
  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['clubRevenue', clubId],
    queryFn: () => clubsAPI.getClubRevenue(clubId),
    enabled: !!clubId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Handle sign out
  const handleSignOut = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  // Format currency
  const formatCurrency = (value) => `₹${(value || 0).toLocaleString("en-IN")}`;

  // Password reset mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3333/api'}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reset password');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success('Password reset successfully!');
      
      // Update localStorage to clear mustResetPassword flag
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.mustResetPassword = false;
      localStorage.setItem('user', JSON.stringify(user));
      
      const cashierUser = JSON.parse(localStorage.getItem('cashieruser') || '{}');
      cashierUser.mustResetPassword = false;
      localStorage.setItem('cashieruser', JSON.stringify(cashierUser));
      
      // Close modal and reset form
      setShowPasswordResetModal(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reset password');
    },
  });

  const handlePasswordReset = (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const cashierUser = JSON.parse(localStorage.getItem('cashieruser') || '{}');
    const email = user.email || cashierUser.email;
    
    if (!email) {
      toast.error('User email not found. Please login again.');
      return;
    }
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('All fields are required');
        return;
      }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
        return;
      }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    resetPasswordMutation.mutate({
      email: email,
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  // PASSWORD RESET MODAL
  const passwordResetModal = showPasswordResetModal && (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200]">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 max-w-md w-full border border-emerald-600 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="text-yellow-400 text-5xl mb-3">🔒</div>
          <h2 className="text-2xl font-bold text-white">Password Reset Required</h2>
          <p className="text-gray-400 mt-2">Please set a new password to continue</p>
                </div>

        <form onSubmit={handlePasswordReset} className="space-y-4">
                      <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Current Password
                        </label>
                        <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Enter temporary password"
              required
            />
                                  </div>

                      <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              New Password
                        </label>
                        <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Enter new password"
              required
                        />
                      </div>

                      <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Confirm New Password
                      </label>
                        <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Confirm new password"
              required
                        />
                      </div>

                              <button
            type="submit"
            disabled={resetPasswordMutation.isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {resetPasswordMutation.isLoading ? 'Resetting...' : 'Reset Password'}
                      </button>
        </form>
                    </div>
                  </div>
  );

  // Render loading state
  if (clubLoading || !clubId) {
    return (
      <>
        {passwordResetModal}
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-xl">Loading club data...</p>
                      </div>
                      </div>
      </>
    );
  }

  // Cashier menu items - matches Super Admin except restricted items
  const baseMenuItems = [
    "Dashboard",
    "Notifications",
    "Payroll Management",
    "Bonus Management",
    "Tables & Waitlist", // View-only live tables
    "Club Buy-In",
    "Push Notifications",
    "Tournaments", // View-only
    "Chat",
    "Financial Overrides",
    "Leave Management",
  ];

  // Add Rummy if enabled for this club
  const menuItems = club?.rummyEnabled 
    ? [...baseMenuItems, "Rummy"]
    : baseMenuItems;

                            return (
    <>
      {/* Password Reset Modal */}
      {passwordResetModal}

      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
        <CashierSidebar
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          menuItems={menuItems}
          onSignOut={handleSignOut}
        />

        <main className="flex-1 p-8 overflow-y-auto">
          {/* Dashboard */}
          {activeItem === "Dashboard" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">
                  Dashboard - {clubInfo?.name || club?.name || 'Loading...'}
                </h1>
                      </div>

              {/* My Shifts Widget */}
              {clubId && <MyShiftsDashboard selectedClubId={clubId} />}

              {/* Revenue Cards */}
              {revenueLoading ? (
                <div className="text-white text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                  <p>Loading revenue data...</p>
                    </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Previous Day Revenue */}
                  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-gray-400 text-sm mb-2">Previous Day Revenue</h3>
                    <p className="text-3xl font-bold text-white">
                      {formatCurrency(revenueData?.previousDay?.revenue || 0)}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">{revenueData?.previousDay?.date || '-'}</p>
                  </div>

                  {/* Today's Revenue */}
                  <div className="bg-slate-800 rounded-xl p-6 border border-emerald-600">
                    <h3 className="text-gray-400 text-sm mb-2">Today's Revenue</h3>
                    <p className="text-3xl font-bold text-emerald-400">
                      {formatCurrency(revenueData?.currentDay?.revenue || 0)}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">{revenueData?.currentDay?.date || '-'}</p>
                </div>

                  {/* Today's Rake */}
                  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-gray-400 text-sm mb-2">Today's Rake</h3>
                    <p className="text-3xl font-bold text-white">
                      {formatCurrency(revenueData?.currentDay?.rake || 0)}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">10% of revenue</p>
                        </div>

                  {/* Previous Day Rake */}
                  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-gray-400 text-sm mb-2">Previous Day Rake</h3>
                    <p className="text-3xl font-bold text-white">
                      {formatCurrency(revenueData?.previousDay?.rake || 0)}
                    </p>
                      </div>

                  {/* Previous Day Tips */}
                  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-gray-400 text-sm mb-2">Previous Day Tips</h3>
                    <p className="text-3xl font-bold text-white">
                      {formatCurrency(revenueData?.previousDay?.tips || 0)}
                    </p>
                </div>

                  {/* Today's Tips */}
                  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-gray-400 text-sm mb-2">Today's Tips</h3>
                    <p className="text-3xl font-bold text-white">
                      {formatCurrency(revenueData?.currentDay?.tips || 0)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payroll Management */}
          {activeItem === "Payroll Management" && (
            <PayrollManagementCashier selectedClubId={clubId} />
          )}

          {/* Bonus Management */}
          {activeItem === "Bonus Management" && (
            <BonusManagement selectedClubId={clubId} />
          )}

          {/* Tables & Waitlist - View Only */}
          {activeItem === "Tables & Waitlist" && (
            <TableManagementViewOnly selectedClubId={clubId} />
          )}

          {/* Club Buy-In */}
          {activeItem === "Club Buy-In" && (
            <ClubBuyInCashOut selectedClubId={clubId} onBack={() => setActiveItem("Dashboard")} />
          )}

          {/* Push Notifications */}
          {activeItem === "Push Notifications" && (
            <PushNotifications selectedClubId={clubId} />
          )}

          {/* Tournaments - View Only */}
          {activeItem === "Tournaments" && (
            <TournamentManagementViewOnly selectedClubId={clubId} />
          )}

          {/* Chat Management */}
          {activeItem === "Chat" && clubId && (
            <ChatManagement clubId={clubId} />
          )}

          {/* Financial Overrides */}
          {activeItem === "Financial Overrides" && (
            <FinancialOverrides selectedClubId={clubId} />
          )}

          {/* Leave Management */}
          {activeItem === "Leave Management" && clubId && (
            <LeaveManagement clubId={clubId} userRole="CASHIER" />
          )}

          {/* Rummy Tournaments - View Only */}
          {activeItem === "Rummy" && (
            <RummyTournamentManagementViewOnly selectedClubId={clubId} />
          )}

          {/* Notifications */}
          {activeItem === "Notifications" && clubId && (
            <NotificationsInbox selectedClubId={clubId} recipientType="staff" />
          )}

          {/* Fallback for unknown menu items */}
          {!["Dashboard", "Payroll Management", "Bonus Management", "Tables & Waitlist", "Club Buy-In", "Push Notifications", "Tournaments", "Chat", "Financial Overrides", "Rummy", "Notifications"].includes(activeItem) && (
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-6">{activeItem}</h1>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
