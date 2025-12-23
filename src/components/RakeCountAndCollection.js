import React, { useState, useMemo, useEffect } from "react";

export default function RakeCountAndCollection() {
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
      notes: "Morning session",
      collectedBy: "Manager",
      collectedAt: "2024-01-20 14:30",
      status: "collected",
    },
    {
      id: 2,
      tableId: "Table 2",
      sessionDate: "2024-01-20",
      chipDenomination: "₹25, ₹50, ₹100, ₹500",
      totalRakeAmount: 8500,
      notes: "Evening session",
      collectedBy: "Manager",
      collectedAt: "2024-01-20 20:15",
      status: "collected",
    },
  ]);

  const [filterDate, setFilterDate] = useState("");
  const [filterTable, setFilterTable] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const filteredEntries = useMemo(() => {
    return rakeEntries.filter((entry) => {
      if (filterDate && entry.sessionDate !== filterDate) return false;
      if (filterTable !== "all" && entry.tableId !== filterTable) return false;
      return true;
    });
  }, [rakeEntries, filterDate, filterTable]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterDate, filterTable]);

  const totalCollected = useMemo(() => {
    return filteredEntries.reduce(
      (sum, entry) => sum + entry.totalRakeAmount,
      0
    );
  }, [filteredEntries]);

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCollectRake = () => {
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
      collectedBy: "Manager",
      collectedAt: new Date().toLocaleString("en-IN"),
      status: "collected",
    };

    setRakeEntries([newEntry, ...rakeEntries]);
    alert("Rake collected and recorded successfully!");

    // Reset form
    setSelectedTable("");
    setSessionDate("");
    setChipDenomination("");
    setTotalRakeAmount("");
    setNotes("");
  };

  const handleExportCSV = () => {
    const csvContent = [
      ["Table ID", "Session Date", "Chip Denomination", "Total Rake Amount", "Notes", "Collected By", "Collected At"],
      ...filteredEntries.map((entry) => [
        entry.tableId,
        entry.sessionDate,
        entry.chipDenomination,
        entry.totalRakeAmount,
        entry.notes,
        entry.collectedBy,
        entry.collectedAt,
      ]),
    ]
      .map((row) => row.map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rake_collection_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Rake Collection Form */}
      <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
        <h2 className="text-xl font-bold text-white mb-6">
          Rake Count and Collection
        </h2>
        <div className="bg-white/10 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">
            Collect Rake from Table
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
                placeholder="Additional notes about the rake collection..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleCollectRake}
              className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Collect Rake
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

      {/* Rake Collection History */}
      <section className="p-6 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-purple-700/30 rounded-xl shadow-md border border-blue-800/40">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-white">
            Rake Collection History
          </h2>
          <div className="flex gap-2 flex-wrap">
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
            <select
              className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
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
            <div className="text-sm text-gray-300">Total Collected</div>
            <div className="text-2xl font-bold text-green-300">
              ₹{totalCollected.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="bg-white/10 p-4 rounded-lg">
            <div className="text-sm text-gray-300">Average per Entry</div>
            <div className="text-2xl font-bold text-white">
              ₹
              {filteredEntries.length > 0
                ? Math.round(totalCollected / filteredEntries.length).toLocaleString("en-IN")
                : "0"}
            </div>
          </div>
        </div>

        {/* Pagination Info */}
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-300">
          <div>
            Showing <span className="text-white font-semibold">{startIndex + 1}</span> to{" "}
            <span className="text-white font-semibold">{Math.min(endIndex, filteredEntries.length)}</span> of{" "}
            <span className="text-white font-semibold">{filteredEntries.length}</span> entries
          </div>
          {totalPages > 1 && (
            <div className="flex gap-2 items-center">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  currentPage === 1
                    ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600/80 text-white hover:bg-blue-600 shadow-md hover:scale-105"
                }`}
                title="First Page"
              >
                ⏮ First
              </button>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  currentPage === 1
                    ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                    : "bg-white/10 text-white hover:bg-white/20 shadow-md hover:scale-105"
                }`}
                title="Previous Page"
              >
                ← Previous
              </button>
              <div className="flex gap-1 items-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all min-w-[40px] ${
                          currentPage === page
                            ? "bg-blue-600 text-white shadow-lg scale-110 ring-2 ring-blue-400"
                            : "bg-white/10 text-white hover:bg-white/20 hover:scale-105"
                        }`}
                        title={`Go to page ${page}`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  currentPage === totalPages
                    ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                    : "bg-white/10 text-white hover:bg-white/20 shadow-md hover:scale-105"
                }`}
                title="Next Page"
              >
                Next →
              </button>
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  currentPage === totalPages
                    ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600/80 text-white hover:bg-blue-600 shadow-md hover:scale-105"
                }`}
                title="Last Page"
              >
                Last ⏭
              </button>
              <span className="text-white ml-2 px-3 py-2 bg-white/5 rounded-lg">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          )}
        </div>

        {/* Entries List */}
        <div className="bg-white/10 p-4 rounded-lg">
          {paginatedEntries.length > 0 ? (
            <div className="space-y-3">
              {paginatedEntries.map((entry) => (
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
                      <div className="text-green-300 font-bold text-lg">
                        ₹{entry.totalRakeAmount.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Collected At</div>
                      <div className="text-white text-sm">{entry.collectedAt}</div>
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
                      Collected by: <span className="text-white">{entry.collectedBy}</span>
                    </div>
                    <span className="px-3 py-1 bg-green-500/30 text-green-300 rounded-full text-xs font-semibold border border-green-400/50">
                      ✓ Collected
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <div className="text-lg mb-2">No rake collection entries found</div>
              <div className="text-sm">
                {filterDate || filterTable !== "all"
                  ? "Try adjusting your filters"
                  : "Start collecting rake from tables to see entries here"}
              </div>
            </div>
          )}
        </div>

        {/* Pagination Controls - Bottom */}
        {totalPages > 1 && (
          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-300">
                Showing <span className="text-white font-semibold">{startIndex + 1}</span> to{" "}
                <span className="text-white font-semibold">{Math.min(endIndex, filteredEntries.length)}</span> of{" "}
                <span className="text-white font-semibold">{filteredEntries.length}</span> entries
              </div>
              <div className="flex gap-2 items-center flex-wrap justify-center">
                <button
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    currentPage === 1
                      ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600/80 text-white hover:bg-blue-600 shadow-md hover:scale-105"
                  }`}
                  title="First Page"
                >
                  ⏮ First
                </button>
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    currentPage === 1
                      ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                      : "bg-white/10 text-white hover:bg-white/20 shadow-md hover:scale-105"
                  }`}
                  title="Previous Page"
                >
                  ← Previous
                </button>
                <div className="flex gap-1 items-center">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all min-w-[40px] ${
                            currentPage === page
                              ? "bg-blue-600 text-white shadow-lg scale-110 ring-2 ring-blue-400"
                              : "bg-white/10 text-white hover:bg-white/20 hover:scale-105"
                          }`}
                          title={`Go to page ${page}`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    currentPage === totalPages
                      ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                      : "bg-white/10 text-white hover:bg-white/20 shadow-md hover:scale-105"
                  }`}
                  title="Next Page"
                >
                  Next →
                </button>
                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    currentPage === totalPages
                      ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600/80 text-white hover:bg-blue-600 shadow-md hover:scale-105"
                  }`}
                  title="Last Page"
                >
                  Last ⏭
                </button>
              </div>
              <div className="text-sm text-white bg-white/5 px-4 py-2 rounded-lg">
                Page <span className="font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

