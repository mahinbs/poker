import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const navigate = useNavigate();

  const menuItems = [
    "Dashboard",
    "Core Management", 
    "Player Acquisition",
    "Session Control",
    "Seating Management",
    "Reports & Analytics",
    "System Settings"
  ];

  const handleSignOut = () => {
    navigate('/admin/signin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans">
      <div className="mx-auto max-w-[1400px] px-6 py-10 grid grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-3 xl:col-span-2 rounded-2xl bg-gradient-to-b from-red-500/20 via-purple-600/30 to-blue-700/30 p-5 shadow-lg border border-gray-800 min-w-0">
          <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-purple-300 to-blue-400 drop-shadow-lg mb-6">
            Admin Portal
          </div>
          <div className="flex items-center mb-6 text-white min-w-0">
            <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-purple-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-gray-900 font-bold text-sm">A</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-semibold truncate">System Administrator</div>
              <div className="text-sm opacity-80 truncate">admin@pokerroom.com</div>
            </div>
          </div>

          {/* Sidebar Menu */}
          <nav className="space-y-3">
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveItem(item)}
                className={`w-full text-left rounded-xl px-4 py-3 font-medium transition-all duration-300 shadow-md ${
                  activeItem === item
                    ? "bg-gradient-to-r from-red-400 to-purple-600 text-gray-900 font-bold shadow-lg scale-[1.02]"
                    : "bg-white/5 hover:bg-gradient-to-r hover:from-red-400/20 hover:to-purple-500/20 text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Section */}
        <main className="col-span-12 lg:col-span-9 xl:col-span-10 space-y-8">
          {/* Header */}
          <header className="bg-gradient-to-r from-red-600 via-purple-500 to-blue-400 p-6 rounded-xl shadow-md flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Portal - {activeItem}</h1>
              <p className="text-gray-200 mt-1">Complete system administration and management</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => navigate("/manager")}
                className="bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
              >
                Manager Portal
              </button>
              <button 
                onClick={() => navigate("/gre/signin")}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
              >
                GRE Portal
              </button>
              <button 
                onClick={() => navigate("/hr/signin")}
                className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
              >
                HR Portal
              </button>
              <button 
                onClick={() => navigate("/cashier/signin")}
                className="bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
              >
                Cashier Portal
              </button>
              <button 
                onClick={() => navigate("/fnb/signin")}
                className="bg-orange-600 hover:bg-orange-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
              >
                FNB Portal
              </button>
              <button 
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
              >
                Sign Out
              </button>
            </div>
          </header>

          {/* Dynamic Content Based on Active Item */}
          {activeItem === "Dashboard" && (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                  { title: "Active Tables", value: "8", color: "from-red-400 via-orange-500 to-yellow-500" },
                  { title: "Total Players", value: "156", color: "from-blue-400 via-indigo-500 to-purple-500" },
                  { title: "Active Dealers", value: "12", color: "from-green-400 via-emerald-500 to-teal-500" },
                  { title: "System Revenue", value: "₹45,230", color: "from-purple-400 via-pink-500 to-red-500" },
                ].map((card, i) => (
                  <div key={i} className={`p-6 rounded-xl bg-gradient-to-br ${card.color} text-gray-900 shadow-lg transition-transform transform hover:scale-105`}>
                    <div className="text-sm opacity-90 text-white/90">{card.title}</div>
                    <div className="text-3xl font-bold mt-2 text-white">{card.value}</div>
                    <div className="text-xs mt-1 text-white/70">Updated just now</div>
                  </div>
                ))}
              </div>

              {/* CRUD Operations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Tables CRUD */}
                <section className="p-6 bg-gradient-to-r from-red-600/30 via-orange-500/20 to-yellow-700/30 rounded-xl shadow-md border border-red-800/40">
                  <h2 className="text-lg font-semibold text-white mb-4">Active Tables Management</h2>
                  <div className="space-y-4">
                    <div className="bg-white/10 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-semibold">Table 1 - Texas Hold'em</span>
                        <span className="text-green-300 text-sm">Active</span>
                      </div>
                      <div className="text-sm text-gray-300">Players: 6/9 | Dealer: John</div>
                      <div className="flex gap-2 mt-2">
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                          Edit
                        </button>
                        <button className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm">
                          Pause
                        </button>
                        <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">
                          End
                        </button>
                      </div>
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-semibold">Table 2 - Omaha</span>
                        <span className="text-yellow-300 text-sm">Paused</span>
                      </div>
                      <div className="text-sm text-gray-300">Players: 4/8 | Dealer: Sarah</div>
                      <div className="flex gap-2 mt-2">
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                          Edit
                        </button>
                        <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm">
                          Resume
                        </button>
                        <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">
                          End
                        </button>
                      </div>
                    </div>
                    <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                      Create New Table
                    </button>
                  </div>
                </section>

                {/* Players Management */}
                <section className="p-6 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-purple-700/30 rounded-xl shadow-md border border-blue-800/40">
                  <h2 className="text-lg font-semibold text-white mb-4">Players Management</h2>
                  <div className="space-y-4">
                    <div className="bg-white/10 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-semibold">John Doe</span>
                        <span className="text-green-300 text-sm">Active</span>
                      </div>
                      <div className="text-sm text-gray-300">ID: P001 | Table: 1 | Chips: ₹2,500</div>
                      <div className="flex gap-2 mt-2">
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                          Edit
                        </button>
                        <button className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm">
                          Block
                        </button>
                        <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-semibold">Jane Smith</span>
                        <span className="text-yellow-300 text-sm">Blocked</span>
                      </div>
                      <div className="text-sm text-gray-300">ID: P002 | Table: None | Chips: ₹0</div>
                      <div className="flex gap-2 mt-2">
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                          Edit
                        </button>
                        <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm">
                          Unblock
                        </button>
                        <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">
                          Remove
                        </button>
                      </div>
                    </div>
                    <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                      Add New Player
                    </button>
                  </div>
                </section>

                {/* Managers Management */}
                <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-red-700/30 rounded-xl shadow-md border border-purple-800/40">
                  <h2 className="text-lg font-semibold text-white mb-4">Managers Management</h2>
                  <div className="space-y-4">
                    <div className="bg-white/10 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-semibold">Manager 1 - Floor Manager</span>
                        <span className="text-green-300 text-sm">Online</span>
                      </div>
                      <div className="text-sm text-gray-300">Name: Mike Johnson | Shift: Day</div>
                      <div className="flex gap-2 mt-2">
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                          Edit
                        </button>
                        <button className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm">
                          Assign
                        </button>
                        <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-semibold">Manager 2 - Shift Manager</span>
                        <span className="text-gray-300 text-sm">Offline</span>
                      </div>
                      <div className="text-sm text-gray-300">Name: Sarah Wilson | Shift: Night</div>
                      <div className="flex gap-2 mt-2">
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                          Edit
                        </button>
                        <button className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm">
                          Assign
                        </button>
                        <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">
                          Remove
                        </button>
                      </div>
                    </div>
                    <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                      Add New Manager
                    </button>
                  </div>
                </section>

                {/* Dealers Management */}
                <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
                  <h2 className="text-lg font-semibold text-white mb-4">Dealers Management</h2>
                  <div className="space-y-4">
                    <div className="bg-white/10 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-semibold">Dealer 1 - John</span>
                        <span className="text-green-300 text-sm">Active</span>
                      </div>
                      <div className="text-sm text-gray-300">Table: 1 | Experience: 5 years</div>
                      <div className="flex gap-2 mt-2">
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                          Edit
                        </button>
                        <button className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm">
                          Reassign
                        </button>
                        <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-semibold">Dealer 2 - Sarah</span>
                        <span className="text-yellow-300 text-sm">Break</span>
                      </div>
                      <div className="text-sm text-gray-300">Table: None | Experience: 3 years</div>
                      <div className="flex gap-2 mt-2">
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                          Edit
                        </button>
                        <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm">
                          Assign
                        </button>
                        <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">
                          Remove
                        </button>
                      </div>
                    </div>
                    <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                      Add New Dealer
                    </button>
                  </div>
                </section>
              </div>

              {/* Quick Actions */}
              <section className="p-6 bg-gradient-to-r from-red-600/30 via-purple-500/20 to-blue-700/30 rounded-xl shadow-md border border-red-800/40">
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-400 hover:to-purple-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">
                    Create New Table
                  </button>
                  <button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">
                    Block Player
                  </button>
                  <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">
                    Generate Report
                  </button>
                  <button className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">
                    System Settings
                  </button>
                </div>
              </section>

              {/* System Status */}
              <section className="p-6 bg-gradient-to-r from-green-700/30 via-emerald-600/30 to-teal-700/30 rounded-xl shadow-md border border-green-700/40">
                <h2 className="text-lg font-semibold text-white mb-4">System Status</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {["Database Operational", "All Services Running", "Security Active"].map((item, i) => (
                    <div key={i} className="bg-white/5 p-4 rounded-lg text-center font-semibold text-white shadow-inner border border-white/10">
                      {item}
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeItem === "Core Management" && (
            <div className="space-y-6">
              {/* Player Management */}
              <section className="p-6 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-purple-700/30 rounded-xl shadow-md border border-blue-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Player Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Player Actions</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Player ID</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter Player ID" />
                      </div>
                      <div className="flex gap-2">
                        <button className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold shadow">
                          Block Player
                        </button>
                        <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold shadow">
                          Unblock Player
                        </button>
                        <button className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold shadow">
                          Reset Status
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Player History</h3>
                    <div className="space-y-2">
                      <div className="bg-white/5 p-3 rounded border border-white/10">
                        <div className="font-semibold text-white">Player: John Doe</div>
                        <div className="text-sm text-gray-300">Last Login: 2 hours ago</div>
                        <div className="text-sm text-gray-300">Total Sessions: 45</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded border border-white/10">
                        <div className="font-semibold text-white">Player: Jane Smith</div>
                        <div className="text-sm text-gray-300">Last Login: 1 day ago</div>
                        <div className="text-sm text-gray-300">Total Sessions: 23</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Table & Tournament Management */}
              <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Table & Tournament Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Create New Table</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Table Name</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Table 1" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Blind Level</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>₹10/₹20</option>
                          <option>₹25/₹50</option>
                          <option>₹50/₹100</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Max Players</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="9" />
                      </div>
                      <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold shadow">
                        Create Table
                      </button>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Dealer Assignment</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Select Table</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Table 1</option>
                          <option>Table 2</option>
                          <option>Table 3</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Assign Dealer</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Dealer 1</option>
                          <option>Dealer 2</option>
                          <option>Dealer 3</option>
                        </select>
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow">
                        Assign Dealer
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "Player Acquisition" && (
            <div className="space-y-6">
              {/* Offers & Promotions */}
              <section className="p-6 bg-gradient-to-r from-yellow-600/30 via-orange-500/20 to-red-700/30 rounded-xl shadow-md border border-yellow-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Offers & Promotions</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Create Promotion</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Promotion Title</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Welcome Bonus" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Description</label>
                        <textarea className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Get 100% bonus on first deposit"></textarea>
                      </div>
                      <div>
                        <label className="text-white text-sm">Target Audience</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>All Players</option>
                          <option>New Players</option>
                          <option>VIP Players</option>
                        </select>
                      </div>
                      <button className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold shadow">
                        Create Promotion
                      </button>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Bulk Operations</h3>
                    <div className="space-y-4">
                      <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold shadow">
                        Send Bulk Email
                      </button>
                      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow">
                        Send SMS Campaign
                      </button>
                      <button className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold shadow">
                        Push Notifications
                      </button>
                      <button className="w-full bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold shadow">
                        Download Player List
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Reports & Analytics */}
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-red-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Reports & Analytics</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Player Analytics</h3>
                    <div className="space-y-2">
                      <div className="bg-white/5 p-3 rounded">
                        <div className="text-sm text-gray-300">Total Players: 156</div>
                        <div className="text-sm text-gray-300">Active Today: 23</div>
                        <div className="text-sm text-gray-300">New This Week: 8</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Revenue Reports</h3>
                    <div className="space-y-2">
                      <div className="bg-white/5 p-3 rounded">
                        <div className="text-sm text-gray-300">Today: ₹12,450</div>
                        <div className="text-sm text-gray-300">This Week: ₹78,230</div>
                        <div className="text-sm text-gray-300">This Month: ₹245,680</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Export Options</h3>
                    <div className="space-y-2">
                      <button className="w-full bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded text-sm">
                        Export CSV
                      </button>
                      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-sm">
                        Export PDF
                      </button>
                      <button className="w-full bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded text-sm">
                        Generate Report
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "Session Control" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Session Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Start New Session</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Table Selection</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Table 1</option>
                          <option>Table 2</option>
                          <option>Table 3</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Session Type</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Cash Game</option>
                          <option>Tournament</option>
                          <option>Special Event</option>
                        </select>
                      </div>
                      <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold shadow">
                        Start Session
                      </button>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Active Sessions</h3>
                    <div className="space-y-2">
                      <div className="bg-green-500/20 p-3 rounded border border-green-400/30">
                        <div className="font-semibold text-white">Table 1 - Cash Game</div>
                        <div className="text-sm text-gray-300">Players: 6/9</div>
                        <div className="text-xs text-green-300">Status: Active</div>
                      </div>
                      <div className="bg-yellow-500/20 p-3 rounded border border-yellow-400/30">
                        <div className="font-semibold text-white">Table 2 - Tournament</div>
                        <div className="text-sm text-gray-300">Players: 8/8</div>
                        <div className="text-xs text-yellow-300">Status: Starting</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "Seating Management" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-purple-700/30 rounded-xl shadow-md border border-blue-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Seating Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Waitlist Management</h3>
                    <div className="space-y-2">
                      <div className="bg-white/5 p-3 rounded border border-white/10">
                        <div className="font-semibold text-white">Player: Mike Johnson</div>
                        <div className="text-sm text-gray-300">Wait Time: 15 minutes</div>
                        <div className="text-xs text-blue-300">Priority: High</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded border border-white/10">
                        <div className="font-semibold text-white">Player: Sarah Wilson</div>
                        <div className="text-sm text-gray-300">Wait Time: 8 minutes</div>
                        <div className="text-xs text-green-300">Priority: Normal</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Seat Allocation</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Select Player</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Mike Johnson</option>
                          <option>Sarah Wilson</option>
                          <option>Tom Brown</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Assign Table</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Table 1 - Seat 3</option>
                          <option>Table 2 - Seat 7</option>
                          <option>Table 3 - Seat 1</option>
                        </select>
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow">
                        Assign Seat
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "Reports & Analytics" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-red-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Comprehensive Reports</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Daily Reports</h3>
                    <div className="space-y-2">
                      <div className="bg-white/5 p-3 rounded">
                        <div className="text-sm text-gray-300">Revenue: ₹12,450</div>
                        <div className="text-sm text-gray-300">Players: 23</div>
                        <div className="text-sm text-gray-300">Tables: 8</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Weekly Reports</h3>
                    <div className="space-y-2">
                      <div className="bg-white/5 p-3 rounded">
                        <div className="text-sm text-gray-300">Revenue: ₹78,230</div>
                        <div className="text-sm text-gray-300">Players: 156</div>
                        <div className="text-sm text-gray-300">Growth: +12%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "System Settings" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-gray-600/30 via-slate-500/20 to-gray-700/30 rounded-xl shadow-md border border-gray-800/40">
                <h2 className="text-xl font-bold text-white mb-6">System Configuration</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Security Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white">Two-Factor Authentication</span>
                        <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm">
                          Enabled
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white">Session Timeout</span>
                        <select className="bg-white/10 border border-white/20 rounded text-white px-2 py-1">
                          <option>30 minutes</option>
                          <option>1 hour</option>
                          <option>2 hours</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">System Maintenance</h3>
                    <div className="space-y-4">
                      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow">
                        Backup Database
                      </button>
                      <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold shadow">
                        Clear Cache
                      </button>
                      <button className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold shadow">
                        System Restart
                      </button>
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
