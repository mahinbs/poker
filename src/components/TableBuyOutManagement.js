import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clubsAPI } from "../lib/api";
import toast from "react-hot-toast";

export default function TableBuyOutManagement({ clubId }) {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch pending buy-out requests
  const { data: buyOutRequests = [], isLoading, refetch } = useQuery({
    queryKey: ['buyOutRequests', clubId],
    queryFn: () => clubsAPI.getBuyOutRequests(clubId),
    enabled: !!clubId,
    refetchInterval: 5000, // Refresh every 5 seconds
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
    if (window.confirm(`Approve buy-out request for ${request.playerName}? Amount: ₹${Number(request.requestedAmount || request.currentTableBalance || 0).toLocaleString('en-IN')}`)) {
      approveMutation.mutate({
        requestId: request.id,
        amount: request.requestedAmount || request.currentTableBalance || 0,
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
                    <div className="text-xl font-bold text-green-400 mb-2">
                      ₹{Number(request.requestedAmount || request.currentTableBalance || 0).toLocaleString('en-IN')}
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





