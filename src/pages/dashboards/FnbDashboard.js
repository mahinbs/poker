import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import MenuInventoryTab from "../../components/fnb/MenuInventoryTab";
import OrderManagementTab from "../../components/fnb/OrderManagementTab";
import SupplierManagementTab from "../../components/fnb/SupplierManagementTab";
import KitchenOperationsTab from "../../components/fnb/KitchenOperationsTab";
import ChatManagement from "../../components/ChatManagement";
import FnbSidebar from "../../components/sidebars/FnbSidebar";
import toast from "react-hot-toast";
import NotificationsInbox from "../../components/NotificationsInbox";
import LeaveManagement from "../../components/LeaveManagement";
import MyShiftsDashboard from "../../components/MyShiftsDashboard";

export default function FnbDashboard() {
  const [activeItem, setActiveItem] = useState("Menu & Inventory");
  const navigate = useNavigate();
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  // Get clubId from localStorage
  const [clubId, setClubId] = useState(null);
  
  useEffect(() => {
    const storedClubId = localStorage.getItem('clubId');
    if (storedClubId) {
      setClubId(storedClubId);
    }
  }, []);

  // Check if user needs to reset password
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const fnbUser = JSON.parse(localStorage.getItem('fnb_staffuser') || '{}');
    
    if (user.mustResetPassword || fnbUser.mustResetPassword) {
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
      const fnbUser = JSON.parse(localStorage.getItem('fnb_staffuser') || '{}');
      if (fnbUser.userId) {
        fnbUser.mustResetPassword = false;
        localStorage.setItem('fnb_staffuser', JSON.stringify(fnbUser));
      }
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
    const fnbUser = JSON.parse(localStorage.getItem('fnb_staffuser') || '{}');
    const email = user.email || fnbUser.email || fnbUser.userEmail;
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
    "Menu & Inventory",
    "Notifications",
    "Order Management", 
    "Supplier Management",
    "Kitchen Operations",
    "Leave Management",
    "Chat",
  ];

  const handleSignOut = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('fnb_staffuser');
    localStorage.removeItem('clubId');
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans">
      <div className="flex">
        <FnbSidebar
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          menuItems={menuItems}
          onSignOut={handleSignOut}
        />

        <main className="flex-1 lg:ml-0 min-w-0">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 sm:py-10 space-y-8">
          <header className="bg-gradient-to-r from-orange-600 via-red-500 to-pink-400 p-6 rounded-xl shadow-md flex justify-between items-center mt-16 lg:mt-0">
            <div>
              <h1 className="text-2xl font-bold text-white">FNB Portal - {activeItem}</h1>
              <p className="text-gray-200 mt-1">Manage poker club F&B service, menu, and player orders</p>
            </div>
            <button 
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
            >
              Sign Out
            </button>
          </header>

            {!clubId && (
              <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 text-yellow-100">
                <p className="font-medium">Please select a club to view FNB management.</p>
              </div>
            )}

            {activeItem === "Menu & Inventory" && clubId && (
              <>
                {/* My Shifts Widget - Only show on Menu & Inventory (main page) */}
                <MyShiftsDashboard selectedClubId={clubId} />
                <MenuInventoryTab clubId={clubId} />
              </>
            )}

            {activeItem === "Order Management" && clubId && (
              <OrderManagementTab clubId={clubId} />
            )}

            {activeItem === "Supplier Management" && clubId && (
              <SupplierManagementTab clubId={clubId} />
            )}

            {activeItem === "Kitchen Operations" && clubId && (
              <KitchenOperationsTab clubId={clubId} />
            )}

            {activeItem === "Chat" && clubId && (
              <ChatManagement clubId={clubId} />
          )}

            {/* Notifications */}
            {activeItem === "Notifications" && clubId && (
              <NotificationsInbox selectedClubId={clubId} recipientType="staff" />
            )}

            {/* Leave Management */}
            {activeItem === "Leave Management" && clubId && (
              <LeaveManagement clubId={clubId} userRole="FNB" />
            )}
          </div>
        </main>
      </div>
      {passwordResetModal}
    </div>
  );
}
