import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CashierDashboard() {
  const [activeItem, setActiveItem] = useState("Financial Processing");
  const navigate = useNavigate();

  const menuItems = [
    "Financial Processing",
    "Payroll Management", 
    "Transaction History",
    "Shift Reconciliation",
    "Bonus Processing",
  ];

  const handleSignOut = () => {
    navigate("/cashier/signin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans">
      <div className="mx-auto max-w-[1400px] px-6 py-10 grid grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-3 xl:col-span-3 rounded-2xl bg-gradient-to-b from-green-500/20 via-emerald-600/30 to-teal-700/30 p-5 shadow-lg border border-gray-800 min-w-0">
          <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-teal-400 drop-shadow-lg mb-6">
            Cashier Portal
          </div>
          <div className="flex items-center mb-6 text-white min-w-0">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-gray-900 font-bold text-sm">C</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-semibold truncate">Cashier Manager</div>
              <div className="text-sm opacity-80 truncate">cashier@pokerroom.com</div>
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
                    ? "bg-gradient-to-r from-green-400 to-emerald-600 text-gray-900 font-bold shadow-lg scale-[1.02]"
                    : "bg-white/5 hover:bg-gradient-to-r hover:from-green-400/20 hover:to-emerald-500/20 text-white"
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
          <header className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-400 p-6 rounded-xl shadow-md flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Cashier Portal - {activeItem}</h1>
              <p className="text-gray-200 mt-1">Manage financial transactions, payroll, and bonuses</p>
            </div>
            <button 
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
            >
              Sign Out
            </button>
          </header>

          {/* Dynamic Content Based on Active Item */}
          {activeItem === "Financial Processing" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                  { title: "Today's Transactions", value: "₹45,250", color: "from-green-400 via-emerald-500 to-teal-500" },
                  { title: "Pending Deposits", value: "₹12,500", color: "from-blue-400 via-indigo-500 to-violet-500" },
                  { title: "Cash on Hand", value: "₹125,000", color: "from-yellow-400 via-orange-500 to-red-500" },
                  { title: "Daily Revenue", value: "₹78,500", color: "from-purple-400 via-pink-500 to-rose-500" },
                ].map((card, i) => (
                  <div
                    key={i}
                    className={`p-6 rounded-xl bg-gradient-to-br ${card.color} text-gray-900 shadow-lg transition-transform transform hover:scale-105`}
                  >
                    <div className="text-sm opacity-90 text-white/90">{card.title}</div>
                    <div className="text-3xl font-bold mt-2 text-white">{card.value}</div>
                    <div className="text-xs mt-1 text-white/70">Real-time data</div>
                  </div>
                ))}
              </div>

              {/* Transaction Management */}
              <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Transaction Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Deposit Processing</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Player ID</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter Player ID" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Amount</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Payment Method</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Cash</option>
                          <option>Bank Transfer</option>
                          <option>UPI</option>
                          <option>Credit Card</option>
                          <option>Debit Card</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Reference Number</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Transaction reference" />
                      </div>
                      <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Process Deposit
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Withdrawal Processing</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Player ID</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter Player ID" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Available Balance</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" readOnly />
                      </div>
                      <div>
                        <label className="text-white text-sm">Withdrawal Amount</label>
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
                      <button className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Process Withdrawal
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Cash-in/Cash-out */}
              <section className="p-6 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-purple-700/30 rounded-xl shadow-md border border-blue-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Cash-in/Cash-out Operations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Cash-in to Table</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Table ID</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Table 1 - Texas Hold'em</option>
                          <option>Table 2 - Omaha</option>
                          <option>Table 3 - Stud</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Player ID</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter Player ID" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Amount</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
                      </div>
                      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Cash-in to Table
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Cash-out from Table</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Table ID</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Table 1 - Texas Hold'em</option>
                          <option>Table 2 - Omaha</option>
                          <option>Table 3 - Stud</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Player ID</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter Player ID" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Chip Count</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter chip count" />
                      </div>
                      <button className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Cash-out from Table
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Fund Moves & Batch Operations */}
              <section className="p-6 bg-gradient-to-r from-orange-600/30 via-red-500/20 to-pink-700/30 rounded-xl shadow-md border border-orange-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Fund Moves & Batch Operations</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Fund Transfers</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">From Account</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Main Cash Register</option>
                          <option>Table 1 Float</option>
                          <option>Table 2 Float</option>
                          <option>Table 3 Float</option>
                          <option>Safe Deposit</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">To Account</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Main Cash Register</option>
                          <option>Table 1 Float</option>
                          <option>Table 2 Float</option>
                          <option>Table 3 Float</option>
                          <option>Safe Deposit</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Amount</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Reason</label>
                        <textarea className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" rows="2" placeholder="Transfer reason..."></textarea>
                      </div>
                      <button className="w-full bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Transfer Funds
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Batch Operations</h3>
                    <div className="space-y-3">
                      <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Process All Pending Deposits
                      </button>
                      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Reconcile All Tables
                      </button>
                      <button className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Generate Daily Report
                      </button>
                      <button className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Emergency Cash Count
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Payroll Management */}
          {activeItem === "Payroll Management" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-rose-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Salary & Payroll Processing</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Staff Salary Processing</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Select Staff Member</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Sarah Johnson - Dealer</option>
                          <option>Mike Chen - Floor Manager</option>
                          <option>Emma Davis - Cashier</option>
                          <option>John Smith - Security</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Pay Period</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Weekly</option>
                          <option>Bi-weekly</option>
                          <option>Monthly</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Base Salary</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Overtime Hours</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="0" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Deductions</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
                      </div>
                      <button className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Process Salary
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Tips Processing</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Staff Member</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Sarah Johnson - Dealer</option>
                          <option>Mike Chen - Floor Manager</option>
                          <option>Emma Davis - Cashier</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Total Tips Earned</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Club Percentage</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="15%" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Staff Share</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" readOnly />
                      </div>
                      <button className="w-full bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Process Tips
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-6 bg-gradient-to-r from-cyan-600/30 via-blue-500/20 to-indigo-700/30 rounded-xl shadow-md border border-cyan-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Dealer Tips Processing</h2>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Dynamic Percentage Settings</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-white text-sm">Club Hold Percentage</label>
                          <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="15%" />
                        </div>
                        <div>
                          <label className="text-white text-sm">Dealer Share Percentage</label>
                          <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="85%" />
                        </div>
                        <div>
                          <label className="text-white text-sm">Floor Manager Share</label>
                          <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="5%" />
                        </div>
                        <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-semibold">
                          Update Settings
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Today's Dealer Tips</h3>
                      <div className="space-y-2">
                        <div className="bg-cyan-500/20 p-3 rounded-lg border border-cyan-400/30">
                          <div className="font-semibold text-white">Sarah Johnson</div>
                          <div className="text-sm text-gray-300">Total Tips: ₹2,500 | Share: ₹2,125</div>
                          <div className="text-xs text-cyan-300">Status: Processed</div>
                        </div>
                        <div className="bg-cyan-500/20 p-3 rounded-lg border border-cyan-400/30">
                          <div className="font-semibold text-white">Mike Chen</div>
                          <div className="text-sm text-gray-300">Total Tips: ₹1,800 | Share: ₹1,530</div>
                          <div className="text-xs text-cyan-300">Status: Pending</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Bonus Processing */}
          {activeItem === "Bonus Processing" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-yellow-600/30 via-orange-500/20 to-red-700/30 rounded-xl shadow-md border border-yellow-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Player Bonuses</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Process Player Bonus</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Player ID</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter Player ID" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Bonus Type</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Welcome Bonus</option>
                          <option>Loyalty Bonus</option>
                          <option>Referral Bonus</option>
                          <option>Tournament Bonus</option>
                          <option>Special Event Bonus</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Bonus Amount</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Reason</label>
                        <textarea className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" rows="3" placeholder="Bonus reason..."></textarea>
                      </div>
                      <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Process Player Bonus
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Player Bonuses</h3>
                    <div className="space-y-2">
                      <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-400/30">
                        <div className="font-semibold text-white">Player: John Smith</div>
                        <div className="text-sm text-gray-300">Welcome Bonus: ₹1,000</div>
                        <div className="text-xs text-yellow-300">Processed 2 hours ago</div>
                      </div>
                      <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-400/30">
                        <div className="font-semibold text-white">Player: Maria Garcia</div>
                        <div className="text-sm text-gray-300">Loyalty Bonus: ₹500</div>
                        <div className="text-xs text-yellow-300">Processed 1 day ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-6 bg-gradient-to-r from-pink-600/30 via-rose-500/20 to-red-700/30 rounded-xl shadow-md border border-pink-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Staff Bonuses</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Process Staff Bonus</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Staff Member</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Sarah Johnson - Dealer</option>
                          <option>Mike Chen - Floor Manager</option>
                          <option>Emma Davis - Cashier</option>
                          <option>John Smith - Security</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Bonus Type</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Performance Bonus</option>
                          <option>Attendance Bonus</option>
                          <option>Special Achievement</option>
                          <option>Holiday Bonus</option>
                          <option>Year-end Bonus</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Bonus Amount</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Approval Required</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Manager Approved</option>
                          <option>HR Approved</option>
                          <option>Pending Approval</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Reason</label>
                        <textarea className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" rows="3" placeholder="Bonus reason..."></textarea>
                      </div>
                      <button className="w-full bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Process Staff Bonus
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Staff Bonuses</h3>
                    <div className="space-y-2">
                      <div className="bg-pink-500/20 p-3 rounded-lg border border-pink-400/30">
                        <div className="font-semibold text-white">Sarah Johnson</div>
                        <div className="text-sm text-gray-300">Performance Bonus: ₹2,000</div>
                        <div className="text-xs text-pink-300">Processed 1 day ago</div>
                      </div>
                      <div className="bg-pink-500/20 p-3 rounded-lg border border-pink-400/30">
                        <div className="font-semibold text-white">Mike Chen</div>
                        <div className="text-sm text-gray-300">Attendance Bonus: ₹1,500</div>
                        <div className="text-xs text-pink-300">Processed 3 days ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Transaction History */}
          {activeItem === "Transaction History" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-indigo-600/30 via-purple-500/20 to-blue-700/30 rounded-xl shadow-md border border-indigo-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Transaction History</h2>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full text-white">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left py-3 px-4">Date</th>
                          <th className="text-left py-3 px-4">Type</th>
                          <th className="text-left py-3 px-4">Player ID</th>
                          <th className="text-left py-3 px-4">Amount</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Reference</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-white/10">
                          <td className="py-3 px-4">2024-01-18</td>
                          <td className="py-3 px-4">Deposit</td>
                          <td className="py-3 px-4">P001</td>
                          <td className="py-3 px-4 text-green-300">+₹5,000</td>
                          <td className="py-3 px-4">
                            <span className="bg-green-500/30 text-green-300 px-2 py-1 rounded text-sm">Completed</span>
                          </td>
                          <td className="py-3 px-4">TXN001</td>
                        </tr>
                        <tr className="border-b border-white/10">
                          <td className="py-3 px-4">2024-01-18</td>
                          <td className="py-3 px-4">Withdrawal</td>
                          <td className="py-3 px-4">P002</td>
                          <td className="py-3 px-4 text-red-300">-₹2,500</td>
                          <td className="py-3 px-4">
                            <span className="bg-green-500/30 text-green-300 px-2 py-1 rounded text-sm">Completed</span>
                          </td>
                          <td className="py-3 px-4">TXN002</td>
                        </tr>
                        <tr className="border-b border-white/10">
                          <td className="py-3 px-4">2024-01-18</td>
                          <td className="py-3 px-4">Bonus</td>
                          <td className="py-3 px-4">P003</td>
                          <td className="py-3 px-4 text-yellow-300">+₹1,000</td>
                          <td className="py-3 px-4">
                            <span className="bg-yellow-500/30 text-yellow-300 px-2 py-1 rounded text-sm">Pending</span>
                          </td>
                          <td className="py-3 px-4">TXN003</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Shift Reconciliation */}
          {activeItem === "Shift Reconciliation" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-teal-600/30 via-cyan-500/20 to-blue-700/30 rounded-xl shadow-md border border-teal-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Shift Reconciliation</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Start Shift</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Cashier ID</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter Cashier ID" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Starting Cash</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Shift Date</label>
                        <input type="date" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" />
                      </div>
                      <button className="w-full bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Start Shift
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">End Shift</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Ending Cash</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Expected Cash</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Variance</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" readOnly />
                      </div>
                      <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-semibold">
                        End Shift & Reconcile
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
