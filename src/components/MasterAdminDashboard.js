import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandingHeader from './BrandingHeader';

export default function MasterAdminDashboard() {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [clubs, setClubs] = useState([
    { id: 'club-01', name: 'Emerald Poker Mumbai', location: 'Mumbai, IN', rummyEnabled: false, subscription: 'active', terms: '', logoUrl: '', videoUrl: '', skinColor: '#10b981', gradient: 'from-emerald-600 via-green-500 to-teal-500' },
    { id: 'club-02', name: 'Teal Poker Bangalore', location: 'Bengaluru, IN', rummyEnabled: true, subscription: 'active', terms: '', logoUrl: '', videoUrl: '', skinColor: '#14b8a6', gradient: 'from-teal-600 via-cyan-500 to-blue-500' },
    { id: 'club-03', name: 'Cyan Poker Delhi', location: 'Delhi, IN', rummyEnabled: false, subscription: 'paused', terms: '', logoUrl: '', videoUrl: '', skinColor: '#06b6d4', gradient: 'from-cyan-600 via-blue-500 to-indigo-500' },
  ]);
  const [selectedClubId, setSelectedClubId] = useState('club-01');
  const selectedClub = clubs.find(c => c.id === selectedClubId) || clubs[0];

  const navigate = useNavigate();

  const menuItems = [
    'Dashboard',
    'Players',
    'Registered Players',
    'Clubs Management',
    'Rummy Settings',
    'Terms & Conditions',
    'Subscriptions',
    'Branding & Media',
    'Clients Management',
    'White-label Settings',
    'Analytics',
  ];

  // Helper function to get date/time strings
  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      full: now.toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
  };

  const getPreviousDayDateTime = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return {
      date: yesterday.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: yesterday.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      full: yesterday.toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
  };

  // Revenue, Rake, and Tips data with date/time
  const currentDateTime = getCurrentDateTime();
  const previousDateTime = getPreviousDayDateTime();
  
  const revenueData = {
    previousDay: {
      revenue: "₹1,25,000",
      rake: "₹12,500",
      tips: "₹8,450",
      date: previousDateTime.date,
      time: previousDateTime.time,
      lastUpdated: previousDateTime.full
    },
    currentDay: {
      revenue: "₹45,230",
      rake: "₹4,523",
      tips: "₹3,120",
      date: currentDateTime.date,
      time: currentDateTime.time,
      lastUpdated: currentDateTime.full
    }
  };

  // State for Players (KYC Pending) management
  const [playersSearch, setPlayersSearch] = useState("");
  const [playersFilter, setPlayersFilter] = useState({
    kycStatus: "pending",
    registrationDate: "all",
    documentType: "all"
  });
  
  // Mock players data with kycStatus: 'pending'
  const [allPlayers, setAllPlayers] = useState([
    {
      id: "P001",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+91 9876543210",
      kycStatus: "pending",
      registrationDate: "2024-01-15",
      documentType: "PAN Card",
      submittedDate: "2024-01-16",
      verificationNotes: ""
    },
    {
      id: "P002",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+91 9876543211",
      kycStatus: "pending",
      registrationDate: "2024-01-10",
      documentType: "Aadhaar Card",
      submittedDate: "2024-01-12",
      verificationNotes: ""
    },
    {
      id: "P003",
      name: "Rajesh Kumar",
      email: "rajesh.kumar@example.com",
      phone: "+91 9876543212",
      kycStatus: "pending",
      registrationDate: "2024-01-08",
      documentType: "Passport",
      submittedDate: "2024-01-09",
      verificationNotes: ""
    },
    {
      id: "P004",
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      phone: "+91 9876543213",
      kycStatus: "pending",
      registrationDate: "2024-01-20",
      documentType: "Driving License",
      submittedDate: "2024-01-21",
      verificationNotes: ""
    },
    {
      id: "P005",
      name: "Amit Patel",
      email: "amit.patel@example.com",
      phone: "+91 9876543214",
      kycStatus: "pending",
      registrationDate: "2024-01-18",
      documentType: "PAN Card",
      submittedDate: "2024-01-19",
      verificationNotes: ""
    }
  ]);

  // Filter players based on search and filters
  const filteredPlayers = allPlayers.filter(player => {
    if (player.kycStatus !== "pending") return false;
    if (playersSearch) {
      const searchLower = playersSearch.toLowerCase();
      const matchesSearch = 
        player.name.toLowerCase().includes(searchLower) ||
        player.email.toLowerCase().includes(searchLower) ||
        player.id.toLowerCase().includes(searchLower) ||
        player.phone.includes(playersSearch);
      if (!matchesSearch) return false;
    }
    if (playersFilter.documentType !== "all" && player.documentType !== playersFilter.documentType) {
      return false;
    }
    if (playersFilter.registrationDate !== "all") {
      const registrationDate = new Date(player.registrationDate);
      const now = new Date();
      const daysDiff = Math.floor((now - registrationDate) / (1000 * 60 * 60 * 24));
      if (playersFilter.registrationDate === "today" && daysDiff !== 0) return false;
      if (playersFilter.registrationDate === "week" && daysDiff > 7) return false;
      if (playersFilter.registrationDate === "month" && daysDiff > 30) return false;
    }
    return true;
  });

  // Handle KYC verification actions
  const handleKYCVerification = (playerId, action, notes = "") => {
    setAllPlayers(prev => prev.map(player => {
      if (player.id === playerId) {
        return {
          ...player,
          kycStatus: action === "approve" ? "approved" : action === "reject" ? "rejected" : player.kycStatus,
          verificationNotes: notes,
          verifiedDate: new Date().toISOString().split('T')[0]
        };
      }
      return player;
    }));
    alert(`KYC ${action === "approve" ? "approved" : action === "reject" ? "rejected" : "updated"} for ${playerId}`);
  };

  // State for Registered Players (Verified/Approved users)
  const [registeredPlayersSearch, setRegisteredPlayersSearch] = useState("");
  const [registeredPlayersFilter, setRegisteredPlayersFilter] = useState({
    status: "all",
    registrationDate: "all",
    documentType: "all",
    verifiedDate: "all"
  });
  const [selectedPlayerDetails, setSelectedPlayerDetails] = useState(null);

  // Mock registered/verified players data
  const [registeredPlayers, setRegisteredPlayers] = useState([
    {
      id: "P101",
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      phone: "+91 9876543215",
      kycStatus: "approved",
      registrationDate: "2024-01-05",
      documentType: "PAN Card",
      verifiedDate: "2024-01-06",
      verificationNotes: "All documents verified",
      accountStatus: "Active",
      totalGames: 45,
      lastActive: "2 hours ago",
      kycDocUrl: "/documents/pan_alex_johnson.pdf"
    },
    {
      id: "P102",
      name: "Maria Garcia",
      email: "maria.garcia@example.com",
      phone: "+91 9876543216",
      kycStatus: "approved",
      registrationDate: "2024-01-08",
      documentType: "Aadhaar Card",
      verifiedDate: "2024-01-09",
      verificationNotes: "Documents verified successfully",
      accountStatus: "Active",
      totalGames: 123,
      lastActive: "5 minutes ago",
      kycDocUrl: "/documents/aadhaar_maria_garcia.pdf"
    },
    {
      id: "P103",
      name: "Rajesh Kumar",
      email: "rajesh.kumar@example.com",
      phone: "+91 9876543217",
      kycStatus: "approved",
      registrationDate: "2024-01-10",
      documentType: "Passport",
      verifiedDate: "2024-01-11",
      verificationNotes: "Passport verified",
      accountStatus: "Suspended",
      totalGames: 67,
      lastActive: "3 days ago",
      kycDocUrl: "/documents/passport_rajesh_kumar.pdf"
    },
    {
      id: "P104",
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      phone: "+91 9876543218",
      kycStatus: "approved",
      registrationDate: "2024-01-12",
      documentType: "Driving License",
      verifiedDate: "2024-01-13",
      verificationNotes: "License verified",
      accountStatus: "Active",
      totalGames: 89,
      lastActive: "1 hour ago",
      kycDocUrl: "/documents/dl_priya_sharma.pdf"
    }
  ]);

  // Filter registered players
  const filteredRegisteredPlayers = registeredPlayers.filter(player => {
    if (registeredPlayersSearch) {
      const searchLower = registeredPlayersSearch.toLowerCase();
      const matchesSearch = 
        player.name.toLowerCase().includes(searchLower) ||
        player.email.toLowerCase().includes(searchLower) ||
        player.id.toLowerCase().includes(searchLower) ||
        player.phone.includes(registeredPlayersSearch);
      if (!matchesSearch) return false;
    }
    if (registeredPlayersFilter.status !== "all" && player.accountStatus !== registeredPlayersFilter.status) {
      return false;
    }
    if (registeredPlayersFilter.documentType !== "all" && player.documentType !== registeredPlayersFilter.documentType) {
      return false;
    }
    return true;
  });

  // Handle download KYC document
  const handleDownloadKYCDoc = (player) => {
    alert(`Downloading KYC document for ${player.name}...\nURL: ${player.kycDocUrl}`);
  };

  // Handle export CSV
  const handleExportCSV = () => {
    const csvContent = [
      ["Player ID", "Name", "Email", "Phone", "KYC Status", "Account Status", "Total Games"],
      ...filteredRegisteredPlayers.map(player => [
        player.id,
        player.name,
        player.email,
        player.phone,
        player.kycStatus,
        player.accountStatus,
        player.totalGames
      ])
    ].map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registered_players_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans">
      <div className="mx-auto max-w-[1400px] px-6 py-10 grid grid-cols-12 gap-8">
        <aside className="col-span-12 lg:col-span-3 xl:col-span-3 rounded-2xl bg-gradient-to-b from-emerald-500/20 via-teal-600/30 to-cyan-700/30 p-5 shadow-lg border border-gray-800 min-w-0">
          <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 drop-shadow-lg mb-6">
            Master Admin
          </div>
          <div className="flex items-center mb-6 text-white min-w-0">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-gray-900 font-bold text-sm">MA</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-semibold truncate">Client Super Admin</div>
              <div className="text-sm opacity-80 truncate">master@client.com</div>
            </div>
          </div>

          <nav className="space-y-3">
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setActiveItem(item);
                }}
                className={`w-full text-left rounded-xl px-4 py-3 font-medium transition-all duration-300 shadow-md ${
                  activeItem === item
                    ? 'bg-gradient-to-r from-emerald-400 to-cyan-600 text-gray-900 font-bold shadow-lg scale-[1.02]'
                    : 'bg-white/5 hover:bg-gradient-to-r hover:from-emerald-400/20 hover:to-cyan-500/20 text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <main className="col-span-12 lg:col-span-9 xl:col-span-9 space-y-8">
          <BrandingHeader title={`Master Admin - ${activeItem}`} subtitle="White-label control center" />

          {activeItem === 'Dashboard' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                  { title: 'Total Clubs', value: '12', color: 'from-emerald-400 via-teal-500 to-cyan-500' },
                  { title: 'Total Clients', value: '2,430', color: 'from-blue-400 via-indigo-500 to-purple-500' },
                  { title: 'Active Clubs', value: '9', color: 'from-green-400 via-emerald-500 to-teal-500' },
                  { title: 'Monthly Revenue', value: '₹3,42,120', color: 'from-yellow-400 via-orange-500 to-red-500' },
                ].map((card) => (
                  <div key={card.title} className={`p-6 rounded-xl bg-gradient-to-br ${card.color} text-gray-900 shadow-lg transition-transform transform hover:scale-105`}>
                    <div className="text-sm opacity-90 text-white/90">{card.title}</div>
                    <div className="text-3xl font-bold mt-2 text-white">{card.value}</div>
                    <div className="text-xs mt-1 text-white/70">Updated just now</div>
                  </div>
                ))}
              </div>

              {/* Revenue, Rake & Tips Overview */}
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-rose-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Revenue, Rake & Tips Overview - {selectedClub?.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  {/* Previous Day Revenue */}
                  <div className="bg-white/10 p-4 rounded-lg border border-purple-400/30">
                    <div className="text-sm text-gray-300 mb-1">Prev Day Revenue</div>
                    <div className="text-2xl font-bold text-white mb-2">{revenueData.previousDay.revenue}</div>
                    <div className="text-xs text-gray-400">
                      {revenueData.previousDay.date}
                    </div>
                  </div>

                  {/* Current Day Revenue */}
                  <div className="bg-white/10 p-4 rounded-lg border border-green-400/30">
                    <div className="text-sm text-gray-300 mb-1">Today's Revenue</div>
                    <div className="text-2xl font-bold text-white mb-2">{revenueData.currentDay.revenue}</div>
                    <div className="text-xs text-gray-400">
                      {revenueData.currentDay.date}
                    </div>
                  </div>

                  {/* Previous Day Rake */}
                  <div className="bg-white/10 p-4 rounded-lg border border-blue-400/30">
                    <div className="text-sm text-gray-300 mb-1">Prev Day Rake</div>
                    <div className="text-2xl font-bold text-white mb-2">{revenueData.previousDay.rake}</div>
                    <div className="text-xs text-gray-400">
                      {revenueData.previousDay.date}
                    </div>
                  </div>

                  {/* Current Day Rake */}
                  <div className="bg-white/10 p-4 rounded-lg border border-yellow-400/30">
                    <div className="text-sm text-gray-300 mb-1">Today's Rake</div>
                    <div className="text-2xl font-bold text-white mb-2">{revenueData.currentDay.rake}</div>
                    <div className="text-xs text-gray-400">
                      {revenueData.currentDay.date}
                    </div>
                  </div>

                  {/* Previous Day Tips */}
                  <div className="bg-white/10 p-4 rounded-lg border border-cyan-400/30">
                    <div className="text-sm text-gray-300 mb-1">Prev Day Tips</div>
                    <div className="text-2xl font-bold text-white mb-2">{revenueData.previousDay.tips}</div>
                    <div className="text-xs text-gray-400">
                      {revenueData.previousDay.date}
                    </div>
                  </div>

                  {/* Current Day Tips */}
                  <div className="bg-white/10 p-4 rounded-lg border border-orange-400/30">
                    <div className="text-sm text-gray-300 mb-1">Today's Tips</div>
                    <div className="text-2xl font-bold text-white mb-2">{revenueData.currentDay.tips}</div>
                    <div className="text-xs text-gray-400">
                      {revenueData.currentDay.date}
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-400">
                  Last Updated: {revenueData.currentDay.lastUpdated} | Data for {selectedClub?.name}
                </div>
              </section>

              <section className="p-6 bg-gradient-to-r from-emerald-600/30 via-teal-500/20 to-cyan-700/30 rounded-xl shadow-md border border-emerald-800/40">
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">Create Club</button>
                  <button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">Invite Client</button>
                  <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">Generate Report</button>
                </div>
              </section>
            </>
          )}

          {activeItem === 'Clubs Management' && (
            <section className="p-6 bg-gradient-to-r from-emerald-600/30 via-teal-500/20 to-cyan-700/30 rounded-xl shadow-md border border-emerald-800/40">
              <h2 className="text-xl font-bold text-white mb-6">Clubs Management</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Create New Club</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white text-sm">Club Name</label>
                      <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter club name" />
                    </div>
                    <div>
                      <label className="text-white text-sm">Location</label>
                      <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="City, Country" />
                    </div>
                    <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold shadow">Create Club</button>
                  </div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Existing Clubs</h3>
                  <div className="space-y-2">
                    {clubs.map((club) => (
                      <div key={club.id} className="bg-white/5 p-3 rounded border border-white/10 flex items-center justify-between">
                        <div className="text-white">{club.name} <span className="text-xs text-white/60">• {club.subscription}</span></div>
                        <div className="flex gap-2">
                          <button onClick={() => setSelectedClubId(club.id)} className={`px-3 py-1 rounded text-sm ${selectedClubId===club.id?'bg-emerald-600':'bg-blue-600 hover:bg-blue-500'} text-white`}>{selectedClubId===club.id?'Selected':'Select'}</button>
                          <button className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm">Manage</button>
                          <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeItem === 'Rummy Settings' && (
            <section className="p-6 bg-gradient-to-r from-emerald-600/30 via-teal-500/20 to-cyan-700/30 rounded-xl shadow-md border border-emerald-800/40">
              <h2 className="text-xl font-bold text-white mb-6">Rummy Mode Settings</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Club Selection</h3>
                  <select value={selectedClubId} onChange={(e)=>setSelectedClubId(e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white mb-4">
                    {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <div className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10">
                    <div className="flex-1">
                      <div className="text-white font-semibold mb-2">Enable Rummy Mode for {selectedClub?.name}</div>
                      <div className="text-xs text-white/70">
                        When enabled, the club's backend dashboard and player portal will show Rummy-specific features:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>UI labels change from "Poker Table" to "Rummy Table"</li>
                          <li>Table shape switches to round for Rummy tables</li>
                          <li>Rummy variants become available in table creation</li>
                          <li>Rummy-specific rules and gameplay features are enabled</li>
                        </ul>
                      </div>
                    </div>
                    <button 
                      onClick={()=>setClubs(prev=>prev.map(c=>c.id===selectedClubId?{...c,rummyEnabled:!c.rummyEnabled}:c))} 
                      className={`ml-4 px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
                        selectedClub?.rummyEnabled
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                          : 'bg-gray-600 hover:bg-gray-500 text-white'
                      }`}
                    >
                      {selectedClub?.rummyEnabled ? '✓ Enabled' : 'Disabled'}
                    </button>
                  </div>
                  <div className="mt-4 p-3 bg-blue-500/10 border border-blue-400/30 rounded-lg">
                    <div className="text-xs text-blue-300">
                      <strong>Note:</strong> Table creation and management is handled by club staff (Admin/Manager) in their respective portals, just like poker tables. This setting only enables/disables Rummy mode features for the club.
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Club Rummy Status</h3>
                  <div className="space-y-3">
                    {clubs.map(club => (
                      <div key={club.id} className="bg-white/5 p-3 rounded-lg border border-white/10 flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">{club.name}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {club.rummyEnabled ? (
                              <span className="text-green-400">Rummy Mode: Enabled</span>
                            ) : (
                              <span className="text-gray-400">Rummy Mode: Disabled</span>
                            )}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${
                          club.rummyEnabled 
                            ? 'bg-emerald-500/30 text-emerald-300' 
                            : 'bg-gray-500/30 text-gray-400'
                        }`}>
                          {club.rummyEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeItem === 'Terms & Conditions' && (
            <section className="p-6 bg-gradient-to-r from-gray-600/30 via-slate-500/20 to-gray-700/30 rounded-xl shadow-md border border-gray-800/40">
              <h2 className="text-xl font-bold text-white mb-6">Terms & Conditions (Per Club)</h2>
              <div className="bg-white/10 p-4 rounded-lg">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <select value={selectedClubId} onChange={(e)=>setSelectedClubId(e.target.value)} className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                    {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input id="tnc-link" type="url" className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Optional public URL" />
                  <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded">Upload / Save</button>
                </div>
                <textarea id="tnc-text" className="w-full mt-3 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" rows="6" placeholder="Paste Terms & Conditions here..." onBlur={()=>{
                  const area=document.getElementById('tnc-text');
                  const value = area && 'value' in area ? area.value : '';
                  setClubs(prev=>prev.map(c=>c.id===selectedClubId?{...c, terms:value}:c));
                }}></textarea>
                <div className="text-xs text-white/60 mt-2">Only Master Admin can manage club T&C.</div>
              </div>
            </section>
          )}

          {activeItem === 'Subscriptions' && (
            <section className="p-6 bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-orange-700/30 rounded-xl shadow-md border border-amber-800/40">
              <h2 className="text-xl font-bold text-white mb-6">Subscriptions</h2>
              <div className="space-y-2">
                {clubs.map(c => (
                  <div key={c.id} className="bg-white/10 p-3 rounded flex items-center justify-between">
                    <div className="text-white text-sm">{c.name} • <span className="text-white/70">{c.subscription}</span></div>
                    <div className="flex gap-2">
                      <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm" onClick={()=>setClubs(prev=>prev.map(x=>x.id===c.id?{...x, subscription:'killed'}:x))}>Kill</button>
                      <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm" onClick={()=>setClubs(prev=>prev.map(x=>x.id===c.id?{...x, subscription:'active'}:x))}>Activate</button>
                      <button className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm" onClick={()=>setClubs(prev=>prev.map(x=>x.id===c.id?{...x, subscription:'paused'}:x))}>Pause</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeItem === 'Branding & Media' && (
            <section className="p-6 bg-gradient-to-r from-indigo-600/30 via-purple-500/20 to-pink-700/30 rounded-xl shadow-md border border-indigo-800/40">
              <h2 className="text-xl font-bold text-white mb-6">Branding & Media (Per Club)</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/10 p-4 rounded-lg" key={selectedClubId}>
                  <h3 className="text-lg font-semibold text-white mb-4">Media Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white text-sm mb-2 block">Select Club</label>
                      <select value={selectedClubId} onChange={(e)=>setSelectedClubId(e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                        {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-white text-sm mb-2 block">Logo URL</label>
                      <input 
                        id="club-logo" 
                        type="url" 
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                        placeholder="Logo URL (png)" 
                        defaultValue={selectedClub?.logoUrl || ''}
                        key={`logo-${selectedClubId}`}
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm mb-2 block">Promo Video URL</label>
                      <input 
                        id="club-video" 
                        type="url" 
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                        placeholder="Promo Video URL (mp4)" 
                        defaultValue={selectedClub?.videoUrl || ''}
                        key={`video-${selectedClubId}`}
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm mb-2 block">Skin Color</label>
                      <div className="flex gap-2">
                        <input 
                          id="club-skin-color" 
                          type="color" 
                          className="w-20 h-10 bg-white/10 border border-white/20 rounded cursor-pointer" 
                          defaultValue={selectedClub?.skinColor || '#10b981'}
                          key={`color-${selectedClubId}`}
                          onChange={(e) => {
                            const textInput = document.getElementById('club-skin-color-text');
                            if (textInput) textInput.value = e.target.value;
                          }}
                        />
                        <input 
                          id="club-skin-color-text"
                          type="text" 
                          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          placeholder="#10b981" 
                          defaultValue={selectedClub?.skinColor || '#10b981'}
                          key={`color-text-${selectedClubId}`}
                          onChange={(e) => {
                            const colorInput = document.getElementById('club-skin-color');
                            if (colorInput && /^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                              colorInput.value = e.target.value;
                            }
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Primary theme color for the club</p>
                    </div>
                    <div>
                      <label className="text-white text-sm mb-2 block">Gradient Selection</label>
                      <select 
                        id="club-gradient" 
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        defaultValue={selectedClub?.gradient || 'from-emerald-600 via-green-500 to-teal-500'}
                        key={`gradient-${selectedClubId}`}
                      >
                        <option value="from-emerald-600 via-green-500 to-teal-500">Emerald → Green → Teal</option>
                        <option value="from-teal-600 via-cyan-500 to-blue-500">Teal → Cyan → Blue</option>
                        <option value="from-cyan-600 via-blue-500 to-indigo-500">Cyan → Blue → Indigo</option>
                        <option value="from-blue-600 via-indigo-500 to-purple-500">Blue → Indigo → Purple</option>
                        <option value="from-purple-600 via-pink-500 to-rose-500">Purple → Pink → Rose</option>
                        <option value="from-pink-600 via-red-500 to-orange-500">Pink → Red → Orange</option>
                        <option value="from-red-600 via-orange-500 to-yellow-500">Red → Orange → Yellow</option>
                        <option value="from-orange-600 via-yellow-500 to-lime-500">Orange → Yellow → Lime</option>
                        <option value="from-yellow-600 via-lime-500 to-green-500">Yellow → Lime → Green</option>
                        <option value="from-indigo-600 via-purple-500 to-pink-500">Indigo → Purple → Pink</option>
                        <option value="from-gray-600 via-slate-500 to-zinc-500">Gray → Slate → Zinc</option>
                        <option value="from-slate-600 via-gray-500 to-neutral-500">Slate → Gray → Neutral</option>
                      </select>
                      <p className="text-xs text-gray-400 mt-1">Gradient theme for club branding</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold" onClick={()=>{
                        const logo = document.getElementById('club-logo');
                        const video = document.getElementById('club-video');
                        const skinColor = document.getElementById('club-skin-color');
                        const gradient = document.getElementById('club-gradient');
                        const logoUrl = logo && 'value' in logo ? logo.value : '';
                        const videoUrl = video && 'value' in video ? video.value : '';
                        const skinColorValue = skinColor && 'value' in skinColor ? skinColor.value : selectedClub?.skinColor || '#10b981';
                        const gradientValue = gradient && 'value' in gradient ? gradient.value : selectedClub?.gradient || 'from-emerald-600 via-green-500 to-teal-500';
                        setClubs(prev=>prev.map(c=>c.id===selectedClubId?{...c, logoUrl, videoUrl, skinColor: skinColorValue, gradient: gradientValue}:c));
                        alert(`Branding settings saved for ${selectedClub?.name}`);
                      }}>Save Settings</button>
                      <button className="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold" onClick={()=>{
                        if (!window.confirm('Reset all player-facing data for this club?')) return;
                        setClubs(prev=>prev.map(c=>c.id===selectedClubId?{...c, terms:'', logoUrl:'', videoUrl:'', skinColor: '#10b981', gradient: 'from-emerald-600 via-green-500 to-teal-500'}:c));
                        // Reset form inputs
                        const logo = document.getElementById('club-logo');
                        const video = document.getElementById('club-video');
                        const skinColor = document.getElementById('club-skin-color');
                        const gradient = document.getElementById('club-gradient');
                        if (logo) logo.value = '';
                        if (video) video.value = '';
                        if (skinColor) skinColor.value = '#10b981';
                        if (gradient) gradient.value = 'from-emerald-600 via-green-500 to-teal-500';
                      }}>Reset</button>
                    </div>
                    <div className="text-xs text-white/70 bg-white/5 p-2 rounded">Only Master Admin can change logo/video/skin/gradient.</div>
                  </div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Live Preview</h3>
                  <div className={`p-6 rounded-xl bg-gradient-to-r ${selectedClub?.gradient || 'from-emerald-600 via-green-500 to-teal-500'} border border-white/20 shadow-lg`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded bg-white/20 border border-white/30 flex items-center justify-center text-xs">
                        {selectedClub?.logoUrl ? 'IMG' : 'LOGO'}
                      </div>
                      <div className="text-white font-bold text-xl">{selectedClub?.name}</div>
                    </div>
                    <div className="space-y-2 text-sm text-white/90">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Logo:</span>
                        <span className="text-xs">{selectedClub?.logoUrl || 'Not set'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Video:</span>
                        <span className="text-xs">{selectedClub?.videoUrl || 'Not set'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Skin Color:</span>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded border-2 border-white/50" 
                            style={{ backgroundColor: selectedClub?.skinColor || '#10b981' }}
                          ></div>
                          <span className="text-xs">{selectedClub?.skinColor || '#10b981'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Gradient:</span>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded">
                          {selectedClub?.gradient?.replace(/from-|via-|to-/g, '').replace(/-600|-500/g, '') || 'Default'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <p className="text-xs text-white/70">This preview shows how the branding will appear in the player portal and club dashboards.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeItem === 'Clients Management' && (
            <section className="p-6 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-purple-700/30 rounded-xl shadow-md border border-blue-800/40">
              <h2 className="text-xl font-bold text-white mb-6">Clients Management</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Invite Client</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white text-sm">Client Email</label>
                      <input type="email" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="client@example.com" />
                    </div>
                    <div>
                      <label className="text-white text-sm">Assign Club</label>
                      <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                        <option>Emerald Poker Mumbai</option>
                        <option>Teal Poker Bangalore</option>
                        <option>Cyan Poker Delhi</option>
                      </select>
                    </div>
                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold shadow">Send Invite</button>
                  </div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Client Directory</h3>
                  <div className="space-y-2">
                    {[
                      { name: 'Rohit Sharma', club: 'Emerald Poker Mumbai' },
                      { name: 'Ananya Rao', club: 'Teal Poker Bangalore' },
                      { name: 'Aman Khan', club: 'Cyan Poker Delhi' },
                    ].map((client) => (
                      <div key={client.name} className="bg-white/5 p-3 rounded border border-white/10 flex items-center justify-between">
                        <div className="text-white">
                          <div className="font-semibold">{client.name}</div>
                          <div className="text-xs text-gray-300">{client.club}</div>
                        </div>
                        <div className="flex gap-2">
                          <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">Edit</button>
                          <button className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm">Reassign</button>
                          <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeItem === 'White-label Settings' && (
            <section className="p-6 bg-gradient-to-r from-gray-600/30 via-slate-500/20 to-gray-700/30 rounded-xl shadow-md border border-gray-800/40">
              <h2 className="text-xl font-bold text-white mb-6">White-label Settings</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Brand Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white text-sm">Brand Name</label>
                      <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter brand name" />
                    </div>
                    <div>
                      <label className="text-white text-sm">Primary Color</label>
                      <input type="color" className="w-full h-10 mt-1 bg-white/10 border border-white/20 rounded" />
                    </div>
                    <div>
                      <label className="text-white text-sm">Secondary Color</label>
                      <input type="color" className="w-full h-10 mt-1 bg-white/10 border border-white/20 rounded" />
                    </div>
                    <div>
                      <label className="text-white text-sm">Logo URL (optional)</label>
                      <input type="url" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="https://example.com/logo.png" />
                    </div>
                    <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold shadow">Save Settings</button>
                  </div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Brand Preview</h3>
                  <div className="p-6 rounded-xl bg-gradient-to-r from-emerald-600 via-green-500 to-yellow-400 border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded bg-white/20 border border-white/30 flex items-center justify-center">LOGO</div>
                      <div className="text-white font-bold text-xl">Brand Name</div>
                    </div>
                    <p className="text-white/80 text-sm mt-3">This is a live preview of your white-label header.</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Players - KYC Pending Review */}
          {activeItem === 'Players' && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Players - KYC Pending Review</h2>
                
                {/* Search and Filters */}
                <div className="bg-white/10 p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <label className="text-white text-sm mb-1 block">Search</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                        placeholder="Search by name, email, ID, or phone" 
                        value={playersSearch}
                        onChange={(e) => setPlayersSearch(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm mb-1 block">Registration Date</label>
                      <select 
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        value={playersFilter.registrationDate}
                        onChange={(e) => setPlayersFilter({...playersFilter, registrationDate: e.target.value})}
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-white text-sm mb-1 block">Document Type</label>
                      <select 
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        value={playersFilter.documentType}
                        onChange={(e) => setPlayersFilter({...playersFilter, documentType: e.target.value})}
                      >
                        <option value="all">All Types</option>
                        <option value="PAN Card">PAN Card</option>
                        <option value="Aadhaar Card">Aadhaar Card</option>
                        <option value="Passport">Passport</option>
                        <option value="Driving License">Driving License</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Players List */}
                <div className="bg-white/10 p-4 rounded-lg">
                  {filteredPlayers.length > 0 ? (
                    <div className="space-y-4">
                      {filteredPlayers.map(player => (
                        <div key={player.id} className="bg-white/5 p-4 rounded-lg border border-yellow-400/30">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-8">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="font-semibold text-white text-lg">{player.name}</div>
                                <span className="bg-yellow-500/30 text-yellow-300 px-2 py-1 rounded text-xs">KYC Pending</span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-300">
                                <div>Player ID: <span className="text-white">{player.id}</span></div>
                                <div>Email: <span className="text-white">{player.email}</span></div>
                                <div>Phone: <span className="text-white">{player.phone}</span></div>
                                <div>Document: <span className="text-white">{player.documentType}</span></div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-300">
                                <div>Registered: {new Date(player.registrationDate).toLocaleDateString()}</div>
                                <div>Submitted: {new Date(player.submittedDate).toLocaleDateString()}</div>
                                <div className="md:col-span-2">Days Pending: {Math.floor((new Date() - new Date(player.submittedDate)) / (1000 * 60 * 60 * 24))} days</div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="md:col-span-4 flex flex-col gap-2">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleKYCVerification(player.id, "approve")}
                                  className="flex-1 bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                                >
                                  ✓ Approve
                                </button>
                                <button 
                                  onClick={() => {
                                    const notes = prompt("Enter rejection reason (optional):");
                                    if (notes !== null) {
                                      handleKYCVerification(player.id, "reject", notes);
                                    }
                                  }}
                                  className="flex-1 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                                >
                                  ✗ Reject
                                </button>
                              </div>
                              <button 
                                onClick={() => alert(`View KYC documents for ${player.name}`)}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                              >
                                📄 View Documents
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      No pending KYC verification requests found
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* Registered Players */}
          {activeItem === 'Registered Players' && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-purple-700/30 rounded-xl shadow-md border border-blue-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Registered Players - Verified Users</h2>
                
                {/* Search and Filters */}
                <div className="bg-white/10 p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <label className="text-white text-sm mb-1 block">Search</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                        placeholder="Search by name, email, ID, or phone" 
                        value={registeredPlayersSearch}
                        onChange={(e) => setRegisteredPlayersSearch(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm mb-1 block">Account Status</label>
                      <select 
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        value={registeredPlayersFilter.status}
                        onChange={(e) => setRegisteredPlayersFilter({...registeredPlayersFilter, status: e.target.value})}
                      >
                        <option value="all">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-white text-sm mb-1 block">Document Type</label>
                      <select 
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        value={registeredPlayersFilter.documentType}
                        onChange={(e) => setRegisteredPlayersFilter({...registeredPlayersFilter, documentType: e.target.value})}
                      >
                        <option value="all">All Types</option>
                        <option value="PAN Card">PAN Card</option>
                        <option value="Aadhaar Card">Aadhaar Card</option>
                        <option value="Passport">Passport</option>
                        <option value="Driving License">Driving License</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button 
                        onClick={handleExportCSV}
                        className="w-full bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                      >
                        📥 Export CSV
                      </button>
                    </div>
                  </div>
                </div>

                {/* Players List */}
                <div className="bg-white/10 p-4 rounded-lg">
                  {filteredRegisteredPlayers.length > 0 ? (
                    <div className="space-y-3">
                      {filteredRegisteredPlayers.map(player => (
                        <div key={player.id} className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-8">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="font-semibold text-white text-lg">{player.name}</div>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  player.accountStatus === "Active" 
                                    ? "bg-green-500/30 text-green-300" 
                                    : player.accountStatus === "Suspended"
                                    ? "bg-red-500/30 text-red-300"
                                    : "bg-gray-500/30 text-gray-300"
                                }`}>
                                  {player.accountStatus}
                                </span>
                                <span className="bg-blue-500/30 text-blue-300 px-2 py-1 rounded text-xs">KYC Verified</span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-300">
                                <div>Player ID: <span className="text-white">{player.id}</span></div>
                                <div>Email: <span className="text-white">{player.email}</span></div>
                                <div>Phone: <span className="text-white">{player.phone}</span></div>
                                <div>Total Games: <span className="text-white">{player.totalGames}</span></div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-400 mt-1">
                                <div>Registered: {new Date(player.registrationDate).toLocaleDateString()}</div>
                                <div>Verified: {new Date(player.verifiedDate).toLocaleDateString()}</div>
                                <div>Last Active: {player.lastActive}</div>
                                <div>Document: {player.documentType}</div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="md:col-span-4 flex flex-col gap-2">
                              <button 
                                onClick={() => setSelectedPlayerDetails(player)}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                              >
                                📋 View Details
                              </button>
                              <button 
                                onClick={() => handleDownloadKYCDoc(player)}
                                className="w-full bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                              >
                                📄 Download KYC
                              </button>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => alert(`${player.accountStatus === "Active" ? "Suspend" : "Activate"} ${player.name}?`)}
                                  className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                                >
                                  {player.accountStatus === "Active" ? "Suspend" : "Activate"}
                                </button>
                                <button 
                                  onClick={() => {
                                    if (window.confirm(`Delete ${player.name}?`)) {
                                      alert("Player deleted");
                                    }
                                  }}
                                  className="flex-1 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      No registered players found
                    </div>
                  )}
                </div>
              </section>

              {/* Player Details Modal */}
              {selectedPlayerDetails && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold text-white">Player Details</h2>
                      <button 
                        onClick={() => setSelectedPlayerDetails(null)}
                        className="text-white hover:text-red-400 text-2xl"
                      >
                        ×
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-gray-400 text-sm">Player ID</label>
                          <div className="text-white font-semibold">{selectedPlayerDetails.id}</div>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Name</label>
                          <div className="text-white font-semibold">{selectedPlayerDetails.name}</div>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Email</label>
                          <div className="text-white">{selectedPlayerDetails.email}</div>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Phone</label>
                          <div className="text-white">{selectedPlayerDetails.phone}</div>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Account Status</label>
                          <div className={`inline-block px-2 py-1 rounded text-xs ${
                            selectedPlayerDetails.accountStatus === "Active" 
                              ? "bg-green-500/30 text-green-300" 
                              : "bg-red-500/30 text-red-300"
                          }`}>
                            {selectedPlayerDetails.accountStatus}
                          </div>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Total Games</label>
                          <div className="text-white">{selectedPlayerDetails.totalGames}</div>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Last Active</label>
                          <div className="text-white">{selectedPlayerDetails.lastActive}</div>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Document Type</label>
                          <div className="text-white">{selectedPlayerDetails.documentType}</div>
                        </div>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Verification Notes</label>
                        <div className="text-white bg-white/5 p-3 rounded">{selectedPlayerDetails.verificationNotes || "No notes"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeItem === 'Reports' && (
            <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-red-700/30 rounded-xl shadow-md border border-purple-800/40">
              <h2 className="text-xl font-bold text-white mb-6">Reports</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Club Activity</h3>
                  <div className="space-y-2">
                    <div className="bg-white/5 p-3 rounded">
                      <div className="text-sm text-gray-300">Active Clubs Today: 9</div>
                      <div className="text-sm text-gray-300">New Clients This Week: 42</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Revenue</h3>
                  <div className="space-y-2">
                    <div className="bg-white/5 p-3 rounded">
                      <div className="text-sm text-gray-300">Today: ₹14,520</div>
                      <div className="text-sm text-gray-300">This Week: ₹92,330</div>
                      <div className="text-sm text-gray-300">This Month: ₹3,42,120</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Exports</h3>
                  <div className="space-y-2">
                    <button className="w-full bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded text-sm">Export CSV</button>
                    <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-sm">Export PDF</button>
                    <button className="w-full bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded text-sm">Generate Report</button>
                  </div>
                </div>
              </div>
            </section>
          )}

          <div className="flex gap-3">
            <button onClick={() => navigate('/manager')} className="bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-lg shadow">Manager Portal</button>
            <button onClick={() => navigate('/admin/signin')} className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow">System Admin</button>
          </div>
        </main>
      </div>
    </div>
  );
}


