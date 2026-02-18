import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import ChatManagement from "../../components/ChatManagement";
import CustomStaffSidebar from "../../components/sidebars/CustomStaffSidebar";
import { payrollAPI, bonusAPI, staffAPI } from "../../lib/api";
import toast from "react-hot-toast";
import NotificationsInbox from "../../components/NotificationsInbox";
import LeaveManagement from "../../components/LeaveManagement";
import MyShiftsDashboard from "../../components/MyShiftsDashboard";

export default function CustomStaffDashboard() {
  const [activeItem, setActiveItem] = useState("Chat");
  const navigate = useNavigate();
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  // Get clubId and user info from localStorage
  const clubId = localStorage.getItem('clubId');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const staffUser = JSON.parse(localStorage.getItem('staffuser') || '{}');
  const [customRoleName, setCustomRoleName] = useState(user.customRoleName || staffUser.customRoleName || 'Staff');
  const [staffId, setStaffId] = useState(null);

  // Fetch staff member data to get custom role name and staff ID
  useEffect(() => {
    const fetchStaffData = async () => {
      if (!clubId || !user.email) return;
      
      try {
        const allStaff = await staffAPI.getAllStaffMembers(clubId);
        const staffList = allStaff?.staff || allStaff || [];
        const currentStaff = staffList.find(s => s.email === user.email);
        
        if (currentStaff) {
          setStaffId(currentStaff.id);
          if (currentStaff.customRoleName) {
            setCustomRoleName(currentStaff.customRoleName);
            // Update localStorage with custom role name
            const updatedUser = { ...user, customRoleName: currentStaff.customRoleName };
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        }
      } catch (error) {
        console.error('Error fetching staff data:', error);
      }
    };
    
    fetchStaffData();
  }, [clubId, user.email]);

  // Check if user needs to reset password
  useEffect(() => {
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
      const updatedUser = { ...user, mustResetPassword: false };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      const updatedStaffUser = { ...staffUser, mustResetPassword: false };
      localStorage.setItem('staffuser', JSON.stringify(updatedStaffUser));
      setShowPasswordResetModal(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reset password');
    },
  });

  const handlePasswordReset = (e) => {
    e.preventDefault();
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
    "Salary History",
    "Bonus History",
    "Leave Management",
  ];

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans">
      <div className="flex">
        {/* Sidebar */}
        <CustomStaffSidebar
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          menuItems={menuItems}
          onSignOut={handleSignOut}
          customRoleName={customRoleName}
        />

        {/* Main Section */}
        <main className="flex-1 lg:ml-0 min-w-0 h-screen overflow-y-auto">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 sm:py-10 space-y-8">
            {/* Header */}
            <header className="bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-400 p-6 rounded-xl shadow-md flex justify-between items-center mt-16 lg:mt-0">
              <div>
                <h1 className="text-2xl font-bold text-white">{customRoleName} Portal - {activeItem}</h1>
                <p className="text-gray-200 mt-1">Staff communication and financial records</p>
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
                <p className="font-medium">Please select a club to view your information.</p>
              </div>
            )}

            {/* Chat */}
            {activeItem === "Chat" && clubId && (
              <>
                {/* My Shifts Widget - Only show on Chat (main page) */}
                <MyShiftsDashboard selectedClubId={clubId} />
              <ChatManagement clubId={clubId} hidePlayerChat={true} />
              </>
            )}

            {/* Salary History */}
            {activeItem === "Salary History" && clubId && staffId && (
              <SalaryHistoryView clubId={clubId} staffId={staffId} />
            )}

            {/* Notifications */}
            {activeItem === "Notifications" && clubId && (
              <NotificationsInbox selectedClubId={clubId} recipientType="staff" />
            )}

            {/* Bonus History */}
            {activeItem === "Bonus History" && clubId && staffId && (
              <BonusHistoryView clubId={clubId} staffId={staffId} />
            )}

            {/* Leave Management */}
            {activeItem === "Leave Management" && clubId && (
              <LeaveManagement clubId={clubId} userRole="STAFF" />
            )}
          </div>
        </main>
      </div>
      {passwordResetModal}
    </div>
  );
}

