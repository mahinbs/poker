import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tournamentsAPI, clubsAPI } from "../lib/api";
import toast from "react-hot-toast";

/**
 * Rummy Tournament Management Component
 * Handles CRUD operations for Rummy tournaments with rummy-specific fields
 */
export default function RummyTournamentManagement({ selectedClubId }) {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [editingTournament, setEditingTournament] = useState(null);
  const [viewMode, setViewMode] = useState("details"); // 'details' or 'players'

  // Rummy-specific tournament type options
  const rummyVariants = [
    "Points Rummy",
    "Pool Rummy (101 Points)",
    "Pool Rummy (201 Points)",
    "Deals Rummy",
    "Custom",
  ];

  const [tournamentForm, setTournamentForm] = useState({
    name: "",
    rummy_variant: "Points Rummy",
    custom_variant: "",
    entry_fee: "",
    prize_pool: "",
    number_of_deals: 1, // For Deals Rummy
    points_per_deal: 0, // For Points Rummy
    drop_points: 20, // Points to drop out
    max_points: 80, // Maximum points before elimination
    min_players: 2,
    max_players: 6,
    start_time: "",
    deal_duration: 5, // Minutes per deal
    break_duration: 5, // Minutes between deals
    payout_structure: "Winner takes all",
    allow_reentry: false,
    late_registration: 60, // Minutes
  });

  const [winnersForm, setWinnersForm] = useState([]);
  const [clubLogoUrl, setClubLogoUrl] = useState(null);

  // Fetch club logo
  useEffect(() => {
    const fetchClubLogo = async () => {
      if (!selectedClubId) return;
      try {
        const clubData = await clubsAPI.getClub(selectedClubId);
        setClubLogoUrl(clubData?.logoUrl || null);
      } catch (error) {
        console.error('Error fetching club logo:', error);
      }
    };
    fetchClubLogo();
  }, [selectedClubId]);

  // Fetch tournaments (filter for rummy tournaments)
  const { data: tournamentsData, isLoading: tournamentsLoading } = useQuery({
    queryKey: ["rummy-tournaments", selectedClubId],
    queryFn: () => tournamentsAPI.getTournaments(selectedClubId),
    enabled: !!selectedClubId,
    select: (data) => {
      // API function already extracts tournaments array, so data should be an array
      const tournaments = Array.isArray(data) ? data : (data?.tournaments || []);
      // Filter for rummy tournaments - check if rummy_variant exists (not null/empty)
      return tournaments.filter(t => t && t.rummy_variant && t.rummy_variant !== null && t.rummy_variant !== '');
    }
  });

  // Fetch tournament details
  const { data: tournamentDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ["rummy-tournament-details", selectedClubId, selectedTournament?.id],
    queryFn: () => tournamentsAPI.getTournamentById(selectedClubId, selectedTournament.id),
    enabled: !!selectedClubId && !!selectedTournament && showDetailsModal,
  });

  // Fetch tournament players
  const { data: playersData, isLoading: playersLoading } = useQuery({
    queryKey: ["rummy-tournament-players", selectedClubId, selectedTournament?.id],
    queryFn: async () => {
      const response = await tournamentsAPI.getTournamentPlayers(selectedClubId, selectedTournament.id);
      return response?.players || response || [];
    },
    enabled: !!selectedClubId && !!selectedTournament && (showDetailsModal || showEndModal),
  });

  // Fetch tournament winners (if completed)
  const { data: winnersData } = useQuery({
    queryKey: ["rummy-tournament-winners", selectedClubId, selectedTournament?.id],
    queryFn: async () => {
      const response = await tournamentsAPI.getTournamentWinners(selectedClubId, selectedTournament.id);
      return response?.winners || response || [];
    },
    enabled: !!selectedClubId && !!selectedTournament && selectedTournament.status === "completed" && showDetailsModal,
  });

  // Update winnersForm when winners are loaded
  useEffect(() => {
    if (winnersData && winnersData.length > 0 && selectedTournament?.status === "completed") {
      setWinnersForm(winnersData.map(w => ({
        player_id: w.player_id || w.id,
        finishing_position: w.finishing_position,
        prize_amount: w.prize_amount || 0,
        name: w.name,
        email: w.email
      })));
    }
  }, [winnersData, selectedTournament?.status]);

  // Create tournament mutation
  const createMutation = useMutation({
    mutationFn: (data) => tournamentsAPI.createTournament(selectedClubId, {
      name: data.name,
      tournament_type: `Rummy - ${data.rummy_variant === 'Custom' ? data.custom_variant : data.rummy_variant}`,
      buy_in: parseFloat(data.entry_fee) || 0,
      entry_fee: parseFloat(data.entry_fee) || 0,
      starting_chips: 0, // Not applicable for rummy, but required field
      blind_structure: 'N/A', // Not applicable for rummy, but required field
      max_players: parseInt(data.max_players) || 6,
      start_time: data.start_time || null,
      payout_structure: data.payout_structure || 'Winner takes all',
      allow_reentry: data.allow_reentry || false,
      late_registration: parseInt(data.late_registration) || 60,
      break_duration: parseInt(data.break_duration) || 5,
      // Rummy-specific fields
      rummy_variant: data.rummy_variant === 'Custom' ? data.custom_variant : data.rummy_variant,
      number_of_deals: parseInt(data.number_of_deals) || null,
      points_per_deal: parseInt(data.points_per_deal) || null,
      drop_points: parseInt(data.drop_points) || null,
      max_points: parseInt(data.max_points) || null,
      deal_duration: parseInt(data.deal_duration) || null,
      prize_pool: parseFloat(data.prize_pool) || null,
      min_players: parseInt(data.min_players) || 2,
    }),
    onSuccess: () => {
      toast.success("Rummy tournament created successfully!");
      queryClient.invalidateQueries(["rummy-tournaments", selectedClubId]);
      setShowCreateModal(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create rummy tournament");
    },
  });

  // Update tournament mutation
  const updateMutation = useMutation({
    mutationFn: ({ tournamentId, data }) => tournamentsAPI.updateTournament(selectedClubId, tournamentId, {
      name: data.name,
      tournament_type: `Rummy - ${data.rummy_variant === 'Custom' ? data.custom_variant : data.rummy_variant}`,
      buy_in: parseFloat(data.entry_fee) || 0,
      entry_fee: parseFloat(data.entry_fee) || 0,
      max_players: parseInt(data.max_players) || 6,
      start_time: data.start_time || null,
      payout_structure: data.payout_structure || 'Winner takes all',
      allow_reentry: data.allow_reentry || false,
      late_registration: parseInt(data.late_registration) || 60,
      break_duration: parseInt(data.break_duration) || 5,
      // Rummy-specific fields
      rummy_variant: data.rummy_variant === 'Custom' ? data.custom_variant : data.rummy_variant,
      number_of_deals: parseInt(data.number_of_deals) || null,
      points_per_deal: parseInt(data.points_per_deal) || null,
      drop_points: parseInt(data.drop_points) || null,
      max_points: parseInt(data.max_points) || null,
      deal_duration: parseInt(data.deal_duration) || null,
      prize_pool: parseFloat(data.prize_pool) || null,
      min_players: parseInt(data.min_players) || 2,
    }),
    onSuccess: () => {
      toast.success("Rummy tournament updated successfully!");
      queryClient.invalidateQueries(["rummy-tournaments", selectedClubId]);
      setShowDetailsModal(false);
      setSelectedTournament(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update rummy tournament");
    },
  });

  // Start tournament mutation
  const startMutation = useMutation({
    mutationFn: (tournamentId) => tournamentsAPI.startTournament(selectedClubId, tournamentId),
    onSuccess: () => {
      toast.success("Rummy tournament started!");
      queryClient.invalidateQueries(["rummy-tournaments", selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to start tournament");
    },
  });

  // End tournament mutation
  const endMutation = useMutation({
    mutationFn: (data) => tournamentsAPI.endTournament(selectedClubId, selectedTournament.id, data),
    onSuccess: () => {
      toast.success("Rummy tournament ended successfully!");
      queryClient.invalidateQueries(["rummy-tournaments", selectedClubId]);
      queryClient.invalidateQueries(["rummy-tournament-winners", selectedClubId, selectedTournament.id]);
      setShowEndModal(false);
      // Keep details modal open but refresh tournament data
      queryClient.invalidateQueries(["rummy-tournament-details", selectedClubId, selectedTournament.id]);
      // Reload tournament to get updated status
      setTimeout(() => {
        queryClient.invalidateQueries(["rummy-tournaments", selectedClubId]);
      }, 500);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to end tournament");
    },
  });

  // Delete tournament mutation
  const deleteMutation = useMutation({
    mutationFn: (tournamentId) => tournamentsAPI.deleteTournament(selectedClubId, tournamentId),
    onSuccess: () => {
      toast.success("Rummy tournament deleted successfully!");
      queryClient.invalidateQueries(["rummy-tournaments", selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete tournament");
    },
  });

  const resetForm = () => {
    setTournamentForm({
      name: "",
      rummy_variant: "Points Rummy",
      custom_variant: "",
      entry_fee: "",
      prize_pool: "",
      number_of_deals: 1,
      points_per_deal: 0,
      drop_points: 20,
      max_points: 80,
      min_players: 2,
      max_players: 6,
      start_time: "",
      deal_duration: 5,
      break_duration: 5,
      payout_structure: "Winner takes all",
      allow_reentry: false,
      late_registration: 60,
    });
  };

  const handleCreateTournament = () => {
    if (!tournamentForm.name || !tournamentForm.entry_fee) {
      toast.error("Please fill in all required fields");
      return;
    }

    createMutation.mutate(tournamentForm);
  };

  const handleStartTournament = (tournamentId) => {
    if (window.confirm("Are you sure you want to start this rummy tournament?")) {
      startMutation.mutate(tournamentId);
    }
  };

  const handleEditTournament = (tournament) => {
    setEditingTournament(tournament);
    setTournamentForm({
      name: tournament.name || "",
      rummy_variant: tournament.rummy_variant || "Points Rummy",
      custom_variant: tournament.custom_variant || "",
      entry_fee: tournament.entry_fee?.toString() || tournament.buy_in?.toString() || "",
      prize_pool: tournament.prize_pool?.toString() || "",
      number_of_deals: tournament.number_of_deals || 1,
      points_per_deal: tournament.points_per_deal?.toString() || "0",
      drop_points: tournament.drop_points?.toString() || "20",
      max_points: tournament.max_points?.toString() || "80",
      min_players: tournament.min_players || 2,
      max_players: tournament.max_players || 6,
      start_time: tournament.start_time ? new Date(tournament.start_time).toISOString().slice(0, 16) : "",
      deal_duration: tournament.deal_duration || 5,
      break_duration: tournament.break_duration || 5,
      payout_structure: tournament.payout_structure || "Winner takes all",
      allow_reentry: tournament.allow_reentry || false,
      late_registration: tournament.late_registration || 60,
    });
    setShowEditModal(true);
  };

  const handleUpdateTournament = () => {
    if (!tournamentForm.name || !tournamentForm.entry_fee) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Convert string values to proper types for DTO validation (same as create)
    const tournamentData = {
      name: tournamentForm.name,
      tournament_type: `Rummy - ${tournamentForm.rummy_variant === 'Custom' ? tournamentForm.custom_variant : tournamentForm.rummy_variant}`,
      buy_in: parseFloat(tournamentForm.entry_fee) || 0,
      entry_fee: parseFloat(tournamentForm.entry_fee) || 0,
      max_players: parseInt(tournamentForm.max_players) || 6,
      min_players: parseInt(tournamentForm.min_players) || 2,
      start_time: tournamentForm.start_time || undefined,
      prize_pool: tournamentForm.prize_pool ? parseFloat(tournamentForm.prize_pool) : undefined,
      payout_structure: tournamentForm.payout_structure || 'Winner takes all',
      allow_reentry: Boolean(tournamentForm.allow_reentry),
      late_registration: parseInt(tournamentForm.late_registration) || 60,
      // Rummy-specific fields
      rummy_variant: tournamentForm.rummy_variant,
      custom_variant: tournamentForm.rummy_variant === 'Custom' ? tournamentForm.custom_variant : undefined,
      number_of_deals: parseInt(tournamentForm.number_of_deals) || 1,
      points_per_deal: parseFloat(tournamentForm.points_per_deal) || 0,
      drop_points: parseFloat(tournamentForm.drop_points) || 20,
      max_points: parseFloat(tournamentForm.max_points) || 80,
      deal_duration: parseInt(tournamentForm.deal_duration) || 5,
      break_duration: parseInt(tournamentForm.break_duration) || 5,
    };

    updateMutation.mutate({
      tournamentId: editingTournament.id,
      data: tournamentData,
    });
  };

  const addWinner = () => {
    setWinnersForm([
      ...winnersForm,
      { player_id: "", finishing_position: winnersForm.length + 1, prize_amount: "" },
    ]);
  };

  const removeWinner = (index) => {
    setWinnersForm(winnersForm.filter((_, i) => i !== index));
  };

  const updateWinner = (index, field, value) => {
    const updated = [...winnersForm];
    updated[index][field] = value;
    setWinnersForm(updated);
  };

  const handleEndTournament = () => {
    if (winnersForm.length === 0) {
      toast.error("Please add at least one winner");
      return;
    }

    // Validate all winners have player_id and prize_amount
    const isValid = winnersForm.every(
      (w) => w.player_id && w.prize_amount && w.prize_amount > 0
    );
    if (!isValid) {
      toast.error("Please fill in all winner details (player and prize amount)");
      return;
    }

    endMutation.mutate({ winners: winnersForm });
  };

  // Handle both array and object response formats
  const tournaments = Array.isArray(tournamentsData) 
    ? tournamentsData 
    : (tournamentsData?.tournaments || []);

  return (
    <div className="text-white space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Rummy Tournaments</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium"
        >
          + Create Rummy Tournament
        </button>
      </div>

      {/* Tournaments List */}
      {tournamentsLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p>Loading rummy tournaments...</p>
        </div>
      ) : tournaments.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center">
          <p className="text-gray-400 mb-4">No rummy tournaments found</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg"
          >
            Create First Rummy Tournament
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-emerald-500 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-white">{tournament.name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  tournament.status === 'active' ? 'bg-green-500/20 text-green-300' :
                  tournament.status === 'completed' ? 'bg-gray-500/20 text-gray-300' :
                  'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {tournament.status}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Variant: {tournament.tournament_type || tournament.rummy_variant || 'N/A'}</p>
                <p>Entry Fee: ₹{tournament.entry_fee || tournament.buy_in || '0'}</p>
                <p>Max Players: {tournament.max_players || 'N/A'}</p>
                {tournament.start_time && (
                  <p>Start: {new Date(tournament.start_time).toLocaleString()}</p>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTournament(tournament);
                    setShowDetailsModal(true);
                    setViewMode("details");
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm"
                >
                  View Details
                </button>
                {tournament.status === 'scheduled' && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTournament(tournament);
                      }}
                      className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded text-sm"
                    >
                      Edit
                    </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartTournament(tournament.id);
                    }}
                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm"
                  >
                    Start
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("Delete this tournament?")) {
                        deleteMutation.mutate(tournament.id);
                      }
                    }}
                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded text-sm"
                  >
                    Delete
                  </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Tournament Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-slate-800 rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-slate-700" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6">Create Rummy Tournament</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tournament Name *</label>
                <input
                  type="text"
                  value={tournamentForm.name}
                  onChange={(e) => setTournamentForm({...tournamentForm, name: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="e.g., Weekend Rummy Championship"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rummy Variant *</label>
                <select
                  value={tournamentForm.rummy_variant}
                  onChange={(e) => setTournamentForm({...tournamentForm, rummy_variant: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                >
                  {rummyVariants.map(variant => (
                    <option key={variant} value={variant}>{variant}</option>
                  ))}
                </select>
              </div>

              {tournamentForm.rummy_variant === 'Custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Custom Variant Name</label>
                  <input
                    type="text"
                    value={tournamentForm.custom_variant}
                    onChange={(e) => setTournamentForm({...tournamentForm, custom_variant: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="Enter custom variant name"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Entry Fee (₹) *</label>
                  <input
                    type="number"
                    value={tournamentForm.entry_fee}
                    onChange={(e) => setTournamentForm({...tournamentForm, entry_fee: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Prize Pool (₹)</label>
                  <input
                    type="number"
                    value={tournamentForm.prize_pool}
                    onChange={(e) => setTournamentForm({...tournamentForm, prize_pool: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              {(tournamentForm.rummy_variant.includes('Points') || tournamentForm.rummy_variant === 'Custom') && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Drop Points</label>
                      <input
                        type="number"
                        value={tournamentForm.drop_points}
                        onChange={(e) => setTournamentForm({...tournamentForm, drop_points: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Max Points</label>
                      <input
                        type="number"
                        value={tournamentForm.max_points}
                        onChange={(e) => setTournamentForm({...tournamentForm, max_points: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Points Per Deal</label>
                    <input
                      type="number"
                      value={tournamentForm.points_per_deal}
                      onChange={(e) => setTournamentForm({...tournamentForm, points_per_deal: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      min="0"
                    />
                  </div>
                </>
              )}

              {tournamentForm.rummy_variant === 'Deals Rummy' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Number of Deals</label>
                  <input
                    type="number"
                    value={tournamentForm.number_of_deals}
                    onChange={(e) => setTournamentForm({...tournamentForm, number_of_deals: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    min="1"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Min Players</label>
                  <input
                    type="number"
                    value={tournamentForm.min_players}
                    onChange={(e) => setTournamentForm({...tournamentForm, min_players: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    min="2"
                    max="6"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Players</label>
                  <input
                    type="number"
                    value={tournamentForm.max_players}
                    onChange={(e) => setTournamentForm({...tournamentForm, max_players: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    min="2"
                    max="6"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Deal Duration (minutes)</label>
                  <input
                    type="number"
                    value={tournamentForm.deal_duration}
                    onChange={(e) => setTournamentForm({...tournamentForm, deal_duration: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Break Duration (minutes)</label>
                  <input
                    type="number"
                    value={tournamentForm.break_duration}
                    onChange={(e) => setTournamentForm({...tournamentForm, break_duration: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                <input
                  type="datetime-local"
                  value={tournamentForm.start_time}
                  onChange={(e) => setTournamentForm({...tournamentForm, start_time: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Payout Structure</label>
                <select
                  value={tournamentForm.payout_structure}
                  onChange={(e) => setTournamentForm({...tournamentForm, payout_structure: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                >
                  <option value="Winner takes all">Winner takes all</option>
                  <option value="Top 2">Top 2</option>
                  <option value="Top 3">Top 3</option>
                  <option value="Top 50%">Top 50%</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allow_reentry"
                  checked={tournamentForm.allow_reentry}
                  onChange={(e) => setTournamentForm({...tournamentForm, allow_reentry: e.target.checked})}
                  className="w-4 h-4"
                />
                <label htmlFor="allow_reentry" className="text-sm text-gray-300">Allow Re-entry</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Late Registration (minutes)</label>
                <input
                  type="number"
                  value={tournamentForm.late_registration}
                  onChange={(e) => setTournamentForm({...tournamentForm, late_registration: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTournament}
                disabled={createMutation.isLoading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg disabled:opacity-50"
              >
                {createMutation.isLoading ? 'Creating...' : 'Create Tournament'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Tournament Modal - Same form structure as Create */}
      {showEditModal && editingTournament && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => {
          setShowEditModal(false);
          setEditingTournament(null);
          resetForm();
        }}>
          <div className="bg-slate-800 rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-purple-700" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6">Edit Rummy Tournament: {editingTournament.name}</h2>
            
            {/* Reuse the exact same form structure from Create Modal */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tournament Name *</label>
                <input
                  type="text"
                  value={tournamentForm.name}
                  onChange={(e) => setTournamentForm({...tournamentForm, name: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rummy Variant *</label>
                <select
                  value={tournamentForm.rummy_variant}
                  onChange={(e) => setTournamentForm({...tournamentForm, rummy_variant: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                >
                  {rummyVariants.map((variant) => (
                    <option key={variant} value={variant}>{variant}</option>
                  ))}
                </select>
              </div>

              {tournamentForm.rummy_variant === 'Custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Custom Variant</label>
                  <input
                    type="text"
                    value={tournamentForm.custom_variant}
                    onChange={(e) => setTournamentForm({...tournamentForm, custom_variant: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Entry Fee (₹) *</label>
                  <input
                    type="number"
                    value={tournamentForm.entry_fee}
                    onChange={(e) => setTournamentForm({...tournamentForm, entry_fee: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Prize Pool (₹)</label>
                  <input
                    type="number"
                    value={tournamentForm.prize_pool}
                    onChange={(e) => setTournamentForm({...tournamentForm, prize_pool: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Min Players</label>
                  <input
                    type="number"
                    value={tournamentForm.min_players}
                    onChange={(e) => setTournamentForm({...tournamentForm, min_players: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    min="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Players</label>
                  <input
                    type="number"
                    value={tournamentForm.max_players}
                    onChange={(e) => setTournamentForm({...tournamentForm, max_players: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    min="2"
                  />
                </div>
              </div>

              {tournamentForm.rummy_variant === 'Points Rummy' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Points Per Deal</label>
                    <input
                      type="number"
                      value={tournamentForm.points_per_deal}
                      onChange={(e) => setTournamentForm({...tournamentForm, points_per_deal: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Drop Points</label>
                      <input
                        type="number"
                        value={tournamentForm.drop_points}
                        onChange={(e) => setTournamentForm({...tournamentForm, drop_points: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Max Points</label>
                      <input
                        type="number"
                        value={tournamentForm.max_points}
                        onChange={(e) => setTournamentForm({...tournamentForm, max_points: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      />
                    </div>
                  </div>
                </>
              )}

              {tournamentForm.rummy_variant === 'Deals Rummy' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Number of Deals</label>
                  <input
                    type="number"
                    value={tournamentForm.number_of_deals}
                    onChange={(e) => setTournamentForm({...tournamentForm, number_of_deals: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    min="1"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Deal Duration (minutes)</label>
                  <input
                    type="number"
                    value={tournamentForm.deal_duration}
                    onChange={(e) => setTournamentForm({...tournamentForm, deal_duration: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Break Duration (minutes)</label>
                  <input
                    type="number"
                    value={tournamentForm.break_duration}
                    onChange={(e) => setTournamentForm({...tournamentForm, break_duration: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                <input
                  type="datetime-local"
                  value={tournamentForm.start_time}
                  onChange={(e) => setTournamentForm({...tournamentForm, start_time: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Payout Structure</label>
                <select
                  value={tournamentForm.payout_structure}
                  onChange={(e) => setTournamentForm({...tournamentForm, payout_structure: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                >
                  <option value="Winner takes all">Winner takes all</option>
                  <option value="Top 2">Top 2</option>
                  <option value="Top 3">Top 3</option>
                  <option value="Top 50%">Top 50%</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit_allow_reentry"
                  checked={tournamentForm.allow_reentry}
                  onChange={(e) => setTournamentForm({...tournamentForm, allow_reentry: e.target.checked})}
                  className="w-4 h-4"
                />
                <label htmlFor="edit_allow_reentry" className="text-sm text-gray-300">Allow Re-entry</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Late Registration (minutes)</label>
                <input
                  type="number"
                  value={tournamentForm.late_registration}
                  onChange={(e) => setTournamentForm({...tournamentForm, late_registration: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTournament(null);
                  resetForm();
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTournament}
                disabled={updateMutation.isLoading}
                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg disabled:opacity-50"
              >
                {updateMutation.isLoading ? 'Updating...' : 'Update Tournament'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tournament Details Modal */}
      {showDetailsModal && selectedTournament && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl p-6 max-w-6xl w-full border border-emerald-600 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{selectedTournament.name}</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedTournament(null);
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-slate-700">
              <button
                onClick={() => setViewMode("details")}
                className={`px-4 py-2 font-semibold transition-colors ${
                  viewMode === "details"
                    ? "text-emerald-400 border-b-2 border-emerald-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Details
              </button>
              {selectedTournament.status !== "completed" && (
                <button
                  onClick={() => setViewMode("players")}
                  className={`px-4 py-2 font-semibold transition-colors ${
                    viewMode === "players"
                      ? "text-emerald-400 border-b-2 border-emerald-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Players ({playersData?.length || 0})
                </button>
              )}
            </div>

            {/* Details View - Show winners only if completed, otherwise show table hologram */}
            {viewMode === "details" && selectedTournament.status === "completed" ? (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white mb-4">Tournament Winners</h3>
                {winnersForm.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No winners recorded</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Position</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Player ID</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Name</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Email</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Prize Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {winnersForm.map((winner, index) => (
                          <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                            <td className="py-3 px-4">
                              <span className="inline-block w-8 h-8 rounded-full bg-yellow-500 text-slate-900 font-bold flex items-center justify-center">
                                {winner.finishing_position}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-white font-mono">{winner.player_id}</td>
                            <td className="py-3 px-4 text-white">{winner.name || 'N/A'}</td>
                            <td className="py-3 px-4 text-white">{winner.email || 'N/A'}</td>
                            <td className="py-3 px-4 text-emerald-400 font-semibold">
                              ₹{winner.prize_amount ? parseFloat(winner.prize_amount).toLocaleString() : '0'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : viewMode === "details" && (
              <div className="space-y-6">
                {/* Table Hologram Visualization */}
                <div className="relative w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-8 border border-slate-700">
                  {/* Prize Pool - Top of Table */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-br from-yellow-600 via-amber-500 to-orange-500 border-2 border-yellow-400/80 px-6 py-3 rounded-lg text-center shadow-xl">
                      <div className="text-yellow-200 text-xs font-semibold uppercase tracking-wider">
                        Prize Pool
                      </div>
                      <div className="text-white text-2xl font-bold">
                        ₹{selectedTournament.prize_pool ? parseFloat(selectedTournament.prize_pool).toLocaleString() : '0'}
                      </div>
                    </div>
                  </div>

                  {/* Rummy Table - Round Shape */}
                  <div className="relative aspect-[1/1] max-w-md mx-auto mt-16 mb-8">
                    {/* Table Background with Golden Border */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-600 p-3 shadow-2xl">
                      {/* Green Felt Surface */}
                      <div className="absolute inset-3 rounded-full bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 shadow-inner">
                        {/* Seats arranged in circle */}
                        {Array.from(
                          { length: selectedTournament.max_players || 6 },
                          (_, index) => {
                            const seatNumber = index + 1;
                            const angle = (360 / (selectedTournament.max_players || 6)) * (index) - 90;
                            const radius = 38;
                            const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
                            const y = 50 + radius * Math.sin((angle * Math.PI) / 180);

                            return (
                              <div
                                key={seatNumber}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                                style={{ left: `${x}%`, top: `${y}%` }}
                              >
                                {/* Seat Circle */}
                                <div className="w-12 h-12 rounded-full border-2 border-slate-500 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg">
                                  <span className="text-slate-400 text-xs font-bold">{seatNumber}</span>
                                </div>
                                {/* Seat Label */}
                                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-center">
                                  <div className="text-xs text-slate-300 font-medium">
                                    Seat {seatNumber}
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )}

                        {/* Center Logo Area */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            {/* Club Logo */}
                            <div className="w-32 h-32 bg-white/10 rounded-full border-2 border-white/20 flex items-center justify-center shadow-xl backdrop-blur-sm overflow-hidden">
                              {clubLogoUrl ? (
                                <img
                                  src={clubLogoUrl}
                                  alt="Club Logo"
                                  className="w-full h-full object-contain rounded-full p-2"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    const fallback = e.target.nextElementSibling;
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className="text-4xl font-bold text-white/30 hidden items-center justify-center w-full h-full">
                                🎴
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tournament Info Below Table */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
                      <div className="text-slate-400 text-xs mb-1">Variant</div>
                      <div className="text-white font-semibold text-sm">{selectedTournament.rummy_variant || 'N/A'}</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
                      <div className="text-slate-400 text-xs mb-1">Entry Fee</div>
                      <div className="text-white font-semibold text-sm">₹{selectedTournament.entry_fee || selectedTournament.buy_in || '0'}</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
                      <div className="text-slate-400 text-xs mb-1">Players</div>
                      <div className="text-white font-semibold text-sm">{playersData?.length || 0}/{selectedTournament.max_players || 'N/A'}</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
                      <div className="text-slate-400 text-xs mb-1">Status</div>
                      <div className="text-white font-semibold text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          selectedTournament.status === 'active' ? 'bg-green-500/20 text-green-300' :
                          selectedTournament.status === 'completed' ? 'bg-gray-500/20 text-gray-300' :
                          'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {selectedTournament.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-400">Tournament ID</p>
                      <p className="text-white font-mono">{selectedTournament.id?.substring(0, 8) || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Start Time</p>
                      <p className="text-white">
                        {selectedTournament.start_time
                          ? new Date(selectedTournament.start_time).toLocaleString()
                          : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Min Players</p>
                      <p className="text-white">{selectedTournament.min_players || '2'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Drop Points</p>
                      <p className="text-white">{selectedTournament.drop_points || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Max Points</p>
                      <p className="text-white">{selectedTournament.max_points || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-400">Number of Deals</p>
                      <p className="text-white">{selectedTournament.number_of_deals || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Points Per Deal</p>
                      <p className="text-white">{selectedTournament.points_per_deal || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Deal Duration</p>
                      <p className="text-white">{selectedTournament.deal_duration ? `${selectedTournament.deal_duration} minutes` : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Payout Structure</p>
                      <p className="text-white">{selectedTournament.payout_structure || 'Winner takes all'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Allow Re-entry</p>
                      <p className="text-white">{selectedTournament.allow_reentry ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Players View */}
            {viewMode === "players" && (
              <div className="space-y-4">
                {playersLoading ? (
                  <div className="text-white text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                    <p>Loading players...</p>
                  </div>
                ) : !playersData || playersData.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No players registered yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Player ID</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Name</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Email</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Mobile</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Registered At</th>
                          {selectedTournament.status === "completed" && (
                            <>
                              <th className="text-left py-3 px-4 text-gray-400 font-semibold">Position</th>
                              <th className="text-left py-3 px-4 text-gray-400 font-semibold">Prize</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {playersData.map((player) => (
                          <tr key={player.id || player.player_id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                            <td className="py-3 px-4 text-white font-mono">{player.player_id || player.id}</td>
                            <td className="py-3 px-4 text-white">{player.name || 'N/A'}</td>
                            <td className="py-3 px-4 text-white">{player.email || 'N/A'}</td>
                            <td className="py-3 px-4 text-white">{player.mobile || 'N/A'}</td>
                            <td className="py-3 px-4 text-white">
                              {player.registered_at
                                ? new Date(player.registered_at).toLocaleString()
                                : "-"}
                            </td>
                            {selectedTournament.status === "completed" && (
                              <>
                                <td className="py-3 px-4 text-white">
                                  {player.finishing_position || "-"}
                                </td>
                                <td className="py-3 px-4 text-white">
                                  {player.prize_amount ? `₹${player.prize_amount}` : "-"}
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Winners View */}
            {viewMode === "winners" && selectedTournament.status === "completed" && (
              <div className="space-y-4">
                {winnersForm.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No winners recorded</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Position</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Player ID</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Name</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Email</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Prize Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {winnersForm.map((winner, index) => (
                          <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                            <td className="py-3 px-4">
                              <span className="inline-block w-8 h-8 rounded-full bg-yellow-500 text-slate-900 font-bold flex items-center justify-center">
                                {winner.finishing_position}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-white font-mono">{winner.player_id}</td>
                            <td className="py-3 px-4 text-white">{winner.name}</td>
                            <td className="py-3 px-4 text-white">{winner.email || 'N/A'}</td>
                            <td className="py-3 px-4 text-emerald-400 font-semibold">
                              ₹{winner.prize_amount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex gap-4 pt-4 border-t border-slate-700">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedTournament(null);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg"
              >
                Close
              </button>
              {selectedTournament.status === 'scheduled' && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDetailsModal(false);
                      handleEditTournament(selectedTournament);
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg"
                  >
                    Edit Tournament
                  </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartTournament(selectedTournament.id);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg"
                >
                  Start Tournament
                </button>
                </>
              )}
              {selectedTournament.status === 'active' && (
                <button
                  onClick={() => {
                    // Initialize winners form with first position if empty
                    if (winnersForm.length === 0) {
                      setWinnersForm([{ player_id: "", finishing_position: 1, prize_amount: "" }]);
                    }
                    setShowEndModal(true);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg"
                >
                  End Tournament
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* End Tournament Modal */}
      {showEndModal && selectedTournament && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl p-6 max-w-4xl w-full border border-orange-600 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">
              End Tournament: {selectedTournament.name}
            </h2>

            <p className="text-gray-300 mb-4">
              Select players and assign prize amounts. Player balances will be automatically updated.
            </p>

            <div className="space-y-4 mb-6">
              {winnersForm.map((winner, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-center bg-slate-700/50 p-4 rounded-lg">
                  <div className="col-span-1">
                    <div className="w-10 h-10 rounded-full bg-yellow-500 text-slate-900 font-bold flex items-center justify-center">
                      {winner.finishing_position}
                    </div>
                  </div>
                  <div className="col-span-5">
                    <select
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                      value={winner.player_id}
                      onChange={(e) => updateWinner(index, "player_id", e.target.value)}
                    >
                      <option value="">Select Player</option>
                      {playersData?.map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name} ({player.player_id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                      placeholder="Position"
                      value={winner.finishing_position}
                      onChange={(e) =>
                        updateWinner(index, "finishing_position", parseInt(e.target.value) || 1)
                      }
                      min="1"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                      placeholder="Prize Amount (₹)"
                      value={winner.prize_amount}
                      onChange={(e) => updateWinner(index, "prize_amount", parseFloat(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      onClick={() => removeWinner(index)}
                      className="w-full bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addWinner}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors mb-6"
            >
              + Add Winner
            </button>

            <div className="flex gap-3">
              <button
                onClick={handleEndTournament}
                disabled={endMutation.isLoading}
                className="flex-1 bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {endMutation.isLoading ? "Ending Tournament..." : "End Tournament & Update Balances"}
              </button>
              <button
                onClick={() => {
                  setShowEndModal(false);
                  setWinnersForm([]);
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

