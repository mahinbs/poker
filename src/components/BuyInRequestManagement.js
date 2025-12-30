import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clubsAPI } from "../lib/api";
import toast from "react-hot-toast";

export default function BuyInRequestManagement({ clubId }) {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch pending buy-in requests
  const { data: buyInRequests = [], isLoading, refetch } = useQuery({
    queryKey: ['buyInRequests', clubId],
    queryFn: () => clubsAPI.getBuyInRequests(clubId),
    enabled: !!clubId,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Approve buy-in mutation
  const approveMutation = useMutation({
    mutationFn: ({ requestId, amount }) => clubsAPI.approveBuyInRequest(clubId, requestId, { amount }),
    onSuccess: () => {
      toast.success("Buy-in request approved and balance updated!");
      queryClient.invalidateQueries(['buyInRequests', clubId]);
      setSelectedRequest(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve buy-in request");
    },
  });

  // Reject buy-in mutation
  const rejectMutation = useMutation({
    mutationFn: ({ requestId, reason }) => clubsAPI.rejectBuyInRequest(clubId, requestId, { reason }),
    onSuccess: () => {
      toast.success("Buy-in request rejected!");
      queryClient.invalidateQueries(['buyInRequests', clubId]);
      setSelectedRequest(null);
      setShowRejectModal(false);
      setRejectionReason("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reject buy-in request");
    },
  });

  const handleApprove = (request) => {
    if (window.confirm(`Approve buy-in request for ${request.playerName}? Amount: ₹${Number(request.requestedAmount || 0).toLocaleString('en-IN')}`)) {
      approveMutation.mutate({
        requestId: request.id,
        amount: request.requestedAmount || 0,
      });
    }
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
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pendingRequests = buyInRequests.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Table Buy-In Requests</h2>
          <div className="text-sm text-gray-400">
            {pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''}
          </div>
        </div>

        {isLoading ? (
          <div className="text-gray-400 text-center py-8">Loading buy-in requests...</div>
        ) : pendingRequests.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No pending buy-in requests</div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="bg-slate-700 rounded-lg p-5 border border-slate-600 hover:border-blue-500 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">{request.playerName}</h3>
                      <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded text-xs font-semibold">
                        PENDING
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Table:</span>
                        <span className="text-white ml-2 font-medium">
                          {request.tableNumber ? `Table ${request.tableNumber}` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Seat:</span>
                        <span className="text-white ml-2 font-medium">
                          {request.seatNumber ? `Seat ${request.seatNumber}` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Requested Amount:</span>
                        <span className="text-green-400 ml-2 font-bold">
                          ₹{Number(request.requestedAmount || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Current Balance:</span>
                        <span className="text-white ml-2 font-medium">
                          ₹{Number(request.currentTableBalance || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Requested At:</span>
                        <span className="text-white ml-2">{formatDateTime(request.requestedAt)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Email:</span>
                        <span className="text-white ml-2">{request.playerEmail || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleApprove(request)}
                    disabled={approveMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {approveMutation.isPending ? "Processing..." : "✓ Approve"}
                  </button>
                  <button
                    onClick={() => handleReject(request)}
                    disabled={rejectMutation.isPending}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">Reject Buy-In Request</h3>
            <p className="text-gray-300 mb-4">
              Rejecting buy-in request for <strong>{selectedRequest.playerName}</strong> (₹{Number(selectedRequest.requestedAmount || 0).toLocaleString('en-IN')})
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reason for Rejection <span className="text-red-400">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg p-3 focus:outline-none focus:border-blue-500"
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                  setSelectedRequest(null);
                }}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectionReason.trim() || rejectMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {rejectMutation.isPending ? "Rejecting..." : "Reject Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




