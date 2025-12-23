import React, { useState } from "react";
import CustomSelect from "./common/CustomSelect";

export default function TournamentManagementSection({
  userRole = "manager", // "superadmin", "admin", "manager", "cashier", "gre"
  tournaments: propTournaments = null,
  setTournaments: propSetTournaments = null,
}) {
  // Role-based permissions
  const canCreateTournament = ["superadmin", "admin", "manager"].includes(userRole);
  const canEditTournament = ["superadmin", "admin", "manager"].includes(userRole);
  const canDeleteTournament = ["superadmin", "admin", "manager"].includes(userRole);
  const canStartTournament = ["superadmin", "admin", "manager"].includes(userRole);

  // Tournament types
  const tournamentTypes = [
    "No Limit Hold'em",
    "Pot Limit Omaha",
    "Pot Limit Omaha Hi-Lo",
    "Limit Hold'em",
    "Seven Card Stud",
    "Seven Card Stud Hi-Lo",
    "HORSE (Mixed)",
    "8-Game Mix",
    "Triple Draw Lowball",
    "Razz",
    "Badugi",
  ];

  // Blind structures
  const blindStructures = [
    "Standard",
    "Turbo",
    "Super Turbo",
    "Deep Stack",
    "Hyper Turbo",
    "Custom",
  ];

  // Break structures
  const breakStructures = [
    "Every 4 levels",
    "Every 6 levels",
    "Every 8 levels",
    "Every 10 levels",
    "No breaks",
    "Custom",
  ];

  // Payout structures
  const payoutStructures = [
    "Top 10%",
    "Top 15%",
    "Top 20%",
    "Top 25%",
    "Winner takes all",
    "Top 3",
    "Top 5",
    "Top 9",
    "Custom",
  ];

  // Default tournaments data
  const defaultTournaments = [
    {
      id: "T001",
      name: "Monday Night Hold'em",
      type: "No Limit Hold'em",
      status: "Scheduled",
      buyIn: 1000,
      entryFee: 100,
      startingChips: 10000,
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      registeredPlayers: 12,
      maxPlayers: 100,
      blindStructure: "Standard",
      blindLevels: 15,
      rebuyAllowed: false,
      addOnAllowed: true,
      reEntryAllowed: false,
      bountyAmount: 0,
      lateRegistration: 60,
      breakStructure: "Every 4 levels",
      payoutStructure: "Top 15%",
      createdBy: "Manager",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Manage tournaments state
  const [internalTournaments, setInternalTournaments] = useState(defaultTournaments);
  const tournaments = propTournaments !== null ? propTournaments : internalTournaments;
  const setTournaments = propSetTournaments || setInternalTournaments;

  const [tournamentForm, setTournamentForm] = useState({
    name: "",
    type: "No Limit Hold'em",
    buyIn: "",
    entryFee: "",
    startingChips: "",
    startTime: "",
    maxPlayers: "",
    blindStructure: "Standard",
    blindLevels: 15,
    blindInterval: 15,
    rebuyAllowed: false,
    rebuyChips: "",
    rebuyFee: "",
    rebuyPeriod: "",
    addOnAllowed: false,
    addOnChips: "",
    addOnFee: "",
    reEntryAllowed: false,
    reEntryPeriod: "",
    bountyAmount: "",
    lateRegistration: 60,
    breakStructure: "Every 4 levels",
    breakDuration: 10,
    payoutStructure: "Top 15%",
    seatDrawMethod: "Random",
    clockPauseRules: "Standard",
  });

  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showTournamentForm, setShowTournamentForm] = useState(false);
  const [editingTournament, setEditingTournament] = useState(null);

  // Handle tournament creation
  const handleCreateTournament = () => {
    if (
      !tournamentForm.name ||
      !tournamentForm.buyIn ||
      !tournamentForm.startingChips
    ) {
      alert("Please fill in all required fields");
      return;
    }
    const newTournament = {
      id: `T${Date.now().toString().slice(-6)}`,
      name: tournamentForm.name,
      type: tournamentForm.type,
      status: "Scheduled",
      buyIn: parseFloat(tournamentForm.buyIn),
      entryFee: parseFloat(tournamentForm.entryFee) || 0,
      startingChips: parseFloat(tournamentForm.startingChips),
      startTime:
        tournamentForm.startTime ||
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      registeredPlayers: 0,
      maxPlayers: tournamentForm.maxPlayers
        ? parseInt(tournamentForm.maxPlayers)
        : null,
      blindStructure: tournamentForm.blindStructure,
      blindLevels: tournamentForm.blindLevels,
      rebuyAllowed: tournamentForm.rebuyAllowed,
      addOnAllowed: tournamentForm.addOnAllowed,
      reEntryAllowed: tournamentForm.reEntryAllowed,
      bountyAmount: tournamentForm.bountyAmount
        ? parseFloat(tournamentForm.bountyAmount)
        : 0,
      lateRegistration: tournamentForm.lateRegistration,
      breakStructure: tournamentForm.breakStructure,
      payoutStructure: tournamentForm.payoutStructure,
      createdBy: userRole === "superadmin" ? "Super Admin" : userRole === "admin" ? "Admin" : "Manager",
      createdAt: new Date().toISOString(),
      ...tournamentForm,
    };
    setTournaments((prev) => [newTournament, ...prev]);
    alert(`Tournament "${tournamentForm.name}" created successfully!`);
    setTournamentForm({
      name: "",
      type: "No Limit Hold'em",
      buyIn: "",
      entryFee: "",
      startingChips: "",
      startTime: "",
      maxPlayers: "",
      blindStructure: "Standard",
      blindLevels: 15,
      blindInterval: 15,
      rebuyAllowed: false,
      rebuyChips: "",
      rebuyFee: "",
      rebuyPeriod: "",
      addOnAllowed: false,
      addOnChips: "",
      addOnFee: "",
      reEntryAllowed: false,
      reEntryPeriod: "",
      bountyAmount: "",
      lateRegistration: 60,
      breakStructure: "Every 4 levels",
      breakDuration: 10,
      payoutStructure: "Top 15%",
      seatDrawMethod: "Random",
      clockPauseRules: "Standard",
    });
    setShowTournamentForm(false);
    setEditingTournament(null);
  };

  // Handle tournament edit
  const handleEditTournament = (tournament) => {
    if (!canEditTournament) return;
    setEditingTournament(tournament);
    setTournamentForm({
      name: tournament.name,
      type: tournament.type,
      buyIn: tournament.buyIn.toString(),
      entryFee: tournament.entryFee?.toString() || "",
      startingChips: tournament.startingChips.toString(),
      startTime: tournament.startTime ? new Date(tournament.startTime).toISOString().slice(0, 16) : "",
      maxPlayers: tournament.maxPlayers?.toString() || "",
      blindStructure: tournament.blindStructure,
      blindLevels: tournament.blindLevels,
      blindInterval: tournament.blindInterval || 15,
      rebuyAllowed: tournament.rebuyAllowed || false,
      rebuyChips: tournament.rebuyChips?.toString() || "",
      rebuyFee: tournament.rebuyFee?.toString() || "",
      rebuyPeriod: tournament.rebuyPeriod?.toString() || "",
      addOnAllowed: tournament.addOnAllowed || false,
      addOnChips: tournament.addOnChips?.toString() || "",
      addOnFee: tournament.addOnFee?.toString() || "",
      reEntryAllowed: tournament.reEntryAllowed || false,
      reEntryPeriod: tournament.reEntryPeriod?.toString() || "",
      bountyAmount: tournament.bountyAmount?.toString() || "",
      lateRegistration: tournament.lateRegistration || 60,
      breakStructure: tournament.breakStructure,
      breakDuration: tournament.breakDuration || 10,
      payoutStructure: tournament.payoutStructure,
      seatDrawMethod: tournament.seatDrawMethod || "Random",
      clockPauseRules: tournament.clockPauseRules || "Standard",
    });
    setShowTournamentForm(true);
    setSelectedTournament(null);
  };

  // Handle tournament update
  const handleUpdateTournament = () => {
    if (!editingTournament || !canEditTournament) return;
    if (
      !tournamentForm.name ||
      !tournamentForm.buyIn ||
      !tournamentForm.startingChips
    ) {
      alert("Please fill in all required fields");
      return;
    }
    const updatedTournament = {
      ...editingTournament,
      name: tournamentForm.name,
      type: tournamentForm.type,
      buyIn: parseFloat(tournamentForm.buyIn),
      entryFee: parseFloat(tournamentForm.entryFee) || 0,
      startingChips: parseFloat(tournamentForm.startingChips),
      startTime:
        tournamentForm.startTime ||
        editingTournament.startTime,
      maxPlayers: tournamentForm.maxPlayers
        ? parseInt(tournamentForm.maxPlayers)
        : null,
      blindStructure: tournamentForm.blindStructure,
      blindLevels: tournamentForm.blindLevels,
      rebuyAllowed: tournamentForm.rebuyAllowed,
      addOnAllowed: tournamentForm.addOnAllowed,
      reEntryAllowed: tournamentForm.reEntryAllowed,
      bountyAmount: tournamentForm.bountyAmount
        ? parseFloat(tournamentForm.bountyAmount)
        : 0,
      lateRegistration: tournamentForm.lateRegistration,
      breakStructure: tournamentForm.breakStructure,
      payoutStructure: tournamentForm.payoutStructure,
      ...tournamentForm,
    };
    setTournaments((prev) =>
      prev.map((t) => (t.id === editingTournament.id ? updatedTournament : t))
    );
    alert(`Tournament "${tournamentForm.name}" updated successfully!`);
    setTournamentForm({
      name: "",
      type: "No Limit Hold'em",
      buyIn: "",
      entryFee: "",
      startingChips: "",
      startTime: "",
      maxPlayers: "",
      blindStructure: "Standard",
      blindLevels: 15,
      blindInterval: 15,
      rebuyAllowed: false,
      rebuyChips: "",
      rebuyFee: "",
      rebuyPeriod: "",
      addOnAllowed: false,
      addOnChips: "",
      addOnFee: "",
      reEntryAllowed: false,
      reEntryPeriod: "",
      bountyAmount: "",
      lateRegistration: 60,
      breakStructure: "Every 4 levels",
      breakDuration: 10,
      payoutStructure: "Top 15%",
      seatDrawMethod: "Random",
      clockPauseRules: "Standard",
    });
    setShowTournamentForm(false);
    setEditingTournament(null);
  };

  // Handle tournament delete
  const handleDeleteTournament = (tournamentId) => {
    if (!canDeleteTournament) return;
    if (
      window.confirm(
        `Delete tournament "${tournaments.find((t) => t.id === tournamentId)?.name}"?`
      )
    ) {
      setTournaments((prev) => prev.filter((t) => t.id !== tournamentId));
    }
  };

  // Handle tournament start
  const handleStartTournament = (tournamentId) => {
    if (!canStartTournament) return;
    const tournament = tournaments.find((t) => t.id === tournamentId);
    if (tournament) {
      setTournaments((prev) =>
        prev.map((t) =>
          t.id === tournamentId ? { ...t, status: "Active" } : t
        )
      );
      alert(`Tournament "${tournament.name}" started!`);
    }
  };

  const resetForm = () => {
    setTournamentForm({
      name: "",
      type: "No Limit Hold'em",
      buyIn: "",
      entryFee: "",
      startingChips: "",
      startTime: "",
      maxPlayers: "",
      blindStructure: "Standard",
      blindLevels: 15,
      blindInterval: 15,
      rebuyAllowed: false,
      rebuyChips: "",
      rebuyFee: "",
      rebuyPeriod: "",
      addOnAllowed: false,
      addOnChips: "",
      addOnFee: "",
      reEntryAllowed: false,
      reEntryPeriod: "",
      bountyAmount: "",
      lateRegistration: 60,
      breakStructure: "Every 4 levels",
      breakDuration: 10,
      payoutStructure: "Top 15%",
      seatDrawMethod: "Random",
      clockPauseRules: "Standard",
    });
    setEditingTournament(null);
    setShowTournamentForm(false);
  };

  return (
    <div className="space-y-6">
      <section className="p-6 bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-orange-700/30 rounded-xl shadow-md border border-amber-800/40">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Tournament Management</h2>
          {canCreateTournament && (
            <button
              onClick={() => {
                if (editingTournament) {
                  resetForm();
                } else {
                  setShowTournamentForm(!showTournamentForm);
                }
              }}
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white px-6 py-2 rounded-lg font-semibold shadow-lg transition-all"
            >
              {showTournamentForm ? "Cancel" : "➕ Create Tournament"}
            </button>
          )}
        </div>

        {/* Create/Edit Tournament Form */}
        {showTournamentForm && canCreateTournament && (
          <div className="bg-white/10 p-6 rounded-lg border border-amber-400/30 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingTournament ? "Edit Tournament" : "Create New Tournament"}
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-white font-semibold border-b border-white/20 pb-2">
                  Basic Information
                </h4>
                <div>
                  <label className="text-white text-sm mb-1 block">
                    Tournament Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                    placeholder="Monday Night Hold'em"
                    value={tournamentForm.name}
                    onChange={(e) =>
                      setTournamentForm({
                        ...tournamentForm,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-white text-sm mb-1 block">
                    Tournament Type *
                  </label>
                  <CustomSelect
                    className="w-full"
                    value={tournamentForm.type}
                    onChange={(e) =>
                      setTournamentForm({
                        ...tournamentForm,
                        type: e.target.value,
                      })
                    }
                  >
                    {tournamentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </CustomSelect>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white text-sm mb-1 block">
                      Buy-in (₹) *
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      placeholder="1000"
                      value={tournamentForm.buyIn}
                      onChange={(e) =>
                        setTournamentForm({
                          ...tournamentForm,
                          buyIn: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm mb-1 block">
                      Entry Fee (₹)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      placeholder="100"
                      value={tournamentForm.entryFee}
                      onChange={(e) =>
                        setTournamentForm({
                          ...tournamentForm,
                          entryFee: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="text-white text-sm mb-1 block">
                    Starting Chips *
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                    placeholder="10000"
                    value={tournamentForm.startingChips}
                    onChange={(e) =>
                      setTournamentForm({
                        ...tournamentForm,
                        startingChips: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white text-sm mb-1 block">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      value={tournamentForm.startTime}
                      onChange={(e) =>
                        setTournamentForm({
                          ...tournamentForm,
                          startTime: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm mb-1 block">
                      Max Players (unlimited if blank)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      placeholder="Unlimited"
                      value={tournamentForm.maxPlayers}
                      onChange={(e) =>
                        setTournamentForm({
                          ...tournamentForm,
                          maxPlayers: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-white font-semibold border-b border-white/20 pb-2">
                  Tournament Rules
                </h4>
                <div>
                  <label className="text-white text-sm mb-1 block">
                    Blind Structure *
                  </label>
                  <CustomSelect
                    className="w-full"
                    value={tournamentForm.blindStructure}
                    onChange={(e) =>
                      setTournamentForm({
                        ...tournamentForm,
                        blindStructure: e.target.value,
                      })
                    }
                  >
                    {blindStructures.map((structure) => (
                      <option key={structure} value={structure}>
                        {structure}
                      </option>
                    ))}
                  </CustomSelect>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white text-sm mb-1 block">
                      Number of Levels
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      placeholder="15"
                      value={tournamentForm.blindLevels}
                      onChange={(e) =>
                        setTournamentForm({
                          ...tournamentForm,
                          blindLevels: parseInt(e.target.value) || 15,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm mb-1 block">
                      Minutes per Level
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      placeholder="15"
                      value={tournamentForm.blindInterval}
                      onChange={(e) =>
                        setTournamentForm({
                          ...tournamentForm,
                          blindInterval: parseInt(e.target.value) || 15,
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="text-white text-sm mb-1 block">
                    Break Structure
                  </label>
                  <CustomSelect
                    className="w-full"
                    value={tournamentForm.breakStructure}
                    onChange={(e) =>
                      setTournamentForm({
                        ...tournamentForm,
                        breakStructure: e.target.value,
                      })
                    }
                  >
                    {breakStructures.map((structure) => (
                      <option key={structure} value={structure}>
                        {structure}
                      </option>
                    ))}
                  </CustomSelect>
                </div>
                {tournamentForm.breakStructure !== "No breaks" && (
                  <div>
                    <label className="text-white text-sm mb-1 block">
                      Break Duration (minutes)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      placeholder="10"
                      value={tournamentForm.breakDuration}
                      onChange={(e) =>
                        setTournamentForm({
                          ...tournamentForm,
                          breakDuration: parseInt(e.target.value) || 10,
                        })
                      }
                    />
                  </div>
                )}
                <div>
                  <label className="text-white text-sm mb-1 block">
                    Late Registration (minutes)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                    placeholder="60"
                    value={tournamentForm.lateRegistration}
                    onChange={(e) =>
                      setTournamentForm({
                        ...tournamentForm,
                        lateRegistration: parseInt(e.target.value) || 60,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-white text-sm mb-1 block">
                    Payout Structure
                  </label>
                  <CustomSelect
                    className="w-full"
                    value={tournamentForm.payoutStructure}
                    onChange={(e) =>
                      setTournamentForm({
                        ...tournamentForm,
                        payoutStructure: e.target.value,
                      })
                    }
                  >
                    {payoutStructures.map((structure) => (
                      <option key={structure} value={structure}>
                        {structure}
                      </option>
                    ))}
                  </CustomSelect>
                </div>
                <div>
                  <label className="text-white text-sm mb-1 block">
                    Seat Draw Method
                  </label>
                  <CustomSelect
                    className="w-full"
                    value={tournamentForm.seatDrawMethod}
                    onChange={(e) =>
                      setTournamentForm({
                        ...tournamentForm,
                        seatDrawMethod: e.target.value,
                      })
                    }
                  >
                    <option value="Random">Random</option>
                    <option value="Table Balance">Table Balance</option>
                    <option value="Manual">Manual</option>
                  </CustomSelect>
                </div>
                <div>
                  <label className="text-white text-sm mb-1 block">
                    Clock Pause Rules
                  </label>
                  <CustomSelect
                    className="w-full"
                    value={tournamentForm.clockPauseRules}
                    onChange={(e) =>
                      setTournamentForm({
                        ...tournamentForm,
                        clockPauseRules: e.target.value,
                      })
                    }
                  >
                    <option value="Standard">Standard (pause on breaks)</option>
                    <option value="No Pause">No Pause</option>
                    <option value="Pause on All-in">Pause on All-in</option>
                    <option value="Custom">Custom</option>
                  </CustomSelect>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-white font-semibold border-b border-white/20 pb-2">
                  Rebuy, Add-on & Re-entry
                </h4>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="rebuy-allowed"
                    className="w-4 h-4"
                    checked={tournamentForm.rebuyAllowed}
                    onChange={(e) =>
                      setTournamentForm({
                        ...tournamentForm,
                        rebuyAllowed: e.target.checked,
                      })
                    }
                  />
                  <label htmlFor="rebuy-allowed" className="text-white text-sm">
                    Allow Rebuys
                  </label>
                </div>
                {tournamentForm.rebuyAllowed && (
                  <div className="grid grid-cols-3 gap-3 ml-7">
                    <div>
                      <label className="text-white text-xs mb-1 block">
                        Rebuy Chips
                      </label>
                      <input
                        type="number"
                        className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                        placeholder="10000"
                        value={tournamentForm.rebuyChips}
                        onChange={(e) =>
                          setTournamentForm({
                            ...tournamentForm,
                            rebuyChips: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-white text-xs mb-1 block">
                        Rebuy Fee (₹)
                      </label>
                      <input
                        type="number"
                        className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                        placeholder="1000"
                        value={tournamentForm.rebuyFee}
                        onChange={(e) =>
                          setTournamentForm({
                            ...tournamentForm,
                            rebuyFee: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-white text-xs mb-1 block">
                        Rebuy Period (levels)
                      </label>
                      <input
                        type="number"
                        className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                        placeholder="6"
                        value={tournamentForm.rebuyPeriod}
                        onChange={(e) =>
                          setTournamentForm({
                            ...tournamentForm,
                            rebuyPeriod: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="addon-allowed"
                    className="w-4 h-4"
                    checked={tournamentForm.addOnAllowed}
                    onChange={(e) =>
                      setTournamentForm({
                        ...tournamentForm,
                        addOnAllowed: e.target.checked,
                      })
                    }
                  />
                  <label htmlFor="addon-allowed" className="text-white text-sm">
                    Allow Add-on
                  </label>
                </div>
                {tournamentForm.addOnAllowed && (
                  <div className="grid grid-cols-2 gap-3 ml-7">
                    <div>
                      <label className="text-white text-xs mb-1 block">
                        Add-on Chips
                      </label>
                      <input
                        type="number"
                        className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                        placeholder="10000"
                        value={tournamentForm.addOnChips}
                        onChange={(e) =>
                          setTournamentForm({
                            ...tournamentForm,
                            addOnChips: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-white text-xs mb-1 block">
                        Add-on Fee (₹)
                      </label>
                      <input
                        type="number"
                        className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                        placeholder="500"
                        value={tournamentForm.addOnFee}
                        onChange={(e) =>
                          setTournamentForm({
                            ...tournamentForm,
                            addOnFee: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="reentry-allowed"
                    className="w-4 h-4"
                    checked={tournamentForm.reEntryAllowed}
                    onChange={(e) =>
                      setTournamentForm({
                        ...tournamentForm,
                        reEntryAllowed: e.target.checked,
                      })
                    }
                  />
                  <label htmlFor="reentry-allowed" className="text-white text-sm">
                    Allow Re-entry
                  </label>
                </div>
                {tournamentForm.reEntryAllowed && (
                  <div className="ml-7">
                    <label className="text-white text-xs mb-1 block">
                      Re-entry Period (minutes)
                    </label>
                    <input
                      type="number"
                      className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                      placeholder="60"
                      value={tournamentForm.reEntryPeriod}
                      onChange={(e) =>
                        setTournamentForm({
                          ...tournamentForm,
                          reEntryPeriod: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <h4 className="text-white font-semibold border-b border-white/20 pb-2">
                  Bounty Options
                </h4>
                <div>
                  <label className="text-white text-sm mb-1 block">
                    Bounty Amount (₹) - Leave blank for regular tournament
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                    placeholder="0"
                    value={tournamentForm.bountyAmount}
                    onChange={(e) =>
                      setTournamentForm({
                        ...tournamentForm,
                        bountyAmount: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    If set, this becomes a knockout/bounty tournament
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={editingTournament ? handleUpdateTournament : handleCreateTournament}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
              >
                {editingTournament ? "Update Tournament" : "Create Tournament"}
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tournaments List */}
        <div className="bg-white/10 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">
            Tournaments ({tournaments.length})
          </h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {tournaments.length > 0 ? (
              tournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="bg-white/5 p-4 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                  style={{ cursor: canEditTournament ? 'pointer' : 'default' }}
                  onClick={() => canEditTournament && setSelectedTournament(tournament)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-white font-semibold text-lg">
                          {tournament.name}
                        </h4>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            tournament.status === "Active"
                              ? "bg-green-500/30 text-green-300 border border-green-400/50"
                              : tournament.status === "Scheduled"
                              ? "bg-blue-500/30 text-blue-300 border border-blue-400/50"
                              : "bg-gray-500/30 text-gray-300 border border-gray-400/50"
                          }`}
                        >
                          {tournament.status}
                        </span>
                        <span className="px-2 py-1 rounded text-xs bg-purple-500/30 text-purple-300 border border-purple-400/50">
                          {tournament.type}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-300">
                        <div>
                          <span className="text-gray-400">Buy-in:</span>{" "}
                          <span className="text-white font-semibold">
                            ₹{tournament.buyIn.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Starting Chips:</span>{" "}
                          <span className="text-white font-semibold">
                            {tournament.startingChips.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Registered:</span>{" "}
                          <span className="text-white font-semibold">
                            {tournament.registeredPlayers}
                            {tournament.maxPlayers
                              ? `/${tournament.maxPlayers}`
                              : "/∞"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Start:</span>{" "}
                          <span className="text-white">
                            {new Date(tournament.startTime).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tournament.rebuyAllowed && (
                          <span className="px-2 py-1 rounded text-xs bg-yellow-500/30 text-yellow-300 border border-yellow-400/50">
                            Rebuy
                          </span>
                        )}
                        {tournament.addOnAllowed && (
                          <span className="px-2 py-1 rounded text-xs bg-blue-500/30 text-blue-300 border border-blue-400/50">
                            Add-on
                          </span>
                        )}
                        {tournament.reEntryAllowed && (
                          <span className="px-2 py-1 rounded text-xs bg-purple-500/30 text-purple-300 border border-purple-400/50">
                            Re-entry
                          </span>
                        )}
                        {tournament.bountyAmount > 0 && (
                          <span className="px-2 py-1 rounded text-xs bg-red-500/30 text-red-300 border border-red-400/50">
                            Bounty ₹{tournament.bountyAmount}
                          </span>
                        )}
                        <span className="px-2 py-1 rounded text-xs bg-indigo-500/30 text-indigo-300 border border-indigo-400/50">
                          {tournament.blindStructure}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTournament(tournament);
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold"
                      >
                        View Details
                      </button>
                      {canStartTournament && tournament.status === "Scheduled" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartTournament(tournament.id);
                          }}
                          className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm font-semibold"
                        >
                          Start
                        </button>
                      )}
                      {canEditTournament && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTournament(tournament);
                          }}
                          className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm font-semibold"
                        >
                          Edit
                        </button>
                      )}
                      {canDeleteTournament && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTournament(tournament.id);
                          }}
                          className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                <div className="text-lg mb-2">No tournaments created yet</div>
                <div className="text-sm">
                  {canCreateTournament
                    ? 'Click "Create Tournament" to get started'
                    : "No tournaments available"}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tournament Details Modal */}
      {selectedTournament && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTournament(null)}
        >
          <div
            className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl shadow-2xl border border-amber-500/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {selectedTournament.name}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Tournament Details & Settings
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTournament(null)}
                  className="text-white/70 hover:text-white text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">
                    Basic Info
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-400 text-xs">Tournament ID</label>
                      <div className="text-white font-medium">
                        {selectedTournament.id}
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs">Type</label>
                      <div className="text-white">{selectedTournament.type}</div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs">Status</label>
                      <div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs border font-medium ${
                            selectedTournament.status === "Active"
                              ? "bg-green-500/30 text-green-300 border-green-400/50"
                              : selectedTournament.status === "Scheduled"
                              ? "bg-blue-500/30 text-blue-300 border-blue-400/50"
                              : "bg-gray-500/30 text-gray-300 border-gray-400/50"
                          }`}
                        >
                          {selectedTournament.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs">Buy-in</label>
                      <div className="text-white font-semibold">
                        ₹{selectedTournament.buyIn.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs">Entry Fee</label>
                      <div className="text-white">
                        ₹{selectedTournament.entryFee?.toLocaleString("en-IN") || 0}
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs">Starting Chips</label>
                      <div className="text-white font-semibold">
                        {selectedTournament.startingChips.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">
                    Structure
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-400 text-xs">Blind Structure</label>
                      <div className="text-white">
                        {selectedTournament.blindStructure}
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs">Blind Levels</label>
                      <div className="text-white">
                        {selectedTournament.blindLevels} levels
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs">Break Structure</label>
                      <div className="text-white">
                        {selectedTournament.breakStructure}
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs">Payout Structure</label>
                      <div className="text-white">
                        {selectedTournament.payoutStructure}
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs">Players</label>
                      <div className="text-white">
                        {selectedTournament.registeredPlayers}
                        {selectedTournament.maxPlayers
                          ? ` / ${selectedTournament.maxPlayers}`
                          : " / Unlimited"}
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs">Start Time</label>
                      <div className="text-white">
                        {new Date(selectedTournament.startTime).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Rules & Options
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white/5 rounded border border-white/10">
                    <div className="text-xs text-gray-400 mb-1">Rebuy</div>
                    <div
                      className={`text-sm font-semibold ${
                        selectedTournament.rebuyAllowed
                          ? "text-green-300"
                          : "text-gray-500"
                      }`}
                    >
                      {selectedTournament.rebuyAllowed
                        ? "✓ Allowed"
                        : "✗ Not Allowed"}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded border border-white/10">
                    <div className="text-xs text-gray-400 mb-1">Add-on</div>
                    <div
                      className={`text-sm font-semibold ${
                        selectedTournament.addOnAllowed
                          ? "text-green-300"
                          : "text-gray-500"
                      }`}
                    >
                      {selectedTournament.addOnAllowed
                        ? "✓ Allowed"
                        : "✗ Not Allowed"}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded border border-white/10">
                    <div className="text-xs text-gray-400 mb-1">Re-entry</div>
                    <div
                      className={`text-sm font-semibold ${
                        selectedTournament.reEntryAllowed
                          ? "text-green-300"
                          : "text-gray-500"
                      }`}
                    >
                      {selectedTournament.reEntryAllowed
                        ? "✓ Allowed"
                        : "✗ Not Allowed"}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded border border-white/10">
                    <div className="text-xs text-gray-400 mb-1">Bounty</div>
                    <div
                      className={`text-sm font-semibold ${
                        selectedTournament.bountyAmount > 0
                          ? "text-red-300"
                          : "text-gray-500"
                      }`}
                    >
                      {selectedTournament.bountyAmount > 0
                        ? `₹${selectedTournament.bountyAmount}`
                        : "None"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-white/10">
                {canEditTournament && (
                  <button
                    onClick={() => {
                      handleEditTournament(selectedTournament);
                      setSelectedTournament(null);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold"
                  >
                    Edit Tournament
                  </button>
                )}
                <button
                  onClick={() => setSelectedTournament(null)}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-3 rounded-lg font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

