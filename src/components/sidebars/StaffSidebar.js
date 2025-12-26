import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { clubsAPI, superAdminAPI } from "../../lib/api";
import toast from "react-hot-toast";

export default function StaffSidebar({ 
  activeItem, 
  setActiveItem, 
  menuItems = [],
  onSignOut = null 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Get clubId and fetch unread notification count
  const clubId = localStorage.getItem('clubId');
  const { data: unreadData } = useQuery({
    queryKey: ["unreadNotificationCount", clubId, "staff"],
    queryFn: () => superAdminAPI.getUnreadNotificationCount(clubId, "staff"),
    enabled: !!clubId,
    refetchInterval: 30000,
  });

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
  
  // Fetch club info to get club code
  const { data: club } = useQuery({
    queryKey: ['club', clubId],
    queryFn: () => clubsAPI.getClub(clubId),
    enabled: !!clubId,
  });

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = user.email || 'staff@example.com';
  const displayName = user.displayName || 'Staff Member';

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
      setShowResetPassword(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reset password');
    },
  });

  const handlePasswordReset = (e) => {
    e.preventDefault();
    if (!userEmail) {
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
      email: userEmail,
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  return (
    <>
      {isMobile && (
        <button
          className="sidebar-toggle fixed top-4 left-4 z-50 bg-gradient-to-r from-purple-500 to-blue-600 text-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 lg:hidden"
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
        className={`sidebar-container fixed lg:sticky top-0 left-0 h-screen z-40 w-80 max-w-[90vw] bg-gradient-to-b from-purple-500/20 via-blue-600/30 to-indigo-700/30 border-r border-gray-800 shadow-2xl transition-transform duration-300 ease-in-out overflow-y-auto overflow-x-hidden hide-scrollbar ${
          isMobile
            ? isOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        }`}
      >
        <div className="p-3 sm:p-4 md:p-5 h-full flex flex-col min-w-0">
          <div className="mb-4 sm:mb-6">
            <div className="pt-11 lg:pt-0 text-xl sm:text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-300 to-indigo-400 drop-shadow-lg mb-4 sm:mb-6 break-words">
              Staff Portal
            </div>
            <div 
              onClick={() => setShowResetPassword(true)}
              className="bg-white/10 rounded-lg md:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 text-white shadow-inner cursor-pointer hover:bg-white/15 transition-colors"
            >
              <div className="text-base sm:text-lg font-semibold truncate">{displayName}</div>
              <div className="text-xs sm:text-sm opacity-80 truncate">{userEmail}</div>
            </div>
            
            {/* Reset Password Modal - Rendered via Portal */}
            {showResetPassword && createPortal(
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]" onClick={() => setShowResetPassword(false)}>
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 max-w-md w-full mx-4 border border-emerald-600 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                  <div className="text-center mb-6">
                    <div className="text-yellow-400 text-5xl mb-3">🔒</div>
                    <h2 className="text-2xl font-bold text-white">Reset Password</h2>
                    <p className="text-gray-400 mt-2">Enter your current and new password</p>
                  </div>
                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
                      <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Enter current password" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
                      <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Enter new password" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
                      <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Confirm new password" required />
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => { setShowResetPassword(false); setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-medium py-3 rounded-lg transition-colors">Cancel</button>
                      <button type="submit" disabled={resetPasswordMutation.isLoading} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50">{resetPasswordMutation.isLoading ? 'Resetting...' : 'Reset Password'}</button>
                    </div>
                  </form>
                </div>
              </div>,
              document.body
            )}
            
            {/* Show Club Code */}
            {club && club.code && (
              <div className="mb-4 sm:mb-6">
                <div className="bg-emerald-900/30 border border-emerald-500/50 rounded-lg p-3">
                  <div className="text-xs text-emerald-300 font-semibold mb-1">🎮 Club Code</div>
                  <div className="text-emerald-100 font-mono text-base sm:text-lg font-bold tracking-wider text-center">
                    {club.code}
                  </div>
                  <div className="text-xs text-emerald-400 mt-1 text-center">Players use this to sign up</div>
                </div>
              </div>
            )}
          </div>

          <nav className="space-y-2 sm:space-y-3 flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar min-w-0">
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setActiveItem(item);
                  if (isMobile) setIsOpen(false);
                }}
                className={`w-full text-left rounded-lg md:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all duration-300 shadow-md overflow-hidden ${
                  activeItem === item
                    ? "bg-gradient-to-r from-purple-400 to-blue-600 text-white font-bold shadow-lg scale-[1.02]"
                    : "bg-white/5 hover:bg-gradient-to-r hover:from-purple-400/20 hover:to-blue-500/20 text-white"
                }`}
              >
                <span className="flex items-center justify-between">
                  <span className="truncate block">{item}</span>
                  {item === "Notifications" && unreadData?.unreadCount > 0 && (
                    <span className="ml-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse flex-shrink-0">
                      {unreadData.unreadCount > 9 ? "9+" : unreadData.unreadCount}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </nav>

          {onSignOut && (
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10">
              <button
                onClick={onSignOut}
                className="w-full bg-red-600 hover:bg-red-500 text-white px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg font-semibold shadow transition"
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

