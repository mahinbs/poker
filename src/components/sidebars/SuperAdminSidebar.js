import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { superAdminAPI, chatAPI, leaveAPI } from "../../lib/api";
import toast from "react-hot-toast";

const DEFAULT_MENU_ITEMS = [
  "Dashboard",
  "Notifications",
  "Player Management",
  "Staff Management",
  "Payroll Management",
  "Affiliates",
  "Tables & Waitlist",
  "Club Buy-In",
  "Credit Management",
  "VIP Store",
  "Push Notifications",
  "Tournaments",
  "Bonus Management",
  "FNB",
  "Chat",
  // "Financial Transactions", // Commented out - not needed for now
  "Transactions",
  "Reports & Analytics",
  "Audit Logs",
  "System Control",
];

export default function SuperAdminSidebar({
  activeItem,
  setActiveItem,
  menuItems = DEFAULT_MENU_ITEMS,
  onSignOut = null,
  clubs = [],
  selectedClubId = null,
  onClubChange = null
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isClubDropdownOpen, setIsClubDropdownOpen] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Track previous notification count for sound alert
  const prevNotificationCount = useRef(null);
  // Track previous leave count for sound alert
  const prevLeaveCount = useRef(null);

  // Get clubId and fetch unread notification count
  const clubId = selectedClubId || localStorage.getItem('clubId');
  const { data: unreadData } = useQuery({
    queryKey: ["unreadNotificationCount", clubId, "staff"],
    queryFn: () => superAdminAPI.getUnreadNotificationCount(clubId, "staff"),
    enabled: !!clubId,
    refetchInterval: 30000,
  });

  // Fetch unread chat counts
  const { data: unreadChatData } = useQuery({
    queryKey: ["unreadChatCounts", clubId],
    queryFn: () => chatAPI.getUnreadCounts(clubId),
    enabled: !!clubId,
    refetchInterval: 10000, // Refresh every 10 seconds for real-time updates
  });

  const totalUnreadChats = (unreadChatData?.staffChats || 0) + (unreadChatData?.playerChats || 0);

  // Fetch pending leave applications count
  const { data: pendingLeaves = [] } = useQuery({
    queryKey: ['pendingLeaveApplications', clubId],
    queryFn: () => leaveAPI.getPendingLeaveApplications(clubId),
    enabled: !!clubId,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
    refetchIntervalInBackground: true, // Continue refetching even when tab is not focused
    staleTime: 0, // Always consider data stale to ensure fresh data on tab switch
  });

  const pendingLeaveCount = pendingLeaves?.length || 0;

  // Play notification sound when new notification arrives
  useEffect(() => {
    const currentCount = unreadData?.unreadCount || 0;

    // Only play sound if count increased (new notification)
    if (prevNotificationCount.current !== null && currentCount > prevNotificationCount.current) {
      const audio = new Audio('/audio/popup-alert.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Audio play failed:', err));
    }

    // Update previous count
    prevNotificationCount.current = currentCount;
  }, [unreadData?.unreadCount]);

  // Play sound when new leave request arrives
  useEffect(() => {
    const currentLeaveCount = pendingLeaveCount;

    if (prevLeaveCount.current !== null && currentLeaveCount > prevLeaveCount.current) {
      const audio = new Audio('/audio/popup-alert.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Audio play failed:', err));
    }

    prevLeaveCount.current = currentLeaveCount;
  }, [pendingLeaveCount]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isOpen && isMobile) {
      const handleClickOutside = (e) => {
        if (!e.target.closest(".sidebar-container") && !e.target.closest(".sidebar-toggle")) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, isMobile]);

  const selectedClub = clubs.find((c) => c.clubId === selectedClubId) || clubs[0];
  const isRummyEnabled = selectedClub?.rummyEnabled || false;
  const isPokerEnabled = selectedClub?.pokerEnabled !== false;

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const superAdminUser = JSON.parse(localStorage.getItem('superadminuser') || '{}');
  const userEmail = user.email || superAdminUser.email || 'super@admin.com';
  const displayName = user.displayName || superAdminUser.displayName || 'Root Administrator';
  const userRole = user.role || superAdminUser.role || 'SUPER_ADMIN';

  // Filter menu items based on game access, then add Rummy if enabled
  let finalMenuItems = menuItems.filter(item => {
    if (!isPokerEnabled && ["Tables & Waitlist", "Tournaments"].includes(item)) return false;
    return true;
  });
  if (isRummyEnabled) finalMenuItems = [...finalMenuItems, "Rummy"];

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

      const superAdminUser = JSON.parse(localStorage.getItem('superadminuser') || '{}');
      superAdminUser.mustResetPassword = false;
      localStorage.setItem('superadminuser', JSON.stringify(superAdminUser));

      setShowResetPassword(false);
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
    const superAdminUser = JSON.parse(localStorage.getItem('superadminuser') || '{}');
    const email = user.email || superAdminUser.email;

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

  return (
    <>
      {isMobile && (
        <button
          className="sidebar-toggle fixed top-4 left-4 z-50 bg-gradient-to-r from-red-500 to-purple-600 text-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 lg:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle sidebar"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      )}

      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`sidebar-container fixed lg:sticky top-0 left-0 h-screen z-40 w-80 max-w-[90vw] bg-gradient-to-b from-red-500/20 via-purple-600/30 to-indigo-700/30 border-r border-gray-800 shadow-2xl transition-transform duration-300 ease-in-out overflow-y-auto overflow-x-hidden hide-scrollbar ${isMobile
            ? isOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
          }`}
      >
        <div className="p-5 h-full flex flex-col min-w-0">
          <div className="mb-6">
            <div className="pt-11 lg:pt-0 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-purple-300 to-indigo-400 drop-shadow-lg mb-6">
              Super Admin
            </div>
            <div
              onClick={() => setShowResetPassword(true)}
              className="bg-white/10 rounded-xl p-4 mb-6 text-white shadow-inner cursor-pointer hover:bg-white/15 transition-colors"
            >
              <div className="text-lg font-semibold">{displayName}</div>
              <div className="text-sm opacity-80">{userEmail}</div>
            </div>

            {/* Reset Password Modal - Rendered via Portal */}
            {showResetPassword && createPortal(
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]" onClick={() => setShowResetPassword(false)}>
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 max-w-md w-full mx-4 border border-emerald-600 shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="text-center mb-6">
                    <div className="text-yellow-400 text-5xl mb-3">🔒</div>
                    <h2 className="text-2xl font-bold text-white">Reset Password</h2>
                    <p className="text-gray-400 mt-2">Enter your current and new password</p>
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
                        placeholder="Enter current password"
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

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowResetPassword(false);
                          setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                        }}
                        className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-medium py-3 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={resetPasswordMutation.isLoading}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {resetPasswordMutation.isLoading ? 'Resetting...' : 'Reset Password'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>,
              document.body
            )}

            {/* Club Selection Dropdown */}
            {clubs.length > 0 && onClubChange && (
              <div className="mb-6 relative min-w-0">
                <label className="text-white text-sm mb-2 block font-semibold">📍 Select Club</label>
                <div className="relative min-w-0">
                  <button
                    type="button"
                    onClick={() => setIsClubDropdownOpen(!isClubDropdownOpen)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/40 rounded-lg text-white text-left flex items-center justify-between hover:from-emerald-600/30 hover:to-teal-600/30 transition-all overflow-hidden min-w-0 shadow-md"
                  >
                    <span className="truncate min-w-0 flex-1 font-medium">
                      {selectedClub?.clubName || "Select Club"}
                    </span>
                    <svg
                      className={`w-5 h-5 ml-2 transition-transform ${isClubDropdownOpen ? "rotate-180" : ""
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isClubDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsClubDropdownOpen(false)}
                      ></div>
                      <div className="absolute z-20 w-full mt-2 bg-slate-800 border border-emerald-500/40 rounded-lg shadow-2xl max-h-64 overflow-y-auto overflow-x-hidden hide-scrollbar">
                        {clubs.map((club) => (
                          <button
                            key={club.clubId}
                            type="button"
                            onClick={() => {
                              onClubChange(club.clubId);
                              setIsClubDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left text-white hover:bg-emerald-600/30 transition-colors overflow-hidden border-b border-slate-700 last:border-b-0 ${selectedClubId === club.clubId ? "bg-emerald-600/40 font-semibold" : ""
                              }`}
                          >
                            <span className="block truncate">{club.clubName}</span>
                            <span className="block text-xs text-gray-400 truncate mt-0.5">
                              {club.tenantName}
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <p className="text-xs text-emerald-400 mt-2 font-medium">
                  📊 {clubs.length} {clubs.length === 1 ? 'Club' : 'Clubs'} Available
                </p>
                {/* Show Club Code for Selected Club */}
                {selectedClub && selectedClub.code && (
                  <div className="mt-3 bg-emerald-900/30 border border-emerald-500/50 rounded-lg p-3">
                    <div className="text-xs text-emerald-300 font-semibold mb-1">🎮 Club Code</div>
                    <div className="text-emerald-100 font-mono text-lg font-bold tracking-wider text-center">
                      {selectedClub.code}
                    </div>
                    <div className="text-xs text-emerald-400 mt-1 text-center">Players use this to sign up</div>
                  </div>
                )}
              </div>
            )}
          </div>

          <nav className="space-y-3 flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar min-w-0">
            {finalMenuItems.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setActiveItem(item);
                  if (isMobile) setIsOpen(false);
                }}
                className={`w-full text-left rounded-xl px-4 py-3 font-medium transition-all duration-300 shadow-md overflow-hidden ${activeItem === item
                    ? "bg-gradient-to-r from-red-400 to-purple-600 text-white font-bold shadow-lg scale-[1.02]"
                    : "bg-white/5 hover:bg-gradient-to-r hover:from-red-400/20 hover:to-purple-500/20 text-white"
                  }`}
              >
                <span className="flex items-center justify-between">
                  <span className="block truncate">{item}</span>
                  {item === "Notifications" && unreadData?.unreadCount > 0 && (
                    <span className="ml-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse flex-shrink-0">
                      {unreadData.unreadCount > 9 ? "9+" : unreadData.unreadCount}
                    </span>
                  )}
                  {item === "Chat" && totalUnreadChats > 0 && (
                    <span className="ml-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse flex-shrink-0">
                      {totalUnreadChats > 9 ? "9+" : totalUnreadChats}
                    </span>
                  )}
                  {item === "Staff Management" && pendingLeaveCount > 0 && (
                    <span className="ml-2 bg-amber-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse flex-shrink-0">
                      {pendingLeaveCount > 9 ? "9+" : pendingLeaveCount}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </nav>

          {onSignOut && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <button
                onClick={onSignOut}
                className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded-lg font-semibold shadow transition"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

