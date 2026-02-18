import React, { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { superAdminAPI } from "../../lib/api";
import toast from "react-hot-toast";
import { useWebSocket } from "../../hooks/useWebSocket";

export default function CreditManagement({ selectedClubId }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("players-list"); // 'players-list' or 'credit-requests'
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [creditLimit, setCreditLimit] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [newRequestIds, setNewRequestIds] = useState(new Set()); // track newly arrived IDs for highlight
  const activeTabRef = useRef(activeTab);

  // Keep ref in sync so WebSocket callbacks always see current tab
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

  // --- WebSocket -----------------------------------------------------------
  const { connected, events } = useWebSocket(selectedClubId);
  const lastProcessedEventRef = useRef(0);

  useEffect(() => {
    if (!events || events.length === 0) return;

    const newEvents = events.slice(lastProcessedEventRef.current);
    lastProcessedEventRef.current = events.length;

    newEvents.forEach((event) => {
      if (event.type === 'credit:requested') {
        const data = event.data;

        queryClient.setQueryData(['creditRequests', selectedClubId], (old = []) => {
          if (old.some((r) => r.id === data.id)) return old;
          return [data, ...old];
        });

        setNewRequestIds((prev) => new Set([...prev, data.id]));

        toast(
          (t) => (
            <div className="flex items-start gap-3">
              <div>
                <p className="font-semibold text-white">New Credit Request</p>
                <p className="text-sm text-gray-300">
                  {data.playerName || 'A player'} requested {Number(data.amount || 0).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('credit-requests');
                  toast.dismiss(t.id);
                }}
                className="ml-2 px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs rounded-lg font-medium"
              >
                View
              </button>
            </div>
          ),
          {
            duration: 6000,
            style: { background: '#1e293b', border: '1px solid #f59e0b', color: '#fff' },
          }
        );

        setTimeout(() => {
          setNewRequestIds((prev) => {
            const next = new Set(prev);
            next.delete(data.id);
            return next;
          });
        }, 8000);
      }

      if (event.type === 'credit:approved' || event.type === 'credit:rejected') {
        queryClient.invalidateQueries(['creditRequests', selectedClubId]);
        queryClient.invalidateQueries(['creditPlayers', selectedClubId]);
      }
    });
  }, [events, selectedClubId, queryClient]);


  // â”€â”€â”€ Queries â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // Fetch all KYC approved players with credit info
  const { data: playersData = [], isLoading: playersLoading } = useQuery({
    queryKey: ["creditPlayers", selectedClubId],
    queryFn: async () => {
      if (!selectedClubId) return [];

      const allPlayers = [];
      let page = 1;
      const limit = 50;
      let hasMore = true;

      while (hasMore) {
        try {
          const response = await superAdminAPI.getPlayers(selectedClubId, { limit, page });
          const players = response?.players || [];

          if (!players || players.length === 0) {
            hasMore = false;
            break;
          }

          // Filter only approved/verified KYC players with Active status
          const approvedPlayers = players.filter(p =>
            (p.kycStatus === 'approved' || p.kycStatus === 'verified') &&
            p.status === 'Active'
          );

          allPlayers.push(...approvedPlayers);

          if (players.length < limit) {
            hasMore = false;
          } else {
            page++;
            if (page > 20) hasMore = false; // Safety limit
          }
        } catch (error) {
          console.error(`Error fetching page ${page}:`, error);
          hasMore = false;
        }
      }

      return allPlayers;
    },
    enabled: !!selectedClubId,
  });

  // Fetch pending credit requests (initial load; WS keeps it live after)
  const { data: creditRequests = [], isLoading: requestsLoading, isFetching: requestsFetching, refetch: refetchRequests } = useQuery({
    queryKey: ["creditRequests", selectedClubId],
    queryFn: () => superAdminAPI.getCreditRequests(selectedClubId, 'Pending'),
    enabled: !!selectedClubId,
    refetchInterval: 10000, // poll every 10s as reliable fallback
  });

  // â”€â”€â”€ Mutations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // Unlock credit feature mutation
  const unlockCreditMutation = useMutation({
    mutationFn: async ({ playerId, limit }) => {
      return await superAdminAPI.unlockCredit(selectedClubId, playerId, { creditLimit: parseFloat(limit) });
    },
    onSuccess: async () => {
      toast.success("Credit feature unlocked successfully!");
      await queryClient.refetchQueries(["creditPlayers", selectedClubId]);
      setShowUnlockModal(false);
      setSelectedPlayer(null);
      setCreditLimit("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to unlock credit feature");
    },
  });

  // Update credit limit mutation
  const updateLimitMutation = useMutation({
    mutationFn: async ({ playerId, limit }) => {
      return await superAdminAPI.updateCreditLimit(selectedClubId, playerId, { creditLimit: parseFloat(limit) });
    },
    onSuccess: async () => {
      toast.success("Credit limit updated successfully!");
      await queryClient.refetchQueries(["creditPlayers", selectedClubId]);
      setShowLimitModal(false);
      setSelectedPlayer(null);
      setCreditLimit("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update credit limit");
    },
  });

  // Approve credit request mutation
  const approveCreditMutation = useMutation({
    mutationFn: async ({ requestId, playerId }) => {
      return await superAdminAPI.approveCreditRequest(selectedClubId, requestId);
    },
    onSuccess: () => {
      toast.success("Credit request approved!");
      queryClient.invalidateQueries(["creditRequests", selectedClubId]);
      queryClient.invalidateQueries(["creditPlayers", selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve credit request");
    },
  });

  // Reject credit request mutation
  const rejectCreditMutation = useMutation({
    mutationFn: async ({ requestId, reason }) => {
      return await superAdminAPI.rejectCreditRequest(selectedClubId, requestId, { reason });
    },
    onSuccess: () => {
      toast.success("Credit request rejected");
      queryClient.invalidateQueries(["creditRequests", selectedClubId]);
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectReason("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reject credit request");
    },
  });

  const handleUnlockCredit = () => {
    if (!creditLimit || parseFloat(creditLimit) <= 0) {
      toast.error("Please enter a valid credit limit");
      return;
    }
    unlockCreditMutation.mutate({
      playerId: selectedPlayer.id,
      limit: creditLimit,
    });
  };

  const handleUpdateLimit = () => {
    if (!creditLimit || parseFloat(creditLimit) <= 0) {
      toast.error("Please enter a valid credit limit");
      return;
    }
    updateLimitMutation.mutate({
      playerId: selectedPlayer.id,
      limit: creditLimit,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Credit Feature Management</h1>
          <p className="text-gray-400">Ultimate control: players, staff, credit, overrides and more</p>
        </div>
        {/* WebSocket status */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${connected
          ? "bg-emerald-900/40 border-emerald-500/50 text-emerald-400"
          : "bg-slate-700/50 border-slate-600 text-gray-400"
          }`}>
          <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`} />
          {connected ? "Live" : "Connecting..."}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("players-list")}
          className={`px-6 py-3 font-semibold rounded-t-lg transition-colors ${activeTab === "players-list"
            ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white"
            : "bg-slate-700 text-gray-300 hover:bg-slate-600"
            }`}
        >
          Players List &amp; Credit Management
        </button>
        <button
          onClick={() => setActiveTab("credit-requests")}
          className={`relative px-6 py-3 font-semibold rounded-t-lg transition-colors ${activeTab === "credit-requests"
            ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white"
            : "bg-slate-700 text-gray-300 hover:bg-slate-600"
            }`}
        >
          Credit Approval Requests
          {/* Unread badge */}
          {creditRequests.length > 0 && activeTab !== "credit-requests" && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {creditRequests.length > 9 ? "9+" : creditRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-lg p-6">
        {/* Players List Tab */}
        {activeTab === "players-list" && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">All Players - Credit Management</h2>
            {playersLoading ? (
              <div className="text-gray-400 text-center py-8">Loading players...</div>
            ) : playersData.length === 0 ? (
              <div className="text-gray-400 text-center py-8">No players found</div>
            ) : (
              <div className="space-y-4">
                {playersData.map((player) => (
                  <div key={player.id} className="bg-slate-800/50 rounded-lg p-5 border border-slate-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-white font-semibold text-lg">{player.name}</h3>
                        <p className="text-gray-400 text-sm">ID: {player.playerId || player.id}</p>
                        <p className="text-gray-400 text-sm">Email: {player.email}</p>
                        <p className="text-gray-400 text-sm">
                          Balance: <span className="font-bold text-green-400">{player.balance || 0}</span>
                        </p>
                        {player.creditEnabled && (
                          <div className="mt-2 space-y-1">
                            <p className="text-blue-400 text-sm">
                              Credit Limit: <span className="font-bold">{Number(player.creditLimit || 0).toLocaleString()}</span>
                            </p>
                            <p className="text-yellow-400 text-sm">
                              Credit Used: <span className="font-bold">{Number(player.creditUsed || 0).toLocaleString()}</span>
                            </p>
                            <p className="text-green-400 text-sm">
                              Remaining Credit: <span className="font-bold">{Number((player.creditLimit || 0) - (player.creditUsed || 0)).toLocaleString()}</span>
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {!player.creditEnabled ? (
                          <button
                            onClick={() => {
                              setSelectedPlayer(player);
                              setShowUnlockModal(true);
                            }}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                          >
                            Unlock Credit
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setSelectedPlayer(player);
                                setCreditLimit(player.creditLimit?.toString() || "");
                                setShowLimitModal(true);
                              }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                            >
                              Edit Limit
                            </button>
                            <span className="px-4 py-2 bg-green-600 text-white text-center rounded-lg font-semibold">
                              Credit Enabled
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Credit Approval Requests Tab */}
        {activeTab === "credit-requests" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white">Credit Approval Requests</h2>
              </div>
              <button
                onClick={() => refetchRequests()}
                disabled={requestsFetching}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
              >
                <svg className={`w-4 h-4 ${requestsFetching ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {requestsFetching ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {requestsLoading ? (
              <div className="text-gray-400 text-center py-8">Loading requests...</div>
            ) : creditRequests.length === 0 ? (
              <div className="text-gray-400 text-center py-12">
                <p className="text-lg">No pending credit requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {creditRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`rounded-lg p-6 border transition-all duration-500 ${newRequestIds.has(request.id)
                      ? "bg-amber-900/30 border-amber-500/60 shadow-lg shadow-amber-900/20 animate-pulse-once"
                      : "bg-slate-800/50 border-slate-700"
                      }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold text-xl">{request.playerName}</h3>
                          {newRequestIds.has(request.id) && (
                            <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">NEW</span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">Player ID: {request.playerId}</p>
                        <p className="text-gray-400 text-sm">
                          Requested Amount: <span className="font-bold text-yellow-400">{Number(request.amount).toLocaleString()}</span>
                        </p>
                        {request.limit && request.limit > 0 && (
                          <p className="text-gray-400 text-sm">
                            Approved Amount: <span className="font-bold text-green-400">{Number(request.limit).toLocaleString()}</span>
                          </p>
                        )}
                        <p className="text-gray-400 text-sm">
                          Requested: {new Date(request.createdAt).toLocaleString()}
                        </p>
                        {request.notes && (
                          <p className="text-gray-300 text-sm mt-2">
                            Notes: {request.notes}
                          </p>
                        )}
                      </div>
                      <span className="px-3 py-1 bg-yellow-600 text-white text-sm font-semibold rounded">
                        Pending
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => approveCreditMutation.mutate({ requestId: request.id, playerId: request.playerId })}
                        disabled={approveCreditMutation.isPending}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                      >
                        {approveCreditMutation.isPending ? "Approving..." : "Approve Credit"}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowRejectModal(true);
                        }}
                        disabled={rejectCreditMutation.isPending}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Unlock Credit Modal */}
      {showUnlockModal && selectedPlayer && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700 max-h-[85vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Unlock Credit Feature</h3>
            <p className="text-gray-300 mb-4">
              Do you want to unlock the credit feature for <span className="font-semibold text-white">{selectedPlayer.name}</span>?
            </p>
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500 rounded-lg">
              <p className="text-blue-400 text-sm">
                Current Balance: {selectedPlayer.balance || 0}
              </p>
            </div>
            <div className="mb-6">
              <label className="block text-gray-300 mb-2 font-semibold">
                Set Credit Limit () <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                placeholder="Enter credit limit"
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleUnlockCredit}
                disabled={unlockCreditMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {unlockCreditMutation.isPending ? "Unlocking..." : "Unlock & Set Limit"}
              </button>
              <button
                onClick={() => {
                  setShowUnlockModal(false);
                  setSelectedPlayer(null);
                  setCreditLimit("");
                }}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Limit Modal */}
      {showLimitModal && selectedPlayer && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700 max-h-[85vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Edit Credit Limit</h3>
            <p className="text-gray-300 mb-4">
              Update credit limit for <span className="font-semibold text-white">{selectedPlayer.name}</span>
            </p>
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500 rounded-lg">
              <p className="text-blue-400 text-sm">
                Current Limit: {selectedPlayer.creditLimit || 0}
              </p>
              <p className="text-blue-400 text-sm">
                Credit Used: {selectedPlayer.creditUsed || 0}
              </p>
            </div>
            <div className="mb-6">
              <label className="block text-gray-300 mb-2 font-semibold">
                New Credit Limit () <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                placeholder="Enter new credit limit"
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleUpdateLimit}
                disabled={updateLimitMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {updateLimitMutation.isPending ? "Updating..." : "Update Limit"}
              </button>
              <button
                onClick={() => {
                  setShowLimitModal(false);
                  setSelectedPlayer(null);
                  setCreditLimit("");
                }}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700 max-h-[85vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Reject Credit Request</h3>
            <p className="text-gray-300 mb-4">
              Rejecting request from <span className="font-semibold text-white">{selectedRequest.playerName}</span>
            </p>
            <div className="mb-6">
              <label className="block text-gray-300 mb-2 font-semibold">
                Rejection Reason <span className="text-red-400">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={4}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (!rejectReason.trim()) {
                    toast.error("Please provide a reason for rejection");
                    return;
                  }
                  rejectCreditMutation.mutate({ requestId: selectedRequest.id, reason: rejectReason });
                }}
                disabled={rejectCreditMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {rejectCreditMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                  setRejectReason("");
                }}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 rounded-lg font-semibold transition-colors"
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
