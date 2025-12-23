import React, { useState, useEffect } from "react";
import CustomSelect from "./common/CustomSelect";

export default function SessionControl({
    tables,
    setTables,
    userRole = "manager"
}) {
    const [selectedTableId, setSelectedTableId] = useState(null);
    const [sessionParams, setSessionParams] = useState({
        playWindow: 30,
        callWindow: 5,
        cashoutWindow: 10,
        sessionTimeout: 120
    });

    // Get the full object of the selected table
    const selectedTable = tables.find(t => t.id === selectedTableId || t.id === parseInt(selectedTableId));

    // Update session params form when a table is selected
    useEffect(() => {
        if (selectedTable) {
            setSessionParams({
                playWindow: selectedTable.minPlayTime || 30,
                callWindow: selectedTable.callTime || 5,
                cashoutWindow: selectedTable.cashOutWindow || 10,
                sessionTimeout: selectedTable.sessionTimeout || 120
            });
        }
    }, [selectedTableId, tables]);

    const handleUpdateStatus = (status) => {
        if (!selectedTable) return;

        // Logic to update table status
        const updatedTables = tables.map(t => {
            if (t.id === selectedTable.id) {
                return { ...t, status: status };
            }
            return t;
        });
        setTables(updatedTables);
        alert(`Table "${selectedTable.name}" status changed to ${status}`);
    };

    const handleUpdateParam = (param, value) => {
        // Determine the key in the table object based on the param name
        // Mapping: playWindow -> minPlayTime, callWindow -> callTime, etc.
        let tableKey = "";
        if (param === "playWindow") tableKey = "minPlayTime";
        else if (param === "callWindow") tableKey = "callTime";
        else if (param === "cashoutWindow") tableKey = "cashOutWindow";
        else if (param === "sessionTimeout") tableKey = "sessionTimeout";

        if (!tableKey || !selectedTable) return;

        const updatedTables = tables.map(t => {
            if (t.id === selectedTable.id) {
                return { ...t, [tableKey]: parseInt(value) };
            }
            return t;
        });
        setTables(updatedTables);
        alert(`Updated ${param} for ${selectedTable.name} to ${value} minutes`);
    };

    return (
        <div className="space-y-6">
            <section className="p-6 bg-gradient-to-r from-blue-600/30 via-purple-500/20 to-indigo-700/30 rounded-xl shadow-md border border-blue-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Table Session Control</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Table List */}
                    <div className="bg-white/10 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-3">Table Sessions</h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                            {tables.map((table) => (
                                <button
                                    key={table.id}
                                    onClick={() => setSelectedTableId(table.id)}
                                    className={`w-full flex justify-between items-center p-3 rounded-lg transition-all border ${selectedTableId === table.id
                                            ? "bg-blue-500/30 border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                            : "bg-white/5 border-white/10 hover:bg-white/10"
                                        }`}
                                >
                                    <div className="text-left">
                                        <div className="text-white font-medium text-sm">{table.name}</div>
                                        <div className="text-xs text-gray-400">{table.gameType}</div>
                                    </div>
                                    <span
                                        className={`text-xs font-bold px-2 py-1 rounded-full border ${table.status === "Active"
                                                ? "bg-green-500/20 text-green-300 border-green-500/30"
                                                : table.status === "Paused"
                                                    ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                                                    : "bg-red-500/20 text-red-300 border-red-500/30"
                                            }`}
                                    >
                                        {table.status}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {selectedTable && (
                            <div className="mt-4 p-3 bg-blue-500/20 rounded-lg border border-blue-400/30 animate-fade-in">
                                <div className="text-white text-sm font-semibold mb-1">
                                    Selected: {selectedTable.name}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 mt-2">
                                    <div>Game: {selectedTable.gameType}</div>
                                    <div>Stakes: {selectedTable.stakes || "N/A"}</div>
                                    <div>Players: {selectedTable.players || 0}/{selectedTable.maxPlayers}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Session Actions */}
                    <div className="bg-white/10 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-3">Session Actions</h3>
                        {selectedTable ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-black/20 rounded-lg border border-white/5">
                                    <div className="text-sm text-gray-400 mb-2">Current Status</div>
                                    <div className={`text-2xl font-bold mb-4 ${selectedTable.status === "Active" ? "text-green-400" :
                                            selectedTable.status === "Paused" ? "text-yellow-400" : "text-red-400"
                                        }`}>
                                        {selectedTable.status}
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        {selectedTable.status !== "Active" && (
                                            <button
                                                onClick={() => handleUpdateStatus("Active")}
                                                className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-3 rounded-lg font-bold shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <span>▶</span> Start / Resume Session
                                            </button>
                                        )}

                                        {selectedTable.status === "Active" && (
                                            <button
                                                onClick={() => handleUpdateStatus("Paused")}
                                                className="w-full bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-3 rounded-lg font-bold shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <span>⏸</span> Pause Session
                                            </button>
                                        )}

                                        {selectedTable.status !== "Inactive" && (
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(`Are you sure you want to END the session for ${selectedTable.name}?`)) {
                                                        handleUpdateStatus("Inactive");
                                                    }
                                                }}
                                                className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded-lg font-bold shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <span>⏹</span> End Session
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="text-xs text-gray-400 text-center">
                                    Session parameters can be modified on the right panel.
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                                <div className="text-4xl mb-3">⚡</div>
                                <div className="text-sm">Select a table to manage</div>
                            </div>
                        )}
                    </div>

                    {/* Timing & Window Controls */}
                    <div className="bg-white/10 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-3">Timing & Parameters</h3>
                        {selectedTable ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-white text-xs uppercase tracking-wider font-semibold opacity-70">Min Play Time</label>
                                    <div className="flex gap-2 mt-1">
                                        <input
                                            type="number"
                                            className="flex-1 px-3 py-2 bg-black/20 border border-white/10 rounded text-white font-mono"
                                            value={sessionParams.playWindow}
                                            onChange={(e) => setSessionParams({ ...sessionParams, playWindow: e.target.value })}
                                        />
                                        <button
                                            onClick={() => handleUpdateParam("playWindow", sessionParams.playWindow)}
                                            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold"
                                        >
                                            Set
                                        </button>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">Current: {selectedTable.minPlayTime || 30} mins</div>
                                </div>

                                <div>
                                    <label className="text-white text-xs uppercase tracking-wider font-semibold opacity-70">Call Time</label>
                                    <div className="flex gap-2 mt-1">
                                        <input
                                            type="number"
                                            className="flex-1 px-3 py-2 bg-black/20 border border-white/10 rounded text-white font-mono"
                                            value={sessionParams.callWindow}
                                            onChange={(e) => setSessionParams({ ...sessionParams, callWindow: e.target.value })}
                                        />
                                        <button
                                            onClick={() => handleUpdateParam("callWindow", sessionParams.callWindow)}
                                            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold"
                                        >
                                            Set
                                        </button>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">Current: {selectedTable.callTime || 5} mins</div>
                                </div>

                                <div>
                                    <label className="text-white text-xs uppercase tracking-wider font-semibold opacity-70">Cash-out Window</label>
                                    <div className="flex gap-2 mt-1">
                                        <input
                                            type="number"
                                            className="flex-1 px-3 py-2 bg-black/20 border border-white/10 rounded text-white font-mono"
                                            value={sessionParams.cashoutWindow}
                                            onChange={(e) => setSessionParams({ ...sessionParams, cashoutWindow: e.target.value })}
                                        />
                                        <button
                                            onClick={() => handleUpdateParam("cashoutWindow", sessionParams.cashoutWindow)}
                                            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold"
                                        >
                                            Set
                                        </button>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">Current: {selectedTable.cashOutWindow || 10} mins</div>
                                </div>

                                <div>
                                    <label className="text-white text-xs uppercase tracking-wider font-semibold opacity-70">Session Timeout</label>
                                    <div className="flex gap-2 mt-1">
                                        <input
                                            type="number"
                                            className="flex-1 px-3 py-2 bg-black/20 border border-white/10 rounded text-white font-mono"
                                            value={sessionParams.sessionTimeout}
                                            onChange={(e) => setSessionParams({ ...sessionParams, sessionTimeout: e.target.value })}
                                        />
                                        <button
                                            onClick={() => handleUpdateParam("sessionTimeout", sessionParams.sessionTimeout)}
                                            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold"
                                        >
                                            Set
                                        </button>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">Current: {selectedTable.sessionTimeout || 120} mins</div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                                <div className="text-4xl mb-3">⚙️</div>
                                <div className="text-sm">Select a table to edit params</div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
