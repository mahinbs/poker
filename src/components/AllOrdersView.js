import React, { useState, useMemo } from "react";

export default function AllOrdersView({ orders = [], onStatusUpdate }) {
  // Filter state
  const [orderFilter, setOrderFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Filter orders by status
  const filteredOrders = useMemo(() => {
    return orderFilter === "all"
      ? orders
      : orders.filter((order) => order.status === orderFilter);
  }, [orders, orderFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [orderFilter]);

  // Get status badge
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

  // Handle status update
  const handleStatusUpdate = (orderId, newStatus) => {
    if (onStatusUpdate) {
      onStatusUpdate(orderId, newStatus);
    }
  };

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <section className="p-6 bg-gradient-to-r from-indigo-600/30 via-purple-500/20 to-pink-700/30 rounded-xl shadow-md border border-indigo-800/40">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">All Orders - Player Orders</h2>
        <div className="flex gap-2 items-center">
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
          <select
            className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {/* Workflow Info */}
      <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 mb-6">
        <h3 className="text-white font-semibold mb-2">
          📋 Order Processing Workflow
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <span>1. Player places order</span>
          <span>→</span>
          <span>2. FNB Manager processes & sends to Chef</span>
          <span>→</span>
          <span>3. Chef prepares food</span>
          <span>→</span>
          <span>4. Status updates visible in Player Portal</span>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Status updates are automatically synced to the Player Portal for
          real-time visibility.
        </p>
      </div>

      {/* Orders Count and Pagination Info */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-300">
        <div>
          Showing <span className="text-white font-semibold">{startIndex + 1}</span> to{" "}
          <span className="text-white font-semibold">{Math.min(endIndex, filteredOrders.length)}</span> of{" "}
          <span className="text-white font-semibold">{filteredOrders.length}</span> orders
        </div>
        {totalPages > 1 && (
          <div className="flex gap-2 items-center flex-wrap justify-center">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded text-sm font-semibold transition-all ${
                currentPage === 1
                  ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600/80 text-white hover:bg-blue-600 shadow-md"
              }`}
              title="First Page"
            >
              ⏮ First
            </button>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded text-sm font-semibold transition-all ${
                currentPage === 1
                  ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                  : "bg-white/10 text-white hover:bg-white/20 shadow-md"
              }`}
              title="Previous Page"
            >
              ← Previous
            </button>
            <div className="flex gap-1 items-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-2 rounded text-sm font-semibold transition-all ${
                        currentPage === page
                          ? "bg-blue-600 text-white shadow-lg scale-105"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                      title={`Go to page ${page}`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return (
                    <span key={page} className="px-2 text-gray-400">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded text-sm font-semibold transition-all ${
                currentPage === totalPages
                  ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                  : "bg-white/10 text-white hover:bg-white/20 shadow-md"
              }`}
              title="Next Page"
            >
              Next →
            </button>
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded text-sm font-semibold transition-all ${
                currentPage === totalPages
                  ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600/80 text-white hover:bg-blue-600 shadow-md"
              }`}
              title="Last Page"
            >
              Last ⏭
            </button>
            <span className="text-white ml-2 px-3 py-2 bg-white/5 rounded">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {paginatedOrders.length > 0 ? (
          paginatedOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white/10 p-5 rounded-lg border border-white/20"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Order Info */}
                <div className="lg:col-span-8">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {order.orderNumber}
                        </h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-300">
                        <div>
                          <span className="text-gray-400">Player:</span>{" "}
                          <span className="text-white font-medium">
                            {order.playerName}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Table:</span>{" "}
                          <span className="text-white">{order.tableNumber}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Order Time:</span>{" "}
                          <span className="text-white">
                            {new Date(order.orderDate).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Total:</span>{" "}
                          <span className="text-green-300 font-semibold">
                            ₹{order.totalAmount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-3">
                    <div className="text-xs text-gray-400 mb-1">Order Items:</div>
                    <div className="bg-white/5 p-3 rounded border border-white/10">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="text-sm text-gray-300 mb-1 last:mb-0"
                        >
                          <span className="text-white">{item.quantity}x</span>{" "}
                          {item.name} -{" "}
                          <span className="text-green-300">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Special Instructions */}
                  {order.specialInstructions && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-400 mb-1">
                        Special Instructions:
                      </div>
                      <div className="bg-purple-500/20 p-2 rounded border border-purple-400/30 text-sm text-purple-200">
                        {order.specialInstructions}
                      </div>
                    </div>
                  )}

                  {/* Workflow Status */}
                  <div className="mb-3">
                    <div className="text-xs text-gray-400 mb-2">Processing Status:</div>
                    <div className="grid grid-cols-3 gap-2">
                      <div
                        className={`p-2 rounded text-xs text-center ${
                          order.status !== "pending"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        ✓ Processed by FNB Manager
                      </div>
                      <div
                        className={`p-2 rounded text-xs text-center ${
                          order.sentToChef
                            ? "bg-green-500/20 text-green-300"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {order.sentToChef ? "✓ Sent to Chef" : "Pending"}
                      </div>
                      <div
                        className={`p-2 rounded text-xs text-center ${
                          order.status === "ready" || order.status === "delivered"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {order.chefAssigned
                          ? `Chef: ${order.chefAssigned}`
                          : "Chef: Pending"}
                      </div>
                    </div>
                  </div>

                  {/* Status History */}
                  <div className="mt-3">
                    <div className="text-xs text-gray-400 mb-1">Status Timeline:</div>
                    <div className="space-y-1">
                      {order.statusHistory
                        .slice()
                        .reverse()
                        .slice(0, 3)
                        .map((history, idx) => (
                          <div key={idx} className="text-xs text-gray-400">
                            <span className="text-white">
                              {history.status.toUpperCase()}
                            </span>{" "}
                            -{" "}
                            {new Date(history.timestamp).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            by {history.updatedBy}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Status Update Actions */}
                <div className="lg:col-span-4 flex flex-col gap-2">
                  <div className="bg-white/5 p-3 rounded border border-white/10">
                    <div className="text-sm font-semibold text-white mb-2">
                      Update Order Status
                    </div>
                    <div className="space-y-2">
                      {order.status === "pending" && (
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `Process order ${order.orderNumber} and send to Chef?`
                              )
                            ) {
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
                            if (
                              window.confirm(
                                `Mark order ${order.orderNumber} as ready?`
                              )
                            ) {
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
                            if (
                              window.confirm(
                                `Mark order ${order.orderNumber} as delivered?`
                              )
                            ) {
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
                          if (
                            window.confirm(
                              `Change order ${order.orderNumber} status to ${e.target.value}?`
                            )
                          ) {
                            handleStatusUpdate(order.id, e.target.value);
                          }
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="ready">Ready</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <p className="text-xs text-gray-400 mt-1">
                        Select status or use quick actions above
                      </p>
                    </div>
                  </div>
                  {order.status === "delivered" && order.deliveredAt && (
                    <div className="bg-emerald-500/20 p-2 rounded border border-emerald-400/30 text-xs text-emerald-300">
                      ✓ Delivered at{" "}
                      {new Date(order.deliveredAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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

      {/* Pagination Controls - Bottom */}
      {totalPages > 1 && (
        <div className="mt-6 pt-6 border-t border-white/20">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-300">
              Showing <span className="text-white font-semibold">{startIndex + 1}</span> to{" "}
              <span className="text-white font-semibold">{Math.min(endIndex, filteredOrders.length)}</span> of{" "}
              <span className="text-white font-semibold">{filteredOrders.length}</span> orders
            </div>
            <div className="flex gap-2 items-center flex-wrap justify-center">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  currentPage === 1
                    ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600/80 text-white hover:bg-blue-600 shadow-md hover:scale-105"
                }`}
                title="First Page"
              >
                ⏮ First
              </button>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  currentPage === 1
                    ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                    : "bg-white/10 text-white hover:bg-white/20 shadow-md hover:scale-105"
                }`}
                title="Previous Page"
              >
                ← Previous
              </button>
              <div className="flex gap-1 items-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all min-w-[40px] ${
                          currentPage === page
                            ? "bg-blue-600 text-white shadow-lg scale-110 ring-2 ring-blue-400"
                            : "bg-white/10 text-white hover:bg-white/20 hover:scale-105"
                        }`}
                        title={`Go to page ${page}`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  currentPage === totalPages
                    ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                    : "bg-white/10 text-white hover:bg-white/20 shadow-md hover:scale-105"
                }`}
                title="Next Page"
              >
                Next →
              </button>
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  currentPage === totalPages
                    ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600/80 text-white hover:bg-blue-600 shadow-md hover:scale-105"
                }`}
                title="Last Page"
              >
                Last ⏭
              </button>
            </div>
            <div className="text-sm text-white bg-white/5 px-4 py-2 rounded-lg">
              Page <span className="font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

