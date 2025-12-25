import React, { useState, useEffect } from 'react';
import { fnbAPI } from '../../lib/api';

export default function OrderManagementTab({ clubId }) {
  const [orders, setOrders] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    loadOrders();
    loadStations();
  }, [clubId, filter, currentPage]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const status = filter === 'all' ? undefined : filter;
      const response = await fnbAPI.getOrders(clubId, status, currentPage, itemsPerPage);
      // Backend returns { orders, total, page, totalPages }
      if (response && Array.isArray(response.orders)) {
        setOrders(response.orders);
        setTotalPages(response.totalPages || 1);
      } else if (Array.isArray(response)) {
        // Fallback: if it's already an array
        setOrders(response);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      alert('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStations = async () => {
    try {
      const data = await fnbAPI.getKitchenStations(clubId, true);
      setStations(data);
    } catch (error) {
      console.error('Error loading stations:', error);
    }
  };

  const handleAccept = async (orderId, stationId) => {
    try {
      await fnbAPI.acceptOrder(clubId, orderId, stationId);
      alert('Order accepted successfully!');
      setShowAcceptModal(false);
      loadOrders();
    } catch (error) {
      alert('Failed to accept order');
    }
  };

  const handleReject = async (orderId, reason) => {
    try {
      await fnbAPI.rejectOrder(clubId, orderId, reason);
      alert('Order rejected');
      setShowRejectModal(false);
      loadOrders();
    } catch (error) {
      alert('Failed to reject order');
    }
  };

  const handleMarkReady = async (orderId) => {
    try {
      await fnbAPI.markOrderReady(clubId, orderId);
      alert('Order marked as ready!');
      loadOrders();
    } catch (error) {
      alert('Failed to mark order as ready');
    }
  };

  const handleMarkDelivered = async (orderId) => {
    try {
      await fnbAPI.markOrderDelivered(clubId, orderId);
      alert('Order delivered! Invoice generated.');
      loadOrders();
    } catch (error) {
      alert('Failed to mark order as delivered');
    }
  };

  // Pagination - orders are already paginated from backend
  const paginatedOrders = orders || [];

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="bg-slate-800 rounded-xl p-4 flex justify-between items-center">
        <div className="flex space-x-2">
          {['all', 'pending', 'processing', 'ready', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilter(status);
                setCurrentPage(1);
                // loadOrders will be called by useEffect when filter or currentPage changes
              }}
              className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                filter === status
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={loadOrders}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Order Processing Workflow Info */}
      <div className="bg-blue-600/20 border border-blue-500 rounded-xl p-4">
        <h3 className="text-white font-bold mb-2">📋 Order Processing Workflow</h3>
        <p className="text-blue-200 text-sm">
          1. Player places order → 2. FNB Manager processes & sends to Chef → 3. Chef prepares food → 4. Status updates visible in Player Portal
        </p>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading orders...</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAccept={() => {
                  setSelectedOrder(order);
                  setShowAcceptModal(true);
                }}
                onReject={() => {
                  setSelectedOrder(order);
                  setShowRejectModal(true);
                }}
                onMarkReady={() => handleMarkReady(order.id)}
                onMarkDelivered={() => handleMarkDelivered(order.id)}
              />
            ))}
          </div>

          {paginatedOrders.length === 0 && (
            <div className="text-center py-12 bg-slate-800 rounded-xl">
              <p className="text-gray-400 text-lg">No orders found</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-white">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Accept Order Modal */}
      {showAcceptModal && selectedOrder && (
        <AcceptOrderModal
          order={selectedOrder}
          stations={stations}
          onAccept={handleAccept}
          onClose={() => {
            setShowAcceptModal(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {/* Reject Order Modal */}
      {showRejectModal && selectedOrder && (
        <RejectOrderModal
          order={selectedOrder}
          onReject={handleReject}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}

// Order Card Component
function OrderCard({ order, onAccept, onReject, onMarkReady, onMarkDelivered }) {
  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-500', text: '⏳ Pending', icon: '⏳' },
      processing: { bg: 'bg-blue-500', text: '👨‍🍳 Processing', icon: '👨‍🍳' },
      ready: { bg: 'bg-green-500', text: '✅ Ready', icon: '✅' },
      delivered: { bg: 'bg-emerald-500', text: '🎉 Delivered', icon: '🎉' },
      cancelled: { bg: 'bg-red-500', text: '❌ Cancelled', icon: '❌' },
    };
    const badge = badges[order.status] || badges.pending;
    return (
      <span className={`${badge.bg} text-white px-4 py-2 rounded-full text-sm font-semibold`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            {order.orderNumber ? (
              <h3 className="text-2xl font-bold text-orange-500">{order.orderNumber}</h3>
            ) : (
              <h3 className="text-2xl font-bold text-gray-500">No Order # (Not Accepted)</h3>
            )}
            {getStatusBadge(order.status)}
          </div>
          <p className="text-white">
            <span className="font-semibold">Player:</span> {order.playerName}
          </p>
          <p className="text-gray-400">
            <span className="font-semibold">Table:</span> {order.tableNumber}
          </p>
          {order.stationName && (
            <p className="text-blue-400">
              <span className="font-semibold">Station:</span> {order.stationName}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-orange-500">₹{order.totalAmount}</p>
          <p className="text-xs text-gray-400">
            {new Date(order.createdAt).toLocaleString()}
          </p>
          {order.invoiceNumber && (
            <p className="text-sm text-green-400 mt-1">Invoice: {order.invoiceNumber}</p>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-slate-900 rounded-lg p-4 mb-4">
        <h4 className="text-white font-semibold mb-2">Order Items:</h4>
        <ul className="space-y-1">
          {order.items.map((item, idx) => (
            <li key={idx} className="text-gray-300 flex justify-between">
              <span>{item.quantity}x {item.name}</span>
              <span className="text-orange-400">₹{item.price * item.quantity}</span>
            </li>
          ))}
        </ul>
        {order.specialInstructions && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            <p className="text-yellow-400 text-sm">
              <span className="font-semibold">Special Instructions:</span> {order.specialInstructions}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        {order.status === 'pending' && order.isAccepted === null && (
          <>
            <button
              onClick={onAccept}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold"
            >
              ✅ Accept Order
            </button>
            <button
              onClick={onReject}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold"
            >
              ❌ Reject Order
            </button>
          </>
        )}
        {order.status === 'processing' && (
          <button
            onClick={onMarkReady}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold"
          >
            ✅ Mark as Ready
          </button>
        )}
        {order.status === 'ready' && (
          <button
            onClick={onMarkDelivered}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold"
          >
            🎉 Mark as Delivered
          </button>
        )}
        {order.status === 'cancelled' && order.rejectedReason && (
          <div className="flex-1 bg-red-600/20 border border-red-500 text-red-400 px-4 py-2 rounded-lg">
            <span className="font-semibold">Rejected:</span> {order.rejectedReason}
          </div>
        )}
      </div>
    </div>
  );
}

// Accept Order Modal
function AcceptOrderModal({ order, stations, onAccept, onClose }) {
  const [selectedStation, setSelectedStation] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStation) {
      alert('Please select a station');
      return;
    }
    setProcessing(true);
    await onAccept(order.id, selectedStation);
    setProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-white mb-6">Accept Order</h2>

        <div className="bg-slate-900 rounded-lg p-4 mb-6">
          <p className="text-white">
            <span className="font-semibold">Player:</span> {order.playerName}
          </p>
          <p className="text-white">
            <span className="font-semibold">Table:</span> {order.tableNumber}
          </p>
          <p className="text-orange-500 text-2xl font-bold mt-2">₹{order.totalAmount}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white mb-2 font-semibold">
              Select Kitchen Station *
            </label>
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg"
            >
              <option value="">-- Select Station --</option>
              {stations.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.stationName} (Chef: {station.chefName || 'Unassigned'}) - {station.ordersPending} pending
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Order will be assigned to this station for preparation
            </p>
          </div>

          <div className="bg-green-600/20 border border-green-500 rounded-lg p-3">
            <p className="text-green-400 text-sm">
              ✅ Accepting will assign an order number and send to kitchen
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={processing}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {processing ? 'Accepting...' : '✅ Accept & Send to Kitchen'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Reject Order Modal
function RejectOrderModal({ order, onReject, onClose }) {
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    setProcessing(true);
    await onReject(order.id, reason);
    setProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-white mb-6">Reject Order</h2>

        <div className="bg-slate-900 rounded-lg p-4 mb-6">
          <p className="text-white">
            <span className="font-semibold">Player:</span> {order.playerName}
          </p>
          <p className="text-white">
            <span className="font-semibold">Table:</span> {order.tableNumber}
          </p>
          <p className="text-orange-500 text-2xl font-bold mt-2">₹{order.totalAmount}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white mb-2 font-semibold">
              Rejection Reason *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows="3"
              className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg"
              placeholder="e.g., Out of stock, Kitchen closed, etc."
            />
          </div>

          <div className="bg-red-600/20 border border-red-500 rounded-lg p-3">
            <p className="text-red-400 text-sm">
              ⚠️ Rejecting will cancel the order (no order number assigned)
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={processing}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {processing ? 'Rejecting...' : '❌ Reject Order'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

