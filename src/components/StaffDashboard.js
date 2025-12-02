import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [staffInfo, setStaffInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const loadStaffData = async () => {
      try {
        const staffStr = localStorage.getItem('staff');
        if (!staffStr) {
          navigate('/staff/signin');
          return;
        }

        const staff = JSON.parse(staffStr);
        setStaffInfo(staff);
      } catch (err) {
        console.error('Failed to load staff data:', err);
        navigate('/staff/signin');
      } finally {
        setLoading(false);
      }
    };

    loadStaffData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('staff');
    navigate('/staff/signin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!staffInfo) {
    return null;
  }

  const staffRole = staffInfo.role || 'STAFF';

  // Role-based dashboard configuration
  const getRoleConfig = () => {
    switch (staffRole) {
      case 'GRE':
        return {
          title: 'Guest Relations Executive Dashboard',
          color: 'from-cyan-600/30 via-blue-500/20 to-indigo-700/30',
          borderColor: 'border-cyan-800/40',
          tabs: ['Dashboard', 'Waitlist', 'Player Check-in', 'Guest Services'],
          icon: '👋'
        };
      case 'Dealer':
        return {
          title: 'Dealer Dashboard',
          color: 'from-yellow-600/30 via-amber-500/20 to-orange-700/30',
          borderColor: 'border-yellow-800/40',
          tabs: ['Dashboard', 'Active Tables', 'Game Management', 'Tips'],
          icon: '🎰'
        };
      case 'Cashier':
        return {
          title: 'Cashier Dashboard',
          color: 'from-green-600/30 via-emerald-500/20 to-teal-700/30',
          borderColor: 'border-green-800/40',
          tabs: ['Dashboard', 'Transactions', 'Credit Requests', 'Player Accounts'],
          icon: '💰'
        };
      case 'HR':
        return {
          title: 'HR Dashboard',
          color: 'from-blue-600/30 via-indigo-500/20 to-purple-700/30',
          borderColor: 'border-blue-800/40',
          tabs: ['Dashboard', 'Staff Management', 'Schedules', 'Payroll'],
          icon: '👥'
        };
      case 'Manager':
        return {
          title: 'Manager Dashboard',
          color: 'from-purple-600/30 via-pink-500/20 to-red-700/30',
          borderColor: 'border-purple-800/40',
          tabs: ['Dashboard', 'Operations', 'Staff Overview', 'Reports'],
          icon: '📊'
        };
      default:
        return {
          title: 'Staff Dashboard',
          color: 'from-gray-600/30 via-gray-500/20 to-gray-700/30',
          borderColor: 'border-gray-800/40',
          tabs: ['Dashboard'],
          icon: '👤'
        };
    }
  };

  const roleConfig = getRoleConfig();

  // Render role-specific content
  const renderRoleContent = () => {
    switch (staffRole) {
      case 'GRE':
        return renderGREDashboard();
      case 'Dealer':
        return renderDealerDashboard();
      case 'Cashier':
        return renderCashierDashboard();
      case 'HR':
        return renderHRDashboard();
      case 'Manager':
        return renderManagerDashboard();
      default:
        return renderDefaultDashboard();
    }
  };

  const renderGREDashboard = () => {
    if (activeTab === 'Dashboard') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="text-white/60 text-sm">Active Waitlist</div>
              <div className="text-2xl font-bold text-white mt-2">12</div>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="text-white/60 text-sm">Checked In Today</div>
              <div className="text-2xl font-bold text-white mt-2">45</div>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="text-white/60 text-sm">VIP Guests</div>
              <div className="text-2xl font-bold text-white mt-2">8</div>
            </div>
          </div>
          <div className="bg-white/10 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Check-ins</h3>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/5 p-3 rounded flex justify-between items-center">
                  <div>
                    <div className="text-white font-medium">Player {i}</div>
                    <div className="text-white/60 text-sm">Checked in 10 minutes ago</div>
                  </div>
                  <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded text-sm">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    // Add other GRE tabs here
    return <div className="text-white">GRE {activeTab} content</div>;
  };

  const renderDealerDashboard = () => {
    if (activeTab === 'Dashboard') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="text-white/60 text-sm">Active Tables</div>
              <div className="text-2xl font-bold text-white mt-2">3</div>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="text-white/60 text-sm">Total Tips Today</div>
              <div className="text-2xl font-bold text-white mt-2">₹2,450</div>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="text-white/60 text-sm">Games Dealt</div>
              <div className="text-2xl font-bold text-white mt-2">127</div>
            </div>
          </div>
          <div className="bg-white/10 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">My Active Tables</h3>
            <div className="space-y-2">
              {['Table 1 - NLH', 'Table 3 - PLO', 'Table 5 - NLH'].map((table, i) => (
                <div key={i} className="bg-white/5 p-3 rounded flex justify-between items-center">
                  <div>
                    <div className="text-white font-medium">{table}</div>
                    <div className="text-white/60 text-sm">6/9 players • ₹50/₹100 blinds</div>
                  </div>
                  <button className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded text-sm">
                    Manage Table
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return <div className="text-white">Dealer {activeTab} content</div>;
  };

  const renderCashierDashboard = () => {
    if (activeTab === 'Dashboard') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="text-white/60 text-sm">Transactions Today</div>
              <div className="text-2xl font-bold text-white mt-2">42</div>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="text-white/60 text-sm">Total Amount</div>
              <div className="text-2xl font-bold text-white mt-2">₹1,25,000</div>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="text-white/60 text-sm">Pending Requests</div>
              <div className="text-2xl font-bold text-white mt-2">5</div>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="text-white/60 text-sm">Active Accounts</div>
              <div className="text-2xl font-bold text-white mt-2">38</div>
            </div>
          </div>
          <div className="bg-white/10 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
            <div className="space-y-2">
              {[
                { player: 'John Doe', type: 'Credit', amount: '₹5,000', time: '10 min ago' },
                { player: 'Jane Smith', type: 'Debit', amount: '₹2,500', time: '25 min ago' },
                { player: 'Mike Johnson', type: 'Credit', amount: '₹10,000', time: '1 hour ago' }
              ].map((txn, i) => (
                <div key={i} className="bg-white/5 p-3 rounded flex justify-between items-center">
                  <div>
                    <div className="text-white font-medium">{txn.player}</div>
                    <div className="text-white/60 text-sm">{txn.type} • {txn.time}</div>
                  </div>
                  <div className={`font-semibold ${txn.type === 'Credit' ? 'text-green-400' : 'text-red-400'}`}>
                    {txn.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return <div className="text-white">Cashier {activeTab} content</div>;
  };

  const renderHRDashboard = () => {
    if (activeTab === 'Dashboard') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="text-white/60 text-sm">Total Staff</div>
              <div className="text-2xl font-bold text-white mt-2">28</div>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="text-white/60 text-sm">Active Today</div>
              <div className="text-2xl font-bold text-white mt-2">22</div>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="text-white/60 text-sm">On Leave</div>
              <div className="text-2xl font-bold text-white mt-2">3</div>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="text-white/60 text-sm">Pending Requests</div>
              <div className="text-2xl font-bold text-white mt-2">5</div>
            </div>
          </div>
          <div className="bg-white/10 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Staff Overview</h3>
            <div className="text-white/60">Staff management and scheduling features</div>
          </div>
        </div>
      );
    }
    return <div className="text-white">HR {activeTab} content</div>;
  };

  const renderManagerDashboard = () => {
    if (activeTab === 'Dashboard') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="text-white/60 text-sm">Revenue Today</div>
              <div className="text-2xl font-bold text-white mt-2">₹2,45,000</div>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="text-white/60 text-sm">Active Tables</div>
              <div className="text-2xl font-bold text-white mt-2">12</div>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="text-white/60 text-sm">Total Players</div>
              <div className="text-2xl font-bold text-white mt-2">89</div>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="text-white/60 text-sm">Staff On Duty</div>
              <div className="text-2xl font-bold text-white mt-2">18</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Operations Overview</h3>
              <div className="text-white/60">Real-time operations monitoring</div>
            </div>
            <div className="bg-white/10 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded text-sm">
                  View Reports
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded text-sm">
                  Manage Staff
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return <div className="text-white">Manager {activeTab} content</div>;
  };

  const renderDefaultDashboard = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white/10 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Welcome, {staffInfo.name}!</h3>
          <div className="text-white/60">Your staff dashboard</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className={`bg-gradient-to-r ${roleConfig.color} border-b ${roleConfig.borderColor} p-4`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-3xl">{roleConfig.icon}</div>
            <div>
              <h1 className="text-2xl font-bold text-white">{roleConfig.title}</h1>
              <p className="text-white/80 text-sm">{staffInfo.name} • {staffInfo.employeeId || 'No ID'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex gap-2 p-4">
          {roleConfig.tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === tab
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {renderRoleContent()}
      </main>
    </div>
  );
}







