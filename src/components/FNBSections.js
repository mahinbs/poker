import React, { useState, useEffect, useRef } from "react";
import AllOrdersView from "./AllOrdersView";

export default function FNBSections({ forceTab = null }) {
  // Tab state
  const [activeTab, setActiveTab] = useState(
    forceTab || "menu-inventory"
  );

  // Sync with forceTab prop changes
  useEffect(() => {
    if (forceTab) {
      setActiveTab(forceTab);
    }
  }, [forceTab]);

  // Menu item form state
  const [menuItemImage, setMenuItemImage] = useState(null);
  const [menuItemImagePreview, setMenuItemImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Bill generation state
  const [billData, setBillData] = useState({
    orderNumber: "",
    tableNumber: "",
    playerName: "",
    discount: 0,
    tax: 18,
    subtotal: 0,
    orderItems: [],
  });
  const [generatedBill, setGeneratedBill] = useState(null);

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
        { name: "Mutton Curry", quantity: 1, price: 300 },
      ],
      totalAmount: 800,
      status: "processing", // pending, processing, ready, delivered, cancelled
      specialInstructions: "Less spicy please",
      orderDate: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      processedBy: "FNB Manager",
      sentToChef: true,
      chefAssigned: "Chef Raj",
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          updatedBy: "Player",
        },
        {
          status: "processing",
          timestamp: new Date(Date.now() - 25 * 60 * 1000),
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
      orderDate: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      processedBy: "FNB Manager",
      sentToChef: true,
      chefAssigned: "Chef Priya",
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          updatedBy: "Player",
        },
        {
          status: "processing",
          timestamp: new Date(Date.now() - 40 * 60 * 1000),
          updatedBy: "FNB Manager",
        },
        {
          status: "ready",
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
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
      orderDate: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      processedBy: null,
      sentToChef: false,
      chefAssigned: null,
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
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
      orderDate: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      processedBy: "FNB Manager",
      sentToChef: true,
      chefAssigned: "Chef Raj",
      deliveredAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date(Date.now() - 90 * 60 * 1000),
          updatedBy: "Player",
        },
        {
          status: "processing",
          timestamp: new Date(Date.now() - 85 * 60 * 1000),
          updatedBy: "FNB Manager",
        },
        {
          status: "ready",
          timestamp: new Date(Date.now() - 20 * 60 * 1000),
          updatedBy: "Chef Raj",
        },
        {
          status: "delivered",
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
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

  // Get status color and badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-500/30 text-yellow-300",
        label: "Pending",
        icon: "⏳",
      },
      processing: {
        color: "bg-blue-500/30 text-blue-300",
        label: "Processing",
        icon: "👨‍🍳",
      },
      ready: {
        color: "bg-green-500/30 text-green-300",
        label: "Ready",
        icon: "✅",
      },
      delivered: {
        color: "bg-emerald-500/30 text-emerald-300",
        label: "Delivered",
        icon: "🚀",
      },
      cancelled: {
        color: "bg-red-500/30 text-red-300",
        label: "Cancelled",
        icon: "❌",
      },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}
      >
        {config.icon} {config.label}
      </span>
    );
  };


  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      {!forceTab && (
        <div className="flex gap-2 border-b border-white/20 pb-4 flex-wrap">
          <button
            onClick={() => setActiveTab("menu-inventory")}
            className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
              activeTab === "menu-inventory"
                ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                : "bg-white/10 text-white/70 hover:bg-white/15"
            }`}
          >
            Menu & Inventory
          </button>
          <button
            onClick={() => setActiveTab("order-management")}
            className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
              activeTab === "order-management"
                ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                : "bg-white/10 text-white/70 hover:bg-white/15"
            }`}
          >
            Order Management
          </button>
          <button
            onClick={() => setActiveTab("supplier-management")}
            className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
              activeTab === "supplier-management"
                ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                : "bg-white/10 text-white/70 hover:bg-white/15"
            }`}
          >
            Supplier Management
          </button>
          <button
            onClick={() => setActiveTab("kitchen-operations")}
            className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
              activeTab === "kitchen-operations"
                ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                : "bg-white/10 text-white/70 hover:bg-white/15"
            }`}
          >
            Kitchen Operations
          </button>
        </div>
      )}

      {/* Menu & Inventory Tab */}
      {activeTab === "menu-inventory" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {[
              {
                title: "Total Menu Items",
                value: "45",
                color: "from-orange-400 via-red-500 to-pink-500",
              },
              {
                title: "Low Stock Items",
                value: "8",
                color: "from-red-400 via-pink-500 to-rose-500",
              },
              {
                title: "Active Orders",
                value: "12",
                color: "from-yellow-400 via-orange-500 to-red-500",
              },
              {
                title: "Today's Revenue",
                value: "₹15,250",
                color: "from-green-400 via-emerald-500 to-teal-500",
              },
            ].map((card, i) => (
              <div
                key={i}
                className={`p-6 rounded-xl bg-gradient-to-br ${card.color} text-gray-900 shadow-lg transition-transform transform hover:scale-105`}
              >
                <div className="text-sm opacity-90 text-white/90">
                  {card.title}
                </div>
                <div className="text-3xl font-bold mt-2 text-white">
                  {card.value}
                </div>
                <div className="text-xs mt-1 text-white/70">Real-time data</div>
              </div>
            ))}
          </div>

          {/* Menu Management */}
          <section className="p-6 bg-gradient-to-r from-orange-600/30 via-red-500/20 to-pink-700/30 rounded-xl shadow-md border border-orange-800/40">
            <h2 className="text-xl font-bold text-white mb-6">
              Menu Management
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Add Menu Item
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm">Item Name</label>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      placeholder="Enter item name"
                    />
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
                    <input
                      type="number"
                      className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      placeholder="₹0.00"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm">Description</label>
                    <textarea
                      className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      rows="3"
                      placeholder="Item description..."
                    ></textarea>
                  </div>
                  <div>
                    <label className="text-white text-sm mb-2 block">
                      Item Image
                    </label>
                    <div className="space-y-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            // Validate file type
                            if (!file.type.startsWith("image/")) {
                              alert("Please select a valid image file");
                              e.target.value = "";
                              return;
                            }
                            // Validate file size (max 5MB)
                            if (file.size > 5 * 1024 * 1024) {
                              alert("Image size should be less than 5MB");
                              e.target.value = "";
                              return;
                            }
                            setMenuItemImage(file);
                            // Create preview
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setMenuItemImagePreview(reader.result);
                            };
                            reader.readAsDataURL(file);
                          } else {
                            setMenuItemImage(null);
                            setMenuItemImagePreview(null);
                          }
                        }}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-500 cursor-pointer"
                      />
                      {menuItemImagePreview && (
                        <div className="relative">
                          <img
                            src={menuItemImagePreview}
                            alt="Menu item preview"
                            className="w-full h-48 object-cover rounded-lg border border-white/20"
                          />
                          <button
                            onClick={() => {
                              setMenuItemImage(null);
                              setMenuItemImagePreview(null);
                              // Reset file input
                              if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                              }
                            }}
                            className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold"
                          >
                            ✕ Remove
                          </button>
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                            {menuItemImage?.name}
                          </div>
                        </div>
                      )}
                      {!menuItemImagePreview && (
                        <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center">
                          <div className="text-gray-400 text-sm">
                            📷 No image selected
                          </div>
                          <div className="text-gray-500 text-xs mt-1">
                            Click "Choose File" to upload an image
                          </div>
                        </div>
                      )}
                    </div>
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
                <h3 className="text-lg font-semibold text-white mb-4">
                  Menu Categories
                </h3>
                <div className="space-y-2">
                  <div className="bg-orange-500/20 p-3 rounded-lg border border-orange-400/30">
                    <div className="font-semibold text-white">Appetizers</div>
                    <div className="text-sm text-gray-300">
                      12 items | Avg. Price: ₹150
                    </div>
                  </div>
                  <div className="bg-orange-500/20 p-3 rounded-lg border border-orange-400/30">
                    <div className="font-semibold text-white">Main Course</div>
                    <div className="text-sm text-gray-300">
                      18 items | Avg. Price: ₹350
                    </div>
                  </div>
                  <div className="bg-orange-500/20 p-3 rounded-lg border border-orange-400/30">
                    <div className="font-semibold text-white">Beverages</div>
                    <div className="text-sm text-gray-300">
                      8 items | Avg. Price: ₹80
                    </div>
                  </div>
                  <div className="bg-orange-500/20 p-3 rounded-lg border border-orange-400/30">
                    <div className="font-semibold text-white">Desserts</div>
                    <div className="text-sm text-gray-300">
                      7 items | Avg. Price: ₹120
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Inventory Management */}
          <section className="p-6 bg-gradient-to-r from-red-600/30 via-pink-500/20 to-rose-700/30 rounded-xl shadow-md border border-red-800/40">
            <h2 className="text-xl font-bold text-white mb-6">
              Inventory Management
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Stock Management
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm">Item Name</label>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      placeholder="Enter item name"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm">Current Stock</label>
                    <input
                      type="number"
                      className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm">
                      Minimum Stock Level
                    </label>
                    <input
                      type="number"
                      className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      placeholder="0"
                    />
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
                <h3 className="text-lg font-semibold text-white mb-4">
                  Low Stock Alerts
                </h3>
                <div className="space-y-2">
                  <div className="bg-red-500/20 p-3 rounded-lg border border-red-400/30">
                    <div className="font-semibold text-white">Chicken Breast</div>
                    <div className="text-sm text-gray-300">
                      Stock: 5 kg | Min: 10 kg
                    </div>
                    <div className="text-xs text-red-300">Critical</div>
                  </div>
                  <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-400/30">
                    <div className="font-semibold text-white">Rice</div>
                    <div className="text-sm text-gray-300">
                      Stock: 15 kg | Min: 20 kg
                    </div>
                    <div className="text-xs text-yellow-300">Low</div>
                  </div>
                  <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-400/30">
                    <div className="font-semibold text-white">Cooking Oil</div>
                    <div className="text-sm text-gray-300">
                      Stock: 8 liters | Min: 10 liters
                    </div>
                    <div className="text-xs text-yellow-300">Low</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Order Management Tab */}
      {activeTab === "order-management" && (
        <div className="space-y-6">
          {/* All Orders View */}
          <AllOrdersView orders={orders} onStatusUpdate={handleStatusUpdate} />

          {/* Quick Order Processing */}
          <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
            <h2 className="text-xl font-bold text-white mb-6">
              Quick Order Processing
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">
                  New Order
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm">
                      Poker Table Number
                    </label>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      placeholder="Table 1"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm">Player Name</label>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      placeholder="Player name"
                    />
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
                    <input
                      type="number"
                      className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm">
                      Special Instructions
                    </label>
                    <textarea
                      className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      rows="2"
                      placeholder="Any special requests..."
                    ></textarea>
                  </div>
                  <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                    Add to Order
                  </button>
                </div>
              </div>

              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Active Orders
                </h3>
                <div className="space-y-2">
                  <div className="bg-green-500/20 p-3 rounded-lg border border-green-400/30">
                    <div className="font-semibold text-white">
                      Order #001 - Poker Table 1
                    </div>
                    <div className="text-sm text-gray-300">
                      2x Chicken Biryani, 1x Mutton Curry
                    </div>
                    <div className="text-xs text-green-300">
                      Status: Preparing
                    </div>
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
                    <div className="font-semibold text-white">
                      Order #002 - Poker Table 3
                    </div>
                    <div className="text-sm text-gray-300">
                      1x Fish Fry, 2x Vegetable Pulao
                    </div>
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
            <h2 className="text-xl font-bold text-white mb-6">
              Bill Generation
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Generate Bill
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm">Select Order</label>
                    <select
                      className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      value={billData.orderNumber}
                      onChange={(e) => {
                        const orderId = e.target.value;
                        const selectedOrder = orders.find((o) => o.id === orderId);
                        if (selectedOrder) {
                          const subtotal = selectedOrder.items.reduce(
                            (sum, item) => sum + item.price * item.quantity,
                            0
                          );
                          setBillData({
                            ...billData,
                            orderNumber: selectedOrder.orderNumber,
                            tableNumber: selectedOrder.tableNumber,
                            playerName: selectedOrder.playerName,
                            orderItems: selectedOrder.items,
                            subtotal: subtotal,
                          });
                        } else {
                          setBillData({
                            ...billData,
                            orderNumber: "",
                            tableNumber: "",
                            playerName: "",
                            orderItems: [],
                            subtotal: 0,
                          });
                        }
                      }}
                    >
                      <option value="">-- Select Order --</option>
                      {orders.map((order) => (
                        <option key={order.id} value={order.id}>
                          {order.orderNumber} - {order.playerName} ({order.tableNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-white text-sm">Order Number</label>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      placeholder="Order #001"
                      value={billData.orderNumber}
                      onChange={(e) =>
                        setBillData({ ...billData, orderNumber: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm">
                      Poker Table Number
                    </label>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      placeholder="Table 1"
                      value={billData.tableNumber}
                      onChange={(e) =>
                        setBillData({ ...billData, tableNumber: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm">Player Name</label>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      placeholder="Player name"
                      value={billData.playerName}
                      onChange={(e) =>
                        setBillData({ ...billData, playerName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm">Discount (%)</label>
                    <input
                      type="number"
                      className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      placeholder="0"
                      value={billData.discount}
                      onChange={(e) =>
                        setBillData({
                          ...billData,
                          discount: parseFloat(e.target.value) || 0,
                        })
                      }
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm">Tax (%)</label>
                    <input
                      type="number"
                      className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      placeholder="18"
                      value={billData.tax}
                      onChange={(e) =>
                        setBillData({
                          ...billData,
                          tax: parseFloat(e.target.value) || 0,
                        })
                      }
                      min="0"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!billData.orderNumber || !billData.playerName) {
                        alert("Please fill in Order Number and Player Name");
                        return;
                      }
                      if (billData.subtotal <= 0) {
                        alert("Please select an order with items");
                        return;
                      }
                      const discountAmount =
                        (billData.subtotal * billData.discount) / 100;
                      const subtotalAfterDiscount =
                        billData.subtotal - discountAmount;
                      const taxAmount = (subtotalAfterDiscount * billData.tax) / 100;
                      const total = subtotalAfterDiscount + taxAmount;

                      const invoice = {
                        ...billData,
                        discountAmount: discountAmount,
                        subtotalAfterDiscount: subtotalAfterDiscount,
                        taxAmount: taxAmount,
                        total: total,
                        invoiceNumber: `INV-${Date.now()}`,
                        date: new Date().toLocaleString("en-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                      };
                      setGeneratedBill(invoice);
                      alert("Bill generated successfully!");
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold"
                  >
                    Generate Bill
                  </button>
                </div>
              </div>

              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Bill Summary
                </h3>
                {generatedBill ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Subtotal:</span>
                      <span className="text-white">
                        ₹{billData.subtotal.toFixed(2)}
                      </span>
                  </div>
                    {generatedBill.discountAmount > 0 && (
                  <div className="flex justify-between">
                        <span className="text-gray-300">
                          Discount ({billData.discount}%):
                        </span>
                        <span className="text-green-300">
                          -₹{generatedBill.discountAmount.toFixed(2)}
                        </span>
                  </div>
                    )}
                  <div className="flex justify-between">
                      <span className="text-gray-300">Tax ({billData.tax}%):</span>
                      <span className="text-white">
                        ₹{generatedBill.taxAmount.toFixed(2)}
                      </span>
                  </div>
                  <div className="flex justify-between border-t border-white/20 pt-2">
                    <span className="text-white font-bold">Total:</span>
                      <span className="text-white font-bold">
                        ₹{generatedBill.total.toFixed(2)}
                      </span>
                  </div>
                </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Subtotal:</span>
                      <span className="text-white">
                        ₹{billData.subtotal.toFixed(2)}
                      </span>
                    </div>
                    {billData.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">
                          Discount ({billData.discount}%):
                        </span>
                        <span className="text-green-300">
                          -₹{((billData.subtotal * billData.discount) / 100).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-300">Tax ({billData.tax}%):</span>
                      <span className="text-white">
                        ₹{(
                          ((billData.subtotal -
                            (billData.subtotal * billData.discount) / 100) *
                            billData.tax) /
                          100
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-white/20 pt-2">
                      <span className="text-white font-bold">Total:</span>
                      <span className="text-white font-bold">
                        ₹{(
                          billData.subtotal -
                          (billData.subtotal * billData.discount) / 100 +
                          ((billData.subtotal -
                            (billData.subtotal * billData.discount) / 100) *
                            billData.tax) /
                            100
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      if (!generatedBill) {
                        alert("Please generate a bill first");
                        return;
                      }
                      const printWindow = window.open("", "_blank");
                      const invoiceHTML = `
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <title>Invoice ${generatedBill.invoiceNumber}</title>
                            <style>
                              @media print {
                                body { margin: 0; }
                                .no-print { display: none; }
                              }
                              body {
                                font-family: Arial, sans-serif;
                                padding: 20px;
                                max-width: 800px;
                                margin: 0 auto;
                              }
                              .header {
                                text-align: center;
                                border-bottom: 2px solid #333;
                                padding-bottom: 20px;
                                margin-bottom: 30px;
                              }
                              .header h1 {
                                color: #333;
                                margin: 0;
                              }
                              .invoice-info {
                                display: flex;
                                justify-content: space-between;
                                margin-bottom: 30px;
                              }
                              .info-section {
                                flex: 1;
                              }
                              .info-section h3 {
                                color: #333;
                                border-bottom: 1px solid #ddd;
                                padding-bottom: 5px;
                                margin-bottom: 10px;
                              }
                              table {
                                width: 100%;
                                border-collapse: collapse;
                                margin-bottom: 20px;
                              }
                              th, td {
                                padding: 12px;
                                text-align: left;
                                border-bottom: 1px solid #ddd;
                              }
                              th {
                                background-color: #4CAF50;
                                color: white;
                              }
                              .text-right {
                                text-align: right;
                              }
                              .totals {
                                margin-top: 20px;
                                float: right;
                                width: 300px;
                              }
                              .totals table {
                                margin: 0;
                              }
                              .total-row {
                                font-weight: bold;
                                font-size: 1.2em;
                                border-top: 2px solid #333;
                              }
                              .footer {
                                margin-top: 50px;
                                text-align: center;
                                color: #666;
                                font-size: 0.9em;
                              }
                              .print-btn {
                                background-color: #4CAF50;
                                color: white;
                                padding: 10px 20px;
                                border: none;
                                border-radius: 5px;
                                cursor: pointer;
                                font-size: 16px;
                                margin-bottom: 20px;
                              }
                              .print-btn:hover {
                                background-color: #45a049;
                              }
                            </style>
                          </head>
                          <body>
                            <div class="no-print">
                              <button class="print-btn" onclick="window.print()">🖨️ Print Invoice</button>
                            </div>
                            <div class="header">
                              <h1>INVOICE</h1>
                              <p>Invoice #${generatedBill.invoiceNumber}</p>
                            </div>
                            <div class="invoice-info">
                              <div class="info-section">
                                <h3>Bill To:</h3>
                                <p><strong>${generatedBill.playerName}</strong></p>
                                <p>Table: ${generatedBill.tableNumber}</p>
                                <p>Order: ${generatedBill.orderNumber}</p>
                              </div>
                              <div class="info-section">
                                <h3>Invoice Details:</h3>
                                <p>Date: ${generatedBill.date}</p>
                                <p>Invoice #: ${generatedBill.invoiceNumber}</p>
                              </div>
                            </div>
                            <table>
                              <thead>
                                <tr>
                                  <th>Item</th>
                                  <th class="text-right">Quantity</th>
                                  <th class="text-right">Unit Price</th>
                                  <th class="text-right">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${generatedBill.orderItems
                                  .map(
                                    (item) => `
                                  <tr>
                                    <td>${item.name}</td>
                                    <td class="text-right">${item.quantity}</td>
                                    <td class="text-right">₹${item.price.toFixed(2)}</td>
                                    <td class="text-right">₹${(
                                      item.price * item.quantity
                                    ).toFixed(2)}</td>
                                  </tr>
                                `
                                  )
                                  .join("")}
                              </tbody>
                            </table>
                            <div class="totals">
                              <table>
                                <tr>
                                  <td>Subtotal:</td>
                                  <td class="text-right">₹${generatedBill.subtotal.toFixed(2)}</td>
                                </tr>
                                ${generatedBill.discountAmount > 0
                                  ? `
                                <tr>
                                  <td>Discount (${billData.discount}%):</td>
                                  <td class="text-right">-₹${generatedBill.discountAmount.toFixed(2)}</td>
                                </tr>
                                `
                                  : ""}
                                <tr>
                                  <td>Tax (${billData.tax}%):</td>
                                  <td class="text-right">₹${generatedBill.taxAmount.toFixed(2)}</td>
                                </tr>
                                <tr class="total-row">
                                  <td>Total:</td>
                                  <td class="text-right">₹${generatedBill.total.toFixed(2)}</td>
                                </tr>
                              </table>
                            </div>
                            <div class="footer">
                              <p>Thank you for your business!</p>
                              <p>Generated on ${generatedBill.date}</p>
                            </div>
                          </body>
                        </html>
                      `;
                      printWindow.document.write(invoiceHTML);
                      printWindow.document.close();
                    }}
                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold"
                  >
                    Print Bill
                  </button>
                  <button
                    onClick={() => {
                      if (!generatedBill) {
                        alert("Please generate a bill first");
                        return;
                      }
                      alert(
                        `Email functionality would send the invoice to ${generatedBill.playerName}.\n\nIn production, this would integrate with an email service to send the invoice.`
                      );
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold"
                  >
                    Email Bill
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Supplier Management Tab */}
      {activeTab === "supplier-management" && (
        <div className="space-y-6">
          <section className="p-6 bg-gradient-to-r from-teal-600/30 via-cyan-500/20 to-blue-700/30 rounded-xl shadow-md border border-teal-800/40">
            <h2 className="text-xl font-bold text-white mb-6">
              Supplier Management
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Add Supplier
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm">Supplier Name</label>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      placeholder="Enter supplier name"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm">Contact Person</label>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      placeholder="Contact person name"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm">Phone Number</label>
                    <input
                      type="tel"
                      className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm">Email</label>
                    <input
                      type="email"
                      className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      placeholder="Email address"
                    />
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
                <h3 className="text-lg font-semibold text-white mb-4">
                  Active Suppliers
                </h3>
                <div className="space-y-2">
                  <div className="bg-teal-500/20 p-3 rounded-lg border border-teal-400/30">
                    <div className="font-semibold text-white">
                      Fresh Foods Ltd.
                    </div>
                    <div className="text-sm text-gray-300">
                      Contact: John Smith | Meat & Poultry
                    </div>
                    <div className="text-xs text-teal-300">
                      Phone: +91 98765 43210
                    </div>
                  </div>
                  <div className="bg-teal-500/20 p-3 rounded-lg border border-teal-400/30">
                    <div className="font-semibold text-white">
                      Green Vegetables Co.
                    </div>
                    <div className="text-sm text-gray-300">
                      Contact: Maria Garcia | Vegetables
                    </div>
                    <div className="text-xs text-teal-300">
                      Phone: +91 98765 43211
                    </div>
                  </div>
                  <div className="bg-teal-500/20 p-3 rounded-lg border border-teal-400/30">
                    <div className="font-semibold text-white">Spice World</div>
                    <div className="text-sm text-gray-300">
                      Contact: David Wilson | Spices
                    </div>
                    <div className="text-xs text-teal-300">
                      Phone: +91 98765 43212
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Kitchen Operations Tab */}
      {activeTab === "kitchen-operations" && (
        <div className="space-y-6">
          <section className="p-6 bg-gradient-to-r from-pink-600/30 via-rose-500/20 to-red-700/30 rounded-xl shadow-md border border-pink-800/40">
            <h2 className="text-xl font-bold text-white mb-6">
              Kitchen Operations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Station 1 - Quick Snacks
                </h3>
                <div className="space-y-2">
                  <div className="bg-pink-500/20 p-2 rounded border border-pink-400/30">
                    <div className="font-semibold text-white text-sm">
                      Samosa (5 orders)
                    </div>
                    <div className="text-xs text-pink-300">
                      Status: In Progress
                    </div>
                  </div>
                  <div className="bg-pink-500/20 p-2 rounded border border-pink-400/30">
                    <div className="font-semibold text-white text-sm">
                      Pakora (3 orders)
                    </div>
                    <div className="text-xs text-pink-300">Status: Ready</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Station 2 - Main Meals
                </h3>
                <div className="space-y-2">
                  <div className="bg-pink-500/20 p-2 rounded border border-pink-400/30">
                    <div className="font-semibold text-white text-sm">
                      Chicken Biryani (8 orders)
                    </div>
                    <div className="text-xs text-pink-300">
                      Status: In Progress
                    </div>
                  </div>
                  <div className="bg-pink-500/20 p-2 rounded border border-pink-400/30">
                    <div className="font-semibold text-white text-sm">
                      Mutton Curry (4 orders)
                    </div>
                    <div className="text-xs text-pink-300">Status: Ready</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Station 3 - Drinks & Beverages
                </h3>
                <div className="space-y-2">
                  <div className="bg-pink-500/20 p-2 rounded border border-pink-400/30">
                    <div className="font-semibold text-white text-sm">
                      Fresh Juice (6 orders)
                    </div>
                    <div className="text-xs text-pink-300">Status: Ready</div>
                  </div>
                  <div className="bg-pink-500/20 p-2 rounded border border-pink-400/30">
                    <div className="font-semibold text-white text-sm">
                      Tea/Coffee (12 orders)
                    </div>
                    <div className="text-xs text-pink-300">
                      Status: In Progress
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

