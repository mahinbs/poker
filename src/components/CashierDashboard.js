import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomSelect from "./common/CustomSelect";

export default function CashierDashboard() {
  const [activeItem, setActiveItem] = useState("Transactions Dashboard");
  const navigate = useNavigate();

  
  const menuItems = [
    "Transactions Dashboard",
    "Balance Management",
    "Table View",
    "Payroll Management", 
    "Transaction History & Reports",
    "Shift Reconciliation",
    "Bonus Processing",
    "Player Support",
  ];

  const handleSignOut = () => {
    navigate("/cashier/signin");
  };

  // Mock players data with balances (connected across all portals)
  const [playerBalances, setPlayerBalances] = useState({
    "P101": { id: "P101", name: "Alex Johnson", email: "alex.johnson@example.com", availableBalance: 25000, tableBalance: 5000, tableId: 1, seatNumber: 3 },
    "P102": { id: "P102", name: "Maria Garcia", email: "maria.garcia@example.com", availableBalance: 15000, tableBalance: 0, tableId: null, seatNumber: null },
    "P103": { id: "P103", name: "Rajesh Kumar", email: "rajesh.kumar@example.com", availableBalance: 45000, tableBalance: 10000, tableId: 1, seatNumber: 5 },
    "P104": { id: "P104", name: "Priya Sharma", email: "priya.sharma@example.com", availableBalance: 32000, tableBalance: 0, tableId: null, seatNumber: null },
    "P105": { id: "P105", name: "Amit Patel", email: "amit.patel@example.com", availableBalance: 18000, tableBalance: 7500, tableId: 2, seatNumber: 2 },
    "P106": { id: "P106", name: "John Doe", email: "john.doe@example.com", availableBalance: 28000, tableBalance: 0, tableId: null, seatNumber: null },
    "P107": { id: "P107", name: "Jane Smith", email: "jane.smith@example.com", availableBalance: 35000, tableBalance: 0, tableId: null, seatNumber: null }
  });

  // Mock players data for search (for backward compatibility)
  const mockPlayers = Object.values(playerBalances).map(({ availableBalance, tableBalance, tableId, seatNumber, ...player }) => player);

  // Table balances tracking
  const [tableBalances, setTableBalances] = useState({
    1: { id: 1, name: "Table 1 - Texas Hold'em", totalBalance: 15000, players: ["P101", "P103"] },
    2: { id: 2, name: "Table 2 - Omaha", totalBalance: 7500, players: ["P105"] },
    3: { id: 3, name: "Table 3 - Stud", totalBalance: 0, players: [] }
  });

  // Chat/Support System State
  const [chatType, setChatType] = useState("player");
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Player chats
  const [playerChats, setPlayerChats] = useState([
    {
      id: "PC001",
      playerId: "P101",
      playerName: "Alex Johnson",
      status: "open",
      lastMessage: "I need help with withdrawal.",
      lastMessageTime: new Date(Date.now() - 180000).toISOString(),
      messages: [
        { id: "M1", sender: "player", senderName: "Alex Johnson", text: "I need help with withdrawal.", timestamp: new Date(Date.now() - 180000).toISOString() },
        { id: "M2", sender: "staff", senderName: "Cashier", text: "Sure, I can help you with that.", timestamp: new Date(Date.now() - 120000).toISOString() }
      ],
      createdAt: new Date(Date.now() - 600000).toISOString()
    },
    {
      id: "PC002",
      playerId: "P102",
      playerName: "Maria Garcia",
      status: "in_progress",
      lastMessage: "Thank you for processing my deposit.",
      lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
      messages: [
        { id: "M3", sender: "player", senderName: "Maria Garcia", text: "I want to deposit money.", timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: "M4", sender: "staff", senderName: "Cashier", text: "Please come to the cashier desk.", timestamp: new Date(Date.now() - 3500000).toISOString() },
        { id: "M5", sender: "player", senderName: "Maria Garcia", text: "Thank you for processing my deposit.", timestamp: new Date(Date.now() - 3400000).toISOString() }
      ],
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ]);

  // Staff chats
  const [staffChats, setStaffChats] = useState([
    {
      id: "SC001",
      staffId: "ST001",
      staffName: "Sarah Johnson",
      staffRole: "Dealer",
      status: "open",
      lastMessage: "Need cash for Table 3",
      lastMessageTime: new Date(Date.now() - 300000).toISOString(),
      messages: [
        { id: "M6", sender: "staff", senderName: "Sarah Johnson", text: "Need cash for Table 3", timestamp: new Date(Date.now() - 300000).toISOString() },
        { id: "M7", sender: "cashier", senderName: "Cashier", text: "I'll prepare it now.", timestamp: new Date(Date.now() - 240000).toISOString() }
      ],
      createdAt: new Date(Date.now() - 300000).toISOString()
    }
  ]);

  const filteredChats = chatType === "player" 
    ? playerChats.filter(chat => statusFilter === "all" || chat.status === statusFilter)
    : staffChats.filter(chat => statusFilter === "all" || chat.status === statusFilter);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    const message = {
      id: `M${Date.now()}`,
      sender: chatType === "player" ? "staff" : "cashier",
      senderName: "Cashier",
      text: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    if (chatType === "player") {
      setPlayerChats(prev => prev.map(chat => 
        chat.id === selectedChat.id
          ? {
              ...chat,
              messages: [...chat.messages, message],
              lastMessage: message.text,
              lastMessageTime: message.timestamp,
              status: chat.status === "closed" ? "in_progress" : chat.status
            }
          : chat
      ));
    } else {
      setStaffChats(prev => prev.map(chat => 
        chat.id === selectedChat.id
          ? {
              ...chat,
              messages: [...chat.messages, message],
              lastMessage: message.text,
              lastMessageTime: message.timestamp,
              status: chat.status === "closed" ? "in_progress" : chat.status
            }
          : chat
      ));
    }
    setNewMessage("");
  };

  const handleStatusChange = (chatId, newStatus) => {
    if (chatType === "player") {
      setPlayerChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, status: newStatus } : chat
      ));
      if (selectedChat && selectedChat.id === chatId) {
        const updatedChat = playerChats.find(c => c.id === chatId);
        if (updatedChat) setSelectedChat({ ...updatedChat, status: newStatus });
      }
    } else {
      setStaffChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, status: newStatus } : chat
      ));
      if (selectedChat && selectedChat.id === chatId) {
        const updatedChat = staffChats.find(c => c.id === chatId);
        if (updatedChat) setSelectedChat({ ...updatedChat, status: newStatus });
      }
    }
  };

  useEffect(() => {
    if (selectedChat) {
      const currentChats = chatType === "player" ? playerChats : staffChats;
      const updatedChat = currentChats.find(c => c.id === selectedChat.id);
      if (updatedChat) {
        setSelectedChat(updatedChat);
      } else {
        setSelectedChat(null);
      }
    }
  }, [chatType, playerChats, staffChats]);

  // Transaction tracking (buy-in, cash-out, withdrawals)
  const [balanceTransactions, setBalanceTransactions] = useState([
    { id: 1, type: "buy-in", playerId: "P101", playerName: "Alex Johnson", amount: 5000, tableId: 1, tableName: "Table 1 - Texas Hold'em", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), status: "completed" },
    { id: 2, type: "buy-in", playerId: "P103", playerName: "Rajesh Kumar", amount: 10000, tableId: 1, tableName: "Table 1 - Texas Hold'em", timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), status: "completed" },
    { id: 3, type: "buy-in", playerId: "P105", playerName: "Amit Patel", amount: 7500, tableId: 2, tableName: "Table 2 - Omaha", timestamp: new Date(Date.now() - 30 * 60 * 1000), status: "completed" },
    { id: 4, type: "cash-out", playerId: "P102", playerName: "Maria Garcia", amount: 8000, tableId: 1, tableName: "Table 1 - Texas Hold'em", chipCount: 8000, timestamp: new Date(Date.now() - 45 * 60 * 1000), status: "completed", managerVerified: true },
    { id: 5, type: "withdrawal", playerId: "P104", playerName: "Priya Sharma", amount: 5000, timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), status: "completed" }
  ]);

  // Player search states - multiple instances for different sections
  const [depositPlayerSearch, setDepositPlayerSearch] = useState("");
  const [selectedDepositPlayer, setSelectedDepositPlayer] = useState(null);
  const [depositChipCount, setDepositChipCount] = useState("");
  const filteredDepositPlayers = depositPlayerSearch.length >= 3
    ? mockPlayers.filter(player => {
        const searchLower = depositPlayerSearch.toLowerCase();
        return (
          player.name.toLowerCase().includes(searchLower) ||
          player.id.toLowerCase().includes(searchLower) ||
          player.email.toLowerCase().includes(searchLower)
        );
      })
    : [];

  const [withdrawalPlayerSearch, setWithdrawalPlayerSearch] = useState("");
  const [selectedWithdrawalPlayer, setSelectedWithdrawalPlayer] = useState(null);
  const [withdrawalChipCount, setWithdrawalChipCount] = useState("");
  const filteredWithdrawalPlayers = withdrawalPlayerSearch.length >= 3
    ? mockPlayers.filter(player => {
        const searchLower = withdrawalPlayerSearch.toLowerCase();
        return (
          player.name.toLowerCase().includes(searchLower) ||
          player.id.toLowerCase().includes(searchLower) ||
          player.email.toLowerCase().includes(searchLower)
        );
      })
    : [];

  const [adjustmentPlayerSearch, setAdjustmentPlayerSearch] = useState("");
  const [selectedAdjustmentPlayer, setSelectedAdjustmentPlayer] = useState(null);
  const filteredAdjustmentPlayers = adjustmentPlayerSearch.length >= 3
    ? mockPlayers.filter(player => {
        const searchLower = adjustmentPlayerSearch.toLowerCase();
        return (
          player.name.toLowerCase().includes(searchLower) ||
          player.id.toLowerCase().includes(searchLower) ||
          player.email.toLowerCase().includes(searchLower)
        );
      })
    : [];

  const [creditPlayerSearch, setCreditPlayerSearch] = useState("");
  const [selectedCreditPlayer, setSelectedCreditPlayer] = useState(null);
  const filteredCreditPlayers = creditPlayerSearch.length >= 3
    ? mockPlayers.filter(player => {
        const searchLower = creditPlayerSearch.toLowerCase();
        return (
          player.name.toLowerCase().includes(searchLower) ||
          player.id.toLowerCase().includes(searchLower) ||
          player.email.toLowerCase().includes(searchLower)
        );
      })
    : [];

  const [bonusPlayerSearch, setBonusPlayerSearch] = useState("");
  const [selectedBonusPlayer, setSelectedBonusPlayer] = useState(null);
  const filteredBonusPlayers = bonusPlayerSearch.length >= 3
    ? mockPlayers.filter(player => {
        const searchLower = bonusPlayerSearch.toLowerCase();
        return (
          player.name.toLowerCase().includes(searchLower) ||
          player.id.toLowerCase().includes(searchLower) ||
          player.email.toLowerCase().includes(searchLower)
        );
      })
    : [];

  // Balance Management search states
  const [balancePlayerSearch, setBalancePlayerSearch] = useState("");
  const [selectedBalancePlayer, setSelectedBalancePlayer] = useState(null);
  const filteredBalancePlayers = balancePlayerSearch.length >= 3
    ? mockPlayers.filter(player => {
        const searchLower = balancePlayerSearch.toLowerCase();
        return (
          player.name.toLowerCase().includes(searchLower) ||
          player.id.toLowerCase().includes(searchLower) ||
          player.email.toLowerCase().includes(searchLower)
        );
      })
    : [];

  // Mock registered cashiers data (not players)
  const registeredCashiers = [
    { id: "C001", name: "Sarah Williams", email: "sarah.williams@example.com", status: "Active" },
    { id: "C002", name: "Michael Chen", email: "michael.chen@example.com", status: "Active" },
    { id: "C003", name: "Emily Davis", email: "emily.davis@example.com", status: "Active" },
    { id: "C004", name: "David Brown", email: "david.brown@example.com", status: "Active" },
    { id: "C005", name: "Lisa Anderson", email: "lisa.anderson@example.com", status: "Active" }
  ];

  // Cashier search state for Shift Reconciliation
  const [cashierSearch, setCashierSearch] = useState("");
  const [selectedCashier, setSelectedCashier] = useState(null);
  const filteredCashiers = cashierSearch.length >= 3
    ? registeredCashiers.filter(cashier => {
        const searchLower = cashierSearch.toLowerCase();
        return (
          cashier.name.toLowerCase().includes(searchLower) ||
          cashier.id.toLowerCase().includes(searchLower) ||
          cashier.email.toLowerCase().includes(searchLower)
        );
      })
    : [];

  // Reports & Analytics State
  const [selectedReportType, setSelectedReportType] = useState("");
  const [reportDateRange, setReportDateRange] = useState({ start: "", end: "" });
  const [selectedPlayerForReport, setSelectedPlayerForReport] = useState(null);
  const [selectedTableForReport, setSelectedTableForReport] = useState("");
  const [customReportSelection, setCustomReportSelection] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [savedReports, setSavedReports] = useState([
    { id: 1, name: "Daily Revenue - Jan 2024", type: "daily_transactions", dateRange: "2024-01-01 to 2024-01-31", created: "2024-01-15" },
    { id: 2, name: "Player Report - Alex Johnson", type: "individual_player", player: "P101", created: "2024-01-20" }
  ]);

  // Available report types
  const reportTypes = [
    { id: "individual_player", name: "Individual Player Report", icon: "👤" },
    { id: "cumulative_player", name: "Cumulative Player Report", icon: "📊" },
    { id: "daily_transactions", name: "Daily Transactions Report", icon: "💰" },
    { id: "daily_rake", name: "Daily Rake Report", icon: "🎰" },
    { id: "per_table_transactions", name: "Per Table Transactions Report", icon: "🃏" },
    { id: "credit_transactions", name: "Credit Transactions Report", icon: "💳" },
    { id: "expenses", name: "Expenses Report", icon: "📉" },
    { id: "bonus", name: "Bonus Report", icon: "🎁" },
    { id: "custom", name: "Custom Report", icon: "🔧" }
  ];

  // Player search for reports
  const [playerReportSearch, setPlayerReportSearch] = useState("");
  const filteredPlayersForReport = playerReportSearch.length >= 3
    ? mockPlayers.filter(player => {
        const searchLower = playerReportSearch.toLowerCase();
        return (
          player.name.toLowerCase().includes(searchLower) ||
          player.id.toLowerCase().includes(searchLower) ||
          player.email.toLowerCase().includes(searchLower)
        );
      })
    : [];

  // Handle export CSV for reports
  const handleExportReportCSV = (reportType, data) => {
    const csvContent = [
      ["Report Type", "Date Range", "Generated Date"],
      [reportType, `${reportDateRange.start} to ${reportDateRange.end}`, new Date().toLocaleString('en-IN')],
      [],
      ...(data || []).map(row => Array.isArray(row) ? row : Object.values(row))
    ].map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle export PDF for reports (print-friendly view)
  const handleExportReportPDF = (reportType) => {
    const printWindow = window.open('', '_blank');
    const reportTitle = reportTypes.find(t => t.id === reportType)?.name || reportType;
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
            <p><strong>Date Range:</strong> ${reportDateRange.start} to ${reportDateRange.end}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString('en-IN')}</p>
          </div>
          <table>
            ${reportData ? `
              <thead>
                <tr>
                  ${reportData[0]?.map(header => `<th>${header}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${reportData.slice(1).map(row => `
                  <tr>
                    ${row.map(cell => `<td>${cell}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            ` : '<tr><td>No data available</td></tr>'}
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
    switch(selectedReportType) {
      case "individual_player":
        if (!selectedPlayerForReport) {
          alert("Please select a player for individual report");
          return;
        }
        mockData = [
          ["Player ID", "Name", "Total Games", "Total Revenue", "Total Rake", "Win/Loss"],
          [selectedPlayerForReport.id, selectedPlayerForReport.name, "45", "₹12,500", "₹1,250", "₹-5,000"]
        ];
        break;
      case "cumulative_player":
        mockData = [
          ["Player ID", "Name", "Total Games", "Total Revenue", "Average Session", "Total Rake"],
          ["P101", "Alex Johnson", "125", "₹45,000", "₹360", "₹4,500"],
          ["P102", "Maria Garcia", "89", "₹32,500", "₹365", "₹3,250"],
          ["P103", "Rajesh Kumar", "156", "₹67,800", "₹435", "₹6,780"]
        ];
        break;
      case "daily_transactions":
        mockData = [
          ["Date", "Total Transactions", "Revenue", "Deposits", "Withdrawals"],
          ["2024-01-20", "45", "₹12,450", "₹25,000", "₹10,000"],
          ["2024-01-19", "38", "₹11,200", "₹22,500", "₹8,500"]
        ];
        break;
      case "daily_rake":
        mockData = [
          ["Date", "Total Rake", "Tables", "Average Rake per Table", "Top Table"],
          ["2024-01-20", "₹1,245", "8", "₹155.63", "Table 1"],
          ["2024-01-19", "₹1,120", "8", "₹140.00", "Table 2"]
        ];
        break;
      case "per_table_transactions":
        mockData = [
          ["Table", "Date", "Transactions", "Revenue", "Rake", "Players"],
          ["Table 1", "2024-01-20", "12", "₹5,200", "₹520", "8"],
          ["Table 2", "2024-01-20", "10", "₹4,100", "₹410", "6"],
          ["Table 3", "2024-01-20", "8", "₹3,150", "₹315", "5"]
        ];
        break;
      case "credit_transactions":
        mockData = [
          ["Date", "Player", "Type", "Amount", "Balance Before", "Balance After"],
          ["2024-01-20", "P101", "Credit Granted", "₹50,000", "₹0", "₹50,000"],
          ["2024-01-20", "P102", "Credit Adjustment", "₹25,000", "₹25,000", "₹50,000"]
        ];
        break;
      case "expenses":
        mockData = [
          ["Date", "Category", "Description", "Amount", "Approved By"],
          ["2024-01-20", "Operations", "Staff Payment", "₹15,000", "Admin"],
          ["2024-01-19", "Maintenance", "Equipment Repair", "₹8,500", "Admin"]
        ];
        break;
      case "bonus":
        mockData = [
          ["Date", "Player", "Bonus Type", "Amount", "Status", "Expiry"],
          ["2024-01-20", "P101", "Welcome Bonus", "₹1,000", "Active", "2024-02-20"],
          ["2024-01-19", "P102", "Referral Bonus", "₹500", "Used", "N/A"]
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
          ["Generated", new Date().toLocaleString('en-IN')]
        ];
        break;
    }
    setReportData(mockData);
    alert(`Report generated successfully! Preview below.`);
  };

  // Helper function to get date/time strings
  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      full: now.toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
  };

  const getPreviousDayDateTime = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return {
      date: yesterday.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: yesterday.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      full: yesterday.toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
  };

  // Revenue and Rake data with date/time
  const currentDateTime = getCurrentDateTime();
  const previousDateTime = getPreviousDayDateTime();
  
  const TIP_HOLD_PERCENT = 0.15;

  const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`;

  const calculateTipShares = (amount) => ({
    club: Math.round(amount * TIP_HOLD_PERCENT),
    staff: Math.round(amount * (1 - TIP_HOLD_PERCENT))
  });

  const revenueData = {
    previousDay: {
      revenue: 125000,
      rake: 12500,
      tips: 3200,
      date: previousDateTime.date,
      time: previousDateTime.time,
      lastUpdated: previousDateTime.full
    },
    currentDay: {
      revenue: 78500,
      rake: 7850,
      tips: 1680,
      date: currentDateTime.date,
      time: currentDateTime.time,
      lastUpdated: currentDateTime.full
    }
  };

  const previousDayTipShares = calculateTipShares(revenueData.previousDay.tips);
  const currentDayTipShares = calculateTipShares(revenueData.currentDay.tips);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans">
      <div className="mx-auto max-w-[1400px] px-6 py-10 grid grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-3 xl:col-span-3 rounded-2xl bg-gradient-to-b from-green-500/20 via-emerald-600/30 to-teal-700/30 p-5 shadow-lg border border-gray-800 min-w-0">
          <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-teal-400 drop-shadow-lg mb-6">
            Cashier Portal
          </div>
          <div className="flex items-center mb-6 text-white min-w-0">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-gray-900 font-bold text-sm">C</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-semibold truncate">Cashier Manager</div>
              <div className="text-sm opacity-80 truncate">cashier@pokerroom.com</div>
            </div>
          </div>

          {/* Sidebar Menu */}
          <nav className="space-y-3">
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveItem(item)}
                className={`w-full text-left rounded-xl px-4 py-3 font-medium transition-all duration-300 shadow-md ${
                  activeItem === item
                    ? "bg-gradient-to-r from-green-400 to-emerald-600 text-gray-900 font-bold shadow-lg scale-[1.02]"
                    : "bg-white/5 hover:bg-gradient-to-r hover:from-green-400/20 hover:to-emerald-500/20 text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Section */}
        <main className="col-span-12 lg:col-span-9 xl:col-span-9 space-y-8">
          {/* Header */}
          <header className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-400 p-6 rounded-xl shadow-md flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Cashier Portal - {activeItem}</h1>
              <p className="text-gray-200 mt-1">Manage financial transactions, payroll, and bonuses</p>
            </div>
            <button 
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
            >
              Sign Out
            </button>
          </header>

          {/* Dynamic Content Based on Active Item */}
          {activeItem === "Transactions Dashboard" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                  { title: "Today's Transactions", value: "₹45,250", color: "from-green-400 via-emerald-500 to-teal-500" },
                  { title: "Pending Deposits", value: "₹12,500", color: "from-blue-400 via-indigo-500 to-violet-500" },
                  { title: "Cash on Hand", value: "₹125,000", color: "from-yellow-400 via-orange-500 to-red-500" },
                  { title: "System Status", value: "Online", color: "from-emerald-400 via-green-500 to-teal-500" },
                ].map((card, i) => (
                  <div
                    key={i}
                    className={`p-6 rounded-xl bg-gradient-to-br ${card.color} text-gray-900 shadow-lg transition-transform transform hover:scale-105`}
                  >
                    <div className="text-sm opacity-90 text-white/90">{card.title}</div>
                    <div className="text-3xl font-bold mt-2 text-white">{card.value}</div>
                    <div className="text-xs mt-1 text-white/70">Real-time data</div>
                  </div>
                ))}
              </div>

              {/* Revenue, Rake & Tips Section */}
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-rose-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Revenue, Rake & Tips Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Previous Day Revenue */}
                  <div className="bg-white/10 p-4 rounded-lg border border-purple-400/30">
                    <div className="text-sm text-gray-300 mb-1">Previous Day Revenue</div>
                    <div className="text-2xl font-bold text-white mb-2">{formatCurrency(revenueData.previousDay.revenue)}</div>
                    <div className="text-xs text-gray-400 mb-1">
                      <div>Date: {revenueData.previousDay.date}</div>
                      <div>Last Updated: {revenueData.previousDay.lastUpdated}</div>
                    </div>
                    <div className="text-xs text-purple-300 font-semibold mt-2">Yesterday's Sessions</div>
                  </div>

                  {/* Current Day Revenue */}
                  <div className="bg-white/10 p-4 rounded-lg border border-green-400/30">
                    <div className="text-sm text-gray-300 mb-1">Current Day Revenue</div>
                    <div className="text-2xl font-bold text-white mb-2">{formatCurrency(revenueData.currentDay.revenue)}</div>
                    <div className="text-xs text-gray-400 mb-1">
                      <div>Date: {revenueData.currentDay.date}</div>
                      <div>Last Updated: {revenueData.currentDay.lastUpdated}</div>
                    </div>
                    <div className="text-xs text-green-300 font-semibold mt-2">Today's Sessions</div>
                  </div>

                  {/* Previous Day Rake */}
                  <div className="bg-white/10 p-4 rounded-lg border border-blue-400/30">
                    <div className="text-sm text-gray-300 mb-1">Previous Day Rake</div>
                    <div className="text-2xl font-bold text-white mb-2">{formatCurrency(revenueData.previousDay.rake)}</div>
                    <div className="text-xs text-gray-400 mb-1">
                      <div>Date: {revenueData.previousDay.date}</div>
                      <div>Last Updated: {revenueData.previousDay.lastUpdated}</div>
                    </div>
                    <div className="text-xs text-blue-300 font-semibold mt-2">Yesterday's Sessions</div>
                  </div>

                  {/* Current Day Rake */}
                  <div className="bg-white/10 p-4 rounded-lg border border-yellow-400/30">
                    <div className="text-sm text-gray-300 mb-1">Current Day Rake</div>
                    <div className="text-2xl font-bold text-white mb-2">{formatCurrency(revenueData.currentDay.rake)}</div>
                    <div className="text-xs text-gray-400 mb-1">
                      <div>Date: {revenueData.currentDay.date}</div>
                      <div>Last Updated: {revenueData.currentDay.lastUpdated}</div>
                    </div>
                    <div className="text-xs text-yellow-300 font-semibold mt-2">Today's Sessions</div>
                  </div>

                  {/* Previous Day Tips */}
                  <div className="bg-white/10 p-4 rounded-lg border border-cyan-400/30">
                    <div className="text-sm text-gray-300 mb-1">Previous Day Tips</div>
                    <div className="text-2xl font-bold text-white mb-2">{formatCurrency(revenueData.previousDay.tips)}</div>
                    <div className="text-xs text-gray-400 mb-1">
                      <div>Club Share: {formatCurrency(previousDayTipShares.club)}</div>
                      <div>Staff Share: {formatCurrency(previousDayTipShares.staff)}</div>
                    </div>
                    <div className="text-xs text-cyan-300 font-semibold mt-2">Hold {Math.round(TIP_HOLD_PERCENT * 100)}% • Staff {Math.round((1 - TIP_HOLD_PERCENT) * 100)}%</div>
                  </div>

                  {/* Current Day Tips */}
                  <div className="bg-white/10 p-4 rounded-lg border border-orange-400/30">
                    <div className="text-sm text-gray-300 mb-1">Current Day Tips</div>
                    <div className="text-2xl font-bold text-white mb-2">{formatCurrency(revenueData.currentDay.tips)}</div>
                    <div className="text-xs text-gray-400 mb-1">
                      <div>Club Share: {formatCurrency(currentDayTipShares.club)}</div>
                      <div>Staff Share: {formatCurrency(currentDayTipShares.staff)}</div>
                    </div>
                    <div className="text-xs text-orange-300 font-semibold mt-2">Hold {Math.round(TIP_HOLD_PERCENT * 100)}% • Staff {Math.round((1 - TIP_HOLD_PERCENT) * 100)}%</div>
                  </div>
                </div>
              </section>

              {/* Transaction Management */}
              <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Transaction Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Deposit Processing</h3>
                    <div className="space-y-4">
                      <div className="relative">
                        <label className="text-white text-sm">Search Player (Type at least 3 characters)</label>
                        <input 
                          type="text" 
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          placeholder="Search by name, ID, or email..." 
                          value={depositPlayerSearch}
                          onChange={(e) => {
                            setDepositPlayerSearch(e.target.value);
                            setSelectedDepositPlayer(null);
                            setDepositChipCount("");
                          }}
                        />
                        {depositPlayerSearch.length >= 3 && filteredDepositPlayers.length > 0 && !selectedDepositPlayer && (
                          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredDepositPlayers.map(player => (
                              <div
                                key={player.id}
                                onClick={() => {
                                  setSelectedDepositPlayer(player);
                                  setDepositPlayerSearch(`${player.name} (${player.id})`);
                                }}
                                className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0"
                              >
                                <div className="text-white font-medium">{player.name}</div>
                                <div className="text-gray-400 text-xs">ID: {player.id} | Email: {player.email}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedDepositPlayer && (
                          <div className="mt-2 p-2 bg-green-500/20 border border-green-400/30 rounded text-sm">
                            <span className="text-green-300">Selected: {selectedDepositPlayer.name} ({selectedDepositPlayer.id})</span>
                            <button 
                              onClick={() => {
                                setSelectedDepositPlayer(null);
                                setDepositPlayerSearch("");
                                setDepositChipCount("");
                              }}
                              className="ml-2 text-red-400 hover:text-red-300"
                            >
                              X
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-white text-sm">Available Balance</label>
                        <input 
                          type="text" 
                          className="w-full mt-1 px-3 py-2 bg-green-500/20 border border-green-400/30 rounded text-white font-semibold" 
                          value={selectedDepositPlayer && playerBalances[selectedDepositPlayer.id] ? `₹${playerBalances[selectedDepositPlayer.id].availableBalance.toLocaleString('en-IN')}` : "₹0.00"} 
                          readOnly 
                        />
                      </div>
                      <div>
                        <label className="text-white text-sm">Amount</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Chip Count</label>
                        <input 
                          type="number" 
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          placeholder="Enter chip count" 
                          value={depositChipCount}
                          onChange={(e) => setDepositChipCount(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-white text-sm">Reference Number</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Transaction reference" />
                      </div>
                      <button 
                        onClick={() => {
                          if (!selectedDepositPlayer) {
                            alert("Please select a player first");
                            return;
                          }
                          alert(`Processing deposit for ${selectedDepositPlayer.name} (${selectedDepositPlayer.id})`);
                          setDepositChipCount("");
                        }}
                        className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold"
                      >
                        Process Deposit
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Withdrawal Processing</h3>
                    <div className="space-y-4">
                      <div className="relative">
                        <label className="text-white text-sm">Search Player (Type at least 3 characters)</label>
                        <input 
                          type="text" 
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          placeholder="Search by name, ID, or email..." 
                          value={withdrawalPlayerSearch}
                          onChange={(e) => {
                            setWithdrawalPlayerSearch(e.target.value);
                            setSelectedWithdrawalPlayer(null);
                            setWithdrawalChipCount("");
                          }}
                        />
                        {withdrawalPlayerSearch.length >= 3 && filteredWithdrawalPlayers.length > 0 && !selectedWithdrawalPlayer && (
                          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredWithdrawalPlayers.map(player => (
                              <div
                                key={player.id}
                                onClick={() => {
                                  setSelectedWithdrawalPlayer(player);
                                  setWithdrawalPlayerSearch(`${player.name} (${player.id})`);
                                }}
                                className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0"
                              >
                                <div className="text-white font-medium">{player.name}</div>
                                <div className="text-gray-400 text-xs">ID: {player.id} | Email: {player.email}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedWithdrawalPlayer && (
                          <div className="mt-2 p-2 bg-green-500/20 border border-green-400/30 rounded text-sm">
                            <span className="text-green-300">Selected: {selectedWithdrawalPlayer.name} ({selectedWithdrawalPlayer.id})</span>
                            <button 
                              onClick={() => {
                                setSelectedWithdrawalPlayer(null);
                                setWithdrawalPlayerSearch("");
                                setWithdrawalChipCount("");
                              }}
                              className="ml-2 text-red-400 hover:text-red-300"
                            >
                              X
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-white text-sm">Available Balance</label>
                        <input 
                          type="text" 
                          className="w-full mt-1 px-3 py-2 bg-blue-500/20 border border-blue-400/30 rounded text-white font-semibold" 
                          value={selectedWithdrawalPlayer && playerBalances[selectedWithdrawalPlayer.id] ? `₹${playerBalances[selectedWithdrawalPlayer.id].availableBalance.toLocaleString('en-IN')}` : "₹0.00"} 
                          readOnly 
                        />
                      </div>
                      <div>
                        <label className="text-white text-sm">Withdrawal Amount</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Chip Count</label>
                        <input 
                          type="number" 
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          placeholder="Enter chip count" 
                          value={withdrawalChipCount}
                          onChange={(e) => setWithdrawalChipCount(e.target.value)}
                        />
                      </div>
                      <button 
                        onClick={() => {
                          if (!selectedWithdrawalPlayer) {
                            alert("Please select a player first");
                            return;
                          }
                          alert(`Processing withdrawal for ${selectedWithdrawalPlayer.name} (${selectedWithdrawalPlayer.id})`);
                          setWithdrawalChipCount("");
                        }}
                        className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold"
                      >
                        Process Withdrawal
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Cash-in/Cash-out */}
              <section className="p-6 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-purple-700/30 rounded-xl shadow-md border border-blue-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Cash-in/Cash-out Operations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Cash-in to Table</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Table ID</label>
                        <CustomSelect className="w-full mt-1">
                          <option>Table 1 - Texas Hold'em</option>
                          <option>Table 2 - Omaha</option>
                          <option>Table 3 - Stud</option>
                        </CustomSelect>
                      </div>
                      <div className="relative">
                        <label className="text-white text-sm">Search Player (Type at least 3 characters)</label>
                        <input 
                          type="text" 
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          placeholder="Search by name, ID, or email..." 
                          value={adjustmentPlayerSearch}
                          onChange={(e) => {
                            setAdjustmentPlayerSearch(e.target.value);
                            setSelectedAdjustmentPlayer(null);
                          }}
                        />
                        {adjustmentPlayerSearch.length >= 3 && filteredAdjustmentPlayers.length > 0 && !selectedAdjustmentPlayer && (
                          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredAdjustmentPlayers.map(player => (
                              <div
                                key={player.id}
                                onClick={() => {
                                  setSelectedAdjustmentPlayer(player);
                                  setAdjustmentPlayerSearch(`${player.name} (${player.id})`);
                                }}
                                className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0"
                              >
                                <div className="text-white font-medium">{player.name}</div>
                                <div className="text-gray-400 text-xs">ID: {player.id} | Email: {player.email}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedAdjustmentPlayer && (
                          <div className="mt-2 p-2 bg-green-500/20 border border-green-400/30 rounded text-sm">
                            <span className="text-green-300">Selected: {selectedAdjustmentPlayer.name} ({selectedAdjustmentPlayer.id})</span>
                            <button 
                              onClick={() => {
                                setSelectedAdjustmentPlayer(null);
                                setAdjustmentPlayerSearch("");
                              }}
                              className="ml-2 text-red-400 hover:text-red-300"
                            >
                              X
                            </button>
                          </div>
                        )}
                      </div>
                      {selectedAdjustmentPlayer && playerBalances[selectedAdjustmentPlayer.id] && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-white text-sm">Available Balance</label>
                            <input 
                              type="text" 
                              className="w-full mt-1 px-3 py-2 bg-green-500/20 border border-green-400/30 rounded text-white font-semibold" 
                              value={`₹${playerBalances[selectedAdjustmentPlayer.id].availableBalance.toLocaleString('en-IN')}`} 
                              readOnly 
                            />
                          </div>
                          <div>
                            <label className="text-white text-sm">Current Table Balance</label>
                            <input 
                              type="text" 
                              className="w-full mt-1 px-3 py-2 bg-yellow-500/20 border border-yellow-400/30 rounded text-white font-semibold" 
                              value={`₹${playerBalances[selectedAdjustmentPlayer.id].tableBalance.toLocaleString('en-IN')}`} 
                              readOnly 
                            />
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="text-white text-sm">Buy-in Amount</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
                        <p className="text-xs text-gray-400 mt-1">This will deduct from available balance and add to table balance</p>
                      </div>
                      <button 
                        onClick={() => {
                          if (!selectedAdjustmentPlayer) {
                            alert("Please select a player first");
                            return;
                          }
                          alert(`Cash-in to table for ${selectedAdjustmentPlayer.name} (${selectedAdjustmentPlayer.id})`);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold"
                      >
                        Cash-in to Table (Buy-in)
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Cash-out from Table</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Table ID</label>
                        <CustomSelect className="w-full mt-1">
                          <option>Table 1 - Texas Hold'em</option>
                          <option>Table 2 - Omaha</option>
                          <option>Table 3 - Stud</option>
                        </CustomSelect>
                      </div>
                      <div className="relative">
                        <label className="text-white text-sm">Search Player (Type at least 3 characters)</label>
                        <input 
                          type="text" 
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          placeholder="Search by name, ID, or email..." 
                          value={adjustmentPlayerSearch}
                          onChange={(e) => {
                            setAdjustmentPlayerSearch(e.target.value);
                            setSelectedAdjustmentPlayer(null);
                          }}
                        />
                        {adjustmentPlayerSearch.length >= 3 && filteredAdjustmentPlayers.length > 0 && !selectedAdjustmentPlayer && (
                          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredAdjustmentPlayers.map(player => (
                              <div
                                key={player.id}
                                onClick={() => {
                                  setSelectedAdjustmentPlayer(player);
                                  setAdjustmentPlayerSearch(`${player.name} (${player.id})`);
                                }}
                                className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0"
                              >
                                <div className="text-white font-medium">{player.name}</div>
                                <div className="text-gray-400 text-xs">ID: {player.id} | Email: {player.email}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedAdjustmentPlayer && (
                          <div className="mt-2 p-2 bg-green-500/20 border border-green-400/30 rounded text-sm">
                            <span className="text-green-300">Selected: {selectedAdjustmentPlayer.name} ({selectedAdjustmentPlayer.id})</span>
                            <button 
                              onClick={() => {
                                setSelectedAdjustmentPlayer(null);
                                setAdjustmentPlayerSearch("");
                              }}
                              className="ml-2 text-red-400 hover:text-red-300"
                            >
                              X
                            </button>
                          </div>
                        )}
                      </div>
                      {selectedAdjustmentPlayer && playerBalances[selectedAdjustmentPlayer.id] && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-white text-sm">Available Balance</label>
                            <input 
                              type="text" 
                              className="w-full mt-1 px-3 py-2 bg-green-500/20 border border-green-400/30 rounded text-white font-semibold" 
                              value={`₹${playerBalances[selectedAdjustmentPlayer.id].availableBalance.toLocaleString('en-IN')}`} 
                              readOnly 
                            />
                          </div>
                          <div>
                            <label className="text-white text-sm">Current Table Balance</label>
                            <input 
                              type="text" 
                              className="w-full mt-1 px-3 py-2 bg-yellow-500/20 border border-yellow-400/30 rounded text-white font-semibold" 
                              value={`₹${playerBalances[selectedAdjustmentPlayer.id].tableBalance.toLocaleString('en-IN')}`} 
                              readOnly 
                            />
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="text-white text-sm">Chip Count (Manager Verified)</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter chip count from manager" />
                        <p className="text-xs text-gray-400 mt-1">Manager counts chips → Balance updated → Added to available balance</p>
                      </div>
                      <button 
                        onClick={() => {
                          if (!selectedAdjustmentPlayer) {
                            alert("Please select a player first");
                            return;
                          }
                          alert(`Cash-out from table for ${selectedAdjustmentPlayer.name} (${selectedAdjustmentPlayer.id}). This will update player balance and show as withdrawal.`);
                        }}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold"
                      >
                        Cash-out from Table (Update Balance)
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Fund Moves & Batch Operations - removed as requested */}
            </>
          )}

          {/* Balance Management */}
          {activeItem === "Balance Management" && (
            <div className="space-y-6">
              {/* Player Balance Search & Overview */}
              <section className="p-6 bg-gradient-to-r from-indigo-600/30 via-purple-500/20 to-pink-700/30 rounded-xl shadow-md border border-indigo-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Player Balance Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Search Player Balance</h3>
                    <div className="relative">
                      <label className="text-white text-sm">Search Player (Type at least 3 characters)</label>
                      <input 
                        type="text" 
                        className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                        placeholder="Search by name, ID, or email..." 
                        value={balancePlayerSearch || ""}
                        onChange={(e) => {
                          setBalancePlayerSearch(e.target.value);
                          setSelectedBalancePlayer(null);
                        }}
                      />
                      {(balancePlayerSearch || "").length >= 3 && filteredBalancePlayers.length > 0 && !selectedBalancePlayer && (
                        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {filteredBalancePlayers.map(player => (
                            <div
                              key={player.id}
                              onClick={() => {
                                setSelectedBalancePlayer(player);
                                setBalancePlayerSearch(`${player.name} (${player.id})`);
                              }}
                              className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0"
                            >
                              <div className="text-white font-medium">{player.name}</div>
                              <div className="text-gray-400 text-xs">ID: {player.id} | Balance: ₹{playerBalances[player.id]?.availableBalance?.toLocaleString('en-IN') || 0}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      {selectedBalancePlayer && playerBalances[selectedBalancePlayer.id] && (
                        <div className="mt-4 p-4 bg-indigo-500/20 border border-indigo-400/30 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white font-semibold">{selectedBalancePlayer.name} ({selectedBalancePlayer.id})</span>
                            <button 
                              onClick={() => {
                                setSelectedBalancePlayer(null);
                                setBalancePlayerSearch("");
                              }}
                              className="text-red-400 hover:text-red-300"
                            >
                              X
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            <div>
                              <div className="text-xs text-gray-400">Available Balance</div>
                              <div className="text-xl font-bold text-green-400">₹{playerBalances[selectedBalancePlayer.id].availableBalance.toLocaleString('en-IN')}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400">Table Balance</div>
                              <div className="text-xl font-bold text-yellow-400">
                                {playerBalances[selectedBalancePlayer.id].tableBalance > 0 ? (
                                  <>₹{playerBalances[selectedBalancePlayer.id].tableBalance.toLocaleString('en-IN')}</>
                                ) : (
                                  <>₹0</>
                                )}
                              </div>
                            </div>
                            {playerBalances[selectedBalancePlayer.id].tableId && (
                              <div className="col-span-2">
                                <div className="text-xs text-gray-400">Playing At</div>
                                <div className="text-sm font-medium text-blue-400">
                                  {tableBalances[playerBalances[selectedBalancePlayer.id].tableId]?.name} - Seat {playerBalances[selectedBalancePlayer.id].seatNumber}
                                </div>
                              </div>
                            )}
                            <div className="col-span-2">
                              <div className="text-xs text-gray-400">Total Balance</div>
                              <div className="text-lg font-semibold text-white">
                                ₹{(playerBalances[selectedBalancePlayer.id].availableBalance + playerBalances[selectedBalancePlayer.id].tableBalance).toLocaleString('en-IN')}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Total System Balances</h3>
                    <div className="space-y-3">
                      <div className="bg-green-500/20 p-3 rounded-lg border border-green-400/30">
                        <div className="text-xs text-gray-400">Total Player Balances</div>
                        <div className="text-2xl font-bold text-green-400">
                          ₹{Object.values(playerBalances).reduce((sum, p) => sum + (p.availableBalance || 0), 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-400/30">
                        <div className="text-xs text-gray-400">Total Table Balances</div>
                        <div className="text-2xl font-bold text-yellow-400">
                          ₹{Object.values(tableBalances).reduce((sum, t) => sum + (t.totalBalance || 0), 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="bg-purple-500/20 p-3 rounded-lg border border-purple-400/30">
                        <div className="text-xs text-gray-400">Grand Total</div>
                        <div className="text-xl font-bold text-purple-400">
                          ₹{(Object.values(playerBalances).reduce((sum, p) => sum + (p.availableBalance || 0), 0) + 
                              Object.values(tableBalances).reduce((sum, t) => sum + (t.totalBalance || 0), 0)).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Table Balances */}
              <section className="p-6 bg-gradient-to-r from-cyan-600/30 via-blue-500/20 to-indigo-700/30 rounded-xl shadow-md border border-cyan-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Table Balances</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.values(tableBalances).map(table => (
                    <div key={table.id} className="bg-white/10 p-4 rounded-lg border border-cyan-400/30">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-white">{table.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          table.totalBalance > 0 ? 'bg-green-500/30 text-green-300' : 'bg-gray-500/30 text-gray-400'
                        }`}>
                          {table.players.length} {table.players.length === 1 ? 'Player' : 'Players'}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-cyan-400 mb-3">
                        ₹{table.totalBalance.toLocaleString('en-IN')}
                      </div>
                      {table.players.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="text-xs text-gray-400 mb-2">Active Players:</div>
                          {table.players.map(playerId => {
                            const player = playerBalances[playerId];
                            if (!player) return null;
                            return (
                              <div key={playerId} className="text-sm text-white mb-1">
                                <span>{player.name}</span> - 
                                <span className="text-yellow-400 ml-1">₹{player.tableBalance.toLocaleString('en-IN')}</span>
                                {player.seatNumber && (
                                  <span className="text-gray-400 ml-1">(Seat {player.seatNumber})</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Balance Transactions */}
              <section className="p-6 bg-gradient-to-r from-teal-600/30 via-green-500/20 to-emerald-700/30 rounded-xl shadow-md border border-teal-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Recent Balance Transactions</h2>
                <div className="bg-white/10 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-white">
                      <thead>
                        <tr className="border-b border-white/20 bg-white/5">
                          <th className="text-left py-3 px-4">Time</th>
                          <th className="text-left py-3 px-4">Type</th>
                          <th className="text-left py-3 px-4">Player</th>
                          <th className="text-left py-3 px-4">Table</th>
                          <th className="text-right py-3 px-4">Amount</th>
                          <th className="text-left py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {balanceTransactions.slice().sort((a, b) => b.timestamp - a.timestamp).map(transaction => (
                          <tr key={transaction.id} className="border-b border-white/10 hover:bg-white/5">
                            <td className="py-3 px-4 text-sm">{new Date(transaction.timestamp).toLocaleString('en-IN')}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                transaction.type === 'buy-in' ? 'bg-blue-500/30 text-blue-300' :
                                transaction.type === 'cash-out' ? 'bg-green-500/30 text-green-300' :
                                'bg-red-500/30 text-red-300'
                              }`}>
                                {transaction.type === 'buy-in' ? 'Buy-in' : transaction.type === 'cash-out' ? 'Cash-out' : 'Withdrawal'}
                              </span>
                            </td>
                            <td className="py-3 px-4">{transaction.playerName}</td>
                            <td className="py-3 px-4 text-sm">
                              {transaction.tableName || transaction.tableId ? (transaction.tableName || `Table ${transaction.tableId}`) : '-'}
                              {transaction.chipCount && (
                                <span className="text-gray-400 ml-2">({transaction.chipCount} chips)</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right font-semibold">
                              {transaction.type === 'withdrawal' ? '-' : ''}₹{transaction.amount.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                transaction.status === 'completed' ? 'bg-green-500/30 text-green-300' :
                                'bg-yellow-500/30 text-yellow-300'
                              }`}>
                                {transaction.status}
                                {transaction.managerVerified && (
                                  <span className="ml-1">✓</span>
                                )}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Buy-in / Cash-out Information */}
              <section className="p-6 bg-gradient-to-r from-amber-600/30 via-orange-500/20 to-red-700/30 rounded-xl shadow-md border border-amber-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Balance Flow Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-3">Buy-in Process</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-start">
                        <span className="text-blue-400 mr-2">1.</span>
                        <span>Player buys in from their available balance</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-blue-400 mr-2">2.</span>
                        <span>Amount deducted from player's personal balance</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-blue-400 mr-2">3.</span>
                        <span>Amount added to table balance</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-blue-400 mr-2">4.</span>
                        <span>Player sits on table with chips</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-3">Cash-out Process</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-start">
                        <span className="text-green-400 mr-2">1.</span>
                        <span>Manager counts chips when player cashes out</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-green-400 mr-2">2.</span>
                        <span>Chip count verified and balance updated</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-green-400 mr-2">3.</span>
                        <span>Amount deducted from table balance</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-green-400 mr-2">4.</span>
                        <span>Amount added back to player's available balance</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-green-400 mr-2">5.</span>
                        <span>Withdrawal appears in cashier portal</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Table View */}
          {activeItem === "Table View" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-cyan-600/30 via-blue-500/20 to-indigo-700/30 rounded-xl shadow-md border border-cyan-800/40">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Table View</h2>
                    <p className="text-gray-300 text-sm mt-1">Snapshot of active tables, seated players, and chip counts.</p>
                  </div>
                  <div className="text-xs text-gray-400 bg-white/10 px-3 py-2 rounded-lg border border-white/10">
                    <div>Refreshed: {currentDateTime.full}</div>
                    <div>Total Tables: {Object.keys(tableBalances).length}</div>
                  </div>
                </div>

                {Object.values(tableBalances).length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                    {Object.values(tableBalances).map((table) => {
                      const hasPlayers = (table.players || []).length > 0;
                      return (
                        <div
                          key={table.id}
                          className="bg-white/10 p-5 rounded-xl border border-cyan-400/30 shadow-lg space-y-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-lg font-semibold text-white leading-tight">{table.name}</h3>
                              <div className="text-xs text-gray-400 mt-1">
                                Table ID: {table.id}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-400 uppercase tracking-wide">Table Balance</div>
                              <div className="text-2xl font-bold text-cyan-300">
                                ₹{(table.totalBalance || 0).toLocaleString('en-IN')}
                              </div>
                              <div
                                className={`mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                  hasPlayers
                                    ? "bg-green-500/20 text-green-300 border border-green-400/30"
                                    : "bg-gray-500/20 text-gray-300 border border-gray-400/30"
                                }`}
                              >
                                {hasPlayers ? (
                                  <>
                                    <span className="text-lg leading-none">●</span>
                                    <span>{table.players.length} {table.players.length === 1 ? "Player" : "Players"}</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-lg leading-none">○</span>
                                    <span>No Players</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="rounded-lg bg-white/5 border border-white/10 p-4 space-y-3">
                            <div className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                              Players at Table
                            </div>
                            {hasPlayers ? (
                              table.players.map((playerId) => {
                                const player = playerBalances[playerId];
                                if (!player) return null;
                                return (
                                  <div
                                    key={playerId}
                                    className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 last:pb-0 last:border-0"
                                  >
                                    <div className="flex-1">
                                      <div className="text-white text-sm font-medium">{player.name}</div>
                                      <div className="text-xs text-gray-400">
                                        ID: {player.id}
                                        {player.seatNumber ? ` · Seat ${player.seatNumber}` : ""}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xs text-gray-400 uppercase tracking-wide">Chip Count</div>
                                      <div className="text-lg font-semibold text-yellow-300">
                                        ₹{(player.tableBalance || 0).toLocaleString('en-IN')}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-sm text-gray-400 italic">
                                No active players seated at this table.
                              </div>
                            )}
                          </div>

                          <div className="text-xs text-gray-400">
                            <div>Snapshot generated from live chip tracking.</div>
                            <div>Updates occur automatically when manager verifies chip counts.</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-10 text-center text-gray-400">
                    No table data available. Tables will appear here as soon as they are configured.
                  </div>
                )}
              </section>
            </div>
          )}

          {/* Payroll Management */}
          {activeItem === "Payroll Management" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-rose-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Salary & Payroll Processing</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Staff Salary Processing</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Select Staff Member</label>
                        <CustomSelect className="w-full mt-1">
                          <option>Sarah Johnson - Dealer</option>
                          <option>Mike Chen - Floor Manager</option>
                          <option>Emma Davis - Cashier</option>
                          <option>John Smith - Security</option>
                        </CustomSelect>
                      </div>
                      <div>
                        <label className="text-white text-sm">Pay Period</label>
                        <CustomSelect className="w-full mt-1">
                          <option>Weekly</option>
                          <option>Bi-weekly</option>
                          <option>Monthly</option>
                        </CustomSelect>
                      </div>
                      <div>
                        <label className="text-white text-sm">Base Salary</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Overtime Hours</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="0" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Deductions</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
                      </div>
                      <button className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Process Salary
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Tips Processing</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Staff Member</label>
                        <CustomSelect className="w-full mt-1">
                          <option>Sarah Johnson - Dealer</option>
                          <option>Mike Chen - Floor Manager</option>
                          <option>Emma Davis - Cashier</option>
                        </CustomSelect>
                      </div>
                      <div>
                        <label className="text-white text-sm">Total Tips Earned</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Club Percentage</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="15%" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Staff Share</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" readOnly />
                      </div>
                      <button className="w-full bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Process Tips
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-6 bg-gradient-to-r from-cyan-600/30 via-blue-500/20 to-indigo-700/30 rounded-xl shadow-md border border-cyan-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Dealer Tips Processing</h2>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Dynamic Percentage Settings</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-white text-sm">Club Hold Percentage</label>
                          <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="15%" />
                        </div>
                        <div>
                          <label className="text-white text-sm">Dealer Share Percentage</label>
                          <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="85%" />
                        </div>
                        <div>
                          <label className="text-white text-sm">Floor Manager Share</label>
                          <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="5%" />
                        </div>
                        <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-semibold">
                          Update Settings
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Today's Dealer Tips</h3>
                      <div className="space-y-2">
                        <div className="bg-cyan-500/20 p-3 rounded-lg border border-cyan-400/30">
                          <div className="font-semibold text-white">Sarah Johnson</div>
                          <div className="text-sm text-gray-300">Total Tips: ₹2,500 | Share: ₹2,125</div>
                          <div className="text-xs text-cyan-300">Status: Processed</div>
                        </div>
                        <div className="bg-cyan-500/20 p-3 rounded-lg border border-cyan-400/30">
                          <div className="font-semibold text-white">Mike Chen</div>
                          <div className="text-sm text-gray-300">Total Tips: ₹1,800 | Share: ₹1,530</div>
                          <div className="text-xs text-cyan-300">Status: Pending</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Bonus Processing */}
          {activeItem === "Bonus Processing" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-yellow-600/30 via-orange-500/20 to-red-700/30 rounded-xl shadow-md border border-yellow-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Player Bonuses</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Process Player Bonus</h3>
                    <div className="space-y-4">
                      <div className="relative">
                        <label className="text-white text-sm">Search Player (Type at least 3 characters)</label>
                        <input 
                          type="text" 
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          placeholder="Search by name, ID, or email..." 
                          value={bonusPlayerSearch}
                          onChange={(e) => {
                            setBonusPlayerSearch(e.target.value);
                            setSelectedBonusPlayer(null);
                          }}
                        />
                        {bonusPlayerSearch.length >= 3 && filteredBonusPlayers.length > 0 && !selectedBonusPlayer && (
                          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredBonusPlayers.map(player => (
                              <div
                                key={player.id}
                                onClick={() => {
                                  setSelectedBonusPlayer(player);
                                  setBonusPlayerSearch(`${player.name} (${player.id})`);
                                }}
                                className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0"
                              >
                                <div className="text-white font-medium">{player.name}</div>
                                <div className="text-gray-400 text-xs">ID: {player.id} | Email: {player.email}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedBonusPlayer && (
                          <div className="mt-2 p-2 bg-green-500/20 border border-green-400/30 rounded text-sm">
                            <span className="text-green-300">Selected: {selectedBonusPlayer.name} ({selectedBonusPlayer.id})</span>
                            <button 
                              onClick={() => {
                                setSelectedBonusPlayer(null);
                                setBonusPlayerSearch("");
                              }}
                              className="ml-2 text-red-400 hover:text-red-300"
                            >
                              X
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-white text-sm">Bonus Type</label>
                        <CustomSelect className="w-full mt-1">
                          <option>Welcome Bonus</option>
                          <option>Loyalty Bonus</option>
                          <option>Referral Bonus</option>
                          <option>Tournament Bonus</option>
                          <option>Special Event Bonus</option>
                        </CustomSelect>
                      </div>
                      <div>
                        <label className="text-white text-sm">Bonus Amount</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Reason</label>
                        <textarea className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" rows="3" placeholder="Bonus reason..."></textarea>
                      </div>
                      <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Process Player Bonus
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Player Bonuses</h3>
                    <div className="space-y-2">
                      <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-400/30">
                        <div className="font-semibold text-white">Player: John Smith</div>
                        <div className="text-sm text-gray-300">Welcome Bonus: ₹1,000</div>
                        <div className="text-xs text-yellow-300">Processed 2 hours ago</div>
                      </div>
                      <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-400/30">
                        <div className="font-semibold text-white">Player: Maria Garcia</div>
                        <div className="text-sm text-gray-300">Loyalty Bonus: ₹500</div>
                        <div className="text-xs text-yellow-300">Processed 1 day ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-6 bg-gradient-to-r from-pink-600/30 via-rose-500/20 to-red-700/30 rounded-xl shadow-md border border-pink-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Staff Bonuses</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Process Staff Bonus</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Staff Member</label>
                        <CustomSelect className="w-full mt-1">
                          <option>Sarah Johnson - Dealer</option>
                          <option>Mike Chen - Floor Manager</option>
                          <option>Emma Davis - Cashier</option>
                          <option>John Smith - Security</option>
                        </CustomSelect>
                      </div>
                      <div>
                        <label className="text-white text-sm">Bonus Type</label>
                        <CustomSelect className="w-full mt-1">
                          <option>Performance Bonus</option>
                          <option>Attendance Bonus</option>
                          <option>Special Achievement</option>
                          <option>Holiday Bonus</option>
                          <option>Year-end Bonus</option>
                        </CustomSelect>
                      </div>
                      <div>
                        <label className="text-white text-sm">Bonus Amount</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Approval Required</label>
                        <CustomSelect className="w-full mt-1">
                          <option>Manager Approved</option>
                          <option>HR Approved</option>
                          <option>Pending Approval</option>
                        </CustomSelect>
                      </div>
                      <div>
                        <label className="text-white text-sm">Reason</label>
                        <textarea className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" rows="3" placeholder="Bonus reason..."></textarea>
                      </div>
                      <button className="w-full bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Process Staff Bonus
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Staff Bonuses</h3>
                    <div className="space-y-2">
                      <div className="bg-pink-500/20 p-3 rounded-lg border border-pink-400/30">
                        <div className="font-semibold text-white">Sarah Johnson</div>
                        <div className="text-sm text-gray-300">Performance Bonus: ₹2,000</div>
                        <div className="text-xs text-pink-300">Processed 1 day ago</div>
                      </div>
                      <div className="bg-pink-500/20 p-3 rounded-lg border border-pink-400/30">
                        <div className="font-semibold text-white">Mike Chen</div>
                        <div className="text-sm text-gray-300">Attendance Bonus: ₹1,500</div>
                        <div className="text-xs text-pink-300">Processed 3 days ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Transaction History & Reports */}
          {activeItem === "Transaction History & Reports" && (
            <div className="space-y-6">
              {/* Transaction History Table */}
              <section className="p-6 bg-gradient-to-r from-indigo-600/30 via-purple-500/20 to-blue-700/30 rounded-xl shadow-md border border-indigo-800/40">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Transaction History</h2>
                  <button 
                    onClick={() => handleExportReportCSV("transaction_history", [
                      ["Date", "Type", "Player ID", "Amount", "Status", "Reference"],
                      ["2024-01-18", "Deposit", "P001", "+₹5,000", "Completed", "TXN001"],
                      ["2024-01-18", "Withdrawal", "P002", "-₹2,500", "Completed", "TXN002"],
                      ["2024-01-18", "Bonus", "P003", "+₹1,000", "Pending", "TXN003"]
                    ])}
                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                  >
                    📥 Export CSV
                  </button>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full text-white">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left py-3 px-4">Date</th>
                          <th className="text-left py-3 px-4">Type</th>
                          <th className="text-left py-3 px-4">Player ID</th>
                          <th className="text-left py-3 px-4">Amount</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Reference</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-white/10">
                          <td className="py-3 px-4">2024-01-18</td>
                          <td className="py-3 px-4">Deposit</td>
                          <td className="py-3 px-4">P001</td>
                          <td className="py-3 px-4 text-green-300">+₹5,000</td>
                          <td className="py-3 px-4">
                            <span className="bg-green-500/30 text-green-300 px-2 py-1 rounded text-sm">Completed</span>
                          </td>
                          <td className="py-3 px-4">TXN001</td>
                        </tr>
                        <tr className="border-b border-white/10">
                          <td className="py-3 px-4">2024-01-18</td>
                          <td className="py-3 px-4">Withdrawal</td>
                          <td className="py-3 px-4">P002</td>
                          <td className="py-3 px-4 text-red-300">-₹2,500</td>
                          <td className="py-3 px-4">
                            <span className="bg-green-500/30 text-green-300 px-2 py-1 rounded text-sm">Completed</span>
                          </td>
                          <td className="py-3 px-4">TXN002</td>
                        </tr>
                        <tr className="border-b border-white/10">
                          <td className="py-3 px-4">2024-01-18</td>
                          <td className="py-3 px-4">Bonus</td>
                          <td className="py-3 px-4">P003</td>
                          <td className="py-3 px-4 text-yellow-300">+₹1,000</td>
                          <td className="py-3 px-4">
                            <span className="bg-yellow-500/30 text-yellow-300 px-2 py-1 rounded text-sm">Pending</span>
                          </td>
                          <td className="py-3 px-4">TXN003</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Reports Builder */}
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-rose-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Reports Builder</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Report Configuration</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm mb-2 block">Report Type</label>
                        <CustomSelect
                          className="w-full"
                          value={selectedReportType}
                          onChange={(e) => {
                            setSelectedReportType(e.target.value);
                            setReportData(null);
                            if (e.target.value !== "individual_player") setSelectedPlayerForReport(null);
                            if (e.target.value !== "custom") setCustomReportSelection([]);
                          }}
                          placeholder="Select Report Type"
                          allowSearch
                        >
                          <option value="">Select Report Type</option>
                          {reportTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
                          ))}
                        </CustomSelect>
                      </div>

                      {/* Player Selection for Individual Player Report */}
                      {selectedReportType === "individual_player" && (
                        <div className="relative">
                          <label className="text-white text-sm mb-2 block">Search Player (Type at least 3 characters)</label>
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
                          {playerReportSearch.length >= 3 && filteredPlayersForReport.length > 0 && !selectedPlayerForReport && (
                            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {filteredPlayersForReport.map(player => (
                                <div
                                  key={player.id}
                                  onClick={() => {
                                    setSelectedPlayerForReport(player);
                                    setPlayerReportSearch(`${player.name} (${player.id})`);
                                  }}
                                  className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0"
                                >
                                  <div className="text-white font-medium">{player.name}</div>
                                  <div className="text-gray-400 text-xs">ID: {player.id}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          {selectedPlayerForReport && (
                            <div className="mt-2 p-2 bg-green-500/20 border border-green-400/30 rounded text-sm">
                              <span className="text-green-300">Selected: {selectedPlayerForReport.name} ({selectedPlayerForReport.id})</span>
                              <button 
                                onClick={() => {
                                  setSelectedPlayerForReport(null);
                                  setPlayerReportSearch("");
                                }}
                                className="ml-2 text-red-400 hover:text-red-300"
                              >
                                X
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Table Selection for Per Table Transactions */}
                      {selectedReportType === "per_table_transactions" && (
                        <div>
                          <label className="text-white text-sm mb-2 block">Select Table (Optional - leave blank for all tables)</label>
                          <CustomSelect
                            className="w-full"
                            value={selectedTableForReport}
                            onChange={(e) => setSelectedTableForReport(e.target.value)}
                          >
                            <option value="">All Tables</option>
                            <option value="Table 1">Table 1</option>
                            <option value="Table 2">Table 2</option>
                            <option value="Table 3">Table 3</option>
                          </CustomSelect>
                        </div>
                      )}

                      {/* Custom Report Multi-Select */}
                      {selectedReportType === "custom" && (
                        <div>
                          <label className="text-white text-sm mb-2 block">Select Multiple Report Types to Compile</label>
                          <div className="space-y-2 max-h-48 overflow-y-auto bg-white/5 p-3 rounded border border-white/10">
                            {reportTypes.filter(t => t.id !== "custom").map(type => (
                              <label key={type.id} className="flex items-center space-x-2 cursor-pointer hover:bg-white/5 p-2 rounded">
                                <input
                                  type="checkbox"
                                  checked={customReportSelection.includes(type.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setCustomReportSelection([...customReportSelection, type.id]);
                                    } else {
                                      setCustomReportSelection(customReportSelection.filter(id => id !== type.id));
                                    }
                                  }}
                                  className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded"
                                />
                                <span className="text-white text-sm">{type.icon} {type.name}</span>
                              </label>
                            ))}
                          </div>
                          {customReportSelection.length > 0 && (
                            <div className="mt-2 p-2 bg-blue-500/20 border border-blue-400/30 rounded text-sm">
                              <span className="text-blue-300">Selected: {customReportSelection.length} report type(s)</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div>
                        <label className="text-white text-sm mb-2 block">Date Range</label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-gray-400 text-xs">Start Date</label>
                            <input 
                              type="date" 
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                              value={reportDateRange.start}
                              onChange={(e) => setReportDateRange({...reportDateRange, start: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-xs">End Date</label>
                            <input 
                              type="date" 
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                              value={reportDateRange.end}
                              onChange={(e) => setReportDateRange({...reportDateRange, end: e.target.value})}
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
                    <h3 className="text-lg font-semibold text-white mb-4">Report Preview</h3>
                    {reportData ? (
                      <div className="space-y-4">
                        <div className="bg-white/5 p-4 rounded-lg max-h-96 overflow-y-auto">
                          <table className="min-w-full text-left text-white/90 text-sm">
                            <thead className="text-white/70 text-xs border-b border-white/20">
                              <tr>
                                {reportData[0]?.map((header, idx) => (
                                  <th key={idx} className="py-2 pr-4">{header}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {reportData.slice(1).map((row, rowIdx) => (
                                <tr key={rowIdx} className="border-b border-white/10">
                                  {row.map((cell, cellIdx) => (
                                    <td key={cellIdx} className="py-2 pr-4">{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleExportReportCSV(selectedReportType, reportData)}
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
                                setSavedReports(prev => [...prev, {
                                  id: Date.now(),
                                  name: reportName,
                                  type: selectedReportType,
                                  dateRange: `${reportDateRange.start} to ${reportDateRange.end}`,
                                  created: new Date().toISOString().split('T')[0],
                                  player: selectedPlayerForReport?.id || null
                                }]);
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
                        <div className="text-sm">Select a report type and generate to preview</div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Report Types Grid */}
              <section className="p-6 bg-gradient-to-r from-indigo-600/30 via-blue-500/20 to-cyan-700/30 rounded-xl shadow-md border border-indigo-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Available Report Types</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reportTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setSelectedReportType(type.id);
                        setReportData(null);
                        if (type.id !== "individual_player") setSelectedPlayerForReport(null);
                        if (type.id !== "custom") setCustomReportSelection([]);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`p-4 rounded-lg border transition-all ${
                        selectedReportType === type.id
                          ? "bg-white/20 border-white/40 shadow-lg scale-105"
                          : "bg-white/10 border-white/20 hover:bg-white/15"
                      }`}
                    >
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <div className="text-white font-semibold text-sm">{type.name}</div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Saved Reports Management */}
              <section className="p-6 bg-gradient-to-r from-emerald-600/30 via-green-500/20 to-teal-700/30 rounded-xl shadow-md border border-emerald-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Saved Reports (CRUD Operations)</h2>
                <div className="bg-white/10 p-4 rounded-lg">
                  {savedReports.length > 0 ? (
                    <div className="space-y-3">
                      {savedReports.map(report => (
                        <div key={report.id} className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-white font-semibold">{report.name}</h4>
                                <span className="bg-blue-500/30 text-blue-300 px-2 py-1 rounded text-xs">
                                  {reportTypes.find(t => t.id === report.type)?.name || report.type}
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
                                  const reportTypeObj = reportTypes.find(t => t.id === report.type);
                                  if (reportTypeObj) {
                                    setSelectedReportType(report.type);
                                    if (report.player) {
                                      const player = mockPlayers.find(p => p.id === report.player);
                                      if (player) {
                                        setSelectedPlayerForReport(player);
                                        setPlayerReportSearch(`${player.name} (${player.id})`);
                                      }
                                    }
                                    setReportDateRange({
                                      start: report.dateRange.split(" to ")[0],
                                      end: report.dateRange.split(" to ")[1] || report.dateRange.split(" to ")[0]
                                    });
                                    alert("Report configuration loaded. Click 'Generate Report' to regenerate.");
                                  }
                                }}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
                              >
                                🔄 Load
                              </button>
                              <button
                                onClick={() => {
                                  const newName = prompt("Enter new report name:", report.name);
                                  if (newName) {
                                    setSavedReports(prev => prev.map(r => 
                                      r.id === report.id ? {...r, name: newName} : r
                                    ));
                                    alert("Report updated successfully!");
                                  }
                                }}
                                className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete report "${report.name}"?`)) {
                                    setSavedReports(prev => prev.filter(r => r.id !== report.id));
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

              {/* Quick Report Access */}
              <section className="p-6 bg-gradient-to-r from-orange-600/30 via-red-500/20 to-pink-700/30 rounded-xl shadow-md border border-orange-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Quick Report Access</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      setSelectedReportType("daily_transactions");
                      setReportDateRange({ start: today, end: today });
                      setTimeout(() => {
                        const mockData = [
                          ["Date", "Total Transactions", "Revenue", "Deposits", "Withdrawals"],
                          [today, "45", "₹12,450", "₹25,000", "₹10,000"]
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
                      const today = new Date().toISOString().split('T')[0];
                      setSelectedReportType("daily_rake");
                      setReportDateRange({ start: today, end: today });
                      setTimeout(() => {
                        const mockData = [
                          ["Date", "Total Rake", "Tables", "Average Rake per Table", "Top Table"],
                          [today, "₹1,245", "8", "₹155.63", "Table 1"]
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
                      const today = new Date().toISOString().split('T')[0];
                      setSelectedReportType("credit_transactions");
                      setReportDateRange({ start: today, end: today });
                      setTimeout(() => {
                        const mockData = [
                          ["Date", "Player", "Type", "Amount", "Balance Before", "Balance After"],
                          [today, "P101", "Credit Granted", "₹50,000", "₹0", "₹50,000"]
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
                      const today = new Date().toISOString().split('T')[0];
                      setSelectedReportType("expenses");
                      setReportDateRange({ start: today, end: today });
                      setTimeout(() => {
                        const mockData = [
                          ["Date", "Category", "Description", "Amount", "Approved By"],
                          [today, "Operations", "Staff Payment", "₹15,000", "Admin"]
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
            </div>
          )}

          {/* Shift Reconciliation */}
          {activeItem === "Shift Reconciliation" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-teal-600/30 via-cyan-500/20 to-blue-700/30 rounded-xl shadow-md border border-teal-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Shift Reconciliation</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Start Shift</h3>
                    <div className="space-y-4">
                      <div className="relative">
                        <label className="text-white text-sm">Cashier ID (Type at least 3 characters to search)</label>
                        <input 
                          type="text" 
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          placeholder="Search by Cashier ID, name, or email..." 
                          value={cashierSearch}
                          onChange={(e) => {
                            setCashierSearch(e.target.value);
                            setSelectedCashier(null);
                          }}
                        />
                        {cashierSearch.length >= 3 && filteredCashiers.length > 0 && !selectedCashier && (
                          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredCashiers.map(cashier => (
                              <div
                                key={cashier.id}
                                onClick={() => {
                                  setSelectedCashier(cashier);
                                  setCashierSearch(`${cashier.name} (${cashier.id})`);
                                }}
                                className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0"
                              >
                                <div className="text-white font-medium">{cashier.name}</div>
                                <div className="text-gray-400 text-xs">ID: {cashier.id} | Email: {cashier.email}</div>
                                <div className="text-gray-500 text-xs">Status: {cashier.status}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedCashier && (
                          <div className="mt-2 p-2 bg-green-500/20 border border-green-400/30 rounded text-sm">
                            <span className="text-green-300">Selected: {selectedCashier.name} ({selectedCashier.id})</span>
                            <button 
                              onClick={() => {
                                setSelectedCashier(null);
                                setCashierSearch("");
                              }}
                              className="ml-2 text-red-400 hover:text-red-300"
                            >
                              X
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-white text-sm">Starting Cash</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Shift Date</label>
                        <input type="date" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" />
                      </div>
                      <button className="w-full bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Start Shift
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">End Shift</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Ending Cash</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Expected Cash</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Variance</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" readOnly />
                      </div>
                      <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-semibold">
                        End Shift & Reconcile
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Player Support - Chat System */}
          {activeItem === "Player Support" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Player & Staff Support Chat</h2>
                
                {/* Chat Type Tabs */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => {
                      setChatType("player");
                      setSelectedChat(null);
                      setStatusFilter("all");
                    }}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      chatType === "player"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg"
                        : "bg-white/10 text-white/70 hover:bg-white/15"
                    }`}
                  >
                    📱 Player Chat
                  </button>
                  <button
                    onClick={() => {
                      setChatType("staff");
                      setSelectedChat(null);
                      setStatusFilter("all");
                    }}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      chatType === "staff"
                        ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                        : "bg-white/10 text-white/70 hover:bg-white/15"
                    }`}
                  >
                    👥 Staff Chat
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Chat List Sidebar */}
                  <div className="lg:col-span-1 bg-white/10 p-4 rounded-lg">
                    <div className="mb-4">
                      <label className="text-white text-sm mb-2 block">Filter by Status</label>
                      <select
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {filteredChats.length > 0 ? (
                        filteredChats.map(chat => (
                          <div
                            key={chat.id}
                            onClick={() => setSelectedChat(chat)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedChat?.id === chat.id
                                ? "bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border-blue-400/50"
                                : "bg-white/5 border-white/10 hover:bg-white/10"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <div className="font-semibold text-white text-sm">
                                {chatType === "player" ? chat.playerName : chat.staffName}
                              </div>
                              <span className={`px-2 py-1 rounded text-xs ${
                                chat.status === "open"
                                  ? "bg-yellow-500/30 text-yellow-300"
                                  : chat.status === "in_progress"
                                  ? "bg-blue-500/30 text-blue-300"
                                  : "bg-gray-500/30 text-gray-300"
                              }`}>
                                {chat.status === "open" ? "Open" : chat.status === "in_progress" ? "In Progress" : "Closed"}
                              </span>
                            </div>
                            {chatType === "staff" && (
                              <div className="text-xs text-gray-400 mb-1">{chat.staffRole}</div>
                            )}
                            <div className="text-xs text-gray-300 truncate">{chat.lastMessage}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(chat.lastMessageTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-400 text-sm">
                          No {statusFilter !== "all" ? statusFilter : ""} chats found
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chat Window */}
                  <div className="lg:col-span-2 bg-white/10 p-4 rounded-lg">
                    {selectedChat ? (
                      <div className="flex flex-col h-[600px]">
                        {/* Chat Header */}
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/20">
                          <div>
                            <div className="font-semibold text-white text-lg">
                              {chatType === "player" ? selectedChat.playerName : selectedChat.staffName}
                            </div>
                            {chatType === "staff" && (
                              <div className="text-sm text-gray-400">{selectedChat.staffRole}</div>
                            )}
                            {chatType === "player" && (
                              <div className="text-sm text-gray-400">ID: {selectedChat.playerId}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                              value={selectedChat.status}
                              onChange={(e) => handleStatusChange(selectedChat.id, e.target.value)}
                            >
                              <option value="open">Open</option>
                              <option value="in_progress">In Progress</option>
                              <option value="closed">Closed</option>
                            </select>
                          </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                          {selectedChat.messages.map(message => (
                            <div
                              key={message.id}
                              className={`flex ${message.sender === "staff" || message.sender === "cashier" ? "justify-end" : "justify-start"}`}
                            >
                              <div className={`max-w-[70%] rounded-lg p-3 ${
                                message.sender === "staff" || message.sender === "cashier"
                                  ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white"
                                  : "bg-white/20 text-white"
                              }`}>
                                <div className="text-xs font-semibold mb-1 opacity-90">{message.senderName}</div>
                                <div className="text-sm">{message.text}</div>
                                <div className="text-xs opacity-70 mt-1">
                                  {new Date(message.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Message Input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                            disabled={selectedChat.status === "closed"}
                          />
                          <button
                            onClick={handleSendMessage}
                            disabled={selectedChat.status === "closed" || !newMessage.trim()}
                            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Send
                          </button>
                        </div>
                        {selectedChat.status === "closed" && (
                          <div className="text-xs text-gray-400 mt-2 text-center">
                            This chat is closed. Change status to reopen.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-[600px] text-gray-400">
                        <div className="text-center">
                          <div className="text-4xl mb-4">💬</div>
                          <div className="text-lg">Select a {chatType === "player" ? "player" : "staff"} chat to start messaging</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
