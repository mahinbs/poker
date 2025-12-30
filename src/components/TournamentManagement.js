import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tournamentsAPI, clubsAPI } from "../lib/api";
import toast from "react-hot-toast";

export default function TournamentManagement({ selectedClubId }) {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [editingTournament, setEditingTournament] = useState(null);
  const [viewMode, setViewMode] = useState("details"); // 'details' or 'players'
  const [clubLogoUrl, setClubLogoUrl] = useState(null);

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

  // Fetch tournament players
  const { data: playersData, isLoading: playersLoading } = useQuery({
    queryKey: ["tournament-players", selectedClubId, selectedTournament?.id],
    queryFn: () => tournamentsAPI.getTournamentPlayers(selectedClubId, selectedTournament.id),
    enabled: !!selectedClubId && !!selectedTournament && showDetailsModal,
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
  const players = playersData?.players || [];
  const winners = winnersData?.winners || [];

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
                  <button
                    onClick={() => {
                      setSelectedTournament(tournament);
                      setShowEndModal(true);
                    }}
                    className="flex-1 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    End Tournament
                  </button>
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
                {/* Table Hologram Visualization */}
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

                  {/* Poker Table - Round Shape */}
                  <div className="relative aspect-[1/1] max-w-md mx-auto mt-16 mb-8">
                    {/* Table Background with Emerald Border */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-600 via-green-500 to-emerald-600 p-3 shadow-2xl">
                      {/* Green Felt Surface */}
                      <div className="absolute inset-3 rounded-full bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 shadow-inner">
                        {/* Seats arranged in circle */}
                        {Array.from(
                          { length: selectedTournament.max_players || 9 },
                          (_, index) => {
                            const seatNumber = index + 1;
                            const angle = (360 / (selectedTournament.max_players || 9)) * (index) - 90;
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
                                🏆
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

                {/* Additional Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Tournament ID</p>
                      <p className="text-white font-mono">{selectedTournament.id?.substring(0, 8) || 'N/A'}</p>
                  </div>
                  <div>
                      <p className="text-sm text-gray-400">Starting Chips</p>
                      <p className="text-white">{selectedTournament.starting_chips?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Entry Fee</p>
                    <p className="text-white">₹{selectedTournament.entry_fee || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Blind Structure</p>
                    <p className="text-white">{selectedTournament.blind_structure}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Number of Levels</p>
                    <p className="text-white">{selectedTournament.number_of_levels}</p>
                  </div>
                  </div>

                  <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Minutes per Level</p>
                      <p className="text-white">{selectedTournament.minutes_per_level} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Break Structure</p>
                    <p className="text-white">{selectedTournament.break_structure}</p>
                  </div>
                    <div>
                      <p className="text-sm text-gray-400">Break Duration</p>
                      <p className="text-white">{selectedTournament.break_duration || 'N/A'} minutes</p>
                    </div>
                  <div>
                    <p className="text-sm text-gray-400">Payout Structure</p>
                    <p className="text-white">{selectedTournament.payout_structure}</p>
                  </div>
                  <div>
                      <p className="text-sm text-gray-400">Late Registration</p>
                      <p className="text-white">{selectedTournament.late_registration} minutes</p>
                  </div>
                  </div>
                </div>

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
                    <button
                      onClick={() => setShowEndModal(true)}
                      className="flex-1 bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg"
                    >
                      End Tournament
                    </button>
                  )}
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
                        {players.map((player) => (
                          <tr key={player.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                            <td className="py-3 px-4 text-white font-mono">{player.player_id}</td>
                            <td className="py-3 px-4 text-white">{player.name}</td>
                            <td className="py-3 px-4 text-white">{player.email}</td>
                            <td className="py-3 px-4 text-white">{player.mobile}</td>
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
          <div className="bg-slate-800 rounded-xl p-6 max-w-4xl w-full border border-orange-600 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">
              End Tournament: {selectedTournament.name}
            </h2>

            <p className="text-gray-300 mb-4">
              Enter the winners and their prize amounts. Player balances will be automatically updated.
            </p>

            <div className="space-y-4 mb-6">
              {winnersForm.map((winner, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-center">
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

