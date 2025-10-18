import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CashierPortal() {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [dealerTipPercentage, setDealerTipPercentage] = useState(15);
  const navigate = useNavigate();

  const menuItems = [
    "Dashboard",
    "Transaction Management",
    "Shift Reconciliation", 
    "Payroll Processing",
    "Dealer Tips",
    "Batch Operations",
    "Reports & Analytics",
    "Settings"
  ];

  const [transactions, setTransactions] = useState([
    { id: 1, type: "Deposit", player: "John Doe", amount: 5000, status: "Completed", time: "10:30 AM" },
    { id: 2, type: "Withdrawal", player: "Jane Smith", amount: 2500, status: "Pending", time: "11:15 AM" },
    { id: 3, type: "Cash-in", player: "Mike Johnson", amount: 10000, status: "Completed", time: "11:45 AM" },
    { id: 4, type: "Fund Move", player: "Sarah Wilson", amount: 3000, status: "Processing", time: "12:00 PM" }
  ]);

  const [staffPayroll, setStaffPayroll] = useState([
    { id: 1, name: "Alice Brown", role: "Dealer", salary: 25000, tips: 5000, total: 30000, status: "Pending" },
    { id: 2, name: "Bob Green", role: "Floor Manager", salary: 35000, tips: 2000, total: 37000, status: "Pending" },
    { id: 3, name: "Carol White", role: "Dealer", salary: 25000, tips: 4500, total: 29500, status: "Pending" }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans">
      <div className="mx-auto max-w-[1400px] px-6 py-10 grid grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-3 xl:col-span-2 rounded-2xl bg-gradient-to-b from-blue-500/20 via-purple-600/30 to-indigo-700/30 p-5 shadow-lg border border-gray-800">
          <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-300 to-indigo-400 drop-shadow-lg mb-6">
            Cashier Portal
          </div>
          <div className="bg-white/10 rounded-xl p-4 mb-6 text-white shadow-inner">
            <div className="text-lg font-semibold">Cashier Dashboard</div>
            <div className="text-sm opacity-80">cashier@pokerroom.com</div>
          </div>

          {/* Sidebar Menu */}
          <nav className="space-y-3">
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveItem(item)}
                className={`w-full text-left rounded-xl px-4 py-3 font-medium transition-all duration-300 shadow-md ${
                  activeItem === item
                    ? "bg-gradient-to-r from-blue-400 to-purple-600 text-white font-bold shadow-lg scale-[1.02]"
                    : "bg-white/5 hover:bg-gradient-to-r hover:from-blue-400/20 hover:to-purple-500/20 text-white"
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
          <header className="bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 p-6 rounded-xl shadow-md flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Cashier Portal - {activeItem}</h1>
              <p className="text-gray-200 mt-1">Financial processing, payroll, and transaction management</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => navigate("/")}
                className="bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
              >
                Manager Portal
              </button>
              <button className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow">
                Sign Out
              </button>
            </div>
          </header>

          {/* Dashboard */}
          {activeItem === "Dashboard" && (
            <>
              {/* Financial Overview Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                  { title: "Today's Revenue", value: "₹1,25,000", color: "from-green-400 via-emerald-500 to-teal-500" },
                  { title: "Pending Transactions", value: "3", color: "from-yellow-400 via-orange-500 to-red-500" },
                  { title: "Active Shifts", value: "2", color: "from-blue-400 via-indigo-500 to-violet-500" },
                  { title: "Payroll Due", value: "₹1,50,000", color: "from-purple-400 via-pink-500 to-rose-600" },
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
              <section className="p-6 bg-gradient-to-r from-blue-400/30 via-purple-500/20 to-indigo-700/30 rounded-xl shadow-md border border-blue-800/40">
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">
                    Process Deposit
                  </button>
                  <button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">
                    Process Withdrawal
                  </button>
                  <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">
                    Start Shift
                  </button>
                  <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">
                    Process Payroll
                  </button>
                </div>
              </section>

              {/* Recent Transactions */}
              <section className="p-6 bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl shadow-lg border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-4">Recent Transactions</h2>
                <div className="space-y-3">
                  {transactions.slice(0, 3).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4 rounded-xl shadow border border-blue-400/30">
                      <div>
                        <div className="font-bold text-white">{transaction.type} - {transaction.player}</div>
                        <div className="text-gray-300 text-sm">Amount: ₹{transaction.amount.toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-medium px-3 py-1 rounded-full text-sm border ${
                          transaction.status === 'Completed' ? 'bg-green-500/30 text-green-300 border-green-400/50' :
                          transaction.status === 'Pending' ? 'bg-yellow-500/30 text-yellow-300 border-yellow-400/50' :
                          'bg-blue-500/30 text-blue-300 border-blue-400/50'
                        }`}>
                          {transaction.status}
                        </span>
                        <span className="text-gray-300 text-sm">{transaction.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Transaction Management */}
          {activeItem === "Transaction Management" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Transaction Processing</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">New Transaction</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Transaction Type</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Deposit</option>
                          <option>Withdrawal</option>
                          <option>Cash-in</option>
                          <option>Cash-out</option>
                          <option>Fund Move</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Player ID/Name</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter player ID or name" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Amount (₹)</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="0.00" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Payment Method</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Cash</option>
                          <option>Bank Transfer</option>
                          <option>UPI</option>
                          <option>Cheque</option>
                          <option>Card</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Notes</label>
                        <textarea className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" rows="2" placeholder="Transaction notes..."></textarea>
                      </div>
                      <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Process Transaction
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Transaction History</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="bg-white/5 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold text-white">{transaction.type}</div>
                              <div className="text-sm text-gray-300">{transaction.player}</div>
                              <div className="text-sm text-gray-300">₹{transaction.amount.toLocaleString()}</div>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-medium px-2 py-1 rounded ${
                                transaction.status === 'Completed' ? 'bg-green-500/30 text-green-300' :
                                transaction.status === 'Pending' ? 'bg-yellow-500/30 text-yellow-300' :
                                'bg-blue-500/30 text-blue-300'
                              }`}>
                                {transaction.status}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">{transaction.time}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-6 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-purple-700/30 rounded-xl shadow-md border border-blue-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Batch Operations</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold shadow transition">
                    Process All Pending
                  </button>
                  <button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold shadow transition">
                    Export Transactions
                  </button>
                  <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold shadow transition">
                    Generate Report
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* Shift Reconciliation */}
          {activeItem === "Shift Reconciliation" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-orange-600/30 via-red-500/20 to-pink-700/30 rounded-xl shadow-md border border-orange-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Shift Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Start New Shift</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Cashier Name</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter cashier name" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Starting Cash</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="0.00" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Shift Type</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Morning Shift</option>
                          <option>Afternoon Shift</option>
                          <option>Evening Shift</option>
                          <option>Night Shift</option>
                        </select>
                      </div>
                      <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Start Shift
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">End Current Shift</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Ending Cash</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="0.00" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Cash Variance</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="0.00" readOnly />
                      </div>
                      <div>
                        <label className="text-white text-sm">Notes</label>
                        <textarea className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" rows="2" placeholder="Shift notes..."></textarea>
                      </div>
                      <button className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                        End Shift
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-6 bg-gradient-to-r from-teal-600/30 via-cyan-500/20 to-blue-700/30 rounded-xl shadow-md border border-teal-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Reconciliation Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/10 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-400">₹1,25,000</div>
                    <div className="text-sm text-gray-300">Total Deposits</div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-400">₹75,000</div>
                    <div className="text-sm text-gray-300">Total Withdrawals</div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-400">₹50,000</div>
                    <div className="text-sm text-gray-300">Net Position</div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Payroll Processing */}
          {activeItem === "Payroll Processing" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-rose-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Staff Payroll</h2>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="space-y-4">
                    {staffPayroll.map((staff) => (
                      <div key={staff.id} className="bg-white/5 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-white">{staff.name}</div>
                            <div className="text-sm text-gray-300">{staff.role}</div>
                            <div className="text-sm text-gray-300">Salary: ₹{staff.salary.toLocaleString()} | Tips: ₹{staff.tips.toLocaleString()}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-white">₹{staff.total.toLocaleString()}</div>
                            <div className={`text-sm font-medium px-2 py-1 rounded ${
                              staff.status === 'Pending' ? 'bg-yellow-500/30 text-yellow-300' : 'bg-green-500/30 text-green-300'
                            }`}>
                              {staff.status}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm">
                            Process Payment
                          </button>
                          <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold text-sm">
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold shadow transition">
                      Process All Payments
                    </button>
                    <button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold shadow transition">
                      Generate Payroll Report
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Dealer Tips */}
          {activeItem === "Dealer Tips" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-yellow-600/30 via-orange-500/20 to-red-700/30 rounded-xl shadow-md border border-yellow-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Dealer Tips Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Tip Percentage Settings</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Club Hold Percentage</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="range" 
                            min="0" 
                            max="50" 
                            value={dealerTipPercentage}
                            onChange={(e) => setDealerTipPercentage(e.target.value)}
                            className="flex-1"
                          />
                          <span className="text-white font-semibold w-16">{dealerTipPercentage}%</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Club holds {dealerTipPercentage}% of tips, dealers get {100 - dealerTipPercentage}%
                        </div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-lg">
                        <div className="text-sm text-gray-300">Total Tips Today: ₹15,000</div>
                        <div className="text-sm text-gray-300">Club Share: ₹{Math.round(15000 * dealerTipPercentage / 100).toLocaleString()}</div>
                        <div className="text-sm text-gray-300">Dealer Share: ₹{Math.round(15000 * (100 - dealerTipPercentage) / 100).toLocaleString()}</div>
                      </div>
                      <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Update Percentage
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Dealer Tip Distribution</h3>
                    <div className="space-y-3">
                      <div className="bg-white/5 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-white">Alice Brown</div>
                            <div className="text-sm text-gray-300">Dealer - Table 1</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-white">₹2,500</div>
                            <div className="text-xs text-gray-400">8 hours</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-white">Carol White</div>
                            <div className="text-sm text-gray-300">Dealer - Table 2</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-white">₹2,000</div>
                            <div className="text-xs text-gray-400">6 hours</div>
                          </div>
                        </div>
                      </div>
                      <button className="w-full bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Process Tip Distribution
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Batch Operations */}
          {activeItem === "Batch Operations" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-indigo-600/30 via-blue-500/20 to-cyan-700/30 rounded-xl shadow-md border border-indigo-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Batch Processing</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Transaction Batch</h3>
                    <div className="space-y-3">
                      <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Process All Deposits
                      </button>
                      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Process All Withdrawals
                      </button>
                      <button className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Reconcile All Transactions
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Payroll Batch</h3>
                    <div className="space-y-3">
                      <button className="w-full bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Process All Salaries
                      </button>
                      <button className="w-full bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Process All Tips
                      </button>
                      <button className="w-full bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Generate Payroll Report
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">System Operations</h3>
                    <div className="space-y-3">
                      <button className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                        End All Shifts
                      </button>
                      <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Backup Data
                      </button>
                      <button className="w-full bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold">
                        System Maintenance
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Reports & Analytics */}
          {activeItem === "Reports & Analytics" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-emerald-600/30 via-green-500/20 to-teal-700/30 rounded-xl shadow-md border border-emerald-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Financial Reports</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-4 rounded-xl font-semibold shadow transition">
                    Daily Revenue Report
                  </button>
                  <button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white px-6 py-4 rounded-xl font-semibold shadow transition">
                    Transaction Summary
                  </button>
                  <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-4 rounded-xl font-semibold shadow transition">
                    Payroll Report
                  </button>
                  <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white px-6 py-4 rounded-xl font-semibold shadow transition">
                    Shift Reconciliation
                  </button>
                  <button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white px-6 py-4 rounded-xl font-semibold shadow transition">
                    Cash Flow Analysis
                  </button>
                  <button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-6 py-4 rounded-xl font-semibold shadow transition">
                    Export All Data
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* Settings */}
          {activeItem === "Settings" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-gray-600/30 via-gray-500/20 to-gray-700/30 rounded-xl shadow-md border border-gray-800/40">
                <h2 className="text-xl font-bold text-white mb-6">System Settings</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Transaction Settings</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Maximum Transaction Amount</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="100000" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Auto-approval Limit</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="10000" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Transaction Timeout (minutes)</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="30" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Payroll Settings</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Default Tip Percentage</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="15" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Payroll Processing Day</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>1st of Month</option>
                          <option>15th of Month</option>
                          <option>Last Day of Month</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Auto-process Payroll</label>
                        <input type="checkbox" className="mt-1" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-semibold">
                    Save Settings
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold">
                    Reset to Default
                  </button>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
