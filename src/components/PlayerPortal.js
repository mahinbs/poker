import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPlayerProfile,
  updatePlayerProfile,
  changePlayerPassword,
  getPlayerBalance,
  getPlayerTransactions,
  joinWaitlist,
  getWaitlistStatus,
  cancelWaitlist,
  getAvailableTables,
  getTableDetails,
  requestCredit,
  getPlayerStats
} from '../utils/api';
import { usePlayerWebSocket } from '../hooks/usePlayerWebSocket';

export default function PlayerPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Profile state
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    nickname: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Balance & Transactions
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionsPage, setTransactionsPage] = useState({ limit: 20, offset: 0, total: 0 });

  // Waitlist
  const [waitlistStatus, setWaitlistStatus] = useState(null);
  const [waitlistForm, setWaitlistForm] = useState({ tableType: '', partySize: 1 });

  // Tables
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);

  // Credit
  const [creditForm, setCreditForm] = useState({ amount: '', notes: '' });

  // Stats
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const player = JSON.parse(localStorage.getItem('player') || '{}');
    if (!player.id) {
      navigate('/player/login');
      return;
    }
    loadDashboardData();
  }, [navigate]);

  // Reload data when switching tabs
  useEffect(() => {
    if (activeTab === 'profile' && !profile) {
      loadProfile();
    } else if (activeTab === 'balance' && !balance) {
      loadBalance();
      loadTransactions();
    } else if (activeTab === 'waitlist' && waitlistStatus === null) {
      loadWaitlistStatus();
    } else if (activeTab === 'tables' && tables.length === 0) {
      loadTables();
    } else if (activeTab === 'stats' && !stats) {
      loadStats();
    }
  }, [activeTab]);

  // WebSocket integration for real-time updates
  const handleTableUpdate = (data) => {
    console.log('Real-time table update:', data);
    loadTables();
    if (activeTab === 'tables') {
      // Refresh table list
    }
  };

  const handleCreditUpdate = (data) => {
    console.log('Real-time credit update:', data);
    alert(`Credit request ${data.request.status}! Amount: ₹${data.request.amount.toLocaleString('en-IN')}`);
    loadBalance();
    if (activeTab === 'credit') {
      // Show notification
    }
  };

  const handleWaitlistUpdate = (data) => {
    console.log('Real-time waitlist update:', data);
    loadWaitlistStatus();
    if (data.position) {
      // Show position update notification
    }
    if (data.entry?.status === 'SEATED') {
      alert('You have been seated! Please proceed to your table.');
      loadTables();
    }
  };

  usePlayerWebSocket(handleTableUpdate, handleCreditUpdate, handleWaitlistUpdate);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([
        loadProfile(),
        loadBalance(),
        loadTransactions(),
        loadWaitlistStatus(),
        loadTables(),
        loadStats()
      ]);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const data = await getPlayerProfile();
      setProfile(data);
      const nameParts = data.player.name.split(' ');
      setProfileForm({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        phoneNumber: data.player.phoneNumber || '',
        nickname: data.player.nickname || ''
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const loadBalance = async () => {
    try {
      const data = await getPlayerBalance();
      setBalance(data);
    } catch (err) {
      console.error('Failed to load balance:', err);
    }
  };

  const loadTransactions = async (offset = 0) => {
    try {
      const data = await getPlayerTransactions(transactionsPage.limit, offset);
      setTransactions(data.transactions);
      setTransactionsPage(prev => ({
        ...prev,
        offset,
        total: data.total,
        hasMore: data.hasMore
      }));
    } catch (err) {
      console.error('Failed to load transactions:', err);
    }
  };

  const loadWaitlistStatus = async () => {
    try {
      const data = await getWaitlistStatus();
      setWaitlistStatus(data);
    } catch (err) {
      console.error('Failed to load waitlist status:', err);
    }
  };

  const loadTables = async () => {
    try {
      const data = await getAvailableTables();
      setTables(data.tables || []);
    } catch (err) {
      console.error('Failed to load tables:', err);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getPlayerStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await updatePlayerProfile(profileForm);
      // Reload profile from API to get latest data
      await loadProfile();
      // Update localStorage with latest player data
      const player = JSON.parse(localStorage.getItem('player') || '{}');
      if (player.id) {
        localStorage.setItem('player', JSON.stringify({
          ...player,
          name: result.player.name,
          phoneNumber: result.player.phoneNumber,
          nickname: result.player.nickname
        }));
      }
      setError('');
      alert('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (passwordForm.newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      await changePlayerPassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      alert('Password changed successfully!');
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinWaitlist = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await joinWaitlist(
        waitlistForm.tableType || undefined,
        waitlistForm.partySize
      );
      await loadWaitlistStatus();
      await loadTables();
      alert(`Joined waitlist! Your position: ${result.position} of ${result.totalInQueue}`);
      setWaitlistForm({ tableType: '', partySize: 1 });
    } catch (err) {
      setError(err.message || 'Failed to join waitlist');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelWaitlist = async () => {
    if (!waitlistStatus?.entry?.id) return;
    if (!window.confirm('Are you sure you want to cancel your waitlist entry?')) return;
    
    setLoading(true);
    setError('');
    try {
      await cancelWaitlist(waitlistStatus.entry.id);
      await loadWaitlistStatus();
      await loadTables();
      alert('Waitlist entry cancelled');
    } catch (err) {
      setError(err.message || 'Failed to cancel waitlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCredit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const amount = parseFloat(creditForm.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }
      if (amount > 1000000) {
        throw new Error('Amount cannot exceed ₹1,000,000');
      }
      await requestCredit(amount, creditForm.notes || undefined);
      setCreditForm({ amount: '', notes: '' });
      alert('Credit request submitted successfully!');
      await loadBalance();
    } catch (err) {
      setError(err.message || 'Failed to request credit');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTable = async (tableId) => {
    setLoading(true);
    try {
      const data = await getTableDetails(tableId);
      setSelectedTable(data);
    } catch (err) {
      setError(err.message || 'Failed to load table details');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('player');
    navigate('/player/login');
  };

  const player = JSON.parse(localStorage.getItem('player') || '{}');

  if (!player.id) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
      {/* Header */}
      <header className="bg-gray-800/50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Player Portal
              </h1>
              {profile?.club && (
                <p className="text-sm text-gray-400">{profile.club.name}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              {profile?.player && (
                <span className="text-sm text-gray-300">
                  {profile.player.name}
                </span>
              )}
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-gray-800/30 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {['dashboard', 'profile', 'balance', 'waitlist', 'tables', 'credit', 'stats'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-emerald-600 text-white border-b-2 border-emerald-400'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading && activeTab !== 'dashboard' && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
            <p className="mt-4 text-gray-400">Loading...</p>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Balance Card */}
            {balance && (
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Available Balance</h3>
                <div className="text-3xl font-bold text-emerald-400">
                  ₹{balance.availableBalance?.toLocaleString('en-IN') || '0.00'}
                </div>
                {balance.tableBalance > 0 && (
                  <p className="text-sm text-gray-400 mt-2">
                    Table Balance: ₹{balance.tableBalance.toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            )}

            {/* Waitlist Status Card */}
            {waitlistStatus && waitlistStatus.onWaitlist && (
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Waitlist Status</h3>
                <div className="text-2xl font-bold text-cyan-400">
                  Position: {waitlistStatus.position || 'N/A'}
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  {waitlistStatus.totalInQueue} in queue
                </p>
              </div>
            )}

            {/* Stats Card */}
            {stats && (
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Total Spent</h3>
                <div className="text-3xl font-bold text-orange-400">
                  ₹{stats.totalSpent?.toLocaleString('en-IN') || '0.00'}
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  {stats.totalTransactions} transactions
                </p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('waitlist')}
                  className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors text-left"
                >
                  Join Waitlist
                </button>
                <button
                  onClick={() => setActiveTab('tables')}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-left"
                >
                  View Tables
                </button>
                <button
                  onClick={() => setActiveTab('credit')}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-left"
                >
                  Request Credit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {!profile && loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                <p className="mt-4 text-gray-400">Loading profile...</p>
              </div>
            ) : profile ? (
              <>
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Profile Information</h2>
                    <button
                      onClick={loadProfile}
                      disabled={loading}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 text-sm"
                    >
                      🔄 Refresh
                    </button>
                  </div>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.player.email}
                    disabled
                    className="w-full px-4 py-2 bg-gray-700/30 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phoneNumber}
                      onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nickname
                    </label>
                    <input
                      type="text"
                      value={profileForm.nickname}
                      onChange={(e) => setProfileForm({ ...profileForm, nickname: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Change Password</h2>
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  {showPasswordForm ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              {/* Profile Info Display */}
              <div className="mb-6 p-4 bg-gray-700/30 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Current Profile Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white ml-2">{profile.player.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white ml-2">{profile.player.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Phone:</span>
                    <span className="text-white ml-2">{profile.player.phoneNumber || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Nickname:</span>
                    <span className="text-white ml-2">{profile.player.nickname || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      profile.player.status === 'Active' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {profile.player.status || 'Active'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Total Spent:</span>
                    <span className="text-white ml-2">₹{profile.player.totalSpent?.toLocaleString('en-IN') || '0.00'}</span>
                  </div>
                </div>
                {profile.club && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <span className="text-gray-400">Club:</span>
                    <span className="text-white ml-2">{profile.club.name}</span>
                  </div>
                )}
              </div>

              {showPasswordForm && (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                      required
                      minLength={8}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              )}
            </div>
              </>
            ) : (
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <p className="text-gray-400 text-center py-8">Failed to load profile. Please try refreshing.</p>
                <button
                  onClick={loadProfile}
                  className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        )}

        {/* Balance Tab */}
        {activeTab === 'balance' && (
          <div className="space-y-6">
            {balance && (
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h2 className="text-2xl font-bold mb-6">Account Balance</h2>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Available Balance</p>
                    <p className="text-3xl font-bold text-emerald-400">
                      ₹{balance.availableBalance?.toLocaleString('en-IN') || '0.00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Table Balance</p>
                    <p className="text-3xl font-bold text-cyan-400">
                      ₹{balance.tableBalance?.toLocaleString('en-IN') || '0.00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Total Balance</p>
                    <p className="text-3xl font-bold text-orange-400">
                      ₹{balance.totalBalance?.toLocaleString('en-IN') || '0.00'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-6">Transaction History</h2>
              {transactions.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No transactions found</p>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-gray-300">Date</th>
                          <th className="text-left py-3 px-4 text-gray-300">Type</th>
                          <th className="text-right py-3 px-4 text-gray-300">Amount</th>
                          <th className="text-left py-3 px-4 text-gray-300">Status</th>
                          <th className="text-left py-3 px-4 text-gray-300">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map(txn => (
                          <tr key={txn.id} className="border-b border-gray-700/50">
                            <td className="py-3 px-4">
                              {new Date(txn.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">{txn.type}</td>
                            <td className={`py-3 px-4 text-right ${
                              ['Deposit', 'Credit', 'Bonus'].includes(txn.type) 
                                ? 'text-green-400' 
                                : 'text-red-400'
                            }`}>
                              {['Deposit', 'Credit', 'Bonus'].includes(txn.type) ? '+' : '-'}
                              ₹{Math.abs(txn.amount).toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs ${
                                txn.status === 'Completed' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {txn.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-400 text-sm">
                              {txn.notes || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {transactionsPage.hasMore && (
                    <button
                      onClick={() => loadTransactions(transactionsPage.offset + transactionsPage.limit)}
                      className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      Load More
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Waitlist Tab */}
        {activeTab === 'waitlist' && (
          <div className="space-y-6">
            {waitlistStatus?.onWaitlist ? (
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h2 className="text-2xl font-bold mb-6">Waitlist Status</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Your Position</p>
                    <p className="text-4xl font-bold text-cyan-400">
                      {waitlistStatus.position || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      {waitlistStatus.totalInQueue} players in queue
                    </p>
                  </div>
                  {waitlistStatus.entry && (
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <p className="text-sm text-gray-400">Table Type: {waitlistStatus.entry.tableType || 'Any'}</p>
                      <p className="text-sm text-gray-400">Party Size: {waitlistStatus.entry.partySize}</p>
                      <p className="text-sm text-gray-400">Status: {waitlistStatus.entry.status}</p>
                    </div>
                  )}
                  {waitlistStatus.availableTables === 0 && waitlistStatus.message && (
                    <p className="text-yellow-400 text-sm">{waitlistStatus.message}</p>
                  )}
                  <button
                    onClick={handleCancelWaitlist}
                    disabled={loading}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel Waitlist
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h2 className="text-2xl font-bold mb-6">Join Waitlist</h2>
                <form onSubmit={handleJoinWaitlist} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Table Type (Optional)
                    </label>
                    <input
                      type="text"
                      value={waitlistForm.tableType}
                      onChange={(e) => setWaitlistForm({ ...waitlistForm, tableType: e.target.value })}
                      placeholder="e.g., cash, tournament"
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Party Size
                    </label>
                    <input
                      type="number"
                      value={waitlistForm.partySize}
                      onChange={(e) => setWaitlistForm({ ...waitlistForm, partySize: parseInt(e.target.value) || 1 })}
                      min="1"
                      max="10"
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Joining...' : 'Join Waitlist'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Tables Tab */}
        {activeTab === 'tables' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-6">Available Tables</h2>
              {tables.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No tables available</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tables.map(table => (
                    <div
                      key={table.id}
                      className="bg-gray-700/30 rounded-lg p-4 border border-gray-600 hover:border-emerald-500 transition-colors cursor-pointer"
                      onClick={() => handleViewTable(table.id)}
                    >
                      <h3 className="font-semibold text-lg mb-2">Table {table.tableNumber}</h3>
                      <p className="text-sm text-gray-400 mb-2">{table.tableType}</p>
                      <div className="space-y-1 text-sm">
                        <p>Available Seats: <span className="text-emerald-400">{table.availableSeats}</span> / {table.maxSeats}</p>
                        <p>Buy-in: ₹{table.minBuyIn?.toLocaleString('en-IN')} - ₹{table.maxBuyIn?.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-gray-500">Status: {table.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedTable && (
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Table {selectedTable.tableNumber} Details</h2>
                  <button
                    onClick={() => setSelectedTable(null)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                  >
                    Close
                  </button>
                </div>
                <div className="space-y-2">
                  <p><span className="text-gray-400">Type:</span> {selectedTable.tableType}</p>
                  <p><span className="text-gray-400">Available Seats:</span> {selectedTable.availableSeats} / {selectedTable.maxSeats}</p>
                  <p><span className="text-gray-400">Buy-in Range:</span> ₹{selectedTable.minBuyIn?.toLocaleString('en-IN')} - ₹{selectedTable.maxBuyIn?.toLocaleString('en-IN')}</p>
                  <p><span className="text-gray-400">Status:</span> {selectedTable.status}</p>
                  {selectedTable.notes && (
                    <p><span className="text-gray-400">Notes:</span> {selectedTable.notes}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Credit Tab */}
        {activeTab === 'credit' && (
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Request Credit</h2>
            <form onSubmit={handleRequestCredit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={creditForm.amount}
                  onChange={(e) => setCreditForm({ ...creditForm, amount: e.target.value })}
                  placeholder="Enter amount"
                  min="1"
                  max="1000000"
                  step="0.01"
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Maximum: ₹1,000,000</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={creditForm.notes}
                  onChange={(e) => setCreditForm({ ...creditForm, notes: e.target.value })}
                  placeholder="Additional information..."
                  rows="4"
                  maxLength="500"
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Credit Request'}
              </button>
            </form>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Total Spent</h3>
              <p className="text-3xl font-bold text-orange-400">
                ₹{stats.totalSpent?.toLocaleString('en-IN') || '0.00'}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Total Deposits</h3>
              <p className="text-3xl font-bold text-green-400">
                ₹{stats.totalDeposits?.toLocaleString('en-IN') || '0.00'}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Total Withdrawals</h3>
              <p className="text-3xl font-bold text-red-400">
                ₹{stats.totalWithdrawals?.toLocaleString('en-IN') || '0.00'}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Total Buy-ins</h3>
              <p className="text-3xl font-bold text-cyan-400">
                ₹{stats.totalBuyIns?.toLocaleString('en-IN') || '0.00'}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Total Transactions</h3>
              <p className="text-3xl font-bold text-purple-400">
                {stats.totalTransactions || 0}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Account Status</h3>
              <p className="text-2xl font-bold text-emerald-400">
                {stats.accountStatus || 'Active'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Member since: {new Date(stats.memberSince).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

