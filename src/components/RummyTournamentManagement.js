import React, { useState, useEffect, useCallback } from "react";
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
  const [showExitPlayerModal, setShowExitPlayerModal] = useState(false);
  const [exitingPlayer, setExitingPlayer] = useState(null);
  const [exitBalance, setExitBalance] = useState("");
  const [exitNotes, setExitNotes] = useState("");
  const [sessionElapsed, setSessionElapsed] = useState(0);

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
    refetchInterval: selectedTournament?.status === 'active' ? 10000 : false,
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

  // Exit player mutation
  const exitPlayerMutation = useMutation({
    mutationFn: (data) => tournamentsAPI.exitTournamentPlayer(selectedClubId, selectedTournament.id, data),
    onSuccess: (result) => {
      toast.success(result.message || "Player exited successfully!");
      queryClient.invalidateQueries(["rummy-tournament-players", selectedClubId, selectedTournament?.id]);
      queryClient.invalidateQueries(["rummy-tournaments", selectedClubId]);
      setShowExitPlayerModal(false);
      setExitingPlayer(null);
      setExitBalance("");
      setExitNotes("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to exit player");
    },
  });

  // Session timer for active tournaments (accounts for paused time)
  useEffect(() => {
    const tourney = tournamentDetails || selectedTournament;
    if (!tourney?.session_started_at || tourney?.status !== 'active') {
      setSessionElapsed(0);
      return;
    }
    const startTime = new Date(tourney.session_started_at).getTime();
    const totalPausedSeconds = parseInt(tourney.total_paused_seconds) || 0;
    const isPaused = !!tourney.paused_at;
    const pausedAtTime = tourney.paused_at ? new Date(tourney.paused_at).getTime() : null;

    const updateElapsed = () => {
      const now = Date.now();
      if (isPaused && pausedAtTime) {
        const elapsedUntilPause = Math.floor((pausedAtTime - startTime) / 1000);
        setSessionElapsed(elapsedUntilPause - totalPausedSeconds);
      } else {
        const totalRawSeconds = Math.floor((now - startTime) / 1000);
        setSessionElapsed(totalRawSeconds - totalPausedSeconds);
      }
    };
    updateElapsed();
    const interval = isPaused ? null : setInterval(updateElapsed, 1000);
    return () => { if (interval) clearInterval(interval); };
  }, [tournamentDetails, selectedTournament]);

  const formatSessionTime = useCallback((totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const handlePauseTournament = () => {
    if (window.confirm("Pause the tournament session? The timer will be frozen.")) {
      pauseMutation.mutate();
    }
  };

  const handleResumeTournament = () => {
    resumeMutation.mutate();
  };

  const handleStopTournament = () => {
    if (window.confirm("Force STOP this tournament? This will end the tournament without declaring winners. This action cannot be undone.")) {
      stopMutation.mutate();
    }
  };

  const handleExitPlayer = (player) => {
    setExitingPlayer(player);
    setExitBalance("");
    setExitNotes("");
    setShowExitPlayerModal(true);
  };

  const handleConfirmExitPlayer = () => {
    if (!exitingPlayer) return;
    exitPlayerMutation.mutate({
      playerId: exitingPlayer.id,
      exitBalance: exitBalance ? Number(exitBalance) : 0,
      notes: exitNotes || undefined,
    });
  };

  // Rebuy / Re-entry mutation
  const rebuyMutation = useMutation({
    mutationFn: (data) => tournamentsAPI.rebuyTournamentPlayer(selectedClubId, selectedTournament.id, data),
    onSuccess: (result) => {
      toast.success(result.message || "Rebuy successful!");
      queryClient.invalidateQueries(["rummy-tournament-players", selectedClubId, selectedTournament?.id]);
      queryClient.invalidateQueries(["rummy-tournaments", selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to process rebuy");
    },
  });

  // Pause tournament mutation
  const pauseMutation = useMutation({
    mutationFn: () => tournamentsAPI.pauseTournament(selectedClubId, selectedTournament.id),
    onSuccess: (result) => {
      toast.success("Tournament paused!");
      queryClient.invalidateQueries(["rummy-tournaments", selectedClubId]);
      queryClient.invalidateQueries(["rummy-tournament-details", selectedClubId, selectedTournament?.id]);
      if (result?.tournament) {
        setSelectedTournament(prev => ({ ...prev, ...result.tournament }));
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to pause tournament");
    },
  });

  // Resume tournament mutation
  const resumeMutation = useMutation({
    mutationFn: () => tournamentsAPI.resumeTournament(selectedClubId, selectedTournament.id),
    onSuccess: (result) => {
      toast.success("Tournament resumed!");
      queryClient.invalidateQueries(["rummy-tournaments", selectedClubId]);
      queryClient.invalidateQueries(["rummy-tournament-details", selectedClubId, selectedTournament?.id]);
      if (result?.tournament) {
        setSelectedTournament(prev => ({ ...prev, ...result.tournament }));
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to resume tournament");
    },
  });

  // Stop tournament mutation (force end without winners)
  const stopMutation = useMutation({
    mutationFn: () => tournamentsAPI.stopTournament(selectedClubId, selectedTournament.id),
    onSuccess: () => {
      toast.success("Tournament stopped!");
      queryClient.invalidateQueries(["rummy-tournaments", selectedClubId]);
      queryClient.invalidateQueries(["rummy-tournament-details", selectedClubId, selectedTournament?.id]);
      setShowDetailsModal(false);
      setSelectedTournament(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to stop tournament");
    },
  });

  const handleRebuy = (player, type = 'rebuy') => {
    const actionLabel = type === 'rebuy' ? 'Rebuy' : type === 'reentry' ? 'Re-enter' : 'Add-on';
    const tourney = liveTournament || selectedTournament;
    const buyIn = parseFloat(tourney?.buy_in || 0);
    if (window.confirm(`${actionLabel} for ${player.name}? This will charge ₹${buyIn} buy-in.`)) {
      rebuyMutation.mutate({ playerId: player.id, type });
    }
  };

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

  // Use tournamentDetails for live data (includes session_started_at)
  const liveTournament = tournamentDetails || selectedTournament;

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
                  {tournament.status === 'active' && tournament.session_started_at && (
                    <div className="flex items-center gap-1.5 mt-2">
                      {tournament.paused_at ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          <span className="text-yellow-400 text-xs font-medium">Session Paused</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="text-green-400 text-xs font-medium">Session Running</span>
                        </>
                      )}
                    </div>
                  )}
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
                {tournament.status === 'active' && (
                  <>
                    {tournament.paused_at ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTournament(tournament);
                          resumeMutation.mutate();
                        }}
                        className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded text-sm"
                      >
                        ▶ Resume
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTournament(tournament);
                          pauseMutation.mutate();
                        }}
                        className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-2 rounded text-sm"
                      >
                        ⏸ Pause
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTournament(tournament);
                        setShowEndModal(true);
                      }}
                      className="flex-1 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded text-sm"
                    >
                      End
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
                {/* Rummy Table Visualization */}
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

                  {/* Rummy Table - Standard Round Shape */}
                  <div className="relative aspect-[1/1] max-w-md mx-auto mt-16 mb-8">
                    {/* Outer Rail - Dark Wood */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-900 via-yellow-900 to-amber-950 shadow-2xl">
                      {/* Padding Rail */}
                      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-700 via-amber-600 to-amber-700">
                        {/* Green Felt Surface */}
                        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-700 via-green-800 to-emerald-900 shadow-inner flex items-center justify-center">
                          {/* Subtle felt pattern ring */}
                          <div className="absolute inset-6 rounded-full border border-emerald-600/30"></div>
                          {/* Center Logo */}
                          <div className="w-28 h-28 bg-white/10 rounded-full border-2 border-white/20 flex items-center justify-center shadow-xl backdrop-blur-sm overflow-hidden z-10">
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
                            <div className={`text-4xl font-bold text-white/30 ${clubLogoUrl ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                              🎴
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Session Timer for Active Tournament */}
                  {liveTournament?.status === 'active' && liveTournament?.session_started_at && (
                    (() => {
                      const isPaused = !!liveTournament?.paused_at;
                      return (
                        <div className={`mt-6 ${isPaused ? 'bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-yellow-500/30' : 'bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-green-500/30'} border rounded-xl p-4`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`}></div>
                              <span className={`${isPaused ? 'text-yellow-400' : 'text-green-400'} text-sm font-medium uppercase tracking-wider`}>
                                {isPaused ? 'PAUSED' : 'LIVE'}
                              </span>
                            </div>
                            <div className={`text-4xl font-mono font-bold ${isPaused ? 'text-yellow-300' : 'text-green-300'} tabular-nums`}>
                              {formatSessionTime(sessionElapsed)}
                            </div>
                            <div className="flex items-center gap-2">
                              {isPaused ? (
                                <button onClick={handleResumeTournament} disabled={resumeMutation.isLoading} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">▶ Resume</button>
                              ) : (
                                <button onClick={handlePauseTournament} disabled={pauseMutation.isLoading} className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">⏸ Pause</button>
                              )}
                              <button onClick={handleStopTournament} disabled={stopMutation.isLoading} className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">⏹ Stop</button>
                            </div>
                          </div>
                          {isPaused && (
                            <div className="mt-2 text-yellow-400/70 text-xs text-center">
                              Tournament paused since {new Date(liveTournament.paused_at).toLocaleTimeString('en-US', { hour12: true })}
                            </div>
                          )}
                        </div>
                      );
                    })()
                  )}

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

                {/* All Tournament Details */}
                {(() => {
                  const t = liveTournament || selectedTournament;
                  const detailRows = [
                    { label: 'Tournament ID', value: t.id?.substring(0, 8), mono: true },
                    { label: 'Rummy Variant', value: t.rummy_variant },
                    { label: 'Tournament Type', value: t.tournament_type },
                    { label: 'Entry Fee / Buy-In', value: (t.entry_fee || t.buy_in) ? `₹${Number(t.entry_fee || t.buy_in).toLocaleString()}` : null },
                    { label: 'Prize Pool', value: t.prize_pool ? `₹${Number(t.prize_pool).toLocaleString()}` : null },
                    { label: 'Min Players', value: t.min_players },
                    { label: 'Max Players', value: t.max_players },
                    { label: 'Number of Deals', value: t.number_of_deals },
                    { label: 'Points Per Deal', value: t.points_per_deal },
                    { label: 'Drop Points', value: t.drop_points },
                    { label: 'Max Points', value: t.max_points },
                    { label: 'Deal Duration', value: t.deal_duration ? `${t.deal_duration} min` : null },
                    { label: 'Break Duration', value: t.break_duration ? `${t.break_duration} min` : null },
                    { label: 'Late Registration', value: t.late_registration ? `${t.late_registration} min` : null },
                    { label: 'Payout Structure', value: t.payout_structure },
                    { label: 'Allow Re-entry', value: t.allow_reentry ? 'Yes' : 'No', badge: true, positive: !!t.allow_reentry },
                    { label: 'Start Time', value: t.start_time ? new Date(t.start_time).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', hour12: true }) : null },
                    { label: 'Session Started', value: t.session_started_at ? new Date(t.session_started_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', hour12: true }) : null },
                  ].filter(r => r.value !== null && r.value !== undefined && r.value !== '' && r.value !== 0);
                  
                  const half = Math.ceil(detailRows.length / 2);
                  const col1 = detailRows.slice(0, half);
                  const col2 = detailRows.slice(half);
                  
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[col1, col2].map((col, ci) => (
                        <div key={ci} className="space-y-3">
                          {col.map((row, ri) => (
                            <div key={ri}>
                              <p className="text-sm text-gray-400">{row.label}</p>
                              {row.badge ? (
                                <span className={`inline-block text-xs px-2 py-1 rounded ${row.positive ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'bg-gray-600/20 text-gray-400 border border-gray-500/30'}`}>
                                  {row.value}
                                </span>
                              ) : (
                                <p className={`text-white ${row.mono ? 'font-mono' : ''}`}>{row.value}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Players View */}
            {viewMode === "players" && (
              <div className="space-y-4">
                {/* Session Timer in Players View */}
                {liveTournament?.status === 'active' && liveTournament?.session_started_at && (
                  <div className={`${liveTournament?.paused_at ? 'bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-yellow-500/20' : 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/20'} border rounded-lg p-3 flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${liveTournament?.paused_at ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`}></div>
                      <span className={`${liveTournament?.paused_at ? 'text-yellow-400' : 'text-green-400'} text-sm font-medium`}>
                        {liveTournament?.paused_at ? 'Tournament PAUSED' : 'Tournament Session Active'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`text-2xl font-mono font-bold ${liveTournament?.paused_at ? 'text-yellow-300' : 'text-green-300'} tabular-nums`}>
                        {formatSessionTime(sessionElapsed)}
                      </div>
                      {liveTournament?.paused_at ? (
                        <button onClick={handleResumeTournament} disabled={resumeMutation.isLoading} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded text-xs font-semibold disabled:opacity-50">▶ Resume</button>
                      ) : (
                        <button onClick={handlePauseTournament} disabled={pauseMutation.isLoading} className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1.5 rounded text-xs font-semibold disabled:opacity-50">⏸ Pause</button>
                      )}
                    </div>
                  </div>
                )}

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
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Mobile</th>
                          {(selectedTournament.status === "active" || selectedTournament.status === "completed") && (
                            <>
                              <th className="text-right py-3 px-4 text-gray-400 font-semibold">Wallet Balance</th>
                              <th className="text-right py-3 px-4 text-gray-400 font-semibold">Credits</th>
                            </>
                          )}
                          {selectedTournament.status === "active" && (
                            <>
                              <th className="text-center py-3 px-4 text-gray-400 font-semibold">Session</th>
                              <th className="text-center py-3 px-4 text-gray-400 font-semibold">Status</th>
                            </>
                          )}
                          {selectedTournament.status === "completed" && (
                            <>
                              <th className="text-left py-3 px-4 text-gray-400 font-semibold">Position</th>
                              <th className="text-right py-3 px-4 text-gray-400 font-semibold">Prize</th>
                            </>
                          )}
                          {selectedTournament.status === "active" && (
                            <th className="text-center py-3 px-4 text-gray-400 font-semibold">Action</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {playersData.map((player) => {
                          const walletBal = Number(player.wallet_balance || 0);
                          const totalCredits = Number(player.total_credits || 0);
                          const isExited = player.is_exited;

                          let playerSessionTime = null;
                          if (player.session_started_at && !isExited) {
                            const pStart = new Date(player.session_started_at).getTime();
                            const pElapsed = Math.floor((Date.now() - pStart) / 1000);
                            const h = Math.floor(pElapsed / 3600);
                            const m = Math.floor((pElapsed % 3600) / 60);
                            const s = pElapsed % 60;
                            playerSessionTime = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
                          } else if (isExited && player.session_started_at && player.exited_at) {
                            const pStart = new Date(player.session_started_at).getTime();
                            const pEnd = new Date(player.exited_at).getTime();
                            const pElapsed = Math.floor((pEnd - pStart) / 1000);
                            const h = Math.floor(pElapsed / 3600);
                            const m = Math.floor((pElapsed % 3600) / 60);
                            const s = pElapsed % 60;
                            playerSessionTime = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
                          }

                          return (
                            <tr
                              key={player.id || player.player_id}
                              className={`border-b border-slate-700/50 hover:bg-slate-700/30 ${isExited ? 'opacity-60' : ''}`}
                            >
                              <td className="py-3 px-4 text-white font-mono">{player.player_id || player.id}</td>
                              <td className="py-3 px-4 text-white">
                                {player.name || 'N/A'}
                                {isExited && (
                                  <span className="ml-2 text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                                    Exited
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-white">{player.mobile || 'N/A'}</td>
                              {(selectedTournament.status === "active" || selectedTournament.status === "completed") && (
                                <>
                                  <td className={`py-3 px-4 text-right font-semibold ${walletBal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    ₹{walletBal.toFixed(2)}
                                  </td>
                                  <td className="py-3 px-4 text-right text-yellow-400 font-semibold">
                                    {totalCredits > 0 ? `₹${totalCredits.toFixed(2)}` : '-'}
                                  </td>
                                </>
                              )}
                              {selectedTournament.status === "active" && (
                                <>
                                  <td className="py-3 px-4 text-center">
                                    {playerSessionTime ? (
                                      <span className={`font-mono text-xs tabular-nums ${isExited ? 'text-gray-500' : 'text-green-400'}`}>
                                        {playerSessionTime}
                                      </span>
                                    ) : (
                                      <span className="text-gray-500 text-xs">--</span>
                                    )}
                                    {isExited && player.exited_at && (
                                      <div className="text-[10px] text-gray-500 mt-0.5">
                                        Ended {new Date(player.exited_at).toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit' })}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    {isExited ? (
                                      <span className="text-xs px-2 py-1 rounded bg-gray-600/20 text-gray-400 border border-gray-500/30">
                                        Out (₹{Number(player.exit_balance || 0).toFixed(0)})
                                      </span>
                                    ) : (
                                      <span className="text-xs px-2 py-1 rounded bg-green-600/20 text-green-400 border border-green-500/30">
                                        Playing
                                      </span>
                                    )}
                                  </td>
                                </>
                              )}
                              {selectedTournament.status === "completed" && (
                                <>
                                  <td className="py-3 px-4 text-white">
                                    {player.finishing_position || "-"}
                                  </td>
                                  <td className="py-3 px-4 text-right text-emerald-400 font-semibold">
                                    {player.prize_amount ? `₹${player.prize_amount}` : "-"}
                                  </td>
                                </>
                              )}
                              {selectedTournament.status === "active" && (
                                <td className="py-3 px-4 text-center">
                                  <div className="flex gap-1 justify-center flex-wrap">
                                    {!isExited && (
                                      <button
                                        onClick={() => handleExitPlayer(player)}
                                        className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                                      >
                                        Exit
                                      </button>
                                    )}
                                    {isExited && (
                                      <button
                                        onClick={() => handleRebuy(player, 'rebuy')}
                                        disabled={rebuyMutation.isLoading}
                                        className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                                      >
                                        Rebuy
                                      </button>
                                    )}
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })}
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
                <>
                  <button
                    onClick={() => {
                      if (winnersForm.length === 0) {
                        setWinnersForm([{ player_id: "", finishing_position: 1, prize_amount: "" }]);
                      }
                      setShowEndModal(true);
                    }}
                    className="flex-1 bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-lg"
                  >
                    End with Winners
                  </button>
                  <button
                    onClick={handleStopTournament}
                    disabled={stopMutation.isLoading}
                    className="bg-red-700 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
                  >
                    {stopMutation.isLoading ? 'Stopping...' : 'Force Stop'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* End Tournament Modal */}
      {showEndModal && selectedTournament && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl p-6 max-w-5xl w-full border border-orange-600 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
              End Tournament: {selectedTournament.name}
            </h2>

            {/* Player Balances Summary */}
            {playersData && playersData.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Player Balances (for reference)</h3>
                <div className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-x-auto max-h-48 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-slate-800">
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-2 px-3 text-gray-400">Player</th>
                        <th className="text-right py-2 px-3 text-gray-400">Initial Buy-In</th>
                        <th className="text-right py-2 px-3 text-gray-400">Total Invested</th>
                        <th className="text-right py-2 px-3 text-gray-400">Wallet Balance</th>
                        <th className="text-right py-2 px-3 text-gray-400">Credits</th>
                        <th className="text-center py-2 px-3 text-gray-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playersData.map((player) => {
                        const walletBal = Number(player.wallet_balance || 0);
                        const totalInvested = Number(player.total_invested || selectedTournament.buy_in || selectedTournament.entry_fee || 0);
                        const totalCredits = Number(player.total_credits || 0);
                        return (
                          <tr key={player.id} className={`border-b border-slate-700/30 ${player.is_exited ? 'opacity-50' : ''}`}>
                            <td className="py-2 px-3 text-white">{player.name} <span className="text-gray-500 text-xs">({player.player_id})</span></td>
                            <td className="py-2 px-3 text-right text-cyan-400 font-mono">₹{Number(selectedTournament.buy_in || selectedTournament.entry_fee || 0).toFixed(0)}</td>
                            <td className="py-2 px-3 text-right text-orange-400 font-mono">₹{totalInvested.toFixed(0)}</td>
                            <td className={`py-2 px-3 text-right font-mono font-semibold ${walletBal >= 0 ? 'text-green-400' : 'text-red-400'}`}>₹{walletBal.toFixed(2)}</td>
                            <td className="py-2 px-3 text-right text-yellow-400 font-mono">{totalCredits > 0 ? `₹${totalCredits.toFixed(0)}` : '-'}</td>
                            <td className="py-2 px-3 text-center">
                              {player.is_exited ? (
                                <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">Exited (₹{Number(player.exit_balance || 0).toFixed(0)})</span>
                              ) : (
                                <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">Playing</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <p className="text-gray-300 mb-4 text-sm">
              Select players and assign prize amounts. Player balances will be automatically updated.
            </p>

            <div className="space-y-4 mb-6">
              {winnersForm.map((winner, index) => {
                const selectedPlayer = playersData?.find(p => p.id === winner.player_id);
                return (
                  <div key={index} className="space-y-1">
                    <div className="grid grid-cols-12 gap-3 items-center bg-slate-700/50 p-4 rounded-lg">
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
                              {player.name} ({player.player_id}) - Balance: ₹{Number(player.wallet_balance || 0).toFixed(0)}
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
                    {selectedPlayer && (
                      <div className="ml-14 text-xs text-gray-400 flex gap-4">
                        <span>Initial: <span className="text-cyan-400 font-semibold">₹{Number(selectedTournament.buy_in || selectedTournament.entry_fee || 0).toFixed(0)}</span></span>
                        <span>Invested: <span className="text-orange-400 font-semibold">₹{Number(selectedPlayer.total_invested || selectedTournament.buy_in || 0).toFixed(0)}</span></span>
                        <span>Wallet: <span className={`font-semibold ${Number(selectedPlayer.wallet_balance || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>₹{Number(selectedPlayer.wallet_balance || 0).toFixed(2)}</span></span>
                        {Number(selectedPlayer.total_credits || 0) > 0 && (
                          <span>Credits: <span className="text-yellow-400 font-semibold">₹{Number(selectedPlayer.total_credits || 0).toFixed(0)}</span></span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
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

      {/* Exit Player Modal */}
      {showExitPlayerModal && exitingPlayer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-red-600">
            <h2 className="text-xl font-bold text-white mb-4">Exit Player from Tournament</h2>
            <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Player</span>
                <span className="text-white font-semibold">{exitingPlayer.name}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Player ID</span>
                <span className="text-white font-mono text-sm">{exitingPlayer.player_id}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Wallet Balance</span>
                <span className={`font-semibold ${Number(exitingPlayer.wallet_balance || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ₹{Number(exitingPlayer.wallet_balance || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Credits Taken</span>
                <span className="text-yellow-400 font-semibold">₹{Number(exitingPlayer.total_credits || 0).toFixed(2)}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm mb-1 block">Exit Balance (Amount to credit back)</label>
                <input type="number" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500" placeholder="₹0.00 (leave empty if bust)" value={exitBalance} onChange={(e) => setExitBalance(e.target.value)} />
                <p className="text-xs text-gray-400 mt-1">Leave at 0 or empty if the player went bust.</p>
              </div>
              <div>
                <label className="text-white text-sm mb-1 block">Notes (Optional)</label>
                <input type="text" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500" placeholder="Reason for exit..." value={exitNotes} onChange={(e) => setExitNotes(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleConfirmExitPlayer} disabled={exitPlayerMutation.isLoading} className="flex-1 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50">
                {exitPlayerMutation.isLoading ? "Exiting..." : `Exit Player${exitBalance ? ` (₹${exitBalance})` : ' (Bust)'}`}
              </button>
              <button onClick={() => { setShowExitPlayerModal(false); setExitingPlayer(null); setExitBalance(""); setExitNotes(""); }} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

