import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clubsAPI } from "../lib/api";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

export default function TableBuyOutManagement({ clubId }) {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [cashoutAmount, setCashoutAmount] = useState("");

  // Supabase real-time: instant updates for buy-out requests
  useEffect(() => {
    if (!clubId) return;

    const channel = supabase
      .channel(`buyout-requests-${clubId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'buyout_requests',
          filter: `club_id=eq.${clubId}`,
        },
        (payload) => {
          console.log('🔔 [REALTIME] New buy-out request:', payload.new);
          queryClient.invalidateQueries({ queryKey: ['buyOutRequests', clubId] });
          toast('💸 New buy-out request received!', { icon: '🔔' });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'buyout_requests',
          filter: `club_id=eq.${clubId}`,
        },
        (payload) => {
          console.log('🔄 [REALTIME] Buy-out request updated:', payload.new);
          queryClient.invalidateQueries({ queryKey: ['buyOutRequests', clubId] });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ [REALTIME] Subscribed to buy-out requests for club:', clubId);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clubId, queryClient]);

  // Fetch pending buy-out requests (initial load + fallback)
  const { data: buyOutRequests = [], isLoading, refetch } = useQuery({
    queryKey: ['buyOutRequests', clubId],
    queryFn: () => clubsAPI.getBuyOutRequests(clubId),
    enabled: !!clubId,
  });

  // Approve buy-out mutation
  const approveMutation = useMutation({
    mutationFn: ({ requestId, amount }) => clubsAPI.approveBuyOutRequest(clubId, requestId, { amount }),
    onSuccess: () => {
      toast.success("Buy-out request approved and balance updated!");
      queryClient.invalidateQueries(['buyOutRequests', clubId]);
      setSelectedRequest(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve buy-out request");
    },
  });

  // Reject buy-out mutation
  const rejectMutation = useMutation({
    mutationFn: ({ requestId, reason }) => clubsAPI.rejectBuyOutRequest(clubId, requestId, { reason }),
    onSuccess: () => {
      toast.success("Buy-out request rejected!");
      queryClient.invalidateQueries(['buyOutRequests', clubId]);
      setSelectedRequest(null);
      setShowRejectModal(false);
      setRejectionReason("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reject buy-out request");
    },
  });

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setCashoutAmount("");
    setShowApproveModal(true);
  };

  const handleApproveSubmit = () => {
    const amount = parseFloat(cashoutAmount);
    if (isNaN(amount) || amount < 0) {
      toast.error('Please enter a valid amount (can be 0 for no winnings)');
      return;
    }
    
    approveMutation.mutate({
      requestId: selectedRequest.id,
      amount: amount,
    });
    setShowApproveModal(false);
    setCashoutAmount("");
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    rejectMutation.mutate({
      requestId: selectedRequest.id,
      reason: rejectionReason,
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
    });
  };

  const pendingRequests = buyOutRequests.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Table Buy-Out Requests</h2>
          <div className="text-sm text-gray-400">
            {pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''}
          </div>
        </div>

        {isLoading ? (
          <div className="text-gray-400 text-center py-8">Loading buy-out requests...</div>
        ) : pendingRequests.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No pending buy-out requests</div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="text-lg font-semibold text-white">{request.playerName}</div>
                      <div className="text-sm text-gray-400">Table {request.tableNumber}</div>
                      {request.seatNumber && (
                        <div className="text-sm text-gray-400">Seat {request.seatNumber}</div>
                      )}
                    </div>
                    <div className="text-lg font-semibold text-yellow-400 mb-2">
                      💰 Enter amount when approving
                    </div>
                    <div className="text-sm text-gray-400">
                      Call time started: {formatDateTime(request.callTimeStartedAt)}
                    </div>
                    <div className="text-sm text-gray-400">
                      Requested at: {formatDateTime(request.requestedAt)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(request)}
                      disabled={approveMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {approveMutation.isPending ? "Processing..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handleReject(request)}
                      disabled={rejectMutation.isPending}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approve Cashout Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 max-w-lg w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-white">Process Table Cashout</h3>
            
            {/* Player Info */}
            <div className="bg-slate-700 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">Player:</span>
                  <span className="text-white font-semibold ml-2">{selectedRequest.playerName}</span>
                </div>
                <div>
                  <span className="text-gray-400">Table:</span>
                  <span className="text-white font-semibold ml-2">Table {selectedRequest.tableNumber}</span>
                </div>
                <div>
                  <span className="text-gray-400">Seat:</span>
                  <span className="text-white font-semibold ml-2">{selectedRequest.seatNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Call Time:</span>
                  <span className="text-white font-semibold ml-2">{formatDateTime(selectedRequest.callTimeStartedAt)}</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 mb-4">
              <div className="text-sm text-blue-200 space-y-2">
                <p className="font-semibold">💡 How Cashout Works:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Enter the <strong>final amount</strong> player has at the table</li>
                  <li>If player used credit, it will be <strong>paid back first</strong></li>
                  <li>Remaining amount goes to the player's wallet</li>
                  <li>If the final amount is less than the credit used, the player owes the difference</li>
                </ul>
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Final Table Amount (₹) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={cashoutAmount}
                onChange={(e) => setCashoutAmount(e.target.value)}
                placeholder="Enter final amount at table (can be 0)"
                min="0"
                step="1"
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 text-lg focus:border-blue-500 focus:outline-none"
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-1">
                Enter 0 if player lost everything. System will calculate credit payback automatically.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleApproveSubmit}
                disabled={approveMutation.isPending || cashoutAmount === ""}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {approveMutation.isPending ? "Processing..." : "Complete Cashout"}
              </button>
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedRequest(null);
                  setCashoutAmount("");
                }}
                className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-white">Reject Buy-Out Request</h3>
            <p className="text-gray-300 mb-4">
              Reject buy-out request for <strong>{selectedRequest.playerName}</strong>?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reason for Rejection <span className="text-red-400">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows="4"
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRejectSubmit}
                disabled={rejectMutation.isPending || !rejectionReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {rejectMutation.isPending ? "Rejecting..." : "Reject Request"}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                  setRejectionReason("");
                }}
                className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





