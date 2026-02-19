import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bonusAPI } from "../lib/api";
import toast from "react-hot-toast";

const PLAYER_BONUS_TYPES = [
  "Welcome Bonus",
  "Loyalty Bonus",
  "Referral Bonus",
  "Tournament Bonus",
  "Special Event Bonus",
  "Custom",
];

const STAFF_BONUS_TYPES = [
  "Performance Bonus",
  "Attendance Bonus",
  "Special Achievement",
  "Holiday Bonus",
  "Year-end Bonus",
  "Custom",
];

export default function BonusManagement({ selectedClubId }) {
  const [activeTab, setActiveTab] = useState("player"); // "player" or "staff"
  const [activeSubTab, setActiveSubTab] = useState("process"); // "process" or "history"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Bonus Management</h1>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => {
            setActiveTab("player");
            setActiveSubTab("process");
          }}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === "player"
              ? "text-white border-b-2 border-orange-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Player Bonus
        </button>
        {/* <button
          onClick={() => {
            setActiveTab("staff");
            setActiveSubTab("process");
          }}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === "staff"
              ? "text-white border-b-2 border-pink-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Staff Bonus
        </button> */}
      </div>

      {/* Tab Content */}
      {activeTab === "player" && (
        <PlayerBonusTab selectedClubId={selectedClubId} activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />
      )}

      {activeTab === "staff" && (
        <StaffBonusTab selectedClubId={selectedClubId} activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />
      )}
    </div>
  );
}

