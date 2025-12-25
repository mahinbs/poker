import React, { useState } from 'react';
import { FaUser, FaChartBar, FaDollarSign, FaCoins, FaTable, FaCreditCard, FaReceipt, FaGift, FaWrench, FaDownload, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { getAuthHeaders } from '../lib/api';

export default function ReportsAnalytics({ clubId }) {
  const [selectedReport, setSelectedReport] = useState(null);

  const reportTypes = [
    {
      id: 'individual_player',
      name: 'Individual Player Report',
      icon: <FaUser className="text-5xl" />,
      color: 'from-blue-500 to-cyan-500',
      description: 'Detailed report for a specific player'
    },
    {
      id: 'cumulative_player',
      name: 'Cumulative Player Report',
      icon: <FaChartBar className="text-5xl" />,
      color: 'from-purple-500 to-pink-500',
      description: 'Overall statistics for all players'
    },
    {
      id: 'daily_transactions',
      name: 'Daily Transactions Report',
      icon: <FaDollarSign className="text-5xl" />,
      color: 'from-yellow-500 to-orange-500',
      description: 'All transactions for a date range'
    },
    {
      id: 'daily_rake',
      name: 'Daily Rake Report',
      icon: <FaCoins className="text-5xl" />,
      color: 'from-red-500 to-pink-500',
      description: 'Rake collected per day'
    },
    {
      id: 'per_table_transactions',
      name: 'Per Table Transactions Report',
      icon: <FaTable className="text-5xl" />,
      color: 'from-green-500 to-teal-500',
      description: 'Transactions by table'
    },
    {
      id: 'credit_transactions',
      name: 'Credit Transactions Report',
      icon: <FaCreditCard className="text-5xl" />,
      color: 'from-indigo-500 to-purple-500',
      description: 'Credit requests and approvals'
    },
    {
      id: 'expenses',
      name: 'Expenses Report',
      icon: <FaReceipt className="text-5xl" />,
      color: 'from-orange-500 to-red-500',
      description: 'Salaries, tips, and other expenses'
    },
    {
      id: 'bonus',
      name: 'Bonus Report',
      icon: <FaGift className="text-5xl" />,
      color: 'from-pink-500 to-rose-500',
      description: 'Player and staff bonuses'
    },
    {
      id: 'custom',
      name: 'Custom Report',
      icon: <FaWrench className="text-5xl" />,
      color: 'from-gray-500 to-slate-500',
      description: 'Compile multiple reports'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-lg mb-6">
          <h1 className="text-3xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-white/80 mt-2">Generate comprehensive reports with real-time data</p>
        </div>

        {/* Report Type Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Available Report Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTypes.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={`bg-gradient-to-br ${report.color} p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-white`}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-white/20 rounded-full">
                    {report.icon}
                  </div>
                  <h3 className="text-xl font-bold">{report.name}</h3>
                  <p className="text-sm text-white/80">{report.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Report Configuration Modal */}
        {selectedReport && (
          <ReportConfigurationModal
            report={selectedReport}
            clubId={clubId}
            onClose={() => setSelectedReport(null)}
          />
        )}
      </div>
    </div>
  );
}

// Report Configuration Modal
function ReportConfigurationModal({ report, clubId, onClose }) {
  const [config, setConfig] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    format: 'excel',
    playerId: '',
    playerSearch: '',
    tableNumber: '',
    customReportTypes: []
  });
  const [generating, setGenerating] = useState(false);
  const [players, setPlayers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  // Search for players (for Individual Player Report)
  const handlePlayerSearch = async (searchTerm) => {
    if (searchTerm.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      // Mock search - replace with actual API call
      setSearchResults([
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
      ]);
    } catch (error) {
      console.error('Error searching players:', error);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);

      const payload = {
        reportType: report.id,
        startDate: config.startDate,
        endDate: config.endDate,
        format: config.format,
        ...(report.id === 'individual_player' && { playerId: config.playerId }),
        ...(report.id === 'per_table_transactions' && { tableNumber: config.tableNumber }),
        ...(report.id === 'custom' && { customReportTypes: config.customReportTypes })
      };

      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3333/api';
      const response = await fetch(`${API_BASE_URL}/clubs/${clubId}/reports/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.id}_report_${config.startDate}.${config.format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      alert('Report generated successfully!');
      onClose();
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-xl p-8 max-w-2xl w-full my-8">
        <h2 className="text-3xl font-bold text-white mb-6">Report Configuration</h2>

        {/* Report Type Display */}
        <div className={`bg-gradient-to-r ${report.color} p-4 rounded-lg mb-6 flex items-center gap-4`}>
          <div className="text-white text-3xl">{report.icon}</div>
          <div>
            <h3 className="text-xl font-bold text-white">{report.name}</h3>
            <p className="text-white/80 text-sm">{report.description}</p>
          </div>
        </div>

        {/* Individual Player Search */}
        {report.id === 'individual_player' && (
          <div className="mb-6">
            <label className="block text-white mb-2 font-semibold">
              Search Player <span className="text-red-400">(Type at least 3 characters)</span>
            </label>
            <input
              type="text"
              value={config.playerSearch}
              onChange={(e) => {
                setConfig({ ...config, playerSearch: e.target.value });
                handlePlayerSearch(e.target.value);
              }}
              placeholder="Search by name, ID, or email..."
              className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg"
            />
            {searchResults.length > 0 && (
              <div className="mt-2 bg-slate-700 rounded-lg max-h-48 overflow-y-auto">
                {searchResults.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => {
                      setConfig({ ...config, playerId: player.id, playerSearch: player.name });
                      setSearchResults([]);
                    }}
                    className="w-full text-left px-4 py-3 text-white hover:bg-slate-600 transition-colors"
                  >
                    <div className="font-semibold">{player.name}</div>
                    <div className="text-sm text-white/60">{player.email}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Per Table Number Input */}
        {report.id === 'per_table_transactions' && (
          <div className="mb-6">
            <label className="block text-white mb-2 font-semibold">
              Table Number <span className="text-white/60 text-sm">(Optional - leave blank for all tables)</span>
            </label>
            <input
              type="text"
              value={config.tableNumber}
              onChange={(e) => setConfig({ ...config, tableNumber: e.target.value })}
              placeholder="e.g., Table 1, T-5"
              className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg"
            />
          </div>
        )}

        {/* Custom Report - Select Multiple */}
        {report.id === 'custom' && (
          <div className="mb-6">
            <label className="block text-white mb-3 font-semibold">
              Select Multiple Report Types to Compile
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['cumulative_player', 'daily_transactions', 'daily_rake', 'credit_transactions', 'expenses', 'bonus'].map((type) => (
                <label key={type} className="flex items-center gap-2 bg-slate-700 p-3 rounded-lg cursor-pointer hover:bg-slate-600">
                  <input
                    type="checkbox"
                    checked={config.customReportTypes.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setConfig({ ...config, customReportTypes: [...config.customReportTypes, type] });
                      } else {
                        setConfig({ ...config, customReportTypes: config.customReportTypes.filter(t => t !== type) });
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-white text-sm capitalize">{type.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Date Range */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-3">Date Range</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2">Start Date</label>
              <input
                type="date"
                value={config.startDate}
                onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg"
              />
            </div>
            <div>
              <label className="block text-white mb-2">End Date</label>
              <input
                type="date"
                value={config.endDate}
                onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Format Selection */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-3">Download Format</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setConfig({ ...config, format: 'excel' })}
              className={`p-4 rounded-lg border-2 transition-all ${
                config.format === 'excel'
                  ? 'bg-green-600 border-green-400 text-white'
                  : 'bg-slate-700 border-slate-600 text-white/70 hover:border-slate-500'
              }`}
            >
              <FaFileExcel className="text-4xl mx-auto mb-2" />
              <div className="font-semibold">Excel (.xlsx)</div>
            </button>
            <button
              onClick={() => setConfig({ ...config, format: 'pdf' })}
              className={`p-4 rounded-lg border-2 transition-all ${
                config.format === 'pdf'
                  ? 'bg-red-600 border-red-400 text-white'
                  : 'bg-slate-700 border-slate-600 text-white/70 hover:border-slate-500'
              }`}
            >
              <FaFilePdf className="text-4xl mx-auto mb-2" />
              <div className="font-semibold">PDF (.pdf)</div>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleGenerate}
            disabled={generating || (report.id === 'individual_player' && !config.playerId) || (report.id === 'custom' && config.customReportTypes.length === 0)}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-4 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FaDownload />
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
