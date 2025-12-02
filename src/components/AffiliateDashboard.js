import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClub, getClubStaff } from '../utils/api';

export default function AffiliateDashboard() {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [clubInfo, setClubInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const menuItems = [
    'Dashboard',
    'Referrals',
    'Commission Tracking',
    'Player Activity',
    'Reports'
  ];

  useEffect(() => {
    const loadClubData = async () => {
      try {
        const adminStr = localStorage.getItem('admin');
        if (!adminStr) {
          navigate('/login');
          return;
        }

        const admin = JSON.parse(adminStr);
        if (admin.clubId && admin.tenantId) {
          const club = await getClub(admin.clubId, admin.tenantId);
          setClubInfo(club);
        } else {
          setError('Club information not available.');
        }
      } catch (err) {
        console.error('Failed to load club data:', err);
        setError(err.message || 'Failed to load club data');
      } finally {
        setLoading(false);
      }
    };

    loadClubData();
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem('admin');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Affiliate Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  // Mock data for affiliate dashboard
  const [referrals, setReferrals] = useState([
    {
      id: 'R001',
      playerName: 'John Doe',
      playerEmail: 'john.doe@example.com',
      referralDate: '2024-01-15',
      status: 'Active',
      totalSpent: 50000,
      commission: 2500,
      commissionRate: 5
    },
    {
      id: 'R002',
      playerName: 'Jane Smith',
      playerEmail: 'jane.smith@example.com',
      referralDate: '2024-01-20',
      status: 'Active',
      totalSpent: 75000,
      commission: 3750,
      commissionRate: 5
    },
    {
      id: 'R003',
      playerName: 'Bob Johnson',
      playerEmail: 'bob.johnson@example.com',
      referralDate: '2024-01-10',
      status: 'Inactive',
      totalSpent: 30000,
      commission: 1500,
      commissionRate: 5
    }
  ]);

  const totalCommission = referrals.reduce((sum, r) => sum + r.commission, 0);
  const activeReferrals = referrals.filter(r => r.status === 'Active').length;
  const totalPlayersReferred = referrals.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600/30 via-purple-500/20 to-pink-700/30 border-b border-indigo-800/40 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>
            <p className="text-gray-300 mt-1">
              {clubInfo ? `${clubInfo.name} - Affiliate Portal` : 'Affiliate Portal'}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-semibold shadow-lg"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800/50 border-r border-gray-700 min-h-screen p-4">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveItem(item)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeItem === item
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeItem === 'Dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-indigo-600/30 via-purple-500/20 to-pink-700/30 rounded-xl p-6 border border-indigo-800/40">
                  <h3 className="text-gray-300 text-sm font-semibold mb-2">Total Commission</h3>
                  <p className="text-3xl font-bold">₹{totalCommission.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-r from-indigo-600/30 via-purple-500/20 to-pink-700/30 rounded-xl p-6 border border-indigo-800/40">
                  <h3 className="text-gray-300 text-sm font-semibold mb-2">Active Referrals</h3>
                  <p className="text-3xl font-bold">{activeReferrals}</p>
                </div>
                <div className="bg-gradient-to-r from-indigo-600/30 via-purple-500/20 to-pink-700/30 rounded-xl p-6 border border-indigo-800/40">
                  <h3 className="text-gray-300 text-sm font-semibold mb-2">Total Players Referred</h3>
                  <p className="text-3xl font-bold">{totalPlayersReferred}</p>
                </div>
              </div>

              {/* Recent Referrals */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h2 className="text-2xl font-bold mb-4">Recent Referrals</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4">Player Name</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Referral Date</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Total Spent</th>
                        <th className="text-left py-3 px-4">Commission</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referrals.map((referral) => (
                        <tr key={referral.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                          <td className="py-3 px-4">{referral.playerName}</td>
                          <td className="py-3 px-4 text-gray-400">{referral.playerEmail}</td>
                          <td className="py-3 px-4">{referral.referralDate}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-sm ${
                              referral.status === 'Active' 
                                ? 'bg-green-600/30 text-green-300' 
                                : 'bg-gray-600/30 text-gray-300'
                            }`}>
                              {referral.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">₹{referral.totalSpent.toLocaleString()}</td>
                          <td className="py-3 px-4 font-semibold text-green-400">
                            ₹{referral.commission.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeItem === 'Referrals' && (
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h2 className="text-2xl font-bold mb-4">All Referrals</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4">Player Name</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Referral Date</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Total Spent</th>
                        <th className="text-left py-3 px-4">Commission Rate</th>
                        <th className="text-left py-3 px-4">Commission</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referrals.map((referral) => (
                        <tr key={referral.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                          <td className="py-3 px-4">{referral.playerName}</td>
                          <td className="py-3 px-4 text-gray-400">{referral.playerEmail}</td>
                          <td className="py-3 px-4">{referral.referralDate}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-sm ${
                              referral.status === 'Active' 
                                ? 'bg-green-600/30 text-green-300' 
                                : 'bg-gray-600/30 text-gray-300'
                            }`}>
                              {referral.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">₹{referral.totalSpent.toLocaleString()}</td>
                          <td className="py-3 px-4">{referral.commissionRate}%</td>
                          <td className="py-3 px-4 font-semibold text-green-400">
                            ₹{referral.commission.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeItem === 'Commission Tracking' && (
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h2 className="text-2xl font-bold mb-4">Commission History</h2>
                <div className="space-y-4">
                  {referrals.map((referral) => (
                    <div key={referral.id} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{referral.playerName}</h3>
                          <p className="text-sm text-gray-400">{referral.referralDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-400">
                            ₹{referral.commission.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-400">
                            {referral.commissionRate}% of ₹{referral.totalSpent.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeItem === 'Player Activity' && (
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h2 className="text-2xl font-bold mb-4">Player Activity Overview</h2>
                <p className="text-gray-400 mb-4">
                  Track activity and spending of your referred players
                </p>
                <div className="space-y-4">
                  {referrals.map((referral) => (
                    <div key={referral.id} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">{referral.playerName}</h3>
                        <span className={`px-2 py-1 rounded text-sm ${
                          referral.status === 'Active' 
                            ? 'bg-green-600/30 text-green-300' 
                            : 'bg-gray-600/30 text-gray-300'
                        }`}>
                          {referral.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-400">Total Spent</p>
                          <p className="text-lg font-semibold">₹{referral.totalSpent.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Your Commission</p>
                          <p className="text-lg font-semibold text-green-400">
                            ₹{referral.commission.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeItem === 'Reports' && (
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h2 className="text-2xl font-bold mb-4">Affiliate Reports</h2>
                <div className="space-y-4">
                  <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
                    <h3 className="font-semibold mb-2">Monthly Commission Report</h3>
                    <p className="text-gray-400 text-sm">
                      View detailed commission breakdown for the current month
                    </p>
                    <button className="mt-3 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm">
                      Generate Report
                    </button>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
                    <h3 className="font-semibold mb-2">Referral Performance Report</h3>
                    <p className="text-gray-400 text-sm">
                      Analyze performance metrics of your referrals
                    </p>
                    <button className="mt-3 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm">
                      Generate Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}







