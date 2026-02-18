import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import AffiliateSidebar from "../../components/sidebars/AffiliateSidebar";
import { affiliateAPI } from "../../lib/api";
import toast from "react-hot-toast";

export default function AffiliateDashboard() {
  const [activeItem, setActiveItem] = useState("Referral Players");
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
  const affiliateUser = JSON.parse(localStorage.getItem('affiliateuser') || '{}');
  const [affiliateId, setAffiliateId] = useState(null);
  const [affiliateCode, setAffiliateCode] = useState(null);

  // Fetch affiliate data to get affiliate ID and code
  useEffect(() => {
    const fetchAffiliateData = async () => {
      if (!clubId) return;
      
      // Try to get userId from various sources
      const userId = user.id || user.userId || staffUser.userId || affiliateUser.userId;
      if (!userId) {
        console.error('No user ID found');
        return;
      }
      
      try {
        const affiliates = await affiliateAPI.getAffiliates(clubId);
        const affiliateList = affiliates?.affiliates || affiliates || [];
        
        // Try multiple ways to match the affiliate
        const currentAffiliate = affiliateList.find(a => {
          // Check direct userId field (camelCase)
          if (a.userId === userId) return true;
          // Check user_id field (snake_case from database)
          if (a.user_id === userId) return true;
          // Check user relation object with id
          if (a.user?.id === userId) return true;
          // Check if user is an object with id property (nested)
          if (a.user && typeof a.user === 'object' && a.user.id === userId) return true;
          // Also try matching by email as fallback
          const userEmail = user.email || staffUser.email || affiliateUser.email;
          if (userEmail && a.email === userEmail) return true;
          return false;
        });
        
        if (currentAffiliate) {
          setAffiliateId(currentAffiliate.id);
          setAffiliateCode(currentAffiliate.code);
          // Store affiliate code in localStorage for sidebar
          const updatedUser = { ...user, affiliateCode: currentAffiliate.code, affiliateId: currentAffiliate.id };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } else {
          // If there's only one affiliate in the club, use it (fallback for AFFILIATE role)
          // This handles cases where the userId might not match exactly
          if (affiliateList.length === 1) {
            const fallbackAffiliate = affiliateList[0];
            setAffiliateId(fallbackAffiliate.id);
            setAffiliateCode(fallbackAffiliate.code);
            const updatedUser = { ...user, affiliateCode: fallbackAffiliate.code, affiliateId: fallbackAffiliate.id };
            localStorage.setItem('user', JSON.stringify(updatedUser));
          } else {
            console.error('Affiliate not found for userId:', userId);
            console.error('Available affiliates:', affiliateList.map(a => ({
              id: a.id,
              userId: a.userId,
              user_id: a.user_id,
              user: a.user ? { id: a.user.id, email: a.user.email } : null,
              code: a.code
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching affiliate data:', error);
      }
    };
    
    fetchAffiliateData();
  }, [clubId, user.id, user.userId, staffUser.userId, affiliateUser.userId]);

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
    "Referral Players",
    "Transactions",
  ];

  const handleSignOut = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

    return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans">
      <div className="flex">
        {/* Sidebar */}
        <AffiliateSidebar
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          menuItems={menuItems}
          onSignOut={handleSignOut}
          affiliateCode={affiliateCode}
        />

        {/* Main Section */}
        <main className="flex-1 lg:ml-0 min-w-0">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 sm:py-10 space-y-8">
            {/* Header */}
            <header className="bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-400 p-6 rounded-xl shadow-md flex justify-between items-center mt-16 lg:mt-0">
              <div>
                <h1 className="text-2xl font-bold text-white">Affiliate Portal - {activeItem}</h1>
                <p className="text-gray-200 mt-1">Manage your referrals and transactions</p>
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

            {clubId && !affiliateId && (
              <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 text-yellow-100">
                <p className="font-medium">Loading affiliate information...</p>
                        </div>
            )}

            {/* Referral Players */}
            {activeItem === "Referral Players" && clubId && affiliateId && (
              <ReferralPlayersView clubId={clubId} affiliateId={affiliateId} />
            )}

            {/* Transactions */}
            {activeItem === "Transactions" && clubId && affiliateId && (
              <TransactionsView clubId={clubId} affiliateId={affiliateId} />
            )}
          </div>
        </main>
                    </div>
      {passwordResetModal}
                </div>
  );
}

// Referral Players Component
function ReferralPlayersView({ clubId, affiliateId }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    kycStatus: "",
    startDate: "",
    endDate: "",
  });

  const { data: playersData, isLoading } = useQuery({
    queryKey: ["affiliate-referrals", clubId, affiliateId, currentPage, filters],
    queryFn: () => affiliateAPI.getAffiliateReferrals(clubId, affiliateId, {
      search: filters.search,
      kycStatus: filters.kycStatus,
      startDate: filters.startDate,
      endDate: filters.endDate,
    }),
    enabled: !!clubId && !!affiliateId,
  });

  const formatCurrency = (value) => `₹${(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getKycStatusBadge = (status) => {
    const statusMap = {
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      'approved': { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      'rejected': { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
      'verified': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Verified' },
    };
    const statusConfig = statusMap[status?.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status || 'Unknown' };
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
        {statusConfig.label}
      </span>
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading referral players...</div>;
  }

  const players = playersData?.players || [];
  // Paginate manually (10 per page)
  const totalPages = Math.ceil(players.length / 10);
  const paginatedPlayers = players.slice((currentPage - 1) * 10, currentPage * 10);

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6">My Referral Players</h2>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Search by Name/Email</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search..."
            className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
          />
                        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">KYC Status</label>
          <select
            value={filters.kycStatus}
            onChange={(e) => setFilters({ ...filters, kycStatus: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="verified">Verified</option>
          </select>
                            </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">From Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
          />
                        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">To Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
          />
                    </div>
                </div>

      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setFilters({ search: "", kycStatus: "", startDate: "", endDate: "" })}
          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold"
        >
          Clear Filters
        </button>
                    </div>

      {paginatedPlayers.length > 0 ? (
        <>
                    <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">KYC Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Total Spent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Commission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Created</th>
                                </tr>
                            </thead>
              <tbody className="bg-slate-800 divide-y divide-slate-700">
                {paginatedPlayers.map((player) => (
                  <tr key={player.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {player.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {player.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {player.phoneNumber || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getKycStatusBadge(player.kycStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {formatCurrency(player.totalSpent || 0)}
                                        </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-semibold">
                      {formatCurrency(player.totalCommission || 0)}
                                        </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(player.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-300">
              Page {currentPage} of {totalPages || 1} (Showing {paginatedPlayers.length} of {players.length} players)
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages || 1, p + 1))}
              disabled={currentPage === (totalPages || 1)}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
                        </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-400">No referral players found.</div>
                    )}
                </div>
  );
}

// Transactions Component
function TransactionsView({ clubId, affiliateId }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
  });

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ["affiliate-transactions", clubId, affiliateId, currentPage, filters],
    queryFn: () => affiliateAPI.getAffiliateTransactions(clubId, {
      page: currentPage,
      limit: 10,
      affiliateId: affiliateId,
      ...filters,
    }),
    enabled: !!clubId && !!affiliateId,
  });

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
    return <div className="text-center py-8">Loading transactions...</div>;
  }

  const transactions = transactionsData?.transactions || [];
  const totalPages = transactionsData?.totalPages || 1;

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6">My Transactions</h2>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Search</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search..."
            className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
          />
        </div>
      </div>

      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setFilters({ search: "", startDate: "", endDate: "" })}
          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold"
        >
          Clear Filters
        </button>
      </div>

      {transactions.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-slate-700">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {transaction.type || 'Payment'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-semibold">
                      {formatCurrency(transaction.amount || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(transaction.date || transaction.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.status === 'Completed' || transaction.status === 'Paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {transaction.notes || transaction.description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-400">No transactions found.</div>
      )}
        </div>
    );
}
