import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { superAdminAPI } from "../../lib/api";
import toast from "react-hot-toast";

const WBPAIR_MARKER = "WBPAIRCL2T";

/** Matches backend credit-session-history.labels when API omits eventLabel (older server). */
function summarizeSessionHistoryRow(type, notes) {
  const raw = (type || "").trim();
  const t = raw.toUpperCase().replace(/\s+/g, " ");
  const n = (notes || "").toLowerCase();
  const hasPair = (notes || "").includes(WBPAIR_MARKER);

  if (t === "CREDIT") {
    if (n.includes("applied on table join") || n.includes("credit approved while seated")) {
      return {
        eventLabel: "Credit used on table",
        amountNote: "This amount was drawn from the credit line onto the table stack.",
      };
    }
    if (n.includes("tournament")) {
      return {
        eventLabel: "Credit used (tournament)",
        amountNote: "Credit line applied toward tournament entry or settlement.",
      };
    }
    return { eventLabel: "Credit line draw", amountNote: "Recorded on the credit ledger." };
  }
  if (t === "DEBIT") {
    if (n.includes("credit line repayment")) {
      return {
        eventLabel: "Credit settlement — club buy-in",
        amountNote:
          "Part of cashier buy-in used to clear negative wallet and free credit remaining (not new chips on table).",
      };
    }
    if (
      n.includes("credit settlement") ||
      n.includes("table exit") ||
      n.includes("buy-out") ||
      n.includes("table close") ||
      n.includes("staff buy-out")
    ) {
      return {
        eventLabel: "Credit settlement — leaving table",
        amountNote:
          "Table exit: this amount closed the credit line for that session (wallet may go negative if cash-out was short).",
      };
    }
    return { eventLabel: "Debit (credit ledger)", amountNote: "Repayment or adjustment on the credit ledger." };
  }
  if (t === "CLUB BUY IN") {
    return {
      eventLabel: "Club buy-in (cash to wallet)",
      amountNote:
        "Player paid at the counter — wallet increases. If they owed the line, a separate Debit row shows repayment.",
    };
  }
  if (t === "TABLE BUY OUT") {
    return {
      eventLabel: "Table cash-out",
      amountNote: "Chips returned from table to wallet; a Debit row may follow for credit settlement.",
    };
  }
  if (t === "TABLE BUY IN" && hasPair) {
    return {
      eventLabel: "Table buy-in (credit mirror)",
      amountNote: "Mirrors the Credit row — same rupees; wallet is not debited again for this pair.",
    };
  }
  return { eventLabel: raw || "Transaction", amountNote: "See full notes below." };
}

