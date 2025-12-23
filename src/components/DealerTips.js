import React, { useState } from "react";

export default function DealerTips({
  userRole = "superadmin", // "superadmin", "admin", or "cashier"
  forcedTab = null, // If set, force this tab to be active and hide others
}) {
  const [activeTab, setActiveTab] = useState(
    forcedTab || "percentage"
  );

  // If forcedTab is set, always use it and don't allow switching
  const effectiveTab = forcedTab || activeTab;
  const showTabs = !forcedTab; // Hide tab navigation if forcedTab is set

  // Dealer Tips % State
  const [clubHoldPercentage, setClubHoldPercentage] = useState("15");
  const [dealerSharePercentage, setDealerSharePercentage] = useState("85");
  const [floorManagerShare, setFloorManagerShare] = useState("5");
  const [tipsSettings, setTipsSettings] = useState([
    {
      id: 1,
      dealerName: "Sarah Johnson",
      totalTips: 2500,
      share: 2125,
      status: "Processed",
      date: "2024-01-20",
    },
    {
      id: 2,
      dealerName: "Mike Chen",
      totalTips: 1800,
      share: 1530,
      status: "Pending",
      date: "2024-01-20",
    },
  ]);

  // Dealer Tips Cash Out State
  const [selectedDealer, setSelectedDealer] = useState("");
  const [cashOutAmount, setCashOutAmount] = useState("");
  const [cashOutNotes, setCashOutNotes] = useState("");
  const [cashOutHistory, setCashOutHistory] = useState([
    {
      id: 1,
      dealerName: "Sarah Johnson",
      amount: 5000,
      date: "2024-01-19",
      processedBy: "Cashier",
      notes: "Weekly cash out",
      status: "Completed",
    },
    {
      id: 2,
      dealerName: "Mike Chen",
      amount: 3500,
      date: "2024-01-18",
      processedBy: "Cashier",
      notes: "Monthly cash out",
      status: "Completed",
    },
  ]);

  const dealers = [
    { id: "D001", name: "Sarah Johnson", role: "Dealer" },
    { id: "D002", name: "Mike Chen", role: "Dealer" },
    { id: "D003", name: "Emma Davis", role: "Dealer" },
    { id: "D004", name: "John Smith", role: "Dealer" },
  ];

  // Handle update settings
  const handleUpdateSettings = () => {
    const clubHold = parseFloat(clubHoldPercentage);
    const dealerShare = parseFloat(dealerSharePercentage);
    const floorManager = parseFloat(floorManagerShare);

    if (isNaN(clubHold) || clubHold < 0 || clubHold > 100) {
      alert("Please enter a valid club hold percentage (0-100)");
      return;
    }
    if (isNaN(dealerShare) || dealerShare < 0 || dealerShare > 100) {
      alert("Please enter a valid dealer share percentage (0-100)");
      return;
    }
    if (isNaN(floorManager) || floorManager < 0 || floorManager > 100) {
      alert("Please enter a valid floor manager share percentage (0-100)");
      return;
    }

    const total = clubHold + dealerShare + floorManager;
    if (Math.abs(total - 100) > 0.01) {
      alert(
        `Total percentage must equal 100%. Current total: ${total.toFixed(2)}%`
      );
      return;
    }

    alert(
      `Settings updated successfully!\nClub Hold: ${clubHold}%\nDealer Share: ${dealerShare}%\nFloor Manager Share: ${floorManager}%`
    );
  };

  // Handle cash out
  const handleProcessCashOut = () => {
    if (!selectedDealer) {
      alert("Please select a dealer");
      return;
    }
    if (!cashOutAmount || parseFloat(cashOutAmount) <= 0) {
      alert("Please enter a valid cash out amount");
      return;
    }

    const newCashOut = {
      id: Date.now(),
      dealerName: selectedDealer,
      amount: parseFloat(cashOutAmount),
      date: new Date().toISOString().split("T")[0],
      processedBy: userRole === "cashier" ? "Cashier" : "Super Admin",
      notes: cashOutNotes || "",
      status: "Completed",
    };

    setCashOutHistory([newCashOut, ...cashOutHistory]);
    alert(
      `Cash out of ₹${parseFloat(cashOutAmount).toLocaleString("en-IN")} processed successfully for ${selectedDealer}`
    );

    // Reset form
    setSelectedDealer("");
    setCashOutAmount("");
    setCashOutNotes("");
  };

  return (
    <div className="space-y-6">
      <section className="p-4 sm:p-6 bg-gradient-to-r from-cyan-600/30 via-blue-500/20 to-indigo-700/30 rounded-xl shadow-md border border-cyan-800/40">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">
          Dealer Tips Management
        </h2>

        {/* Tab Navigation - Only show if not forced */}
        {showTabs && (
          <div className="flex gap-2 mb-4 sm:mb-6 border-b border-white/20 overflow-x-auto">
            {(userRole === "superadmin" || userRole === "admin") && (
              <button
                onClick={() => setActiveTab("percentage")}
                className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold transition-all whitespace-nowrap ${
                  effectiveTab === "percentage"
                    ? "bg-cyan-500/30 text-white border-b-2 border-cyan-400"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                Dealer Tips %
              </button>
            )}
            {(userRole === "superadmin" || userRole === "cashier") && (
              <button
                onClick={() => setActiveTab("cashout")}
                className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold transition-all whitespace-nowrap ${
                  effectiveTab === "cashout"
                    ? "bg-cyan-500/30 text-white border-b-2 border-cyan-400"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                Dealer Tips Cash Out
              </button>
            )}
          </div>
        )}

        {/* Dealer Tips % Tab */}
        {(effectiveTab === "percentage" &&
          (userRole === "superadmin" || userRole === "admin")) && (
          <div className="space-y-6">
            <div className="bg-white/10 p-3 sm:p-4 rounded-lg">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
                Dynamic Percentage Settings
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="text-white text-xs sm:text-sm">
                    Club Hold Percentage
                  </label>
                  <input
                    type="number"
                    className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                    placeholder="15%"
                    value={clubHoldPercentage}
                    onChange={(e) => setClubHoldPercentage(e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="text-white text-xs sm:text-sm">
                    Dealer Share Percentage
                  </label>
                  <input
                    type="number"
                    className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                    placeholder="85%"
                    value={dealerSharePercentage}
                    onChange={(e) => setDealerSharePercentage(e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="text-white text-xs sm:text-sm">
                    Floor Manager Share
                  </label>
                  <input
                    type="number"
                    className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                    placeholder="5%"
                    value={floorManagerShare}
                    onChange={(e) => setFloorManagerShare(e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="bg-blue-500/20 p-2 sm:p-3 rounded-lg border border-blue-400/30 text-xs sm:text-sm text-blue-200">
                  <div className="font-semibold mb-1">Current Distribution:</div>
                  <div>
                    Club: {clubHoldPercentage || 0}% • Dealer:{" "}
                    {dealerSharePercentage || 0}% • Floor Manager:{" "}
                    {floorManagerShare || 0}%
                  </div>
                  <div className="mt-1">
                    Total:{" "}
                    {(
                      parseFloat(clubHoldPercentage || 0) +
                      parseFloat(dealerSharePercentage || 0) +
                      parseFloat(floorManagerShare || 0)
                    ).toFixed(2)}
                    %
                  </div>
                </div>
                <button
                  onClick={handleUpdateSettings}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-semibold text-sm sm:text-base"
                >
                  Update Settings
                </button>
              </div>
            </div>

            <div className="bg-white/10 p-3 sm:p-4 rounded-lg">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
                Today's Dealer Tips
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {tipsSettings.length > 0 ? (
                  tipsSettings.map((tip) => (
                    <div
                      key={tip.id}
                      className="bg-cyan-500/20 p-2 sm:p-3 rounded-lg border border-cyan-400/30"
                    >
                      <div className="font-semibold text-white text-sm sm:text-base">
                        {tip.dealerName}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-300 mt-1">
                        Total Tips: ₹{tip.totalTips.toLocaleString("en-IN")} |
                        Share: ₹{tip.share.toLocaleString("en-IN")}
                      </div>
                      <div className="text-xs text-cyan-300 mt-1">
                        Status: {tip.status} • Date: {tip.date}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-400 text-sm">
                    No dealer tips recorded today
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dealer Tips Cash Out Tab */}
        {(effectiveTab === "cashout" &&
          (userRole === "superadmin" || userRole === "cashier")) && (
          <div className="space-y-6">
            <div className="bg-white/10 p-3 sm:p-4 rounded-lg">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
                Process Cash Out
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="text-white text-xs sm:text-sm">
                    Select Dealer
                  </label>
                  <select
                    className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                    value={selectedDealer}
                    onChange={(e) => setSelectedDealer(e.target.value)}
                  >
                    <option value="">-- Select Dealer --</option>
                    {dealers.map((dealer) => (
                      <option key={dealer.id} value={dealer.name}>
                        {dealer.name} - {dealer.role}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-white text-xs sm:text-sm">
                    Cash Out Amount (₹)
                  </label>
                  <input
                    type="number"
                    className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                    placeholder="₹0.00"
                    value={cashOutAmount}
                    onChange={(e) => setCashOutAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="text-white text-xs sm:text-sm">
                    Notes (Optional)
                  </label>
                  <textarea
                    className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                    rows="3"
                    placeholder="Additional notes about the cash out..."
                    value={cashOutNotes}
                    onChange={(e) => setCashOutNotes(e.target.value)}
                  ></textarea>
                </div>
                <button
                  onClick={handleProcessCashOut}
                  className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm sm:text-base"
                >
                  Process Cash Out
                </button>
              </div>
            </div>

            <div className="bg-white/10 p-3 sm:p-4 rounded-lg">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
                Cash Out History
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {cashOutHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[500px]">
                      <thead className="text-gray-400 border-b border-gray-700 text-xs sm:text-sm uppercase">
                        <tr>
                          <th className="py-2 sm:py-3 px-2 sm:px-4">Dealer</th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4">Amount</th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4">Date</th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {cashOutHistory.map((cashOut) => (
                          <tr
                            key={cashOut.id}
                            className="hover:bg-gray-700/30 transition-colors"
                          >
                            <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium text-white text-xs sm:text-sm">
                              {cashOut.dealerName}
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-green-400 font-semibold text-xs sm:text-sm">
                              ₹{cashOut.amount.toLocaleString("en-IN")}
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-400 text-xs sm:text-sm">
                              {cashOut.date}
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4">
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  cashOut.status === "Completed"
                                    ? "bg-green-500/30 text-green-300"
                                    : "bg-yellow-500/30 text-yellow-300"
                                }`}
                              >
                                {cashOut.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400 text-sm">
                    No cash out history available
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

