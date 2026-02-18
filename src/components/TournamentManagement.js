import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tournamentsAPI, clubsAPI } from "../lib/api";
import toast from "react-hot-toast";

export default function TournamentManagement({ selectedClubId }) {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showExitPlayerModal, setShowExitPlayerModal] = useState(false);
  const [exitingPlayer, setExitingPlayer] = useState(null);
  const [exitBalance, setExitBalance] = useState("");
  const [exitNotes, setExitNotes] = useState("");
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [editingTournament, setEditingTournament] = useState(null);
  const [viewMode, setViewMode] = useState("details"); // 'details' or 'players'
  const [clubLogoUrl, setClubLogoUrl] = useState(null);
  const [sessionElapsed, setSessionElapsed] = useState(0);

  // Tournament type options
  const tournamentTypes = [
    "No Limit Hold'em",
    "Pot Limit Omaha",
    "Pot Limit Omaha Hi-Lo",
    "Limit Hold'em",
    "Seven Card Stud",
    "Seven Card Stud Hi-Lo",
    "Custom",
  ];

  const blindStructures = ["Standard", "Turbo", "Super Turbo", "Deep Stack", "Hyper Turbo", "Custom"];
  const breakStructures = ["Every 4 levels", "Every 6 levels", "Every 8 levels", "No breaks", "Custom"];
  const payoutStructures = ["Top 10%", "Top 15%", "Top 20%", "Top 25%", "Winner takes all", "Custom"];
  const seatDrawMethods = ["Random", "Table Balance", "Manual", "Custom"];
  const clockPauseRules = ["Standard (pause on breaks)", "No Pause", "Pause on All-in", "Custom"];

  const [tournamentForm, setTournamentForm] = useState({
    name: "",
    tournament_type: "No Limit Hold'em",
    buy_in: "",
    entry_fee: "",
    starting_chips: "",
    blind_structure: "Standard",
    number_of_levels: 15,
    minutes_per_level: 15,
    break_structure: "Every 4 levels",
    break_duration: 10,
    late_registration: 60,
    payout_structure: "Top 15%",
    seat_draw_method: "Random",
    clock_pause_rules: "Standard (pause on breaks)",
    allow_rebuys: false,
    allow_addon: false,
    allow_reentry: false,
    bounty_amount: "",
    max_players: 100,
    start_time: "",
    custom_tournament_type: "",
    custom_blind_structure: "",
    custom_break_structure: "",
    custom_payout_structure: "",
    custom_seat_draw_method: "",
    custom_clock_pause_rules: "",
  });

  const [winnersForm, setWinnersForm] = useState([]);

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

  // Fetch tournaments
  const { data: tournamentsData, isLoading: tournamentsLoading } = useQuery({
    queryKey: ["tournaments", selectedClubId],
    queryFn: () => tournamentsAPI.getTournaments(selectedClubId),
    enabled: !!selectedClubId,
  });

  // Fetch tournament details
  const { data: tournamentDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ["tournament-details", selectedClubId, selectedTournament?.id],
    queryFn: () => tournamentsAPI.getTournamentById(selectedClubId, selectedTournament.id),
    enabled: !!selectedClubId && !!selectedTournament && showDetailsModal,
  });

  // Fetch tournament players (auto-refetch every 10s for active tournaments)
  const { data: playersData, isLoading: playersLoading } = useQuery({
    queryKey: ["tournament-players", selectedClubId, selectedTournament?.id],
    queryFn: () => tournamentsAPI.getTournamentPlayers(selectedClubId, selectedTournament.id),
    enabled: !!selectedClubId && !!selectedTournament && (showDetailsModal || showEndModal),
    refetchInterval: selectedTournament?.status === 'active' ? 10000 : false,
  });

  // Fetch tournament winners
  const { data: winnersData } = useQuery({
    queryKey: ["tournament-winners", selectedClubId, selectedTournament?.id],
    queryFn: () => tournamentsAPI.getTournamentWinners(selectedClubId, selectedTournament.id),
    enabled: !!selectedClubId && !!selectedTournament && selectedTournament.status === "completed",
  });

  // Create tournament mutation
  const createMutation = useMutation({
    mutationFn: (data) => tournamentsAPI.createTournament(selectedClubId, data),
    onSuccess: () => {
      toast.success("Tournament created successfully!");
      queryClient.invalidateQueries(["tournaments", selectedClubId]);
      setShowCreateModal(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create tournament");
    },
  });

  // Start tournament mutation
  const startMutation = useMutation({
    mutationFn: (tournamentId) => tournamentsAPI.startTournament(selectedClubId, tournamentId),
    onSuccess: () => {
      toast.success("Tournament started successfully!");
      queryClient.invalidateQueries(["tournaments", selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to start tournament");
    },
  });

  // End tournament mutation
  const endMutation = useMutation({
    mutationFn: ({ tournamentId, winners }) =>
      tournamentsAPI.endTournament(selectedClubId, tournamentId, { winners }),
    onSuccess: () => {
      toast.success("Tournament ended and winners updated successfully!");
      queryClient.invalidateQueries(["tournaments", selectedClubId]);
      setShowEndModal(false);
      setShowDetailsModal(false);
      setWinnersForm([]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to end tournament");
    },
  });

  // Update tournament mutation
  const updateMutation = useMutation({
    mutationFn: ({ tournamentId, data }) => tournamentsAPI.updateTournament(selectedClubId, tournamentId, data),
    onSuccess: () => {
      toast.success("Tournament updated successfully!");
      queryClient.invalidateQueries(["tournaments", selectedClubId]);
      setShowEditModal(false);
      setEditingTournament(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update tournament");
    },
  });

  // Delete tournament mutation
  const deleteMutation = useMutation({
    mutationFn: (tournamentId) => tournamentsAPI.deleteTournament(selectedClubId, tournamentId),
    onSuccess: () => {
      toast.success("Tournament deleted successfully!");
      queryClient.invalidateQueries(["tournaments", selectedClubId]);
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
      queryClient.invalidateQueries(["tournament-players", selectedClubId, selectedTournament?.id]);
      queryClient.invalidateQueries(["tournaments", selectedClubId]);
      setShowExitPlayerModal(false);
      setExitingPlayer(null);
      setExitBalance("");
      setExitNotes("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to exit player");
    },
  });

  // Rebuy / Re-entry mutation
  const rebuyMutation = useMutation({
    mutationFn: (data) => tournamentsAPI.rebuyTournamentPlayer(selectedClubId, selectedTournament.id, data),
    onSuccess: (result) => {
      toast.success(result.message || "Rebuy successful!");
      queryClient.invalidateQueries(["tournament-players", selectedClubId, selectedTournament?.id]);
      queryClient.invalidateQueries(["tournaments", selectedClubId]);
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
      queryClient.invalidateQueries(["tournaments", selectedClubId]);
      queryClient.invalidateQueries(["tournament-details", selectedClubId, selectedTournament?.id]);
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
      queryClient.invalidateQueries(["tournaments", selectedClubId]);
      queryClient.invalidateQueries(["tournament-details", selectedClubId, selectedTournament?.id]);
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
      queryClient.invalidateQueries(["tournaments", selectedClubId]);
      queryClient.invalidateQueries(["tournament-details", selectedClubId, selectedTournament?.id]);
      setShowDetailsModal(false);
      setSelectedTournament(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to stop tournament");
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
      const totalRawSeconds = Math.floor((now - startTime) / 1000);
      
      if (isPaused && pausedAtTime) {
        // When paused, freeze the timer at the moment it was paused
        const elapsedUntilPause = Math.floor((pausedAtTime - startTime) / 1000);
        setSessionElapsed(elapsedUntilPause - totalPausedSeconds);
      } else {
        // Running: subtract total accumulated paused time
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
    if (window.confirm("Pause the tournament session? The timer and levels will be frozen.")) {
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

  const handleRebuy = (player, type = 'rebuy') => {
    const actionLabel = type === 'rebuy' ? 'Rebuy' : type === 'reentry' ? 'Re-enter' : 'Add-on';
    const tourney = liveTournament || selectedTournament;
    const buyIn = parseFloat(tourney?.buy_in || 0);
    if (window.confirm(`${actionLabel} for ${player.name}? This will charge ₹${buyIn} buy-in.`)) {
      rebuyMutation.mutate({ playerId: player.id, type });
    }
  };

  // Calculate current tournament level from elapsed time
  const getTournamentLevelInfo = useCallback(() => {
    const tourney = tournamentDetails || selectedTournament;
    if (!tourney?.session_started_at || tourney?.status !== 'active') return null;

    let structure = tourney.structure || {};
    if (typeof structure === 'string') {
      try { structure = JSON.parse(structure); } catch { structure = {}; }
    }

    const minutesPerLevel = structure.minutes_per_level || tourney.minutes_per_level || 15;
    const numberOfLevels = structure.number_of_levels || tourney.number_of_levels || 15;
    const breakStructureStr = structure.break_structure || tourney.break_structure || '';
    const breakDuration = structure.break_duration || tourney.break_duration || 10;
    const lateRegistration = structure.late_registration || tourney.late_registration || 0;
    const allowRebuys = structure.allow_rebuys || tourney.allow_rebuys || false;
    const allowReentry = structure.allow_reentry || tourney.allow_reentry || false;
    const allowAddon = structure.allow_addon || tourney.allow_addon || false;

    // Parse break frequency from break structure string
    let breakEveryNLevels = 0;
    const breakMatch = breakStructureStr.match(/(\d+)/);
    if (breakMatch) {
      breakEveryNLevels = parseInt(breakMatch[1]);
    }

    const elapsedSeconds = sessionElapsed;
    const elapsedMinutes = elapsedSeconds / 60;

    // Calculate current level accounting for breaks
    let currentLevel = 1;
    let timeAccountedFor = 0; // in minutes
    let onBreak = false;
    let breakTimeRemaining = 0;

    for (let level = 1; level <= numberOfLevels; level++) {
      const levelEnd = timeAccountedFor + minutesPerLevel;
      
      if (elapsedMinutes < levelEnd) {
        currentLevel = level;
        break;
      }
      
      timeAccountedFor = levelEnd;
      currentLevel = level;

      // Check if break after this level
      if (breakEveryNLevels > 0 && level % breakEveryNLevels === 0 && level < numberOfLevels) {
        const breakEnd = timeAccountedFor + breakDuration;
        if (elapsedMinutes < breakEnd) {
          onBreak = true;
          breakTimeRemaining = Math.ceil(breakEnd - elapsedMinutes);
          break;
        }
        timeAccountedFor = breakEnd;
      }
    }

    // Time remaining in current level
    let levelStartTime = 0;
    for (let l = 1; l < currentLevel; l++) {
      levelStartTime += minutesPerLevel;
      if (breakEveryNLevels > 0 && l % breakEveryNLevels === 0) {
        levelStartTime += breakDuration;
      }
    }
    const timeInCurrentLevel = elapsedMinutes - levelStartTime;
    const timeRemainingInLevel = Math.max(0, minutesPerLevel - timeInCurrentLevel);
    const timeRemainingSeconds = Math.ceil(timeRemainingInLevel * 60);

    // Late registration check
    const lateRegOpen = lateRegistration > 0 && elapsedMinutes <= lateRegistration;

    return {
      currentLevel,
      numberOfLevels,
      minutesPerLevel,
      onBreak,
      breakTimeRemaining,
      timeRemainingInLevel: Math.ceil(timeRemainingInLevel),
      timeRemainingSeconds,
      lateRegOpen,
      lateRegistration,
      allowRebuys,
      allowReentry,
      allowAddon,
      breakEveryNLevels,
      breakDuration,
      elapsedMinutes: Math.floor(elapsedMinutes),
    };
  }, [tournamentDetails, selectedTournament, sessionElapsed]);

  const levelInfo = getTournamentLevelInfo();

  const resetForm = () => {
    setTournamentForm({
      name: "",
      tournament_type: "No Limit Hold'em",
      buy_in: "",
      entry_fee: "",
      starting_chips: "",
      blind_structure: "Standard",
      number_of_levels: 15,
      minutes_per_level: 15,
      break_structure: "Every 4 levels",
      break_duration: 10,
      late_registration: 60,
      payout_structure: "Top 15%",
      seat_draw_method: "Random",
      clock_pause_rules: "Standard (pause on breaks)",
      allow_rebuys: false,
      allow_addon: false,
      allow_reentry: false,
      bounty_amount: "",
      max_players: 100,
      start_time: "",
      custom_tournament_type: "",
      custom_blind_structure: "",
      custom_break_structure: "",
      custom_payout_structure: "",
      custom_seat_draw_method: "",
      custom_clock_pause_rules: "",
    });
  };

  const handleCreateTournament = () => {
    if (!tournamentForm.name || !tournamentForm.buy_in || !tournamentForm.starting_chips) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Convert string values to proper types for DTO validation
    const tournamentData = {
      name: tournamentForm.name,
      tournament_type: tournamentForm.tournament_type,
      buy_in: parseFloat(tournamentForm.buy_in) || 0,
      entry_fee: tournamentForm.entry_fee ? parseFloat(tournamentForm.entry_fee) : undefined,
      starting_chips: parseInt(tournamentForm.starting_chips) || 0,
      blind_structure: tournamentForm.blind_structure,
      number_of_levels: parseInt(tournamentForm.number_of_levels) || 15,
      minutes_per_level: parseInt(tournamentForm.minutes_per_level) || 15,
      break_structure: tournamentForm.break_structure,
      break_duration: parseInt(tournamentForm.break_duration) || 10,
      late_registration: parseInt(tournamentForm.late_registration) || 60,
      payout_structure: tournamentForm.payout_structure,
      seat_draw_method: tournamentForm.seat_draw_method,
      clock_pause_rules: tournamentForm.clock_pause_rules,
      allow_rebuys: Boolean(tournamentForm.allow_rebuys),
      allow_addon: Boolean(tournamentForm.allow_addon),
      allow_reentry: Boolean(tournamentForm.allow_reentry),
      bounty_amount: tournamentForm.bounty_amount ? parseFloat(tournamentForm.bounty_amount) : undefined,
      max_players: parseInt(tournamentForm.max_players) || 100,
      start_time: tournamentForm.start_time || undefined,
      custom_tournament_type: tournamentForm.custom_tournament_type || undefined,
      custom_blind_structure: tournamentForm.custom_blind_structure || undefined,
      custom_break_structure: tournamentForm.custom_break_structure || undefined,
      custom_payout_structure: tournamentForm.custom_payout_structure || undefined,
      custom_seat_draw_method: tournamentForm.custom_seat_draw_method || undefined,
      custom_clock_pause_rules: tournamentForm.custom_clock_pause_rules || undefined,
    };

    createMutation.mutate(tournamentData);
  };

  const handleStartTournament = (tournamentId) => {
    if (window.confirm("Are you sure you want to start this tournament?")) {
      startMutation.mutate(tournamentId);
    }
  };

  const handleEndTournament = () => {
    if (winnersForm.length === 0) {
      toast.error("Please add at least one winner");
      return;
    }

    // Validate all winners have required fields
    const isValid = winnersForm.every(
      (w) => w.player_id && w.finishing_position && w.prize_amount
    );
    if (!isValid) {
      toast.error("Please fill in all winner details");
      return;
    }

    endMutation.mutate({
      tournamentId: selectedTournament.id,
      winners: winnersForm,
    });
  };

  const handleDeleteTournament = (tournamentId, tournamentName) => {
    if (window.confirm(`Are you sure you want to delete "${tournamentName}"?`)) {
      deleteMutation.mutate(tournamentId);
    }
  };

  const handleEditTournament = (tournament) => {
    setEditingTournament(tournament);
    // Parse structure if it's JSON
    let structure = {};
    if (tournament.structure && typeof tournament.structure === 'string') {
      try {
        structure = JSON.parse(tournament.structure);
      } catch (e) {
        structure = {};
      }
    } else if (tournament.structure) {
      structure = tournament.structure;
    }

    setTournamentForm({
      name: tournament.name || "",
      tournament_type: structure.tournament_type || tournament.tournament_type || "No Limit Hold'em",
      buy_in: tournament.buy_in?.toString() || "",
      entry_fee: tournament.entry_fee?.toString() || structure.entry_fee?.toString() || "",
      starting_chips: tournament.starting_chips?.toString() || structure.starting_chips?.toString() || "",
      blind_structure: structure.blind_structure || tournament.blind_structure || "Standard",
      number_of_levels: structure.number_of_levels || tournament.number_of_levels || 15,
      minutes_per_level: structure.minutes_per_level || tournament.minutes_per_level || 15,
      break_structure: structure.break_structure || tournament.break_structure || "Every 4 levels",
      break_duration: structure.break_duration || tournament.break_duration || 10,
      late_registration: structure.late_registration || tournament.late_registration || 60,
      payout_structure: structure.payout_structure || tournament.payout_structure || "Top 15%",
      seat_draw_method: structure.seat_draw_method || tournament.seat_draw_method || "Random",
      clock_pause_rules: structure.clock_pause_rules || tournament.clock_pause_rules || "Standard (pause on breaks)",
      allow_rebuys: structure.allow_rebuys || tournament.allow_rebuys || false,
      allow_addon: structure.allow_addon || tournament.allow_addon || false,
      allow_reentry: structure.allow_reentry || tournament.allow_reentry || false,
      bounty_amount: tournament.bounty_amount?.toString() || structure.bounty_amount?.toString() || "",
      max_players: tournament.max_players || 100,
      start_time: tournament.start_time ? new Date(tournament.start_time).toISOString().slice(0, 16) : "",
      custom_tournament_type: tournament.custom_tournament_type || "",
      custom_blind_structure: tournament.custom_blind_structure || "",
      custom_break_structure: tournament.custom_break_structure || "",
      custom_payout_structure: tournament.custom_payout_structure || "",
      custom_seat_draw_method: tournament.custom_seat_draw_method || "",
      custom_clock_pause_rules: tournament.custom_clock_pause_rules || "",
    });
    setShowEditModal(true);
  };

  const handleUpdateTournament = () => {
    if (!tournamentForm.name || !tournamentForm.buy_in || !tournamentForm.starting_chips) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Convert string values to proper types for DTO validation
    const tournamentData = {
      name: tournamentForm.name,
      tournament_type: tournamentForm.tournament_type,
      buy_in: parseFloat(tournamentForm.buy_in) || 0,
      entry_fee: tournamentForm.entry_fee ? parseFloat(tournamentForm.entry_fee) : undefined,
      starting_chips: parseInt(tournamentForm.starting_chips) || 0,
      blind_structure: tournamentForm.blind_structure,
      number_of_levels: parseInt(tournamentForm.number_of_levels) || 15,
      minutes_per_level: parseInt(tournamentForm.minutes_per_level) || 15,
      break_structure: tournamentForm.break_structure,
      break_duration: parseInt(tournamentForm.break_duration) || 10,
      late_registration: parseInt(tournamentForm.late_registration) || 60,
      payout_structure: tournamentForm.payout_structure,
      seat_draw_method: tournamentForm.seat_draw_method,
      clock_pause_rules: tournamentForm.clock_pause_rules,
      allow_rebuys: Boolean(tournamentForm.allow_rebuys),
      allow_addon: Boolean(tournamentForm.allow_addon),
      allow_reentry: Boolean(tournamentForm.allow_reentry),
      bounty_amount: tournamentForm.bounty_amount ? parseFloat(tournamentForm.bounty_amount) : undefined,
      max_players: parseInt(tournamentForm.max_players) || 100,
      start_time: tournamentForm.start_time || undefined,
      custom_tournament_type: tournamentForm.custom_tournament_type || undefined,
      custom_blind_structure: tournamentForm.custom_blind_structure || undefined,
      custom_break_structure: tournamentForm.custom_break_structure || undefined,
      custom_payout_structure: tournamentForm.custom_payout_structure || undefined,
      custom_seat_draw_method: tournamentForm.custom_seat_draw_method || undefined,
      custom_clock_pause_rules: tournamentForm.custom_clock_pause_rules || undefined,
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

  const tournaments = tournamentsData || [];
  const players = playersData?.players || playersData || [];
  const winners = winnersData?.winners || [];

  // Use tournamentDetails for live data (includes session_started_at)
  const liveTournament = tournamentDetails || selectedTournament;

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500/20 text-blue-300 border-blue-500";
      case "active":
        return "bg-green-500/20 text-green-300 border-green-500";
      case "completed":
        return "bg-gray-500/20 text-gray-300 border-gray-500";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Tournament Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
        >
          ➕ Create Tournament
        </button>
      </div>

      {/* Tournaments List */}
      {tournamentsLoading ? (
        <div className="text-white text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p>Loading tournaments...</p>
        </div>
      ) : tournaments.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Tournaments Yet</h3>
          <p className="text-gray-400">Create your first tournament to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-emerald-600 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{tournament.name}</h3>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                      tournament.status
                    )}`}
                  >
                    {tournament.status?.toUpperCase()}
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
                <div className="text-right">
                  <p className="text-sm text-gray-400">Tournament ID</p>
                  <p className="text-white font-mono">{tournament.tournament_id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-400">Type</p>
                  <p className="text-white font-semibold">{tournament.tournament_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Buy-in</p>
                  <p className="text-white font-semibold">₹{tournament.buy_in}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Starting Chips</p>
                  <p className="text-white font-semibold">{tournament.starting_chips}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Players</p>
                  <p className="text-white font-semibold">
                    {tournament.registered_players || 0} / {tournament.max_players}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedTournament(tournament);
                    setShowDetailsModal(true);
                    setViewMode("details");
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  View Details
                </button>

                {tournament.status === "scheduled" && (
                  <>
                    <button
                      onClick={() => handleEditTournament(tournament)}
                      className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Edit
                    </button>
                  <button
                    onClick={() => handleStartTournament(tournament.id)}
                    className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Start
                  </button>
                  </>
                )}

                {tournament.status === "active" && (
                  <>
                    {tournament.paused_at ? (
                      <button
                        onClick={() => {
                          setSelectedTournament(tournament);
                          resumeMutation.mutate();
                        }}
                        className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
                      >
                        ▶ Resume
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedTournament(tournament);
                          pauseMutation.mutate();
                        }}
                        className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
                      >
                        ⏸ Pause
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedTournament(tournament);
                        setShowEndModal(true);
                      }}
                      className="flex-1 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      End Tournament
                    </button>
                  </>
                )}

                {tournament.status === "completed" && (
                  <button
                    onClick={() => {
                      setSelectedTournament(tournament);
                      setShowDetailsModal(true);
                      setViewMode("details");
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    View Winners
                  </button>
                )}

                {tournament.status === "scheduled" && (
                  <button
                    onClick={() => handleDeleteTournament(tournament.id, tournament.name)}
                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Tournament Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl p-6 max-w-4xl w-full border border-emerald-600 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Tournament</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                  Basic Information
                </h3>

                <div>
                  <label className="text-white text-sm mb-1 block">Tournament Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                    placeholder="Monday Night Hold'em"
                    value={tournamentForm.name}
                    onChange={(e) =>
                      setTournamentForm({ ...tournamentForm, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-white text-sm mb-1 block">Tournament Type *</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                    value={tournamentForm.tournament_type}
                    onChange={(e) =>
                      setTournamentForm({ ...tournamentForm, tournament_type: e.target.value })
                    }
                  >
                    {tournamentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {tournamentForm.tournament_type === "Custom" && (
                  <div>
                    <label className="text-white text-sm mb-1 block">Custom Tournament Type</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                      placeholder="Enter custom type"
                      value={tournamentForm.custom_tournament_type}
                      onChange={(e) =>
                        setTournamentForm({
                          ...tournamentForm,
                          custom_tournament_type: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white text-sm mb-1 block">Buy-in (₹) *</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                      placeholder="1000"
                      value={tournamentForm.buy_in}
                      onChange={(e) =>
                        setTournamentForm({ ...tournamentForm, buy_in: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm mb-1 block">Entry Fee (₹)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                      placeholder="100"
                      value={tournamentForm.entry_fee}
                      onChange={(e) =>
                        setTournamentForm({ ...tournamentForm, entry_fee: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white text-sm mb-1 block">Starting Chips *</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                    placeholder="10000"
                    value={tournamentForm.starting_chips}
                    onChange={(e) =>
                      setTournamentForm({ ...tournamentForm, starting_chips: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white text-sm mb-1 block">Start Time</label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                      value={tournamentForm.start_time}
                      onChange={(e) =>
                        setTournamentForm({ ...tournamentForm, start_time: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm mb-1 block">Max Players</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                      placeholder="100"
                      value={tournamentForm.max_players}
                      onChange={(e) =>
                        setTournamentForm({ ...tournamentForm, max_players: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Tournament Rules */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                  Tournament Rules
                </h3>

                <div>
                  <label className="text-white text-sm mb-1 block">Blind Structure *</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                    value={tournamentForm.blind_structure}
                    onChange={(e) =>
                      setTournamentForm({ ...tournamentForm, blind_structure: e.target.value })
                    }
                  >
                    {blindStructures.map((structure) => (
                      <option key={structure} value={structure}>
                        {structure}
                      </option>
                    ))}
                  </select>
                </div>

                {tournamentForm.blind_structure === "Custom" && (
                  <div>
                    <label className="text-white text-sm mb-1 block">Custom Blind Structure</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                      placeholder="Enter custom structure"
                      value={tournamentForm.custom_blind_structure}
                      onChange={(e) =>
                        setTournamentForm({
                          ...tournamentForm,
                          custom_blind_structure: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white text-sm mb-1 block">Number of Levels</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                      placeholder="15"
                      value={tournamentForm.number_of_levels}
                      onChange={(e) =>
                        setTournamentForm({
                          ...tournamentForm,
                          number_of_levels: parseInt(e.target.value) || 15,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm mb-1 block">Minutes per Level</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                      placeholder="15"
                      value={tournamentForm.minutes_per_level}
                      onChange={(e) =>
                        setTournamentForm({
                          ...tournamentForm,
                          minutes_per_level: parseInt(e.target.value) || 15,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white text-sm mb-1 block">Break Structure</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                    value={tournamentForm.break_structure}
                    onChange={(e) =>
                      setTournamentForm({ ...tournamentForm, break_structure: e.target.value })
                    }
                  >
                    {breakStructures.map((structure) => (
                      <option key={structure} value={structure}>
                        {structure}
                      </option>
                    ))}
                  </select>
                </div>

                {tournamentForm.break_structure === "Custom" && (
                  <div>
                    <label className="text-white text-sm mb-1 block">Custom Break Structure</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                      placeholder="Enter custom structure"
                      value={tournamentForm.custom_break_structure}
                      onChange={(e) =>
                        setTournamentForm({
                          ...tournamentForm,
                          custom_break_structure: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <div>
                  <label className="text-white text-sm mb-1 block">Break Duration (minutes)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                    placeholder="10"
                    value={tournamentForm.break_duration}
                    onChange={(e) =>
                      setTournamentForm({
                        ...tournamentForm,
                        break_duration: parseInt(e.target.value) || 10,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-white text-sm mb-1 block">Late Registration (minutes)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                    placeholder="60"
                    value={tournamentForm.late_registration}
                    onChange={(e) =>
                      setTournamentForm({
                        ...tournamentForm,
                        late_registration: parseInt(e.target.value) || 60,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-white text-sm mb-1 block">Payout Structure</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                    value={tournamentForm.payout_structure}
                    onChange={(e) =>
                      setTournamentForm({ ...tournamentForm, payout_structure: e.target.value })
                    }
                  >
                    {payoutStructures.map((structure) => (
                      <option key={structure} value={structure}>
                        {structure}
                      </option>
                    ))}
                  </select>
                </div>

                {tournamentForm.payout_structure === "Custom" && (
                  <div>
                    <label className="text-white text-sm mb-1 block">Custom Payout Structure</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                      placeholder="Enter custom structure"
                      value={tournamentForm.custom_payout_structure}
                      onChange={(e) =>
                        setTournamentForm({
                          ...tournamentForm,
                          custom_payout_structure: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <div>
                  <label className="text-white text-sm mb-1 block">Seat Draw Method</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                    value={tournamentForm.seat_draw_method}
                    onChange={(e) =>
                      setTournamentForm({ ...tournamentForm, seat_draw_method: e.target.value })
                    }
                  >
                    {seatDrawMethods.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>

                {tournamentForm.seat_draw_method === "Custom" && (
                  <div>
                    <label className="text-white text-sm mb-1 block">Custom Seat Draw Method</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                      placeholder="Enter custom method"
                      value={tournamentForm.custom_seat_draw_method}
                      onChange={(e) =>
                        setTournamentForm({
                          ...tournamentForm,
                          custom_seat_draw_method: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <div>
                  <label className="text-white text-sm mb-1 block">Clock Pause Rules</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                    value={tournamentForm.clock_pause_rules}
                    onChange={(e) =>
                      setTournamentForm({ ...tournamentForm, clock_pause_rules: e.target.value })
                    }
                  >
                    {clockPauseRules.map((rule) => (
                      <option key={rule} value={rule}>
                        {rule}
                      </option>
                    ))}
                  </select>
                </div>

                {tournamentForm.clock_pause_rules === "Custom" && (
                  <div>
                    <label className="text-white text-sm mb-1 block">Custom Clock Pause Rules</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                      placeholder="Enter custom rules"
                      value={tournamentForm.custom_clock_pause_rules}
                      onChange={(e) =>
                        setTournamentForm({
                          ...tournamentForm,
                          custom_clock_pause_rules: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </div>

              {/* Rebuy, Add-on & Re-entry Options */}
              <div className="col-span-2 space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                  Rebuy, Add-on & Re-entry Options
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center space-x-3 text-white cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500"
                      checked={tournamentForm.allow_rebuys}
                      onChange={(e) =>
                        setTournamentForm({ ...tournamentForm, allow_rebuys: e.target.checked })
                      }
                    />
                    <span>Allow Rebuys</span>
                  </label>

                  <label className="flex items-center space-x-3 text-white cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500"
                      checked={tournamentForm.allow_addon}
                      onChange={(e) =>
                        setTournamentForm({ ...tournamentForm, allow_addon: e.target.checked })
                      }
                    />
                    <span>Allow Add-on</span>
                  </label>

                  <label className="flex items-center space-x-3 text-white cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500"
                      checked={tournamentForm.allow_reentry}
                      onChange={(e) =>
                        setTournamentForm({ ...tournamentForm, allow_reentry: e.target.checked })
                      }
                    />
                    <span>Allow Re-entry</span>
                  </label>
                </div>

                <div>
                  <label className="text-white text-sm mb-1 block">
                    Bounty Amount (₹) - Leave blank for regular tournament
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                    placeholder="0"
                    value={tournamentForm.bounty_amount}
                    onChange={(e) =>
                      setTournamentForm({ ...tournamentForm, bounty_amount: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    If set, this becomes a knockout/bounty tournament
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateTournament}
                disabled={createMutation.isLoading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {createMutation.isLoading ? "Creating..." : "Create Tournament"}
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
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

      {/* Edit Tournament Modal - Same form structure as Create */}
      {showEditModal && editingTournament && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl p-6 max-w-4xl w-full border border-purple-600 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Edit Tournament: {editingTournament.name}</h2>
            
            {/* Reuse the exact same form structure from Create Modal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                  Basic Information
                </h3>

                <div>
                  <label className="text-white text-sm mb-1 block">Tournament Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="Monday Night Hold'em"
                    value={tournamentForm.name}
                    onChange={(e) =>
                      setTournamentForm({ ...tournamentForm, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-white text-sm mb-1 block">Tournament Type *</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    value={tournamentForm.tournament_type}
                    onChange={(e) =>
                      setTournamentForm({ ...tournamentForm, tournament_type: e.target.value })
                    }
                  >
                    {tournamentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {tournamentForm.tournament_type === "Custom" && (
                  <div>
                    <label className="text-white text-sm mb-1 block">Custom Tournament Type</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter custom type"
                      value={tournamentForm.custom_tournament_type}
                      onChange={(e) =>
                        setTournamentForm({
                          ...tournamentForm,
                          custom_tournament_type: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white text-sm mb-1 block">Buy-in (₹) *</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="1000"
                      value={tournamentForm.buy_in}
                      onChange={(e) =>
                        setTournamentForm({ ...tournamentForm, buy_in: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm mb-1 block">Entry Fee (₹)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="100"
                      value={tournamentForm.entry_fee}
                      onChange={(e) =>
                        setTournamentForm({ ...tournamentForm, entry_fee: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white text-sm mb-1 block">Starting Chips *</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="10000"
                    value={tournamentForm.starting_chips}
                    onChange={(e) =>
                      setTournamentForm({ ...tournamentForm, starting_chips: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white text-sm mb-1 block">Start Time</label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      value={tournamentForm.start_time}
                      onChange={(e) =>
                        setTournamentForm({ ...tournamentForm, start_time: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm mb-1 block">Max Players</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="100"
                      value={tournamentForm.max_players}
                      onChange={(e) =>
                        setTournamentForm({ ...tournamentForm, max_players: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Tournament Rules */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                  Tournament Rules
                </h3>

                <div>
                  <label className="text-white text-sm mb-1 block">Blind Structure *</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    value={tournamentForm.blind_structure}
                    onChange={(e) =>
                      setTournamentForm({ ...tournamentForm, blind_structure: e.target.value })
                    }
                  >
                    {blindStructures.map((structure) => (
                      <option key={structure} value={structure}>
                        {structure}
                      </option>
                    ))}
                  </select>
                </div>

                {tournamentForm.blind_structure === "Custom" && (
                  <div>
                    <label className="text-white text-sm mb-1 block">Custom Blind Structure</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter custom structure"
                      value={tournamentForm.custom_blind_structure}
                      onChange={(e) =>
                        setTournamentForm({
                          ...tournamentForm,
                          custom_blind_structure: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white text-sm mb-1 block">Number of Levels</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="15"
                      value={tournamentForm.number_of_levels}
                      onChange={(e) =>
                        setTournamentForm({
                          ...tournamentForm,
                          number_of_levels: parseInt(e.target.value) || 15,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm mb-1 block">Minutes per Level</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="15"
                      value={tournamentForm.minutes_per_level}
                      onChange={(e) =>
                        setTournamentForm({
                          ...tournamentForm,
                          minutes_per_level: parseInt(e.target.value) || 15,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white text-sm mb-1 block">Break Structure</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    value={tournamentForm.break_structure}
                    onChange={(e) =>
                      setTournamentForm({ ...tournamentForm, break_structure: e.target.value })
                    }
                  >
                    {breakStructures.map((structure) => (
                      <option key={structure} value={structure}>
                        {structure}
                      </option>
                    ))}
                  </select>
                </div>

                {tournamentForm.break_structure === "Custom" && (
                  <div>
                    <label className="text-white text-sm mb-1 block">Custom Break Structure</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter custom structure"
                      value={tournamentForm.custom_break_structure}
                      onChange={(e) =>
                        setTournamentForm({
                          ...tournamentForm,
                          custom_break_structure: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <div>
                  <label className="text-white text-sm mb-1 block">Break Duration (minutes)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="10"
                    value={tournamentForm.break_duration}
                    onChange={(e) =>
                      setTournamentForm({
                        ...tournamentForm,
                        break_duration: parseInt(e.target.value) || 10,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-white text-sm mb-1 block">Late Registration (minutes)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="60"
                    value={tournamentForm.late_registration}
                    onChange={(e) =>
                      setTournamentForm({
                        ...tournamentForm,
                        late_registration: parseInt(e.target.value) || 60,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-white text-sm mb-1 block">Payout Structure</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    value={tournamentForm.payout_structure}
                    onChange={(e) =>
                      setTournamentForm({ ...tournamentForm, payout_structure: e.target.value })
                    }
                  >
                    {payoutStructures.map((structure) => (
                      <option key={structure} value={structure}>
                        {structure}
                      </option>
                    ))}
                  </select>
                </div>

                {tournamentForm.payout_structure === "Custom" && (
                  <div>
                    <label className="text-white text-sm mb-1 block">Custom Payout Structure</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter custom structure"
                      value={tournamentForm.custom_payout_structure}
                      onChange={(e) =>
                        setTournamentForm({
                          ...tournamentForm,
                          custom_payout_structure: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <div>
                  <label className="text-white text-sm mb-1 block">Seat Draw Method</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    value={tournamentForm.seat_draw_method}
                    onChange={(e) =>
                      setTournamentForm({ ...tournamentForm, seat_draw_method: e.target.value })
                    }
                  >
                    {seatDrawMethods.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>

                {tournamentForm.seat_draw_method === "Custom" && (
                  <div>
                    <label className="text-white text-sm mb-1 block">Custom Seat Draw Method</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter custom method"
                      value={tournamentForm.custom_seat_draw_method}
                      onChange={(e) =>
                        setTournamentForm({
                          ...tournamentForm,
                          custom_seat_draw_method: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <div>
                  <label className="text-white text-sm mb-1 block">Clock Pause Rules</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    value={tournamentForm.clock_pause_rules}
                    onChange={(e) =>
                      setTournamentForm({ ...tournamentForm, clock_pause_rules: e.target.value })
                    }
                  >
                    {clockPauseRules.map((rule) => (
                      <option key={rule} value={rule}>
                        {rule}
                      </option>
                    ))}
                  </select>
                </div>

                {tournamentForm.clock_pause_rules === "Custom" && (
                  <div>
                    <label className="text-white text-sm mb-1 block">Custom Clock Pause Rules</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter custom rules"
                      value={tournamentForm.custom_clock_pause_rules}
                      onChange={(e) =>
                        setTournamentForm({
                          ...tournamentForm,
                          custom_clock_pause_rules: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </div>

              {/* Rebuy, Add-on & Re-entry Options */}
              <div className="col-span-2 space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                  Rebuy, Add-on & Re-entry Options
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center space-x-3 text-white cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-purple-500 focus:ring-purple-500"
                      checked={tournamentForm.allow_rebuys}
                      onChange={(e) =>
                        setTournamentForm({ ...tournamentForm, allow_rebuys: e.target.checked })
                      }
                    />
                    <span>Allow Rebuys</span>
                  </label>

                  <label className="flex items-center space-x-3 text-white cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-purple-500 focus:ring-purple-500"
                      checked={tournamentForm.allow_addon}
                      onChange={(e) =>
                        setTournamentForm({ ...tournamentForm, allow_addon: e.target.checked })
                      }
                    />
                    <span>Allow Add-on</span>
                  </label>

                  <label className="flex items-center space-x-3 text-white cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-purple-500 focus:ring-purple-500"
                      checked={tournamentForm.allow_reentry}
                      onChange={(e) =>
                        setTournamentForm({ ...tournamentForm, allow_reentry: e.target.checked })
                      }
                    />
                    <span>Allow Re-entry</span>
                  </label>
                </div>

                <div>
                  <label className="text-white text-sm mb-1 block">
                    Bounty Amount (₹) - Leave blank for regular tournament
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                    value={tournamentForm.bounty_amount}
                    onChange={(e) =>
                      setTournamentForm({ ...tournamentForm, bounty_amount: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    If set, this becomes a knockout/bounty tournament
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateTournament}
                disabled={updateMutation.isLoading}
                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {updateMutation.isLoading ? "Updating..." : "Update Tournament"}
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTournament(null);
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
              <button
                onClick={() => setViewMode("players")}
                className={`px-4 py-2 font-semibold transition-colors ${
                  viewMode === "players"
                    ? "text-emerald-400 border-b-2 border-emerald-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Players ({players.length})
              </button>
              {selectedTournament.status === "completed" && (
                <button
                  onClick={() => setViewMode("winners")}
                  className={`px-4 py-2 font-semibold transition-colors ${
                    viewMode === "winners"
                      ? "text-emerald-400 border-b-2 border-emerald-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Winners ({winners.length})
                </button>
              )}
            </div>

            {/* Details View - Table Hologram Style (Like Rummy) */}
            {viewMode === "details" && (
              <div className="space-y-6">
                {/* Poker Table Visualization */}
                <div className="relative w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-8 border border-slate-700">
                  {/* Prize Pool - Top of Table */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-br from-emerald-600 via-green-500 to-emerald-500 border-2 border-emerald-400/80 px-6 py-3 rounded-lg text-center shadow-xl">
                      <div className="text-emerald-200 text-xs font-semibold uppercase tracking-wider">
                        Prize Pool
                      </div>
                      <div className="text-white text-2xl font-bold">
                        ₹{(selectedTournament.prize_pool || (selectedTournament.buy_in * (players.length || selectedTournament.registered_players || 0))).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Poker Table - Standard Oval Shape */}
                  <div className="relative w-full max-w-lg mx-auto mt-16 mb-8" style={{ aspectRatio: '1.8 / 1' }}>
                    {/* Outer Rail - Dark Wood */}
                    <div className="absolute inset-0 rounded-[50%] bg-gradient-to-br from-amber-900 via-yellow-900 to-amber-950 shadow-2xl" style={{ borderRadius: '50%' }}>
                      {/* Padding Rail */}
                      <div className="absolute inset-2 rounded-[50%] bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700" style={{ borderRadius: '50%' }}>
                        {/* Green Felt Surface */}
                        <div className="absolute inset-2 rounded-[50%] bg-gradient-to-br from-emerald-700 via-green-800 to-emerald-900 shadow-inner flex items-center justify-center" style={{ borderRadius: '50%' }}>
                          {/* Subtle felt line */}
                          <div className="absolute inset-6 rounded-[50%] border border-emerald-600/30" style={{ borderRadius: '50%' }}></div>
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
                              ♠
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Session Timer + Level Tracker for Active Tournament */}
                  {liveTournament?.status === 'active' && liveTournament?.session_started_at && (
                    <div className="mt-6 space-y-3">
                      {/* Main Timer Bar */}
                      {(() => {
                        const isPaused = !!liveTournament?.paused_at;
                        return (
                          <div className={`${isPaused ? 'bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-yellow-500/30' : 'bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-green-500/30'} border rounded-xl p-4`}>
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
                                  <button
                                    onClick={handleResumeTournament}
                                    disabled={resumeMutation.isLoading}
                                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-1"
                                  >
                                    ▶ Resume
                                  </button>
                                ) : (
                                  <button
                                    onClick={handlePauseTournament}
                                    disabled={pauseMutation.isLoading}
                                    className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-1"
                                  >
                                    ⏸ Pause
                                  </button>
                                )}
                                <button
                                  onClick={handleStopTournament}
                                  disabled={stopMutation.isLoading}
                                  className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-1"
                                >
                                  ⏹ Stop
                                </button>
                              </div>
                            </div>
                            {isPaused && (
                              <div className="mt-2 text-yellow-400/70 text-xs text-center">
                                Tournament paused since {new Date(liveTournament.paused_at).toLocaleTimeString('en-US', { hour12: true })}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Level Info */}
                      {levelInfo && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className={`rounded-lg p-3 text-center border ${levelInfo.onBreak ? 'bg-yellow-900/30 border-yellow-500/30' : 'bg-blue-900/30 border-blue-500/30'}`}>
                            <div className={`text-xs mb-1 ${levelInfo.onBreak ? 'text-yellow-400' : 'text-blue-400'}`}>
                              {levelInfo.onBreak ? 'ON BREAK' : 'Current Level'}
                            </div>
                            <div className={`text-2xl font-bold ${levelInfo.onBreak ? 'text-yellow-300' : 'text-blue-300'}`}>
                              {levelInfo.onBreak ? `${levelInfo.breakTimeRemaining}m` : `${levelInfo.currentLevel} / ${levelInfo.numberOfLevels}`}
                            </div>
                          </div>
                          <div className="bg-purple-900/30 rounded-lg p-3 text-center border border-purple-500/30">
                            <div className="text-purple-400 text-xs mb-1">Time Left in Level</div>
                            <div className="text-2xl font-bold text-purple-300 font-mono tabular-nums">
                              {levelInfo.onBreak ? '--:--' : `${Math.floor(levelInfo.timeRemainingSeconds / 60)}:${(levelInfo.timeRemainingSeconds % 60).toString().padStart(2, '0')}`}
                            </div>
                          </div>
                          <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
                            <div className="text-slate-400 text-xs mb-1">Level Duration</div>
                            <div className="text-lg font-bold text-white">{levelInfo.minutesPerLevel} min</div>
                          </div>
                          <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
                            <div className="text-slate-400 text-xs mb-1">Features</div>
                            <div className="flex flex-wrap gap-1 justify-center">
                              {levelInfo.allowRebuys && <span className="text-xs px-1.5 py-0.5 rounded bg-green-600/20 text-green-400 border border-green-500/30">Rebuy</span>}
                              {levelInfo.allowReentry && <span className="text-xs px-1.5 py-0.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30">Re-entry</span>}
                              {levelInfo.allowAddon && <span className="text-xs px-1.5 py-0.5 rounded bg-purple-600/20 text-purple-400 border border-purple-500/30">Add-on</span>}
                              {levelInfo.lateRegOpen && <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-600/20 text-yellow-400 border border-yellow-500/30">Late Reg Open</span>}
                              {!levelInfo.allowRebuys && !levelInfo.allowReentry && !levelInfo.allowAddon && <span className="text-xs text-gray-500">Freezeout</span>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tournament Info Below Table */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
                      <div className="text-slate-400 text-xs mb-1">Type</div>
                      <div className="text-white font-semibold text-sm">{selectedTournament.tournament_type || 'Tournament'}</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
                      <div className="text-slate-400 text-xs mb-1">Buy-In</div>
                      <div className="text-white font-semibold text-sm">₹{selectedTournament.buy_in}</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
                      <div className="text-slate-400 text-xs mb-1">Players</div>
                      <div className="text-white font-semibold text-sm">{players.length || selectedTournament.registered_players || 0}/{selectedTournament.max_players}</div>
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
                  let structure = t.structure || {};
                  if (typeof structure === 'string') {
                    try { structure = JSON.parse(structure); } catch { structure = {}; }
                  }
                  
                  const detailRows = [
                    { label: 'Tournament ID', value: t.id?.substring(0, 8), mono: true },
                    { label: 'Tournament Type', value: structure.tournament_type || t.tournament_type },
                    { label: 'Buy-In', value: t.buy_in ? `₹${Number(t.buy_in).toLocaleString()}` : null },
                    { label: 'Entry Fee', value: (structure.entry_fee || t.entry_fee) ? `₹${Number(structure.entry_fee || t.entry_fee).toLocaleString()}` : null },
                    { label: 'Starting Chips', value: (structure.starting_chips || t.starting_chips) ? Number(structure.starting_chips || t.starting_chips).toLocaleString() : null },
                    { label: 'Prize Pool', value: t.prize_pool ? `₹${Number(t.prize_pool).toLocaleString()}` : null },
                    { label: 'Blind Structure', value: structure.blind_structure || t.blind_structure },
                    { label: 'Number of Levels', value: structure.number_of_levels || t.number_of_levels },
                    { label: 'Minutes per Level', value: (structure.minutes_per_level || t.minutes_per_level) ? `${structure.minutes_per_level || t.minutes_per_level} min` : null },
                    { label: 'Break Structure', value: structure.break_structure || t.break_structure },
                    { label: 'Break Duration', value: (structure.break_duration || t.break_duration) ? `${structure.break_duration || t.break_duration} min` : null },
                    { label: 'Late Registration', value: (structure.late_registration || t.late_registration) ? `${structure.late_registration || t.late_registration} min` : null },
                    { label: 'Payout Structure', value: structure.payout_structure || t.payout_structure },
                    { label: 'Seat Draw Method', value: structure.seat_draw_method || t.seat_draw_method },
                    { label: 'Clock Pause Rules', value: structure.clock_pause_rules || t.clock_pause_rules },
                    { label: 'Allow Rebuys', value: (structure.allow_rebuys || t.allow_rebuys) ? 'Yes' : 'No', badge: true, positive: !!(structure.allow_rebuys || t.allow_rebuys) },
                    { label: 'Allow Re-entry', value: (structure.allow_reentry || t.allow_reentry) ? 'Yes' : 'No', badge: true, positive: !!(structure.allow_reentry || t.allow_reentry) },
                    { label: 'Allow Add-on', value: (structure.allow_addon || t.allow_addon) ? 'Yes' : 'No', badge: true, positive: !!(structure.allow_addon || t.allow_addon) },
                    { label: 'Bounty Amount', value: (structure.bounty_amount || t.bounty_amount) ? `₹${Number(structure.bounty_amount || t.bounty_amount).toLocaleString()}` : null },
                    { label: 'Max Players', value: t.max_players },
                    { label: 'Start Time', value: t.start_time ? new Date(t.start_time).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', hour12: true }) : null },
                    { label: 'Session Started', value: t.session_started_at ? new Date(t.session_started_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', hour12: true }) : null },
                  ].filter(r => r.value !== null && r.value !== undefined && r.value !== '' && r.value !== 'N/A');
                  
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
                        onClick={() => {
                          setShowDetailsModal(false);
                          handleEditTournament(selectedTournament);
                        }}
                        className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg"
                      >
                        Edit Tournament
                      </button>
                      <button
                        onClick={() => handleStartTournament(selectedTournament.id)}
                        disabled={startMutation.isLoading}
                        className="flex-1 bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg disabled:opacity-50"
                      >
                        Start Tournament
                      </button>
                    </>
                  )}
                  {selectedTournament.status === 'active' && (
                    <>
                      <button
                        onClick={() => setShowEndModal(true)}
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
            )}

            {/* Players View */}
            {viewMode === "players" && (
              <div className="space-y-4">
                {/* Session Timer + Level Info in Players View */}
                {liveTournament?.status === 'active' && liveTournament?.session_started_at && (
                  <div className={`${liveTournament?.paused_at ? 'bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-yellow-500/20' : 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/20'} border rounded-lg p-3 space-y-2`}>
                    <div className="flex items-center justify-between">
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
                    {levelInfo && (
                      <div className="flex items-center gap-4 text-sm flex-wrap">
                        <span className={`font-semibold ${levelInfo.onBreak ? 'text-yellow-400' : 'text-blue-400'}`}>
                          {levelInfo.onBreak ? `BREAK (${levelInfo.breakTimeRemaining}m left)` : `Level ${levelInfo.currentLevel}/${levelInfo.numberOfLevels}`}
                        </span>
                        {!levelInfo.onBreak && (
                          <span className="text-purple-400 font-mono tabular-nums">
                            {Math.floor(levelInfo.timeRemainingSeconds / 60)}:{(levelInfo.timeRemainingSeconds % 60).toString().padStart(2, '0')} left
                          </span>
                        )}
                        {levelInfo.lateRegOpen && (
                          <span className="text-xs px-2 py-0.5 rounded bg-yellow-600/20 text-yellow-400 border border-yellow-500/30">Late Reg Open</span>
                        )}
                        <div className="flex gap-1 ml-auto">
                          {levelInfo.allowRebuys && <span className="text-xs px-1.5 py-0.5 rounded bg-green-600/20 text-green-400">Rebuy</span>}
                          {levelInfo.allowReentry && <span className="text-xs px-1.5 py-0.5 rounded bg-blue-600/20 text-blue-400">Re-entry</span>}
                          {levelInfo.allowAddon && <span className="text-xs px-1.5 py-0.5 rounded bg-purple-600/20 text-purple-400">Add-on</span>}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {playersLoading ? (
                  <div className="text-white text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                    <p>Loading players...</p>
                  </div>
                ) : players.length === 0 ? (
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
                        {players.map((player) => {
                          const walletBal = Number(player.wallet_balance || 0);
                          const totalCredits = Number(player.total_credits || 0);
                          const isExited = player.is_exited;
                          
                          // Calculate per-player session time
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
                              key={player.id}
                              className={`border-b border-slate-700/50 hover:bg-slate-700/30 ${isExited ? 'opacity-60' : ''}`}
                            >
                              <td className="py-3 px-4 text-white font-mono">{player.player_id}</td>
                              <td className="py-3 px-4 text-white">
                                {player.name}
                                {isExited && (
                                  <span className="ml-2 text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                                    Exited
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-white">{player.mobile}</td>
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
                                    <div className="flex flex-col items-center gap-1">
                                      {isExited ? (
                                        <span className="text-xs px-2 py-1 rounded bg-gray-600/20 text-gray-400 border border-gray-500/30">
                                          Out (₹{Number(player.exit_balance || 0).toFixed(0)})
                                        </span>
                                      ) : (
                                        <span className="text-xs px-2 py-1 rounded bg-green-600/20 text-green-400 border border-green-500/30">
                                          Playing
                                        </span>
                                      )}
                                      {Number(player.rebuy_count || 0) > 0 && (
                                        <span className="text-xs text-orange-400">
                                          {player.rebuy_count}x rebuy
                                        </span>
                                      )}
                                    </div>
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
                                    {isExited && levelInfo?.allowRebuys && (
                                      <button
                                        onClick={() => handleRebuy(player, 'rebuy')}
                                        disabled={rebuyMutation.isLoading}
                                        className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                                      >
                                        Rebuy
                                      </button>
                                    )}
                                    {isExited && levelInfo?.allowReentry && levelInfo?.lateRegOpen && (
                                      <button
                                        onClick={() => handleRebuy(player, 'reentry')}
                                        disabled={rebuyMutation.isLoading}
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                                      >
                                        Re-entry
                                      </button>
                                    )}
                                    {!isExited && levelInfo?.allowAddon && (
                                      <button
                                        onClick={() => handleRebuy(player, 'addon')}
                                        disabled={rebuyMutation.isLoading}
                                        className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                                      >
                                        Add-on
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
                {winners.length === 0 ? (
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
                        {winners.map((winner) => (
                          <tr key={winner.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                            <td className="py-3 px-4">
                              <span className="inline-block w-8 h-8 rounded-full bg-yellow-500 text-slate-900 font-bold flex items-center justify-center">
                                {winner.finishing_position}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-white font-mono">{winner.player_id}</td>
                            <td className="py-3 px-4 text-white">{winner.name}</td>
                            <td className="py-3 px-4 text-white">{winner.email}</td>
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
            {players.length > 0 && (
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
                      {players.map((player) => {
                        const walletBal = Number(player.wallet_balance || 0);
                        const totalInvested = Number(player.total_invested || selectedTournament.buy_in || 0);
                        const totalCredits = Number(player.total_credits || 0);
                        return (
                          <tr key={player.id} className={`border-b border-slate-700/30 ${player.is_exited ? 'opacity-50' : ''}`}>
                            <td className="py-2 px-3 text-white">{player.name} <span className="text-gray-500 text-xs">({player.player_id})</span></td>
                            <td className="py-2 px-3 text-right text-cyan-400 font-mono">₹{Number(selectedTournament.buy_in || 0).toFixed(0)}</td>
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
              Enter the winners and their prize amounts. Player balances will be automatically updated.
            </p>

            <div className="space-y-4 mb-6">
              {winnersForm.map((winner, index) => {
                const selectedPlayer = players.find(p => p.id === winner.player_id);
                return (
                  <div key={index} className="space-y-1">
                    <div className="grid grid-cols-12 gap-3 items-center">
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
                          {players.map((player) => (
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
                            updateWinner(index, "finishing_position", parseInt(e.target.value))
                          }
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                          placeholder="Prize Amount"
                          value={winner.prize_amount}
                          onChange={(e) => updateWinner(index, "prize_amount", parseFloat(e.target.value))}
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
                        <span>Initial: <span className="text-cyan-400 font-semibold">₹{Number(selectedTournament.buy_in || 0).toFixed(0)}</span></span>
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
                <span className="text-yellow-400 font-semibold">
                  ₹{Number(exitingPlayer.total_credits || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm mb-1 block">Exit Balance (Amount to credit back)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                  placeholder="₹0.00 (leave empty if bust)"
                  value={exitBalance}
                  onChange={(e) => setExitBalance(e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Leave at 0 or empty if the player went bust (zero or negative balance).
                </p>
              </div>

              <div>
                <label className="text-white text-sm mb-1 block">Notes (Optional)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                  placeholder="Reason for exit..."
                  value={exitNotes}
                  onChange={(e) => setExitNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleConfirmExitPlayer}
                disabled={exitPlayerMutation.isLoading}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {exitPlayerMutation.isLoading ? "Exiting..." : `Exit Player${exitBalance ? ` (₹${exitBalance})` : ' (Bust)'}`}
              </button>
              <button
                onClick={() => {
                  setShowExitPlayerModal(false);
                  setExitingPlayer(null);
                  setExitBalance("");
                  setExitNotes("");
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

