import React, { useState } from "react";
import CustomSelect from "./common/CustomSelect";

export default function ClubBuyInSection({ players = [] }) {
  // Form state
  const [playerSearch, setPlayerSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [buyInForm, setBuyInForm] = useState({
    amount: "",
    chipCount: "",
    paymentMethod: "Cash",
    referenceNumber: "",
    notes: ""
  });

  // Recent buy-ins state (mock data)
  const [recentBuyIns] = useState([
    { player: "Alex Johnson", amount: 50000, chips: 50000, paymentMethod: "Cash", processed: "2 hours ago", reference: "BUY-001" },
    { player: "Maria Garcia", amount: 25000, chips: 25000, paymentMethod: "Bank Transfer", processed: "1 day ago", reference: "BUY-002" },
    { player: "Rajesh Kumar", amount: 100000, chips: 100000, paymentMethod: "UPI", processed: "3 hours ago", reference: "BUY-003" }
  ]);

  // Filter players for search
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
      {/* Club Buy-In Form */}
      <section className="p-6 bg-gradient-to-r from-emerald-600/30 via-green-500/20 to-teal-700/30 rounded-xl shadow-md border border-emerald-800/40">
        <h2 className="text-xl font-bold text-white mb-6">Club Buy-In - Purchase Chips</h2>
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
      </section>
    </div>
  );
}