function sessionHistoryRowSummary(row) {
  if (row.eventLabel) {
    return { eventLabel: row.eventLabel, amountNote: row.amountNote || "" };
  }
  return summarizeSessionHistoryRow(row.type, row.notes);
}

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
  const [showLockModal, setShowLockModal] = useState(false);
  const [playerToLock, setPlayerToLock] = useState(null);
  const [historyDraft, setHistoryDraft] = useState({ q: "", from: "", to: "" });
  const [historyFilters, setHistoryFilters] = useState({ q: "", from: "", to: "" });
  const [historyPage, setHistoryPage] = useState(1);
  const [sessionHistoryDetailRow, setSessionHistoryDetailRow] = useState(null);

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

  // Fetch pending credit requests
  const { data: creditRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ["creditRequests", selectedClubId],
    queryFn: () => superAdminAPI.getCreditRequests(selectedClubId, 'Pending'),
    enabled: !!selectedClubId && activeTab === 'credit-requests',
  });

  const { data: sessionHistoryData, isLoading: sessionHistoryLoading } = useQuery({
    queryKey: ["creditSessionHistory", selectedClubId, historyFilters, historyPage],
    queryFn: () =>
      superAdminAPI.getCreditSessionHistory(selectedClubId, {
        q: historyFilters.q.trim() || undefined,
        from: historyFilters.from || undefined,
        to: historyFilters.to || undefined,
        page: historyPage,
        limit: 10,
      }),
    enabled: !!selectedClubId && activeTab === "session-history",
  });

  const resolveCreditView = (row) => {
    const creditLimitNum = Number(row?.creditLimit || 0);
    const usedNum = Number(row?.creditUsed || 0);
    const onLineNum = Number(
      row?.creditOnLine != null ? row.creditOnLine : row?.creditInAccount || 0,
    );
    const remainingNum = Number(
      row?.creditRemaining != null
        ? row.creditRemaining
        : Math.max(0, creditLimitNum - Math.max(0, usedNum) - Math.max(0, onLineNum)),
    );
    return {
      creditLimitNum: Math.max(0, creditLimitNum),
      usedNum: Math.max(0, usedNum),
      onLineNum: Math.max(0, onLineNum),
      remainingNum: Math.max(0, remainingNum),
    };
  };

  const playerCreditSnapshotById = new Map(
    (playersData || []).map((p) => [String(p.id), resolveCreditView(p)]),
  );

  // Unlock credit feature mutation
  const unlockCreditMutation = useMutation({
    mutationFn: async ({ playerId, limit }) => {
      return await superAdminAPI.unlockCredit(selectedClubId, playerId, { creditLimit: parseFloat(limit) });
    },
    onSuccess: async () => {
      toast.success("Credit feature unlocked successfully!");
      // Force refetch the players data
      await queryClient.refetchQueries(["creditPlayers", selectedClubId]);
      setShowUnlockModal(false);
      setSelectedPlayer(null);
      setCreditLimit("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to unlock credit feature");
    },
  });

  // Lock (disable) credit — super admin only; server checks outstanding credit & table
  const lockCreditMutation = useMutation({
    mutationFn: async ({ playerId }) => {
      return await superAdminAPI.lockCredit(selectedClubId, playerId);
    },
    onSuccess: async () => {
      toast.success("Credit locked for this player.");
      await queryClient.refetchQueries(["creditPlayers", selectedClubId]);
      setShowLockModal(false);
      setPlayerToLock(null);
    },
    onError: (error) => {
      toast.error(error.message || "Could not lock credit");
    },
  });

  // Update credit limit mutation
  const updateLimitMutation = useMutation({
    mutationFn: async ({ playerId, limit }) => {
      return await superAdminAPI.updateCreditLimit(selectedClubId, playerId, { creditLimit: parseFloat(limit) });
    },
    onSuccess: async () => {
      toast.success("Credit limit updated successfully!");
      // Force refetch the players data
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Credit Feature Management</h1>
        <p className="text-gray-400">Ultimate control: players, staff, credit, overrides and more</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("players-list")}
          className={`px-6 py-3 font-semibold rounded-t-lg transition-colors ${
            activeTab === "players-list"
              ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white"
              : "bg-slate-700 text-gray-300 hover:bg-slate-600"
          }`}
        >
          Players List & Credit Management
        </button>
        <button
          onClick={() => setActiveTab("credit-requests")}
          className={`px-6 py-3 font-semibold rounded-t-lg transition-colors ${
            activeTab === "credit-requests"
              ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white"
              : "bg-slate-700 text-gray-300 hover:bg-slate-600"
          }`}
        >
          Credit Approval Requests
        </button>
        <button
          onClick={() => setActiveTab("session-history")}
          className={`px-6 py-3 font-semibold rounded-t-lg transition-colors ${
            activeTab === "session-history"
              ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white"
              : "bg-slate-700 text-gray-300 hover:bg-slate-600"
          }`}
        >
          Credit session history
        </button>
      </div>

      {/* Content */}
      <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-lg p-6">{/* Players List Tab */}
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
                          Balance: <span className={`font-bold ${(player.balance || 0) < 0 ? 'text-red-400' : 'text-green-400'}`}>₹{Number(player.balance || 0).toLocaleString()}</span>
                        </p>
                        {player.creditEnabled && (
                          <div className="mt-2 space-y-1">
                            {(() => {
                              const creditView = resolveCreditView(player);
                              return (
                                <>
                            <p className="text-blue-400 text-sm">
                              Total credit: <span className="font-bold">₹{creditView.creditLimitNum.toLocaleString()}</span>
                            </p>
                            <p className="text-rose-300 text-sm">
                              Credit used: <span className="font-bold">₹{creditView.usedNum.toLocaleString()}</span>
                            </p>
                            <p className="text-cyan-300 text-sm">
                              Credit on line: <span className="font-bold">₹{creditView.onLineNum.toLocaleString()}</span>
                            </p>
                            <p className="text-emerald-300 text-sm">
                              Credit remaining:{' '}
                              <span className="font-bold">₹{creditView.remainingNum.toLocaleString()}</span>
                            </p>
                                </>
                              );
                            })()}
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
                            <button
                              type="button"
                              onClick={() => {
                                setPlayerToLock(player);
                                setShowLockModal(true);
                              }}
                              className="px-4 py-2 bg-rose-900/80 hover:bg-rose-800 border border-rose-600/60 text-rose-100 rounded-lg font-semibold transition-colors"
                            >
                              Lock credit
                            </button>
                            <span className="px-4 py-2 bg-green-600 text-white text-center rounded-lg font-semibold">
                              Credit enabled
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
            <h2 className="text-2xl font-bold text-white mb-4">Credit Approval Requests</h2>
            {requestsLoading ? (
              <div className="text-gray-400 text-center py-8">Loading requests...</div>
            ) : creditRequests.length === 0 ? (
              <div className="text-gray-400 text-center py-8">No pending credit requests</div>
            ) : (
              <div className="space-y-4">
                {creditRequests.map((request) => (
                  <div key={request.id} className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        {(() => {
                          const creditView = playerCreditSnapshotById.get(String(request.playerId));
                          return (
                            <>
                        <h3 className="text-white font-semibold text-xl">{request.playerName}</h3>
                        <p className="text-gray-400 text-sm">Player ID: {request.playerId}</p>
                        <p className="text-gray-400 text-sm">
                          Requested Amount: <span className="font-bold text-yellow-400">₹{Number(request.amount).toLocaleString()}</span>
                        </p>
                        <p className="text-gray-400 text-sm">
                          Requested: {new Date(request.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                        </p>
                        {request.notes && (
                          <p className="text-gray-300 text-sm mt-2">
                            Notes: {request.notes}
                          </p>
                        )}
                        {creditView && (
                          <div className="mt-3 rounded-md border border-slate-600 bg-slate-900/40 p-3 text-xs space-y-1">
                            <p className="text-blue-300">
                              Current total credit: <span className="font-semibold">₹{creditView.creditLimitNum.toLocaleString()}</span>
                            </p>
                            <p className="text-rose-300">
                              Current used: <span className="font-semibold">₹{creditView.usedNum.toLocaleString()}</span>
                            </p>
                            <p className="text-cyan-300">
                              Current on line: <span className="font-semibold">₹{creditView.onLineNum.toLocaleString()}</span>
                            </p>
                            <p className="text-emerald-300">
                              Current remaining: <span className="font-semibold">₹{creditView.remainingNum.toLocaleString()}</span>
                            </p>
                          </div>
                        )}
                            </>
                          );
                        })()}
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

        {activeTab === "session-history" && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Credit session history</h2>
            <p className="text-gray-400 text-sm mb-4">
              Each row explains what the amount means — e.g. <strong className="text-gray-300">credit used on table</strong> (line → chips),{" "}
              <strong className="text-gray-300">credit settlement when leaving table</strong> (exit closes the line), or{" "}
              <strong className="text-gray-300">club buy-in repayment</strong> (cash at counter paying down the line). Search by name, Tilt ID, or email.{" "}
              <span className="text-amber-200/80">Click any row to open full details and notes.</span>
            </p>
            <div className="flex flex-wrap gap-3 mb-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-gray-400 text-xs mb-1">Search</label>
                <input
                  type="text"
                  value={historyDraft.q}
                  onChange={(e) => setHistoryDraft((d) => ({ ...d, q: e.target.value }))}
                  placeholder="Name, Tilt ID, or email"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">From</label>
                <input
                  type="datetime-local"
                  value={historyDraft.from}
                  onChange={(e) => setHistoryDraft((d) => ({ ...d, from: e.target.value }))}
                  className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">To</label>
                <input
                  type="datetime-local"
                  value={historyDraft.to}
                  onChange={(e) => setHistoryDraft((d) => ({ ...d, to: e.target.value }))}
                  className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setHistoryFilters({ ...historyDraft });
                  setHistoryPage(1);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold text-sm"
              >
                Apply filters
              </button>
            </div>

            {sessionHistoryLoading ? (
              <div className="text-gray-400 text-center py-8">Loading…</div>
            ) : !sessionHistoryData?.items?.length ? (
              <div className="text-gray-400 text-center py-8">No events match your filters.</div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border border-slate-700">
                  <table className="w-full text-sm text-left text-gray-200">
                    <thead className="bg-slate-800 text-gray-400 uppercase text-xs">
                      <tr>
                        <th className="px-3 py-2">When</th>
                        <th className="px-3 py-2">What happened</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                        <th className="px-3 py-2">Player</th>
                        <th className="px-3 py-2">Tilt / email</th>
                        <th className="px-3 py-2">Ledger type</th>
                        <th className="px-3 py-2">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessionHistoryData.items.map((row) => {
                        const sum = sessionHistoryRowSummary(row);
                        return (
                        <tr
                          key={row.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSessionHistoryDetailRow(row)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSessionHistoryDetailRow(row);
                            }
                          }}
                          className="border-t border-slate-700 bg-slate-800/40 hover:bg-slate-800/70 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:ring-inset"
                        >
                          <td className="px-3 py-2 whitespace-nowrap">
                            {row.createdAt
                              ? new Date(row.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
                              : "—"}
                          </td>
                          <td className="px-3 py-2 max-w-[280px]">
                            <div className="font-semibold text-emerald-200/95">{sum.eventLabel}</div>
                            {sum.amountNote ? (
                              <div className="text-[11px] text-gray-500 mt-1 leading-snug max-h-8 overflow-hidden" title={sum.amountNote}>
                                {sum.amountNote}
                              </div>
                            ) : null}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-white">₹{Number(row.amount).toLocaleString()}</td>
                          <td className="px-3 py-2">{row.playerFullName || row.playerName}</td>
                          <td className="px-3 py-2 text-xs text-gray-400">
                            <div>{row.tiltId || "—"}</div>
                            <div className="truncate max-w-[180px]">{row.email || "—"}</div>
                          </td>
                          <td className="px-3 py-2 text-xs text-amber-200/70 font-mono">{row.type}</td>
                          <td className="px-3 py-2 text-xs text-gray-400 max-w-[200px] truncate" title={row.notes || ""}>
                            {row.notes || "—"}
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center mt-4 text-gray-400 text-sm">
                  <span>
                    Page {sessionHistoryData.page} of {Math.max(1, sessionHistoryData.totalPages || 1)} ·{" "}
                    {sessionHistoryData.total} total
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={historyPage <= 1}
                      onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1 rounded bg-slate-700 text-white disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={historyPage >= (sessionHistoryData.totalPages || 1)}
                      onClick={() => setHistoryPage((p) => p + 1)}
                      className="px-3 py-1 rounded bg-slate-700 text-white disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Credit session history — row detail */}
      {sessionHistoryDetailRow && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          role="presentation"
          onClick={() => setSessionHistoryDetailRow(null)}
        >
          <div
            className="bg-slate-800 rounded-xl border border-slate-600 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="credit-history-detail-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start gap-3">
                <h3 id="credit-history-detail-title" className="text-xl font-bold text-white">
                  Credit / ledger event
                </h3>
                <button
                  type="button"
                  onClick={() => setSessionHistoryDetailRow(null)}
                  className="text-slate-400 hover:text-white text-2xl leading-none px-2"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {(() => {
                const r = sessionHistoryDetailRow;
                const sum = sessionHistoryRowSummary(r);
                const when = r.createdAt
                  ? new Date(r.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
                  : "—";
                return (
                  <>
                    <div className="rounded-lg bg-slate-900/80 border border-slate-700 p-4 space-y-3 text-sm">
                      <div>
                        <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">What happened</div>
                        <div className="text-emerald-200 font-semibold text-base">{sum.eventLabel}</div>
                        {sum.amountNote ? (
                          <p className="text-gray-400 mt-2 leading-relaxed">{sum.amountNote}</p>
                        ) : null}
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700">
                        <div>
                          <div className="text-gray-500 text-xs uppercase">Amount</div>
                          <div className="text-white font-mono text-lg">₹{Number(r.amount).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs uppercase">Ledger type</div>
                          <div className="text-amber-200/90 font-mono">{r.type || "—"}</div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-gray-500 text-xs uppercase">When</div>
                          <div className="text-gray-200">{when}</div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-900/50 border border-slate-700 p-4 space-y-2 text-sm">
                      <div className="text-gray-500 text-xs uppercase tracking-wide">Player</div>
                      <div className="text-white font-medium">{r.playerFullName || r.playerName || "—"}</div>
                      <div className="grid grid-cols-1 gap-1 text-gray-400 text-xs">
                        <div>
                          <span className="text-gray-500">Tilt ID: </span>
                          {r.tiltId || "—"}
                        </div>
                        <div>
                          <span className="text-gray-500">Email: </span>
                          {r.email || "—"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-500 text-xs uppercase tracking-wide mb-2">Notes (full)</div>
                      <div className="rounded-lg bg-black/30 border border-slate-600 p-4 text-gray-200 text-sm whitespace-pre-wrap break-words min-h-[4rem]">
                        {r.notes?.trim() ? r.notes : "No notes on this transaction."}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSessionHistoryDetailRow(null)}
                      className="w-full py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold"
                    >
                      Close
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Lock credit (super admin) */}
      {showLockModal && playerToLock && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700 max-h-[85vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Lock credit for player</h3>
            <p className="text-gray-300 mb-3">
              Lock credit for <span className="font-semibold text-white">{playerToLock.name}</span>? They will not be able to request credit until you unlock again.
            </p>
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-600/40 rounded-lg text-amber-100 text-sm space-y-2">
              <p className="font-semibold text-amber-200">Allowed only if:</p>
              <ul className="list-disc list-inside text-gray-200 space-y-1">
                <li>No <strong>pending</strong> credit request</li>
                <li>All <strong>club credit is paid back</strong> (no outstanding credit on the ledger)</li>
                <li>No <strong>credit chips</strong> on an active table session</li>
              </ul>
              <p className="text-gray-400 pt-1">
                If anything is still owed or in play, you will see an error — settle credit first (player pays / buy-out).
              </p>
            </div>
            <p className="text-xs text-slate-500 mb-4">Super admin only. Other roles cannot lock credit.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => lockCreditMutation.mutate({ playerId: playerToLock.id })}
                disabled={lockCreditMutation.isPending}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {lockCreditMutation.isPending ? "Locking…" : "Confirm lock"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLockModal(false);
                  setPlayerToLock(null);
                }}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
                Current Balance: ₹{Number(selectedPlayer.balance || 0).toLocaleString()}
              </p>
            </div>
            <div className="mb-6">
              <label className="block text-gray-300 mb-2 font-semibold">
                Set Credit Limit (₹) <span className="text-red-400">*</span>
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
                Current Limit: ₹{selectedPlayer.creditLimit || 0}
              </p>
            </div>
            <div className="mb-6">
              <label className="block text-gray-300 mb-2 font-semibold">
                New Credit Limit (₹) <span className="text-red-400">*</span>
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

