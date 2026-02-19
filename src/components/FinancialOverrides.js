import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financialOverridesAPI } from "../lib/api";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 10;

const formatTypeName = (type) => {
  if (!type) return "Unknown";
  const map = {
    'BUY_IN': 'Buy In',
    'BUY_OUT': 'Buy Out',
    'CLUB_BUY_IN': 'Club Buy In',
    'CLUB_BUY_OUT': 'Club Buy Out',
    'TABLE_BUY_IN': 'Table Buy In',
    'TABLE_BUY_OUT': 'Table Buy Out',
    'CREDIT': 'Credit',
    'DEBIT': 'Debit',
    'DEPOSIT': 'Deposit',
    'WITHDRAWAL': 'Withdrawal',
    'REFUND': 'Refund',
    'RAKE': 'Rake',
    'BONUS': 'Bonus',
    'SALARY_PAYMENT': 'Salary Payment',
    'DEALER_CASHOUT': 'Dealer Cashout',
    'MANAGER_CASHOUT': 'Manager Cashout',
  };
  if (map[type]) return map[type];
  if (map[type.toUpperCase()]) return map[type.toUpperCase()];
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export default function FinancialOverrides({ selectedClubId }) {
  const [activeTab, setActiveTab] = useState("players");
  const [staffSubTab, setStaffSubTab] = useState("dealer-cashout");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [searchName, setSearchName] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [editForm, setEditForm] = useState({ amount: "", reason: "" });
  const [cancelForm, setCancelForm] = useState({ reason: "" });

  const queryClient = useQueryClient();

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ["financial-overrides", selectedClubId, activeTab, staffSubTab],
    queryFn: () =>
      financialOverridesAPI.getAllTransactions(selectedClubId, {
        category: activeTab === "players" ? "player" : "staff",
        subCategory: activeTab === "staff" ? staffSubTab : undefined,
        page: 1,
        limit: 9999,
      }),
    enabled: !!selectedClubId,
  });

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
    setEditForm({ amount: transaction.amount.toString(), reason: "" });
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
      data: { amount: parseFloat(editForm.amount), reason: editForm.reason.trim() },
    });
  };

  const handleSubmitCancel = () => {
    cancelMutation.mutate({
      transactionId: selectedTransaction.transactionId || selectedTransaction.id,
      data: { reason: cancelForm.reason.trim() || "Transaction cancelled by admin" },
    });
  };

  const rawTransactions = transactionsData?.transactions || [];

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection(field === "date" ? "desc" : "asc");
    }
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchName("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setSortField("date");
    setSortDirection("desc");
    setCurrentPage(1);
  };

  const filteredAndSorted = useMemo(() => {
    let data = [...rawTransactions];

    if (searchName.trim()) {
      const q = searchName.toLowerCase().trim();
      data = data.filter(t => (t.entityName || "").toLowerCase().includes(q));
    }

    if (filterDateFrom) {
      const from = new Date(filterDateFrom);
      from.setHours(0, 0, 0, 0);
      data = data.filter(t => new Date(t.date) >= from);
    }
    if (filterDateTo) {
      const to = new Date(filterDateTo);
      to.setHours(23, 59, 59, 999);
      data = data.filter(t => new Date(t.date) <= to);
    }

    data.sort((a, b) => {
      let valA, valB;
      switch (sortField) {
        case "type":
          valA = formatTypeName(a.type).toLowerCase();
          valB = formatTypeName(b.type).toLowerCase();
          break;
        case "game":
          valA = (a.gameType || "general").toLowerCase();
          valB = (b.gameType || "general").toLowerCase();
          break;
        case "name":
          valA = (a.entityName || "").toLowerCase();
          valB = (b.entityName || "").toLowerCase();
          break;
        case "amount":
          valA = Number(a.amount || 0);
          valB = Number(b.amount || 0);
          return sortDirection === "asc" ? valA - valB : valB - valA;
        case "status":
          valA = (a.status || "").toLowerCase();
          valB = (b.status || "").toLowerCase();
          break;
        case "date":
        default:
          valA = new Date(a.date || 0).getTime();
          valB = new Date(b.date || 0).getTime();
          return sortDirection === "asc" ? valA - valB : valB - valA;
      }
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [rawTransactions, searchName, filterDateFrom, filterDateTo, sortField, sortDirection]);

  const totalFiltered = filteredAndSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / ITEMS_PER_PAGE));
  const paginatedData = filteredAndSorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const summaryStats = useMemo(() => {
    const all = rawTransactions;
    const allTotal = all.reduce((s, t) => s + Number(t.amount || 0), 0);
    const allByType = {};
    all.forEach(t => {
      const type = formatTypeName(t.type);
      if (!allByType[type]) allByType[type] = { count: 0, amount: 0 };
      allByType[type].count++;
      allByType[type].amount += Number(t.amount || 0);
    });

    const pokerTxns = all.filter(t => t.gameType === 'poker');
    const rummyTxns = all.filter(t => t.gameType === 'rummy');
    const generalTxns = all.filter(t => t.gameType !== 'poker' && t.gameType !== 'rummy');

    const computeBreakdown = (txns) => {
      const total = txns.reduce((s, t) => s + Number(t.amount || 0), 0);
      const byType = {};
      txns.forEach(t => {
        const type = formatTypeName(t.type);
        if (!byType[type]) byType[type] = { count: 0, amount: 0 };
        byType[type].count++;
        byType[type].amount += Number(t.amount || 0);
      });
      return { count: txns.length, total, byType };
    };

    return {
      club: { count: all.length, total: allTotal, byType: allByType },
      poker: computeBreakdown(pokerTxns),
      rummy: computeBreakdown(rummyTxns),
      general: computeBreakdown(generalTxns),
    };
  }, [rawTransactions]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed": return "text-green-400";
      case "processed": return "text-green-400";
      case "pending": return "text-yellow-400";
      case "cancelled": return "text-red-400";
      case "failed": return "text-red-500";
      default: return "text-gray-400";
    }
  };

  const getTypeStyle = (type) => {
    const t = (type || "").toLowerCase().replace(/_/g, ' ');
    if (t.includes("club buy in")) return "bg-green-900/40 text-green-400 border-green-600/50";
    if (t.includes("club buy out")) return "bg-red-900/40 text-red-400 border-red-600/50";
    if (t.includes("table buy in")) return "bg-cyan-900/40 text-cyan-400 border-cyan-600/50";
    if (t.includes("table buy out")) return "bg-teal-900/40 text-teal-400 border-teal-600/50";
    if (t.includes("buy in")) return "bg-emerald-900/40 text-emerald-400 border-emerald-600/50";
    if (t.includes("buy out")) return "bg-orange-900/40 text-orange-400 border-orange-600/50";
    if (t.includes("credit")) return "bg-yellow-900/40 text-yellow-400 border-yellow-600/50";
    if (t.includes("debit")) return "bg-orange-900/40 text-orange-400 border-orange-600/50";
    if (t.includes("bonus")) return "bg-purple-900/40 text-purple-400 border-purple-600/50";
    if (t.includes("deposit")) return "bg-blue-900/40 text-blue-400 border-blue-600/50";
    if (t.includes("refund")) return "bg-indigo-900/40 text-indigo-400 border-indigo-600/50";
    if (t.includes("cashout") || t.includes("withdrawal")) return "bg-rose-900/40 text-rose-400 border-rose-600/50";
    if (t.includes("rake")) return "bg-emerald-900/40 text-emerald-400 border-emerald-600/50";
    if (t.includes("salary")) return "bg-violet-900/40 text-violet-400 border-violet-600/50";
    return "bg-gray-900/40 text-gray-400 border-gray-600/50";
  };

  const getGameTag = (gameType) => {
    if (gameType === 'rummy') {
      return (
        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1">
          <span>🃏</span> Rummy
        </span>
      );
    }
    if (gameType === 'poker') {
      return (
        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 inline-flex items-center gap-1">
          <span>♠</span> Poker
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-500/20 text-slate-300 border border-slate-500/40 inline-flex items-center gap-1">
        <span>🎯</span> General
      </span>
    );
  };

  const SortHeader = ({ field, label, align = "left" }) => {
    const isActive = sortField === field;
    return (
      <th
        className={`p-3 cursor-pointer select-none hover:bg-slate-700/50 transition-colors text-${align}`}
        onClick={() => handleSort(field)}
      >
        <div className={`flex items-center gap-1.5 ${align === "right" ? "justify-end" : align === "center" ? "justify-center" : ""}`}>
          <span className={`text-sm font-semibold ${isActive ? "text-cyan-300" : "text-white"}`}>{label}</span>
          <span className="flex flex-col text-[10px] leading-none">
            <span className={isActive && sortDirection === "asc" ? "text-cyan-400" : "text-gray-600"}>▲</span>
            <span className={isActive && sortDirection === "desc" ? "text-cyan-400" : "text-gray-600"}>▼</span>
          </span>
        </div>
      </th>
    );
  };

  const Pagination = ({ total, current, onChange, filteredCount }) => {
    const pages = Math.max(1, Math.ceil(filteredCount / ITEMS_PER_PAGE));
    if (filteredCount === 0) return null;

    const start = (current - 1) * ITEMS_PER_PAGE + 1;
    const end = Math.min(current * ITEMS_PER_PAGE, filteredCount);

    const getPageNumbers = () => {
      const nums = [];
      const maxVisible = 5;
      let startPage = Math.max(1, current - Math.floor(maxVisible / 2));
      let endPage = Math.min(pages, startPage + maxVisible - 1);
      if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
      }
      for (let i = startPage; i <= endPage; i++) nums.push(i);
      return nums;
    };

    return (
      <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
        <div className="text-gray-400 text-sm">
          Showing {start}–{end} of {filteredCount} entries
          {filteredCount < total && (
            <span className="text-gray-500 ml-1">({total} total)</span>
          )}
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => onChange(1)}
            disabled={current === 1}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            «
          </button>
          <button
            onClick={() => onChange(Math.max(1, current - 1))}
            disabled={current === 1}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ‹
          </button>
          {getPageNumbers().map(num => (
            <button
              key={num}
              onClick={() => onChange(num)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                current === num
                  ? "bg-cyan-600 text-white"
                  : "bg-slate-700 hover:bg-slate-600 text-white"
              }`}
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => onChange(Math.min(pages, current + 1))}
            disabled={current === pages}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ›
          </button>
          <button
            onClick={() => onChange(pages)}
            disabled={current === pages}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            »
          </button>
        </div>
      </div>
    );
  };

  const nameLabel = activeTab === "players" ? "Player" : "Staff";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Transactions</h2>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => { setActiveTab("players"); resetFilters(); }}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === "players"
              ? "text-white border-b-2 border-cyan-500 bg-cyan-900/20"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Player Transactions
        </button>
        <button
          onClick={() => { setActiveTab("staff"); setStaffSubTab("dealer-cashout"); resetFilters(); }}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === "staff"
              ? "text-white border-b-2 border-purple-500 bg-purple-900/20"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Staff Transactions
        </button>
      </div>

      {/* Staff Sub-Tabs */}
      {activeTab === "staff" && (
        <div className="flex gap-2 border-b border-slate-700 mt-2">
          <button
            onClick={() => { setStaffSubTab("dealer-cashout"); resetFilters(); }}
            className={`px-6 py-2 font-semibold transition-colors text-sm ${
              staffSubTab === "dealer-cashout"
                ? "text-white border-b-2 border-green-500 bg-green-900/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Dealer Cashouts
          </button>
          <button
            onClick={() => { setStaffSubTab("salary-bonus"); resetFilters(); }}
            className={`px-6 py-2 font-semibold transition-colors text-sm ${
              staffSubTab === "salary-bonus"
                ? "text-white border-b-2 border-blue-500 bg-blue-900/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Salary & Bonuses
          </button>
        </div>
      )}

      {/* Summary Cards */}
      {!transactionsLoading && rawTransactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-bold text-cyan-300">Club Total</h3>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold text-white">{summaryStats.club.count}</span>
              <span className="text-gray-400 text-sm">transactions</span>
              <span className="ml-auto text-xl font-bold text-cyan-300">
                ₹{summaryStats.club.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {Object.keys(summaryStats.club.byType).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(summaryStats.club.byType).map(([type, data]) => (
                  <span key={type} className="text-xs bg-cyan-900/40 text-cyan-200 px-2 py-1 rounded border border-cyan-600/30">
                    {type}: {data.count} (₹{data.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">♠</span>
              <h3 className="text-lg font-bold text-indigo-300">Poker</h3>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold text-white">{summaryStats.poker.count}</span>
              <span className="text-gray-400 text-sm">transactions</span>
              <span className="ml-auto text-xl font-bold text-indigo-300">
                ₹{summaryStats.poker.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {Object.keys(summaryStats.poker.byType).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(summaryStats.poker.byType).map(([type, data]) => (
                  <span key={type} className="text-xs bg-indigo-900/40 text-indigo-200 px-2 py-1 rounded border border-indigo-600/30">
                    {type}: {data.count} (₹{data.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🃏</span>
              <h3 className="text-lg font-bold text-amber-300">Rummy</h3>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold text-white">{summaryStats.rummy.count}</span>
              <span className="text-gray-400 text-sm">transactions</span>
              <span className="ml-auto text-xl font-bold text-amber-300">
                ₹{summaryStats.rummy.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {Object.keys(summaryStats.rummy.byType).length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(summaryStats.rummy.byType).map(([type, data]) => (
                  <span key={type} className="text-xs bg-amber-900/40 text-amber-200 px-2 py-1 rounded border border-amber-600/30">
                    {type}: {data.count} (₹{data.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-500">No rummy transactions yet</div>
            )}
          </div>
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
            ({totalFiltered}{totalFiltered < rawTransactions.length ? ` of ${rawTransactions.length}` : ""})
          </h3>
          {(searchName || filterDateFrom || filterDateTo) && (
            <button
              onClick={resetFilters}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg text-sm border border-slate-600 transition-colors"
            >
              ✕ Clear Filters
            </button>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap gap-3 mb-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-gray-400 mb-1 block">Search by {nameLabel} Name</label>
            <input
              type="text"
              placeholder={`Search ${nameLabel.toLowerCase()} name...`}
              value={searchName}
              onChange={(e) => { setSearchName(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">From Date</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => { setFilterDateFrom(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">To Date</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => { setFilterDateTo(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {transactionsLoading ? (
          <div className="text-white text-center py-8">Loading...</div>
        ) : rawTransactions.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No transactions found</div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No transactions match your filters</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-600 bg-slate-750">
                    <SortHeader field="type" label="Type" />
                    <SortHeader field="game" label="Game" align="center" />
                    <SortHeader field="name" label={`${nameLabel} Name`} />
                    <SortHeader field="amount" label="Amount" align="right" />
                    <SortHeader field="status" label="Status" align="center" />
                    <SortHeader field="date" label="Date" />
                    <th className="text-center text-white font-semibold p-3 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border inline-block ${getTypeStyle(transaction.type)}`}>
                          {formatTypeName(transaction.type)}
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
                      <td className="p-3 text-center">
                        {getGameTag(transaction.gameType)}
                      </td>
                      <td className="text-white p-3 font-medium">{transaction.entityName}</td>
                      <td className="text-right p-3">
                        <div className="flex flex-col items-end">
                          <span className="text-white font-semibold">₹{Number(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          {transaction.originalAmount && (
                            <span className="text-xs text-gray-500 line-through">
                              ₹{Number(transaction.originalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-center p-3">
                        <span className={`font-semibold text-sm ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="text-gray-300 p-3 text-sm">
                        {new Date(transaction.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' })}
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

            <Pagination
              total={rawTransactions.length}
              filteredCount={totalFiltered}
              current={currentPage}
              onChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Edit Transaction Modal */}
      {showEditModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-blue-600 max-h-[85vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Edit Transaction</h2>

            <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mb-6">
              <div className="text-xs text-blue-400 mb-1">Transaction Details:</div>
              <h3 className="text-white font-semibold">{formatTypeName(selectedTransaction.type)}</h3>
              <p className="text-sm text-blue-300 mt-1">
                {nameLabel}: {selectedTransaction.entityName}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Current Amount: ₹{Number(selectedTransaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              {selectedTransaction.originalAmount && (
                <p className="text-sm text-gray-400 mt-1">
                  Original Amount: ₹{Number(selectedTransaction.originalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                onClick={() => { setShowEditModal(false); setSelectedTransaction(null); }}
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
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-red-600 max-h-[85vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Cancel Transaction</h2>

            <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 mb-6">
              <div className="text-xs text-red-400 mb-1">Transaction Details:</div>
              <h3 className="text-white font-semibold">{formatTypeName(selectedTransaction.type)}</h3>
              <p className="text-sm text-red-300 mt-1">
                {nameLabel}: {selectedTransaction.entityName}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Amount: ₹{Number(selectedTransaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                onClick={() => { setShowCancelModal(false); setSelectedTransaction(null); }}
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
