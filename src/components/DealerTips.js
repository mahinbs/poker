import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollAPI } from "../lib/api";
import toast from "react-hot-toast";

export default function DealerTips({ selectedClubId }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("tips");
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [showCashoutModal, setShowCashoutModal] = useState(false);
  const [showManagerCashoutModal, setShowManagerCashoutModal] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);
  const [currentTipsPage, setCurrentTipsPage] = useState(1);
  const [currentCashoutPage, setCurrentCashoutPage] = useState(1);
  const [currentManagerCashoutPage, setCurrentManagerCashoutPage] = useState(1);

  const [tipsFilters, setTipsFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
    dealerId: "",
  });

  const [cashoutFilters, setCashoutFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
    dealerId: "",
  });

  const [managerCashoutFilters, setManagerCashoutFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
    managerId: "",
  });

  const [tipSettings, setTipSettings] = useState({
    clubHoldPercentage: 15,
    dealerSharePercentage: 80,
    floorManagerPercentage: 5,
  });

  const [tipsForm, setTipsForm] = useState({
    dealerId: "",
    managerId: "",
    tipDate: new Date().toISOString().split("T")[0],
    totalTips: "",
    notes: "",
  });

  const [cashoutForm, setCashoutForm] = useState({
    dealerId: "",
    cashoutDate: new Date().toISOString().split("T")[0],
    amount: "",
    notes: "",
  });

  const [managerCashoutForm, setManagerCashoutForm] = useState({
    managerId: "",
    cashoutDate: new Date().toISOString().split("T")[0],
    amount: "",
    notes: "",
  });

  // Get dealers
  const { data: dealersData } = useQuery({
    queryKey: ["payroll-dealers", selectedClubId],
    queryFn: () => payrollAPI.getDealersForPayroll(selectedClubId),
    enabled: !!selectedClubId,
  });

  // Get managers
  const { data: managersData } = useQuery({
    queryKey: ["payroll-managers", selectedClubId],
    queryFn: () => payrollAPI.getManagersForPayroll(selectedClubId),
    enabled: !!selectedClubId,
  });

  // Get tip settings for selected dealer (when modal is open)
  const { data: settingsData } = useQuery({
    queryKey: ["tip-settings", selectedClubId, selectedDealer?.id],
    queryFn: () => payrollAPI.getTipSettings(selectedClubId, selectedDealer?.id),
    enabled: !!selectedClubId && !!selectedDealer && showTipsModal,
  });

  // Update tipSettings when data changes
  useEffect(() => {
    if (settingsData?.settings) {
      setTipSettings({
        clubHoldPercentage: Number(settingsData.settings.clubHoldPercentage),
        dealerSharePercentage: Number(settingsData.settings.dealerSharePercentage),
        floorManagerPercentage: Number(settingsData.settings.floorManagerPercentage),
      });
    }
  }, [settingsData]);

  // Get dealer tips with pagination
  const { data: tipsData, isLoading: tipsLoading } = useQuery({
    queryKey: ["dealer-tips", selectedClubId, currentTipsPage, tipsFilters],
    queryFn: () =>
      payrollAPI.getDealerTips(selectedClubId, {
        page: currentTipsPage,
        limit: 10,
        ...tipsFilters,
      }),
    enabled: !!selectedClubId,
  });

  // Get dealer cashouts with pagination
  const { data: cashoutsData, isLoading: cashoutsLoading } = useQuery({
    queryKey: ["dealer-cashouts", selectedClubId, currentCashoutPage, cashoutFilters],
    queryFn: () =>
      payrollAPI.getDealerCashouts(selectedClubId, {
        page: currentCashoutPage,
        limit: 10,
        ...cashoutFilters,
      }),
    enabled: !!selectedClubId,
  });

  // Get manager cashouts with pagination
  const { data: managerCashoutsData, isLoading: managerCashoutsLoading } = useQuery({
    queryKey: ["manager-cashouts", selectedClubId, currentManagerCashoutPage, managerCashoutFilters],
    queryFn: () =>
      payrollAPI.getManagerCashouts(selectedClubId, {
        page: currentManagerCashoutPage,
        limit: 10,
        ...managerCashoutFilters,
      }),
    enabled: !!selectedClubId && activeTab === "manager-cashout",
  });

  // Get manager tip balance when cashout modal is open
  const { data: managerBalanceData } = useQuery({
    queryKey: ["manager-tip-balance", selectedClubId, selectedManager?.id],
    queryFn: () => payrollAPI.getManagerTipBalance(selectedClubId, selectedManager?.id),
    enabled: !!selectedClubId && !!selectedManager && showManagerCashoutModal,
  });

  // Get club tip summary
  const { data: clubSummaryData } = useQuery({
    queryKey: ["club-tip-summary", selectedClubId],
    queryFn: () => payrollAPI.getClubTipSummary(selectedClubId),
    enabled: !!selectedClubId && activeTab === "club-share",
  });

  // Update tip settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (data) => {
      const settingsToSend = {
        clubHoldPercentage: parseFloat(data.clubHoldPercentage) || 0,
        dealerSharePercentage: parseFloat(data.dealerSharePercentage) || 0,
        floorManagerPercentage: parseFloat(data.floorManagerPercentage) || 0,
      };
      return payrollAPI.updateTipSettings(selectedClubId, settingsToSend, selectedDealer?.id);
    },
    onSuccess: () => {
      toast.success("Tip settings updated successfully!");
      queryClient.invalidateQueries(["tip-settings", selectedClubId, selectedDealer?.id]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update tip settings");
    },
  });

  // Process tips mutation
  const processTipsMutation = useMutation({
    mutationFn: (data) => payrollAPI.processDealerTips(selectedClubId, data),
    onSuccess: () => {
      toast.success("Dealer tips processed successfully!");
      queryClient.invalidateQueries(["dealer-tips", selectedClubId]);
      queryClient.invalidateQueries(["club-tip-summary", selectedClubId]);
      queryClient.invalidateQueries(["manager-tip-balance"]);
      setShowTipsModal(false);
      setSelectedDealer(null);
      setTipsForm({
        dealerId: "",
        managerId: "",
        tipDate: new Date().toISOString().split("T")[0],
        totalTips: "",
        notes: "",
      });
      setTipSettings({
        clubHoldPercentage: 15,
        dealerSharePercentage: 80,
        floorManagerPercentage: 5,
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to process tips");
    },
  });

  // Process dealer cashout mutation
  const processCashoutMutation = useMutation({
    mutationFn: (data) => payrollAPI.processDealerCashout(selectedClubId, data),
    onSuccess: () => {
      toast.success("Dealer cashout processed successfully!");
      queryClient.invalidateQueries(["dealer-cashouts", selectedClubId]);
      queryClient.invalidateQueries(["club-tip-summary", selectedClubId]);
      setShowCashoutModal(false);
      setSelectedDealer(null);
      setCashoutForm({
        dealerId: "",
        cashoutDate: new Date().toISOString().split("T")[0],
        amount: "",
        notes: "",
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to process cashout");
    },
  });

  // Process manager cashout mutation
  const processManagerCashoutMutation = useMutation({
    mutationFn: (data) => payrollAPI.processManagerCashout(selectedClubId, data),
    onSuccess: () => {
      toast.success("Manager cashout processed successfully!");
      queryClient.invalidateQueries(["manager-cashouts", selectedClubId]);
      queryClient.invalidateQueries(["club-tip-summary", selectedClubId]);
      queryClient.invalidateQueries(["manager-tip-balance"]);
      setShowManagerCashoutModal(false);
      setSelectedManager(null);
      setManagerCashoutForm({
        managerId: "",
        cashoutDate: new Date().toISOString().split("T")[0],
        amount: "",
        notes: "",
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to process manager cashout");
    },
  });

  const handleUpdateSettings = () => {
    const total =
      Number(tipSettings.clubHoldPercentage) +
      Number(tipSettings.dealerSharePercentage) +
      Number(tipSettings.floorManagerPercentage);

    if (Math.abs(total - 100) > 0.01) {
      toast.error("Percentages must add up to 100%");
      return;
    }

    updateSettingsMutation.mutate(tipSettings);
  };

  const handleDealerClickForTips = (dealer) => {
    setSelectedDealer(dealer);
    setTipsForm({
      ...tipsForm,
      dealerId: dealer.id,
      managerId: "",
    });
    setShowTipsModal(true);
  };

  const handleDealerClickForCashout = (dealer) => {
    setSelectedDealer(dealer);
    setCashoutForm({
      ...cashoutForm,
      dealerId: dealer.id,
    });
    setShowCashoutModal(true);
  };

  const handleManagerClickForCashout = (manager) => {
    setSelectedManager(manager);
    setManagerCashoutForm({
      ...managerCashoutForm,
      managerId: manager.id,
    });
    setShowManagerCashoutModal(true);
  };

  const handleProcessTips = () => {
    if (!tipsForm.dealerId || !tipsForm.totalTips) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      dealerId: tipsForm.dealerId,
      tipDate: tipsForm.tipDate,
      totalTips: Number(tipsForm.totalTips),
      notes: tipsForm.notes,
    };
    if (tipsForm.managerId) {
      payload.managerId = tipsForm.managerId;
    }

    processTipsMutation.mutate(payload);
  };

  const handleProcessCashout = () => {
    if (!cashoutForm.dealerId || !cashoutForm.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    processCashoutMutation.mutate({
      ...cashoutForm,
      amount: Number(cashoutForm.amount),
    });
  };

  const handleProcessManagerCashout = () => {
    if (!managerCashoutForm.managerId || !managerCashoutForm.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    processManagerCashoutMutation.mutate({
      ...managerCashoutForm,
      amount: Number(managerCashoutForm.amount),
    });
  };

  const dealers = dealersData?.dealers || [];
  const managers = managersData?.managers || [];
  const tips = tipsData?.tips || [];
  const cashouts = cashoutsData?.cashouts || [];
  const managerCashouts = managerCashoutsData?.cashouts || [];
  const tipsTotalPages = tipsData?.totalPages || 1;
  const tipsTotal = tipsData?.total || 0;
  const cashoutsTotalPages = cashoutsData?.totalPages || 1;
  const cashoutsTotal = cashoutsData?.total || 0;
  const managerCashoutsTotalPages = managerCashoutsData?.totalPages || 1;
  const managerCashoutsTotal = managerCashoutsData?.total || 0;

  const totalPercentage =
    Number(tipSettings.clubHoldPercentage) +
    Number(tipSettings.dealerSharePercentage) +
    Number(tipSettings.floorManagerPercentage);

  const managerBalance = managerBalanceData || {};
  const clubSummary = clubSummaryData || {};

  const tabs = [
    { id: "tips", label: "Dealer Tips %" },
    { id: "cashout", label: "Dealer Cash Out" },
    { id: "manager-cashout", label: "Manager Cash Out" },
    { id: "club-share", label: "Club Share" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Tips Management</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "text-white border-b-2 border-cyan-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dealer Tips % Tab */}
      {activeTab === "tips" && (
        <div className="space-y-6">
          {/* Select Dealer for Tips */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Click a Dealer to Process Their Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
              {dealers.map((dealer) => (
                <button
                  key={dealer.id}
                  onClick={() => handleDealerClickForTips(dealer)}
                  className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-700 rounded-lg p-4 hover:from-cyan-800/40 hover:to-blue-800/40 transition-all text-left"
                >
                  <h4 className="text-white font-semibold text-lg">{dealer.name}</h4>
                  <p className="text-sm text-cyan-400 mt-1">{dealer.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {dealer.gameType ? (dealer.gameType === "rummy" ? "Rummy" : "Poker") : "General"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Tips History with Filters */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Dealer Tips History</h3>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-white text-sm mb-1 block">Search</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"
                  placeholder="Dealer name..."
                  value={tipsFilters.search}
                  onChange={(e) => setTipsFilters({ ...tipsFilters, search: e.target.value })}
                />
              </div>
              <div>
                <label className="text-white text-sm mb-1 block">Start Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"
                  value={tipsFilters.startDate}
                  onChange={(e) => setTipsFilters({ ...tipsFilters, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-white text-sm mb-1 block">End Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"
                  value={tipsFilters.endDate}
                  onChange={(e) => setTipsFilters({ ...tipsFilters, endDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-white text-sm mb-1 block">Dealer</label>
                <select
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"
                  value={tipsFilters.dealerId}
                  onChange={(e) => setTipsFilters({ ...tipsFilters, dealerId: e.target.value })}
                >
                  <option value="">All Dealers</option>
                  {dealers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {tipsLoading ? (
              <div className="text-white text-center py-8">Loading...</div>
            ) : tips.length === 0 ? (
              <div className="text-gray-400 text-center py-8">No tips processed yet</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left text-white font-semibold p-3">Dealer</th>
                        <th className="text-left text-white font-semibold p-3">Manager</th>
                        <th className="text-right text-white font-semibold p-3">Total Tips</th>
                        <th className="text-right text-white font-semibold p-3">Dealer Share</th>
                        <th className="text-right text-white font-semibold p-3">Club Hold</th>
                        <th className="text-right text-white font-semibold p-3">Floor Manager</th>
                        <th className="text-left text-white font-semibold p-3">Date</th>
                        <th className="text-left text-white font-semibold p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tips.map((tip) => (
                        <tr key={tip.id} className="border-b border-slate-700 hover:bg-slate-700">
                          <td className="text-white p-3">{tip.dealer?.name}</td>
                          <td className="text-white p-3 text-sm">
                            {tip.manager?.name || <span className="text-gray-500">Unassigned</span>}
                          </td>
                          <td className="text-right text-white p-3">₹{Number(tip.totalTips).toFixed(2)}</td>
                          <td className="text-right text-green-400 p-3">
                            ₹{Number(tip.dealerShareAmount).toFixed(2)}
                          </td>
                          <td className="text-right text-cyan-400 p-3">
                            ₹{Number(tip.clubHoldAmount).toFixed(2)}
                          </td>
                          <td className="text-right text-purple-400 p-3">
                            ₹{Number(tip.floorManagerAmount).toFixed(2)}
                          </td>
                          <td className="text-white p-3">{new Date(tip.tipDate).toLocaleDateString()}</td>
                          <td className="text-white p-3">
                            <span className="px-2 py-1 bg-green-600 rounded text-xs">{tip.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-gray-400 text-sm">
                    Showing {(currentTipsPage - 1) * 10 + 1} to {Math.min(currentTipsPage * 10, tipsTotal)} of{" "}
                    {tipsTotal} entries
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentTipsPage((p) => Math.max(1, p - 1))}
                      disabled={currentTipsPage === 1}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <div className="flex gap-2">
                      {[...Array(Math.min(tipsTotalPages, 5))].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentTipsPage(i + 1)}
                          className={`px-4 py-2 rounded-lg ${
                            currentTipsPage === i + 1
                              ? "bg-cyan-600 text-white"
                              : "bg-slate-700 hover:bg-slate-600 text-white"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentTipsPage((p) => Math.min(tipsTotalPages, p + 1))}
                      disabled={currentTipsPage === tipsTotalPages}
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

      {/* Dealer Cash Out Tab */}
      {activeTab === "cashout" && (
        <div className="space-y-6">
          {/* Select Dealer for Cashout */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Click a Dealer to Process Cash Out</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
              {dealers.map((dealer) => (
                <button
                  key={dealer.id}
                  onClick={() => handleDealerClickForCashout(dealer)}
                  className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700 rounded-lg p-4 hover:from-green-800/40 hover:to-emerald-800/40 transition-all text-left"
                >
                  <h4 className="text-white font-semibold text-lg">{dealer.name}</h4>
                  <p className="text-sm text-green-400 mt-1">{dealer.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {dealer.gameType ? (dealer.gameType === "rummy" ? "Rummy" : "Poker") : "General"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Cashout History with Filters */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Dealer Cashout History</h3>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-white text-sm mb-1 block">Search</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  placeholder="Dealer name..."
                  value={cashoutFilters.search}
                  onChange={(e) => setCashoutFilters({ ...cashoutFilters, search: e.target.value })}
                />
              </div>
              <div>
                <label className="text-white text-sm mb-1 block">Start Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  value={cashoutFilters.startDate}
                  onChange={(e) => setCashoutFilters({ ...cashoutFilters, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-white text-sm mb-1 block">End Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  value={cashoutFilters.endDate}
                  onChange={(e) => setCashoutFilters({ ...cashoutFilters, endDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-white text-sm mb-1 block">Dealer</label>
                <select
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  value={cashoutFilters.dealerId}
                  onChange={(e) => setCashoutFilters({ ...cashoutFilters, dealerId: e.target.value })}
                >
                  <option value="">All Dealers</option>
                  {dealers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {cashoutsLoading ? (
              <div className="text-white text-center py-8">Loading...</div>
            ) : cashouts.length === 0 ? (
              <div className="text-gray-400 text-center py-8">No cashouts processed yet</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left text-white font-semibold p-3">Dealer</th>
                        <th className="text-right text-white font-semibold p-3">Amount</th>
                        <th className="text-left text-white font-semibold p-3">Date</th>
                        <th className="text-left text-white font-semibold p-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cashouts.map((cashout) => (
                        <tr key={cashout.id} className="border-b border-slate-700 hover:bg-slate-700">
                          <td className="text-white p-3">{cashout.dealer?.name}</td>
                          <td className="text-right text-green-400 font-semibold p-3">
                            ₹{Number(cashout.amount).toFixed(2)}
                          </td>
                          <td className="text-white p-3">
                            {new Date(cashout.cashoutDate).toLocaleDateString()}
                          </td>
                          <td className="text-gray-400 p-3 text-sm">{cashout.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-gray-400 text-sm">
                    Showing {(currentCashoutPage - 1) * 10 + 1} to{" "}
                    {Math.min(currentCashoutPage * 10, cashoutsTotal)} of {cashoutsTotal} entries
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentCashoutPage((p) => Math.max(1, p - 1))}
                      disabled={currentCashoutPage === 1}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <div className="flex gap-2">
                      {[...Array(Math.min(cashoutsTotalPages, 5))].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentCashoutPage(i + 1)}
                          className={`px-4 py-2 rounded-lg ${
                            currentCashoutPage === i + 1
                              ? "bg-green-600 text-white"
                              : "bg-slate-700 hover:bg-slate-600 text-white"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentCashoutPage((p) => Math.min(cashoutsTotalPages, p + 1))}
                      disabled={currentCashoutPage === cashoutsTotalPages}
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

      {/* Manager Cash Out Tab */}
      {activeTab === "manager-cashout" && (
        <div className="space-y-6">
          {/* Select Manager for Cashout */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Click a Manager to Process Cash Out</h3>
            {managers.length === 0 ? (
              <div className="text-gray-400 text-center py-4">No managers found in this club</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
                {managers.map((manager) => (
                  <button
                    key={manager.id}
                    onClick={() => handleManagerClickForCashout(manager)}
                    className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-700 rounded-lg p-4 hover:from-purple-800/40 hover:to-indigo-800/40 transition-all text-left"
                  >
                    <h4 className="text-white font-semibold text-lg">{manager.name}</h4>
                    <p className="text-sm text-purple-400 mt-1">{manager.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {manager.gameType ? (manager.gameType === "rummy" ? "Rummy" : "Poker") : "General"}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Manager Cashout History with Filters */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Manager Cashout History</h3>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-white text-sm mb-1 block">Search</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="Manager name..."
                  value={managerCashoutFilters.search}
                  onChange={(e) =>
                    setManagerCashoutFilters({ ...managerCashoutFilters, search: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-white text-sm mb-1 block">Start Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  value={managerCashoutFilters.startDate}
                  onChange={(e) =>
                    setManagerCashoutFilters({ ...managerCashoutFilters, startDate: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-white text-sm mb-1 block">End Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  value={managerCashoutFilters.endDate}
                  onChange={(e) =>
                    setManagerCashoutFilters({ ...managerCashoutFilters, endDate: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-white text-sm mb-1 block">Manager</label>
                <select
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  value={managerCashoutFilters.managerId}
                  onChange={(e) =>
                    setManagerCashoutFilters({ ...managerCashoutFilters, managerId: e.target.value })
                  }
                >
                  <option value="">All Managers</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {managerCashoutsLoading ? (
              <div className="text-white text-center py-8">Loading...</div>
            ) : managerCashouts.length === 0 ? (
              <div className="text-gray-400 text-center py-8">No manager cashouts processed yet</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left text-white font-semibold p-3">Manager</th>
                        <th className="text-right text-white font-semibold p-3">Amount</th>
                        <th className="text-left text-white font-semibold p-3">Game</th>
                        <th className="text-left text-white font-semibold p-3">Date</th>
                        <th className="text-left text-white font-semibold p-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {managerCashouts.map((cashout) => (
                        <tr key={cashout.id} className="border-b border-slate-700 hover:bg-slate-700">
                          <td className="text-white p-3">{cashout.manager?.name}</td>
                          <td className="text-right text-purple-400 font-semibold p-3">
                            ₹{Number(cashout.amount).toFixed(2)}
                          </td>
                          <td className="p-3">
                            {cashout.gameType === "rummy" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-900/40 border border-amber-600/40 text-amber-300 text-xs font-medium">
                                Rummy
                              </span>
                            ) : cashout.gameType === "poker" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-900/40 border border-indigo-600/40 text-indigo-300 text-xs font-medium">
                                Poker
                              </span>
                            ) : (
                              <span className="text-gray-500 text-xs">-</span>
                            )}
                          </td>
                          <td className="text-white p-3">
                            {new Date(cashout.cashoutDate).toLocaleDateString()}
                          </td>
                          <td className="text-gray-400 p-3 text-sm">{cashout.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-gray-400 text-sm">
                    Showing {(currentManagerCashoutPage - 1) * 10 + 1} to{" "}
                    {Math.min(currentManagerCashoutPage * 10, managerCashoutsTotal)} of {managerCashoutsTotal}{" "}
                    entries
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentManagerCashoutPage((p) => Math.max(1, p - 1))}
                      disabled={currentManagerCashoutPage === 1}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <div className="flex gap-2">
                      {[...Array(Math.min(managerCashoutsTotalPages, 5))].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentManagerCashoutPage(i + 1)}
                          className={`px-4 py-2 rounded-lg ${
                            currentManagerCashoutPage === i + 1
                              ? "bg-purple-600 text-white"
                              : "bg-slate-700 hover:bg-slate-600 text-white"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() =>
                        setCurrentManagerCashoutPage((p) => Math.min(managerCashoutsTotalPages, p + 1))
                      }
                      disabled={currentManagerCashoutPage === managerCashoutsTotalPages}
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

      {/* Club Share Tab */}
      {activeTab === "club-share" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Tips */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 border border-slate-700">
              <p className="text-gray-400 text-sm mb-1">Total Tips Collected</p>
              <p className="text-2xl font-bold text-white">₹{Number(clubSummary.totalTips || 0).toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">{clubSummary.tipCount || 0} tip entries</p>
            </div>

            {/* Club Hold (Revenue) */}
            <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 rounded-xl p-5 border border-cyan-700/40">
              <p className="text-cyan-400 text-sm mb-1">Club Hold (Revenue)</p>
              <p className="text-2xl font-bold text-cyan-300">
                +₹{Number(clubSummary.clubNetRevenue || 0).toFixed(2)}
              </p>
              <p className="text-xs text-cyan-500 mt-1">Club's share of all tips</p>
            </div>

            {/* Dealer Share */}
            <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-xl p-5 border border-green-700/40">
              <p className="text-green-400 text-sm mb-1">Total Dealer Share</p>
              <p className="text-2xl font-bold text-green-300">
                ₹{Number(clubSummary.totalDealerShare || 0).toFixed(2)}
              </p>
              <div className="flex justify-between mt-2 text-xs">
                <span className="text-green-500">
                  Paid: ₹{Number(clubSummary.totalDealerCashouts || 0).toFixed(2)}
                </span>
                <span className="text-yellow-400">
                  Pending: ₹{Number(clubSummary.pendingDealerPayouts || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Manager Share */}
            <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-xl p-5 border border-purple-700/40">
              <p className="text-purple-400 text-sm mb-1">Total Manager Share</p>
              <p className="text-2xl font-bold text-purple-300">
                ₹{Number(clubSummary.totalManagerShare || 0).toFixed(2)}
              </p>
              <div className="flex justify-between mt-2 text-xs">
                <span className="text-purple-500">
                  Paid: ₹{Number(clubSummary.totalManagerCashouts || 0).toFixed(2)}
                </span>
                <span className="text-yellow-400">
                  Pending: ₹{Number(clubSummary.pendingManagerPayouts || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Distribution Breakdown */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-4">Tip Distribution Summary</h3>

            <div className="space-y-4">
              {/* Club Revenue Bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-cyan-400 font-medium">Club Hold (Revenue)</span>
                  <span className="text-cyan-300 font-semibold">
                    +₹{Number(clubSummary.clubNetRevenue || 0).toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all"
                    style={{
                      width: `${
                        clubSummary.totalTips
                          ? ((Number(clubSummary.clubNetRevenue || 0) / Number(clubSummary.totalTips)) * 100).toFixed(1)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Dealer Payout Bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-green-400 font-medium">Dealer Payouts</span>
                  <span className="text-green-300">
                    ₹{Number(clubSummary.totalDealerCashouts || 0).toFixed(2)} paid / ₹
                    {Number(clubSummary.totalDealerShare || 0).toFixed(2)} total
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all"
                    style={{
                      width: `${
                        clubSummary.totalDealerShare
                          ? (
                              (Number(clubSummary.totalDealerCashouts || 0) /
                                Number(clubSummary.totalDealerShare)) *
                              100
                            ).toFixed(1)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Manager Payout Bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-purple-400 font-medium">Manager Payouts</span>
                  <span className="text-purple-300">
                    ₹{Number(clubSummary.totalManagerCashouts || 0).toFixed(2)} paid / ₹
                    {Number(clubSummary.totalManagerShare || 0).toFixed(2)} total
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all"
                    style={{
                      width: `${
                        clubSummary.totalManagerShare
                          ? (
                              (Number(clubSummary.totalManagerCashouts || 0) /
                                Number(clubSummary.totalManagerShare)) *
                              100
                            ).toFixed(1)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Total pending liabilities */}
            <div className="mt-6 bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-yellow-400 font-medium">Pending Payouts (Dealers + Managers)</span>
                <span className="text-yellow-300 font-bold text-lg">
                  ₹{(Number(clubSummary.pendingDealerPayouts || 0) + Number(clubSummary.pendingManagerPayouts || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Process Tips Modal */}
      {showTipsModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full border border-cyan-600 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Process Dealer Tips</h2>

            {selectedDealer && (
              <div className="bg-cyan-900/30 border border-cyan-600 rounded-lg p-4 mb-4">
                <div className="text-xs text-cyan-400 mb-1">Processing tips for:</div>
                <h3 className="text-white font-semibold text-xl">{selectedDealer.name}</h3>
                <p className="text-sm text-cyan-300 mt-1">{selectedDealer.email}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Tip Distribution Settings */}
              <div className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 rounded-lg p-6 border border-cyan-700">
                <h3 className="text-xl font-semibold text-white mb-4">Tip Distribution Settings</h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm mb-2 block">Club Hold Percentage</label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 bg-cyan-800/30 border border-cyan-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"
                      value={tipSettings.clubHoldPercentage}
                      onChange={(e) =>
                        setTipSettings({ ...tipSettings, clubHoldPercentage: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-white text-sm mb-2 block">Dealer Share Percentage</label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 bg-cyan-800/30 border border-cyan-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"
                      value={tipSettings.dealerSharePercentage}
                      onChange={(e) =>
                        setTipSettings({ ...tipSettings, dealerSharePercentage: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-white text-sm mb-2 block">Floor Manager Share</label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 bg-cyan-800/30 border border-cyan-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"
                      value={tipSettings.floorManagerPercentage}
                      onChange={(e) =>
                        setTipSettings({ ...tipSettings, floorManagerPercentage: e.target.value })
                      }
                    />
                  </div>

                  <div className="bg-cyan-800/50 border border-cyan-600 rounded-lg p-4">
                    <p className="text-white mb-2">Current Distribution:</p>
                    <p className="text-white">
                      Club: {tipSettings.clubHoldPercentage}% | Dealer: {tipSettings.dealerSharePercentage}% |
                      Floor Manager: {tipSettings.floorManagerPercentage}%
                    </p>
                    <p className="text-white font-semibold mt-2">
                      Total: {totalPercentage.toFixed(2)}%
                      {Math.abs(totalPercentage - 100) > 0.01 && (
                        <span className="text-red-400 ml-2">Must equal 100%</span>
                      )}
                    </p>
                  </div>

                  <button
                    onClick={handleUpdateSettings}
                    disabled={updateSettingsMutation.isLoading}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {updateSettingsMutation.isLoading ? "Updating..." : "Update Settings"}
                  </button>
                </div>
              </div>

              {/* Tip Processing Form */}
              <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
                <h3 className="text-xl font-semibold text-white mb-4">Tip Processing</h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm mb-1 block">Tip Date *</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"
                      value={tipsForm.tipDate}
                      onChange={(e) => setTipsForm({ ...tipsForm, tipDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-white text-sm mb-1 block">Total Tips (₹) *</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"
                      placeholder="₹0.00"
                      value={tipsForm.totalTips}
                      onChange={(e) => setTipsForm({ ...tipsForm, totalTips: e.target.value })}
                    />
                  </div>

                  {/* Floor Manager Assignment */}
                  <div>
                    <label className="text-white text-sm mb-1 block">
                      Assign Floor Manager (receives {tipSettings.floorManagerPercentage}% share)
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      value={tipsForm.managerId}
                      onChange={(e) => setTipsForm({ ...tipsForm, managerId: e.target.value })}
                    >
                      <option value="">-- Select Manager --</option>
                      {managers
                        .filter((m) => {
                          if (!selectedDealer?.gameType) return true;
                          if (!m.gameType) return true;
                          return m.gameType === selectedDealer.gameType;
                        })
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                            {m.gameType ? ` (${m.gameType === "rummy" ? "Rummy" : "Poker"})` : ""}
                          </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">
                      The selected manager will receive the floor manager tip share for this entry
                    </p>
                  </div>

                  {tipsForm.totalTips && (
                    <div className="bg-cyan-900/30 border border-cyan-500 rounded-lg p-3">
                      <p className="text-white text-sm mb-1 font-semibold">Distribution Preview:</p>
                      <p className="text-white text-xs">
                        Club: ₹
                        {((Number(tipsForm.totalTips) * Number(tipSettings.clubHoldPercentage)) / 100).toFixed(
                          2
                        )}{" "}
                        | Dealer: ₹
                        {(
                          (Number(tipsForm.totalTips) * Number(tipSettings.dealerSharePercentage)) /
                          100
                        ).toFixed(2)}{" "}
                        | Floor Manager: ₹
                        {(
                          (Number(tipsForm.totalTips) * Number(tipSettings.floorManagerPercentage)) /
                          100
                        ).toFixed(2)}
                        {tipsForm.managerId && (
                          <span className="text-purple-300">
                            {" "}
                            → {managers.find((m) => m.id === tipsForm.managerId)?.name || ""}
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-white text-sm mb-1 block">Notes</label>
                    <textarea
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 h-20"
                      placeholder="Additional notes..."
                      value={tipsForm.notes}
                      onChange={(e) => setTipsForm({ ...tipsForm, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleProcessTips}
                disabled={processTipsMutation.isLoading}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {processTipsMutation.isLoading ? "Processing..." : "Process Tips"}
              </button>
              <button
                onClick={() => {
                  setShowTipsModal(false);
                  setSelectedDealer(null);
                  setTipSettings({
                    clubHoldPercentage: 15,
                    dealerSharePercentage: 80,
                    floorManagerPercentage: 5,
                  });
                }}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Process Dealer Cashout Modal */}
      {showCashoutModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-green-600 max-h-[85vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Process Dealer Cash Out</h2>

            {selectedDealer && (
              <div className="bg-green-900/30 border border-green-600 rounded-lg p-4 mb-4">
                <div className="text-xs text-green-400 mb-1">Processing cashout for:</div>
                <h3 className="text-white font-semibold text-xl">{selectedDealer.name}</h3>
                <p className="text-sm text-green-300 mt-1">{selectedDealer.email}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm mb-1 block">Cashout Date *</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  value={cashoutForm.cashoutDate}
                  onChange={(e) => setCashoutForm({ ...cashoutForm, cashoutDate: e.target.value })}
                />
              </div>

              <div>
                <label className="text-white text-sm mb-1 block">Cash Out Amount (₹) *</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  placeholder="₹0.00"
                  value={cashoutForm.amount}
                  onChange={(e) => setCashoutForm({ ...cashoutForm, amount: e.target.value })}
                />
              </div>

              <div>
                <label className="text-white text-sm mb-1 block">Notes (Optional)</label>
                <textarea
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 h-24"
                  placeholder="Additional notes about the cash out..."
                  value={cashoutForm.notes}
                  onChange={(e) => setCashoutForm({ ...cashoutForm, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleProcessCashout}
                disabled={processCashoutMutation.isLoading}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {processCashoutMutation.isLoading ? "Processing..." : "Process Cash Out"}
              </button>
              <button
                onClick={() => {
                  setShowCashoutModal(false);
                  setSelectedDealer(null);
                }}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Process Manager Cashout Modal */}
      {showManagerCashoutModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-purple-600 max-h-[85vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Process Manager Cash Out</h2>

            {selectedManager && (
              <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4 mb-4">
                <div className="text-xs text-purple-400 mb-1">Processing cashout for:</div>
                <h3 className="text-white font-semibold text-xl">{selectedManager.name}</h3>
                <p className="text-sm text-purple-300 mt-1">{selectedManager.email}</p>
                {selectedManager.gameType && (
                  <p className="text-xs text-purple-400 mt-1">
                    Game: {selectedManager.gameType === "rummy" ? "Rummy" : "Poker"}
                  </p>
                )}
              </div>
            )}

            {/* Balance Display */}
            <div className="bg-purple-900/20 border border-purple-700/40 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-gray-400">Total Share</p>
                  <p className="text-lg font-bold text-purple-300">
                    ₹{Number(managerBalance.totalManagerShare || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Already Paid</p>
                  <p className="text-lg font-bold text-red-400">
                    ₹{Number(managerBalance.totalCashouts || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Available</p>
                  <p className="text-lg font-bold text-green-400">
                    ₹{Number(managerBalance.availableBalance || 0).toFixed(2)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Based on {managerBalance.tipCount || 0} assigned tip entries
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm mb-1 block">Cashout Date *</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  value={managerCashoutForm.cashoutDate}
                  onChange={(e) =>
                    setManagerCashoutForm({ ...managerCashoutForm, cashoutDate: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-white text-sm mb-1 block">Cash Out Amount (₹) *</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="₹0.00"
                  max={managerBalance.availableBalance || 0}
                  value={managerCashoutForm.amount}
                  onChange={(e) => setManagerCashoutForm({ ...managerCashoutForm, amount: e.target.value })}
                />
                {managerCashoutForm.amount &&
                  Number(managerCashoutForm.amount) > Number(managerBalance.availableBalance || 0) && (
                    <p className="text-red-400 text-xs mt-1">
                      Amount exceeds available balance of ₹
                      {Number(managerBalance.availableBalance || 0).toFixed(2)}
                    </p>
                  )}
              </div>

              <div>
                <label className="text-white text-sm mb-1 block">Notes (Optional)</label>
                <textarea
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 h-24"
                  placeholder="Additional notes about the cash out..."
                  value={managerCashoutForm.notes}
                  onChange={(e) => setManagerCashoutForm({ ...managerCashoutForm, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleProcessManagerCashout}
                disabled={
                  processManagerCashoutMutation.isLoading ||
                  Number(managerCashoutForm.amount) > Number(managerBalance.availableBalance || 0)
                }
                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {processManagerCashoutMutation.isLoading ? "Processing..." : "Process Cash Out"}
              </button>
              <button
                onClick={() => {
                  setShowManagerCashoutModal(false);
                  setSelectedManager(null);
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