// Player Bonus Tab Component
function PlayerBonusTab({ selectedClubId, activeSubTab, setActiveSubTab }) {
  const queryClient = useQueryClient();
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [playerSearch, setPlayerSearch] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
    playerId: "",
  });

  const [bonusForm, setBonusForm] = useState({
    playerId: "",
    bonusType: "",
    customBonusType: "",
    bonusAmount: "",
    reason: "",
  });

  // Get players list (KYC approved/verified only) with search
  const { data: playersData } = useQuery({
    queryKey: ["bonus-players", selectedClubId, playerSearch],
    queryFn: () => bonusAPI.getPlayersForBonus(selectedClubId, playerSearch || undefined),
    enabled: !!selectedClubId,
  });

  // Get player bonuses with pagination
  const { data: bonusesData, isLoading } = useQuery({
    queryKey: ["player-bonuses", selectedClubId, currentPage, filters],
    queryFn: () =>
      bonusAPI.getPlayerBonuses(selectedClubId, {
        page: currentPage,
        limit: 10,
        ...filters,
      }),
    enabled: !!selectedClubId && activeSubTab === "history",
  });

  // Process bonus mutation
  const processMutation = useMutation({
    mutationFn: (data) => bonusAPI.processPlayerBonus(selectedClubId, data),
    onSuccess: () => {
      toast.success("Player bonus processed successfully!");
      queryClient.invalidateQueries(["player-bonuses", selectedClubId]);
      setShowBonusModal(false);
      setSelectedPlayer(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to process bonus");
    },
  });

  const resetForm = () => {
    setBonusForm({
      playerId: "",
      bonusType: "",
      customBonusType: "",
      bonusAmount: "",
      reason: "",
    });
  };

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    setBonusForm({
      ...bonusForm,
      playerId: player.id,
    });
    setShowBonusModal(true);
  };

  const handleProcessBonus = () => {
    if (!bonusForm.playerId || !bonusForm.bonusType || !bonusForm.bonusAmount) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (bonusForm.bonusType === "Custom" && !bonusForm.customBonusType) {
      toast.error("Please enter custom bonus type name");
      return;
    }

    processMutation.mutate({
      playerId: bonusForm.playerId,
      bonusType: bonusForm.bonusType === "Custom" ? bonusForm.customBonusType : bonusForm.bonusType,
      bonusAmount: Number(bonusForm.bonusAmount),
      reason: bonusForm.reason || undefined,
    });
  };

  const players = playersData?.players || [];
  const bonuses = bonusesData?.bonuses || [];
  const totalPages = bonusesData?.totalPages || 1;
  const total = bonusesData?.total || 0;

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => setActiveSubTab("process")}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeSubTab === "process"
              ? "text-white border-b-2 border-orange-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Process Bonus
        </button>
        <button
          onClick={() => setActiveSubTab("history")}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeSubTab === "history"
              ? "text-white border-b-2 border-orange-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Bonus History
        </button>
      </div>

      {/* Process Bonus Tab */}
      {activeSubTab === "process" && (
        <div className="space-y-6">
          {/* Search Player */}
          <div className="bg-slate-800 rounded-lg p-4">
            <label className="text-white text-sm mb-2 block">
              🔍 Search Player (Type at least 3 characters)
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
              placeholder="Search by name, email, phone number, or player ID..."
              value={playerSearch}
              onChange={(e) => setPlayerSearch(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-2">
              Only KYC approved/verified players are shown
            </p>
          </div>

          {/* Player List */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">👤 Click a Player to Process Bonus</h3>
            {players.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                {playerSearch.length >= 3
                  ? "No players found matching your search"
                  : playerSearch.length > 0
                  ? "Type at least 3 characters to search"
                  : "No KYC approved players found"}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {players.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => handlePlayerClick(player)}
                    className="bg-gradient-to-r from-orange-900/30 to-amber-900/30 border border-orange-700 rounded-lg p-4 hover:from-orange-800/40 hover:to-amber-800/40 transition-all text-left"
                  >
                    <h4 className="text-white font-semibold text-lg">{player.name}</h4>
                    <p className="text-sm text-orange-400 mt-1">{player.email}</p>
                    {player.playerId && (
                      <p className="text-xs text-gray-400 mt-1">ID: {player.playerId}</p>
                    )}
                    {player.phoneNumber && (
                      <p className="text-xs text-gray-400 mt-1">Phone: {player.phoneNumber}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bonus History Tab */}
      {activeSubTab === "history" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-white text-sm mb-1 block">Search</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                  placeholder="Name, email, or ID..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <div>
                <label className="text-white text-sm mb-1 block">Start Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-white text-sm mb-1 block">End Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-white text-sm mb-1 block">Player</label>
                <select
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                  value={filters.playerId}
                  onChange={(e) => setFilters({ ...filters, playerId: e.target.value })}
                >
                  <option value="">All Players</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Bonuses Table */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Bonus History (Total: {total})</h3>

            {isLoading ? (
              <div className="text-white text-center py-8">Loading...</div>
            ) : bonuses.length === 0 ? (
              <div className="text-gray-400 text-center py-8">No bonuses found</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left text-white font-semibold p-3">Player</th>
                        <th className="text-left text-white font-semibold p-3">Bonus Type</th>
                        <th className="text-right text-white font-semibold p-3">Amount</th>
                        <th className="text-left text-white font-semibold p-3">Reason</th>
                        <th className="text-left text-white font-semibold p-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bonuses.map((bonus) => (
                        <tr key={bonus.id} className="border-b border-slate-700 hover:bg-slate-700">
                          <td className="text-white p-3">{bonus.player?.name}</td>
                          <td className="text-white p-3">{bonus.bonusType}</td>
                          <td className="text-right text-orange-400 font-semibold p-3">
                            ₹{Number(bonus.bonusAmount).toFixed(2)}
                          </td>
                          <td className="text-gray-400 p-3 text-sm">{bonus.reason || "-"}</td>
                          <td className="text-white p-3">
                            {new Date(bonus.processedAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
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
                              ? "bg-orange-600 text-white"
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

      {/* Process Bonus Modal */}
      {showBonusModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-orange-900/90 to-amber-900/90 rounded-xl p-6 max-w-md w-full border border-orange-600 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">💰 Process Player Bonus</h2>

            {selectedPlayer && (
              <div className="bg-orange-900/30 border border-orange-600 rounded-lg p-4 mb-4">
                <div className="text-xs text-orange-400 mb-1">Processing bonus for:</div>
                <h3 className="text-white font-semibold text-xl">{selectedPlayer.name}</h3>
                <p className="text-sm text-orange-300 mt-1">{selectedPlayer.email}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm mb-1 block">Bonus Type *</label>
                <select
                  className="w-full px-3 py-2 bg-orange-800/50 border border-orange-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                  value={bonusForm.bonusType}
                  onChange={(e) => setBonusForm({ ...bonusForm, bonusType: e.target.value, customBonusType: "" })}
                >
                  <option value="">Select Bonus Type</option>
                  {PLAYER_BONUS_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {bonusForm.bonusType === "Custom" && (
                <div>
                  <label className="text-white text-sm mb-1 block">Custom Bonus Type Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-orange-800/50 border border-orange-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter custom bonus type name..."
                    value={bonusForm.customBonusType}
                    onChange={(e) => setBonusForm({ ...bonusForm, customBonusType: e.target.value })}
                  />
                </div>
              )}

              <div>
                <label className="text-white text-sm mb-1 block">Bonus Amount (₹) *</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-orange-800/50 border border-orange-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                  placeholder="₹0.00"
                  value={bonusForm.bonusAmount}
                  onChange={(e) => setBonusForm({ ...bonusForm, bonusAmount: e.target.value })}
                />
              </div>

              <div>
                <label className="text-white text-sm mb-1 block">Reason</label>
                <textarea
                  className="w-full px-3 py-2 bg-orange-800/50 border border-orange-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 h-20"
                  placeholder="Bonus reason..."
                  value={bonusForm.reason}
                  onChange={(e) => setBonusForm({ ...bonusForm, reason: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleProcessBonus}
                disabled={processMutation.isLoading}
                className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {processMutation.isLoading ? "Processing..." : "Process Bonus"}
              </button>
              <button
                onClick={() => {
                  setShowBonusModal(false);
                  setSelectedPlayer(null);
                  resetForm();
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

// Staff Bonus Tab Component
function StaffBonusTab({ selectedClubId, activeSubTab, setActiveSubTab }) {
  const queryClient = useQueryClient();
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [staffSearch, setStaffSearch] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
    staffId: "",
  });

  const [bonusForm, setBonusForm] = useState({
    staffId: "",
    bonusType: "",
    customBonusType: "",
    bonusAmount: "",
    reason: "",
  });

  // Get staff list with search
  const { data: staffData } = useQuery({
    queryKey: ["bonus-staff", selectedClubId, staffSearch],
    queryFn: () => bonusAPI.getStaffForBonus(selectedClubId, staffSearch || undefined),
    enabled: !!selectedClubId,
  });

  // Get staff bonuses with pagination
  const { data: bonusesData, isLoading } = useQuery({
    queryKey: ["staff-bonuses", selectedClubId, currentPage, filters],
    queryFn: () =>
      bonusAPI.getStaffBonuses(selectedClubId, {
        page: currentPage,
        limit: 10,
        ...filters,
      }),
    enabled: !!selectedClubId && activeSubTab === "history",
  });

  // Process bonus mutation
  const processMutation = useMutation({
    mutationFn: (data) => bonusAPI.processStaffBonus(selectedClubId, data),
    onSuccess: () => {
      toast.success("Staff bonus processed successfully!");
      queryClient.invalidateQueries(["staff-bonuses", selectedClubId]);
      setShowBonusModal(false);
      setSelectedStaff(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to process bonus");
    },
  });

  const resetForm = () => {
    setBonusForm({
      staffId: "",
      bonusType: "",
      customBonusType: "",
      bonusAmount: "",
      reason: "",
    });
  };

  const handleStaffClick = (staff) => {
    setSelectedStaff(staff);
    setBonusForm({
      ...bonusForm,
      staffId: staff.id,
    });
    setShowBonusModal(true);
  };

  const handleProcessBonus = () => {
    if (!bonusForm.staffId || !bonusForm.bonusType || !bonusForm.bonusAmount) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (bonusForm.bonusType === "Custom" && !bonusForm.customBonusType) {
      toast.error("Please enter custom bonus type name");
      return;
    }

    processMutation.mutate({
      staffId: bonusForm.staffId,
      bonusType: bonusForm.bonusType === "Custom" ? bonusForm.customBonusType : bonusForm.bonusType,
      bonusAmount: Number(bonusForm.bonusAmount),
      reason: bonusForm.reason || undefined,
    });
  };

  const staff = staffData?.staff || [];
  const bonuses = bonusesData?.bonuses || [];
  const totalPages = bonusesData?.totalPages || 1;
  const total = bonusesData?.total || 0;

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => setActiveSubTab("process")}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeSubTab === "process"
              ? "text-white border-b-2 border-pink-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Process Bonus
        </button>
        <button
          onClick={() => setActiveSubTab("history")}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeSubTab === "history"
              ? "text-white border-b-2 border-pink-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Bonus History
        </button>
      </div>

      {/* Process Bonus Tab */}
      {activeSubTab === "process" && (
        <div className="space-y-6">
          {/* Search Staff */}
          <div className="bg-slate-800 rounded-lg p-4">
            <label className="text-white text-sm mb-2 block">
              🔍 Search Staff Member (Type at least 3 characters)
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
              placeholder="Search by name, email, phone number, or employee ID..."
              value={staffSearch}
              onChange={(e) => setStaffSearch(e.target.value)}
            />
          </div>

          {/* Staff List */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">👤 Click a Staff Member to Process Bonus</h3>
            {staff.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                {staffSearch.length >= 3
                  ? "No staff members found matching your search"
                  : staffSearch.length > 0
                  ? "Type at least 3 characters to search"
                  : "No staff members found"}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {staff.map((staffMember) => (
                  <button
                    key={staffMember.id}
                    onClick={() => handleStaffClick(staffMember)}
                    className="bg-gradient-to-r from-pink-900/30 to-rose-900/30 border border-pink-700 rounded-lg p-4 hover:from-pink-800/40 hover:to-rose-800/40 transition-all text-left"
                  >
                    <h4 className="text-white font-semibold text-lg">{staffMember.name}</h4>
                    <p className="text-sm text-pink-400 mt-1">{staffMember.email || "No email"}</p>
                    <p className="text-xs text-gray-400 mt-1">Role: {staffMember.role}</p>
                    {staffMember.phone && (
                      <p className="text-xs text-gray-400 mt-1">Phone: {staffMember.phone}</p>
                    )}
                    {staffMember.employeeId && (
                      <p className="text-xs text-gray-400 mt-1">Employee ID: {staffMember.employeeId}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bonus History Tab */}
      {activeSubTab === "history" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-white text-sm mb-1 block">Search</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
                  placeholder="Name, email, or ID..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <div>
                <label className="text-white text-sm mb-1 block">Start Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-white text-sm mb-1 block">End Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-white text-sm mb-1 block">Staff</label>
                <select
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
                  value={filters.staffId}
                  onChange={(e) => setFilters({ ...filters, staffId: e.target.value })}
                >
                  <option value="">All Staff</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Bonuses Table */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Bonus History (Total: {total})</h3>

            {isLoading ? (
              <div className="text-white text-center py-8">Loading...</div>
            ) : bonuses.length === 0 ? (
              <div className="text-gray-400 text-center py-8">No bonuses found</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left text-white font-semibold p-3">Staff</th>
                        <th className="text-left text-white font-semibold p-3">Bonus Type</th>
                        <th className="text-right text-white font-semibold p-3">Amount</th>
                        <th className="text-left text-white font-semibold p-3">Reason</th>
                        <th className="text-left text-white font-semibold p-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bonuses.map((bonus) => (
                        <tr key={bonus.id} className="border-b border-slate-700 hover:bg-slate-700">
                          <td className="text-white p-3">{bonus.staff?.name}</td>
                          <td className="text-white p-3">{bonus.bonusType}</td>
                          <td className="text-right text-pink-400 font-semibold p-3">
                            ₹{Number(bonus.bonusAmount).toFixed(2)}
                          </td>
                          <td className="text-gray-400 p-3 text-sm">{bonus.reason || "-"}</td>
                          <td className="text-white p-3">
                            {new Date(bonus.processedAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
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
                              ? "bg-pink-600 text-white"
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

      {/* Process Bonus Modal */}
      {showBonusModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-pink-900/90 to-rose-900/90 rounded-xl p-6 max-w-md w-full border border-pink-600 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">💰 Process Staff Bonus</h2>

            {selectedStaff && (
              <div className="bg-pink-900/30 border border-pink-600 rounded-lg p-4 mb-4">
                <div className="text-xs text-pink-400 mb-1">Processing bonus for:</div>
                <h3 className="text-white font-semibold text-xl">{selectedStaff.name}</h3>
                <p className="text-sm text-pink-300 mt-1">{selectedStaff.email || "No email"}</p>
                <p className="text-xs text-pink-400 mt-1">Role: {selectedStaff.role}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm mb-1 block">Bonus Type *</label>
                <select
                  className="w-full px-3 py-2 bg-pink-800/50 border border-pink-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
                  value={bonusForm.bonusType}
                  onChange={(e) => setBonusForm({ ...bonusForm, bonusType: e.target.value, customBonusType: "" })}
                >
                  <option value="">Select Bonus Type</option>
                  {STAFF_BONUS_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {bonusForm.bonusType === "Custom" && (
                <div>
                  <label className="text-white text-sm mb-1 block">Custom Bonus Type Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-pink-800/50 border border-pink-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
                    placeholder="Enter custom bonus type name..."
                    value={bonusForm.customBonusType}
                    onChange={(e) => setBonusForm({ ...bonusForm, customBonusType: e.target.value })}
                  />
                </div>
              )}

              <div>
                <label className="text-white text-sm mb-1 block">Bonus Amount (₹) *</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-pink-800/50 border border-pink-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
                  placeholder="₹0.00"
                  value={bonusForm.bonusAmount}
                  onChange={(e) => setBonusForm({ ...bonusForm, bonusAmount: e.target.value })}
                />
              </div>

              <div>
                <label className="text-white text-sm mb-1 block">Reason</label>
                <textarea
                  className="w-full px-3 py-2 bg-pink-800/50 border border-pink-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500 h-20"
                  placeholder="Bonus reason..."
                  value={bonusForm.reason}
                  onChange={(e) => setBonusForm({ ...bonusForm, reason: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleProcessBonus}
                disabled={processMutation.isLoading}
                className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {processMutation.isLoading ? "Processing..." : "Process Bonus"}
              </button>
              <button
                onClick={() => {
                  setShowBonusModal(false);
                  setSelectedStaff(null);
                  resetForm();
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

