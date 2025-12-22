import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatSection from "../../components/ChatSection";
import FNBSections from "../../components/FNBSections";

export default function FnbDashboard() {
  const [activeItem, setActiveItem] = useState("Menu & Inventory");
  const navigate = useNavigate();

  const menuItems = [
    "Menu & Inventory",
    "Order Management", 
    "Reports & Analytics",
    "Supplier Management",
    "Kitchen Operations",
    "Chat",
  ];

  const handleSignOut = () => {
    navigate("/fnb/signin");
  };

  // Chat/Support System State
  const [playerChats, setPlayerChats] = useState([
    {
      id: "PC001",
      playerId: "P001",
      playerName: "Alex Johnson",
      status: "open",
      lastMessage: "Need assistance with food order",
      lastMessageTime: new Date(Date.now() - 180000).toISOString(),
      messages: [
        {
          id: "M1",
          sender: "player",
          senderName: "Alex Johnson",
          text: "Need assistance with food order",
          timestamp: new Date(Date.now() - 180000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 600000).toISOString(),
    },
  ]);

  const [staffChats, setStaffChats] = useState([
    {
      id: "SC001",
      staffId: "ST001",
      staffName: "Sarah Johnson",
      staffRole: "Dealer",
      status: "open",
      lastMessage: "Need assistance with kitchen order",
      lastMessageTime: new Date(Date.now() - 300000).toISOString(),
      messages: [
        {
          id: "M3",
          sender: "staff",
          senderName: "Sarah Johnson",
          text: "Need assistance with kitchen order",
          timestamp: new Date(Date.now() - 300000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 300000).toISOString(),
    },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans">
      <div className="mx-auto max-w-[1400px] px-6 py-10 grid grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-3 xl:col-span-3 rounded-2xl bg-gradient-to-b from-orange-500/20 via-red-600/30 to-pink-700/30 p-5 shadow-lg border border-gray-800 min-w-0">
          <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-300 to-pink-400 drop-shadow-lg mb-6">
            FNB Portal
          </div>
          <div className="flex items-center mb-6 text-white min-w-0">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-gray-900 font-bold text-sm">F</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-semibold truncate">FNB Manager</div>
              <div className="text-sm opacity-80 truncate">fnb@pokerroom.com</div>
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
                    ? "bg-gradient-to-r from-orange-400 to-red-600 text-gray-900 font-bold shadow-lg scale-[1.02]"
                    : "bg-white/5 hover:bg-gradient-to-r hover:from-orange-400/20 hover:to-red-500/20 text-white"
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
          <header className="bg-gradient-to-r from-orange-600 via-red-500 to-pink-400 p-6 rounded-xl shadow-md flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">FNB Portal - {activeItem}</h1>
              <p className="text-gray-200 mt-1">Manage poker club F&B service, menu, and player orders</p>
            </div>
            <button 
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
            >
              Sign Out
            </button>
          </header>

          {/* Dynamic Content Based on Active Item */}
          {activeItem === "Menu & Inventory" && (
            <FNBSections forceTab="menu-inventory" />
          )}

          {/* Order Management */}
          {activeItem === "Order Management" && (
            <FNBSections forceTab="order-management" />
          )}

          {/* Reports & Analytics */}
          {activeItem === "Reports & Analytics" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-indigo-500/20 to-blue-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Analytics Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Daily Report</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total Orders:</span>
                        <span className="text-white font-bold">45</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Revenue:</span>
                        <span className="text-green-300 font-bold">₹15,250</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Avg. Order Value:</span>
                        <span className="text-white font-bold">₹339</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Top Item:</span>
                        <span className="text-yellow-300 font-bold">Chicken Biryani</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Weekly Report</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total Orders:</span>
                        <span className="text-white font-bold">312</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Revenue:</span>
                        <span className="text-green-300 font-bold">₹98,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Growth:</span>
                        <span className="text-green-300 font-bold">+12%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Peak Day:</span>
                        <span className="text-yellow-300 font-bold">Saturday</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Monthly Report</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total Orders:</span>
                        <span className="text-white font-bold">1,245</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Revenue:</span>
                        <span className="text-green-300 font-bold">₹425,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Growth:</span>
                        <span className="text-green-300 font-bold">+18%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Best Category:</span>
                        <span className="text-yellow-300 font-bold">Main Course</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-6 bg-gradient-to-r from-cyan-600/30 via-blue-500/20 to-indigo-700/30 rounded-xl shadow-md border border-cyan-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Expense Logging</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Add Expense</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Expense Type</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Ingredients</option>
                          <option>Equipment</option>
                          <option>Utilities</option>
                          <option>Maintenance</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Amount</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Description</label>
                        <textarea className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" rows="3" placeholder="Expense description..."></textarea>
                      </div>
                      <div>
                        <label className="text-white text-sm">Date</label>
                        <input type="date" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" />
                      </div>
                      <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Log Expense
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Expenses</h3>
                    <div className="space-y-2">
                      <div className="bg-cyan-500/20 p-3 rounded-lg border border-cyan-400/30">
                        <div className="font-semibold text-white">Chicken Purchase</div>
                        <div className="text-sm text-gray-300">Amount: ₹2,500 | Type: Ingredients</div>
                        <div className="text-xs text-cyan-300">Today</div>
                      </div>
                      <div className="bg-cyan-500/20 p-3 rounded-lg border border-cyan-400/30">
                        <div className="font-semibold text-white">Gas Bill</div>
                        <div className="text-sm text-gray-300">Amount: ₹1,200 | Type: Utilities</div>
                        <div className="text-xs text-cyan-300">Yesterday</div>
                      </div>
                      <div className="bg-cyan-500/20 p-3 rounded-lg border border-cyan-400/30">
                        <div className="font-semibold text-white">Equipment Repair</div>
                        <div className="text-sm text-gray-300">Amount: ₹800 | Type: Maintenance</div>
                        <div className="text-xs text-cyan-300">2 days ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Supplier Management */}
          {activeItem === "Supplier Management" && (
            <FNBSections forceTab="supplier-management" />
          )}

          {/* Kitchen Operations */}
          {activeItem === "Kitchen Operations" && (
            <FNBSections forceTab="kitchen-operations" />
          )}

          {/* Chat */}
          {activeItem === "Chat" && (
            <ChatSection
              userRole="fnb"
              playerChats={playerChats}
              setPlayerChats={setPlayerChats}
              staffChats={staffChats}
              setStaffChats={setStaffChats}
            />
          )}
        </main>
      </div>
    </div>
  );
}