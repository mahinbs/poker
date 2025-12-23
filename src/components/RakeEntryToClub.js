import React, { useState } from "react";

export default function RakeEntryToClub() {
  const [selectedTable, setSelectedTable] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [chipDenomination, setChipDenomination] = useState("");
  const [totalRakeAmount, setTotalRakeAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [rakeEntries, setRakeEntries] = useState([
    {
      id: 1,
      tableId: "Table 1",
      sessionDate: "2024-01-20",
      chipDenomination: "₹25, ₹50, ₹100, ₹500",
      totalRakeAmount: 12500,
      notes: "Morning session rake entry",
      enteredBy: "Cashier",
      enteredAt: "2024-01-20 15:00",
      status: "entered",
    },
    {
      id: 2,
      tableId: "Table 2",
      sessionDate: "2024-01-20",
      chipDenomination: "₹25, ₹50, ₹100, ₹500",
      totalRakeAmount: 8500,
      notes: "Evening session rake entry",
      enteredBy: "Cashier",
      enteredAt: "2024-01-20 21:00",
      status: "entered",
    },
  ]);

  const [filterDate, setFilterDate] = useState("");
  const [filterTable, setFilterTable] = useState("all");

  const filteredEntries = rakeEntries.filter((entry) => {
    if (filterDate && entry.sessionDate !== filterDate) return false;
    if (filterTable !== "all" && entry.tableId !== filterTable) return false;
    return true;
  });

  const totalEntered = filteredEntries.reduce(
    (sum, entry) => sum + entry.totalRakeAmount,
    0
  );

  const handleEnterRake = () => {
    if (!selectedTable || !sessionDate || !totalRakeAmount) {
      alert("Please fill in all required fields");
      return;
    }

    const newEntry = {
      id: Date.now(),
      tableId: selectedTable,
      sessionDate: sessionDate,
      chipDenomination: chipDenomination || "₹25, ₹50, ₹100, ₹500",
      totalRakeAmount: parseFloat(totalRakeAmount),
      notes: notes,
      enteredBy: "Cashier",
      enteredAt: new Date().toLocaleString("en-IN"),
      status: "entered",
    };

    setRakeEntries([newEntry, ...rakeEntries]);
    alert("Rake entered to club successfully!");

    // Reset form
    setSelectedTable("");
    setSessionDate("");
    setChipDenomination("");
    setTotalRakeAmount("");
    setNotes("");
  };

  const handleExportCSV = () => {
    const csvContent = [
      ["Table ID", "Session Date", "Chip Denomination", "Total Rake Amount", "Notes", "Entered By", "Entered At"],
      ...filteredEntries.map((entry) => [
        entry.tableId,
        entry.sessionDate,
        entry.chipDenomination,
        entry.totalRakeAmount,
        entry.notes,
        entry.enteredBy,
        entry.enteredAt,
      ]),
    ]
      .map((row) => row.map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rake_entry_to_club_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Rake Entry Form */}
      <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-red-700/30 rounded-xl shadow-md border border-purple-800/40">
        <h2 className="text-xl font-bold text-white mb-6">
          Rake Entry to Club
        </h2>
        <div className="bg-white/10 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">
            Enter Rake to Club
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-white text-sm">Table ID *</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                placeholder="Table 1"
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
              />
            </div>
            <div>
              <label className="text-white text-sm">Session Date *</label>
              <input
                type="date"
                className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-white text-sm">Chip Denomination</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                placeholder="₹25, ₹50, ₹100, ₹500"
                value={chipDenomination}
                onChange={(e) => setChipDenomination(e.target.value)}
              />
            </div>
            <div>
              <label className="text-white text-sm">Total Rake Amount (₹) *</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                placeholder="₹0.00"
                value={totalRakeAmount}
                onChange={(e) => setTotalRakeAmount(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-white text-sm">Notes</label>
              <textarea
                className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                rows="3"
                placeholder="Additional notes about the rake entry..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleEnterRake}
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Enter Rake to Club
            </button>
            <button
              onClick={() => {
                setSelectedTable("");
                setSessionDate("");
                setChipDenomination("");
                setTotalRakeAmount("");
                setNotes("");
              }}
              className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Clear Form
            </button>
          </div>
        </div>
      </section>

      {/* Rake Entry History */}
      <section className="p-6 bg-gradient-to-r from-indigo-600/30 via-blue-500/20 to-cyan-700/30 rounded-xl shadow-md border border-indigo-800/40">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            Rake Entry History
          </h2>
          <div className="flex gap-2">
            <input
              type="date"
              className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              placeholder="Filter by date"
            />
            <select
              className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
              value={filterTable}
              onChange={(e) => setFilterTable(e.target.value)}
            >
              <option value="all">All Tables</option>
              <option value="Table 1">Table 1</option>
              <option value="Table 2">Table 2</option>
              <option value="Table 3">Table 3</option>
            </select>
            <button
              onClick={handleExportCSV}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm"
            >
              📥 Export CSV
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 p-4 rounded-lg">
            <div className="text-sm text-gray-300">Total Entries</div>
            <div className="text-2xl font-bold text-white">
              {filteredEntries.length}
            </div>
          </div>
          <div className="bg-white/10 p-4 rounded-lg">
            <div className="text-sm text-gray-300">Total Entered</div>
            <div className="text-2xl font-bold text-purple-300">
              ₹{totalEntered.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="bg-white/10 p-4 rounded-lg">
            <div className="text-sm text-gray-300">Average per Entry</div>
            <div className="text-2xl font-bold text-white">
              ₹
              {filteredEntries.length > 0
                ? Math.round(totalEntered / filteredEntries.length).toLocaleString("en-IN")
                : "0"}
            </div>
          </div>
        </div>

        {/* Entries List */}
        <div className="bg-white/10 p-4 rounded-lg">
          {filteredEntries.length > 0 ? (
            <div className="space-y-3">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white/5 p-4 rounded-lg border border-white/10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-gray-400">Table ID</div>
                      <div className="text-white font-semibold">{entry.tableId}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Session Date</div>
                      <div className="text-white">{entry.sessionDate}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Rake Amount</div>
                      <div className="text-purple-300 font-bold text-lg">
                        ₹{entry.totalRakeAmount.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Entered At</div>
                      <div className="text-white text-sm">{entry.enteredAt}</div>
                    </div>
                    {entry.chipDenomination && (
                      <div className="md:col-span-2">
                        <div className="text-xs text-gray-400">Chip Denomination</div>
                        <div className="text-white text-sm">{entry.chipDenomination}</div>
                      </div>
                    )}
                    {entry.notes && (
                      <div className="md:col-span-2">
                        <div className="text-xs text-gray-400">Notes</div>
                        <div className="text-white text-sm">{entry.notes}</div>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center">
                    <div className="text-xs text-gray-400">
                      Entered by: <span className="text-white">{entry.enteredBy}</span>
                    </div>
                    <span className="px-3 py-1 bg-purple-500/30 text-purple-300 rounded-full text-xs font-semibold border border-purple-400/50">
                      ✓ Entered
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <div className="text-lg mb-2">No rake entry records found</div>
              <div className="text-sm">
                {filterDate || filterTable !== "all"
                  ? "Try adjusting your filters"
                  : "Start entering rake to club to see entries here"}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

