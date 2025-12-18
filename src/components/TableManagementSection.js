import TableView from "./hologram/TableView";
import CustomSelect from "./common/CustomSelect";
import { useState } from "react";

export default function TableManagementSection({
  userRole = "cashier", // "cashier", "admin", "superadmin", "manager"
  tables = [],
  playerBalances = {},
  tableBalances = {},
  occupiedSeats = {},
  mockPlayers = [],
  onSeatAssign = null,
  showTableView = false,
  setShowTableView = null,
  setSelectedPlayerForSeating = null,
  setSelectedTableForSeating = null,
  selectedPlayerForSeating = null,
  selectedTableForSeating = null,
  // Live tables state from parent
  liveTablePlayerSearch = "",
  setLiveTablePlayerSearch = null,
  selectedLiveTablePlayer = null,
  setSelectedLiveTablePlayer = null,
  buyInAmount = "",
  setBuyInAmount = null,
  // Seating Management props
  waitlist = [],
  setWaitlist = null,
  isSeatAvailable = null,
  handleAssignPreferredSeat = null,
  handleOpenTableViewForWaitlist = null,
  // Table Management props
  setTables = null, // Function to update tables list
  dealers = [], // List of dealers for assignment
  // Option to force a specific tab and hide tab navigation
  forceTab = null, // "table-management", "seating-management", "live-tables"
}) {
  const [activeTab, setActiveTab] = useState(forceTab || "live-tables");

  const getSelectValue = (e, option) => option?.value ?? e?.target?.value ?? "";

  // Table Management state
  const [tableMgmtSubTab, setTableMgmtSubTab] = useState("list"); // "list" | "add"
  const [tableForm, setTableForm] = useState({
    name: "",
    gameType: "Texas Hold'em",
    maxPlayers: 8,
    stakes: "",
    minPlayTime: 30,
    callTime: 5,
    cashOutWindow: 10,
    sessionTimeout: 120,
  });
  const [minPlayTimePreset, setMinPlayTimePreset] = useState("30"); // "30" | "45" | ... | "custom"
  const [editingTable, setEditingTable] = useState(null);
  const [selectedTableForActions, setSelectedTableForActions] = useState("");
  const [selectedTableForDealer, setSelectedTableForDealer] = useState("");
  const [selectedDealer, setSelectedDealer] = useState("");

  // Seating Management state
  const [seatAssignment, setSeatAssignment] = useState({
    playerId: "",
    tableId: "",
    seatNumber: "",
    playerName: ""
  });

  // Table Management permissions
  const canCreateTable = ["admin", "superadmin", "manager"].includes(userRole);
  const canViewTable = ["admin", "superadmin", "manager", "cashier", "gre"].includes(userRole);
  const canEditTable = ["admin", "superadmin", "manager"].includes(userRole);

  // Determine which tabs are accessible based on role
  // NOTE: Cashier should NOT see Table Management UI (only Live Tables).
  const canAccessTableManagement = ["admin", "superadmin", "manager"].includes(
    userRole
  );
  const canAccessSeatingManagement = [
    "admin",
    "superadmin",
    "manager",
  ].includes(userRole);
  const canAccessLiveTables = true; // All roles can access live tables

  const filteredLiveTablePlayers =
    liveTablePlayerSearch.length >= 3
      ? mockPlayers.filter((player) => {
        const searchLower = liveTablePlayerSearch.toLowerCase();
        return (
          player.name.toLowerCase().includes(searchLower) ||
          player.id.toLowerCase().includes(searchLower) ||
          player.email.toLowerCase().includes(searchLower)
        );
      })
      : [];

  // Table Management functions
  const handleCreateTable = () => {
    if (!setTables || !canCreateTable) return;

    const normalizedMinPlayTime =
      minPlayTimePreset === "custom"
        ? Math.max(30, parseInt(tableForm.minPlayTime) || 30)
        : Math.max(30, parseInt(minPlayTimePreset) || 30);

    const newTable = {
      id: tables.length > 0 ? Math.max(...tables.map(t => t.id)) + 1 : 1,
      name: tableForm.name,
      gameType: tableForm.gameType,
      maxPlayers: parseInt(tableForm.maxPlayers),
      stakes: tableForm.stakes,
      status: "Inactive",
      minPlayTime: normalizedMinPlayTime,
      callTime: parseInt(tableForm.callTime),
      cashOutWindow: parseInt(tableForm.cashOutWindow),
      sessionTimeout: parseInt(tableForm.sessionTimeout),
    };

    setTables([...tables, newTable]);

    // Reset form
    setTableForm({
      name: "",
      gameType: "Texas Hold'em",
      maxPlayers: 8,
      stakes: "",
      minPlayTime: 30,
      callTime: 5,
      cashOutWindow: 10,
      sessionTimeout: 120,
    });
    setMinPlayTimePreset("30");
    setTableMgmtSubTab("list");

    alert(`Table "${newTable.name}" created successfully!`);
  };

  const handleEditTable = (table) => {
    if (!canEditTable || !table) return;
    setEditingTable(table);
    setTableMgmtSubTab("add");
    setTableForm({
      name: table.name || "",
      gameType: table.gameType || "Texas Hold'em",
      maxPlayers: table.maxPlayers || 8,
      stakes: table.stakes || "",
      minPlayTime: table.minPlayTime || 30,
      callTime: table.callTime || 5,
      cashOutWindow: table.cashOutWindow || 10,
      sessionTimeout: table.sessionTimeout || 120,
    });

    const presets = new Set(["30", "45", "60", "90", "120", "150", "180"]);
    const v = String(table.minPlayTime || 30);
    setMinPlayTimePreset(presets.has(v) ? v : "custom");
  };

  const handleUpdateTable = () => {
    if (!setTables || !canEditTable || !editingTable) return;

    const normalizedMinPlayTime =
      minPlayTimePreset === "custom"
        ? Math.max(30, parseInt(tableForm.minPlayTime) || 30)
        : Math.max(30, parseInt(minPlayTimePreset) || 30);

    const updatedTables = tables.map(table =>
      table.id === editingTable.id
        ? {
          ...table,
          name: tableForm.name,
          gameType: tableForm.gameType,
          maxPlayers: parseInt(tableForm.maxPlayers),
          stakes: tableForm.stakes,
          minPlayTime: normalizedMinPlayTime,
          callTime: parseInt(tableForm.callTime),
          cashOutWindow: parseInt(tableForm.cashOutWindow),
          sessionTimeout: parseInt(tableForm.sessionTimeout),
        }
        : table
    );

    setTables(updatedTables);
    setEditingTable(null);
    setTableForm({
      name: "",
      gameType: "Texas Hold'em",
      maxPlayers: 8,
      stakes: "",
      minPlayTime: 30,
      callTime: 5,
      cashOutWindow: 10,
      sessionTimeout: 120,
    });
    setMinPlayTimePreset("30");
    setTableMgmtSubTab("list");

    alert(`Table "${tableForm.name}" updated successfully!`);
  };

  const handleToggleTableStatus = (tableId) => {
    if (!setTables || !canEditTable) return;

    const table = tables.find(t => t.id === tableId || t.id === parseInt(tableId));
    if (!table) return;

    const newStatus = table.status === "Active" ? "Inactive" : "Active";
    const updatedTables = tables.map(t =>
      (t.id === tableId || t.id === parseInt(tableId))
        ? { ...t, status: newStatus }
        : t
    );

    setTables(updatedTables);
    alert(`Table "${table.name}" ${newStatus === "Active" ? "activated" : "deactivated"}!`);
  };

  const handleDeleteTable = (tableId) => {
    if (!setTables || !canEditTable) return;

    const table = tables.find(t => t.id === tableId || t.id === parseInt(tableId));
    if (!table) return;

    if (window.confirm(`Are you sure you want to delete "${table.name}"?`)) {
      setTables(tables.filter(t => t.id !== tableId && t.id !== parseInt(tableId)));
      alert(`Table "${table.name}" deleted successfully!`);
    }
  };

  const handleAssignDealer = () => {
    if (!selectedTableForDealer || !selectedDealer) {
      alert("Please select both table and dealer");
      return;
    }
    alert(`Dealer assigned to table successfully!`);
    setSelectedTableForDealer("");
    setSelectedDealer("");
  };

  // Handle opening table view for seat assignment
  const handleOpenTableView = (tableId, player = null) => {
    if (player && setSelectedPlayerForSeating) {
      setSelectedPlayerForSeating({
        id: player.id,
        playerId: player.id,
        playerName: player.name,
        name: player.name,
      });
    } else if (setSelectedPlayerForSeating) {
      setSelectedPlayerForSeating(null);
    }
    if (setSelectedTableForSeating) {
      setSelectedTableForSeating(tableId);
    }
    if (setShowTableView) {
      setShowTableView(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      {!forceTab &&
        (canAccessTableManagement ||
          canAccessSeatingManagement ||
          canAccessLiveTables) && (
          <div className="flex gap-2 border-b border-white/20 pb-4">
            {canAccessLiveTables && (
              <button
                onClick={() => setActiveTab("live-tables")}
                className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${activeTab === "live-tables"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg"
                  : "bg-white/10 text-white/70 hover:bg-white/15"
                  }`}
              >
                Live Tables
              </button>
            )}
            {canAccessTableManagement && (
              <button
                onClick={() => setActiveTab("table-management")}
                className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${activeTab === "table-management"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg"
                  : "bg-white/10 text-white/70 hover:bg-white/15"
                  }`}
              >
                Table Management
              </button>
            )}
            {canAccessSeatingManagement && (
              <button
                onClick={() => setActiveTab("seating-management")}
                className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${activeTab === "seating-management"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg"
                  : "bg-white/10 text-white/70 hover:bg-white/15"
                  }`}
              >
                Seating Management
              </button>
            )}
          </div>
        )}

      {/* Table Management Tab */}
      {activeTab === "table-management" && canViewTable && (
        <div className="space-y-6">
          <section className="p-6 bg-gradient-to-r from-emerald-600/30 via-green-500/20 to-teal-700/30 rounded-xl shadow-md border border-emerald-800/40">
            <h2 className="text-xl font-bold text-white mb-6">Table Management</h2>

            {/* Sub Tabs: Add New Table / All Tables */}
            <div className="flex gap-2 border-b border-white/20 pb-4 mb-6">
              <button
                onClick={() => setTableMgmtSubTab("list")}
                className={`px-5 py-2 rounded-t-lg font-semibold transition-all ${tableMgmtSubTab === "list"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg"
                  : "bg-white/10 text-white/70 hover:bg-white/15"
                  }`}
              >
                All Tables
              </button>
              {canCreateTable && (
                <button
                  onClick={() => setTableMgmtSubTab("add")}
                  className={`px-5 py-2 rounded-t-lg font-semibold transition-all ${tableMgmtSubTab === "add"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg"
                    : "bg-white/10 text-white/70 hover:bg-white/15"
                    }`}
                >
                  Add New Table
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create/Edit Table Form */}
              {canCreateTable && tableMgmtSubTab === "add" && (
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {editingTable ? "Edit Table" : "Create New Table"}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-white text-sm">Table Name</label>
                      <input
                        type="text"
                        className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        placeholder="Table 1"
                        value={tableForm.name}
                        onChange={(e) => setTableForm({ ...tableForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm">Game Type</label>
                      <CustomSelect
                        options={[
                          { value: "Texas Hold'em", label: "Texas Hold'em" },
                          { value: "Omaha", label: "Omaha" },
                          { value: "Seven Card Stud", label: "Seven Card Stud" },
                          { value: "Razz", label: "Razz" },
                        ]}
                        value={tableForm.gameType}
                        onChange={(e, option) =>
                          setTableForm({
                            ...tableForm,
                            gameType: getSelectValue(e, option),
                          })
                        }
                        className="w-full mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm">Max Players</label>
                      <input
                        type="number"
                        className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        placeholder="8"
                        value={tableForm.maxPlayers}
                        onChange={(e) => setTableForm({ ...tableForm, maxPlayers: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm">Blind Levels / Stakes</label>
                      <input
                        type="text"
                        className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        placeholder="₹25/₹50"
                        value={tableForm.stakes}
                        onChange={(e) => setTableForm({ ...tableForm, stakes: e.target.value })}
                      />
                    </div>
                    <div className="border-t border-white/20 pt-3 mt-3">
                      <h4 className="text-white text-sm font-semibold mb-2">Session Parameters</h4>
                      <div className="space-y-2">
                        <div>
                          <label className="text-white text-xs">Min Play Time (minutes)</label>
                          <div className="mt-1 space-y-2">
                            <CustomSelect
                              options={[
                                { value: "30", label: "30 minutes" },
                                { value: "45", label: "45 minutes" },
                                { value: "60", label: "60 minutes" },
                                { value: "90", label: "90 minutes" },
                                { value: "120", label: "120 minutes" },
                                { value: "150", label: "150 minutes" },
                                { value: "180", label: "180 minutes" },
                                { value: "custom", label: "Custom..." },
                              ]}
                              value={minPlayTimePreset}
                              onChange={(e, option) => {
                                const nextValue =
                                  option?.value ?? e?.target?.value ?? "";
                                setMinPlayTimePreset(nextValue);
                                if (nextValue !== "custom") {
                                  setTableForm({
                                    ...tableForm,
                                    minPlayTime: parseInt(nextValue),
                                  });
                                } else if (
                                  !tableForm.minPlayTime ||
                                  parseInt(tableForm.minPlayTime) < 30
                                ) {
                                  setTableForm({ ...tableForm, minPlayTime: 30 });
                                }
                              }}
                              className="w-full"
                            />
                            {minPlayTimePreset === "custom" && (
                              <input
                                type="number"
                                min={30}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                                placeholder="Enter minutes (min 30)"
                                value={tableForm.minPlayTime}
                                onChange={(e) =>
                                  setTableForm({
                                    ...tableForm,
                                    minPlayTime: e.target.value,
                                  })
                                }
                              />
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="text-white text-xs">Call Time (minutes)</label>
                          <input
                            type="number"
                            className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                            placeholder="5"
                            value={tableForm.callTime}
                            onChange={(e) => setTableForm({ ...tableForm, callTime: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-white text-xs">Cash-out Window (minutes)</label>
                          <input
                            type="number"
                            className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                            placeholder="10"
                            value={tableForm.cashOutWindow}
                            onChange={(e) => setTableForm({ ...tableForm, cashOutWindow: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-white text-xs">Session Timeout (minutes)</label>
                          <input
                            type="number"
                            className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                            placeholder="120"
                            value={tableForm.sessionTimeout}
                            onChange={(e) => setTableForm({ ...tableForm, sessionTimeout: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={editingTable ? handleUpdateTable : handleCreateTable}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold mt-4"
                      >
                        {editingTable ? "Update Table" : "Create Table"}
                      </button>
                      {editingTable && (
                        <button
                          onClick={() => {
                            setEditingTable(null);
                            setTableForm({
                              name: "",
                              gameType: "Texas Hold'em",
                              maxPlayers: 8,
                              stakes: "",
                              minPlayTime: 30,
                              callTime: 5,
                              cashOutWindow: 10,
                              sessionTimeout: 120,
                            });
                            setMinPlayTimePreset("30");
                            setTableMgmtSubTab("list");
                          }}
                          className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold mt-4"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Table Actions */}
              {canEditTable && (
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Table Actions</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-white text-sm mb-2 block">Select Table</label>
                      <CustomSelect
                        options={[
                          { value: "", label: "-- Select Table --" },
                          ...tables.map((table) => ({
                            value: table.id.toString(),
                            label: `${table.name} (${table.status})`,
                          })),
                        ]}
                        value={selectedTableForActions}
                        onChange={(e, option) =>
                          setSelectedTableForActions(getSelectValue(e, option))
                        }
                        className="w-full"
                      />
                    </div>
                    {selectedTableForActions && (
                      <>
                        <button
                          onClick={() => {
                            const tableToEdit = tables.find(t =>
                              t.id.toString() === selectedTableForActions ||
                              t.id === parseInt(selectedTableForActions)
                            );
                            if (tableToEdit) {
                              handleEditTable(tableToEdit);
                            }
                          }}
                          className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold"
                        >
                          Edit Table Settings
                        </button>
                        <button
                          onClick={() => handleToggleTableStatus(parseInt(selectedTableForActions))}
                          className="w-full bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold"
                        >
                          {tables.find(t => t.id.toString() === selectedTableForActions)?.status === "Active"
                            ? "Deactivate Table"
                            : "Activate Table"}
                        </button>
                        <button
                          onClick={() => handleDeleteTable(parseInt(selectedTableForActions))}
                          className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold"
                        >
                          Delete Table
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Dealer Assignment */}
              {canEditTable && (
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Dealer Assignment</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-white text-sm">Select Table</label>
                      <CustomSelect
                        options={[
                          { value: "", label: "-- Select Table --" },
                          ...tables.map((table) => ({
                            value: table.id.toString(),
                            label: table.name,
                          })),
                        ]}
                        value={selectedTableForDealer}
                        onChange={(e, option) =>
                          setSelectedTableForDealer(getSelectValue(e, option))
                        }
                        className="w-full mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm">Assign Dealer</label>
                      <CustomSelect
                        options={[
                          { value: "", label: "-- Select Dealer --" },
                          ...dealers.map((dealer) => ({
                            value: dealer.id?.toString() || dealer.name,
                            label: dealer.name || dealer,
                          })),
                        ]}
                        value={selectedDealer}
                        onChange={(e, option) =>
                          setSelectedDealer(getSelectValue(e, option))
                        }
                        className="w-full mt-1"
                      />
                    </div>
                    <button
                      onClick={handleAssignDealer}
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      Assign Dealer
                    </button>
                  </div>
                </div>
              )}

              {/* View Tables List */}
              <div
                className={`bg-white/10 p-4 rounded-lg ${tableMgmtSubTab === "list" ? "lg:col-span-2" : ""
                  }`}
              >
                <h3 className="text-lg font-semibold text-white mb-4">All Tables</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {tables.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No tables created yet
                    </div>
                  ) : (
                    tables.map((table) => (
                      <div
                        key={table.id}
                        className="bg-blue-500/20 p-3 rounded-lg border border-blue-400/30"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-white">{table.name}</div>
                            <div className="text-sm text-gray-300">
                              {table.gameType} | Max Players: {table.maxPlayers}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Stakes: {table.stakes || "N/A"} | Status:{" "}
                              <span
                                className={`font-semibold ${table.status === "Active"
                                  ? "text-green-400"
                                  : "text-red-400"
                                  }`}
                              >
                                {table.status}
                              </span>
                              {" "} | Timer:{" "}
                              <span className="text-white/90 font-semibold">
                                {Math.max(30, parseInt(table.minPlayTime) || 30)}m
                              </span>
                            </div>
                          </div>
                          {canEditTable && (
                            <button
                              onClick={() => handleEditTable(table)}
                              className="ml-2 text-blue-400 hover:text-blue-300 text-sm"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Seating Management Tab */}
      {activeTab === "seating-management" && canAccessSeatingManagement && (
        <div className="space-y-6">
          <section className="p-6 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-purple-700/30 rounded-xl shadow-md border border-blue-800/40">
            <h2 className="text-xl font-bold text-white mb-6">
              Waitlist Management
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Current Waitlist
                </h3>
                <div className="space-y-2">
                  {waitlist.map((entry) => {
                    const preferredSeatAvailable =
                      entry.preferredSeat && isSeatAvailable
                        ? isSeatAvailable(
                          entry.preferredTable,
                          entry.preferredSeat
                        )
                        : false;

                    return (
                      <div
                        key={entry.id}
                        className="bg-blue-500/20 p-3 rounded-lg border border-blue-400/30"
                      >
                        <div className="grid gap-5 sm:grid-cols-[60%,1fr] items-start">
                          <div className="flex-1">
                            <div className="font-semibold text-white">
                              Player: {entry.playerName}
                            </div>
                            <div className="text-sm text-gray-300">
                              Position: {entry.position} | Game:{" "}
                              {entry.gameType}
                            </div>
                            {entry.preferredSeat ? (
                              <div className="mt-1 flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-yellow-300 font-medium flex items-center gap-1">
                                  ⭐ Preferred: Table {entry.preferredTable},
                                  Seat {entry.preferredSeat}
                                </span>
                                {preferredSeatAvailable ? (
                                  <span className="text-xs bg-green-500/30 text-green-300 px-2 py-0.5 rounded-full border border-green-400/50">
                                    ✓ Available
                                  </span>
                                ) : (
                                  <span className="text-xs bg-red-500/30 text-red-300 px-2 py-0.5 rounded-full border border-red-400/50">
                                    ✗ Occupied
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="mt-1 text-xs text-gray-400">
                                No preferred seat selected
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 ml-3">
                            <button
                              onClick={() => {
                                if (handleOpenTableViewForWaitlist) {
                                  handleOpenTableViewForWaitlist(
                                    entry,
                                    entry.preferredTable
                                  );
                                }
                              }}
                              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm whitespace-nowrap"
                              title="View table hologram to assign seat"
                            >
                              🎯 View Table
                            </button>
                            {entry.preferredSeat &&
                              preferredSeatAvailable &&
                              handleAssignPreferredSeat && (
                                <button
                                  onClick={() =>
                                    handleAssignPreferredSeat(entry)
                                  }
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-sm whitespace-nowrap"
                                  title={`Assign to preferred seat ${entry.preferredSeat} at Table ${entry.preferredTable}`}
                                >
                                  Assign Preferred
                                </button>
                              )}
                            <button
                              onClick={() => {
                                if (setWaitlist) {
                                  setWaitlist((prev) =>
                                    prev.filter((item) => item.id !== entry.id)
                                  );
                                }
                              }}
                              className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {waitlist.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No players in waitlist
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Seat Allocation
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm">Select Player</label>
                    <CustomSelect
                      options={[
                        { value: "", label: "-- Select Player --" },
                        ...waitlist.map((entry) => ({
                          value: entry.id.toString(),
                          label: `${entry.playerName} (Position ${entry.position})`,
                        })),
                      ]}
                      value={seatAssignment.playerId}
                      onChange={(e) => {
                        const selectedEntry = waitlist.find(w => w.id.toString() === e.target.value.toString());
                        setSeatAssignment({
                          ...seatAssignment,
                          playerId: e.target.value,
                          playerName: selectedEntry?.playerName || "",
                          tableId: selectedEntry?.preferredTable?.toString() || ""
                        });
                      }}
                      className="w-full mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm">Select Table</label>
                    <CustomSelect
                      options={[
                        { value: "", label: "-- Select Table --" },
                        ...tables.map((table) => ({
                          value: table.id.toString(),
                          label: table.name,
                        })),
                      ]}
                      value={seatAssignment.tableId}
                      onChange={(e) => setSeatAssignment({ ...seatAssignment, tableId: e.target.value, seatNumber: "" })}
                      className="w-full mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm">Seat Number</label>
                    <CustomSelect
                      options={[
                        { value: "", label: "-- Select Seat --" },
                        ...(seatAssignment.tableId ? Array.from({ length: 8 }, (_, i) => i + 1).map((seatNum) => {
                          const available = isSeatAvailable ? isSeatAvailable(parseInt(seatAssignment.tableId), seatNum) : true;
                          const selectedEntry = waitlist.find(w => w.id.toString() === seatAssignment.playerId.toString());
                          const isPreferred = selectedEntry?.preferredSeat === seatNum &&
                            selectedEntry?.preferredTable === parseInt(seatAssignment.tableId);
                          return {
                            value: seatNum.toString(),
                            label: `Seat ${seatNum} ${!available ? "(Occupied)" : ""} ${isPreferred ? "(Preferred)" : ""}`
                          };
                        }) : [])
                      ]}
                      value={seatAssignment.seatNumber}
                      onChange={(e) => setSeatAssignment({ ...seatAssignment, seatNumber: e.target.value })}
                      disabled={!seatAssignment.tableId}
                      className="w-full mt-1"
                    />
                  </div>
                  {seatAssignment.playerId && seatAssignment.tableId && seatAssignment.seatNumber && (
                    <div className="p-2 bg-blue-500/20 rounded border border-blue-400/30">
                      <div className="text-xs text-blue-300">
                        {(() => {
                          const selectedEntry = waitlist.find(w => w.id.toString() === seatAssignment.playerId.toString());
                          const isPreferred = selectedEntry?.preferredSeat === parseInt(seatAssignment.seatNumber) &&
                            selectedEntry?.preferredTable === parseInt(seatAssignment.tableId);
                          return isPreferred ? "✓ This is the player's preferred seat" : "";
                        })()}
                      </div>
                    </div>
                  )}
                  <button
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed"
                    disabled={!seatAssignment.playerId || !seatAssignment.tableId || !seatAssignment.seatNumber}
                    onClick={() => {
                      if (onSeatAssign) {
                        onSeatAssign({
                          playerId: seatAssignment.playerId,
                          playerName: seatAssignment.playerName,
                          tableId: seatAssignment.tableId,
                          seatNumber: seatAssignment.seatNumber
                        });
                        // Reset form
                        setSeatAssignment({
                          playerId: "",
                          tableId: "",
                          seatNumber: "",
                          playerName: ""
                        });
                      }
                    }}
                  >
                    Assign Seat
                  </button>
                  {/* Removed duplicate Assign Table controls */}
                </div>
              </div>
            </div>

            <section className="p-6 bg-gradient-to-r from-indigo-600/30 via-blue-500/20 to-cyan-700/30 rounded-xl shadow-md border border-indigo-800/40">
              <h2 className="text-xl font-bold text-white mb-6">Player Call & Reorder</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Call Players</h3>
                  <div className="space-y-3">
                    <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                      Call Next Player
                    </button>
                    <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                      Call All Players
                    </button>
                    <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold">
                      Send SMS Notification
                    </button>
                  </div>
                </div>

                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Reorder Waitlist</h3>
                  <div className="space-y-2">
                    {waitlist.map((entry, index) => (
                      <div key={entry.id} className="bg-white/5 p-2 rounded flex justify-between items-center">
                        <span className="text-white">
                          {entry.position}. {entry.playerName}
                          {entry.preferredSeat && (
                            <span className="text-xs text-yellow-300 ml-2">
                              (Pref: T{entry.preferredTable}-S{entry.preferredSeat})
                            </span>
                          )}
                        </span>
                        <div className="flex gap-1">
                          <button
                            className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs disabled:bg-gray-600 disabled:cursor-not-allowed"
                            disabled={index === 0}
                            onClick={() => {
                              if (index > 0 && setWaitlist) {
                                const newWaitlist = [...waitlist];
                                [newWaitlist[index], newWaitlist[index - 1]] = [newWaitlist[index - 1], newWaitlist[index]];
                                newWaitlist[index].position = index + 1;
                                newWaitlist[index - 1].position = index;
                                setWaitlist(newWaitlist);
                              }
                            }}
                          >
                            ↑
                          </button>
                          <button
                            className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs disabled:bg-gray-600 disabled:cursor-not-allowed"
                            disabled={index === waitlist.length - 1}
                            onClick={() => {
                              if (index < waitlist.length - 1 && setWaitlist) {
                                const newWaitlist = [...waitlist];
                                [newWaitlist[index], newWaitlist[index + 1]] = [newWaitlist[index + 1], newWaitlist[index]];
                                newWaitlist[index].position = index + 1;
                                newWaitlist[index + 1].position = index + 2;
                                setWaitlist(newWaitlist);
                              }
                            }}
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                    ))}
                    {waitlist.length === 0 && (
                      <div className="text-center py-4 text-gray-400 text-sm">
                        No players to reorder
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

          </section>
        </div>
      )}

      {/* Live Tables Tab */}
      {activeTab === "live-tables" && canAccessLiveTables && (
        <div className="space-y-6">
          <section className="p-6 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-purple-700/30 rounded-xl shadow-md border border-blue-800/40">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Live Tables - Hologram View
                </h2>
                <p className="text-gray-300 text-sm mt-1">
                  Manage live tables, seat players, and handle buy-ins using
                  table hologram.
                </p>
              </div>
              <div className="text-xs text-gray-400 bg-white/10 px-3 py-2 rounded-lg border border-white/10">
                <div>
                  Active Tables:{" "}
                  {tables.filter((t) => t.status === "Active").length}
                </div>
                <div>
                  Total Players:{" "}
                  {
                    Object.values(playerBalances).filter((p) => p.tableId)
                      .length
                  }
                </div>
              </div>
            </div>

            {/* Player Selection for Seating */}
            <div className="bg-white/10 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Select Player to Seat (Optional)
              </h3>
              <div className="relative">
                <label className="text-white text-sm mb-2 block">
                  Search Player (Type at least 3 characters)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                  placeholder="Search by name, ID, or email..."
                  value={liveTablePlayerSearch}
                  onChange={(e) => {
                    if (setLiveTablePlayerSearch)
                      setLiveTablePlayerSearch(e.target.value);
                    if (setSelectedLiveTablePlayer)
                      setSelectedLiveTablePlayer(null);
                  }}
                />
                {liveTablePlayerSearch.length >= 3 &&
                  filteredLiveTablePlayers.length > 0 &&
                  !selectedLiveTablePlayer && (
                    <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredLiveTablePlayers.map((player) => (
                        <div
                          key={player.id}
                          onClick={() => {
                            if (setSelectedLiveTablePlayer)
                              setSelectedLiveTablePlayer(player);
                            if (setLiveTablePlayerSearch)
                              setLiveTablePlayerSearch(
                                `${player.name} (${player.id})`
                              );
                          }}
                          className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0"
                        >
                          <div className="text-white font-medium">
                            {player.name}
                          </div>
                          <div className="text-gray-400 text-xs">
                            ID: {player.id} | Email: {player.email}
                            {playerBalances[player.id] && (
                              <>
                                {" "}
                                | Balance: ₹
                                {playerBalances[
                                  player.id
                                ].availableBalance.toLocaleString("en-IN")}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                {selectedLiveTablePlayer && (
                  <div className="mt-2 p-2 bg-green-500/20 border border-green-400/30 rounded text-sm">
                    <span className="text-green-300">
                      Selected: {selectedLiveTablePlayer.name} (
                      {selectedLiveTablePlayer.id})
                    </span>
                    {playerBalances[selectedLiveTablePlayer.id] && (
                      <div className="text-xs text-gray-300 mt-1">
                        Available Balance: ₹
                        {playerBalances[
                          selectedLiveTablePlayer.id
                        ].availableBalance.toLocaleString("en-IN")}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        if (setSelectedLiveTablePlayer)
                          setSelectedLiveTablePlayer(null);
                        if (setLiveTablePlayerSearch)
                          setLiveTablePlayerSearch("");
                      }}
                      className="ml-2 text-red-400 hover:text-red-300"
                    >
                      X
                    </button>
                  </div>
                )}
              </div>
              {selectedLiveTablePlayer && (
                <div className="mt-4">
                  <label className="text-white text-sm mb-2 block">
                    Buy-in Amount (Optional - for fresh buy-in)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                    placeholder="₹0.00 - Leave empty if no buy-in needed"
                    value={buyInAmount}
                    onChange={(e) => {
                      if (setBuyInAmount) setBuyInAmount(e.target.value);
                    }}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Enter buy-in amount to deduct from player's available
                    balance and add to table balance when seating.
                  </p>
                </div>
              )}
            </div>

            {/* Tables List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {tables
                .filter((table) => table.status === "Active")
                .map((table) => {
                  const tableBalance = tableBalances[table.id];
                  const occupiedSeatsForTable = occupiedSeats[table.id] || [];
                  const availableSeats =
                    table.maxPlayers - occupiedSeatsForTable.length;

                  return (
                    <div
                      key={table.id}
                      className="bg-white/10 p-5 rounded-xl border border-blue-400/30 shadow-lg space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white leading-tight">
                            {table.name}
                          </h3>
                          <div className="text-xs text-gray-400 mt-1">
                            {table.gameType} | Stakes: {table.stakes}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-400 uppercase tracking-wide">
                            Table Balance
                          </div>
                          <div className="text-xl font-bold text-blue-300">
                            ₹
                            {(tableBalance?.totalBalance || 0).toLocaleString(
                              "en-IN"
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">Occupied Seats:</span>
                          <span className="text-white font-semibold">
                            {occupiedSeatsForTable.length} / {table.maxPlayers}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">
                            Available Seats:
                          </span>
                          <span className="text-green-300 font-semibold">
                            {availableSeats}
                          </span>
                        </div>
                        {occupiedSeatsForTable.length > 0 && (
                          <div className="text-xs text-gray-400">
                            Occupied: {occupiedSeatsForTable.join(", ")}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() =>
                          handleOpenTableView(
                            table.id,
                            selectedLiveTablePlayer || null
                          )
                        }
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white px-4 py-3 rounded-lg font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <span className="text-xl">🎯</span>
                        <span>View Table Hologram</span>
                        {selectedLiveTablePlayer && (
                          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                            Seating: {selectedLiveTablePlayer.name}
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
            </div>

            {tables.filter((table) => table.status === "Active").length ===
              0 && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-10 text-center text-gray-400">
                  No active tables available. Tables will appear here when they
                  are activated.
                </div>
              )}
          </section>
        </div>
      )}

      {/* Table View Modal for Seat Assignment */}
      {showTableView && selectedTableForSeating && (
        <div className="fixed inset-0 -top-6 z-50 bg-black/90 overflow-y-auto hide-scrollbar">
          <TableView
            tableId={selectedTableForSeating}
            onClose={() => {
              if (setShowTableView) setShowTableView(false);
              if (setSelectedPlayerForSeating) setSelectedPlayerForSeating(null);
              if (setSelectedTableForSeating) setSelectedTableForSeating(null);
            }}
            isManagerMode={["admin", "superadmin", "manager", "cashier"].includes(
              userRole
            )}
            selectedPlayerForSeating={selectedPlayerForSeating}
            occupiedSeats={occupiedSeats}
            onSeatAssign={onSeatAssign}
            tables={tables}
          />
        </div>
      )}
    </div>
  );
}
