import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { clubsAPI, superAdminAPI } from "../../lib/api";
import toast from "react-hot-toast";

export default function DealerSidebar({ 
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
  const staffUser = JSON.parse(localStorage.getItem('staffuser') || '{}');
  const userEmail = user.email || staffUser.email || 'dealer@pokerroom.com';
  const displayName = user.displayName || staffUser.displayName || 'Dealer';

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
      if (staffUser.userId) {
        staffUser.mustResetPassword = false;
        localStorage.setItem('staffuser', JSON.stringify(staffUser));
      }
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

  const passwordResetModal = showResetPassword && createPortal(
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200]">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 max-w-md w-full border border-emerald-600 shadow-2xl">
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
    </div>,
    document.body
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="sidebar-toggle fixed top-4 left-4 z-[100] p-2 rounded-md text-white bg-slate-700 lg:hidden"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            )}
          </svg>
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar-container fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-lg transform ${
          isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex h-full flex-col justify-between">
          <div className="px-6 py-8">
            {/* Logo/Title */}
            <div className="text-center mb-10">
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                Dealer Portal
              </h1>
            </div>

            {/* User Info Card */}
            <div 
              className="bg-slate-700 rounded-xl p-4 mb-8 shadow-inner border border-slate-600 cursor-pointer hover:bg-slate-600 transition-colors"
              onClick={() => setShowResetPassword(true)}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-lg font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white">{displayName}</p>
                  <p className="text-sm text-gray-300">Dealer</p>
                </div>
              </div>
              {clubId && (
                <div className="mt-3 pt-3 border-t border-slate-600">
                  <p className="text-xs text-gray-400">Club Code:</p>
                  <p className="font-mono text-sm text-yellow-400">{club?.code || 'N/A'}</p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setActiveItem(item);
                    if (isMobile) setIsOpen(false);
                  }}
                  className={`flex items-center w-full px-4 py-3 rounded-lg text-left font-medium transition-colors duration-200
                    ${
                      activeItem === item
                        ? "bg-purple-600 text-white shadow-md"
                        : "text-gray-300 hover:bg-slate-700 hover:text-white"
                    }`}
                >
                  <span className="flex items-center justify-between w-full">
                    <span>{item}</span>
                    {item === "Notifications" && unreadData?.unreadCount > 0 && (
                      <span className="ml-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse flex-shrink-0">
                        {unreadData.unreadCount > 9 ? "9+" : unreadData.unreadCount}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Sign Out Button */}
          <div className="px-6 pb-8">
            <button
              onClick={onSignOut}
              className="flex items-center justify-center w-full px-4 py-3 rounded-lg font-medium text-red-400 bg-red-900/20 hover:bg-red-900/40 transition-colors duration-200"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                ></path>
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </aside>
      {passwordResetModal}
    </>
  );
}

