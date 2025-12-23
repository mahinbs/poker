import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ChatSection from "../../components/ChatSection";
import FNBSections from "../../components/FNBSections";
import AllOrdersView from "../../components/AllOrdersView";
import FnbSidebar from "../../components/sidebars/FnbSidebar";

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

  // Orders state - Today's orders
  const [orders, setOrders] = useState([
    {
      id: "ORD001",
      orderNumber: "#001",
      playerName: "Alex Johnson",
      playerId: "P101",
      tableNumber: "Table 1",
      items: [
        { name: "Chicken Biryani", quantity: 2, price: 250 },
        { name: "Mutton Curry", quantity: 1, price: 300 },
      ],
      totalAmount: 800,
      status: "processing",
      specialInstructions: "Less spicy please",
      orderDate: new Date().toISOString(),
      processedBy: "FNB Manager",
      sentToChef: true,
      chefAssigned: "Chef Raj",
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          updatedBy: "Player",
        },
        {
          status: "processing",
          timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          updatedBy: "FNB Manager",
        },
      ],
    },
    {
      id: "ORD002",
      orderNumber: "#002",
      playerName: "Maria Garcia",
      playerId: "P102",
      tableNumber: "Table 3",
      items: [
        { name: "Fish Fry", quantity: 1, price: 200 },
        { name: "Vegetable Pulao", quantity: 2, price: 180 },
      ],
      totalAmount: 560,
      status: "ready",
      specialInstructions: "",
      orderDate: new Date().toISOString(),
      processedBy: "FNB Manager",
      sentToChef: true,
      chefAssigned: "Chef Priya",
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          updatedBy: "Player",
        },
        {
          status: "processing",
          timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
          updatedBy: "FNB Manager",
        },
        {
          status: "ready",
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          updatedBy: "Chef Priya",
        },
      ],
    },
    {
      id: "ORD003",
      orderNumber: "#003",
      playerName: "Rajesh Kumar",
      playerId: "P103",
      tableNumber: "Table 2",
      items: [
        { name: "Samosa", quantity: 5, price: 50 },
        { name: "Tea", quantity: 2, price: 30 },
      ],
      totalAmount: 310,
      status: "pending",
      specialInstructions: "",
      orderDate: new Date().toISOString(),
      processedBy: null,
      sentToChef: false,
      chefAssigned: null,
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          updatedBy: "Player",
        },
      ],
    },
    {
      id: "ORD004",
      orderNumber: "#004",
      playerName: "Priya Sharma",
      playerId: "P104",
      tableNumber: "Table 1",
      items: [
        { name: "Chicken Biryani", quantity: 1, price: 250 },
        { name: "Fresh Juice", quantity: 1, price: 80 },
      ],
      totalAmount: 330,
      status: "delivered",
      specialInstructions: "Extra raita",
      orderDate: new Date().toISOString(),
      processedBy: "FNB Manager",
      sentToChef: true,
      chefAssigned: "Chef Raj",
      deliveredAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
          updatedBy: "Player",
        },
        {
          status: "processing",
          timestamp: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
          updatedBy: "FNB Manager",
        },
        {
          status: "ready",
          timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          updatedBy: "Chef Raj",
        },
        {
          status: "delivered",
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          updatedBy: "FNB Manager",
        },
      ],
    },
    {
      id: "ORD005",
      orderNumber: "#005",
      playerName: "Amit Patel",
      playerId: "P105",
      tableNumber: "Table 4",
      items: [
        { name: "Chicken Biryani", quantity: 3, price: 250 },
        { name: "Mutton Curry", quantity: 2, price: 300 },
      ],
      totalAmount: 1350,
      status: "delivered",
      specialInstructions: "",
      orderDate: new Date().toISOString(),
      processedBy: "FNB Manager",
      sentToChef: true,
      chefAssigned: "Chef Raj",
      deliveredAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
          updatedBy: "Player",
        },
        {
          status: "processing",
          timestamp: new Date(Date.now() - 115 * 60 * 1000).toISOString(),
          updatedBy: "FNB Manager",
        },
        {
          status: "ready",
          timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
          updatedBy: "Chef Raj",
        },
        {
          status: "delivered",
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          updatedBy: "FNB Manager",
        },
      ],
    },
    {
      id: "ORD006",
      orderNumber: "#006",
      playerName: "John Doe",
      playerId: "P106",
      tableNumber: "Table 2",
      items: [
        { name: "Fish Fry", quantity: 2, price: 200 },
        { name: "Tea", quantity: 3, price: 30 },
      ],
      totalAmount: 490,
      status: "processing",
      specialInstructions: "Extra spicy",
      orderDate: new Date().toISOString(),
      processedBy: "FNB Manager",
      sentToChef: true,
      chefAssigned: "Chef Priya",
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          updatedBy: "Player",
        },
        {
          status: "processing",
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          updatedBy: "FNB Manager",
        },
      ],
    },
  ]);

  // Status update handler
  const handleStatusUpdate = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
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
            {
              status: newStatus,
              timestamp: new Date().toISOString(),
              updatedBy:
                newStatus === "processing"
                  ? "FNB Manager"
                  : newStatus === "ready"
                    ? order.chefAssigned || "Chef"
                    : "FNB Manager",
            },
          ];

          return updatedOrder;
        }
        return order;
      })
    );

    const order = orders.find((o) => o.id === orderId);
    alert(
      `Order ${orderId} status updated to: ${newStatus.toUpperCase()}\n\nThis status will be visible to ${order.playerName} in the Player Portal.`
    );
  };

  // Calculate today's statistics
  const todayStats = useMemo(() => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter((order) => {
      const orderDate = new Date(order.orderDate).toDateString();
      return orderDate === today;
    });

    const totalRevenue = todayOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const totalOrders = todayOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Count items
    const itemCounts = {};
    todayOrders.forEach((order) => {
      order.items.forEach((item) => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
      });
    });

    const topItem = Object.entries(itemCounts).sort(
      (a, b) => b[1] - a[1]
    )[0];

    // Status counts
    const statusCounts = {
      pending: todayOrders.filter((o) => o.status === "pending").length,
      processing: todayOrders.filter((o) => o.status === "processing").length,
      ready: todayOrders.filter((o) => o.status === "ready").length,
      delivered: todayOrders.filter((o) => o.status === "delivered").length,
      cancelled: todayOrders.filter((o) => o.status === "cancelled").length,
    };

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      topItem: topItem ? topItem[0] : "N/A",
      topItemCount: topItem ? topItem[1] : 0,
      statusCounts,
    };
  }, [orders]);

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
      <div className="flex">
        {/* Sidebar */}
        <FnbSidebar
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          menuItems={menuItems}
          onSignOut={handleSignOut}
        />

        {/* Main Section */}
        <main className="flex-1 lg:ml-0 min-w-0">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 sm:py-10 space-y-8">
          {/* Header */}
          <header className="bg-gradient-to-r from-orange-600 via-red-500 to-pink-400 p-6 rounded-xl shadow-md flex justify-between items-center mt-16 lg:mt-0">
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
              {/* Today's Analytics Dashboard */}
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-indigo-500/20 to-blue-700/30 rounded-xl shadow-md border border-purple-800/40">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">
                    Today's Analytics Dashboard
                  </h2>
                  <div className="text-sm text-gray-300">
                    {new Date().toLocaleDateString("en-IN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Today's Summary
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total Orders:</span>
                        <span className="text-white font-bold">
                          {todayStats.totalOrders}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Revenue:</span>
                        <span className="text-green-300 font-bold">
                          ₹{todayStats.totalRevenue.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Avg. Order Value:</span>
                        <span className="text-white font-bold">
                          ₹{Math.round(todayStats.avgOrderValue).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Top Item:</span>
                        <span className="text-yellow-300 font-bold">
                          {todayStats.topItem} ({todayStats.topItemCount}x)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Order Status Breakdown
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Pending:</span>
                        <span className="text-yellow-300 font-bold">
                          {todayStats.statusCounts.pending}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Processing:</span>
                        <span className="text-blue-300 font-bold">
                          {todayStats.statusCounts.processing}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Ready:</span>
                        <span className="text-green-300 font-bold">
                          {todayStats.statusCounts.ready}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Delivered:</span>
                        <span className="text-emerald-300 font-bold">
                          {todayStats.statusCounts.delivered}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Performance Metrics
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Completion Rate:</span>
                        <span className="text-green-300 font-bold">
                          {todayStats.totalOrders > 0
                            ? Math.round(
                                (todayStats.statusCounts.delivered /
                                  todayStats.totalOrders) *
                                  100
                              )
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Active Orders:</span>
                        <span className="text-white font-bold">
                          {todayStats.statusCounts.pending +
                            todayStats.statusCounts.processing +
                            todayStats.statusCounts.ready}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Completed:</span>
                        <span className="text-emerald-300 font-bold">
                          {todayStats.statusCounts.delivered}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Cancelled:</span>
                        <span className="text-red-300 font-bold">
                          {todayStats.statusCounts.cancelled}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Today's Orders with Pagination */}
              <section className="p-6 bg-gradient-to-r from-orange-600/30 via-red-500/20 to-pink-700/30 rounded-xl shadow-md border border-orange-800/40">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">
                    Today's Orders
                  </h2>
                  <div className="text-sm text-gray-300">
                    {orders.length} order{orders.length !== 1 ? "s" : ""} today
                  </div>
                </div>
                <AllOrdersView orders={orders} onStatusUpdate={handleStatusUpdate} />
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
          </div>
        </main>
      </div>
    </div>
  );
}