import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financialOverridesAPI } from "../lib/api";
import toast from "react-hot-toast";

export default function FinancialOverrides({ selectedClubId }) {
  const [activeTab, setActiveTab] = useState("players"); // 'players' or 'staff'
  const [staffSubTab, setStaffSubTab] = useState("dealer-cashout"); // 'dealer-cashout' or 'salary-bonus'
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [editForm, setEditForm] = useState({
    amount: "",
    reason: "",
  });

  const [cancelForm, setCancelForm] = useState({
    reason: "",
  });

  const queryClient = useQueryClient();

  // Get all transactions
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ["financial-overrides", selectedClubId, activeTab, staffSubTab, currentPage],
    queryFn: () =>
      financialOverridesAPI.getAllTransactions(selectedClubId, {
        category: activeTab === "players" ? "player" : "staff",
        subCategory: activeTab === "staff" ? staffSubTab : undefined,
        page: currentPage,
        limit: 50,
      }),
    enabled: !!selectedClubId,
  });

  // Edit transaction mutation
  const editMutation = useMutation({
    mutationFn: ({ transactionId, data }) =>
      financialOverridesAPI.editTransaction(selectedClubId, transactionId, data),
    onSuccess: () => {
      toast.success("Transaction edited successfully!");
      queryClient.invalidateQueries(["financial-overrides", selectedClubId]);
      setShowEditModal(false);
      setSelectedTransaction(null);
      setEditForm({ amount: "", reason: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to edit transaction");
    },
  });

  // Cancel transaction mutation
  const cancelMutation = useMutation({
    mutationFn: ({ transactionId, data }) =>
      financialOverridesAPI.cancelTransaction(selectedClubId, transactionId, data),
    onSuccess: () => {
      toast.success("Transaction cancelled successfully!");
      queryClient.invalidateQueries(["financial-overrides", selectedClubId]);
      setShowCancelModal(false);
      setSelectedTransaction(null);
      setCancelForm({ reason: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to cancel transaction");
    },
  });

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setEditForm({
      amount: transaction.amount.toString(),
      reason: "",
    });
    setShowEditModal(true);
  };

  const handleCancel = (transaction) => {
    setSelectedTransaction(transaction);
    setCancelForm({ reason: "" });
    setShowCancelModal(true);
  };

  const handleSubmitEdit = () => {
    if (!editForm.amount || parseFloat(editForm.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!editForm.reason.trim()) {
      toast.error("Please provide a reason for the override");
      return;
    }

    editMutation.mutate({
      transactionId: selectedTransaction.transactionId || selectedTransaction.id,
      data: {
        amount: parseFloat(editForm.amount),
        reason: editForm.reason.trim(),
      },
    });
  };

  const handleSubmitCancel = () => {
    cancelMutation.mutate({
      transactionId: selectedTransaction.transactionId || selectedTransaction.id,
      data: {
        reason: cancelForm.reason.trim() || "Transaction cancelled by admin",
      },
    });
  };

  const transactions = transactionsData?.transactions || [];
  const totalPages = transactionsData?.totalPages || 1;
  const total = transactionsData?.total || 0;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "cancelled":
        return "text-red-400";
      case "failed":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  const getTypeColor = (type) => {
    if (type.includes("Bonus")) return "bg-purple-900/30 text-purple-400 border-purple-700";
    if (type.includes("Salary")) return "bg-blue-900/30 text-blue-400 border-blue-700";
    if (type.includes("Deposit")) return "bg-green-900/30 text-green-400 border-green-700";
    if (type.includes("Cashout") || type.includes("Withdrawal")) return "bg-red-900/30 text-red-400 border-red-700";
    if (type.includes("Buy In")) return "bg-cyan-900/30 text-cyan-400 border-cyan-700";
    return "bg-gray-900/30 text-gray-400 border-gray-700";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Financial Overrides</h2>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => {
            setActiveTab("players");
            setCurrentPage(1);
          }}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === "players"
              ? "text-white border-b-2 border-cyan-500 bg-cyan-900/20"
              : "text-gray-400 hover:text-white"
          }`}
        >
          👤 Player Transactions
        </button>
        <button
          onClick={() => {
            setActiveTab("staff");
            setStaffSubTab("dealer-cashout");
            setCurrentPage(1);
          }}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === "staff"
              ? "text-white border-b-2 border-purple-500 bg-purple-900/20"
              : "text-gray-400 hover:text-white"
          }`}
        >
          👔 Staff Transactions
        </button>
      </div>

      {/* Staff Sub-Tabs */}
      {activeTab === "staff" && (
        <div className="flex gap-2 border-b border-slate-700 mt-2">
          <button
            onClick={() => {
              setStaffSubTab("dealer-cashout");
              setCurrentPage(1);
            }}
            className={`px-6 py-2 font-semibold transition-colors text-sm ${
              staffSubTab === "dealer-cashout"
                ? "text-white border-b-2 border-green-500 bg-green-900/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            💵 Dealer Cashouts
          </button>
          <button
            onClick={() => {
              setStaffSubTab("salary-bonus");
              setCurrentPage(1);
            }}
            className={`px-6 py-2 font-semibold transition-colors text-sm ${
              staffSubTab === "salary-bonus"
                ? "text-white border-b-2 border-blue-500 bg-blue-900/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            💰 Salary & Bonuses
          </button>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">
            {activeTab === "players"
              ? "Player Transactions"
              : staffSubTab === "dealer-cashout"
              ? "Dealer Cashouts"
              : "Salary & Bonuses"}{" "}
            ({total})
          </h3>
        </div>

        {transactionsLoading ? (
          <div className="text-white text-center py-8">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No transactions found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-white font-semibold p-3">Type</th>
                    <th className="text-left text-white font-semibold p-3">
                      {activeTab === "players" ? "Player" : "Staff"} Name
                    </th>
                    <th className="text-right text-white font-semibold p-3">Amount</th>
                    <th className="text-center text-white font-semibold p-3">Status</th>
                    <th className="text-left text-white font-semibold p-3">Date</th>
                    <th className="text-center text-white font-semibold p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-slate-700 hover:bg-slate-700">
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs capitalize border ${getTypeColor(transaction.type)}`}>
                          {transaction.type}
                        </span>
                        {transaction.isOverridden && (
                          <span 
                            onClick={() => {
                              if (transaction.overrideReason) {
                                alert(`Override Reason:\n\n${transaction.overrideReason}`);
                              }
                            }}
                            className="ml-2 px-2 py-1 rounded text-xs bg-orange-900/30 text-orange-400 border border-orange-700 cursor-pointer hover:bg-orange-900/50 transition-colors"
                            title="Click to view override reason"
                          >
                            ✏️ Overridden
                          </span>
                        )}
                      </td>
                      <td className="text-white p-3">{transaction.entityName}</td>
                      <td className="text-right p-3">
                        <div className="flex flex-col items-end">
                          <span className="text-white font-semibold">₹{Number(transaction.amount).toFixed(2)}</span>
                          {transaction.originalAmount && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{Number(transaction.originalAmount).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-center p-3">
                        <span className={`font-semibold ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="text-gray-400 p-3 text-sm">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="text-center p-3">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(transaction)}
                            disabled={transaction.status === "Cancelled"}
                            className="px-3 py-1 bg-blue-900/30 hover:bg-blue-800/50 text-blue-400 rounded-lg text-sm border border-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleCancel(transaction)}
                            disabled={transaction.status === "Cancelled"}
                            className="px-3 py-1 bg-red-900/30 hover:bg-red-800/50 text-red-400 rounded-lg text-sm border border-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-gray-400 text-sm">
                  Showing {(currentPage - 1) * 50 + 1} to {Math.min(currentPage * 50, total)} of {total} entries
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex gap-2">
                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                      const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                      if (pageNum > totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-4 py-2 rounded-lg ${
                            currentPage === pageNum
                              ? "bg-cyan-600 text-white"
                              : "bg-slate-700 hover:bg-slate-600 text-white"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Transaction Modal */}
      {showEditModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-blue-600">
            <h2 className="text-2xl font-bold text-white mb-6">✏️ Edit Transaction</h2>

            <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mb-6">
              <div className="text-xs text-blue-400 mb-1">Transaction Details:</div>
              <h3 className="text-white font-semibold">{selectedTransaction.type}</h3>
              <p className="text-sm text-blue-300 mt-1">
                {activeTab === "players" ? "Player" : "Staff"}: {selectedTransaction.entityName}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Current Amount: ₹{Number(selectedTransaction.amount).toFixed(2)}
              </p>
              {selectedTransaction.originalAmount && (
                <p className="text-sm text-gray-400 mt-1">
                  Original Amount: ₹{Number(selectedTransaction.originalAmount).toFixed(2)}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm mb-2 block">New Amount (₹) *</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="₹0.00"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                />
              </div>

              <div>
                <label className="text-white text-sm mb-2 block">Reason for Override *</label>
                <textarea
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 h-24"
                  placeholder="Please provide a reason for this override..."
                  value={editForm.reason}
                  onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmitEdit}
                disabled={editMutation.isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {editMutation.isLoading ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedTransaction(null);
                }}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Transaction Modal */}
      {showCancelModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-red-600">
            <h2 className="text-2xl font-bold text-white mb-6">❌ Cancel Transaction</h2>

            <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 mb-6">
              <div className="text-xs text-red-400 mb-1">Transaction Details:</div>
              <h3 className="text-white font-semibold">{selectedTransaction.type}</h3>
              <p className="text-sm text-red-300 mt-1">
                {activeTab === "players" ? "Player" : "Staff"}: {selectedTransaction.entityName}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Amount: ₹{Number(selectedTransaction.amount).toFixed(2)}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm mb-2 block">Reason for Cancellation (Optional)</label>
                <textarea
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 h-24"
                  placeholder="Please provide a reason for cancellation..."
                  value={cancelForm.reason}
                  onChange={(e) => setCancelForm({ ...cancelForm, reason: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmitCancel}
                disabled={cancelMutation.isLoading}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {cancelMutation.isLoading ? "Cancelling..." : "Cancel Transaction"}
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedTransaction(null);
                }}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
