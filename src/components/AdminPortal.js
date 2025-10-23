import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminPortal() {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const navigate = useNavigate();

  const menuItems = [
    "Dashboard",
    "Player Management", 
    "Table Management",
    "Tournament Management",
    "Dealer Management",
    "Player Acquisition",
    "Credit Management",
    "Reports & Analytics",
    "Session Control",
    "Seating Management",
    "System Settings"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans">
      <div className="mx-auto max-w-[1600px] px-6 py-10 grid grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-3 xl:col-span-3 rounded-2xl bg-gradient-to-b from-red-500/20 via-purple-600/30 to-indigo-700/30 p-5 shadow-lg border border-gray-800">
          <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-purple-300 to-indigo-400 drop-shadow-lg mb-6">
            Super Admin Portal
          </div>
          <div className="bg-white/10 rounded-xl p-4 mb-6 text-white shadow-inner">
            <div className="text-lg font-semibold">System Administrator</div>
            <div className="text-sm opacity-80">admin@pokerroom.com</div>
          </div>

          {/* Sidebar Menu */}
          <nav className="space-y-3">
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveItem(item)}
                className={`w-full text-left rounded-xl px-4 py-3 font-medium transition-all duration-300 shadow-md ${
                  activeItem === item
                    ? "bg-gradient-to-r from-red-400 to-purple-600 text-white font-bold shadow-lg scale-[1.02]"
                    : "bg-white/5 hover:bg-gradient-to-r hover:from-red-400/20 hover:to-purple-500/20 text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Section */}
        <main className="col-span-12 lg:col-span-9 xl:col-span-9 space-y-8">
          {/* Header */}
          <header className="bg-gradient-to-r from-red-600 via-purple-500 to-indigo-400 p-6 rounded-xl shadow-md flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Super Admin Portal - {activeItem}</h1>
              <p className="text-gray-200 mt-1">Complete system management and control</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => navigate("/manager")}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
              >
                Manager Portal
              </button>
              <button 
                onClick={() => navigate("/fnb/signin")}
                className="bg-orange-600 hover:bg-orange-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
              >
                FNB Portal
              </button>
              <button className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow">
                Sign Out
              </button>
            </div>
          </header>

          {/* Dashboard Content */}
          {activeItem === "Dashboard" && (
            <>
              {/* Admin Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                  { title: "Active Tables", value: "12", color: "from-red-400 via-orange-500 to-yellow-500" },
                  { title: "Total Players", value: "1,247", color: "from-green-400 via-emerald-500 to-teal-500" },
                  { title: "Active Dealers", value: "8", color: "from-blue-400 via-indigo-500 to-violet-500" },
                  { title: "Daily Revenue", value: "₹45,230", color: "from-purple-400 via-pink-500 to-rose-500" },
                ].map((card, i) => (
                  <div
                    key={i}
                    className={`p-6 rounded-xl bg-gradient-to-br ${card.color} text-gray-900 shadow-lg transition-transform transform hover:scale-105`}
                  >
                    <div className="text-sm opacity-90 text-white/90">{card.title}</div>
                    <div className="text-3xl font-bold mt-2 text-white">{card.value}</div>
                    <div className="text-xs mt-1 text-white/70">Updated just now</div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <section className="p-6 bg-gradient-to-r from-purple-400/30 via-indigo-500/20 to-blue-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 text-white px-4 py-3 rounded-xl font-semibold shadow transition">
                    Create Table
                  </button>
                  <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-4 py-3 rounded-xl font-semibold shadow transition">
                    Add Dealer
                  </button>
                  <button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white px-4 py-3 rounded-xl font-semibold shadow transition">
                    Generate Report
                  </button>
                  <button className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white px-4 py-3 rounded-xl font-semibold shadow transition">
                    Send Promotions
                  </button>
                </div>
              </section>

              {/* System Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="p-6 bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl shadow-lg border border-gray-700">
                  <h2 className="text-lg font-semibold text-white mb-4">System Status</h2>
                  <div className="space-y-3">
                    {["Database Operational", "Payment Gateway Active", "KYC System Running", "Notification Service Online", "Backup System Active"].map((item, i) => (
                      <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                        <span className="text-white">{item}</span>
                        <span className="text-green-400 text-sm">✓ Active</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="p-6 bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl shadow-lg border border-gray-700">
                  <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
                  <div className="space-y-3">
                    <div className="bg-green-500/20 p-3 rounded-lg border border-green-400/30">
                      <div className="text-sm text-green-300">New player registered</div>
                      <div className="text-white font-semibold">John Doe - 2 minutes ago</div>
                    </div>
                    <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-400/30">
                      <div className="text-sm text-blue-300">Table created</div>
                      <div className="text-white font-semibold">Texas Hold'em Table 5 - 5 minutes ago</div>
                    </div>
                    <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-400/30">
                      <div className="text-sm text-yellow-300">KYC approved</div>
                      <div className="text-white font-semibold">Jane Smith - 10 minutes ago</div>
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}

        {/* Credit Management */}
        {activeItem === "Credit Management" && (
          <div className="space-y-6">
            <section className="p-6 bg-gradient-to-r from-emerald-600/30 via-green-500/20 to-teal-700/30 rounded-xl shadow-md border border-emerald-800/40">
              <h2 className="text-xl font-bold text-white mb-6">Credit Management</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Adjust Player Credit</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-white text-sm">Player ID</label>
                      <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter Player ID" />
                    </div>
                    <div>
                      <label className="text-white text-sm">Amount (₹)</label>
                      <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="0" />
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">Add Credit</button>
                      <button className="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">Deduct Credit</button>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Credit History</h3>
                  <div className="space-y-2">
                    {[{id:'P001',action:'Add',amt:'₹5,000'},{id:'P002',action:'Deduct',amt:'₹1,000'}].map((t,i)=>(
                      <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded">
                        <span className="text-white">{t.id} - {t.action}</span>
                        <span className="text-green-300 text-sm">{t.amt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

          {/* Player Management */}
          {activeItem === "Player Management" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Player Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Player Actions</h3>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input type="text" className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Search by Player ID/Name" />
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                          Search
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg font-semibold text-sm">
                          Block Player
                        </button>
                        <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg font-semibold text-sm">
                          Unblock Player
                        </button>
                        <button className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-2 rounded-lg font-semibold text-sm">
                          Reset Status
                        </button>
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg font-semibold text-sm">
                          View History
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Player Statistics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-white/5 p-2 rounded">
                        <span className="text-white">Total Players</span>
                        <span className="text-green-400 font-bold">1,247</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/5 p-2 rounded">
                        <span className="text-white">Active Players</span>
                        <span className="text-blue-400 font-bold">892</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/5 p-2 rounded">
                        <span className="text-white">Blocked Players</span>
                        <span className="text-red-400 font-bold">23</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/5 p-2 rounded">
                        <span className="text-white">Pending KYC</span>
                        <span className="text-yellow-400 font-bold">15</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-6 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-purple-700/30 rounded-xl shadow-md border border-blue-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Player List</h2>
                <div className="bg-white/5 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-6 gap-4 p-4 bg-white/10 text-sm font-semibold text-white">
                    <div>Player ID</div>
                    <div>Name</div>
                    <div>Status</div>
                    <div>Last Active</div>
                    <div>Total Games</div>
                    <div>Actions</div>
                  </div>
                  {[
                    { id: "P001", name: "John Doe", status: "Active", lastActive: "2 min ago", games: 45 },
                    { id: "P002", name: "Jane Smith", status: "Blocked", lastActive: "1 day ago", games: 23 },
                    { id: "P003", name: "Mike Johnson", status: "Active", lastActive: "5 min ago", games: 67 },
                    { id: "P004", name: "Sarah Wilson", status: "Pending KYC", lastActive: "Never", games: 0 },
                  ].map((player, i) => (
                    <div key={i} className="grid grid-cols-6 gap-4 p-4 border-t border-white/10">
                      <div className="text-white">{player.id}</div>
                      <div className="text-white">{player.name}</div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        player.status === "Active" ? "bg-green-500/30 text-green-300" :
                        player.status === "Blocked" ? "bg-red-500/30 text-red-300" :
                        "bg-yellow-500/30 text-yellow-300"
                      }`}>
                        {player.status}
                      </div>
                      <div className="text-gray-300">{player.lastActive}</div>
                      <div className="text-white">{player.games}</div>
                      <div className="flex gap-1">
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs">
                          View
                        </button>
                        <button className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-xs">
                          Block
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* Table Management */}
          {activeItem === "Table Management" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-orange-600/30 via-red-500/20 to-pink-700/30 rounded-xl shadow-md border border-orange-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Table CRUD Operations</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Create New Table</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Table Name</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Table 1" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Game Type</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Texas Hold'em</option>
                          <option>Omaha</option>
                          <option>Seven Card Stud</option>
                          <option>Razz</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Max Players</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="8" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Blind Levels</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹25/₹50" />
                      </div>
                      <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Create Table
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Table Settings</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Select Table</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Table 1 - Texas Hold'em</option>
                          <option>Table 2 - Omaha</option>
                          <option>Table 3 - Stud</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg font-semibold text-sm">
                          Edit
                        </button>
                        <button className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-2 rounded-lg font-semibold text-sm">
                          Activate
                        </button>
                        <button className="flex-1 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg font-semibold text-sm">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-indigo-500/20 to-blue-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Dealer Assignment</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Assign Dealer to Table</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Select Table</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Table 1 - Texas Hold'em</option>
                          <option>Table 2 - Omaha</option>
                          <option>Table 3 - Stud</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Select Dealer</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Dealer 1 - John</option>
                          <option>Dealer 2 - Sarah</option>
                          <option>Dealer 3 - Mike</option>
                        </select>
                      </div>
                      <button className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Assign Dealer
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Session State Management</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-white/5 p-3 rounded">
                        <span className="text-white">Table 1 - Texas Hold'em</span>
                        <span className="text-green-400 text-sm">Active</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/5 p-3 rounded">
                        <span className="text-white">Table 2 - Omaha</span>
                        <span className="text-yellow-400 text-sm">Paused</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/5 p-3 rounded">
                        <span className="text-white">Table 3 - Stud</span>
                        <span className="text-red-400 text-sm">Ended</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg font-semibold text-sm">
                          Start All
                        </button>
                        <button className="flex-1 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg font-semibold text-sm">
                          End All
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Tournament Management */}
          {activeItem === "Tournament Management" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-cyan-600/30 via-blue-500/20 to-indigo-700/30 rounded-xl shadow-md border border-cyan-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Tournament CRUD</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Create Tournament</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Tournament Name</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Daily Tournament" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Game Type</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Texas Hold'em</option>
                          <option>Omaha</option>
                          <option>Seven Card Stud</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Buy-in Amount</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹500" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Max Players</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="50" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Start Time</label>
                        <input type="datetime-local" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" />
                      </div>
                      <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Create Tournament
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Tournament Management</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-white/5 p-3 rounded">
                        <div>
                          <div className="text-white font-semibold">Daily Tournament</div>
                          <div className="text-sm text-gray-300">Texas Hold'em - ₹500</div>
                        </div>
                        <span className="text-green-400 text-sm">Active</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/5 p-3 rounded">
                        <div>
                          <div className="text-white font-semibold">Weekly Championship</div>
                          <div className="text-sm text-gray-300">Omaha - ₹2000</div>
                        </div>
                        <span className="text-yellow-400 text-sm">Scheduled</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg font-semibold text-sm">
                          Edit
                        </button>
                        <button className="flex-1 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg font-semibold text-sm">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Dealer Management */}
          {activeItem === "Dealer Management" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-teal-600/30 via-cyan-500/20 to-blue-700/30 rounded-xl shadow-md border border-teal-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Dealer Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Create New Dealer</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Dealer Name</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="John Doe" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Employee ID</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="D001" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Specialization</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Texas Hold'em</option>
                          <option>Omaha</option>
                          <option>Seven Card Stud</option>
                          <option>All Games</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Shift</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Morning (6 AM - 2 PM)</option>
                          <option>Afternoon (2 PM - 10 PM)</option>
                          <option>Night (10 PM - 6 AM)</option>
                        </select>
                      </div>
                      <button className="w-full bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Create Dealer
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Dealer Assignment</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-white/5 p-3 rounded">
                        <div>
                          <div className="text-white font-semibold">John - Table 1</div>
                          <div className="text-sm text-gray-300">Texas Hold'em</div>
                        </div>
                        <span className="text-green-400 text-sm">Active</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/5 p-3 rounded">
                        <div>
                          <div className="text-white font-semibold">Sarah - Table 2</div>
                          <div className="text-sm text-gray-300">Omaha</div>
                        </div>
                        <span className="text-yellow-400 text-sm">On Break</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg font-semibold text-sm">
                          Reassign
                        </button>
                        <button className="flex-1 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg font-semibold text-sm">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Player Acquisition */}
          {activeItem === "Player Acquisition" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-pink-600/30 via-rose-500/20 to-red-700/30 rounded-xl shadow-md border border-pink-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Offers & Promotions</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Create Promotion</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Promotion Title</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Welcome Bonus" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Description</label>
                        <textarea className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" rows="3" placeholder="Get 100% bonus on your first deposit"></textarea>
                      </div>
                      <div>
                        <label className="text-white text-sm">Target Audience</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>All Players</option>
                          <option>New Players</option>
                          <option>VIP Players</option>
                          <option>Inactive Players</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Delivery Method</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Email</option>
                          <option>SMS</option>
                          <option>Push Notification</option>
                          <option>All Channels</option>
                        </select>
                      </div>
                      <button className="w-full bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Create Promotion
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Bulk Send</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Select Promotion</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Welcome Bonus</option>
                          <option>Weekly Tournament</option>
                          <option>VIP Invitation</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Player List</label>
                        <input type="file" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" />
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg font-semibold text-sm">
                          Send to All
                        </button>
                        <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg font-semibold text-sm">
                          Preview
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-6 bg-gradient-to-r from-indigo-600/30 via-purple-500/20 to-pink-700/30 rounded-xl shadow-md border border-indigo-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Reports & Analytics</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Generate Reports</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Report Type</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Player Activity Report</option>
                          <option>Revenue Report</option>
                          <option>Table Performance</option>
                          <option>Dealer Performance</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Date Range</label>
                        <div className="flex gap-2">
                          <input type="date" className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" />
                          <input type="date" className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" />
                        </div>
                      </div>
                      <div>
                        <label className="text-white text-sm">Format</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>PDF</option>
                          <option>Excel</option>
                          <option>CSV</option>
                        </select>
                      </div>
                      <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Generate Report
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Analytics Dashboard</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-white/5 p-3 rounded">
                        <span className="text-white">Total Players</span>
                        <span className="text-green-400 font-bold">1,247</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/5 p-3 rounded">
                        <span className="text-white">Active Players</span>
                        <span className="text-blue-400 font-bold">892</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/5 p-3 rounded">
                        <span className="text-white">Daily Revenue</span>
                        <span className="text-purple-400 font-bold">₹45,230</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/5 p-3 rounded">
                        <span className="text-white">Conversion Rate</span>
                        <span className="text-yellow-400 font-bold">12.5%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Session Control */}
          {activeItem === "Session Control" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-violet-600/30 via-purple-500/20 to-indigo-700/30 rounded-xl shadow-md border border-violet-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Session Control</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Table Sessions</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-green-500/20 p-2 rounded">
                        <span className="text-white">Table 1 - Texas Hold'em</span>
                        <span className="text-green-300 text-sm">Active</span>
                      </div>
                      <div className="flex justify-between items-center bg-yellow-500/20 p-2 rounded">
                        <span className="text-white">Table 2 - Omaha</span>
                        <span className="text-yellow-300 text-sm">Paused</span>
                      </div>
                      <div className="flex justify-between items-center bg-red-500/20 p-2 rounded">
                        <span className="text-white">Table 3 - Stud</span>
                        <span className="text-red-300 text-sm">Ended</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Session Controls</h3>
                    <div className="space-y-3">
                      <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Start All Sessions
                      </button>
                      <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Pause All Sessions
                      </button>
                      <button className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                        End All Sessions
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Timing Controls</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Play Window (minutes)</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="30" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Call Window (minutes)</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="5" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Cash-out Window (minutes)</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="10" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Seating Management */}
          {activeItem === "Seating Management" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-emerald-600/30 via-green-500/20 to-teal-700/30 rounded-xl shadow-md border border-emerald-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Seating Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Waitlist Management</h3>
                    <div className="space-y-2">
                      <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-400/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-white">Player: Alex Johnson</div>
                            <div className="text-sm text-gray-300">Position: 1 | Game: Texas Hold'em</div>
                          </div>
                          <div className="flex gap-2">
                            <button className="bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded text-sm">
                              Seat
                            </button>
                            <button className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-sm">
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-400/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-white">Player: Maria Garcia</div>
                            <div className="text-sm text-gray-300">Position: 2 | Game: Omaha</div>
                          </div>
                          <div className="flex gap-2">
                            <button className="bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded text-sm">
                              Seat
                            </button>
                            <button className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-sm">
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Seat Assignment</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Select Player</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Alex Johnson</option>
                          <option>Maria Garcia</option>
                          <option>David Wilson</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Select Table</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Table 1 - Texas Hold'em</option>
                          <option>Table 2 - Omaha</option>
                          <option>Table 3 - Stud</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Seat Number</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Seat 1</option>
                          <option>Seat 2</option>
                          <option>Seat 3</option>
                          <option>Seat 4</option>
                          <option>Seat 5</option>
                          <option>Seat 6</option>
                          <option>Seat 7</option>
                          <option>Seat 8</option>
                        </select>
                      </div>
                      <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Assign Seat
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* System Settings */}
          {activeItem === "System Settings" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-gray-600/30 via-slate-500/20 to-zinc-700/30 rounded-xl shadow-md border border-gray-800/40">
                <h2 className="text-xl font-bold text-white mb-6">System Settings</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Site Name</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Poker Room" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Default Currency</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>INR (₹)</option>
                          <option>USD ($)</option>
                          <option>EUR (€)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Time Zone</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Asia/Kolkata</option>
                          <option>America/New_York</option>
                          <option>Europe/London</option>
                        </select>
                      </div>
                      <button className="w-full bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Save Settings
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Security Settings</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-white/5 p-3 rounded">
                        <span className="text-white">Two-Factor Authentication</span>
                        <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm">
                          Enable
                        </button>
                      </div>
                      <div className="flex justify-between items-center bg-white/5 p-3 rounded">
                        <span className="text-white">Session Timeout</span>
                        <select className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm">
                          <option>30 minutes</option>
                          <option>1 hour</option>
                          <option>2 hours</option>
                        </select>
                      </div>
                      <div className="flex justify-between items-center bg-white/5 p-3 rounded">
                        <span className="text-white">Login Attempts Limit</span>
                        <input type="number" className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm" placeholder="5" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
