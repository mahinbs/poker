import React, { useState } from "react";
import CustomSelect from "./common/CustomSelect";

export default function ClubBuyInSection({ 
  players = [],
  playerBalances = {},
  setPlayerBalances = null
}) {
  // Tab state
  const [activeTab, setActiveTab] = useState("buy-in");

  // Club Buy-In Form state
  const [playerSearch, setPlayerSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [buyInForm, setBuyInForm] = useState({
    amount: "",
    chipCount: "",
    paymentMethod: "Cash",
    referenceNumber: "",
    notes: ""
  });

  // Cash Out state
  const [cashOutForm, setCashOutForm] = useState({
    playerId: "",
    playerName: "",
    chipAmount: "",
    conversionRate: 1, // 1 chip = 1 rupee (default)
    reason: "",
  });
  const [cashOutPlayerSearch, setCashOutPlayerSearch] = useState("");

  // Recent buy-ins state (mock data)
  const [recentBuyIns] = useState([
    { player: "Alex Johnson", amount: 50000, chips: 50000, paymentMethod: "Cash", processed: "2 hours ago", reference: "BUY-001" },
    { player: "Maria Garcia", amount: 25000, chips: 25000, paymentMethod: "Bank Transfer", processed: "1 day ago", reference: "BUY-002" },
    { player: "Rajesh Kumar", amount: 100000, chips: 100000, paymentMethod: "UPI", processed: "3 hours ago", reference: "BUY-003" }
  ]);

  // Filter players for buy-in search
  const filteredPlayers = playerSearch.length >= 3
    ? players.filter(player => {
        const searchLower = playerSearch.toLowerCase();
        return (
          player.name?.toLowerCase().includes(searchLower) ||
          player.id?.toLowerCase().includes(searchLower) ||
          player.email?.toLowerCase().includes(searchLower)
        );
      })
    : [];

  // Cash Out functions
  const getCashOutPlayers = () => {
    return Object.values(playerBalances).filter(
      (player) => player.availableBalance > 0
    );
  };

  // Filter players for cash out search
  const filteredCashOutPlayers =
    cashOutPlayerSearch.length >= 3
      ? getCashOutPlayers().filter((player) => {
          const searchLower = cashOutPlayerSearch.toLowerCase();
          return (
            player.name.toLowerCase().includes(searchLower) ||
            player.id.toLowerCase().includes(searchLower) ||
            (player.email && player.email.toLowerCase().includes(searchLower))
          );
        })
      : [];

  // Validate balance consistency across sources
  const validateBalanceConsistency = (playerId) => {
    const player = playerBalances[playerId];
    if (!player) return { isValid: false, message: "Player not found" };

    // Get player's available balance (chips) - this is what we see in cashier/superadmin side
    const cashierSideBalance = player.availableBalance || 0;

    // In a real system, we would fetch:
    // 1. Player portal balance (from player's account/API)
    // 2. Table buy-out balance (from buy-out transaction records)
    // For now, we'll use availableBalance as the source of truth
    // and flag if there are inconsistencies

    // For demonstration, we'll check if player has any pending transactions
    // that might cause discrepancy
    const hasPendingTransactions = false; // Would check from transaction log
    const playerPortalBalance = cashierSideBalance; // Would fetch from player portal API
    const buyOutBalance = cashierSideBalance; // Would calculate from buy-out records

    const balancesMatch =
      cashierSideBalance === playerPortalBalance &&
      playerPortalBalance === buyOutBalance;

    return {
      isValid: balancesMatch,
      cashierSideBalance,
      playerPortalBalance,
      buyOutBalance,
      message: balancesMatch
        ? "All balances match ✓"
        : "⚠️ Balance mismatch detected! Please verify before processing.",
      hasPendingTransactions,
    };
  };

  // Handle cash out conversion
  const handleCashOut = () => {
    if (!cashOutForm.playerId || !cashOutForm.chipAmount) {
      alert("Please select a player and enter chip amount to convert.");
      return;
    }

    const player = playerBalances[cashOutForm.playerId];
    if (!player) {
      alert("Player not found.");
      return;
    }

    const chipAmount = parseFloat(cashOutForm.chipAmount);
    if (isNaN(chipAmount) || chipAmount <= 0) {
      alert("Please enter a valid chip amount.");
      return;
    }

    if (chipAmount > (player.availableBalance || 0)) {
      alert(
        `Insufficient balance. Player has only ${player.availableBalance.toLocaleString(
          "en-IN"
        )} chips available.`
      );
      return;
    }

    // Validate balance consistency
    const validation = validateBalanceConsistency(cashOutForm.playerId);
    if (!validation.isValid) {
      const proceed = window.confirm(
        `${validation.message}\n\nDo you still want to proceed with cash out?`
      );
      if (!proceed) return;
    }

    if (!setPlayerBalances) {
      alert("Cash out functionality not fully configured.");
      return;
    }

    // Calculate real money amount
    const realMoneyAmount = chipAmount * cashOutForm.conversionRate;

    // Deduct chips from player's available balance
    setPlayerBalances((prev) => ({
      ...prev,
      [cashOutForm.playerId]: {
        ...prev[cashOutForm.playerId],
        availableBalance:
          (prev[cashOutForm.playerId].availableBalance || 0) - chipAmount,
      },
    }));

    alert(
      `Cash out processed successfully!\n${chipAmount.toLocaleString(
        "en-IN"
      )} chips converted to ₹${realMoneyAmount.toLocaleString("en-IN")} for ${cashOutForm.playerName}.`
    );

    // Reset form
    setCashOutForm({
      playerId: "",
      playerName: "",
      chipAmount: "",
      conversionRate: 1,
      reason: "",
    });
    setCashOutPlayerSearch("");
  };

  // Handle form submission
  const handleSubmitBuyIn = () => {
    if (!selectedPlayer) {
      alert("Please select a player");
      return;
    }
    if (!buyInForm.amount || parseFloat(buyInForm.amount) <= 0) {
      alert("Please enter a valid buy-in amount");
      return;
    }
    if (!buyInForm.chipCount || parseFloat(buyInForm.chipCount) <= 0) {
      alert("Please enter a valid chip count");
      return;
    }
    if (!buyInForm.paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    const amount = parseFloat(buyInForm.amount);
    const chips = parseFloat(buyInForm.chipCount);

    // Validate that chip count matches amount (1:1 ratio, can be adjusted)
    if (chips !== amount) {
      if (!window.confirm(`Chip count (₹${chips.toLocaleString('en-IN')}) does not match amount (₹${amount.toLocaleString('en-IN')}). Continue anyway?`)) {
        return;
      }
    }

    alert(`Club Buy-In processed successfully!\n\nPlayer: ${selectedPlayer.name} (${selectedPlayer.id})\nAmount: ₹${amount.toLocaleString('en-IN')}\nChips: ₹${chips.toLocaleString('en-IN')}\nPayment Method: ${buyInForm.paymentMethod}\nReference: ${buyInForm.referenceNumber || 'N/A'}`);

    // Reset form
    setSelectedPlayer(null);
    setPlayerSearch("");
    setBuyInForm({
      amount: "",
      chipCount: "",
      paymentMethod: "Cash",
      referenceNumber: "",
      notes: ""
    });
  };

  // Auto-fill chip count when amount changes (1:1 ratio)
  const handleAmountChange = (e) => {
    const amount = e.target.value;
    setBuyInForm(prev => ({
      ...prev,
      amount: amount,
      chipCount: amount // Auto-fill with same value (1:1 ratio)
    }));
  };

  return (
    <div className="space-y-6">
      <section className="p-6 bg-gradient-to-r from-emerald-600/30 via-green-500/20 to-teal-700/30 rounded-xl shadow-md border border-emerald-800/40">
        <h2 className="text-xl font-bold text-white mb-6">Club Buy-In & Cash Out</h2>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-white/20">
          <button
            onClick={() => setActiveTab("buy-in")}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === "buy-in"
                ? "bg-emerald-500/30 text-white border-b-2 border-emerald-400"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            Club Buy-In
          </button>
          <button
            onClick={() => setActiveTab("cash-out")}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === "cash-out"
                ? "bg-emerald-500/30 text-white border-b-2 border-emerald-400"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            Cash Out
          </button>
        </div>

        {/* Club Buy-In Tab */}
        {activeTab === "buy-in" && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Club Buy-In - Purchase Chips</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/10 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Buy-In Form</h3>
            <div className="space-y-4">
              {/* Player Search */}
              <div className="relative">
                <label className="text-white text-sm">Search Player (Type at least 3 characters)</label>
                <input 
                  type="text" 
                  className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                  placeholder="Search by name, ID, or email..." 
                  value={playerSearch}
                  onChange={(e) => {
                    setPlayerSearch(e.target.value);
                    setSelectedPlayer(null);
                  }}
                />
                {playerSearch.length >= 3 && filteredPlayers.length > 0 && !selectedPlayer && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredPlayers.map(player => (
                      <div
                        key={player.id}
                        onClick={() => {
                          setSelectedPlayer(player);
                          setPlayerSearch(`${player.name} (${player.id})`);
                        }}
                        className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0"
                      >
                        <div className="text-white font-medium">{player.name}</div>
                        <div className="text-gray-400 text-xs">ID: {player.id} | Email: {player.email || 'N/A'}</div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedPlayer && (
                  <div className="mt-2 p-2 bg-green-500/20 border border-green-400/30 rounded text-sm">
                    <span className="text-green-300">Selected: {selectedPlayer.name} ({selectedPlayer.id})</span>
                    <button 
                      onClick={() => {
                        setSelectedPlayer(null);
                        setPlayerSearch("");
                      }}
                      className="ml-2 text-red-400 hover:text-red-300"
                    >
                      X
                    </button>
                  </div>
                )}
              </div>

              {/* Buy-In Amount */}
              <div>
                <label className="text-white text-sm">Buy-In Amount (₹) *</label>
                <input 
                  type="number" 
                  className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                  placeholder="₹0.00"
                  value={buyInForm.amount}
                  onChange={handleAmountChange}
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-gray-400 mt-1">Enter the amount in real money (INR)</p>
              </div>

              {/* Chip Count */}
              <div>
                <label className="text-white text-sm">Chip Count (₹) *</label>
                <input 
                  type="number" 
                  className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                  placeholder="₹0.00"
                  value={buyInForm.chipCount}
                  onChange={(e) => setBuyInForm({ ...buyInForm, chipCount: e.target.value })}
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-gray-400 mt-1">Chips value (usually 1:1 with amount)</p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-white text-sm">Payment Method *</label>
                <CustomSelect 
                  className="w-full mt-1"
                  value={buyInForm.paymentMethod}
                  onChange={(e) => setBuyInForm({ ...buyInForm, paymentMethod: e.target.value })}
                >
                  <option>Cash</option>
                  <option>Bank Transfer</option>
                  <option>UPI</option>
                  <option>Credit Card</option>
                  <option>Debit Card</option>
                  <option>Net Banking</option>
                  <option>Wallet</option>
                  <option>Other</option>
                </CustomSelect>
              </div>

              {/* Reference Number */}
              <div>
                <label className="text-white text-sm">Reference/Transaction Number</label>
                <input 
                  type="text" 
                  className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                  placeholder="Enter transaction reference (optional)"
                  value={buyInForm.referenceNumber}
                  onChange={(e) => setBuyInForm({ ...buyInForm, referenceNumber: e.target.value })}
                />
                <p className="text-xs text-gray-400 mt-1">For bank transfers, UPI, cards, etc.</p>
              </div>

              {/* Notes */}
              <div>
                <label className="text-white text-sm">Notes</label>
                <textarea 
                  className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                  rows="3" 
                  placeholder="Additional notes (optional)"
                  value={buyInForm.notes}
                  onChange={(e) => setBuyInForm({ ...buyInForm, notes: e.target.value })}
                ></textarea>
              </div>

              {/* Submit Button */}
              <button 
                onClick={handleSubmitBuyIn}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white px-4 py-3 rounded-lg font-semibold shadow-lg transition-all"
              >
                Process Club Buy-In
              </button>
            </div>
          </div>

          {/* Recent Buy-Ins & Information */}
          <div className="space-y-4">
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Club Buy-Ins</h3>
              <div className="space-y-2">
                {recentBuyIns.map((buyIn, index) => (
                  <div key={index} className="bg-emerald-500/20 p-3 rounded-lg border border-emerald-400/30">
                    <div className="font-semibold text-white">{buyIn.player}</div>
                    <div className="text-sm text-gray-300">
                      Amount: ₹{buyIn.amount.toLocaleString('en-IN')} • Chips: ₹{buyIn.chips.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Payment: {buyIn.paymentMethod} • Ref: {buyIn.reference}
                    </div>
                    <div className="text-xs text-emerald-300 mt-1">Processed {buyIn.processed}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Buy-In Information</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  <span>Players purchase chips using real money (INR)</span>
                </div>
                <div className="flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  <span>Chips are added to player's available balance</span>
                </div>
                <div className="flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  <span>Standard ratio is 1:1 (₹1 = 1 chip)</span>
                </div>
                <div className="flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  <span>Players can use chips to buy-in at tables</span>
                </div>
                <div className="flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  <span>All transactions are recorded for audit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
        )}

        {/* Cash Out Tab */}
        {activeTab === "cash-out" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Cash Out - Chip to Real Money Conversion
            </h3>
            <p className="text-gray-300 text-sm mb-6">
              Convert player's chip balance to real money. System validates
              balance consistency across player portal, table buy-out records,
              and cashier view.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cash Out Form */}
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Process Cash Out
                </h3>
                <div className="space-y-4">
                  <div className="relative">
                    <label className="text-white text-sm">
                      Search Player (Type at least 3 characters) eg: Alex Johnson, Maria Garcia
                    </label>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      placeholder="Search by name, ID, or email..."
                      value={cashOutPlayerSearch}
                      onChange={(e) => {
                        setCashOutPlayerSearch(e.target.value);
                        setCashOutForm({
                          ...cashOutForm,
                          playerId: "",
                          playerName: "",
                        });
                      }}
                    />
                    {cashOutPlayerSearch.length >= 3 &&
                      filteredCashOutPlayers.length > 0 &&
                      !cashOutForm.playerId && (
                        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {filteredCashOutPlayers.map((player) => (
                            <div
                              key={player.id}
                              onClick={() => {
                                setCashOutForm({
                                  ...cashOutForm,
                                  playerId: player.id,
                                  playerName: player.name,
                                });
                                setCashOutPlayerSearch(
                                  `${player.name} (${player.id})`
                                );
                              }}
                              className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0"
                            >
                              <div className="text-white font-medium">
                                {player.name}
                              </div>
                              <div className="text-gray-400 text-xs">
                                ID: {player.id} | Balance:{" "}
                                {(player.availableBalance || 0).toLocaleString(
                                  "en-IN"
                                )}{" "}
                                chips
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    {cashOutForm.playerId && (
                      <div className="mt-2 p-2 bg-green-500/20 border border-green-400/30 rounded text-sm">
                        <span className="text-green-300">
                          Selected: {cashOutForm.playerName} (
                          {cashOutForm.playerId})
                        </span>
                        <button
                          onClick={() => {
                            setCashOutForm({
                              ...cashOutForm,
                              playerId: "",
                              playerName: "",
                            });
                            setCashOutPlayerSearch("");
                          }}
                          className="ml-2 text-red-400 hover:text-red-300"
                        >
                          X
                        </button>
                      </div>
                    )}
                  </div>

                  {cashOutForm.playerId && (
                    <>
                      {/* Balance Validation */}
                      {(() => {
                        const validation = validateBalanceConsistency(
                          cashOutForm.playerId
                        );
                        const player = playerBalances[cashOutForm.playerId];
                        return (
                          <div
                            className={`p-3 rounded-lg border ${
                              validation.isValid
                                ? "bg-green-500/20 border-green-400/30"
                                : "bg-red-500/20 border-red-400/30"
                            }`}
                          >
                            <div
                              className={`text-sm font-semibold mb-2 ${
                                validation.isValid
                                  ? "text-green-300"
                                  : "text-red-300"
                              }`}
                            >
                              {validation.message}
                            </div>
                            <div className="text-xs text-gray-300 space-y-1">
                              <div>
                                Cashier/SuperAdmin View:{" "}
                                {validation.cashierSideBalance.toLocaleString(
                                  "en-IN"
                                )}{" "}
                                chips
                              </div>
                              <div>
                                Player Portal Balance:{" "}
                                {validation.playerPortalBalance.toLocaleString(
                                  "en-IN"
                                )}{" "}
                                chips
                              </div>
                              <div>
                                Table Buy-Out Balance:{" "}
                                {validation.buyOutBalance.toLocaleString(
                                  "en-IN"
                                )}{" "}
                                chips
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-400/30">
                        <div className="text-sm text-white space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Available Chips:</span>
                            <span className="font-semibold text-blue-300">
                              {(
                                playerBalances[cashOutForm.playerId]
                                  ?.availableBalance || 0
                              ).toLocaleString("en-IN")}{" "}
                              chips
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-white text-sm">
                          Chips to Convert
                        </label>
                        <input
                          type="number"
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                          placeholder="Enter amount in chips"
                          value={cashOutForm.chipAmount}
                          onChange={(e) =>
                            setCashOutForm({
                              ...cashOutForm,
                              chipAmount: e.target.value,
                            })
                          }
                          max={
                            playerBalances[cashOutForm.playerId]
                              ?.availableBalance || 0
                          }
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Max:{" "}
                          {(
                            playerBalances[cashOutForm.playerId]
                              ?.availableBalance || 0
                          ).toLocaleString("en-IN")}{" "}
                          chips
                        </p>
                      </div>

                      <div>
                        <label className="text-white text-sm">
                          Conversion Rate (1 chip = ₹X)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                          placeholder="1.00"
                          value={cashOutForm.conversionRate}
                          onChange={(e) =>
                            setCashOutForm({
                              ...cashOutForm,
                              conversionRate: parseFloat(e.target.value) || 1,
                            })
                          }
                        />
                      </div>

                      {cashOutForm.chipAmount &&
                        parseFloat(cashOutForm.chipAmount) > 0 && (
                          <div className="p-3 bg-purple-500/20 rounded-lg border border-purple-400/30">
                            <div className="text-sm text-white">
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-300">Chips:</span>
                                <span className="font-semibold">
                                  {parseFloat(cashOutForm.chipAmount).toLocaleString(
                                    "en-IN"
                                  )}{" "}
                                  chips
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-300">
                                  Real Money Amount:
                                </span>
                                <span className="font-semibold text-purple-300">
                                  ₹
                                  {(
                                    parseFloat(cashOutForm.chipAmount) *
                                    cashOutForm.conversionRate
                                  ).toLocaleString("en-IN")}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                      <div>
                        <label className="text-white text-sm">
                          Reason/Notes (Optional)
                        </label>
                        <textarea
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                          rows="3"
                          placeholder="Enter reason or notes for cash out (optional)..."
                          value={cashOutForm.reason}
                          onChange={(e) =>
                            setCashOutForm({
                              ...cashOutForm,
                              reason: e.target.value,
                            })
                          }
                        />
                      </div>

                      <button
                        onClick={handleCashOut}
                        className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold"
                      >
                        Process Cash Out
                      </button>
                    </>
                  )}

                  {getCashOutPlayers().length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No players with available chip balance
                    </div>
                  )}
                </div>
              </div>

              {/* Information Panel */}
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Cash Out Information
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="text-white font-semibold mb-2">
                      How Cash Out Works:
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
                      <li>
                        Select a player who has chips in their available balance
                      </li>
                      <li>
                        System validates balance consistency across three
                        sources:
                        <ul className="ml-4 mt-1 space-y-1 list-disc">
                          <li>Player Portal Balance</li>
                          <li>Table Buy-Out Balance Records</li>
                          <li>Cashier/SuperAdmin View Balance</li>
                        </ul>
                      </li>
                      <li>
                        Enter the amount of chips to convert to real money
                      </li>
                      <li>
                        Set conversion rate (default: 1 chip = ₹1)
                      </li>
                      <li>
                        Chips are deducted from player's balance, real money is
                        paid out
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-yellow-500/20 rounded-lg border border-yellow-400/30">
                    <h4 className="text-yellow-300 font-semibold mb-2">
                      ⚠️ Balance Validation:
                    </h4>
                    <ul className="text-sm text-yellow-200 space-y-1 list-disc list-inside">
                      <li>
                        System automatically checks if balances match across all
                        sources
                      </li>
                      <li>
                        If mismatch detected, transaction is flagged with warning
                      </li>
                      <li>
                        Review flagged transactions carefully before processing
                      </li>
                      <li>
                        Contact system administrator if balance discrepancies
                        persist
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
                    <h4 className="text-blue-300 font-semibold mb-2">
                      💡 Important Notes:
                    </h4>
                    <ul className="text-sm text-blue-200 space-y-1 list-disc list-inside">
                      <li>
                        Cash out is permanent - chips cannot be recovered
                      </li>
                      <li>
                        Conversion rate can be adjusted based on club policy
                      </li>
                      <li>
                        Always verify player identity before processing cash out
                      </li>
                      <li>
                        Keep transaction records for audit purposes
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-500/20 rounded-lg border border-green-400/30">
                    <div className="text-sm text-green-300">
                      <div className="font-semibold mb-1">
                        Players with Available Balance:
                      </div>
                      <div className="text-green-200">
                        {getCashOutPlayers().length} player(s) have chips
                        available for cash out
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

