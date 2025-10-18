import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function GreDashboard() {
  const [activeItem, setActiveItem] = useState("Monitoring");
  const navigate = useNavigate();

  const menuItems = [
    "Monitoring",
    "Acquisition", 
    "Table View",
    "Player Support",
    "KYC Upload",
  ];

  const handleSignOut = () => {
    navigate("/gre/signin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans">
      <div className="mx-auto max-w-[1400px] px-6 py-10 grid grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-3 xl:col-span-2 rounded-2xl bg-gradient-to-b from-blue-500/20 via-cyan-600/30 to-teal-700/30 p-5 shadow-lg border border-gray-800 min-w-0">
          <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 drop-shadow-lg mb-6">
            GRE Portal
          </div>
          <div className="flex items-center mb-6 text-white min-w-0">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-gray-900 font-bold text-sm">GRE</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-semibold truncate">Guest Relation Executive</div>
              <div className="text-sm opacity-80 truncate">gre@pokerroom.com</div>
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
                    ? "bg-gradient-to-r from-blue-400 to-cyan-600 text-gray-900 font-bold shadow-lg scale-[1.02]"
                    : "bg-white/5 hover:bg-gradient-to-r hover:from-blue-400/20 hover:to-cyan-500/20 text-white"
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
          <header className="bg-gradient-to-r from-cyan-600 via-blue-500 to-indigo-400 p-6 rounded-xl shadow-md flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">GRE Portal - {activeItem}</h1>
              <p className="text-gray-200 mt-1">Monitor players, handle acquisitions, and view tables</p>
            </div>
            <button 
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
            >
              Sign Out
            </button>
          </header>

          {/* Dynamic Content Based on Active Item */}
          {activeItem === "Monitoring" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                  { title: "Active Players", value: "12", color: "from-green-400 via-emerald-500 to-teal-500" },
                  { title: "Waiting Players", value: "5", color: "from-yellow-400 via-orange-500 to-red-500" },
                  { title: "New Players", value: "3", color: "from-blue-400 via-indigo-500 to-violet-500" },
                  { title: "Active Sessions", value: "8", color: "from-purple-400 via-pink-500 to-rose-500" },
                ].map((card, i) => (
                  <div
                    key={i}
                    className={`p-6 rounded-xl bg-gradient-to-br ${card.color} text-gray-900 shadow-lg transition-transform transform hover:scale-105`}
                  >
                    <div className="text-sm opacity-90 text-white/90">{card.title}</div>
                    <div className="text-3xl font-bold mt-2 text-white">{card.value}</div>
                    <div className="text-xs mt-1 text-white/70">Real-time monitoring</div>
                  </div>
                ))}
              </div>

              {/* Player Monitoring */}
              <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Player Status Monitoring</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Active Players</h3>
                    <div className="space-y-2">
                      <div className="bg-green-500/20 p-3 rounded-lg border border-green-400/30">
                        <div className="font-semibold text-white">John Smith</div>
                        <div className="text-sm text-gray-300">Table 1 - Seat 3 | ₹2,500</div>
                        <div className="text-xs text-green-300">Playing</div>
                      </div>
                      <div className="bg-green-500/20 p-3 rounded-lg border border-green-400/30">
                        <div className="font-semibold text-white">Maria Garcia</div>
                        <div className="text-sm text-gray-300">Table 2 - Seat 7 | ₹1,800</div>
                        <div className="text-xs text-green-300">Playing</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Waiting Players</h3>
                    <div className="space-y-2">
                      <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-400/30">
                        <div className="font-semibold text-white">Alex Johnson</div>
                        <div className="text-sm text-gray-300">Position: 1 | Texas Hold'em</div>
                        <div className="text-xs text-yellow-300">Waiting</div>
                      </div>
                      <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-400/30">
                        <div className="font-semibold text-white">David Wilson</div>
                        <div className="text-sm text-gray-300">Position: 2 | Omaha</div>
                        <div className="text-xs text-yellow-300">Waiting</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">New Players</h3>
                    <div className="space-y-2">
                      <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-400/30">
                        <div className="font-semibold text-white">Sarah Connor</div>
                        <div className="text-sm text-gray-300">Registered: 2 hours ago</div>
                        <div className="text-xs text-blue-300">New</div>
                      </div>
                      <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-400/30">
                        <div className="font-semibold text-white">Mike Tyson</div>
                        <div className="text-sm text-gray-300">Registered: 1 hour ago</div>
                        <div className="text-xs text-blue-300">New</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Account & Session Monitoring */}
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-indigo-500/20 to-blue-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Account & Session Monitoring</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Account Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white">Total Accounts</span>
                        <span className="text-green-300 font-bold">1,247</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white">Active Accounts</span>
                        <span className="text-blue-300 font-bold">892</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white">Suspended Accounts</span>
                        <span className="text-red-300 font-bold">23</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white">Pending Verification</span>
                        <span className="text-yellow-300 font-bold">45</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Session Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white">Active Sessions</span>
                        <span className="text-green-300 font-bold">8</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white">Average Session Time</span>
                        <span className="text-blue-300 font-bold">2h 34m</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white">Peak Concurrent</span>
                        <span className="text-purple-300 font-bold">15</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white">Session Errors</span>
                        <span className="text-red-300 font-bold">0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Acquisition */}
          {activeItem === "Acquisition" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-emerald-600/30 via-green-500/20 to-teal-700/30 rounded-xl shadow-md border border-emerald-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Create New Players</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Player Registration</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Full Name</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter full name" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Email Address</label>
                        <input type="email" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter email" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Phone Number</label>
                        <input type="tel" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter phone number" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Preferred Game</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Texas Hold'em</option>
                          <option>Omaha</option>
                          <option>Stud</option>
                          <option>Mixed Games</option>
                        </select>
                      </div>
                      <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Create Player Account
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Registrations</h3>
                    <div className="space-y-2">
                      <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-400/30">
                        <div className="font-semibold text-white">Sarah Connor</div>
                        <div className="text-sm text-gray-300">sarah.connor@email.com</div>
                        <div className="text-xs text-blue-300">Registered 2 hours ago</div>
                      </div>
                      <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-400/30">
                        <div className="font-semibold text-white">Mike Tyson</div>
                        <div className="text-sm text-gray-300">mike.tyson@email.com</div>
                        <div className="text-xs text-blue-300">Registered 1 hour ago</div>
                      </div>
                      <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-400/30">
                        <div className="font-semibold text-white">Emma Watson</div>
                        <div className="text-sm text-gray-300">emma.watson@email.com</div>
                        <div className="text-xs text-blue-300">Registered 30 minutes ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-6 bg-gradient-to-r from-orange-600/30 via-red-500/20 to-pink-700/30 rounded-xl shadow-md border border-orange-800/40">
                <h2 className="text-xl font-bold text-white mb-6">KYC Upload (Portal Glitch Recovery)</h2>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white text-sm">Player ID</label>
                      <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter Player ID" />
                    </div>
                    <div>
                      <label className="text-white text-sm">Document Type</label>
                      <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                        <option>PAN Card</option>
                        <option>Aadhaar Card</option>
                        <option>Passport</option>
                        <option>Driving License</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-white text-sm">Upload Document</label>
                      <div className="mt-1 border-2 border-dashed border-white/30 rounded-lg p-6 text-center">
                        <div className="text-white mb-2">Click to upload or drag and drop</div>
                        <div className="text-gray-400 text-sm">PNG, JPG, PDF up to 10MB</div>
                        <input type="file" className="hidden" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold">
                      Upload KYC Document
                    </button>
                    <button className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold">
                      View Uploaded Documents
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Table View */}
          {activeItem === "Table View" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-indigo-500/20 to-blue-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Poker Tables Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg border border-green-400/30">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-white">Table 1</h3>
                      <span className="bg-green-500/30 text-green-300 px-2 py-1 rounded text-sm">Active</span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-300">Game: Texas Hold'em</div>
                      <div className="text-sm text-gray-300">Players: 6/8</div>
                      <div className="text-sm text-gray-300">Blinds: ₹25/₹50</div>
                      <div className="text-sm text-gray-300">Dealer: John</div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg border border-yellow-400/30">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-white">Table 2</h3>
                      <span className="bg-yellow-500/30 text-yellow-300 px-2 py-1 rounded text-sm">Waiting</span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-300">Game: Omaha</div>
                      <div className="text-sm text-gray-300">Players: 4/8</div>
                      <div className="text-sm text-gray-300">Blinds: ₹50/₹100</div>
                      <div className="text-sm text-gray-300">Dealer: Sarah</div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg border border-red-400/30">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-white">Table 3</h3>
                      <span className="bg-red-500/30 text-red-300 px-2 py-1 rounded text-sm">Inactive</span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-300">Game: Stud</div>
                      <div className="text-sm text-gray-300">Players: 0/8</div>
                      <div className="text-sm text-gray-300">Blinds: ₹100/₹200</div>
                      <div className="text-sm text-gray-300">Dealer: Mike</div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-6 bg-gradient-to-r from-cyan-600/30 via-blue-500/20 to-indigo-700/30 rounded-xl shadow-md border border-cyan-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Table Details (Read-Only)</h2>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Table 1 - Texas Hold'em</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Status:</span>
                          <span className="text-green-300">Active</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Current Players:</span>
                          <span className="text-white">6</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Max Players:</span>
                          <span className="text-white">8</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Small Blind:</span>
                          <span className="text-white">₹25</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Big Blind:</span>
                          <span className="text-white">₹50</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Dealer:</span>
                          <span className="text-white">John</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Seat Occupancy</h3>
                      <div className="grid grid-cols-4 gap-2">
                        {[1,2,3,4,5,6,7,8].map(seat => (
                          <div key={seat} className={`p-2 rounded text-center text-sm ${
                            seat <= 6 ? 'bg-green-500/20 text-green-300 border border-green-400/30' : 'bg-gray-500/20 text-gray-400 border border-gray-400/30'
                          }`}>
                            Seat {seat}
                            {seat <= 6 && <div className="text-xs">Occupied</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Player Support */}
          {activeItem === "Player Support" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Player Support Dashboard</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Support Tickets</h3>
                    <div className="space-y-2">
                      <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-400/30">
                        <div className="font-semibold text-white">Ticket #001</div>
                        <div className="text-sm text-gray-300">Player: John Smith</div>
                        <div className="text-sm text-gray-300">Issue: Login problems</div>
                        <div className="text-xs text-yellow-300">Status: Open</div>
                      </div>
                      <div className="bg-green-500/20 p-3 rounded-lg border border-green-400/30">
                        <div className="font-semibold text-white">Ticket #002</div>
                        <div className="text-sm text-gray-300">Player: Maria Garcia</div>
                        <div className="text-sm text-gray-300">Issue: Account verification</div>
                        <div className="text-xs text-green-300">Status: Resolved</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Create Support Ticket
                      </button>
                      <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Reset Player Password
                      </button>
                      <button className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Send Notification
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* KYC Upload */}
          {activeItem === "KYC Upload" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-orange-600/30 via-red-500/20 to-pink-700/30 rounded-xl shadow-md border border-orange-800/40">
                <h2 className="text-xl font-bold text-white mb-6">KYC Document Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Upload New KYC</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Player ID</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter Player ID" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Document Type</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>PAN Card</option>
                          <option>Aadhaar Card</option>
                          <option>Passport</option>
                          <option>Driving License</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Upload Document</label>
                        <div className="mt-1 border-2 border-dashed border-white/30 rounded-lg p-6 text-center">
                          <div className="text-white mb-2">Click to upload or drag and drop</div>
                          <div className="text-gray-400 text-sm">PNG, JPG, PDF up to 10MB</div>
                        </div>
                      </div>
                      <button className="w-full bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Upload Document
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Uploads</h3>
                    <div className="space-y-2">
                      <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-400/30">
                        <div className="font-semibold text-white">Player: John Smith</div>
                        <div className="text-sm text-gray-300">Document: PAN Card</div>
                        <div className="text-xs text-blue-300">Uploaded 2 hours ago</div>
                      </div>
                      <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-400/30">
                        <div className="font-semibold text-white">Player: Maria Garcia</div>
                        <div className="text-sm text-gray-300">Document: Aadhaar Card</div>
                        <div className="text-xs text-blue-300">Uploaded 1 hour ago</div>
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
