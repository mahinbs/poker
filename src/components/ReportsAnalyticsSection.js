import React, { useState } from "react";

export default function ReportsAnalyticsSection({
  allPlayersForReport = [],
  registeredPlayers = [],
}) {
  // Reports & Analytics State
  const [selectedReportType, setSelectedReportType] = useState("");
  const [reportDateRange, setReportDateRange] = useState({
    start: "",
    end: "",
  });
  const [selectedPlayerForReport, setSelectedPlayerForReport] = useState(null);
  const [selectedTableForReport, setSelectedTableForReport] = useState("");
  const [customReportSelection, setCustomReportSelection] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [savedReports, setSavedReports] = useState([
    {
      id: 1,
      name: "Daily Revenue - Jan 2024",
      type: "daily_transactions",
      dateRange: "2024-01-01 to 2024-01-31",
      created: "2024-01-15",
    },
    {
      id: 2,
      name: "Player Report - Alex Johnson",
      type: "individual_player",
      player: "P101",
      created: "2024-01-20",
    },
  ]);

  // Available report types
  const reportTypes = [
    { id: "individual_player", name: "Individual Player Report", icon: "👤" },
    { id: "cumulative_player", name: "Cumulative Player Report", icon: "📊" },
    { id: "daily_transactions", name: "Daily Transactions Report", icon: "💰" },
    { id: "daily_rake", name: "Daily Rake Report", icon: "🎰" },
    {
      id: "per_table_transactions",
      name: "Per Table Transactions Report",
      icon: "🃏",
    },
    {
      id: "credit_transactions",
      name: "Credit Transactions Report",
      icon: "💳",
    },
    { id: "expenses", name: "Expenses Report", icon: "📉" },
    { id: "bonus", name: "Bonus Report", icon: "🎁" },
    { id: "custom", name: "Custom Report", icon: "🔧" },
  ];

  // Player search for reports
  const [playerReportSearch, setPlayerReportSearch] = useState("");
  const filteredPlayersForReport =
    playerReportSearch.length >= 3
      ? allPlayersForReport.filter((player) => {
          const searchLower = playerReportSearch.toLowerCase();
          return (
            player.name.toLowerCase().includes(searchLower) ||
            player.id.toLowerCase().includes(searchLower) ||
            (player.email && player.email.toLowerCase().includes(searchLower))
          );
        })
      : [];

  // Handle export CSV for reports
  const handleExportReportCSV = (reportType, data) => {
    const csvContent = [
      ["Report Type", "Date Range", "Generated Date"],
      [
        reportType,
        `${reportDateRange.start} to ${reportDateRange.end}`,
        new Date().toLocaleString("en-IN"),
      ],
      [],
      ...(data || []).map((row) =>
        Array.isArray(row) ? row : Object.values(row)
      ),
    ]
      .map((row) =>
        row
          .map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle export PDF for reports (client-side print)
  const handleExportReportPDF = (reportType) => {
    const printWindow = window.open("", "_blank");
    const reportTitle =
      reportTypes.find((t) => t.id === reportType)?.name || reportType;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4CAF50; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .header { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${reportTitle}</h1>
            <p><strong>Date Range:</strong> ${reportDateRange.start} to ${
      reportDateRange.end
    }</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString(
              "en-IN"
            )}</p>
          </div>
          <table>
            ${
              reportData
                ? `
              <thead>
                <tr>
                  ${reportData[0]
                    ?.map((header) => `<th>${header}</th>`)
                    .join("")}
                </tr>
              </thead>
              <tbody>
                ${reportData
                  .slice(1)
                  .map(
                    (row) => `
                  <tr>
                    ${row.map((cell) => `<td>${cell}</td>`).join("")}
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            `
                : "<tr><td>No data available</td></tr>"
            }
          </table>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Generate report data (mock)
  const generateReport = () => {
    if (!selectedReportType) {
      alert("Please select a report type");
      return;
    }
    if (!reportDateRange.start || !reportDateRange.end) {
      alert("Please select date range");
      return;
    }

    let mockData = [];
    switch (selectedReportType) {
      case "individual_player":
        if (!selectedPlayerForReport) {
          alert("Please select a player for individual report");
          return;
        }
        mockData = [
          [
            "Player ID",
            "Name",
            "Total Games",
            "Total Revenue",
            "Total Rake",
            "Win/Loss",
          ],
          [
            selectedPlayerForReport.id,
            selectedPlayerForReport.name,
            "45",
            "₹12,500",
            "₹1,250",
            "₹-5,000",
          ],
        ];
        break;
      case "cumulative_player":
        mockData = [
          [
            "Player ID",
            "Name",
            "Total Games",
            "Total Revenue",
            "Average Session",
            "Total Rake",
          ],
          ["P101", "Alex Johnson", "125", "₹45,000", "₹360", "₹4,500"],
          ["P102", "Maria Garcia", "89", "₹32,500", "₹365", "₹3,250"],
        ];
        break;
      case "daily_transactions":
        mockData = [
          ["Date", "Total Transactions", "Revenue", "Deposits", "Withdrawals"],
          ["2024-01-20", "45", "₹12,450", "₹25,000", "₹10,000"],
          ["2024-01-19", "38", "₹11,200", "₹22,500", "₹8,500"],
        ];
        break;
      case "daily_rake":
        mockData = [
          [
            "Date",
            "Total Rake",
            "Tables",
            "Average Rake per Table",
            "Top Table",
          ],
          ["2024-01-20", "₹1,245", "8", "₹155.63", "Table 1"],
          ["2024-01-19", "₹1,120", "8", "₹140.00", "Table 2"],
        ];
        break;
      case "per_table_transactions":
        mockData = [
          ["Table", "Date", "Transactions", "Revenue", "Rake", "Players"],
          ["Table 1", "2024-01-20", "12", "₹5,200", "₹520", "8"],
          ["Table 2", "2024-01-20", "10", "₹4,100", "₹410", "6"],
        ];
        break;
      case "credit_transactions":
        mockData = [
          [
            "Date",
            "Player",
            "Type",
            "Amount",
            "Balance Before",
            "Balance After",
          ],
          ["2024-01-20", "P101", "Credit Granted", "₹50,000", "₹0", "₹50,000"],
          [
            "2024-01-20",
            "P102",
            "Credit Adjustment",
            "₹25,000",
            "₹25,000",
            "₹50,000",
          ],
        ];
        break;
      case "expenses":
        mockData = [
          ["Date", "Category", "Description", "Amount", "Approved By"],
          ["2024-01-20", "Operations", "Staff Payment", "₹15,000", "Admin"],
          ["2024-01-19", "Maintenance", "Equipment Repair", "₹8,500", "Admin"],
        ];
        break;
      case "bonus":
        mockData = [
          ["Date", "Player", "Bonus Type", "Amount", "Status", "Expiry"],
          [
            "2024-01-20",
            "P101",
            "Welcome Bonus",
            "₹1,000",
            "Active",
            "2024-02-20",
          ],
          ["2024-01-19", "P102", "Referral Bonus", "₹500", "Used", "N/A"],
        ];
        break;
      case "custom":
        if (customReportSelection.length === 0) {
          alert("Please select at least one report type for custom report");
          return;
        }
        mockData = [
          ["Custom Report", "Compiled from multiple reports"],
          ["Report Types", customReportSelection.join(", ")],
          ["Generated", new Date().toLocaleString("en-IN")],
        ];
        break;
    }
    setReportData(mockData);
    alert(`Report generated successfully! Preview below.`);
  };

  // Referral Analytics State
  const [referralAgentSearch, setReferralAgentSearch] = useState("");
  const [referralCodeSearch, setReferralCodeSearch] = useState("");
  const [selectedReferralAgent, setSelectedReferralAgent] = useState(null);
  const [selectedReferralCode, setSelectedReferralCode] = useState(null);

  const allReferredPlayers = registeredPlayers.filter(
    (player) => player.referredBy || player.referralCode
  );
  const uniqueReferrers = Array.from(
    new Set(
      allReferredPlayers.map((player) => player.referredBy).filter(Boolean)
    )
  );
  const uniqueReferralCodes = Array.from(
    new Set(
      allReferredPlayers.map((player) => player.referralCode).filter(Boolean)
    )
  );

  const filteredReferrersForSearch =
    referralAgentSearch.length >= 2 && !selectedReferralAgent
      ? uniqueReferrers.filter((agent) =>
          (agent || "")
            .toLowerCase()
            .includes(referralAgentSearch.toLowerCase())
        )
      : [];

  const filteredReferralCodesForSearch =
    referralCodeSearch.length >= 2 && !selectedReferralCode
      ? uniqueReferralCodes.filter((code) =>
          (code || "").toLowerCase().includes(referralCodeSearch.toLowerCase())
        )
      : [];

  const filteredReferralPlayers = allReferredPlayers.filter((player) => {
    const playerAgent = (player.referredBy || "").toLowerCase();
    const playerCode = (player.referralCode || "").toLowerCase();

    const agentMatch = selectedReferralAgent
      ? playerAgent === selectedReferralAgent.toLowerCase()
      : referralAgentSearch
      ? playerAgent.includes(referralAgentSearch.toLowerCase())
      : true;

    const codeMatch = selectedReferralCode
      ? playerCode === selectedReferralCode.toLowerCase()
      : referralCodeSearch
      ? playerCode.includes(referralCodeSearch.toLowerCase())
      : true;

    return agentMatch && codeMatch;
  });

  return (
    <div className="space-y-6">
      {/* Quick Report Access */}
      <section className="p-6 bg-gradient-to-r from-orange-600/30 via-red-500/20 to-pink-700/30 rounded-xl shadow-md border border-orange-800/40">
        <h2 className="text-xl font-bold text-white mb-6">
          Quick Report Access
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => {
              const today = new Date().toISOString().split("T")[0];
              setSelectedReportType("daily_transactions");
              setReportDateRange({ start: today, end: today });
              setTimeout(() => {
                const mockData = [
                  [
                    "Date",
                    "Total Transactions",
                    "Revenue",
                    "Deposits",
                    "Withdrawals",
                  ],
                  [today, "45", "₹12,450", "₹25,000", "₹10,000"],
                ];
                setReportData(mockData);
              }, 100);
            }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-4 py-3 rounded-lg font-semibold shadow"
          >
            📊 Today's Transactions
          </button>
          <button
            onClick={() => {
              const today = new Date().toISOString().split("T")[0];
              setSelectedReportType("daily_rake");
              setReportDateRange({ start: today, end: today });
              setTimeout(() => {
                const mockData = [
                  [
                    "Date",
                    "Total Rake",
                    "Tables",
                    "Average Rake per Table",
                    "Top Table",
                  ],
                  [today, "₹1,245", "8", "₹155.63", "Table 1"],
                ];
                setReportData(mockData);
              }, 100);
            }}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white px-4 py-3 rounded-lg font-semibold shadow"
          >
            🎰 Today's Rake
          </button>
          <button
            onClick={() => {
              const today = new Date().toISOString().split("T")[0];
              setSelectedReportType("credit_transactions");
              setReportDateRange({ start: today, end: today });
              setTimeout(() => {
                const mockData = [
                  [
                    "Date",
                    "Player",
                    "Type",
                    "Amount",
                    "Balance Before",
                    "Balance After",
                  ],
                  [today, "P101", "Credit Granted", "₹50,000", "₹0", "₹50,000"],
                ];
                setReportData(mockData);
              }, 100);
            }}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-4 py-3 rounded-lg font-semibold shadow"
          >
            💳 Today's Credit
          </button>
          <button
            onClick={() => {
              const today = new Date().toISOString().split("T")[0];
              setSelectedReportType("expenses");
              setReportDateRange({ start: today, end: today });
              setTimeout(() => {
                const mockData = [
                  ["Date", "Category", "Description", "Amount", "Approved By"],
                  [today, "Operations", "Staff Payment", "₹15,000", "Admin"],
                ];
                setReportData(mockData);
              }, 100);
            }}
            className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-400 hover:to-orange-500 text-white px-4 py-3 rounded-lg font-semibold shadow"
          >
            📉 Today's Expenses
          </button>
        </div>
      </section>

      {/* Report Type Selection */}
      <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-red-700/30 rounded-xl shadow-md border border-purple-800/40">
        <h2 className="text-xl font-bold text-white mb-6">Generate Reports</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/10 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">
              Report Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm mb-2 block">
                  Select Report Type
                </label>
                <select
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                  value={selectedReportType}
                  onChange={(e) => {
                    setSelectedReportType(e.target.value);
                    setReportData(null);
                    if (e.target.value !== "individual_player")
                      setSelectedPlayerForReport(null);
                    if (e.target.value !== "custom")
                      setCustomReportSelection([]);
                  }}
                >
                  <option value="">-- Select Report Type --</option>
                  {reportTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.icon} {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Player Selection for Individual Player Report */}
              {selectedReportType === "individual_player" && (
                <div className="relative">
                  <label className="text-white text-sm mb-2 block">
                    Search Player (Type at least 3 characters)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                    placeholder="Search by name, ID, or email..."
                    value={playerReportSearch}
                    onChange={(e) => {
                      setPlayerReportSearch(e.target.value);
                      setSelectedPlayerForReport(null);
                    }}
                  />
                  {playerReportSearch.length >= 3 &&
                    filteredPlayersForReport.length > 0 &&
                    !selectedPlayerForReport && (
                      <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredPlayersForReport.map((player) => (
                          <div
                            key={player.id}
                            onClick={() => {
                              setSelectedPlayerForReport(player);
                              setPlayerReportSearch(
                                `${player.name} (${player.id})`
                              );
                            }}
                            className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0"
                          >
                            <div className="text-white font-medium">
                              {player.name}
                            </div>
                            <div className="text-gray-400 text-xs">
                              ID: {player.id}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  {selectedPlayerForReport && (
                    <div className="mt-2 p-2 bg-green-500/20 border border-green-400/30 rounded text-sm">
                      <span className="text-green-300">
                        Selected: {selectedPlayerForReport.name} (
                        {selectedPlayerForReport.id})
                      </span>
                      <button
                        onClick={() => {
                          setSelectedPlayerForReport(null);
                          setPlayerReportSearch("");
                        }}
                        className="ml-2 text-red-400 hover:text-red-300"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Table Selection for Per Table Transactions */}
              {selectedReportType === "per_table_transactions" && (
                <div>
                  <label className="text-white text-sm mb-2 block">
                    Select Table (Optional - leave blank for all tables)
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                    value={selectedTableForReport}
                    onChange={(e) => setSelectedTableForReport(e.target.value)}
                  >
                    <option value="">All Tables</option>
                    <option value="Table 1">Table 1</option>
                    <option value="Table 2">Table 2</option>
                    <option value="Table 3">Table 3</option>
                    <option value="Table 4">Table 4</option>
                  </select>
                </div>
              )}

              {/* Custom Report Multi-Select */}
              {selectedReportType === "custom" && (
                <div>
                  <label className="text-white text-sm mb-2 block">
                    Select Multiple Report Types to Compile
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto bg-white/5 p-3 rounded border border-white/10">
                    {reportTypes
                      .filter((t) => t.id !== "custom")
                      .map((type) => (
                        <label
                          key={type.id}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-white/5 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={customReportSelection.includes(type.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCustomReportSelection([
                                  ...customReportSelection,
                                  type.id,
                                ]);
                              } else {
                                setCustomReportSelection(
                                  customReportSelection.filter(
                                    (id) => id !== type.id
                                  )
                                );
                              }
                            }}
                            className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded"
                          />
                          <span className="text-white text-sm">
                            {type.icon} {type.name}
                          </span>
                        </label>
                      ))}
                  </div>
                  {customReportSelection.length > 0 && (
                    <div className="mt-2 p-2 bg-blue-500/20 border border-blue-400/30 rounded text-sm">
                      <span className="text-blue-300">
                        Selected: {customReportSelection.length} report type(s)
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-white text-sm mb-2 block">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-gray-400 text-xs">Start Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      value={reportDateRange.start}
                      onChange={(e) =>
                        setReportDateRange({
                          ...reportDateRange,
                          start: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs">End Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      value={reportDateRange.end}
                      onChange={(e) =>
                        setReportDateRange({
                          ...reportDateRange,
                          end: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={generateReport}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold"
              >
                Generate Report
              </button>
            </div>
          </div>

          <div className="bg-white/10 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">
              Report Preview
            </h3>
            {reportData ? (
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <table className="min-w-full text-left text-white/90 text-sm">
                    <thead className="text-white/70 text-xs border-b border-white/20">
                      <tr>
                        {reportData[0]?.map((header, idx) => (
                          <th key={idx} className="py-2 pr-4">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.slice(1).map((row, rowIdx) => (
                        <tr key={rowIdx} className="border-b border-white/10">
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx} className="py-2 pr-4">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleExportReportCSV(selectedReportType, reportData)
                    }
                    className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                  >
                    📥 Export CSV
                  </button>
                  <button
                    onClick={() => handleExportReportPDF(selectedReportType)}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                  >
                    📄 Export PDF
                  </button>
                  <button
                    onClick={() => {
                      const reportName = prompt("Enter report name to save:");
                      if (reportName) {
                        setSavedReports((prev) => [
                          ...prev,
                          {
                            id: Date.now(),
                            name: reportName,
                            type: selectedReportType,
                            dateRange: `${reportDateRange.start} to ${reportDateRange.end}`,
                            created: new Date().toISOString().split("T")[0],
                            player: selectedPlayerForReport?.id || null,
                          },
                        ]);
                        alert("Report saved successfully!");
                      }
                    }}
                    className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                  >
                    💾 Save Report
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <div className="text-lg mb-2">No report generated yet</div>
                <div className="text-sm">
                  Select a report type and generate to preview
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Report Types Grid */}
      <section className="p-6 bg-gradient-to-r from-indigo-600/30 via-blue-500/20 to-cyan-700/30 rounded-xl shadow-md border border-indigo-800/40">
        <h2 className="text-xl font-bold text-white mb-6">
          Available Report Types
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setSelectedReportType(type.id);
                setReportData(null);
                if (type.id !== "individual_player")
                  setSelectedPlayerForReport(null);
                if (type.id !== "custom") setCustomReportSelection([]);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`p-4 rounded-lg border transition-all ${
                selectedReportType === type.id
                  ? "bg-white/20 border-white/40 shadow-lg scale-105"
                  : "bg-white/10 border-white/20 hover:bg-white/15"
              }`}
            >
              <div className="text-2xl mb-2">{type.icon}</div>
              <div className="text-white font-semibold text-sm">
                {type.name}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Saved Reports Management */}
      <section className="p-6 bg-gradient-to-r from-emerald-600/30 via-green-500/20 to-teal-700/30 rounded-xl shadow-md border border-emerald-800/40">
        <h2 className="text-xl font-bold text-white mb-6">
          Saved Reports (CRUD Operations)
        </h2>
        <div className="bg-white/10 p-4 rounded-lg">
          {savedReports.length > 0 ? (
            <div className="space-y-3">
              {savedReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white/5 p-4 rounded-lg border border-white/10"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-white font-semibold">
                          {report.name}
                        </h4>
                        <span className="bg-blue-500/30 text-blue-300 px-2 py-1 rounded text-xs">
                          {reportTypes.find((t) => t.id === report.type)
                            ?.name || report.type}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-300">
                        <div>Date Range: {report.dateRange}</div>
                        <div>Created: {report.created}</div>
                        {report.player && <div>Player: {report.player}</div>}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          const reportTypeObj = reportTypes.find(
                            (t) => t.id === report.type
                          );
                          if (reportTypeObj) {
                            setSelectedReportType(report.type);
                            if (report.player) {
                              const player = allPlayersForReport.find(
                                (p) => p.id === report.player
                              );
                              if (player) {
                                setSelectedPlayerForReport(player);
                                setPlayerReportSearch(
                                  `${player.name} (${player.id})`
                                );
                              }
                            }
                            setReportDateRange({
                              start: report.dateRange.split(" to ")[0],
                              end:
                                report.dateRange.split(" to ")[1] ||
                                report.dateRange.split(" to ")[0],
                            });
                            alert(
                              "Report configuration loaded. Click 'Generate Report' to regenerate."
                            );
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
                      >
                        🔄 Load
                      </button>
                      <button
                        onClick={() => {
                          const newName = prompt(
                            "Enter new report name:",
                            report.name
                          );
                          if (newName) {
                            setSavedReports((prev) =>
                              prev.map((r) =>
                                r.id === report.id ? { ...r, name: newName } : r
                              )
                            );
                            alert("Report updated successfully!");
                          }
                        }}
                        className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(`Delete report "${report.name}"?`)
                          ) {
                            setSavedReports((prev) =>
                              prev.filter((r) => r.id !== report.id)
                            );
                            alert("Report deleted successfully!");
                          }
                        }}
                        className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm"
                      >
                        🗑️ Delete
                      </button>
                      <button
                        onClick={() => {
                          handleExportReportCSV(report.type, reportData);
                        }}
                        className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm"
                      >
                        📥 CSV
                      </button>
                      <button
                        onClick={() => {
                          handleExportReportPDF(report.type);
                        }}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded text-sm"
                      >
                        📄 PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              No saved reports. Generate and save a report to see it here.
            </div>
          )}
        </div>
      </section>

      {/* Referral Analytics */}
      {registeredPlayers.length > 0 && (
        <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
          <h2 className="text-xl font-bold text-white mb-6">
            Referral Analytics & Tracking
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">
                Filter Referred Players
              </h3>
              <div className="space-y-4">
                <div className="relative">
                  <label className="text-white text-sm">
                    Search by Agent / Referrer
                  </label>
                  <input
                    type="text"
                    className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                    placeholder="Enter agent or partner name"
                    value={selectedReferralAgent ?? referralAgentSearch}
                    onChange={(e) => {
                      setReferralAgentSearch(e.target.value);
                      setSelectedReferralAgent(null);
                    }}
                  />
                  {referralAgentSearch.length >= 2 &&
                    filteredReferrersForSearch.length > 0 &&
                    !selectedReferralAgent && (
                      <div className="absolute z-20 w-full mt-1 bg-gray-900 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredReferrersForSearch.map((agent) => (
                          <div
                            key={agent}
                            onClick={() => {
                              setSelectedReferralAgent(agent);
                              setReferralAgentSearch("");
                            }}
                            className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0 text-sm text-white"
                          >
                            {agent}
                          </div>
                        ))}
                      </div>
                    )}
                  {selectedReferralAgent && (
                    <div className="mt-2 p-2 bg-green-500/20 border border-green-400/30 rounded text-xs text-green-200 flex items-center justify-between">
                      <span>Selected Referrer: {selectedReferralAgent}</span>
                      <button
                        onClick={() => {
                          setSelectedReferralAgent(null);
                          setReferralAgentSearch("");
                        }}
                        className="ml-2 text-red-300 hover:text-red-200 font-semibold"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <label className="text-white text-sm">
                    Search by Referral Code
                  </label>
                  <input
                    type="text"
                    className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                    placeholder="Enter full or partial referral code"
                    value={selectedReferralCode ?? referralCodeSearch}
                    onChange={(e) => {
                      setReferralCodeSearch(e.target.value);
                      setSelectedReferralCode(null);
                    }}
                  />
                  {referralCodeSearch.length >= 2 &&
                    filteredReferralCodesForSearch.length > 0 &&
                    !selectedReferralCode && (
                      <div className="absolute z-20 w-full mt-1 bg-gray-900 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredReferralCodesForSearch.map((code) => (
                          <div
                            key={code}
                            onClick={() => {
                              setSelectedReferralCode(code);
                              setReferralCodeSearch("");
                            }}
                            className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0 text-sm text-white"
                          >
                            {code}
                          </div>
                        ))}
                      </div>
                    )}
                  {selectedReferralCode && (
                    <div className="mt-2 p-2 bg-cyan-500/20 border border-cyan-400/30 rounded text-xs text-cyan-200 flex items-center justify-between">
                      <span>Selected Code: {selectedReferralCode}</span>
                      <button
                        onClick={() => {
                          setSelectedReferralCode(null);
                          setReferralCodeSearch("");
                        }}
                        className="ml-2 text-red-300 hover:text-red-200 font-semibold"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
                {uniqueReferrers.length > 0 && (
                  <div>
                    <div className="text-white text-sm mb-2">Top Referrers</div>
                    <div className="flex flex-wrap gap-2">
                      {uniqueReferrers.map((agent) => (
                        <button
                          key={agent}
                          onClick={() => {
                            setSelectedReferralAgent(agent || "");
                            setReferralAgentSearch("");
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition border ${
                            (selectedReferralAgent || "").toLowerCase() ===
                            (agent || "").toLowerCase()
                              ? "bg-green-500/40 border-green-400/50 text-green-100"
                              : "bg-white/10 border-white/20 text-white/80 hover:bg-white/15"
                          }`}
                        >
                          {agent || "Unknown"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const snapshot = filteredReferralPlayers.length;
                      alert(
                        `Referral report ready for export. ${snapshot} player(s) match the current filter.`
                      );
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold"
                  >
                    Prepare Referral Report
                  </button>
                  <button
                    onClick={() => {
                      setReferralAgentSearch("");
                      setReferralCodeSearch("");
                      setSelectedReferralAgent(null);
                      setSelectedReferralCode(null);
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold"
                  >
                    Clear
                  </button>
                </div>
                <div className="bg-white/5 p-3 rounded border border-white/10 text-sm text-gray-200">
                  <div>
                    Total referred players:{" "}
                    <span className="font-semibold text-white">
                      {allReferredPlayers.length}
                    </span>
                  </div>
                  <div>
                    Unique referrers:{" "}
                    <span className="font-semibold text-white">
                      {uniqueReferrers.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">
                Referred Players ({filteredReferralPlayers.length}/
                {allReferredPlayers.length})
              </h3>
              {filteredReferralPlayers.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {filteredReferralPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="bg-white/5 p-3 rounded-lg border border-green-400/30"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-white font-semibold text-base">
                            {player.name}
                          </div>
                          <div className="text-xs text-gray-300">
                            ID: {player.id} • Email: {player.email}
                          </div>
                          <div className="text-xs text-gray-300">
                            Phone: {player.phone}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Referred By:{" "}
                            <span className="text-green-200 font-medium">
                              {player.referredBy || "Unknown"}
                            </span>
                            {player.referralCode && (
                              <>
                                <span className="text-gray-500 mx-1">•</span>
                                Referral Code:{" "}
                                <span className="text-cyan-200 font-medium">
                                  {player.referralCode}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Registered:{" "}
                            {new Date(
                              player.registrationDate
                            ).toLocaleDateString()}{" "}
                            • Last Active: {player.lastActive}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span
                            className={`px-2 py-1 rounded text-xs text-center font-semibold ${
                              player.accountStatus === "Active"
                                ? "bg-green-500/30 text-green-200"
                                : player.accountStatus === "Suspended"
                                ? "bg-red-500/30 text-red-200"
                                : "bg-gray-500/30 text-gray-200"
                            }`}
                          >
                            {player.accountStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-300 border border-dashed border-white/20 rounded-lg">
                  <div className="text-lg font-semibold mb-2">
                    No referred players found
                  </div>
                  <div className="text-sm">
                    Adjust the referral filters to see matching players
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
