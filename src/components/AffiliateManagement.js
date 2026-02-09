import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { affiliateAPI } from "../lib/api";
import toast from "react-hot-toast";

export default function AffiliateManagement({ selectedClubId }) {
  const [activeTab, setActiveTab] = useState("list"); // 'list' or 'payments'
  const [currentPage, setCurrentPage] = useState(1);
  const [showReferralsModal, setShowReferralsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [referralSearch, setReferralSearch] = useState("");
  const [referralKycFilter, setReferralKycFilter] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    status: "",
  });

  const [transactionFilters, setTransactionFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
    affiliateId: "",
  });

  const [transactionPage, setTransactionPage] = useState(1);

  const [paymentForm, setPaymentForm] = useState({
    affiliateId: "",
    amount: "",
    transactionType: "payment",
    description: "",
    notes: "",
  });

  const queryClient = useQueryClient();

  // Get affiliates list with pagination
  const { data: affiliatesData, isLoading: affiliatesLoading } = useQuery({
    queryKey: ["affiliates", selectedClubId, currentPage, filters],
    queryFn: () =>
      affiliateAPI.getAffiliates(selectedClubId, {
        page: currentPage,
        limit: 10,
        ...filters,
      }),
    enabled: !!selectedClubId && activeTab === "list",
  });

  // Get affiliate referrals
  const { data: referralsData, isLoading: referralsLoading } = useQuery({
    queryKey: ["affiliate-referrals", selectedAffiliate?.id, referralSearch, referralKycFilter],
    queryFn: () =>
      affiliateAPI.getAffiliateReferrals(selectedClubId, selectedAffiliate?.id, {
        search: referralSearch,
        kycStatus: referralKycFilter,
      }),
    enabled: !!selectedAffiliate?.id && showReferralsModal,
  });

  // Get affiliate transactions
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ["affiliate-transactions", selectedClubId, transactionPage, transactionFilters],
    queryFn: () =>
      affiliateAPI.getAffiliateTransactions(selectedClubId, {
        page: transactionPage,
        limit: 10,
        ...transactionFilters,
      }),
    enabled: !!selectedClubId && activeTab === "payments",
  });

  // Process payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: (data) => affiliateAPI.processAffiliatePayment(selectedClubId, data),
    onSuccess: () => {
      toast.success("Payment processed successfully!");
      queryClient.invalidateQueries(["affiliate-transactions", selectedClubId]);
      queryClient.invalidateQueries(["affiliates", selectedClubId]);
      setShowPaymentModal(false);
      setSelectedAffiliate(null);
      setPaymentForm({
        affiliateId: "",
        amount: "",
        transactionType: "payment",
        description: "",
        notes: "",
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to process payment");
    },
  });

  const handleViewReferrals = (affiliate) => {
    setSelectedAffiliate(affiliate);
    setShowReferralsModal(true);
    setReferralSearch("");
    setReferralKycFilter("");
  };

  const handleProcessPayment = (affiliate) => {
    setSelectedAffiliate(affiliate);
    setPaymentForm({
      ...paymentForm,
      affiliateId: affiliate.id,
    });
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = () => {
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    processPaymentMutation.mutate({
      ...paymentForm,
      amount: parseFloat(paymentForm.amount),
    });
  };

  const affiliates = affiliatesData?.affiliates || [];
  const totalPages = affiliatesData?.totalPages || 1;
  const total = affiliatesData?.total || 0;

  const referrals = referralsData?.players || [];

  const transactions = transactionsData?.transactions || [];
  const transactionTotalPages = transactionsData?.totalPages || 1;
  const transactionTotal = transactionsData?.total || 0;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "text-green-400";
      case "inactive":
        return "text-gray-400";
      case "suspended":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getKycStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "verified":
        return "bg-green-900/30 text-green-400 border-green-700";
      case "pending":
        return "bg-yellow-900/30 text-yellow-400 border-yellow-700";
      case "rejected":
        return "bg-red-900/30 text-red-400 border-red-700";
      default:
        return "bg-gray-900/30 text-gray-400 border-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Affiliate Management</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => setActiveTab("list")}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === "list"
              ? "text-white border-b-2 border-yellow-500 bg-yellow-900/20"
              : "text-gray-400 hover:text-white"
          }`}
        >
          📋 Affiliates List
        </button>
        <button
          onClick={() => setActiveTab("payments")}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === "payments"
              ? "text-white border-b-2 border-green-500 bg-green-900/20"
              : "text-gray-400 hover:text-white"
          }`}
        >
          💰 Payments & Transactions
        </button>
      </div>

      {/* Affiliates List Tab */}
      {activeTab === "list" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-white text-sm mb-2 block">Search</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
                  placeholder="Search by name, code, or email..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">Status</label>
                <select
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Affiliates Table */}
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">
                Affiliates ({total})
              </h3>
            </div>

            {affiliatesLoading ? (
              <div className="text-white text-center py-8">Loading...</div>
            ) : affiliates.length === 0 ? (
              <div className="text-gray-400 text-center py-8">No affiliates found</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left text-white font-semibold p-3">Name</th>
                        <th className="text-left text-white font-semibold p-3">Email</th>
                        <th className="text-left text-white font-semibold p-3">Code</th>
                        <th className="text-center text-white font-semibold p-3">Referrals</th>
                        <th className="text-right text-white font-semibold p-3">Earnings</th>
                        <th className="text-center text-white font-semibold p-3">Status</th>
                        <th className="text-center text-white font-semibold p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {affiliates.map((affiliate) => (
                        <tr key={affiliate.id} className="border-b border-slate-700 hover:bg-slate-700">
                          <td className="text-white p-3">{affiliate.name || "N/A"}</td>
                          <td className="text-gray-400 p-3 text-sm">{affiliate.email}</td>
                          <td className="p-3">
                            <span className="px-3 py-1 bg-yellow-900/30 text-yellow-400 rounded-lg font-mono text-sm border border-yellow-700">
                              {affiliate.code}
                            </span>
                          </td>
                          <td className="text-center p-3">
                            <div className="text-cyan-400 font-semibold">{affiliate.totalReferrals}</div>
                            <div className="text-xs text-gray-400">
                              ({affiliate.verifiedReferrals} verified)
                            </div>
                          </td>
                          <td className="text-right text-green-400 font-semibold p-3">
                            ₹{Number(affiliate.totalCommission || 0).toFixed(2)}
                          </td>
                          <td className="text-center p-3">
                            <span className={`font-semibold ${getStatusColor(affiliate.status)}`}>
                              {affiliate.status}
                            </span>
                          </td>
                          <td className="text-center p-3">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleViewReferrals(affiliate)}
                                className="px-3 py-1 bg-cyan-900/30 hover:bg-cyan-800/50 text-cyan-400 rounded-lg text-sm border border-cyan-700 transition-colors"
                              >
                                View Players
                              </button>
                              <button
                                onClick={() => handleProcessPayment(affiliate)}
                                className="px-3 py-1 bg-green-900/30 hover:bg-green-800/50 text-green-400 rounded-lg text-sm border border-green-700 transition-colors"
                              >
                                Send Money
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-gray-400 text-sm">
                    Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, total)} of {total} entries
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
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-4 py-2 rounded-lg ${
                            currentPage === i + 1
                              ? "bg-yellow-600 text-white"
                              : "bg-slate-700 hover:bg-slate-600 text-white"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
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
              </>
            )}
          </div>
        </div>
      )}

      {/* Payments & Transactions Tab */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-white text-sm mb-2 block">Search</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  placeholder="Search by name, code, email..."
                  value={transactionFilters.search}
                  onChange={(e) => setTransactionFilters({ ...transactionFilters, search: e.target.value })}
                />
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">Start Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  value={transactionFilters.startDate}
                  onChange={(e) => setTransactionFilters({ ...transactionFilters, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">End Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  value={transactionFilters.endDate}
                  onChange={(e) => setTransactionFilters({ ...transactionFilters, endDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">Affiliate</label>
                <select
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  value={transactionFilters.affiliateId}
                  onChange={(e) => setTransactionFilters({ ...transactionFilters, affiliateId: e.target.value })}
                >
                  <option value="">All Affiliates</option>
                  {affiliates.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name || a.email} ({a.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Transaction History ({transactionTotal})
            </h3>

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
                        <th className="text-left text-white font-semibold p-3">Date</th>
                        <th className="text-left text-white font-semibold p-3">Affiliate</th>
                        <th className="text-left text-white font-semibold p-3">Code</th>
                        <th className="text-left text-white font-semibold p-3">Type</th>
                        <th className="text-right text-white font-semibold p-3">Amount</th>
                        <th className="text-left text-white font-semibold p-3">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-slate-700 hover:bg-slate-700">
                          <td className="text-white p-3">
                            {new Date(transaction.processedAt).toLocaleDateString()}
                          </td>
                          <td className="text-white p-3">
                            {transaction.affiliate?.name || transaction.affiliate?.user?.email || "N/A"}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded text-xs font-mono border border-yellow-700">
                              {transaction.affiliate?.code}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs capitalize border border-blue-700">
                              {transaction.transactionType}
                            </span>
                          </td>
                          <td className="text-right text-green-400 font-semibold p-3">
                            ₹{Number(transaction.amount).toFixed(2)}
                          </td>
                          <td className="text-gray-400 p-3 text-sm">
                            {transaction.description || transaction.notes || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-gray-400 text-sm">
                    Showing {(transactionPage - 1) * 10 + 1} to{" "}
                    {Math.min(transactionPage * 10, transactionTotal)} of {transactionTotal} entries
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTransactionPage((p) => Math.max(1, p - 1))}
                      disabled={transactionPage === 1}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <div className="flex gap-2">
                      {[...Array(transactionTotalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setTransactionPage(i + 1)}
                          className={`px-4 py-2 rounded-lg ${
                            transactionPage === i + 1
                              ? "bg-green-600 text-white"
                              : "bg-slate-700 hover:bg-slate-600 text-white"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setTransactionPage((p) => Math.min(transactionTotalPages, p + 1))}
                      disabled={transactionPage === transactionTotalPages}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* View Referrals Modal */}
      {showReferralsModal && selectedAffiliate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-5xl w-full border border-cyan-600 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Referral Players</h2>
                <p className="text-cyan-400 mt-1">
                  Affiliate: {selectedAffiliate.name || selectedAffiliate.email} ({selectedAffiliate.code})
                </p>
              </div>
              <button
                onClick={() => {
                  setShowReferralsModal(false);
                  setSelectedAffiliate(null);
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-white text-sm mb-2 block">Search Player</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"
                  placeholder="Search by name, email, or phone..."
                  value={referralSearch}
                  onChange={(e) => setReferralSearch(e.target.value)}
                />
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">KYC Status</label>
                <select
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"
                  value={referralKycFilter}
                  onChange={(e) => setReferralKycFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {referralsLoading ? (
              <div className="text-white text-center py-8">Loading...</div>
            ) : referrals.length === 0 ? (
              <div className="text-gray-400 text-center py-8">No referral players found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left text-white font-semibold p-3">Name</th>
                      <th className="text-left text-white font-semibold p-3">Email</th>
                      <th className="text-left text-white font-semibold p-3">Phone</th>
                      <th className="text-center text-white font-semibold p-3">KYC Status</th>
                      <th className="text-center text-white font-semibold p-3">Status</th>
                      <th className="text-right text-white font-semibold p-3">Total Spent</th>
                      <th className="text-left text-white font-semibold p-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((player) => (
                      <tr key={player.id} className="border-b border-slate-700 hover:bg-slate-700">
                        <td className="text-white p-3">{player.name}</td>
                        <td className="text-gray-400 p-3 text-sm">{player.email}</td>
                        <td className="text-gray-400 p-3 text-sm">{player.phoneNumber || "N/A"}</td>
                        <td className="text-center p-3">
                          <span className={`px-2 py-1 rounded text-xs capitalize border ${getKycStatusColor(player.kycStatus)}`}>
                            {player.kycStatus}
                          </span>
                        </td>
                        <td className="text-center p-3">
                          <span className={`font-semibold ${getStatusColor(player.status)}`}>
                            {player.status}
                          </span>
                        </td>
                        <td className="text-right text-cyan-400 font-semibold p-3">
                          ₹{Number(player.totalSpent || 0).toFixed(2)}
                        </td>
                        <td className="text-gray-400 p-3 text-sm">
                          {new Date(player.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Process Payment Modal */}
      {showPaymentModal && selectedAffiliate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-green-600 max-h-[85vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">💰 Send Money to Affiliate</h2>

            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4 mb-6">
              <div className="text-xs text-green-400 mb-1">Sending to:</div>
              <h3 className="text-white font-semibold text-xl">
                {selectedAffiliate.name || selectedAffiliate.email}
              </h3>
              <p className="text-sm text-green-300 mt-1">Code: {selectedAffiliate.code}</p>
              <p className="text-sm text-gray-400 mt-1">
                Current Earnings: ₹{Number(selectedAffiliate.totalCommission || 0).toFixed(2)}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm mb-2 block">Amount (₹) *</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  placeholder="₹0.00"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                />
              </div>

              <div>
                <label className="text-white text-sm mb-2 block">Transaction Type</label>
                <select
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  value={paymentForm.transactionType}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transactionType: e.target.value })}
                >
                  <option value="payment">Payment</option>
                  <option value="bonus">Bonus</option>
                  <option value="adjustment">Adjustment</option>
                  <option value="commission">Commission</option>
                </select>
              </div>

              <div>
                <label className="text-white text-sm mb-2 block">Description</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  placeholder="Brief description..."
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                />
              </div>

              <div>
                <label className="text-white text-sm mb-2 block">Notes (Optional)</label>
                <textarea
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 h-24"
                  placeholder="Additional notes..."
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmitPayment}
                disabled={processPaymentMutation.isLoading}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {processPaymentMutation.isLoading ? "Processing..." : "Process Payment"}
              </button>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedAffiliate(null);
                }}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
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

