import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import ChatManagement from "../../components/ChatManagement";
import DealerSidebar from "../../components/sidebars/DealerSidebar";
import { payrollAPI, bonusAPI, staffAPI, shiftsAPI, financialOverridesAPI } from "../../lib/api";
import toast from "react-hot-toast";

export default function DealerDashboard() {
  const [activeItem, setActiveItem] = useState("Shift Timings");
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
  const [dealerId, setDealerId] = useState(null);

  // Fetch dealer data to get dealer ID
  useEffect(() => {
    const fetchDealerData = async () => {
      if (!clubId || !user.email) return;
      
      try {
        const allStaff = await staffAPI.getAllStaffMembers(clubId);
        const staffList = allStaff?.staff || allStaff || [];
        const currentDealer = staffList.find(s => s.email === user.email && s.role === 'Dealer');
        
        if (currentDealer) {
          setDealerId(currentDealer.id);
        }
      } catch (error) {
        console.error('Error fetching dealer data:', error);
      }
    };
    
    fetchDealerData();
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
    "Shift Timings",
    "Transactions",
    "Tips",
    "Tip Settings",
    "Chat",
  ];

  const handleSignOut = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('staffuser');
    localStorage.removeItem('clubId');
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans">
      <div className="flex">
        {/* Sidebar */}
        <DealerSidebar
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          menuItems={menuItems}
          onSignOut={handleSignOut}
        />

        {/* Main Section */}
        <main className="flex-1 lg:ml-0 min-w-0">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 sm:py-10 space-y-8">
            {/* Header */}
            <header className="bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-400 p-6 rounded-xl shadow-md flex justify-between items-center mt-16 lg:mt-0">
              <div>
                <h1 className="text-2xl font-bold text-white">Dealer Portal - {activeItem}</h1>
                <p className="text-gray-200 mt-1">Manage your shifts, tips, and transactions</p>
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

            {/* Shift Timings (Home Page) */}
            {activeItem === "Shift Timings" && clubId && dealerId && (
              <ShiftTimingsView clubId={clubId} dealerId={dealerId} />
            )}

            {/* Transactions */}
            {activeItem === "Transactions" && clubId && dealerId && (
              <TransactionsView clubId={clubId} dealerId={dealerId} />
            )}

            {/* Tips */}
            {activeItem === "Tips" && clubId && dealerId && (
              <TipsView clubId={clubId} dealerId={dealerId} />
            )}

            {/* Tip Settings */}
            {activeItem === "Tip Settings" && clubId && dealerId && (
              <TipSettingsView clubId={clubId} dealerId={dealerId} />
            )}

            {/* Chat */}
            {activeItem === "Chat" && clubId && (
              <ChatManagement clubId={clubId} hidePlayerChat={true} />
            )}
          </div>
        </main>
      </div>
      {passwordResetModal}
    </div>
  );
}

