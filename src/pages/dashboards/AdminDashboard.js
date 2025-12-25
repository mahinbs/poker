import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminSidebar from "../../components/sidebars/AdminSidebar";
import { clubsAPI, playersAPI } from "../../lib/api";
import toast from "react-hot-toast";
import UnifiedPlayerManagement from "./UnifiedPlayerManagement";
import TableManagement from "./TableManagement";
import VIPStore from "./VIPStore";
import PushNotifications from "./PushNotifications";
import TournamentManagement from "../../components/TournamentManagement";
import StaffManagement from "../../components/StaffManagement";
import PayrollManagement from "../../components/PayrollManagement";
import BonusManagement from "../../components/BonusManagement";
import AffiliateManagement from "../../components/AffiliateManagement";
import FNBManagement from "../../components/FNBManagement";
import ChatManagement from "../../components/ChatManagement";
import ReportsAnalytics from "../../components/ReportsAnalytics";
import SystemControl from "../../components/SystemControl";

export default function AdminDashboard() {
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

  // Get clubId from localStorage (admin has only 1 club)
  useEffect(() => {
    const storedClubId = localStorage.getItem('clubId');
    if (storedClubId) {
      setClubId(storedClubId);
    } else {
      // If no clubId, redirect to login
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
    const adminUser = JSON.parse(localStorage.getItem('adminuser') || '{}');
    
    // Check if user is logged in
    if (!user.id && !adminUser.userId) {
      navigate('/login');
      return;
    }

    // Check if user needs to reset password
    if (user.mustResetPassword || adminUser.mustResetPassword) {
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

  // Load players for club
  const { data: playersData, isLoading: playersLoading } = useQuery({
    queryKey: ['clubPlayers', clubId],
    queryFn: () => playersAPI.getPlayers(clubId, { limit: 100 }),
    enabled: !!clubId,
  });

  // Load pending approval players
  const { data: pendingPlayers = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['pendingPlayers', clubId],
    queryFn: () => playersAPI.getPendingApprovalPlayers(clubId),
    enabled: !!clubId,
  });

  // Load suspended players
  const { data: suspendedPlayers = [], isLoading: suspendedLoading } = useQuery({
    queryKey: ['suspendedPlayers', clubId],
    queryFn: () => playersAPI.getSuspendedPlayers(clubId),
    enabled: !!clubId,
  });

  // Handle sign out
  const handleSignOut = () => {
    localStorage.clear();
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
      
      const adminUser = JSON.parse(localStorage.getItem('adminuser') || '{}');
      adminUser.mustResetPassword = false;
      localStorage.setItem('adminuser', JSON.stringify(adminUser));
      
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
    const adminUser = JSON.parse(localStorage.getItem('adminuser') || '{}');
    const email = user.email || adminUser.email;
    
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
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 max-w-md w-full border border-emerald-600 shadow-2xl">
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

  // Menu items for Admin (excluding restricted items)
  const menuItems = [
    "Dashboard",
    "Player Management",
    "Staff Management",
    "Payroll Management",
    "Affiliates",
    "Tables & Waitlist",
    "VIP Store",
    "Push Notifications",
    "Tournaments",
    "Bonus Management",
    "FNB",
    "Chat",
    "Reports & Analytics",
    "System Control",
  ];

  return (
    <>
      {/* Password Reset Modal */}
      {passwordResetModal}

      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
        <AdminSidebar
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

              {/* Player & Staff Counts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-xl font-semibold text-white mb-4">Players</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Players</span>
                                  <span className="text-white font-semibold">
                        {playersLoading ? '...' : playersData?.players?.length || 0}
                                  </span>
                                </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pending Approval</span>
                      <span className="text-yellow-400 font-semibold">
                        {pendingLoading ? '...' : pendingPlayers.length}
                                  </span>
                                </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Suspended</span>
                      <span className="text-red-400 font-semibold">
                        {suspendedLoading ? '...' : suspendedPlayers.length}
                                  </span>
                                </div>
                                </div>
                              </div>

                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                        <button
                      onClick={() => setActiveItem("Player Management")}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg transition-colors"
                        >
                      Manage Players
                        </button>
                        <button
                      onClick={() => setActiveItem("Player Approval")}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg transition-colors"
                    >
                      Review Approvals ({pendingLoading ? '...' : pendingPlayers.length})
                        </button>
                        <button
                      onClick={() => setActiveItem("Player Suspension")}
                      className="w-full bg-orange-600 hover:bg-orange-500 text-white py-2 rounded-lg transition-colors"
                        >
                      Suspended Players ({suspendedLoading ? '...' : suspendedPlayers.length})
                        </button>
                      </div>
                    </div>
                  </div>
            </div>
          )}

          {/* Player Management - Unified with Tabs */}
          {activeItem === "Player Management" && (
            <UnifiedPlayerManagement
              selectedClubId={clubId}
              playersData={playersData}
              playersLoading={playersLoading}
              pendingPlayers={pendingPlayers}
              pendingLoading={pendingLoading}
              suspendedPlayers={suspendedPlayers}
              suspendedLoading={suspendedLoading}
              onRefresh={() => {
                queryClient.invalidateQueries(['pendingPlayers', clubId]);
                queryClient.invalidateQueries(['clubPlayers', clubId]);
                queryClient.invalidateQueries(['suspendedPlayers', clubId]);
              }}
            />
          )}

          {/* Tables & Waitlist Management */}
          {activeItem === "Tables & Waitlist" && (
            <TableManagement selectedClubId={clubId} />
          )}

          {/* VIP Store */}
          {activeItem === "VIP Store" && (
            <VIPStore selectedClubId={clubId} />
          )}

          {/* Push Notifications */}
          {activeItem === "Push Notifications" && (
            <PushNotifications selectedClubId={clubId} />
          )}

          {/* Tournaments */}
          {activeItem === "Tournaments" && (
            <TournamentManagement selectedClubId={clubId} />
          )}

          {/* Staff Management */}
          {activeItem === "Staff Management" && (
            <StaffManagement selectedClubId={clubId} />
          )}

          {/* Payroll Management */}
          {activeItem === "Payroll Management" && (
            <PayrollManagement selectedClubId={clubId} />
          )}

          {/* Bonus Management */}
          {activeItem === "Bonus Management" && (
            <BonusManagement selectedClubId={clubId} />
          )}

          {/* Affiliate Management */}
          {activeItem === "Affiliates" && (
            <AffiliateManagement selectedClubId={clubId} />
          )}

          {/* FNB Management */}
          {activeItem === "FNB" && clubId && (
            <FNBManagement clubId={clubId} />
          )}

          {/* Chat Management */}
          {activeItem === "Chat" && clubId && (
            <ChatManagement clubId={clubId} />
          )}

          {/* Reports & Analytics */}
          {activeItem === "Reports & Analytics" && clubId && (
            <ReportsAnalytics clubId={clubId} />
          )}

          {/* System Control */}
          {activeItem === "System Control" && clubId && (
            <SystemControl clubId={clubId} />
          )}

          {/* Fallback for unknown menu items */}
          {!["Dashboard", "Player Management", "Tables & Waitlist", "VIP Store", "Push Notifications", "Tournaments", "Staff Management", "Payroll Management", "Bonus Management", "Affiliates", "FNB", "Chat", "Reports & Analytics", "System Control"].includes(activeItem) && (
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-6">{activeItem}</h1>
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <p className="text-gray-400">This section is under development and will use real data from the backend.</p>
            </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
