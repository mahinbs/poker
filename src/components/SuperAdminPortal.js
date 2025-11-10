import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomSelect from "./common/CustomSelect";

export default function SuperAdminPortal() {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("Dashboard");

  // Club selection state
  const [selectedClubId, setSelectedClubId] = useState('club-01');
  const [isClubDropdownOpen, setIsClubDropdownOpen] = useState(false);
  const clubs = [
    { id: 'club-01', name: 'Emerald Poker Mumbai' },
    { id: 'club-02', name: 'Teal Poker Bangalore' },
    { id: 'club-03', name: 'Cyan Poker Delhi' },
    { id: 'club-04', name: 'Royal Poker Chennai' }
  ];
  const selectedClub = clubs.find(c => c.id === selectedClubId) || clubs[0];

  // Helper functions for date/time
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

  // Revenue, Rake & Tips data with date/time
  const currentDateTime = getCurrentDateTime();
  const previousDateTime = getPreviousDayDateTime();
  
  const TIP_HOLD_PERCENT = 0.15;

  const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`;

  const calculateTipShares = (amount) => ({
    club: Math.round(amount * TIP_HOLD_PERCENT),
    staff: Math.round(amount * (1 - TIP_HOLD_PERCENT))
  });

  const [revenueData, setRevenueData] = useState({
    previousDay: {
      revenue: 125000,
      rake: 12500,
      tips: 3750,
      date: previousDateTime.date,
      time: previousDateTime.time,
      lastUpdated: previousDateTime.full
    },
    currentDay: {
      revenue: 45230,
      rake: 4523,
      tips: 1357,
      date: currentDateTime.date,
      time: currentDateTime.time,
      lastUpdated: currentDateTime.full
    }
  });

  const previousDayTipShares = calculateTipShares(revenueData.previousDay.tips);
  const currentDayTipShares = calculateTipShares(revenueData.currentDay.tips);

  // State for Players (KYC Pending) management
  const [playersSearch, setPlayersSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playersFilter, setPlayersFilter] = useState({
    kycStatus: "pending",
    registrationDate: "all",
    documentType: "all"
  });
  
  // Mock players data with kycStatus: 'pending'
  const [allPlayers, setAllPlayers] = useState([
    {
      id: "P001",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+91 9876543210",
      kycStatus: "pending",
      registrationDate: "2024-01-15",
      documentType: "PAN Card",
      submittedDate: "2024-01-16",
      verificationNotes: ""
    },
    {
      id: "P002",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+91 9876543211",
      kycStatus: "pending",
      registrationDate: "2024-01-10",
      documentType: "Aadhaar Card",
      submittedDate: "2024-01-12",
      verificationNotes: ""
    },
    {
      id: "P003",
      name: "Rajesh Kumar",
      email: "rajesh.kumar@example.com",
      phone: "+91 9876543212",
      kycStatus: "pending",
      registrationDate: "2024-01-08",
      documentType: "Passport",
      submittedDate: "2024-01-09",
      verificationNotes: ""
    },
    {
      id: "P004",
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      phone: "+91 9876543213",
      kycStatus: "pending",
      registrationDate: "2024-01-20",
      documentType: "Driving License",
      submittedDate: "2024-01-21",
      verificationNotes: ""
    },
    {
      id: "P005",
      name: "Amit Patel",
      email: "amit.patel@example.com",
      phone: "+91 9876543214",
      kycStatus: "pending",
      registrationDate: "2024-01-18",
      documentType: "PAN Card",
      submittedDate: "2024-01-19",
      verificationNotes: ""
    }
  ]);

  // Filter players for dropdown search
  const filteredPlayersForSearch = playersSearch.length >= 2
    ? allPlayers.filter(player => {
        if (player.kycStatus !== "pending") return false;
        const searchLower = playersSearch.toLowerCase();
        return (
          player.name.toLowerCase().includes(searchLower) ||
          player.email.toLowerCase().includes(searchLower) ||
          player.id.toLowerCase().includes(searchLower) ||
          player.phone.includes(playersSearch)
        );
      })
    : [];

  // Filter players based on search and filters (for display list)
  const filteredPlayers = allPlayers.filter(player => {
    if (player.kycStatus !== "pending") return false;
    // If a player is selected, show only that player
    if (selectedPlayer && player.id !== selectedPlayer.id) return false;
    // Otherwise, filter by search text
    if (!selectedPlayer && playersSearch) {
      const searchLower = playersSearch.toLowerCase();
      const matchesSearch = 
        player.name.toLowerCase().includes(searchLower) ||
        player.email.toLowerCase().includes(searchLower) ||
        player.id.toLowerCase().includes(searchLower) ||
        player.phone.includes(playersSearch);
      if (!matchesSearch) return false;
    }
    if (playersFilter.documentType !== "all" && player.documentType !== playersFilter.documentType) {
      return false;
    }
    if (playersFilter.registrationDate !== "all") {
      const registrationDate = new Date(player.registrationDate);
      const now = new Date();
      const daysDiff = Math.floor((now - registrationDate) / (1000 * 60 * 60 * 24));
      if (playersFilter.registrationDate === "today" && daysDiff !== 0) return false;
      if (playersFilter.registrationDate === "week" && daysDiff > 7) return false;
      if (playersFilter.registrationDate === "month" && daysDiff > 30) return false;
    }
    return true;
  });

  // Handle KYC verification actions
  const handleKYCVerification = (playerId, action, notes = "") => {
    setAllPlayers(prev => prev.map(player => {
      if (player.id === playerId) {
        return {
          ...player,
          kycStatus: action === "approve" ? "approved" : action === "reject" ? "rejected" : player.kycStatus,
          verificationNotes: notes,
          verifiedDate: new Date().toISOString().split('T')[0]
        };
      }
      return player;
    }));
    alert(`KYC ${action === "approve" ? "approved" : action === "reject" ? "rejected" : "updated"} for ${playerId}`);
  };

  // State for Registered Players (Verified/Approved users)
  const [registeredPlayersSearch, setRegisteredPlayersSearch] = useState("");
  const [selectedRegisteredPlayer, setSelectedRegisteredPlayer] = useState(null);
  const [registeredPlayersFilter, setRegisteredPlayersFilter] = useState({
    status: "all",
    registrationDate: "all",
    documentType: "all",
    verifiedDate: "all"
  });
  const [selectedPlayerDetails, setSelectedPlayerDetails] = useState(null);

  // Mock registered/verified players data
  const [registeredPlayers, setRegisteredPlayers] = useState([
    {
      id: "P101",
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      phone: "+91 9876543215",
      kycStatus: "approved",
      registrationDate: "2024-01-05",
      documentType: "PAN Card",
      verifiedDate: "2024-01-06",
      verificationNotes: "All documents verified",
      accountStatus: "Active",
      totalGames: 45,
      lastActive: "2 hours ago",
      kycDocUrl: "/documents/pan_alex_johnson.pdf",
      referredBy: "Agent X",
      referralCode: "AGTX-ALPHA"
    },
    {
      id: "P102",
      name: "Maria Garcia",
      email: "maria.garcia@example.com",
      phone: "+91 9876543216",
      kycStatus: "approved",
      registrationDate: "2024-01-08",
      documentType: "Aadhaar Card",
      verifiedDate: "2024-01-09",
      verificationNotes: "Documents verified successfully",
      accountStatus: "Active",
      totalGames: 123,
      lastActive: "5 minutes ago",
      kycDocUrl: "/documents/aadhaar_maria_garcia.pdf",
      referredBy: "Agent Y",
      referralCode: "AGTY-BETA"
    },
    {
      id: "P103",
      name: "Rajesh Kumar",
      email: "rajesh.kumar@example.com",
      phone: "+91 9876543217",
      kycStatus: "approved",
      registrationDate: "2024-01-10",
      documentType: "Passport",
      verifiedDate: "2024-01-11",
      verificationNotes: "Passport verified",
      accountStatus: "Suspended",
      totalGames: 67,
      lastActive: "3 days ago",
      kycDocUrl: "/documents/passport_rajesh_kumar.pdf",
      referredBy: "Agent Z",
      referralCode: "AGTZ-GAMMA"
    },
    {
      id: "P104",
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      phone: "+91 9876543218",
      kycStatus: "approved",
      registrationDate: "2024-01-12",
      documentType: "Driving License",
      verifiedDate: "2024-01-13",
      verificationNotes: "License verified",
      accountStatus: "Active",
      totalGames: 89,
      lastActive: "1 hour ago",
      kycDocUrl: "/documents/dl_priya_sharma.pdf",
      referredBy: "Affiliate Club",
      referralCode: "AFF-DELTA"
    }
  ]);
  const [referralAgentSearch, setReferralAgentSearch] = useState("");
  const [referralCodeSearch, setReferralCodeSearch] = useState("");
  const [selectedReferralAgent, setSelectedReferralAgent] = useState(null);
  const [selectedReferralCode, setSelectedReferralCode] = useState(null);

  // Filter registered players for dropdown search
  const filteredRegisteredPlayersForSearch = registeredPlayersSearch.length >= 2
    ? registeredPlayers.filter(player => {
        if (player.kycStatus !== "approved") return false;
        const searchLower = registeredPlayersSearch.toLowerCase();
        return (
          player.name.toLowerCase().includes(searchLower) ||
          player.email.toLowerCase().includes(searchLower) ||
          player.id.toLowerCase().includes(searchLower) ||
          player.phone.includes(registeredPlayersSearch)
        );
      })
    : [];

  // Filter registered players (for display list)
  const filteredRegisteredPlayers = registeredPlayers.filter(player => {
    if (player.kycStatus !== "approved") return false;
    // If a player is selected, show only that player
    if (selectedRegisteredPlayer && player.id !== selectedRegisteredPlayer.id) return false;
    // Otherwise, filter by search text
    if (!selectedRegisteredPlayer && registeredPlayersSearch) {
      const searchLower = registeredPlayersSearch.toLowerCase();
      const matchesSearch = 
        player.name.toLowerCase().includes(searchLower) ||
        player.email.toLowerCase().includes(searchLower) ||
        player.id.toLowerCase().includes(searchLower) ||
        player.phone.includes(registeredPlayersSearch);
      if (!matchesSearch) return false;
    }
    if (registeredPlayersFilter.status !== "all" && player.accountStatus !== registeredPlayersFilter.status) {
      return false;
    }
    if (registeredPlayersFilter.documentType !== "all" && player.documentType !== registeredPlayersFilter.documentType) {
      return false;
    }
    if (registeredPlayersFilter.registrationDate !== "all") {
      const registrationDate = new Date(player.registrationDate);
      const now = new Date();
      const daysDiff = Math.floor((now - registrationDate) / (1000 * 60 * 60 * 24));
      if (registeredPlayersFilter.registrationDate === "today" && daysDiff !== 0) return false;
      if (registeredPlayersFilter.registrationDate === "week" && daysDiff > 7) return false;
      if (registeredPlayersFilter.registrationDate === "month" && daysDiff > 30) return false;
    }
    if (registeredPlayersFilter.verifiedDate !== "all") {
      const verifiedDate = new Date(player.verifiedDate);
      const now = new Date();
      const daysDiff = Math.floor((now - verifiedDate) / (1000 * 60 * 60 * 24));
      if (registeredPlayersFilter.verifiedDate === "today" && daysDiff !== 0) return false;
      if (registeredPlayersFilter.verifiedDate === "week" && daysDiff > 7) return false;
      if (registeredPlayersFilter.verifiedDate === "month" && daysDiff > 30) return false;
    }
    return true;
  });

  const allReferredPlayers = registeredPlayers.filter(player => player.referredBy || player.referralCode);
  const uniqueReferrers = Array.from(new Set(allReferredPlayers.map(player => player.referredBy).filter(Boolean)));
  const uniqueReferralCodes = Array.from(new Set(allReferredPlayers.map(player => player.referralCode).filter(Boolean)));

  const filteredReferrersForSearch = referralAgentSearch.length >= 2 && !selectedReferralAgent
    ? uniqueReferrers.filter(agent => (agent || "").toLowerCase().includes(referralAgentSearch.toLowerCase()))
    : [];

  const filteredReferralCodesForSearch = referralCodeSearch.length >= 2 && !selectedReferralCode
    ? uniqueReferralCodes.filter(code => (code || "").toLowerCase().includes(referralCodeSearch.toLowerCase()))
    : [];

  const filteredReferralPlayers = allReferredPlayers.filter(player => {
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

  // Handle download KYC document
  const handleDownloadKYCDoc = (playerId, docUrl) => {
    const player = registeredPlayers.find(p => p.id === playerId);
    if (player) {
      alert(`Downloading KYC document for ${player.name}\nDocument: ${player.documentType}\nURL: ${docUrl}`);
      // In real implementation, this would trigger a download
    }
  };

  // Handle export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Account Status', 'Registration Date', 'Document Type', 'Verified Date', 'Total Games', 'Last Active'];
    const rows = filteredRegisteredPlayers.map(p => [
      p.id, p.name, p.email, p.phone, p.accountStatus, p.registrationDate, p.documentType, p.verifiedDate, p.totalGames, p.lastActive
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registered_players_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get all players for search (combine registered and pending)
  const allPlayersForReport = [...registeredPlayers, ...allPlayers.filter(p => !registeredPlayers.find(rp => rp.id === p.id))];

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
    ? allPlayersForReport.filter(player => {
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

  // Handle export PDF for reports (client-side print)
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
          ["P102", "Maria Garcia", "89", "₹32,500", "₹365", "₹3,250"]
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
          ["Table 2", "2024-01-20", "10", "₹4,100", "₹410", "6"]
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

  const menuItems = useMemo(() => [
    "Dashboard",
    "Players",
    "Registered Players",
    "Staff Management",
    "Credit Approvals",
    "Financial Overrides",
    "Waitlist & Seating Overrides",
    "VIP Store",
    "Analytics & Reports",
    "Global Settings",
    "Logs & Audits",
    "System Control"
  ], []);


  const [staff, setStaff] = useState([
    { id: "S001", name: "Alice Brown", role: "GRE", status: "Active" },
    { id: "S002", name: "Bob Green", role: "Dealer", status: "Active" },
    { id: "S003", name: "Sara White", role: "Cashier", status: "Deactivated" }
  ]);

  const [creditRequests, setCreditRequests] = useState([
    { id: "CR-101", playerId: "P001", player: "John Doe", amount: 5000, status: "Pending", visibleToPlayer: false, limit: 0 },
    { id: "CR-102", playerId: "P003", player: "Mike Johnson", amount: 2500, status: "Pending", visibleToPlayer: false, limit: 0 }
  ]);

  const [transactions, setTransactions] = useState([
    { id: "TX-9001", type: "Deposit", player: "John Doe", amount: 3000, status: "Completed" },
    { id: "TX-9002", type: "Cashout", player: "Jane Smith", amount: 1800, status: "Pending" },
    { id: "TX-9003", type: "Bonus", player: "Mike Johnson", amount: 500, status: "Completed" }
  ]);

  const [waitlist, setWaitlist] = useState([
    { pos: 1, player: "Alex Johnson", game: "Hold'em" },
    { pos: 2, player: "Maria Garcia", game: "Omaha" }
  ]);

  // VIP Store state
  const [vipProducts, setVipProducts] = useState([
    { id: 'vip-1', clubId: 'club-01', title: 'VIP Hoodie', points: 1500 },
    { id: 'vip-2', clubId: 'club-01', title: 'Free Dinner', points: 800 },
    { id: 'vip-3', clubId: 'club-02', title: 'VIP Poker Set', points: 2500 },
    { id: 'vip-4', clubId: 'club-02', title: 'Premium Tournament Entry', points: 3000 }
  ]);

  const approveCredit = (id) => {
    setCreditRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "Approved", visibleToPlayer: true, limit: r.amount } : r));
  };

  const denyCredit = (id) => {
    setCreditRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "Denied", visibleToPlayer: false, limit: 0 } : r));
  };

  const togglePlayerStatus = (playerId, nextStatus) => {
    setPlayers((prev) => prev.map((p) => p.id === playerId ? { ...p, status: nextStatus } : p));
  };

  const addStaff = (name, role) => {
    const id = `S${(Math.random()*10000|0).toString().padStart(3,'0')}`;
    setStaff((prev) => [...prev, { id, name, role, status: "Active" }]);
  };

  const deactivateStaff = (id) => {
    setStaff((prev) => prev.map((s) => s.id === id ? { ...s, status: "Deactivated" } : s));
  };

  const factoryReset = () => {
    try {
      localStorage.clear();
    } catch {}
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans">
      <div className="mx-auto max-w-[1600px] px-6 py-10 grid grid-cols-12 gap-8">
        <aside className="col-span-12 lg:col-span-3 xl:col-span-3 rounded-2xl bg-gradient-to-b from-red-500/20 via-purple-600/30 to-indigo-700/30 p-5 shadow-lg border border-gray-800">
          <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-purple-300 to-indigo-400 drop-shadow-lg mb-6">
            Super Admin
          </div>
          <div className="bg-white/10 rounded-xl p-4 mb-6 text-white shadow-inner">
            <div className="text-lg font-semibold">Root Administrator</div>
            <div className="text-sm opacity-80">super@admin.com</div>
          </div>
          
          {/* Club Selection Dropdown */}
          <div className="mb-6 relative">
            <label className="text-white text-sm mb-2 block">Select Club</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsClubDropdownOpen(!isClubDropdownOpen)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-left flex items-center justify-between hover:bg-white/15 transition-colors"
              >
                <span className="truncate">{selectedClub?.name || 'Select Club'}</span>
                <svg 
                  className={`w-4 h-4 ml-2 transition-transform ${isClubDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isClubDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsClubDropdownOpen(false)}
                  ></div>
                  <div className="absolute z-20 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {clubs.map(club => (
                      <button
                        key={club.id}
                        type="button"
                        onClick={() => {
                          setSelectedClubId(club.id);
                          setIsClubDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-white hover:bg-white/10 transition-colors ${
                          selectedClubId === club.id ? 'bg-blue-600/30' : ''
                        }`}
                      >
                        {club.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">Managing: {selectedClub?.name}</p>
          </div>
          
          <nav className="space-y-3">
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveItem(item)}
                className={`w-full text-left rounded-xl px-4 py-3 font-medium transition-all duration-300 shadow-md ${
                  activeItem === item
                    ? "bg-gradient-to-r from-red-400 to-purple-600 text-white font-bold shadow-lg scale-[1.02]"
                    : "bg-white/5 hover:bg-gradient-to-r hover:from-red-400/20 hover:to-purple-500/20 text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <main className="col-span-12 lg:col-span-9 xl:col-span-9 space-y-8">
          <header className="bg-gradient-to-r from-red-600 via-purple-500 to-indigo-400 p-6 rounded-xl shadow-md flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Super Admin - {activeItem}</h1>
              <p className="text-gray-200 mt-1">Ultimate control: players, staff, credit, overrides and more</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate("/manager")} className="bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-lg shadow">Manager</button>
              <button onClick={() => navigate("/master-admin")} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg shadow">Master Admin</button>
              <button onClick={() => navigate("/admin")} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg shadow">Admin</button>
              <button onClick={() => navigate("/super-admin/signin")} className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow">Sign Out</button>
            </div>
          </header>

          {activeItem === "Dashboard" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                  { title: "Total Players", value: allPlayers.length.toString(), color: "from-blue-400 via-indigo-500 to-purple-500" },
                  { title: "Active Staff", value: staff.filter(s=>s.status==='Active').length.toString(), color: "from-green-400 via-emerald-500 to-teal-500" },
                  { title: "Pending Credit", value: creditRequests.filter(r=>r.status==='Pending').length.toString(), color: "from-yellow-400 via-orange-500 to-red-500" },
                  { title: "Open Overrides", value: transactions.filter(t=>t.status!=='Completed').length.toString(), color: "from-pink-400 via-red-500 to-rose-500" },
                ].map((card) => (
                  <div key={card.title} className={`p-6 rounded-xl bg-gradient-to-br ${card.color} text-gray-900 shadow-lg transition-transform transform hover:scale-105`}>
                    <div className="text-sm opacity-90 text-white/90">{card.title}</div>
                    <div className="text-3xl font-bold mt-2 text-white">{card.value}</div>
                    <div className="text-xs mt-1 text-white/70">Updated just now</div>
                  </div>
                ))}
              </div>

              {/* Revenue, Rake & Tips Overview */}
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-rose-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Revenue, Rake & Tips Overview - {selectedClub?.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Previous Day Revenue */}
                  <div className="bg-white/10 p-4 rounded-lg border border-purple-400/30">
                    <div className="text-sm text-gray-300 mb-1">Prev Day Revenue</div>
                    <div className="text-2xl font-bold text-white mb-2">{formatCurrency(revenueData.previousDay.revenue)}</div>
                    <div className="text-xs text-gray-400">
                      {revenueData.previousDay.date}
                    </div>
                  </div>

                  {/* Current Day Revenue */}
                  <div className="bg-white/10 p-4 rounded-lg border border-green-400/30">
                    <div className="text-sm text-gray-300 mb-1">Today's Revenue</div>
                    <div className="text-2xl font-bold text-white mb-2">{formatCurrency(revenueData.currentDay.revenue)}</div>
                    <div className="text-xs text-gray-400">
                      {revenueData.currentDay.date}
                    </div>
                  </div>

                  {/* Previous Day Rake */}
                  <div className="bg-white/10 p-4 rounded-lg border border-blue-400/30">
                    <div className="text-sm text-gray-300 mb-1">Prev Day Rake</div>
                    <div className="text-2xl font-bold text-white mb-2">{formatCurrency(revenueData.previousDay.rake)}</div>
                    <div className="text-xs text-gray-400">
                      {revenueData.previousDay.date}
                    </div>
                  </div>

                  {/* Current Day Rake */}
                  <div className="bg-white/10 p-4 rounded-lg border border-yellow-400/30">
                    <div className="text-sm text-gray-300 mb-1">Today's Rake</div>
                    <div className="text-2xl font-bold text-white mb-2">{formatCurrency(revenueData.currentDay.rake)}</div>
                    <div className="text-xs text-gray-400">
                      {revenueData.currentDay.date}
                    </div>
                  </div>

                  {/* Previous Day Tips */}
                  <div className="bg-white/10 p-4 rounded-lg border border-cyan-400/30">
                    <div className="text-sm text-gray-300 mb-1">Prev Day Tips</div>
                    <div className="text-2xl font-bold text-white mb-2">{formatCurrency(revenueData.previousDay.tips)}</div>
                    <div className="text-xs text-gray-400">
                      Club: {formatCurrency(previousDayTipShares.club)} • Staff: {formatCurrency(previousDayTipShares.staff)}
                    </div>
                    <div className="text-xs text-cyan-300 font-semibold mt-2">Hold {Math.round(TIP_HOLD_PERCENT * 100)}% • Staff {Math.round((1 - TIP_HOLD_PERCENT) * 100)}%</div>
                  </div>

                  {/* Current Day Tips */}
                  <div className="bg-white/10 p-4 rounded-lg border border-orange-400/30">
                    <div className="text-sm text-gray-300 mb-1">Today's Tips</div>
                    <div className="text-2xl font-bold text-white mb-2">{formatCurrency(revenueData.currentDay.tips)}</div>
                    <div className="text-xs text-gray-400">
                      Club: {formatCurrency(currentDayTipShares.club)} • Staff: {formatCurrency(currentDayTipShares.staff)}
                    </div>
                    <div className="text-xs text-orange-300 font-semibold mt-2">Hold {Math.round(TIP_HOLD_PERCENT * 100)}% • Staff {Math.round((1 - TIP_HOLD_PERCENT) * 100)}%</div>
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-400">
                  Last Updated: {revenueData.currentDay.lastUpdated} | Data for {selectedClub?.name}
                </div>
              </section>

              <section className="p-6 bg-gradient-to-r from-purple-400/30 via-indigo-500/20 to-blue-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-400 hover:to-purple-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">New Staff</button>
                  <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">Approve All Credits</button>
                  <button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">Export Report</button>
                  <button className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 text-white px-5 py-3 rounded-xl font-semibold shadow transition" onClick={factoryReset}>Factory Reset</button>
                </div>
              </section>
            </>
          )}

          {/* Players - KYC Pending Review */}
          {activeItem === "Players" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Players - KYC Pending Review</h2>
                
                {/* Search and Filters */}
                <div className="bg-white/10 p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <label className="text-white text-sm mb-1 block">Search Player</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          placeholder="Type at least 2 characters to search..." 
                          value={playersSearch}
                          onChange={(e) => {
                            setPlayersSearch(e.target.value);
                            setSelectedPlayer(null);
                          }}
                        />
                        {playersSearch.length >= 2 && filteredPlayersForSearch.length > 0 && !selectedPlayer && (
                          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredPlayersForSearch.map(player => (
                              <div
                                key={player.id}
                                onClick={() => {
                                  setSelectedPlayer(player);
                                  setPlayersSearch(`${player.name} (${player.id})`);
                                }}
                                className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0"
                              >
                                <div className="text-white font-medium">{player.name}</div>
                                <div className="text-gray-400 text-xs">ID: {player.id} | Email: {player.email} | Phone: {player.phone}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedPlayer && (
                          <div className="mt-2 p-2 bg-green-500/20 border border-green-400/30 rounded text-sm flex items-center justify-between">
                            <span className="text-green-300">Selected: {selectedPlayer.name} ({selectedPlayer.id})</span>
                            <button 
                              onClick={() => {
                                setSelectedPlayer(null);
                                setPlayersSearch("");
                              }}
                              className="ml-2 text-red-400 hover:text-red-300 font-bold"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-white text-sm mb-1 block">Registration Date</label>
                      <CustomSelect
                        className="w-full"
                        value={playersFilter.registrationDate}
                        onChange={(e) => setPlayersFilter({...playersFilter, registrationDate: e.target.value})}
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                      </CustomSelect>
                    </div>
                    <div>
                      <label className="text-white text-sm mb-1 block">Document Type</label>
                      <CustomSelect
                        className="w-full"
                        value={playersFilter.documentType}
                        onChange={(e) => setPlayersFilter({...playersFilter, documentType: e.target.value})}
                      >
                        <option value="all">All Documents</option>
                        <option value="PAN Card">PAN Card</option>
                        <option value="Aadhaar Card">Aadhaar Card</option>
                        <option value="Passport">Passport</option>
                        <option value="Driving License">Driving License</option>
                      </CustomSelect>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-white text-sm">
                      Showing <span className="font-semibold">{filteredPlayers.length}</span> of <span className="font-semibold">{allPlayers.filter(p => p.kycStatus === 'pending').length}</span> pending KYC verifications
                    </div>
                    <button 
                      onClick={() => {
                        setPlayersSearch("");
                        setSelectedPlayer(null);
                        setPlayersFilter({kycStatus: "pending", registrationDate: "all", documentType: "all"});
                      }}
                      className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>

                {/* Players List */}
                <div className="bg-white/10 p-4 rounded-lg">
                  {filteredPlayers.length > 0 ? (
                    <div className="space-y-3">
                      {filteredPlayers.map(player => (
                        <div key={player.id} className="bg-white/5 p-4 rounded-lg border border-yellow-400/30">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                            {/* Player Info */}
                            <div className="md:col-span-8 space-y-2">
                              <div className="flex items-center gap-3">
                                <div className="font-semibold text-white text-lg">{player.name}</div>
                                <span className="bg-yellow-500/30 text-yellow-300 font-medium px-3 py-1 rounded-full text-xs border border-yellow-400/50">
                                  KYC Pending
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-400">ID:</span> <span className="text-white">{player.id}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Email:</span> <span className="text-white">{player.email}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Phone:</span> <span className="text-white">{player.phone}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Doc Type:</span> <span className="text-white">{player.documentType}</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-300">
                                <div>Registered: {new Date(player.registrationDate).toLocaleDateString()}</div>
                                <div>Submitted: {new Date(player.submittedDate).toLocaleDateString()}</div>
                                <div className="md:col-span-2">Days Pending: {Math.floor((new Date() - new Date(player.submittedDate)) / (1000 * 60 * 60 * 24))} days</div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="md:col-span-4 flex flex-col gap-2">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleKYCVerification(player.id, "approve")}
                                  className="flex-1 bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                                >
                                  ✓ Approve
                                </button>
                                <button 
                                  onClick={() => {
                                    const notes = prompt("Enter rejection reason (optional):");
                                    if (notes !== null) {
                                      handleKYCVerification(player.id, "reject", notes);
                                    }
                                  }}
                                  className="flex-1 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                                >
                                  ✗ Reject
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                                  onClick={() => alert(`View documents for ${player.name} (${player.id})\nDocument Type: ${player.documentType}`)}
                                >
                                  View Docs
                                </button>
                                <button 
                                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                                  onClick={() => alert(`Player Details:\n\nName: ${player.name}\nEmail: ${player.email}\nPhone: ${player.phone}\nDocument: ${player.documentType}\nRegistration: ${player.registrationDate}`)}
                                >
                                  Details
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-lg mb-2">No players found</div>
                      <div className="text-gray-500 text-sm">
                        {playersSearch || playersFilter.registrationDate !== "all" || playersFilter.documentType !== "all"
                          ? "Try adjusting your search or filters"
                          : "No pending KYC verifications"}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* Registered Players */}
          {activeItem === "Registered Players" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-red-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Registered Players - Verified Users</h2>
                
                {/* Search and Filters */}
                <div className="bg-white/10 p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <label className="text-white text-sm mb-1 block">Search Player</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          placeholder="Type at least 2 characters to search..." 
                          value={registeredPlayersSearch}
                          onChange={(e) => {
                            setRegisteredPlayersSearch(e.target.value);
                            setSelectedRegisteredPlayer(null);
                          }}
                        />
                        {registeredPlayersSearch.length >= 2 && filteredRegisteredPlayersForSearch.length > 0 && !selectedRegisteredPlayer && (
                          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredRegisteredPlayersForSearch.map(player => (
                              <div
                                key={player.id}
                                onClick={() => {
                                  setSelectedRegisteredPlayer(player);
                                  setRegisteredPlayersSearch(`${player.name} (${player.id})`);
                                }}
                                className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0"
                              >
                                <div className="text-white font-medium">{player.name}</div>
                                <div className="text-gray-400 text-xs">ID: {player.id} | Email: {player.email} | Phone: {player.phone}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedRegisteredPlayer && (
                          <div className="mt-2 p-2 bg-green-500/20 border border-green-400/30 rounded text-sm flex items-center justify-between">
                            <span className="text-green-300">Selected: {selectedRegisteredPlayer.name} ({selectedRegisteredPlayer.id})</span>
                            <button 
                              onClick={() => {
                                setSelectedRegisteredPlayer(null);
                                setRegisteredPlayersSearch("");
                              }}
                              className="ml-2 text-red-400 hover:text-red-300 font-bold"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-white text-sm mb-1 block">Account Status</label>
                      <CustomSelect
                        className="w-full"
                        value={registeredPlayersFilter.status}
                        onChange={(e) => setRegisteredPlayersFilter({...registeredPlayersFilter, status: e.target.value})}
                      >
                        <option value="all">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Inactive">Inactive</option>
                      </CustomSelect>
                    </div>
                    <div>
                      <label className="text-white text-sm mb-1 block">Registration Date</label>
                      <CustomSelect
                        className="w-full"
                        value={registeredPlayersFilter.registrationDate}
                        onChange={(e) => setRegisteredPlayersFilter({...registeredPlayersFilter, registrationDate: e.target.value})}
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                      </CustomSelect>
                    </div>
                    <div>
                      <label className="text-white text-sm mb-1 block">Document Type</label>
                      <CustomSelect
                        className="w-full"
                        value={registeredPlayersFilter.documentType}
                        onChange={(e) => setRegisteredPlayersFilter({...registeredPlayersFilter, documentType: e.target.value})}
                      >
                        <option value="all">All Documents</option>
                        <option value="PAN Card">PAN Card</option>
                        <option value="Aadhaar Card">Aadhaar Card</option>
                        <option value="Passport">Passport</option>
                        <option value="Driving License">Driving License</option>
                      </CustomSelect>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-white text-sm">
                      Showing <span className="font-semibold">{filteredRegisteredPlayers.length}</span> of <span className="font-semibold">{registeredPlayers.length}</span> verified players
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setRegisteredPlayersSearch("");
                          setSelectedRegisteredPlayer(null);
                          setRegisteredPlayersFilter({status: "all", registrationDate: "all", documentType: "all", verifiedDate: "all"});
                        }}
                        className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                      >
                        Clear Filters
                      </button>
                      <button 
                        onClick={handleExportCSV}
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                      >
                        Export CSV
                      </button>
                    </div>
                  </div>
                </div>

                {/* Players List */}
                <div className="bg-white/10 p-4 rounded-lg">
                  {filteredRegisteredPlayers.length > 0 ? (
                    <div className="space-y-3">
                      {filteredRegisteredPlayers.map(player => (
                        <div key={player.id} className="bg-white/5 p-4 rounded-lg border border-green-400/30">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                            <div className="md:col-span-8 space-y-2">
                              <div className="flex items-center gap-3">
                                <div className="font-semibold text-white text-lg">{player.name}</div>
                                <span className={`px-3 py-1 rounded-full text-xs border font-medium ${
                                  player.accountStatus === "Active" 
                                    ? "bg-green-500/30 text-green-300 border-green-400/50"
                                    : player.accountStatus === "Suspended"
                                    ? "bg-red-500/30 text-red-300 border-red-400/50"
                                    : "bg-gray-500/30 text-gray-300 border-gray-400/50"
                                }`}>
                                  {player.accountStatus}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-400">ID:</span> <span className="text-white">{player.id}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Email:</span> <span className="text-white">{player.email}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Phone:</span> <span className="text-white">{player.phone}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Doc Type:</span> <span className="text-white">{player.documentType}</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-300">
                                <div>Registered: {new Date(player.registrationDate).toLocaleDateString()}</div>
                                <div>Verified: {new Date(player.verifiedDate).toLocaleDateString()}</div>
                                <div>Games: {player.totalGames}</div>
                                <div>Last Active: {player.lastActive}</div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="md:col-span-4 flex flex-col gap-2">
                              <div className="flex gap-2">
                                <button 
                                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                                  onClick={() => setSelectedPlayerDetails(player)}
                                >
                                  View Details
                                </button>
                                <button 
                                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                                  onClick={() => handleDownloadKYCDoc(player.id, player.kycDocUrl)}
                                >
                                  Download KYC
                                </button>
                              </div>
                              <div className="flex gap-2">
                                {player.accountStatus === "Active" ? (
                                  <button 
                                    className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                                    onClick={() => {
                                      setRegisteredPlayers(prev => prev.map(p => p.id === player.id ? {...p, accountStatus: "Suspended"} : p));
                                      alert(`Player ${player.name} has been suspended`);
                                    }}
                                  >
                                    Suspend
                                  </button>
                                ) : (
                                  <button 
                                    className="flex-1 bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                                    onClick={() => {
                                      setRegisteredPlayers(prev => prev.map(p => p.id === player.id ? {...p, accountStatus: "Active"} : p));
                                      alert(`Player ${player.name} has been activated`);
                                    }}
                                  >
                                    Activate
                                  </button>
                                )}
                                <button 
                                  className="flex-1 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete ${player.name}?`)) {
                                      setRegisteredPlayers(prev => prev.filter(p => p.id !== player.id));
                                      alert(`Player ${player.name} has been deleted`);
                                    }
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-lg mb-2">No players found</div>
                      <div className="text-gray-500 text-sm">
                        {registeredPlayersSearch || registeredPlayersFilter.status !== "all" || registeredPlayersFilter.registrationDate !== "all" || registeredPlayersFilter.documentType !== "all"
                          ? "Try adjusting your search or filters"
                          : "No registered players"}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Player Details Modal */}
              {selectedPlayerDetails && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedPlayerDetails(null)}>
                  <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 border border-gray-700" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-white">Player Details</h3>
                      <button 
                        onClick={() => setSelectedPlayerDetails(null)}
                        className="text-gray-400 hover:text-white text-2xl"
                      >
                        ×
                      </button>
                    </div>
                    <div className="space-y-3 text-white">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-gray-400">Name:</span> <span className="font-semibold">{selectedPlayerDetails.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">ID:</span> <span className="font-semibold">{selectedPlayerDetails.id}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Email:</span> <span>{selectedPlayerDetails.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Phone:</span> <span>{selectedPlayerDetails.phone}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Account Status:</span> <span className={`font-semibold ${selectedPlayerDetails.accountStatus === "Active" ? "text-green-400" : "text-red-400"}`}>{selectedPlayerDetails.accountStatus}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Document Type:</span> <span>{selectedPlayerDetails.documentType}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Registration Date:</span> <span>{new Date(selectedPlayerDetails.registrationDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Verified Date:</span> <span>{new Date(selectedPlayerDetails.verifiedDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Total Games:</span> <span>{selectedPlayerDetails.totalGames}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Last Active:</span> <span>{selectedPlayerDetails.lastActive}</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <span className="text-gray-400">Verification Notes:</span>
                        <p className="text-white mt-1">{selectedPlayerDetails.verificationNotes}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeItem === "Staff Management" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-red-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Staff Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Add / Edit Staff</h3>
                    <div className="space-y-3">
                      <input type="text" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Full Name" id="new-staff-name" />
                      <CustomSelect className="w-full" id="new-staff-role">
                        <option>GRE</option>
                        <option>Dealer</option>
                        <option>Cashier</option>
                        <option>HR</option>
                        <option>Manager</option>
                      </CustomSelect>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold" onClick={() => {
                          const nameInput = document.getElementById('new-staff-name');
                          const roleSelect = document.getElementById('new-staff-role');
                          const name = nameInput && 'value' in nameInput ? nameInput.value : '';
                          const role = roleSelect && 'value' in roleSelect ? roleSelect.value : 'GRE';
                          if (typeof name === 'string' && name.trim()) addStaff(name, String(role));
                        }}>Add Staff</button>
                        <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">Edit Selected</button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Current Staff</h3>
                    <div className="space-y-2">
                      {staff.map((s) => (
                        <div key={s.id} className="bg-white/5 p-3 rounded border border-white/10 flex items-center justify-between">
                          <div className="text-white">
                            <div className="font-semibold">{s.name} • {s.role}</div>
                            <div className="text-sm text-white/80">{s.id} • {s.status}</div>
                          </div>
                          <div className="flex gap-2">
                            <button className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm">Assign Role</button>
                            <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">Contracts</button>
                            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded text-sm">Performance</button>
                            {s.status !== 'Deactivated' && (
                              <button onClick={() => deactivateStaff(s.id)} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">Deactivate</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "Credit Approvals" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-orange-700/30 rounded-xl shadow-md border border-amber-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Exclusive Player Credit System</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Pending Requests</h3>
                    <div className="space-y-2">
                      {creditRequests.map((r) => (
                        <div key={r.id} className="bg-white/5 p-3 rounded border border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="text-white font-semibold">{r.player} • ₹{r.amount.toLocaleString('en-IN')}</div>
                            <span className={`text-xs px-2 py-1 rounded ${r.status==='Approved'?'bg-green-500/30 text-green-300':r.status==='Denied'?'bg-red-500/30 text-red-300':'bg-yellow-500/30 text-yellow-300'}`}>{r.status}</span>
                          </div>
                          <div className="mt-2 flex gap-2">
                            <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm" onClick={() => approveCredit(r.id)}>Approve</button>
                            <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm" onClick={() => denyCredit(r.id)}>Deny</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Dynamic Visibility & Limits</h3>
                    <div className="space-y-3">
                      {creditRequests.map((r) => (
                        <div key={`${r.id}-ctl`} className="bg-white/5 p-3 rounded border border-white/10 flex items-center justify-between">
                          <div className="text-white text-sm">
                            <div className="font-semibold">{r.player}</div>
                            <div className="text-white/70">Visible: {r.visibleToPlayer ? 'Yes' : 'No'} • Limit: ₹{r.limit.toLocaleString('en-IN')}</div>
                          </div>
                          <div className="flex gap-2 items-center">
                            <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm" onClick={() => setCreditRequests(prev => prev.map(x => x.id===r.id ? { ...x, visibleToPlayer: !x.visibleToPlayer } : x))}>{r.visibleToPlayer ? 'Hide' : 'Show'}</button>
                            <input type="number" className="w-28 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm" placeholder="Set limit" onChange={(e) => setCreditRequests(prev => prev.map(x => x.id===r.id ? { ...x, limit: Number(e.target.value)||0 } : x))} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "Financial Overrides" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-cyan-600/30 via-blue-500/20 to-indigo-700/30 rounded-xl shadow-md border border-cyan-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Financial Overrides</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Edit / Cancel Transactions</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {transactions.map((t) => (
                        <div key={t.id} className="bg-white/5 p-3 rounded border border-white/10 flex items-center justify-between">
                          <div className="text-white">
                            <div className="font-semibold">{t.type} • {t.player}</div>
                            <div className="text-sm text-white/70">{t.id} • ₹{t.amount.toLocaleString('en-IN')} • {t.status}</div>
                          </div>
                          <div className="flex gap-2">
                            <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">Edit</button>
                            <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm" onClick={() => setTransactions(prev => prev.filter(x => x.id !== t.id))}>Cancel</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Cashouts & Bonuses</h3>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input type="text" className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Player ID" />
                        <input type="number" className="w-32 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Amount" />
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">Process Cashout</button>
                        <button className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold">Approve Bonus</button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "Waitlist & Seating Overrides" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-emerald-600/30 via-green-500/20 to-teal-700/30 rounded-xl shadow-md border border-emerald-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Waitlist & Seating Overrides</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Move Between Tables/Sessions</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Select Player</label>
                        <CustomSelect className="w-full mt-1">
                          <option value="">-- Select Player --</option>
                          {waitlist.map((w) => (
                            <option key={w.pos} value={w.pos}>
                              {w.player} - Position {w.pos} ({w.game})
                            </option>
                          ))}
                          <option value="seated-1">John Doe - Table 1, Seat 3</option>
                          <option value="seated-2">Jane Smith - Table 2, Seat 5</option>
                          <option value="seated-3">Mike Johnson - Table 1, Seat 7</option>
                        </CustomSelect>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-white text-sm">From Table</label>
                          <CustomSelect className="w-full mt-1">
                            <option value="">-- Select Table --</option>
                            <option value="1">Table 1 - Texas Hold'em</option>
                            <option value="2">Table 2 - Omaha</option>
                            <option value="3">Table 3 - Seven Card Stud</option>
                            <option value="waitlist">Waitlist</option>
                          </CustomSelect>
                        </div>
                        <div>
                          <label className="text-white text-sm">From Seat (Optional)</label>
                          <CustomSelect className="w-full mt-1">
                            <option value="">Any Seat</option>
                            {[1,2,3,4,5,6,7,8].map(seat => (
                              <option key={seat} value={seat}>Seat {seat}</option>
                            ))}
                          </CustomSelect>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-white text-sm">To Table</label>
                          <CustomSelect className="w-full mt-1">
                            <option value="">-- Select Table --</option>
                            <option value="1">Table 1 - Texas Hold'em</option>
                            <option value="2">Table 2 - Omaha</option>
                            <option value="3">Table 3 - Seven Card Stud</option>
                            <option value="waitlist">Waitlist</option>
                          </CustomSelect>
                        </div>
                        <div>
                          <label className="text-white text-sm">To Seat (Optional)</label>
                          <CustomSelect className="w-full mt-1">
                            <option value="">Any Available Seat</option>
                            {[1,2,3,4,5,6,7,8].map(seat => (
                              <option key={seat} value={seat}>Seat {seat}</option>
                            ))}
                          </CustomSelect>
                        </div>
                      </div>
                      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Move Player
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Force Seat Assignment (Override)</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Select Player</label>
                        <CustomSelect className="w-full mt-1">
                          <option value="">-- Select Player --</option>
                          {waitlist.map((w) => (
                            <option key={w.pos} value={w.pos}>
                              {w.player} - Position {w.pos}
                            </option>
                          ))}
                        </CustomSelect>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-white text-sm">Table</label>
                          <CustomSelect className="w-full mt-1">
                            <option value="">-- Select Table --</option>
                            <option value="1">Table 1 - Texas Hold'em</option>
                            <option value="2">Table 2 - Omaha</option>
                            <option value="3">Table 3 - Seven Card Stud</option>
                          </CustomSelect>
                        </div>
                        <div>
                          <label className="text-white text-sm">Seat Number</label>
                          <CustomSelect className="w-full mt-1">
                            <option value="">-- Select Seat --</option>
                            {[1,2,3,4,5,6,7,8].map(seat => (
                              <option key={seat} value={seat}>Seat {seat}</option>
                            ))}
                          </CustomSelect>
                        </div>
                      </div>
                      <div className="bg-yellow-500/20 border border-yellow-400/30 p-2 rounded text-xs text-yellow-300">
                        ⚠️ Force assignment will override seat availability and move existing player if needed
                      </div>
                      <button className="w-full bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Force Assign Seat (Override)
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Override Waitlist Priority</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Select Player from Waitlist</label>
                        <CustomSelect className="w-full mt-1">
                          <option value="">-- Select Player --</option>
                          {waitlist.map((w) => (
                            <option key={w.pos} value={w.pos}>
                              Position {w.pos}: {w.player}
                            </option>
                          ))}
                        </CustomSelect>
                      </div>
                      <div>
                        <label className="text-white text-sm">New Priority Position</label>
                        <input 
                          type="number" 
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          placeholder={`Enter position (1-${waitlist.length || 1})`}
                          min="1"
                          max={waitlist.length || 1}
                        />
                      </div>
                      <button className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Update Priority
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Waitlist Actions</h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-white text-sm">Select Player to Remove</label>
                        <CustomSelect className="w-full">
                          <option value="">-- Select Player --</option>
                          {waitlist.map((w) => (
                            <option key={w.pos} value={w.pos}>
                              {w.player} - Position {w.pos}
                            </option>
                          ))}
                        </CustomSelect>
                      </div>
                      <button className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Remove from Waitlist
                      </button>
                      <div className="border-t border-white/20 pt-3 mt-3">
                        <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold mb-2">
                          Call Next Player
                        </button>
                        <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                          Call All Waitlisted Players
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* VIP Store */}
          {activeItem === "VIP Store" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-red-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">VIP Store Management - {selectedClub?.name}</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Products (Club)</h3>
                    <div className="mb-4">
                      <label className="text-white text-sm mb-2 block">Select Club</label>
                      <CustomSelect
                        className="w-full mb-4"
                        value={selectedClubId}
                        onChange={(e) => setSelectedClubId(e.target.value)}
                      >
                        {clubs.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </CustomSelect>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <input 
                        id="vip-title" 
                        className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                        placeholder="Product name" 
                      />
                      <input 
                        id="vip-points" 
                        type="number" 
                        className="w-32 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                        placeholder="Points" 
                      />
                      <button 
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded" 
                        onClick={() => {
                          const t = document.getElementById('vip-title');
                          const p = document.getElementById('vip-points');
                          const title = t && 'value' in t ? t.value : '';
                          const pts = p && 'value' in p ? parseInt(p.value || '0', 10) : 0;
                          if (title.trim() && pts > 0) {
                            setVipProducts(prev => [...prev, { id: `vip-${Date.now()}`, clubId: selectedClubId, title, points: pts }]);
                            if (t) t.value = '';
                            if (p) p.value = '';
                          }
                        }}
                      >
                        Add
                      </button>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {vipProducts.filter(v => v.clubId === selectedClubId).map(v => (
                        <div key={v.id} className="bg-white/5 p-3 rounded border border-white/10 flex items-center justify-between">
                          <div className="text-white text-sm">{v.title}</div>
                          <div className="flex items-center gap-2">
                            <div className="text-white/80 text-xs">{v.points} pts</div>
                            <button 
                              onClick={() => {
                                if (window.confirm(`Delete "${v.title}"?`)) {
                                  setVipProducts(prev => prev.filter(p => p.id !== v.id));
                                }
                              }}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                      {vipProducts.filter(v => v.clubId === selectedClubId).length === 0 && (
                        <div className="text-center py-4 text-gray-400 text-sm">
                          No products for this club. Add products above.
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Points Calculator</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm mb-1 block">Buy-in Total</label>
                        <input 
                          id="calc-buyin" 
                          type="number" 
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          placeholder="Enter buy-in amount" 
                        />
                      </div>
                      <div>
                        <label className="text-white text-sm mb-1 block">Hours Played</label>
                        <input 
                          id="calc-hours" 
                          type="number" 
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          placeholder="Enter hours played" 
                        />
                      </div>
                      <div>
                        <label className="text-white text-sm mb-1 block">Visit Frequency</label>
                        <input 
                          id="calc-visits" 
                          type="number" 
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          placeholder="Enter visit frequency" 
                        />
                      </div>
                      <button 
                        className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold" 
                        onClick={() => {
                          const b = document.getElementById('calc-buyin');
                          const h = document.getElementById('calc-hours');
                          const v = document.getElementById('calc-visits');
                          const buyin = b && 'value' in b ? parseFloat(b.value || '0') : 0;
                          const hours = h && 'value' in h ? parseFloat(h.value || '0') : 0;
                          const visits = v && 'value' in v ? parseFloat(v.value || '0') : 0;
                          const points = (buyin * 0.5) + (hours * 0.3) + (visits * 0.2);
                          alert(`Estimated Points: ${Math.round(points)}`);
                        }}
                      >
                        Calculate Points
                      </button>
                      <div className="text-xs text-white/70 bg-white/5 p-2 rounded">
                        <strong>Formula:</strong> (Buy-in × 0.5) + (Hours × 0.3) + (Visits × 0.2)
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* All Clubs VIP Products Overview */}
              <section className="p-6 bg-gradient-to-r from-indigo-600/30 via-purple-500/20 to-pink-700/30 rounded-xl shadow-md border border-indigo-800/40">
                <h2 className="text-xl font-bold text-white mb-6">All Clubs VIP Products Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {clubs.map(club => {
                    const clubProducts = vipProducts.filter(v => v.clubId === club.id);
                    return (
                      <div key={club.id} className="bg-white/10 p-4 rounded-lg border border-white/10">
                        <div className="font-semibold text-white mb-2">{club.name}</div>
                        <div className="text-sm text-gray-300 mb-3">
                          {clubProducts.length} product{clubProducts.length !== 1 ? 's' : ''}
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {clubProducts.length > 0 ? (
                            clubProducts.map(product => (
                              <div key={product.id} className="bg-white/5 p-2 rounded text-xs">
                                <div className="text-white">{product.title}</div>
                                <div className="text-purple-300">{product.points} pts</div>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-gray-400">No products</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {activeItem === "Analytics & Reports" && (
            <div className="space-y-6">
              {/* Report Type Selection */}
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-red-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Generate Reports</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Report Configuration</h3>
                    <div className="space-y-4">
                      <div className="w-full">
                      <label className="text-white text-sm mb-2 block">Select Report Type</label>
                      <CustomSelect
                        className="w-full"
                        value={selectedReportType}
                        onChange={(e) => {
                          setSelectedReportType(e.target.value);
                          setReportData(null);
                          if (e.target.value !== "individual_player") setSelectedPlayerForReport(null);
                          if (e.target.value !== "custom") setCustomReportSelection([]);
                        }}
                        placeholder="-- Select Report Type --"
                        allowSearch
                      >
                        <option value="w-full">-- Select Report Type --</option>
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
                                ✕
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
                            <option value="Table 4">Table 4</option>
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
                                      const player = allPlayersForReport.find(p => p.id === report.player);
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

              {/* Referral Analytics */}
              <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Referral Analytics & Tracking</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Filter Referred Players</h3>
                    <div className="space-y-4">
                      <div className="relative">
                        <label className="text-white text-sm">Search by Agent / Referrer</label>
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
                        {referralAgentSearch.length >= 2 && filteredReferrersForSearch.length > 0 && !selectedReferralAgent && (
                          <div className="absolute z-20 w-full mt-1 bg-gray-900 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredReferrersForSearch.map(agent => (
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
                        <label className="text-white text-sm">Search by Referral Code</label>
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
                        {referralCodeSearch.length >= 2 && filteredReferralCodesForSearch.length > 0 && !selectedReferralCode && (
                          <div className="absolute z-20 w-full mt-1 bg-gray-900 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredReferralCodesForSearch.map(code => (
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
                            {uniqueReferrers.map(agent => (
                              <button
                                key={agent}
                                onClick={() => {
                                  setSelectedReferralAgent(agent || "");
                                  setReferralAgentSearch("");
                                }}
                                className={`px-3 py-1 rounded-full text-xs font-semibold transition border ${
                                  (selectedReferralAgent || "").toLowerCase() === (agent || "").toLowerCase()
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
                            alert(`Referral report ready for export. ${snapshot} player(s) match the current filter.`);
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
                        <div>Total referred players: <span className="font-semibold text-white">{allReferredPlayers.length}</span></div>
                        <div>Unique referrers: <span className="font-semibold text-white">{uniqueReferrers.length}</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Referred Players ({filteredReferralPlayers.length}/{allReferredPlayers.length})
                    </h3>
                    {filteredReferralPlayers.length > 0 ? (
                      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {filteredReferralPlayers.map(player => (
                          <div key={player.id} className="bg-white/5 p-3 rounded-lg border border-green-400/30">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-white font-semibold text-base">{player.name}</div>
                                <div className="text-xs text-gray-300">ID: {player.id} • Email: {player.email}</div>
                                <div className="text-xs text-gray-300">Phone: {player.phone}</div>
                                <div className="text-xs text-gray-400 mt-1">
                                  Referred By: <span className="text-green-200 font-medium">{player.referredBy || "Unknown"}</span>
                                  {player.referralCode && (
                                    <>
                                      <span className="text-gray-500 mx-1">•</span>
                                      Referral Code: <span className="text-cyan-200 font-medium">{player.referralCode}</span>
                                    </>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  Registered: {new Date(player.registrationDate).toLocaleDateString()} • Last Active: {player.lastActive}
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <span className={`px-2 py-1 rounded text-xs text-center font-semibold ${
                                  player.accountStatus === "Active"
                                    ? "bg-green-500/30 text-green-200"
                                    : player.accountStatus === "Suspended"
                                    ? "bg-red-500/30 text-red-200"
                                    : "bg-gray-500/30 text-gray-200"
                                }`}>
                                  {player.accountStatus}
                                </span>
                                <button
                                  onClick={() => setSelectedPlayerDetails(player)}
                                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-semibold"
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-300 border border-dashed border-white/20 rounded-lg">
                        <div className="text-lg font-semibold mb-2">No referred players found</div>
                        <div className="text-sm">Adjust the referral filters to see matching players</div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "Global Settings" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-gray-600/30 via-slate-500/20 to-zinc-700/30 rounded-xl shadow-md border border-gray-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Global Settings</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">General</h3>
                    <div className="space-y-3">
                      <input type="text" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Club Name" />
                      <CustomSelect className="w-full">
                        <option>INR (₹)</option>
                        <option>USD ($)</option>
                        <option>EUR (€)</option>
                      </CustomSelect>
                      <CustomSelect className="w-full">
                        <option>Asia/Kolkata</option>
                        <option>America/New_York</option>
                        <option>Europe/London</option>
                      </CustomSelect>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Security</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white">Two-Factor Authentication</span>
                        <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm">Enable</button>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-white">Session Timeout</span>
                        <CustomSelect className="min-w-[160px]">
                          <option>30 minutes</option>
                          <option>1 hour</option>
                          <option>2 hours</option>
                        </CustomSelect>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white">Password Rotation (days)</span>
                        <input type="number" className="w-24 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm" placeholder="90" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "Logs & Audits" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-purple-700/30 rounded-xl shadow-md border border-blue-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Audit Logs & Backups</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Audit Log</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {[
                        'User admin edited player P001',
                        'Cashout override approved by super admin',
                        'Backup completed successfully',
                        'Login failed for user jsmith'
                      ].map((line, i) => (
                        <div key={i} className="bg-white/5 p-3 rounded border border-white/10 text-white/90 text-sm">{line}</div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Backup & Error Logs</h3>
                    <div className="space-y-3">
                      <div className="bg-white/5 p-3 rounded border border-white/10 text-white/90 text-sm">backup-2025-10-23-0200.tar.gz</div>
                      <div className="bg-white/5 p-3 rounded border border-white/10 text-white/90 text-sm">errors-2025-10-23.log</div>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">Download Backup</button>
                        <button className="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">Download Errors</button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "System Control" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-gray-700/30 via-zinc-600/20 to-slate-700/30 rounded-xl shadow-md border border-gray-700/40">
                <h2 className="text-xl font-bold text-white mb-6">System Control</h2>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="space-y-3">
                    <p className="text-white/80">Factory Reset clears local data and resets the UI. Use with caution.</p>
                    <button onClick={factoryReset} className="w-full bg-red-700 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-semibold">Factory Reset</button>
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