// Shift Timings Component (View Only - Home Page)
function ShiftTimingsView({ clubId, dealerId }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("week");

  const getDateRange = () => {
    const start = new Date(selectedDate);
    const end = new Date(selectedDate);

    if (viewMode === "week") {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      end.setDate(start.getDate() + 6);
    } else {
      start.setDate(1);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
    }

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  };

  const { data: shiftsData, isLoading } = useQuery({
    queryKey: ["shifts", clubId, dealerId, selectedDate, viewMode],
    queryFn: () => {
      const { startDate, endDate } = getDateRange();
      return shiftsAPI.getShifts(clubId, {
        startDate,
        endDate,
        staffId: dealerId,
      });
    },
    enabled: !!clubId && !!dealerId,
  });

  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setSelectedDate(newDate);
  };

  const shifts = shiftsData?.shifts || [];

  const getWeekDates = () => {
    const dates = [];
    const { startDate } = getDateRange();
    const start = new Date(startDate);
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getShiftsForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return shifts.filter((shift) => {
      const shiftDateStr = new Date(shift.shiftDate).toISOString().split("T")[0];
      return shiftDateStr === dateStr;
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateHeader = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return <div className="text-white text-center py-8">Loading shifts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg p-4 flex items-center justify-between">
        <button
          onClick={() => navigateDate(-1)}
          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          ← Previous
        </button>

        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white">
            {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>
          <button
            onClick={() => setSelectedDate(new Date())}
            className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
          >
            Today
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("week")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                viewMode === "week" ? "bg-purple-600 text-white" : "bg-slate-700 text-gray-300"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                viewMode === "month" ? "bg-purple-600 text-white" : "bg-slate-700 text-gray-300"
              }`}
            >
              Month
            </button>
          </div>
        </div>

        <button
          onClick={() => navigateDate(1)}
          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          Next →
        </button>
      </div>

      {viewMode === "week" ? (
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <div className="grid grid-cols-8 gap-px bg-slate-700">
            <div className="bg-slate-900 p-3 text-white font-semibold">Date</div>
            {getWeekDates().map((date) => (
              <div key={date.toISOString()} className="bg-slate-900 p-3 text-white font-semibold text-center">
                {formatDateHeader(date)}
              </div>
            ))}
            <div className="bg-slate-800 p-3 text-gray-300">Shifts</div>
            {getWeekDates().map((date) => {
              const dayShifts = getShiftsForDate(date);
              return (
                <div key={date.toISOString()} className="bg-slate-800 p-3 min-h-[100px]">
                  {dayShifts.length > 0 ? (
                    <div className="space-y-2">
                      {dayShifts.map((shift) => (
                        <div key={shift.id} className="bg-purple-600/20 border border-purple-500/50 rounded p-2 text-sm">
                          <div className="text-purple-300 font-semibold">
                            {formatTime(shift.shiftStartTime)} - {formatTime(shift.shiftEndTime)}
                          </div>
                          {shift.isOffDay && (
                            <div className="text-gray-400 text-xs mt-1">Off Day</div>
                          )}
                          {shift.notes && (
                            <div className="text-gray-400 text-xs mt-1">{shift.notes}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm text-center">No shifts</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="space-y-4">
            {shifts.map((shift) => (
              <div key={shift.id} className="bg-slate-700 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <div className="text-white font-semibold">
                    {new Date(shift.shiftDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div className="text-gray-300 text-sm mt-1">
                    {formatTime(shift.shiftStartTime)} - {formatTime(shift.shiftEndTime)}
                  </div>
                  {shift.notes && (
                    <div className="text-gray-400 text-xs mt-1">{shift.notes}</div>
                  )}
                </div>
                {shift.isOffDay && (
                  <span className="bg-yellow-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Off Day
                  </span>
                )}
              </div>
            ))}
            {shifts.length === 0 && (
              <div className="text-center text-gray-400 py-8">No shifts scheduled for this period</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Transactions Component
function TransactionsView({ clubId, dealerId }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  });

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ["dealer-transactions", clubId, dealerId, currentPage, filters],
    queryFn: async () => {
      // Get transactions filtered for dealer (dealer-cashout, salary-bonus)
      const result = await financialOverridesAPI.getAllTransactions(clubId, {
        category: 'staff',
        subCategory: 'dealer-cashout',
        page: currentPage,
        limit: 10,
      });
      
      // Also get salary and bonuses
      const salaryData = await payrollAPI.getSalaryPayments(clubId, {
        page: currentPage,
        limit: 10,
        staffId: dealerId,
        ...filters,
      });
      
      const bonusData = await bonusAPI.getStaffBonuses(clubId, {
        page: currentPage,
        limit: 10,
        staffId: dealerId,
        ...filters,
      });

      // Combine all transactions
      const allTransactions = [
        ...(result.transactions || []),
        ...(salaryData.payments || []).map(p => ({
          id: p.id,
          type: 'Salary Payment',
          amount: p.netAmount,
          date: p.paymentDate || p.createdAt,
          status: p.status,
          notes: p.notes,
        })),
        ...(bonusData.bonuses || []).map(b => ({
          id: b.id,
          type: 'Staff Bonus',
          amount: b.bonusAmount,
          date: b.processedAt || b.createdAt,
          status: 'Completed',
          notes: b.reason,
        })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      return {
        transactions: allTransactions.slice((currentPage - 1) * 10, currentPage * 10),
        total: allTransactions.length,
        totalPages: Math.ceil(allTransactions.length / 10),
      };
    },
    enabled: !!clubId && !!dealerId,
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
        <div className="flex items-end">
          <button
            onClick={() => setFilters({ startDate: "", endDate: "" })}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Clear Filters
          </button>
        </div>
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
                      {transaction.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-semibold">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.status === 'Completed' || transaction.status === 'PROCESSED' || transaction.status === 'Paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {transaction.notes || '-'}
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

// Tips Component
function TipsView({ clubId, dealerId }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
  });

  const { data: tipsData, isLoading } = useQuery({
    queryKey: ["dealer-tips", clubId, dealerId, currentPage, filters],
    queryFn: () => payrollAPI.getDealerTips(clubId, {
      page: currentPage,
      limit: 10,
      dealerId: dealerId,
      ...filters,
    }),
    enabled: !!clubId && !!dealerId,
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
    return <div className="text-center py-8">Loading tips...</div>;
  }

  const tips = tipsData?.tips || [];
  const totalPages = tipsData?.totalPages || 1;

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6">My Tips</h2>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Processed">Processed</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => setFilters({ startDate: "", endDate: "", status: "" })}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {tips.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Total Tips</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">My Share</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Share %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-slate-700">
                {tips.map((tip) => (
                  <tr key={tip.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(tip.tipDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-semibold">
                      {formatCurrency(tip.totalTips)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-semibold">
                      {formatCurrency(tip.dealerShareAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {tip.dealerSharePercentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        tip.status === 'Paid'
                          ? 'bg-green-100 text-green-800'
                          : tip.status === 'Processed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {tip.status}
                      </span>
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
        <div className="text-center py-8 text-gray-400">No tips found.</div>
      )}
    </div>
  );
}

// Tip Settings Component (View Only)
function TipSettingsView({ clubId, dealerId }) {
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["tip-settings", clubId, dealerId],
    queryFn: () => payrollAPI.getTipSettings(clubId, dealerId),
    enabled: !!clubId && !!dealerId,
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading tip settings...</div>;
  }

  const settings = settingsData?.settings || settingsData;

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6">My Tip Settings</h2>
      <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4 mb-6">
        <p className="text-blue-300 text-sm">
          💡 These settings are configured by the administrator. Contact your manager if you need changes.
        </p>
      </div>
      
      {settings ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Tip Distribution</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Club Hold:</span>
                <span className="text-white font-semibold">{settings.clubHoldPercentage || 15}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">My Share:</span>
                <span className="text-green-400 font-semibold">{settings.dealerSharePercentage || 85}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Floor Manager:</span>
                <span className="text-white font-semibold">{settings.floorManagerPercentage || 5}%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Settings Info</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-300 text-sm">Last Updated:</span>
                <p className="text-white">
                  {settings.updatedAt 
                    ? new Date(settings.updatedAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">No tip settings found.</div>
      )}
    </div>
  );
}


