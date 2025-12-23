import React, { useState } from "react";

export default function FinancialOverrides({ 
  transactions: externalTransactions = null,
  setTransactions: externalSetTransactions = null,
  userRole = "admin"
}) {
  // Internal state if not provided externally
  const [internalTransactions, setInternalTransactions] = useState([
    {
      id: "TX-9001",
      type: "Deposit",
      player: "John Doe",
      amount: 3000,
      status: "Completed",
    },
    {
      id: "TX-9002",
      type: "Cashout",
      player: "Jane Smith",
      amount: 1800,
      status: "Pending",
    },
    {
      id: "TX-9003",
      type: "Bonus",
      player: "Mike Johnson",
      amount: 500,
      status: "Completed",
    },
  ]);

  // Use external state if provided, otherwise use internal state
  const transactions = externalTransactions !== null ? externalTransactions : internalTransactions;
  const setTransactions = externalSetTransactions || setInternalTransactions;

  // Cashout & Bonus form state
  const [cashoutPlayerId, setCashoutPlayerId] = useState("");
  const [cashoutAmount, setCashoutAmount] = useState("");
  const [bonusPlayerId, setBonusPlayerId] = useState("");
  const [bonusAmount, setBonusAmount] = useState("");

  const handleProcessCashout = () => {
    if (!cashoutPlayerId || !cashoutAmount) {
      alert("Please enter Player ID and Amount for cashout");
      return;
    }
    const amount = parseFloat(cashoutAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const newTransaction = {
      id: `TX-${Date.now()}`,
      type: "Cashout",
      player: cashoutPlayerId,
      amount: amount,
      status: "Pending",
    };

    setTransactions((prev) => [...prev, newTransaction]);
    alert(`Cashout of ₹${amount.toLocaleString("en-IN")} processed for ${cashoutPlayerId}`);
    
    // Reset form
    setCashoutPlayerId("");
    setCashoutAmount("");
  };

  const handleApproveBonus = () => {
    if (!bonusPlayerId || !bonusAmount) {
      alert("Please enter Player ID and Amount for bonus");
      return;
    }
    const amount = parseFloat(bonusAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const newTransaction = {
      id: `TX-${Date.now()}`,
      type: "Bonus",
      player: bonusPlayerId,
      amount: amount,
      status: "Completed",
    };

    setTransactions((prev) => [...prev, newTransaction]);
    alert(`Bonus of ₹${amount.toLocaleString("en-IN")} approved for ${bonusPlayerId}`);
    
    // Reset form
    setBonusPlayerId("");
    setBonusAmount("");
  };

  const handleEditTransaction = (transaction) => {
    const newAmount = prompt(`Edit amount for ${transaction.type} - ${transaction.player}:`, transaction.amount);
    if (newAmount !== null) {
      const amount = parseFloat(newAmount);
      if (!isNaN(amount) && amount > 0) {
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === transaction.id ? { ...t, amount: amount } : t
          )
        );
        alert(`Transaction ${transaction.id} updated to ₹${amount.toLocaleString("en-IN")}`);
      } else {
        alert("Invalid amount entered");
      }
    }
  };

  const handleCancelTransaction = (transactionId) => {
    if (window.confirm("Are you sure you want to cancel this transaction?")) {
      setTransactions((prev) => prev.filter((x) => x.id !== transactionId));
      alert("Transaction cancelled successfully");
    }
  };

  return (
    <div className="space-y-6">
      <section className="p-4 sm:p-6 bg-gradient-to-r from-cyan-600/30 via-blue-500/20 to-indigo-700/30 rounded-xl shadow-md border border-cyan-800/40">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">
          Financial Overrides
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white/10 p-3 sm:p-4 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
              Edit / Cancel Transactions
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {transactions.length > 0 ? (
                transactions.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white/5 p-2 sm:p-3 rounded border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                  >
                    <div className="text-white min-w-0 flex-1">
                      <div className="font-semibold text-sm sm:text-base truncate">
                        {t.type} • {t.player}
                      </div>
                      <div className="text-xs sm:text-sm text-white/70 truncate">
                        {t.id} • ₹{t.amount.toLocaleString("en-IN")} • {t.status}
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleEditTransaction(t)}
                        className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleCancelTransaction(t.id)}
                        className="flex-1 sm:flex-none bg-red-600 hover:bg-red-500 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No transactions found
                </div>
              )}
            </div>
          </div>
          <div className="bg-white/10 p-3 sm:p-4 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
              Cashouts & Bonuses
            </h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-white text-xs sm:text-sm">Process Cashout</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                    placeholder="Player ID"
                    value={cashoutPlayerId}
                    onChange={(e) => setCashoutPlayerId(e.target.value)}
                  />
                  <input
                    type="number"
                    className="w-full sm:w-32 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                    placeholder="Amount"
                    value={cashoutAmount}
                    onChange={(e) => setCashoutAmount(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleProcessCashout}
                  className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm sm:text-base"
                >
                  Process Cashout
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-white text-xs sm:text-sm">Approve Bonus</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                    placeholder="Player ID"
                    value={bonusPlayerId}
                    onChange={(e) => setBonusPlayerId(e.target.value)}
                  />
                  <input
                    type="number"
                    className="w-full sm:w-32 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                    placeholder="Amount"
                    value={bonusAmount}
                    onChange={(e) => setBonusAmount(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleApproveBonus}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold text-sm sm:text-base"
                >
                  Approve Bonus
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

