import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const navigate = useNavigate();

  const menuItems = [
    "Dashboard",
    "Session Control",
    "Table Operations", 
    "Player Flow",
    "Seating Management",
    "Real-Time Chat",
    "Players",
    "Registered Players",
    "KYC Review",
    "Push Notifications",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans">
      <div className="mx-auto max-w-[1400px] px-6 py-10 grid grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-3 xl:col-span-2 rounded-2xl bg-gradient-to-b from-yellow-500/20 via-green-600/30 to-emerald-700/30 p-5 shadow-lg border border-gray-800 min-w-0">
          <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-green-300 to-teal-400 drop-shadow-lg mb-6">
            Manager Portal
          </div>
          <div className="flex items-center mb-6 text-white min-w-0">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
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
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-bold shadow-lg scale-[1.02]"
                    : "bg-white/5 hover:bg-gradient-to-r hover:from-yellow-400/20 hover:to-green-500/20 text-white"
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
          <header className="bg-gradient-to-r from-emerald-600 via-green-500 to-yellow-400 p-6 rounded-xl shadow-md flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Manager Portal - {activeItem}</h1>
              <p className="text-gray-200 mt-1">Monitor tables, players, and manage operations</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => navigate("/admin/signin")}
                className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
              >
                Admin Portal
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
              <button className="bg-gray-600 hover:bg-gray-500 text-white font-semibold px-4 py-2 rounded-lg shadow">
                Sign Out
              </button>
            </div>
          </header>

          {/* Dynamic Content Based on Active Item */}
          {activeItem === "Dashboard" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                  { title: "Active Tables", value: "3", color: "from-yellow-400 via-orange-500 to-red-500" },
                  { title: "Online Players", value: "8", color: "from-green-400 via-emerald-500 to-teal-500" },
                  { title: "Pending KYC", value: "1", color: "from-pink-400 via-red-500 to-rose-600" },
                  { title: "Daily Revenue", value: "₹0.00", color: "from-blue-400 via-indigo-500 to-violet-500" },
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
              <section className="p-6 bg-gradient-to-r from-lime-400/30 via-green-500/20 to-emerald-700/20 rounded-xl shadow-md border border-emerald-800/40">
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">
                    Create Player
                  </button>
                  <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">
                    Refresh Data
                  </button>
                  <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">
                    Review KYC
                  </button>
                </div>
              </section>

              {/* Recent KYC */}
              <section className="p-6 bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl shadow-lg border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-4">Recent KYC Requests</h2>
                <div className="flex items-center justify-between bg-gradient-to-r from-yellow-500/20 to-green-500/20 p-4 rounded-xl shadow border border-yellow-400/30">
                  <div>
                    <div className="font-bold text-white">Test Player</div>
                    <div className="text-gray-300 text-sm">test@supabase.com</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-yellow-500/30 text-yellow-300 font-medium px-3 py-1 rounded-full text-sm border border-yellow-400/50">
                      Pending
                    </span>
                    <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold shadow">
                      Review
                    </button>
                  </div>
                </div>
              </section>

              {/* System Status */}
              <section className="p-6 bg-gradient-to-r from-green-700/30 via-lime-600/30 to-emerald-700/30 rounded-xl shadow-md border border-green-700/40">
                <h2 className="text-lg font-semibold text-white mb-4">System Status</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {["Database Operational", "Player Portal Connected", "KYC System Active"].map((item, i) => (
                    <div
                      key={i}
                      className="bg-white/5 p-4 rounded-lg text-center font-semibold text-white shadow-inner border border-white/10"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Session Control */}
          {activeItem === "Session Control" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-blue-600/30 via-purple-500/20 to-indigo-700/30 rounded-xl shadow-md border border-blue-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Table Session Control</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-3">Table Sessions</h3>
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
                    <h3 className="text-lg font-semibold text-white mb-3">Session Controls</h3>
                    <div className="space-y-3">
                      <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Start Session
                      </button>
                      <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Pause Session
                      </button>
                      <button className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                        End Session
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-3">Timing & Window Controls</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Play Window (minutes)</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="30" />
                        <div className="flex gap-2 mt-2">
                          <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                            Set
                          </button>
                          <button className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm">
                            Adjust
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-white text-sm">Call Window (minutes)</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="5" />
                        <div className="flex gap-2 mt-2">
                          <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                            Set
                          </button>
                          <button className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm">
                            Adjust
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-white text-sm">Cash-out Window (minutes)</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="10" />
                        <div className="flex gap-2 mt-2">
                          <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                            Set
                          </button>
                          <button className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm">
                            Adjust
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-white text-sm">Session Timeout (minutes)</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="120" />
                        <div className="flex gap-2 mt-2">
                          <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                            Set
                          </button>
                          <button className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm">
                            Adjust
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Table Operations */}
          {activeItem === "Table Operations" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-emerald-600/30 via-green-500/20 to-teal-700/30 rounded-xl shadow-md border border-emerald-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Table Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Table CRUD Operations</h3>
                    <div className="space-y-3">
                      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Create New Table
                      </button>
                      <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Edit Table Settings
                      </button>
                      <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Activate/Deactivate Table
                      </button>
                      <button className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Delete Table
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Dealer Assignment</h3>
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
                        <label className="text-white text-sm">Assign Dealer</label>
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
                </div>
              </section>

              <section className="p-6 bg-gradient-to-r from-orange-600/30 via-red-500/20 to-pink-700/30 rounded-xl shadow-md border border-orange-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Rake Entry Form</h2>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white text-sm">Table ID</label>
                      <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Table 1" />
                    </div>
                    <div>
                      <label className="text-white text-sm">Session Date</label>
                      <input type="date" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" />
                    </div>
                    <div>
                      <label className="text-white text-sm">Chip Denomination</label>
                      <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹25, ₹50, ₹100, ₹500" />
                    </div>
                    <div>
                      <label className="text-white text-sm">Total Rake Amount</label>
                      <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-white text-sm">Notes</label>
                      <textarea className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" rows="3" placeholder="Additional notes about the session..."></textarea>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-semibold">
                      Submit Rake Entry
                    </button>
                    <button className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold">
                      Save Draft
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Player Flow */}
          {activeItem === "Player Flow" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-cyan-600/30 via-blue-500/20 to-indigo-700/30 rounded-xl shadow-md border border-cyan-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Player Cash-out Approval</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Pending Cash-outs</h3>
                    <div className="space-y-3">
                      <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-400/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-white">Player: John Doe</div>
                            <div className="text-sm text-gray-300">Table 1 - Seat 3</div>
                            <div className="text-sm text-gray-300">Chips: ₹2,500</div>
                          </div>
                          <div className="flex gap-2">
                            <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm">
                              Approve
                            </button>
                            <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-400/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-white">Player: Jane Smith</div>
                            <div className="text-sm text-gray-300">Table 2 - Seat 7</div>
                            <div className="text-sm text-gray-300">Chips: ₹1,800</div>
                          </div>
                          <div className="flex gap-2">
                            <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm">
                              Approve
                            </button>
                            <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Cash-out Verification</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Player ID</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter Player ID" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Chip Count</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter chip amount" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Table Balance</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter table balance" />
                      </div>
                      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Verify & Update Balance
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Handoff to Cashier</h2>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-white text-sm">Player Name</label>
                      <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Player Name" />
                    </div>
                    <div>
                      <label className="text-white text-sm">Amount to Pay</label>
                      <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
                    </div>
                    <div>
                      <label className="text-white text-sm">Payment Method</label>
                      <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                        <option>Cash</option>
                        <option>Bank Transfer</option>
                        <option>UPI</option>
                        <option>Cheque</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-semibold">
                      Send to Cashier
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold">
                      Print Receipt
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Seating Management */}
          {activeItem === "Seating Management" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-rose-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Waitlist Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Current Waitlist</h3>
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
                      <button className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Assign Seat
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-6 bg-gradient-to-r from-indigo-600/30 via-blue-500/20 to-cyan-700/30 rounded-xl shadow-md border border-indigo-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Player Call & Reorder</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Call Players</h3>
                    <div className="space-y-3">
                      <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Call Next Player
                      </button>
                      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Call All Players
                      </button>
                      <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Send SMS Notification
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Reorder Waitlist</h3>
                    <div className="space-y-2">
                      <div className="bg-white/5 p-2 rounded flex justify-between items-center">
                        <span className="text-white">1. Alex Johnson</span>
                        <div className="flex gap-1">
                          <button className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs">↑</button>
                          <button className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs">↓</button>
                        </div>
                      </div>
                      <div className="bg-white/5 p-2 rounded flex justify-between items-center">
                        <span className="text-white">2. Maria Garcia</span>
                        <div className="flex gap-1">
                          <button className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs">↑</button>
                          <button className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs">↓</button>
                        </div>
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