// Salary History Component (View Only)
function SalaryHistoryView({ clubId, staffId }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  });

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ["salary-payments", clubId, staffId, currentPage, filters],
    queryFn: async () => {
      const result = await payrollAPI.getSalaryPayments(clubId, {
        page: currentPage,
        limit: 10,
        staffId: staffId,
        ...filters,
      });
      return result;
    },
    enabled: !!clubId && !!staffId,
  });

  const payments = paymentsData?.payments || [];
  const totalPages = paymentsData?.totalPages || 1;
  const totalRecords = paymentsData?.total || 0;

  const formatCurrency = (value) => `₹${(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading salary history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">Your Salary History</h2>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="bg-slate-900 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Total Records</p>
              <p className="text-white text-2xl font-bold">{totalRecords}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Paid</p>
              <p className="text-green-400 text-2xl font-bold">
                {formatCurrency(payments.reduce((sum, p) => sum + (p.amount || 0), 0))}
              </p>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="pb-3 text-gray-300 font-semibold">Payment Date</th>
                <th className="pb-3 text-gray-300 font-semibold">Amount</th>
                <th className="pb-3 text-gray-300 font-semibold">Period</th>
                <th className="pb-3 text-gray-300 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-400">
                    No salary payments found
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 text-white">{formatDate(payment.paymentDate)}</td>
                    <td className="py-3 text-green-400 font-semibold">{formatCurrency(payment.amount)}</td>
                    <td className="py-3 text-gray-300">
                      {payment.periodStart && payment.periodEnd
                        ? `${formatDate(payment.periodStart)} - ${formatDate(payment.periodEnd)}`
                        : '-'}
                    </td>
                    <td className="py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        payment.status === 'Paid' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                      }`}>
                        {payment.status || 'Paid'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Bonus History Component (View Only)
function BonusHistoryView({ clubId, staffId }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  });

  const { data: bonusesData, isLoading } = useQuery({
    queryKey: ["staff-bonuses", clubId, staffId, currentPage, filters],
    queryFn: async () => {
      const result = await bonusAPI.getStaffBonuses(clubId, {
        page: currentPage,
        limit: 10,
        staffId: staffId,
        ...filters,
      });
      return result;
    },
    enabled: !!clubId && !!staffId,
  });

  const bonuses = bonusesData?.bonuses || [];
  const totalPages = bonusesData?.totalPages || 1;
  const totalRecords = bonusesData?.total || 0;

  const formatCurrency = (value) => `₹${(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading bonus history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">Your Bonus History</h2>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="bg-slate-900 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Total Bonuses</p>
              <p className="text-white text-2xl font-bold">{totalRecords}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Bonus Amount</p>
              <p className="text-green-400 text-2xl font-bold">
                {formatCurrency(bonuses.reduce((sum, b) => sum + (b.bonusAmount || 0), 0))}
              </p>
            </div>
          </div>
        </div>

        {/* Bonuses Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="pb-3 text-gray-300 font-semibold">Date</th>
                <th className="pb-3 text-gray-300 font-semibold">Bonus Type</th>
                <th className="pb-3 text-gray-300 font-semibold">Amount</th>
                <th className="pb-3 text-gray-300 font-semibold">Reason</th>
              </tr>
            </thead>
            <tbody>
              {bonuses.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-400">
                    No bonuses found
                  </td>
                </tr>
              ) : (
                bonuses.map((bonus) => (
                  <tr key={bonus.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 text-white">{formatDate(bonus.createdAt)}</td>
                    <td className="py-3 text-gray-300">{bonus.bonusType || bonus.customBonusType || '-'}</td>
                    <td className="py-3 text-green-400 font-semibold">{formatCurrency(bonus.bonusAmount)}</td>
                    <td className="py-3 text-gray-400">{bonus.reason || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

