import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatSection from "./ChatSection";

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

  // Orders state with status tracking
  const [orders, setOrders] = useState([
    { 
      id: "ORD001", 
      orderNumber: "#001", 
      playerName: "Alex Johnson", 
      playerId: "P101",
      tableNumber: "Table 1", 
      items: [
        { name: "Chicken Biryani", quantity: 2, price: 250 },
        { name: "Mutton Curry", quantity: 1, price: 300 }
      ],
      totalAmount: 800,
      status: "processing", // pending, processing, ready, delivered, cancelled
      specialInstructions: "Less spicy please",
      orderDate: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      processedBy: "FNB Manager",
      sentToChef: true,
      chefAssigned: "Chef Raj",
      statusHistory: [
        { status: "pending", timestamp: new Date(Date.now() - 30 * 60 * 1000), updatedBy: "Player" },
        { status: "processing", timestamp: new Date(Date.now() - 25 * 60 * 1000), updatedBy: "FNB Manager" }
      ]
    },
    { 
      id: "ORD002", 
      orderNumber: "#002", 
      playerName: "Maria Garcia", 
      playerId: "P102",
      tableNumber: "Table 3", 
      items: [
        { name: "Fish Fry", quantity: 1, price: 200 },
        { name: "Vegetable Pulao", quantity: 2, price: 180 }
      ],
      totalAmount: 560,
      status: "ready",
      specialInstructions: "",
      orderDate: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      processedBy: "FNB Manager",
      sentToChef: true,
      chefAssigned: "Chef Priya",
      statusHistory: [
        { status: "pending", timestamp: new Date(Date.now() - 45 * 60 * 1000), updatedBy: "Player" },
        { status: "processing", timestamp: new Date(Date.now() - 40 * 60 * 1000), updatedBy: "FNB Manager" },
        { status: "ready", timestamp: new Date(Date.now() - 5 * 60 * 1000), updatedBy: "Chef Priya" }
      ]
    },
    { 
      id: "ORD003", 
      orderNumber: "#003", 
      playerName: "Rajesh Kumar", 
      playerId: "P103",
      tableNumber: "Table 2", 
      items: [
        { name: "Samosa", quantity: 5, price: 50 },
        { name: "Tea", quantity: 2, price: 30 }
      ],
      totalAmount: 310,
      status: "pending",
      specialInstructions: "",
      orderDate: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      processedBy: null,
      sentToChef: false,
      chefAssigned: null,
      statusHistory: [
        { status: "pending", timestamp: new Date(Date.now() - 10 * 60 * 1000), updatedBy: "Player" }
      ]
    },
    { 
      id: "ORD004", 
      orderNumber: "#004", 
      playerName: "Priya Sharma", 
      playerId: "P104",
      tableNumber: "Table 1", 
      items: [
        { name: "Chicken Biryani", quantity: 1, price: 250 },
        { name: "Fresh Juice", quantity: 1, price: 80 }
      ],
      totalAmount: 330,
      status: "delivered",
      specialInstructions: "Extra raita",
      orderDate: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      processedBy: "FNB Manager",
      sentToChef: true,
      chefAssigned: "Chef Raj",
      deliveredAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      statusHistory: [
        { status: "pending", timestamp: new Date(Date.now() - 90 * 60 * 1000), updatedBy: "Player" },
        { status: "processing", timestamp: new Date(Date.now() - 85 * 60 * 1000), updatedBy: "FNB Manager" },
        { status: "ready", timestamp: new Date(Date.now() - 20 * 60 * 1000), updatedBy: "Chef Raj" },
        { status: "delivered", timestamp: new Date(Date.now() - 15 * 60 * 1000), updatedBy: "FNB Manager" }
      ]
    }
  ]);

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

  // Status update handler
  const handleStatusUpdate = (orderId, newStatus) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updatedOrder = { ...order };
        
        // Handle status transitions
        if (newStatus === "processing" && order.status === "pending") {
          updatedOrder.processedBy = "FNB Manager";
          updatedOrder.sentToChef = true;
          updatedOrder.chefAssigned = order.chefAssigned || "Chef Kitchen";
        } else if (newStatus === "ready") {
          // Chef marks as ready
        } else if (newStatus === "delivered") {
          updatedOrder.deliveredAt = new Date().toISOString();
        }
        
        updatedOrder.status = newStatus;
        updatedOrder.statusHistory = [
          ...order.statusHistory,
          { status: newStatus, timestamp: new Date().toISOString(), updatedBy: newStatus === "processing" ? "FNB Manager" : newStatus === "ready" ? order.chefAssigned || "Chef" : "FNB Manager" }
        ];
        
        return updatedOrder;
      }
      return order;
    }));
    
    const order = orders.find(o => o.id === orderId);
    alert(`Order ${orderId} status updated to: ${newStatus.toUpperCase()}\n\nThis status will be visible to ${order.playerName} in the Player Portal.`);
  };

  // Get status color and badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-500/30 text-yellow-300", label: "Pending", icon: "⏳" },
      processing: { color: "bg-blue-500/30 text-blue-300", label: "Processing", icon: "👨‍🍳" },
      ready: { color: "bg-green-500/30 text-green-300", label: "Ready", icon: "✅" },
      delivered: { color: "bg-emerald-500/30 text-emerald-300", label: "Delivered", icon: "🚀" },
      cancelled: { color: "bg-red-500/30 text-red-300", label: "Cancelled", icon: "❌" }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  // Filter orders by status
  const [orderFilter, setOrderFilter] = useState("all");

  const filteredOrders = orderFilter === "all" 
    ? orders 
    : orders.filter(order => order.status === orderFilter);

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
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                  { title: "Total Menu Items", value: "45", color: "from-orange-400 via-red-500 to-pink-500" },
                  { title: "Low Stock Items", value: "8", color: "from-red-400 via-pink-500 to-rose-500" },
                  { title: "Active Orders", value: "12", color: "from-yellow-400 via-orange-500 to-red-500" },
                  { title: "Today's Revenue", value: "₹15,250", color: "from-green-400 via-emerald-500 to-teal-500" },
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

              {/* Menu Management */}
              <section className="p-6 bg-gradient-to-r from-orange-600/30 via-red-500/20 to-pink-700/30 rounded-xl shadow-md border border-orange-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Menu Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Add Menu Item</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Item Name</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter item name" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Category</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Appetizers</option>
                          <option>Main Course</option>
                          <option>Beverages</option>
                          <option>Desserts</option>
                          <option>Snacks</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Price</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Description</label>
                        <textarea className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" rows="3" placeholder="Item description..."></textarea>
                      </div>
                      <div>
                        <label className="text-white text-sm">Availability</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Available</option>
                          <option>Out of Stock</option>
                          <option>Limited</option>
                        </select>
                      </div>
                      <button className="w-full bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Add Menu Item
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Menu Categories</h3>
                    <div className="space-y-2">
                      <div className="bg-orange-500/20 p-3 rounded-lg border border-orange-400/30">
                        <div className="font-semibold text-white">Appetizers</div>
                        <div className="text-sm text-gray-300">12 items | Avg. Price: ₹150</div>
                      </div>
                      <div className="bg-orange-500/20 p-3 rounded-lg border border-orange-400/30">
                        <div className="font-semibold text-white">Main Course</div>
                        <div className="text-sm text-gray-300">18 items | Avg. Price: ₹350</div>
                      </div>
                      <div className="bg-orange-500/20 p-3 rounded-lg border border-orange-400/30">
                        <div className="font-semibold text-white">Beverages</div>
                        <div className="text-sm text-gray-300">8 items | Avg. Price: ₹80</div>
                      </div>
                      <div className="bg-orange-500/20 p-3 rounded-lg border border-orange-400/30">
                        <div className="font-semibold text-white">Desserts</div>
                        <div className="text-sm text-gray-300">7 items | Avg. Price: ₹120</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Inventory Management */}
              <section className="p-6 bg-gradient-to-r from-red-600/30 via-pink-500/20 to-rose-700/30 rounded-xl shadow-md border border-red-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Inventory Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Stock Management</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Item Name</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter item name" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Current Stock</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="0" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Minimum Stock Level</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="0" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Unit</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Pieces</option>
                          <option>Kg</option>
                          <option>Liters</option>
                          <option>Boxes</option>
                          <option>Packets</option>
                        </select>
                      </div>
                      <button className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Update Stock
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Low Stock Alerts</h3>
                    <div className="space-y-2">
                      <div className="bg-red-500/20 p-3 rounded-lg border border-red-400/30">
                        <div className="font-semibold text-white">Chicken Breast</div>
                        <div className="text-sm text-gray-300">Stock: 5 kg | Min: 10 kg</div>
                        <div className="text-xs text-red-300">Critical</div>
                      </div>
                      <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-400/30">
                        <div className="font-semibold text-white">Rice</div>
                        <div className="text-sm text-gray-300">Stock: 15 kg | Min: 20 kg</div>
                        <div className="text-xs text-yellow-300">Low</div>
                      </div>
                      <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-400/30">
                        <div className="font-semibold text-white">Cooking Oil</div>
                        <div className="text-sm text-gray-300">Stock: 8 liters | Min: 10 liters</div>
                        <div className="text-xs text-yellow-300">Low</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Order Management */}
          {activeItem === "Order Management" && (
            <div className="space-y-6">
              {/* All Orders View */}
              <section className="p-6 bg-gradient-to-r from-indigo-600/30 via-purple-500/20 to-pink-700/30 rounded-xl shadow-md border border-indigo-800/40">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">All Orders - Player Orders</h2>
                  <div className="flex gap-2">
                    <select 
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                      value={orderFilter}
                      onChange={(e) => setOrderFilter(e.target.value)}
                    >
                      <option value="all">All Orders</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="ready">Ready</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Workflow Info */}
                <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 mb-6">
                  <h3 className="text-white font-semibold mb-2">📋 Order Processing Workflow</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <span>1. Player places order</span>
                    <span>→</span>
                    <span>2. FNB Manager processes & sends to Chef</span>
                    <span>→</span>
                    <span>3. Chef prepares food</span>
                    <span>→</span>
                    <span>4. Status updates visible in Player Portal</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Status updates are automatically synced to the Player Portal for real-time visibility.</p>
                </div>

                <div className="space-y-4">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                      <div key={order.id} className="bg-white/10 p-5 rounded-lg border border-white/20">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                          {/* Order Info */}
                          <div className="lg:col-span-8">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold text-white">{order.orderNumber}</h3>
                                  {getStatusBadge(order.status)}
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-300">
                                  <div>
                                    <span className="text-gray-400">Player:</span> <span className="text-white font-medium">{order.playerName}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Table:</span> <span className="text-white">{order.tableNumber}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Order Time:</span> <span className="text-white">{new Date(order.orderDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Total:</span> <span className="text-green-300 font-semibold">₹{order.totalAmount}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Order Items */}
                            <div className="mb-3">
                              <div className="text-xs text-gray-400 mb-1">Order Items:</div>
                              <div className="bg-white/5 p-3 rounded border border-white/10">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="text-sm text-gray-300 mb-1 last:mb-0">
                                    <span className="text-white">{item.quantity}x</span> {item.name} - <span className="text-green-300">₹{item.price * item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Special Instructions */}
                            {order.specialInstructions && (
                              <div className="mb-3">
                                <div className="text-xs text-gray-400 mb-1">Special Instructions:</div>
                                <div className="bg-purple-500/20 p-2 rounded border border-purple-400/30 text-sm text-purple-200">
                                  {order.specialInstructions}
                                </div>
                              </div>
                            )}

                            {/* Workflow Status */}
                            <div className="mb-3">
                              <div className="text-xs text-gray-400 mb-2">Processing Status:</div>
                              <div className="grid grid-cols-3 gap-2">
                                <div className={`p-2 rounded text-xs text-center ${order.status !== "pending" ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-400"}`}>
                                  ✓ Processed by FNB Manager
                                </div>
                                <div className={`p-2 rounded text-xs text-center ${order.sentToChef ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-400"}`}>
                                  {order.sentToChef ? "✓ Sent to Chef" : "Pending"}
                                </div>
                                <div className={`p-2 rounded text-xs text-center ${order.status === "ready" || order.status === "delivered" ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-400"}`}>
                                  {order.chefAssigned ? `Chef: ${order.chefAssigned}` : "Chef: Pending"}
                                </div>
                              </div>
                            </div>

                            {/* Status History */}
                            <div className="mt-3">
                              <div className="text-xs text-gray-400 mb-1">Status Timeline:</div>
                              <div className="space-y-1">
                                {order.statusHistory.slice().reverse().slice(0, 3).map((history, idx) => (
                                  <div key={idx} className="text-xs text-gray-400">
                                    <span className="text-white">{history.status.toUpperCase()}</span> - {new Date(history.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} by {history.updatedBy}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Status Update Actions */}
                          <div className="lg:col-span-4 flex flex-col gap-2">
                            <div className="bg-white/5 p-3 rounded border border-white/10">
                              <div className="text-sm font-semibold text-white mb-2">Update Order Status</div>
                              <div className="space-y-2">
                                {order.status === "pending" && (
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Process order ${order.orderNumber} and send to Chef?`)) {
                                        handleStatusUpdate(order.id, "processing");
                                      }
                                    }}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-sm font-semibold"
                                  >
                                    📤 Process & Send to Chef
                                  </button>
                                )}
                                {order.status === "processing" && (
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Mark order ${order.orderNumber} as ready?`)) {
                                        handleStatusUpdate(order.id, "ready");
                                      }
                                    }}
                                    className="w-full bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded text-sm font-semibold"
                                  >
                                    ✅ Mark as Ready
                                  </button>
                                )}
                                {order.status === "ready" && (
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Mark order ${order.orderNumber} as delivered?`)) {
                                        handleStatusUpdate(order.id, "delivered");
                                      }
                                    }}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded text-sm font-semibold"
                                  >
                                    🚀 Mark as Delivered
                                  </button>
                                )}
                                <select
                                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                                  value={order.status}
                                  onChange={(e) => {
                                    if (window.confirm(`Change order ${order.orderNumber} status to ${e.target.value}?`)) {
                                      handleStatusUpdate(order.id, e.target.value);
                                    } else {
                                      e.target.value = order.status;
                                    }
                                  }}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="processing">Processing</option>
                                  <option value="ready">Ready</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                                <p className="text-xs text-gray-400 mt-1">Select status or use quick actions above</p>
                              </div>
                            </div>
                            {order.status === "delivered" && order.deliveredAt && (
                              <div className="bg-emerald-500/20 p-2 rounded border border-emerald-400/30 text-xs text-emerald-300">
                                ✓ Delivered at {new Date(order.deliveredAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      No orders found with selected filter
                    </div>
                  )}
                </div>
              </section>

              {/* Quick Order Processing */}
              <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Quick Order Processing</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">New Order</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Poker Table Number</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Table 1" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Player Name</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Player name" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Select Items</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Chicken Biryani - ₹250</option>
                          <option>Mutton Curry - ₹300</option>
                          <option>Fish Fry - ₹200</option>
                          <option>Vegetable Pulao - ₹180</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Quantity</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="1" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Special Instructions</label>
                        <textarea className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" rows="2" placeholder="Any special requests..."></textarea>
                      </div>
                      <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Add to Order
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Active Orders</h3>
                    <div className="space-y-2">
                      <div className="bg-green-500/20 p-3 rounded-lg border border-green-400/30">
                        <div className="font-semibold text-white">Order #001 - Poker Table 1</div>
                        <div className="text-sm text-gray-300">2x Chicken Biryani, 1x Mutton Curry</div>
                        <div className="text-xs text-green-300">Status: Preparing</div>
                        <div className="mt-2 flex gap-2">
                          <button className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-sm">
                            Ready
                          </button>
                          <button className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-sm">
                            Cancel
                          </button>
                        </div>
                      </div>
                      <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-400/30">
                        <div className="font-semibold text-white">Order #002 - Poker Table 3</div>
                        <div className="text-sm text-gray-300">1x Fish Fry, 2x Vegetable Pulao</div>
                        <div className="text-xs text-yellow-300">Status: Pending</div>
                        <div className="mt-2 flex gap-2">
                          <button className="bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded text-sm">
                            Start
                          </button>
                          <button className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-sm">
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-6 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-purple-700/30 rounded-xl shadow-md border border-blue-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Bill Generation</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Generate Bill</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Order Number</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Order #001" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Poker Table Number</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Table 1" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Player Name</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Player name" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Discount (%)</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="0" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Tax (%)</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="18" />
                      </div>
                      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Generate Bill
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Bill Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Subtotal:</span>
                        <span className="text-white">₹750.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Discount (10%):</span>
                        <span className="text-green-300">-₹75.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Tax (18%):</span>
                        <span className="text-white">₹121.50</span>
                      </div>
                      <div className="flex justify-between border-t border-white/20 pt-2">
                        <span className="text-white font-bold">Total:</span>
                        <span className="text-white font-bold">₹796.50</span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Print Bill
                      </button>
                      <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Email Bill
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
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-teal-600/30 via-cyan-500/20 to-blue-700/30 rounded-xl shadow-md border border-teal-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Supplier Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Add Supplier</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Supplier Name</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter supplier name" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Contact Person</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Contact person name" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Phone Number</label>
                        <input type="tel" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Phone number" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Email</label>
                        <input type="email" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Email address" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Specialization</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Meat & Poultry</option>
                          <option>Vegetables</option>
                          <option>Spices</option>
                          <option>Dairy</option>
                          <option>Beverages</option>
                        </select>
                      </div>
                      <button className="w-full bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Add Supplier
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Active Suppliers</h3>
                    <div className="space-y-2">
                      <div className="bg-teal-500/20 p-3 rounded-lg border border-teal-400/30">
                        <div className="font-semibold text-white">Fresh Foods Ltd.</div>
                        <div className="text-sm text-gray-300">Contact: John Smith | Meat & Poultry</div>
                        <div className="text-xs text-teal-300">Phone: +91 98765 43210</div>
                      </div>
                      <div className="bg-teal-500/20 p-3 rounded-lg border border-teal-400/30">
                        <div className="font-semibold text-white">Green Vegetables Co.</div>
                        <div className="text-sm text-gray-300">Contact: Maria Garcia | Vegetables</div>
                        <div className="text-xs text-teal-300">Phone: +91 98765 43211</div>
                      </div>
                      <div className="bg-teal-500/20 p-3 rounded-lg border border-teal-400/30">
                        <div className="font-semibold text-white">Spice World</div>
                        <div className="text-sm text-gray-300">Contact: David Wilson | Spices</div>
                        <div className="text-xs text-teal-300">Phone: +91 98765 43212</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Kitchen Operations */}
          {activeItem === "Kitchen Operations" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-pink-600/30 via-rose-500/20 to-red-700/30 rounded-xl shadow-md border border-pink-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Kitchen Operations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Station 1 - Quick Snacks</h3>
                    <div className="space-y-2">
                      <div className="bg-pink-500/20 p-2 rounded border border-pink-400/30">
                        <div className="font-semibold text-white text-sm">Samosa (5 orders)</div>
                        <div className="text-xs text-pink-300">Status: In Progress</div>
                      </div>
                      <div className="bg-pink-500/20 p-2 rounded border border-pink-400/30">
                        <div className="font-semibold text-white text-sm">Pakora (3 orders)</div>
                        <div className="text-xs text-pink-300">Status: Ready</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Station 2 - Main Meals</h3>
                    <div className="space-y-2">
                      <div className="bg-pink-500/20 p-2 rounded border border-pink-400/30">
                        <div className="font-semibold text-white text-sm">Chicken Biryani (8 orders)</div>
                        <div className="text-xs text-pink-300">Status: In Progress</div>
                      </div>
                      <div className="bg-pink-500/20 p-2 rounded border border-pink-400/30">
                        <div className="font-semibold text-white text-sm">Mutton Curry (4 orders)</div>
                        <div className="text-xs text-pink-300">Status: Ready</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Station 3 - Drinks & Beverages</h3>
                    <div className="space-y-2">
                      <div className="bg-pink-500/20 p-2 rounded border border-pink-400/30">
                        <div className="font-semibold text-white text-sm">Fresh Juice (6 orders)</div>
                        <div className="text-xs text-pink-300">Status: Ready</div>
                      </div>
                      <div className="bg-pink-500/20 p-2 rounded border border-pink-400/30">
                        <div className="font-semibold text-white text-sm">Tea/Coffee (12 orders)</div>
                        <div className="text-xs text-pink-300">Status: In Progress</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
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