import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import ChatSection from "../../components/ChatSection";
import StaffSidebar from "../../components/sidebars/StaffSidebar";
import toast from "react-hot-toast";
import NotificationsInbox from "../../components/NotificationsInbox";

export default function StaffDashboard() {
  const [activeItem, setActiveItem] = useState("Chat");
  const navigate = useNavigate();
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Check if user needs to reset password
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const staffUser = JSON.parse(localStorage.getItem('staffuser') || '{}');

    if (user.mustResetPassword || staffUser.mustResetPassword) {
      setShowPasswordResetModal(true);
    }
  }, []);

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
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.mustResetPassword = false;
      localStorage.setItem('user', JSON.stringify(user));
      const staffUser = JSON.parse(localStorage.getItem('staffuser') || '{}');
      staffUser.mustResetPassword = false;
      localStorage.setItem('staffuser', JSON.stringify(staffUser));
      setShowPasswordResetModal(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reset password');
    },
  });

  const handlePasswordReset = (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const staffUser = JSON.parse(localStorage.getItem('staffuser') || '{}');
    const email = user.email || staffUser.email;
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
            <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
            <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Enter temporary password" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
            <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Enter new password" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
            <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Confirm new password" required />
          </div>
          <button type="submit" disabled={resetPasswordMutation.isLoading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50">
            {resetPasswordMutation.isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );

  const menuItems = [
    "Notifications",
    "Chat",
    "Affiliate Dashboard",
  ];

  // Default player chats (staff can access staff chat only based on permissions)
  // Staff role doesn"t have player chat access, so passing null

  // Default staff chats
  const [staffChats, setStaffChats] = useState([
    {
      id: "SC001",
      staffId: "ST001",
      staffName: "Sarah Johnson",
      staffRole: "Dealer",
      status: "open",
      lastMessage: "Need assistance with player dispute",
      lastMessageTime: new Date(Date.now() - 300000).toISOString(),
      messages: [
        {
          id: "M3",
          sender: "staff",
          senderName: "Sarah Johnson",
          text: "Need assistance with player dispute",
          timestamp: new Date(Date.now() - 300000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 300000).toISOString(),
    },
  ]);

  const handleSignOut = () => {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  // Affiliate Dashboard state
  const [copied, setCopied] = useState(false);
  const referralCode = "STAFF2025";
  const referrals = [
    { id: 1, name: "Rahul Sharma", joinedAt: "2024-12-10", status: "Active" },
    { id: 2, name: "Anita Desai", joinedAt: "2024-12-12", status: "Playing" },
    { id: 3, name: "Vikram Singh", joinedAt: "2024-12-15", status: "Inactive" },
    { id: 4, name: "Priya Patel", joinedAt: "2024-12-18", status: "Active" },
    { id: 5, name: "Arjun Kumar", joinedAt: "2024-12-18", status: "Pending Deposit" },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans overflow-x-hidden">
      <div className="flex">
        {/* Sidebar */}
        <StaffSidebar
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          menuItems={menuItems}
          onSignOut={handleSignOut}
        />

        {/* Main Section */}
        <main className="flex-1 lg:ml-0 min-w-0">
          <div className="mx-auto max-w-[1600px] px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-10 space-y-4 sm:space-y-6 md:space-y-8">
            <header className="bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-400 p-3 sm:p-4 md:p-6 rounded-lg md:rounded-xl shadow-md flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 justify-between items-start sm:items-center mt-16 lg:mt-0">
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">Staff - {activeItem}</h1>
                <p className="text-gray-200 mt-1 text-xs sm:text-sm">Staff communication and support</p>
              </div>
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                <button onClick={() => navigate("/")} className="bg-red-600 hover:bg-red-500 text-white font-semibold px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg shadow flex-1 sm:flex-none">
                  Sign Out
                </button>
              </div>
            </header>

            {activeItem === "Notifications" && (
              <NotificationsInbox
                selectedClubId={selectedClubId}
                recipientType="staff"
              />
            )}

            {activeItem === "Chat" && (
              <ChatSection
                userRole="staff"
                playerChats={null}
                setPlayerChats={null}
                staffChats={staffChats}
                setStaffChats={setStaffChats}
              />
            )}

            {activeItem === "Affiliate Dashboard" && (
              <div className="space-y-4 sm:space-y-6">
                {/* Referral Code Section */}
                <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-lg md:rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <h2 className="text-base sm:text-lg md:text-xl text-slate-400 mb-3 sm:mb-4 z-10 text-center">Your Unique Referral Code</h2>
                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 z-10 w-full max-w-full sm:max-w-md">
                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight sm:tracking-wider text-white drop-shadow-lg font-mono break-all text-center sm:text-left px-2">
                      {referralCode}
                    </div>
                    <button
                      onClick={handleCopy}
                      className="p-2 sm:p-3 rounded-full bg-slate-700 hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 flex-shrink-0"
                      title="Copy Code"
                    >
                      {copied ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-slate-500 z-10 text-center px-2 sm:px-4">Share this code with new players to earn rewards.</p>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  <div className="bg-slate-800 rounded-lg md:rounded-2xl p-3 sm:p-4 md:p-6 border border-slate-700 shadow-xl">
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-300 mb-3 sm:mb-4">Performance Overview</h3>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                      <div className="bg-slate-700/50 p-2 sm:p-3 md:p-4 rounded-lg md:rounded-xl">
                        <div className="text-xs sm:text-sm text-slate-400">Total Referrals</div>
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-1">{referrals.length}</div>
                      </div>
                      <div className="bg-slate-700/50 p-2 sm:p-3 md:p-4 rounded-lg md:rounded-xl">
                        <div className="text-xs sm:text-sm text-slate-400">Active Players</div>
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-400 mt-1">
                          {referrals.filter(r => r.status === 'Active' || r.status === 'Playing').length}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Stats Card */}
                  <div className="bg-slate-800 rounded-lg md:rounded-2xl p-3 sm:p-4 md:p-6 border border-slate-700 shadow-xl">
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-300 mb-3 sm:mb-4">Quick Stats</h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="bg-slate-700/50 p-2 sm:p-3 rounded-lg md:rounded-xl">
                        <div className="text-xs text-slate-400">Pending Deposits</div>
                        <div className="text-lg sm:text-xl font-bold text-yellow-400 mt-1">
                          {referrals.filter(r => r.status === 'Pending Deposit').length}
                        </div>
                      </div>
                      <div className="bg-slate-700/50 p-2 sm:p-3 rounded-lg md:rounded-xl">
                        <div className="text-xs text-slate-400">Inactive</div>
                        <div className="text-lg sm:text-xl font-bold text-slate-400 mt-1">
                          {referrals.filter(r => r.status === 'Inactive').length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity / List */}
                <div className="bg-slate-800 rounded-lg md:rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
                  <div className="p-3 sm:p-4 md:p-6 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white">Referred Players</h3>
                    <span className="text-xs font-medium px-2 py-1 bg-blue-900/50 text-blue-300 rounded-md border border-blue-800 whitespace-nowrap">
                      Latest {referrals.length}
                    </span>
                  </div>

                  <div className="overflow-x-auto -mx-3 sm:mx-0">
                    <div className="inline-block min-w-full align-middle px-3 sm:px-0">
                      <table className="w-full text-left min-w-[400px] sm:min-w-[500px]">
                        <thead>
                          <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-medium">Player Name</th>
                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-medium">Joined Date</th>
                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                          {referrals.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                              <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-slate-200 font-medium">
                                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 min-w-0">
                                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {user.name.charAt(0)}
                                  </div>
                                  <span className="truncate text-xs sm:text-sm">{user.name}</span>
                                </div>
                              </td>
                              <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-slate-400 text-xs sm:text-sm whitespace-nowrap">
                                {new Date(user.joinedAt).toLocaleDateString('en-IN', {
                                  timeZone: 'Asia/Kolkata',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </td>
                              <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
                                <span className={`inline-flex items-center px-1.5 sm:px-2 md:px-2.5 py-0.5 rounded-full text-xs font-medium border
                                ${user.status === 'Active' || user.status === 'Playing'
                                    ? 'bg-green-900/30 text-green-400 border-green-800'
                                    : user.status === 'Pending Deposit'
                                      ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800'
                                      : 'bg-slate-800 text-slate-400 border-slate-700'
                                  }
                              `}>
                                  {user.status === 'Active' || user.status === 'Playing' ? (
                                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-current mr-1 sm:mr-1.5 animate-pulse" />
                                  ) : null}
                                  <span className="whitespace-nowrap text-xs">{user.status}</span>
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {referrals.length === 0 && (
                    <div className="p-6 sm:p-8 md:p-12 text-center text-slate-500 text-sm sm:text-base">
                      No referrals yet. Share your code to get started!
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
      {passwordResetModal}
    </div>
  );
}
