import React, { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { superAdminAPI } from "../../lib/api";
import toast from "react-hot-toast";

// Searchable Dropdown Component for Players
function SearchablePlayerDropdown({ 
  selectedPlayer, 
  onSelect, 
  clubId, 
  placeholder = "Search by name, ID, or email...",
  label = "Search Player"
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch all approved KYC verified players with pagination (50 per page)
  const { data: allApprovedPlayers = [], isLoading } = useQuery({
    queryKey: ["approvedPlayers", clubId],
    queryFn: async () => {
      if (!clubId) return [];
      
      const allPlayers = [];
      let page = 1;
      const limit = 50; // Fetch 50 players per page
      let hasMore = true;

      // Fetch pages until no more players or we have enough
      while (hasMore) {
        try {
          const response = await superAdminAPI.getPlayers(clubId, { limit, page });
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

          // If we got less than limit, we've reached the end
          if (players.length < limit) {
            hasMore = false;
          } else {
            page++;
            // Safety limit: don't fetch more than 20 pages (1000 players max)
            if (page > 20) {
              hasMore = false;
            }
          }
        } catch (error) {
          console.error(`Error fetching page ${page}:`, error);
          hasMore = false;
        }
      }

      return allPlayers;
    },
    enabled: !!clubId,
  });

  // Filter players based on search term
  const filteredPlayers = allApprovedPlayers.filter(p => {
    if (!searchTerm || searchTerm.length < 1) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(searchLower) ||
      p.email.toLowerCase().includes(searchLower) ||
      (p.phoneNumber && p.phoneNumber.includes(searchTerm)) ||
      (p.playerId && p.playerId.toLowerCase().includes(searchLower))
    );
  }).slice(0, 10);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (player) => {
    onSelect(player);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    // If player is selected, clear selection first
    if (selectedPlayer) {
      onSelect(null);
    }
    setSearchTerm(newValue);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    if (searchTerm || !selectedPlayer) {
      setIsOpen(true);
    }
  };

  const handleClear = () => {
    onSelect(null);
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-gray-300 mb-2">
        {label} <span className="text-gray-400 text-sm">(KYC Verified Players Only)</span>
      </label>
      <div className="relative">
        <input
          type="text"
          value={selectedPlayer ? `${selectedPlayer.name} (${selectedPlayer.email})` : searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          readOnly={!!selectedPlayer}
          className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {selectedPlayer && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xl leading-none"
            title="Clear selection"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-2 bg-slate-700 rounded-lg max-h-64 overflow-y-auto shadow-xl border border-slate-600">
            {isLoading ? (
              <div className="px-4 py-3 text-gray-400 text-sm">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Loading approved players (searching all pages)...</span>
                </div>
              </div>
            ) : filteredPlayers.length === 0 ? (
              <div className="px-4 py-3 text-gray-400 text-sm">
                {searchTerm.length < 1 
                  ? "Start typing to search approved players..." 
                  : "No approved players found matching your search"}
              </div>
            ) : (
              filteredPlayers.map((player) => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => handleSelect(player)}
                  className="w-full px-4 py-3 text-left hover:bg-slate-600 transition-colors border-b border-slate-600 last:border-b-0"
                >
                  <div className="text-white font-medium">{player.name}</div>
                  <div className="text-gray-400 text-sm">{player.email}</div>
                  {player.phoneNumber && (
                    <div className="text-gray-400 text-sm">{player.phoneNumber}</div>
                  )}
                  {player.playerId && (
                    <div className="text-gray-500 text-xs mt-1">ID: {player.playerId}</div>
                  )}
                </button>
              ))
            )}
          </div>
        </>
      )}

      {selectedPlayer && (
        <div className="mt-2 p-3 bg-green-500/10 border border-green-500 rounded-lg">
          <div className="text-green-400 font-medium">{selectedPlayer.name}</div>
          <div className="text-gray-400 text-sm">{selectedPlayer.email}</div>
          {selectedPlayer.phoneNumber && (
            <div className="text-gray-400 text-sm">{selectedPlayer.phoneNumber}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ClubBuyInCashOut({ selectedClubId, onBack }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("buy-in"); // 'buy-in' or 'cash-out'

  // Buy-In States
  const [selectedPlayerBuyIn, setSelectedPlayerBuyIn] = useState(null);
  const [buyInAmount, setBuyInAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [reference, setReference] = useState("");
  const [buyInNotes, setBuyInNotes] = useState("");

  // Cash-Out States
  const [selectedPlayerCashOut, setSelectedPlayerCashOut] = useState(null);
  const [cashOutAmount, setCashOutAmount] = useState("");
  const [conversionRate, setConversionRate] = useState("1");
  const [cashOutNotes, setCashOutNotes] = useState("");
  const [showBalanceWarning, setShowBalanceWarning] = useState(false);
  const [balanceValidation, setBalanceValidation] = useState(null);

  // Get player balance for cash-out
  const { data: playerBalance } = useQuery({
    queryKey: ["playerBalance", selectedClubId, selectedPlayerCashOut?.id],
    queryFn: () => superAdminAPI.getPlayerBalance(selectedClubId, selectedPlayerCashOut.id),
    enabled: !!selectedClubId && !!selectedPlayerCashOut,
  });

  // Get recent buy-ins
  const { data: recentBuyIns = [] } = useQuery({
    queryKey: ["recentBuyIns", selectedClubId],
    queryFn: async () => {
      const transactions = await superAdminAPI.getTransactions(selectedClubId);
      return transactions
        .filter(t => t.type === 'Deposit' || t.type === 'Buy In')
        .slice(0, 10);
    },
    enabled: !!selectedClubId,
  });

  // Get players with available balance for cash-out (only approved KYC verified)
  const { data: playersWithBalance = [] } = useQuery({
    queryKey: ["playersWithBalance", selectedClubId],
    queryFn: async () => {
      if (!selectedClubId) return [];
      
      const allPlayers = [];
      let page = 1;
      const limit = 50; // Fetch 50 players per page
      let hasMore = true;

      // Fetch pages until no more players
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

          // If we got less than limit, we've reached the end
          if (players.length < limit) {
            hasMore = false;
          } else {
            page++;
            // Safety limit: don't fetch more than 20 pages (1000 players max)
            if (page > 20) {
              hasMore = false;
            }
          }
        } catch (error) {
          console.error(`Error fetching page ${page}:`, error);
          hasMore = false;
        }
      }

      return allPlayers;
    },
    enabled: !!selectedClubId && activeTab === 'cash-out',
  });

  // Process Buy-In Mutation
  const processBuyInMutation = useMutation({
    mutationFn: async (data) => {
      return await superAdminAPI.createTransaction(selectedClubId, {
        type: 'Deposit',
        playerId: data.playerId,
        playerName: data.playerName,
        amount: parseFloat(data.amount),
        notes: data.notes,
      });
    },
    onSuccess: () => {
      toast.success("Buy-in processed successfully! Player balance updated.");
      queryClient.invalidateQueries(["recentBuyIns", selectedClubId]);
      queryClient.invalidateQueries(["playerBalance"]);
      queryClient.invalidateQueries(["clubPlayers", selectedClubId]);
      // Reset form
      setSelectedPlayerBuyIn(null);
      setBuyInAmount("");
      setPaymentMethod("Cash");
      setReference("");
      setBuyInNotes("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to process buy-in");
    },
  });

  // Process Cash-Out Mutation
  const processCashOutMutation = useMutation({
    mutationFn: async (data) => {
      return await superAdminAPI.createTransaction(selectedClubId, {
        type: 'Cashout',
        playerId: data.playerId,
        playerName: data.playerName,
        amount: parseFloat(data.amount),
        notes: data.notes,
      });
    },
    onSuccess: () => {
      toast.success("Cash-out processed successfully! Player balance updated.");
      queryClient.invalidateQueries(["recentBuyIns", selectedClubId]);
      queryClient.invalidateQueries(["playerBalance"]);
      queryClient.invalidateQueries(["clubPlayers", selectedClubId]);
      queryClient.invalidateQueries(["playersWithBalance", selectedClubId]);
      // Reset form
      setSelectedPlayerCashOut(null);
      setCashOutAmount("");
      setConversionRate("1");
      setCashOutNotes("");
      setShowBalanceWarning(false);
      setBalanceValidation(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to process cash-out");
    },
  });

  // Handle Buy-In Submit
  const handleBuyInSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedPlayerBuyIn) {
      toast.error("Please select a player");
      return;
    }
    
    if (!buyInAmount || parseFloat(buyInAmount) <= 0) {
      toast.error("Please enter a valid buy-in amount");
      return;
    }

    const amount = parseFloat(buyInAmount);
    if (amount > 10000000) {
      toast.error("Amount cannot exceed ₹10,000,000");
      return;
    }

    const notes = [
      buyInNotes,
      `Payment: ${paymentMethod}`,
      reference ? `Ref: ${reference}` : '',
    ].filter(Boolean).join(' | ');

    processBuyInMutation.mutate({
      playerId: selectedPlayerBuyIn.id,
      playerName: selectedPlayerBuyIn.name,
      amount: amount,
      notes: notes,
    });
  };

  // Validate Cash-Out Balance
  const validateCashOut = async () => {
    if (!selectedPlayerCashOut || !cashOutAmount) {
      toast.error("Please select a player and enter amount");
      return;
    }

    const amount = parseFloat(cashOutAmount);
    if (!playerBalance) {
      toast.error("Unable to fetch player balance");
      return;
    }

    const availableBalance = playerBalance.availableBalance || 0;
    const tableBalance = playerBalance.tableBalance || 0;
    const totalBalance = playerBalance.totalBalance || 0;

    // Check if requested amount matches available balance
    if (Math.abs(amount - availableBalance) < 0.01) {
      setBalanceValidation({
        status: 'success',
        message: 'Balance verification successful',
        availableBalance,
        tableBalance,
        totalBalance,
      });
      setShowBalanceWarning(false);
      toast.success("Balance verified! You can proceed with cash-out.");
    } else if (amount > totalBalance) {
      setBalanceValidation({
        status: 'error',
        message: 'Insufficient balance',
        availableBalance,
        tableBalance,
        totalBalance,
      });
      setShowBalanceWarning(true);
      toast.error("Cash-out amount exceeds player's total balance!");
    } else if (amount > availableBalance) {
      setBalanceValidation({
        status: 'warning',
        message: 'Player has chips at table',
        availableBalance,
        tableBalance,
        totalBalance,
      });
      setShowBalanceWarning(true);
      toast.warning("Player has chips at table. Collect table chips first.");
    } else {
      setBalanceValidation({
        status: 'warning',
        message: 'Amount mismatch - flagged for review',
        availableBalance,
        tableBalance,
        totalBalance,
      });
      setShowBalanceWarning(true);
      toast.warning("Balance mismatch detected. Transaction will be flagged for verification.");
    }
  };

  // Handle Cash-Out Submit
  const handleCashOutSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedPlayerCashOut) {
      toast.error("Please select a player");
      return;
    }
    
    if (!cashOutAmount || parseFloat(cashOutAmount) <= 0) {
      toast.error("Please enter a valid cash-out amount");
      return;
    }

    if (!balanceValidation) {
      toast.error("Please verify balance before processing cash-out");
      return;
    }

    if (balanceValidation.status === 'error') {
      toast.error("Cannot process cash-out with insufficient balance");
      return;
    }

    const amount = parseFloat(cashOutAmount);
    const rate = parseFloat(conversionRate) || 1;
    const actualCash = amount * rate;

    const notes = [
      cashOutNotes,
      `Conversion Rate: ₹${rate} per chip`,
      `Cash Given: ₹${actualCash.toLocaleString()}`,
      balanceValidation.status === 'warning' ? '⚠️ FLAGGED FOR VERIFICATION' : '✓ Verified',
    ].filter(Boolean).join(' | ');

    processCashOutMutation.mutate({
      playerId: selectedPlayerCashOut.id,
      playerName: selectedPlayerCashOut.name,
      amount: amount,
      notes: notes,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Club Buy-In & Cash Out</h1>
        <p className="text-gray-400">Manage player transactions and balance updates</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab("buy-in")}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === "buy-in"
              ? "text-white border-b-2 border-green-500 bg-green-500/10"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Club Buy-In
        </button>
        <button
          onClick={() => setActiveTab("cash-out")}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === "cash-out"
              ? "text-white border-b-2 border-blue-500 bg-blue-500/10"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Cash Out
        </button>
      </div>

      {/* Buy-In Tab Content */}
      {activeTab === "buy-in" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Buy-In Form */}
          <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">Club Buy-In - Purchase Chips</h2>
            <form onSubmit={handleBuyInSubmit}>
              {/* Search Player */}
              <div className="mb-4">
                <SearchablePlayerDropdown
                  selectedPlayer={selectedPlayerBuyIn}
                  onSelect={setSelectedPlayerBuyIn}
                  clubId={selectedClubId}
                  placeholder="Search by name, ID, email, or phone..."
                  label="Search Player"
                />
              </div>

              {/* Buy-In Amount */}
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">
                  Buy-In Amount (₹) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={buyInAmount}
                  onChange={(e) => setBuyInAmount(e.target.value)}
                  placeholder="₹0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <div className="text-gray-400 text-sm mt-1">
                  Enter the amount in real money (INR)
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">
                  Payment Method <span className="text-red-400">*</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
              </div>

              {/* Reference/Transaction Number */}
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">
                  Reference/Transaction Number
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Enter transaction reference (optional)"
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div className="text-gray-400 text-sm mt-1">
                  For bank transfers, UPI, cards, etc.
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Notes</label>
                <textarea
                  value={buyInNotes}
                  onChange={(e) => setBuyInNotes(e.target.value)}
                  placeholder="Additional notes (optional)"
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processBuyInMutation.isPending}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processBuyInMutation.isPending ? "Processing..." : "Process Club Buy-In"}
              </button>
            </form>
          </div>

          {/* Recent Buy-Ins */}
          <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">Recent Club Buy-Ins</h2>
            <div className="space-y-3">
              {recentBuyIns.length === 0 ? (
                <div className="text-gray-400 text-center py-8">
                  No recent buy-ins found
                </div>
              ) : (
                recentBuyIns.map((txn) => (
                  <div
                    key={txn.id}
                    className="bg-slate-700 p-4 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-white font-semibold">{txn.playerName}</div>
                        <div className="text-gray-400 text-sm">{txn.playerId}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold">
                          ₹{Number(txn.amount).toLocaleString()}
                        </div>
                        <div className="text-gray-400 text-sm">
                          Chips: ₹{Number(txn.amount).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {txn.notes && (
                      <div className="text-gray-400 text-sm mt-2">
                        {txn.notes.split('|').map((note, idx) => (
                          <div key={idx}>{note.trim()}</div>
                        ))}
                      </div>
                    )}
                    <div className="text-gray-500 text-xs mt-2">
                      Processed {new Date(txn.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Buy-In Information */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500 rounded-lg">
              <h3 className="text-blue-400 font-semibold mb-2">💡 Buy-In Information</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Players purchase chips using real money (INR)</li>
                <li>• Chips are added to player's available balance</li>
                <li>• Standard ratio is 1:1 (₹1 = 1 chip)</li>
                <li>• Players can use chips to buy-in at tables</li>
                <li>• All transactions are recorded for audit</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Cash-Out Tab Content */}
      {activeTab === "cash-out" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cash-Out Form */}
          <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">Process Cash Out</h2>
            <form onSubmit={handleCashOutSubmit}>
              {/* Search Player */}
              <div className="mb-4">
                <SearchablePlayerDropdown
                  selectedPlayer={selectedPlayerCashOut}
                  onSelect={(player) => {
                    setSelectedPlayerCashOut(player);
                    setBalanceValidation(null);
                    setShowBalanceWarning(false);
                  }}
                  clubId={selectedClubId}
                  placeholder="Search by name, ID, email, or phone..."
                  label="Search Player"
                />
                {selectedPlayerCashOut && playerBalance && (
                  <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500 rounded-lg">
                    <div className="text-blue-400 font-medium">{selectedPlayerCashOut.name}</div>
                    <div className="text-gray-400 text-sm">{selectedPlayerCashOut.email}</div>
                    <div className="mt-2 pt-2 border-t border-blue-500/30">
                      <div className="text-white text-sm">
                        Available Balance: <span className="font-bold">₹{playerBalance.availableBalance?.toLocaleString() || 0}</span>
                      </div>
                      {playerBalance.tableBalance > 0 && (
                        <div className="text-yellow-400 text-sm">
                          Table Balance: ₹{playerBalance.tableBalance.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Cash-Out Amount */}
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">
                  Cash-Out Amount (Chips) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={cashOutAmount}
                  onChange={(e) => {
                    setCashOutAmount(e.target.value);
                    setBalanceValidation(null);
                  }}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Conversion Rate */}
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">
                  Conversion Rate (₹ per chip)
                </label>
                <input
                  type="number"
                  value={conversionRate}
                  onChange={(e) => setConversionRate(e.target.value)}
                  placeholder="1"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-gray-400 text-sm mt-1">
                  Default: 1 chip = ₹1 • Cash to give: ₹{(parseFloat(cashOutAmount || 0) * parseFloat(conversionRate || 1)).toLocaleString()}
                </div>
              </div>

              {/* Verify Balance Button */}
              {selectedPlayerCashOut && cashOutAmount && (
                <button
                  type="button"
                  onClick={validateCashOut}
                  className="w-full mb-4 bg-yellow-500 text-black py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-all"
                >
                  🔍 Verify Balance Before Cash-Out
                </button>
              )}

              {/* Balance Validation Result */}
              {balanceValidation && (
                <div
                  className={`mb-4 p-4 rounded-lg border ${
                    balanceValidation.status === 'success'
                      ? 'bg-green-500/10 border-green-500'
                      : balanceValidation.status === 'error'
                      ? 'bg-red-500/10 border-red-500'
                      : 'bg-yellow-500/10 border-yellow-500'
                  }`}
                >
                  <div
                    className={`font-semibold mb-2 ${
                      balanceValidation.status === 'success'
                        ? 'text-green-400'
                        : balanceValidation.status === 'error'
                        ? 'text-red-400'
                        : 'text-yellow-400'
                    }`}
                  >
                    {balanceValidation.status === 'success' ? '✓' : '⚠️'} {balanceValidation.message}
                  </div>
                  <div className="text-gray-300 text-sm space-y-1">
                    <div>Available: ₹{balanceValidation.availableBalance.toLocaleString()}</div>
                    <div>At Table: ₹{balanceValidation.tableBalance.toLocaleString()}</div>
                    <div>Total: ₹{balanceValidation.totalBalance.toLocaleString()}</div>
                    <div>Requested: ₹{parseFloat(cashOutAmount).toLocaleString()}</div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Notes</label>
                <textarea
                  value={cashOutNotes}
                  onChange={(e) => setCashOutNotes(e.target.value)}
                  placeholder="Additional notes (optional)"
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processCashOutMutation.isPending || !balanceValidation}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processCashOutMutation.isPending ? "Processing..." : "Process Cash Out"}
              </button>
            </form>
          </div>

          {/* Cash-Out Information */}
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
              <h3 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                💡 How Cash Out Works:
              </h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Select a player who has chips in their available balance</li>
                <li>• System validates balance consistency across three sources:</li>
                <li className="ml-4">- Player Portal Balance</li>
                <li className="ml-4">- Table Buy-Out Balance Records</li>
                <li className="ml-4">- Cashier/SuperAdmin View Balance</li>
                <li>• Enter the amount of chips to convert to real money</li>
                <li>• Set conversion rate (default: 1 chip = ₹1)</li>
                <li>• Chips are deducted from player's balance, real money is paid out</li>
              </ul>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-6">
              <h3 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2">
                ⚠️ Balance Validation:
              </h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• System automatically checks if balances match across all sources</li>
                <li>• If mismatch detected, transaction is flagged with warning</li>
                <li>• Review flagged transactions carefully before processing</li>
                <li>• Contact system administrator if balance discrepancies persist</li>
              </ul>
            </div>

            <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-6">
              <h3 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                💡 Important Notes:
              </h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Cash out is permanent - chips cannot be recovered</li>
                <li>• Conversion rate can be adjusted based on club policy</li>
                <li>• Always verify player identity before processing cash out</li>
                <li>• Keep transaction records for audit purposes</li>
              </ul>
            </div>

            {/* Players with Available Balance */}
            <div className="bg-green-500/10 border border-green-500 rounded-lg p-6">
              <h3 className="text-green-400 font-semibold mb-3">Players with Available Balance:</h3>
              <div className="text-white text-2xl font-bold">
                {playersWithBalance.length} player(s) have chips available for cash out
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

